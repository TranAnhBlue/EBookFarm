const axios = require('axios');

async function testChatPermissions() {
    console.log('🧪 Testing Chat Permission System...\n');
    
    const API_URL = 'http://localhost:5000/api/groq/chat';
    
    // Test 1: Khách vãng lai (không token)
    console.log('1️⃣ Testing Guest User (no token)...');
    try {
        for (let i = 1; i <= 7; i++) {
            const response = await axios.post(API_URL, {
                message: `Test message ${i} from guest`,
                conversationHistory: []
            });
            
            if (response.data.success) {
                console.log(`   ✅ Message ${i}: Success (${response.data.data.remainingChats} left)`);
            } else {
                console.log(`   ❌ Message ${i}: ${response.data.message}`);
                break;
            }
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n2️⃣ Testing User with Token...');
    // Test 2: User đã đăng nhập (cần token thật)
    // Bạn có thể thêm token thật ở đây để test
    
    console.log('\n3️⃣ Testing Chat Info API...');
    try {
        const response = await axios.get('http://localhost:5000/api/chat/my-info');
        console.log('   ✅ Chat Info:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n✅ Test completed!');
}

testChatPermissions();