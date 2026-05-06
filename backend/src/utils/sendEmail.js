const nodemailer = require('nodemailer');

// Create transporter once to reuse connections
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Optimize for performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

const sendEmail = async (options) => {
  const message = {
    from: `"${process.env.FROM_NAME || 'EBookFarm'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = sendEmail;
