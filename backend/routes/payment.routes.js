// backend/routes/payment.routes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController'); 
// Assuming you have authentication middleware like JWT protection
const { protect } = require('../middleware/authMiddleware'); 

// Route A: Initiate Payment (Protected)
// User sends booking ID and amount to start the process
router.post('/initiate', protect, paymentController.initiatePayment);

// Route B: Callback/Webhook from Gateway (Unprotected)
// Gateway calls this to confirm success/failure.
router.post('/callback', paymentController.handleCallback); 

module.exports = router;