// backend/controllers/paymentController.js

const axios = require('axios');
const path = require('path');
// Shothik path: scripts
const { sendConfirmationEmail } = require('../scripts/emailService'); 
const { 
    SSL_COMMERZ_STORE_ID, 
    SSL_COMMERZ_STORE_PASS, 
    CLIENT_URL 
} = process.env; 


/**
 * 🎯 Route 1: /api/payments/initiate (POST)
 */
const initiatePayment = async (req, res) => {
    
    // 1. Get required data from the request body (Frontend)
    const { bookingId, amount, customerInfo } = req.body;
    
    if (!bookingId || !amount || !customerInfo) {
        return res.status(400).json({ message: 'Missing required payment details.' });
    }

    // 2. Prepare the data payload for the Payment Gateway (SSL Commerz Mockup)
    const transactionId = `BOOK-${Date.now()}-${bookingId}`;
    
    const paymentPayload = {
        store_id: SSL_COMMERZ_STORE_ID,
        store_passwd: SSL_COMMERZ_STORE_PASS,
        total_amount: amount,
        currency: 'BDT', 
        tran_id: transactionId,
        
        success_url: `${CLIENT_URL}/payment/success?transactionId=${transactionId}`, 
        fail_url: `${CLIENT_URL}/payment/fail`,
        cancel_url: `${CLIENT_URL}/payment/cancel`,
        ipn_url: 'http://localhost:5000/api/payments/callback', 
        
        cus_name: customerInfo.name,
        cus_email: customerInfo.email,
        cus_phone: customerInfo.phone,
    };

    try {
        console.log(`--- Initiating payment for Tran ID: ${transactionId} ---`);
        
        // 🛑 Mockup Response - Gateway Redirection URL pathano
        return res.status(200).json({
            message: "Payment initiation successful (Mockup). Redirect to gateway.",
            redirectUrl: 'https://gateway.example.com/pay/' + transactionId, 
            transactionId: transactionId
        });


    } catch (error) {
        console.error('🔴 Payment Initiation Error:', error.message);
        return res.status(500).json({ message: 'Server error during payment initiation.' });
    }
};


/**
 * 🎯 Route 2: /api/payments/callback (POST)
 */
const handleCallback = async (req, res) => {
    
    const callbackData = req.body;
    console.log('--- Payment Gateway Callback Received ---');
    
    if (callbackData.status === 'VALID' || callbackData.status === 'SUCCESS') {
        
        const { tran_id, amount } = callbackData;
        
        // 1. Database Update: Booking status ke 'CONFIRMED' kora
        // 🛑 Real Code: Eikhane database update korte hobe
        
        // 2. Mockup Booking Data
        const booking = { 
            email: 'user@example.com', 
            bookingRef: tran_id,
            packageName: 'Cox\'s Bazar Deluxe Tour',
            amount: amount || 1000, 
        }; 
        
        // 3. Mockup for E-Ticket/Voucher data
        const eTicketContent = 'This is the e-ticket content for the user.'; 

        // 4. Send Confirmation Email
        const emailSent = await sendConfirmationEmail(booking, booking.email, eTicketContent);

        if (emailSent) {
            console.log(`🟢 SUCCESS: Transaction ${tran_id} confirmed. Email sent.`);
        } else {
            console.error(`🟡 WARNING: Transaction ${tran_id} confirmed, but email failed to send.`);
        }
        
        return res.status(200).send('OK'); 

    } else {
        console.log(`🟡 FAILED: Transaction ${callbackData.tran_id} failed with status: ${callbackData.status}`);
        return res.status(200).send('OK'); 
    }
    
};


/**
 * 🎯 Route 3: /api/payments/status/:transactionId (GET)
 * Eita Frontend-er PaymentSuccess page-er jonno.
 */
const getBookingStatus = async (req, res) => {
    const { transactionId } = req.params;

    if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required.' });
    }

    try {
        let booking = null;
        
        // 🛑 Database Mockup Check: Real project-e MongoDB/SQL theke fetch korte hobe
        if (transactionId.includes('FAIL')) {
             booking = {
                status: 'FAILED',
                bookingRef: transactionId,
                packageName: 'N/A',
                amount: 0,
            };
        } else {
            // Eita hocche SUCCESS scenario-er mockup data
            booking = {
                status: 'CONFIRMED',
                bookingRef: transactionId,
                packageName: 'Cox\'s Bazar Deluxe Tour',
                amount: 1500, 
            };
        }
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Booking data Frontend-ke phiriye dewa
        return res.status(200).json(booking);

    } catch (error) {
        console.error('🔴 Error fetching booking status:', error.message);
        return res.status(500).json({ message: 'Server error while checking status.' });
    }
};


// 🛑 Final Export: Shob function-ke export kora holo
module.exports = {
    initiatePayment,
    handleCallback,
    getBookingStatus,
};