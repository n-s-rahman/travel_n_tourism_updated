// backend/services/emailService.js

const nodemailer = require('nodemailer');
const { USER_EMAIL, USER_PASS } = process.env; // Apnar email credentials .env theke nite hobe

// 💡 1. Transport toiri kora (Jodi Gmail byabohar koren)
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: USER_EMAIL, 
        pass: USER_PASS, 
    },
});

// 💡 2. Email pathanor mukhya function
const sendConfirmationEmail = async (bookingDetails, userEmail, eTicketAttachment) => {
    
    // ... (rest of the mailOptions and try-catch logic from previous response)
    const mailOptions = {
        from: `Your Booking System <${USER_EMAIL}>`,
        to: userEmail,
        subject: `Booking Confirmed: ${bookingDetails.bookingRef}`,
        html: `
            <h1>Thank you for your booking!</h1>
            <p>Your booking for package <strong>${bookingDetails.packageName}</strong> is confirmed.</p>
            <p><strong>Booking Reference:</strong> ${bookingDetails.bookingRef}</p>
            <p><strong>Total Amount Paid:</strong> BDT ${bookingDetails.amount} </p>
            <p>Please find your e-ticket/voucher attached.</p>
            <p>We look forward to seeing you!</p>
        `,
        attachments: [
            {
                filename: `E-Ticket-${bookingDetails.bookingRef}.pdf`,
                content: eTicketAttachment, 
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`🟢 Email sent: ${info.response}`);
        return true;
    } catch (error) {
        console.error('🔴 Error sending confirmation email:', error.message);
        return false;
    }
};

module.exports = {
    sendConfirmationEmail,
};