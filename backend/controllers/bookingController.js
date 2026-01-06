const Booking = require("../models/Booking");
const Package = require("../models/Package");
const { logActivity } = require("../utils/activityLogger");
const nodemailer = require("nodemailer"); // 🟢 Needed for Ethereal URL helper

// 🟢 NEW IMPORTS: Email Utilities
const { sendEmail } = require("../config/emailConfig");
const { 
  getBookingConfirmationTemplate, 
  getPaymentSuccessTemplate, 
  getCancellationTemplate 
} = require("../utils/emailTemplates");
const { createNotification } = require("../controllers/notificationController"); 
const User = require("../models/User"); 

// ====================================================================
// 🟢 NEW FUNCTION: handlePayment
// ====================================================================
const handlePayment = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id; 
        
        const booking = await Booking.findById(bookingId).populate('package');

        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }
        
        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied. Not the owner of this booking." });
        }
        
        if (booking.status === 'Confirmed') {
            return res.status(400).json({ message: "Booking is already Confirmed." });
        }

        booking.status = 'Confirmed';
        booking.paymentDate = new Date(); 
        await booking.save();
        
        const user = req.user; 
        const emailContent = getPaymentSuccessTemplate(booking, booking.package, user);
        const emailInfo = await sendEmail(user.email, `Payment Received - Booking #${booking._id}`, emailContent);

        // Capture Ethereal Link
        const emailUrl = emailInfo ? nodemailer.getTestMessageUrl(emailInfo) : null;

        await createNotification(
            userId, 
            `Payment Successful`, 
            `We have received your payment for Booking #${booking._id}. Your trip is confirmed!`, 
            'PAYMENT_SUCCESS',
            emailUrl
        );

        const WalletTransaction = require("../models/WalletTransaction");
        await WalletTransaction.create({
            user: userId,
            amount: booking.totalPrice,
            type: 'payment',
            description: `Payment for booking #${booking._id}`,
            bookingId: booking._id,
            date: new Date()
        });

        res.status(200).json({ 
            message: "Payment process successful!", 
            booking: booking,
        });

    } catch (error) {
        console.error("Handle Payment error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

// ====================================================================
// @desc    Get all bookings for the authenticated user
// ====================================================================
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id; 
        const bookings = await Booking.find({ user: userId }).populate('package', 'name price');

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found." });
        }

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ====================================================================
// @desc    Create a new booking
// ====================================================================
const createBooking = async (req, res) => {
    try {
        const { packageId, numberOfPeople, tripDate, travelers, roomType, insurance } = req.body;
        
        if (!travelers || travelers.length !== Number(numberOfPeople)) {
            return res.status(400).json({ message: "Traveler details mismatch." });
        }
        
        const userId = req.user.id; 
        const packageDetails = await Package.findById(packageId);

        if (!packageDetails || packageDetails.available === false) {
            return res.status(404).json({ message: "Package unavailable." });
        }
        
        const selectedDate = new Date(tripDate);
        selectedDate.setHours(0, 0, 0, 0);

        const bookedCapacityResult = await Booking.aggregate([
            {
                $match: {
                    package: packageDetails._id,
                    status: { $in: ["Confirmed", "Pending"] },
                    tripDate: selectedDate,
                },
            },
            { $group: { _id: null, totalBookedPeople: { $sum: "$numberOfPeople" } } },
        ]);
        
        const totalBookedPeople = bookedCapacityResult.length > 0 ? bookedCapacityResult[0].totalBookedPeople : 0;
        const remainingCapacity = packageDetails.maxPeople - totalBookedPeople; 

        if (remainingCapacity < Number(numberOfPeople)) {
            return res.status(409).json({ message: `Only ${remainingCapacity} spots left.` });
        }
        
        const basePrice = packageDetails.price;
        const insuranceCost = insurance ? (basePrice * 0.1) : 0; 
        const roomSurcharge = roomType === 'Suite' ? 500 : 0; 
        const totalPrice = ((basePrice + roomSurcharge) * Number(numberOfPeople)) + insuranceCost;

        const booking = await Booking.create({
            package: packageId,
            user: userId,
            numberOfPeople: Number(numberOfPeople),
            tripDate: selectedDate,
            travelers, 
            roomType: roomType || 'N/A', 
            insurance: insurance || false,
            totalPrice: totalPrice,
            status: "Pending", 
            createdAt: new Date(), 
        });

        const user = req.user;
        const emailContent = getBookingConfirmationTemplate(booking, packageDetails, user);
        const emailInfo = await sendEmail(user.email, `Booking Confirmation - ${packageDetails.name}`, emailContent);
        
        const emailUrl = emailInfo ? nodemailer.getTestMessageUrl(emailInfo) : null;
        
        await createNotification(
            userId, 
            `Booking Initiated`, 
            `Your booking for ${packageDetails.name} has been received. Please complete the payment to confirm.`, 
            'BOOKING_CONFIRMED',
            emailUrl
        );

        res.status(201).json({ message: "Booking initiated!", booking });

    } catch (error) {
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

// ====================================================================
// @desc    Cancel a booking
// ====================================================================
const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id; 
        const booking = await Booking.findById(bookingId).populate('package', 'name price');

        if (!booking) return res.status(404).json({ message: "Booking not found." });
        if (booking.status === 'Cancelled' || booking.status === 'Completed') {
            return res.status(400).json({ message: `Booking is ${booking.status}.` });
        }
        
        const diffInDays = (new Date(booking.tripDate) - new Date()) / (1000 * 60 * 60 * 24);
        let refundPercentage = diffInDays >= 30 ? 0.90 : (diffInDays >= 7 ? 0.50 : 0);
        const refundAmount = Number(booking.totalPrice) * refundPercentage;
        
        booking.status = 'Cancelled';
        booking.refundAmount = refundAmount; 
        booking.cancellationDate = new Date(); 
        await booking.save(); 
        
        if (refundAmount > 0) {
            const userToRefund = await User.findById(userId);
            if (userToRefund) {
                userToRefund.walletBalance = (userToRefund.walletBalance || 0) + Number(refundAmount);
                await User.findByIdAndUpdate(userId, { $set: { walletBalance: userToRefund.walletBalance } });
                const WalletTransaction = require("../models/WalletTransaction");
                await WalletTransaction.create({
                    user: userId, amount: refundAmount, type: 'refund',
                    description: `Refund for booking #${booking._id}`,
                    bookingId: booking._id, date: new Date()
                });
            }
        }
        
        const emailContent = getCancellationTemplate(booking, refundAmount);
        const emailInfo = await sendEmail(req.user.email, `Booking Cancelled - #${booking._id}`, emailContent);
        
        const emailUrl = emailInfo ? nodemailer.getTestMessageUrl(emailInfo) : null;
        
        await createNotification(
            userId, 
            `Booking Cancelled`, 
            `Your booking #${booking._id} has been cancelled. Refund of $${refundAmount.toFixed(2)} initiated.`, 
            'CANCELLATION',
            emailUrl
        );

        res.status(200).json({ message: "Cancelled!", refundAmount });
    } catch (error) {
        res.status(500).json({ message: "Error", details: error.message });
    }
};

// ====================================================================
// 🏢 ADMIN FUNCTIONS
// ====================================================================

const getAllBookings = async (req, res) => {
    try {
        const { search, status, packageId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (packageId) query.package = packageId;

        let bookings = await Booking.find(query)
            .populate('package', 'name destination')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            bookings = bookings.filter(b => 
                b._id.toString().includes(searchLower) ||
                (b.user && b.user.name.toLowerCase().includes(searchLower)) ||
                (b.package && b.package.name.toLowerCase().includes(searchLower))
            );
        }

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('package').populate('user');
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const oldStatus = booking.status;
        const newStatus = req.body.status;

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('package').populate('user');

        if (newStatus && oldStatus !== newStatus) {
            await logActivity(req.user.id, 'Booking Status Updated', 'Booking', updatedBooking._id, {
                oldStatus,
                newStatus,
                packageName: updatedBooking.package?.name,
                customerName: updatedBooking.user?.name
            });
        }

        res.json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Error updating booking" });
    }
};

const getSalesReport = async (req, res) => {
    try {
        console.log("--- Generating Sales Report ---");
        const { startDate, endDate } = req.query;
        console.log("Filters:", { startDate, endDate });

        // 1. Include "Pending" status
        let match = { status: { $in: ["Confirmed", "Completed", "Pending"] } };
        
        // 2. Filter by "tripDate" instead of "createdAt"
        if (startDate || endDate) {
            match.tripDate = {};
            
            if (startDate) {
                const start = new Date(startDate);
                if (!isNaN(start.getTime())) {
                    match.tripDate.$gte = start;
                }
            }
            
            if (endDate) {
                const end = new Date(endDate);
                if (!isNaN(end.getTime())) {
                    end.setHours(23, 59, 59, 999);
                    match.tripDate.$lte = end;
                }
            }
        }
        
        console.log("Match Query:", match);

        // 3. Group by "tripDate"
        const report = await Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$tripDate" } },
                    totalSales: { $sum: "$totalPrice" },
                    bookingCount: { $sum: 1 },
                    travelerCount: { $sum: "$numberOfPeople" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log("Day Wise Data Count:", report.length);

        // 4. Package Performance - Left Join (Start from Package to include 0-sales items)
        const packageMatch = { ...match };
        packageMatch.$expr = { $eq: ["$package", "$$pkgId"] };

        const packagePerformance = await Package.aggregate([
            {
                $lookup: {
                    from: "bookings",
                    let: { pkgId: "$_id" },
                    pipeline: [
                        { $match: packageMatch }
                    ],
                    as: "related_bookings"
                }
            },
            {
                $project: {
                    name: 1, // Project package name
                    revenue: { $sum: "$related_bookings.totalPrice" },
                    bookings: { $size: "$related_bookings" }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        console.log("Package Performance Count:", packagePerformance.length);

        res.json({ dayWise: report, packageWise: packagePerformance });
    } catch (error) {
        console.error("Error generating sales report:", error);
        res.status(500).json({ message: "Error generating report" });
    }
};

module.exports = {
    createBooking,
    cancelBooking,
    getMyBookings, 
    handlePayment,
    getAllBookings,
    updateBooking,
    getSalesReport
};