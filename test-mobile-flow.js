const axios = require('axios');

// Configuration
const API_URL = 'https://ebookfarm.onrender.com/api';
const TEST_USER = {
  username: 'nongdan@gmail.com',
  password: '22062004'
};

let authToken = '';
let testJournalId = '';
let testSchemaId = '';

// Colors for console output
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

function logTest(name) {
  console.log(`\n${colors.blue}━━━ Testing: ${name} ━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'gray');
}

// Test functions
async function testHealthCheck() {
  logTest('Health Check');
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.status === 200) {
      logSuccess('Backend is running');
      logInfo(`Response: ${response.data}`);
      return true;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  logTest('Login Flow');
  try {
    // Try both email and username fields
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.username,
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess('Login successful');
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      logInfo(`User: ${response.data.data.username} (${response.data.data.role})`);
      return true;
    } else {
      logError('Login failed: No token received');
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    logInfo(`Request body: ${JSON.stringify({ email: TEST_USER.username, password: '***' })}`);
    return false;
  }
}

async function testGetProfile() {
  logTest('Get User Profile');
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      logSuccess('Profile retrieved');
      logInfo(`User: ${response.data.data.fullname || response.data.data.username}`);
      logInfo(`Email: ${response.data.data.email || 'N/A'}`);
      logInfo(`Organization: ${response.data.data.organization || 'N/A'}`);
      return true;
    }
  } catch (error) {
    logError(`Get profile failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetSchemas() {
  logTest('Get Form Schemas');
  try {
    const response = await axios.get(`${API_URL}/schemas`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success && response.data.data.length > 0) {
      testSchemaId = response.data.data[0]._id;
      logSuccess(`Found ${response.data.data.length} schemas`);
      response.data.data.slice(0, 3).forEach(schema => {
        logInfo(`- ${schema.name} (${schema.category})`);
      });
      return true;
    } else {
      logError('No schemas found');
      return false;
    }
  } catch (error) {
    logError(`Get schemas failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetJournals() {
  logTest('Get Journals List');
  try {
    const response = await axios.get(`${API_URL}/journals`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const journals = response.data.data || [];
      logSuccess(`Found ${journals.length} journals`);
      if (journals.length > 0) {
        testJournalId = journals[0]._id;
        journals.slice(0, 3).forEach(j => {
          logInfo(`- ${j.schemaId?.name || 'Unknown'} (${j.status})`);
        });
      }
      return true;
    }
  } catch (error) {
    logError(`Get journals failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCreateJournal() {
  logTest('Create New Journal');
  if (!testSchemaId) {
    logError('No schema ID available for testing');
    return false;
  }
  try {
    const response = await axios.post(`${API_URL}/journals`, {
      schemaId: testSchemaId,
      status: 'Draft',
      data: {}
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      testJournalId = response.data.data._id;
      logSuccess('Journal created successfully');
      logInfo(`Journal ID: ${testJournalId}`);
      return true;
    }
  } catch (error) {
    logError(`Create journal failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetJournalDetail() {
  logTest('Get Journal Detail');
  if (!testJournalId) {
    logError('No journal ID available for testing');
    return false;
  }
  try {
    const response = await axios.get(`${API_URL}/journals/${testJournalId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      logSuccess('Journal detail retrieved');
      logInfo(`Schema: ${response.data.data.schemaId?.name || 'Unknown'}`);
      logInfo(`Status: ${response.data.data.status}`);
      logInfo(`Progress: ${response.data.data.progress || 0}%`);
      return true;
    }
  } catch (error) {
    logError(`Get journal detail failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetInventory() {
  logTest('Get Inventory');
  try {
    const response = await axios.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const items = response.data.data || [];
      logSuccess(`Found ${items.length} inventory items`);
      items.slice(0, 3).forEach(item => {
        logInfo(`- ${item.name}: ${item.quantity} ${item.unit} (${item.category})`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get inventory failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetInventoryTransactions() {
  logTest('Get Inventory Transactions');
  try {
    const response = await axios.get(`${API_URL}/inventory/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const txs = response.data.data || [];
      logSuccess(`Found ${txs.length} transactions`);
      txs.slice(0, 3).forEach(tx => {
        logInfo(`- ${tx.type}: ${tx.quantity} ${tx.itemId?.unit || ''} (${new Date(tx.createdAt).toLocaleDateString()})`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get transactions failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetSupplyRequests() {
  logTest('Get Supply Requests');
  try {
    const response = await axios.get(`${API_URL}/supply-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const requests = response.data.data || [];
      logSuccess(`Found ${requests.length} supply requests`);
      requests.slice(0, 3).forEach(req => {
        logInfo(`- ${req.status}: ${req.items?.length || 0} items (${new Date(req.createdAt).toLocaleDateString()})`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get supply requests failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetTCVN() {
  logTest('Get TCVN Standards');
  try {
    const response = await axios.get(`${API_URL}/tcvn?keyword=`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const tcvns = response.data.data || [];
      logSuccess(`Found ${tcvns.length} TCVN standards`);
      tcvns.slice(0, 3).forEach(tcvn => {
        logInfo(`- ${tcvn.code}: ${tcvn.name}`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get TCVN failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetNotifications() {
  logTest('Get Notifications');
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const notifications = response.data.data || [];
      logSuccess(`Found ${notifications.length} notifications`);
      notifications.slice(0, 3).forEach(notif => {
        logInfo(`- ${notif.title} (${notif.read ? 'Read' : 'Unread'})`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get notifications failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetDashboardStats() {
  logTest('Get Dashboard Stats');
  try {
    const response = await axios.get(`${API_URL}/reports/dashboard-stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const stats = response.data.data;
      logSuccess('Dashboard stats retrieved');
      logInfo(`Total Journals: ${stats.totalJournals || 0}`);
      logInfo(`Pending: ${stats.pendingJournals || 0}`);
      logInfo(`Verified: ${stats.verifiedJournals || 0}`);
      return true;
    }
  } catch (error) {
    logError(`Get dashboard stats failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetNews() {
  logTest('Get News List');
  try {
    const response = await axios.get(`${API_URL}/news`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const news = response.data.data || [];
      logSuccess(`Found ${news.length} news articles`);
      news.slice(0, 3).forEach(article => {
        logInfo(`- ${article.title}`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get news failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetAgriModels() {
  logTest('Get Agriculture Models');
  try {
    const response = await axios.get(`${API_URL}/agri-models`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      const models = response.data.data || [];
      logSuccess(`Found ${models.length} agriculture models`);
      models.slice(0, 3).forEach(model => {
        logInfo(`- ${model.name} (${model.category})`);
      });
      return true;
    }
  } catch (error) {
    logError(`Get agri models failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪 EBookFarm Mobile App - Complete Flow Test', 'yellow');
  log(`📡 API URL: ${API_URL}`, 'gray');
  console.log('='.repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Get Schemas', fn: testGetSchemas },
    { name: 'Get Journals', fn: testGetJournals },
    { name: 'Create Journal', fn: testCreateJournal },
    { name: 'Get Journal Detail', fn: testGetJournalDetail },
    { name: 'Get Inventory', fn: testGetInventory },
    { name: 'Get Inventory Transactions', fn: testGetInventoryTransactions },
    { name: 'Get Supply Requests', fn: testGetSupplyRequests },
    { name: 'Get TCVN Standards', fn: testGetTCVN },
    { name: 'Get Notifications', fn: testGetNotifications },
    { name: 'Get Dashboard Stats', fn: testGetDashboardStats },
    { name: 'Get News', fn: testGetNews },
    { name: 'Get Agriculture Models', fn: testGetAgriModels }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      logError(`Unexpected error in ${test.name}: ${error.message}`);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('📊 Test Summary', 'yellow');
  console.log('='.repeat(60));
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    log('🎉 All tests passed! Mobile app is ready to use.', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
