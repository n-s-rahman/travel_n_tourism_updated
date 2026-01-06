// backend/utils/emailTemplates.js

const getBookingConfirmationTemplate = (booking, packageDetails, user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1a202c;">
      <h2 style="color: #6366f1; margin-top: 0;">✈️ Booking Received!</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your journey to <strong>${packageDetails.name}</strong> has been initiated. We've reserved your spot!</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
        <p style="margin: 4px 0;"><strong>Booking ID:</strong> <span style="font-family: monospace; color: #4a5568;">#${booking._id}</span></p>
        <p style="margin: 4px 0;"><strong>Trip Date:</strong> ${new Date(booking.tripDate).toLocaleDateString()}</p>
        <p style="margin: 4px 0;"><strong>Travelers:</strong> ${booking.numberOfPeople}</p>
        <p style="margin: 4px 0;"><strong>Estimated Total:</strong> $${booking.totalPrice}</p>
      </div>

      <p>To confirm your trip, please complete the payment in your dashboard:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/mybookings" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View My Bookings</a>
      </div>

      <p style="font-size: 14px; color: #718096; margin-top: 30px;">Safe travels,<br>The Antigravity Team</p>
    </div>
  `;
};

const getPaymentSuccessTemplate = (booking, packageDetails, user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1a202c;">
      <h2 style="color: #10b981; margin-top: 0;">✅ Payment Confirmed!</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We've successfully received your payment of <strong>$${booking.totalPrice}</strong>. Pack your bags!</p>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #10b981; text-align: center;">
        <h3 style="margin-top:0; color: #065f46;">E-TICKET / VOUCHER</h3>
        <p style="font-size: 18px; font-weight: bold;">${packageDetails.name}</p>
        <p style="margin: 8px 0;"><strong>Booking ID:</strong> #${booking._id}</p>
        <p style="margin: 8px 0; color: #059669; font-weight: bold;">STATUS: CONFIRMED ✅</p>
      </div>

      <p>You can view your detailed itinerary and receipt here:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      </div>

      <p style="font-size: 14px; color: #718096; margin-top: 30px;">We're excited to have you with us!<br>The Antigravity Team</p>
    </div>
  `;
};

const getCancellationTemplate = (booking, refundAmount) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1a202c;">
        <h2 style="color: #ef4444; margin-top: 0;">❌ Booking Cancelled</h2>
        <p>Your booking <strong>#${booking._id}</strong> has been cancelled.</p>
        
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 4px 0;"><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #991b1b;">Refunds typically take 5-7 business days to process.</p>
        </div>
  
        <p>You can check your wallet balance in your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173/wallet" style="background-color: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View My Wallet</a>
        </div>

        <p style="font-size: 14px; color: #718096; margin-top: 30px;">We hope to see you again soon.<br>The Antigravity Team</p>
      </div>
    `;
  };

module.exports = {
  getBookingConfirmationTemplate,
  getPaymentSuccessTemplate,
  getCancellationTemplate
};
