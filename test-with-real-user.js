const axios = require('axios');

const API_URL = 'https://ebookfarm.onrender.com/api';

// Bạn cần điền credentials của user đã đăng ký thành công
const TEST_USER = {
  email: 'farmer2024@test.com',
  password: 'Farmer123456'
};

let authToken = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRealUserFlow() {
  console.log('\n' + '='.repeat(70));
  log('🧪 Testing EBookFarm Mobile App with Real User', 'yellow');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Login
    log('1️⃣  Testing Login...', 'blue');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: TEST_USER.email,  // Backend expects 'identifier' field
      password: TEST_USER.password
    });
    
    console.log('Login response:', JSON.stringify(loginRes.data, null, 2));
    
    if (loginRes.data.success && loginRes.data.data.token) {
      authToken = loginRes.data.data.token;  // Token is inside data object
      log('✅ Login successful!', 'green');
      log(`   User: ${loginRes.data.data.fullname || loginRes.data.data.username}`, 'gray');
      log(`   Role: ${loginRes.data.data.role}`, 'gray');
    } else {
      throw new Error('Login failed: No token received');
    }

    // 2. Get Profile
    log('\n2️⃣  Testing Get Profile...', 'blue');
    const profileRes = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('✅ Profile retrieved!', 'green');
    log(`   Name: ${profileRes.data.data.fullname || 'N/A'}`, 'gray');
    log(`   Email: ${profileRes.data.data.email || 'N/A'}`, 'gray');

    // 3. Get Dashboard Stats
    log('\n3️⃣  Testing Dashboard Stats...', 'blue');
    const statsRes = await axios.get(`${API_URL}/reports/dashboard-stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('✅ Dashboard stats retrieved!', 'green');
    log(`   Total Journals: ${statsRes.data.data.totalJournals || 0}`, 'gray');
    log(`   Pending: ${statsRes.data.data.pendingJournals || 0}`, 'gray');
    log(`   Verified: ${statsRes.data.data.verifiedJournals || 0}`, 'gray');

    // 4. Get Schemas
    log('\n4️⃣  Testing Get Schemas...', 'blue');
    const schemasRes = await axios.get(`${API_URL}/schemas`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log(`✅ Found ${schemasRes.data.data.length} schemas!`, 'green');
    schemasRes.data.data.slice(0, 3).forEach(s => {
      log(`   - ${s.name} (${s.category})`, 'gray');
    });

    // 5. Get Journals
    log('\n5️⃣  Testing Get Journals...', 'blue');
    const journalsRes = await axios.get(`${API_URL}/journals`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log(`✅ Found ${journalsRes.data.data.length} journals!`, 'green');
    if (journalsRes.data.data.length > 0) {
      journalsRes.data.data.slice(0, 3).forEach(j => {
        log(`   - ${j.schemaId?.name || 'Unknown'} (${j.status})`, 'gray');
      });
    }

    // 6. Get Inventory
    log('\n6️⃣  Testing Get Inventory...', 'blue');
    const inventoryRes = await axios.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log(`✅ Found ${inventoryRes.data.data.length} inventory items!`, 'green');
    if (inventoryRes.data.data.length > 0) {
      inventoryRes.data.data.slice(0, 3).forEach(item => {
        log(`   - ${item.name}: ${item.quantity} ${item.unit}`, 'gray');
      });
    }

    // 7. Get Supply Requests
    log('\n7️⃣  Testing Get Supply Requests...', 'blue');
    const supplyRes = await axios.get(`${API_URL}/supply-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log(`✅ Found ${supplyRes.data.data.length} supply requests!`, 'green');

    // 8. Get Notifications
    log('\n8️⃣  Testing Get Notifications...', 'blue');
    const notifsRes = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log(`✅ Found ${notifsRes.data.data.length} notifications!`, 'green');

    // 9. Get TCVN (public)
    log('\n9️⃣  Testing Get TCVN Standards...', 'blue');
    const tcvnRes = await axios.get(`${API_URL}/tcvn`);
    log(`✅ Found ${tcvnRes.data.data.length} TCVN standards!`, 'green');

    // 10. Get News (public)
    log('\n🔟 Testing Get News...', 'blue');
    const newsRes = await axios.get(`${API_URL}/news`);
    log(`✅ Found ${newsRes.data.data.length} news articles!`, 'green');

    // Summary
    console.log('\n' + '='.repeat(70));
    log('🎉 ALL TESTS PASSED! Mobile app is working perfectly!', 'green');
    console.log('='.repeat(70) + '\n');

    log('📱 Mobile App Status:', 'yellow');
    log('   ✅ Authentication: Working', 'green');
    log('   ✅ Dashboard: Working', 'green');
    log('   ✅ Journals: Working', 'green');
    log('   ✅ Inventory: Working', 'green');
    log('   ✅ Supply Requests: Working', 'green');
    log('   ✅ Notifications: Working', 'green');
    log('   ✅ TCVN Standards: Working', 'green');
    log('   ✅ News: Working', 'green');
    console.log('');

  } catch (error) {
    log('\n❌ TEST FAILED!', 'red');
    log(`Error: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Message: ${error.response.data?.message || 'Unknown error'}`, 'red');
    }
    console.log('\n💡 Troubleshooting:', 'yellow');
    log('   1. Make sure you registered an account in the mobile app', 'gray');
    log('   2. Update TEST_USER credentials in this script', 'gray');
    log('   3. Make sure backend is running: https://ebookfarm.onrender.com', 'gray');
    process.exit(1);
  }
}

// Run test
testRealUserFlow();
