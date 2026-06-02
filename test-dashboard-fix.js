const https = require('https');

// Test dashboard-stats with different user roles
async function testDashboardStats(identifier, password, expectedRole) {
  return new Promise((resolve, reject) => {
    // Login first
    const loginData = JSON.stringify({ identifier, password });
    
    const loginOptions = {
      hostname: 'ebookfarm.onrender.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };
    
    const loginReq = https.request(loginOptions, (loginRes) => {
      let loginBody = '';
      loginRes.on('data', (chunk) => loginBody += chunk);
      loginRes.on('end', () => {
        try {
          const loginResult = JSON.parse(loginBody);
          if (!loginResult.success) {
            console.log(`❌ Login failed for ${identifier}:`, loginResult.message);
            resolve({ success: false, error: loginResult.message });
            return;
          }
          
          const token = loginResult.data.token;
          const user = loginResult.data.user;
          console.log(`\n✅ Login successful: ${user.username} (${user.role})`);
          
          // Now test dashboard-stats
          const statsOptions = {
            hostname: 'ebookfarm.onrender.com',
            path: '/api/reports/dashboard-stats',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          
          const statsReq = https.request(statsOptions, (statsRes) => {
            let statsBody = '';
            statsRes.on('data', (chunk) => statsBody += chunk);
            statsRes.on('end', () => {
              try {
                const stats = JSON.parse(statsBody);
                console.log('📊 Dashboard Stats:');
                console.log(`   - Total Users: ${stats.data.totalUsers}`);
                console.log(`   - Total Journals: ${stats.data.totalJournals}`);
                console.log(`   - Completed: ${stats.data.completedJournals}`);
                console.log(`   - Pending: ${stats.data.pendingJournals}`);
                console.log(`   - Inventory: ${stats.data.inventoryCount}`);
                
                // Validate
                if (expectedRole === 'Farmer' && stats.data.totalUsers === 0) {
                  console.log('⚠️  WARNING: totalUsers is 0 for Farmer role!');
                  resolve({ success: false, stats: stats.data, issue: 'totalUsers is 0' });
                } else if (expectedRole === 'Farmer' && stats.data.totalUsers > 0) {
                  console.log('✅ FIXED: totalUsers is now', stats.data.totalUsers);
                  resolve({ success: true, stats: stats.data });
                } else {
                  resolve({ success: true, stats: stats.data });
                }
              } catch (e) {
                console.error('Parse error:', e);
                resolve({ success: false, error: e.message });
              }
            });
          });
          
          statsReq.on('error', (e) => {
            console.error('Stats request error:', e);
            resolve({ success: false, error: e.message });
          });
          statsReq.end();
          
        } catch (e) {
          console.error('Parse error:', e);
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    loginReq.on('error', (e) => {
      console.error('Login request error:', e);
      resolve({ success: false, error: e.message });
    });
    loginReq.write(loginData);
    loginReq.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Dashboard Stats API\n');
  console.log('='.repeat(60));
  
  // Test 1: Farmer user
  console.log('\n📝 Test 1: Farmer User');
  console.log('-'.repeat(60));
  const farmerResult = await testDashboardStats('nongdan@gmail.com', '22062004', 'Farmer');
  
  // Test 2: Another farmer (if exists)
  console.log('\n📝 Test 2: Another Farmer User');
  console.log('-'.repeat(60));
  const farmer2Result = await testDashboardStats('farmer2024@test.com', 'Farmer123456', 'Farmer');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Farmer (nongdan@gmail.com)', result: farmerResult },
    { name: 'Farmer (farmer2024@test.com)', result: farmer2Result },
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    if (test.result.success && !test.result.issue) {
      console.log(`✅ ${test.name}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${test.name}: FAILED - ${test.result.issue || test.result.error}`);
      failed++;
    }
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Dashboard stats are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend logic.');
  }
}

runTests().catch(console.error);
