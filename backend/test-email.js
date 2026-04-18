require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

const test = async () => {
  try {
    console.log('Starting email test...');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('User:', process.env.EMAIL_USER);
    
    await sendEmail({
      email: process.env.EMAIL_USER, // Send to self
      subject: 'EBookFarm SMTP Test',
      html: '<h1>SMTP is working correctly!</h1>'
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Test FAILED:', error);
  }
};

test();
