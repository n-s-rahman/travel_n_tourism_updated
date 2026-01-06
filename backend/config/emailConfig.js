// backend/config/emailConfig.js
const nodemailer = require("nodemailer");

// Create a reusable transporter using the default SMTP transport
// For development, we use Ethereal Email (fake SMTP service)
// In production, user would replace this with Gmail/SendGrid/AWS SES
const createTransporter = async () => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return { transporter, testAccount };
};

// Send Email Function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const { transporter } = await createTransporter();

    let info = await transporter.sendMail({
      from: '"Travel & Tourism" <no-reply@travelapp.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: htmlContent, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = { sendEmail };
