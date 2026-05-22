const https = require('https');

// Test register endpoint
const postData = JSON.stringify({
  username: 'testuser',
  email: 'tranducanh220604@gmail.com',
  password: '22062004',
  fullname: 'Test User',
  role: 'Farmer'
});

const options = {
  hostname: 'ebookfarm.onrender.com',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(postData);
req.end();