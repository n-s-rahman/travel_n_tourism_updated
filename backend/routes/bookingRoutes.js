// bookingroutes.js

const express = require("express");
const router = express.Router();
const { 
    createBooking, 
    cancelBooking, 
    getMyBookings, 
    handlePayment,
    getAllBookings, // 🏢 Admin
    updateBooking,  // 🏢 Admin
    getSalesReport  // 🏢 Admin
} = require("../controllers/bookingController"); 
const { protect, agent } = require("../middleware/authMiddleware"); 

// ====================================================================
// ADMIN ROUTES (Must come before parameterized routes if specific)
// ====================================================================

// @route GET /api/bookings/reports
// @desc Generate sales and revenue reports
// @access Private/Admin
router.get("/reports", protect, agent, getSalesReport);

// @route GET /api/bookings
// @desc Get all bookings for admin management
// @access Private/Admin
router.get("/", protect, agent, getAllBookings);

// @route PUT /api/bookings/:id
// @desc Update booking details or status
// @access Private/Admin
router.put("/:id", protect, agent, updateBooking);


// ====================================================================
// USER ROUTES
// ====================================================================

// @route POST /api/bookings
// @desc Create a new package booking
router.post("/", protect, createBooking); 

// @route GET /api/bookings/my
// @desc Get all bookings for the authenticated user
router.get('/my', protect, getMyBookings);

// @route POST /api/bookings/:id/pay
// @desc Initialize payment process
router.post('/:id/pay', protect, handlePayment);

// @route PATCH /api/bookings/:id/cancel
// @desc Cancel a booking
router.patch('/:id/cancel', protect, cancelBooking); 
     
module.exports = router;