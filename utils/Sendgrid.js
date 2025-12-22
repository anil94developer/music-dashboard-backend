const nodemailer = require('nodemailer');
const R = require('./responseHelper');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'coachingtestnotes1@gmail.com', // Your Gmail address
    pass: 'uhpd nshn znmn nvqz'   // Your Gmail password or App Password
  }
});

const sendOtpEmail = async(recipientEmail, otp) => {
  const mailOptions = {
    from: 'coachingtestnotes1@gmail.com', // Sender address
    to: "ansarimujjkir786@gmail.com",           // List of recipients
    subject: 'Your OTP Code',     // Subject line
    text: `Your OTP code is: ${otp}`, // Plain text body
    html: `<p>Dear User,</p>
  <p>We received a request to reset the password for your account. Please enter below OTP to Change password for your account.:</p>
  <strong>${otp}</strong>
  <p>If you did not request a password reset, please ignore this email.</p>
  <p>Thank you,</p>
  <p>Team Coaching Test & Notes</p>` // HTML body
  };
  try {
    const nodemailor = await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    return false
  }
};

// Generate a random OTP (for demonstration purposes)
module.exports = sendOtpEmail
