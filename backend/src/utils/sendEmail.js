const nodemailer = require('nodemailer');
const axios = require('axios');

// Create transporter for SMTP fallback
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5
});

const sendEmail = async (options) => {
  // Option 1: Use Resend API (Recommended for Render/Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
      const response = await axios.post('https://api.resend.com/emails', {
        from: `EBookFarm <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Email sent via Resend API:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Resend API Error:', error.response?.data || error.message);
      // Fallback to SMTP if Resend fails
    }
  }

  // Option 2: SMTP Fallback
  const message = {
    from: `"${process.env.FROM_NAME || 'EBookFarm'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('✅ Email sent via SMTP:', info.messageId);
  return info;
};

module.exports = sendEmail;
