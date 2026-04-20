const axios = require('axios');

async function testGroq() {
    console.log('🧪 Testing Groq API...\n');
    
    try {
        // Test connection
        console.log('1️⃣ Testing connection...');
        const testResponse = await axios.get('http://localhost:5000/api/groq/test');
        
        if (testResponse.data.success) {
            console.log('✅ Connection successful!');
            console.log('📊 Model:', testResponse.data.data.model);
            console.log('💬 Response preview:', testResponse.data.data.response.substring(0, 100) + '...\n');
        } else {
            console.log('❌ Connection failed:', testResponse.data.message);
            return;
        }

        // Test chat
        console.log('2️⃣ Testing chat with EBookFarm question...');
        const chatResponse = await axios.post('http://localhost:5000/api/groq/chat', {
            message: 'EBookFarm là gì?',
            conversationHistory: []
        });

        if (chatResponse.data.success) {
            console.log('✅ Chat successful!');
            console.log('🤖 AI Response:\n');
            console.log(chatResponse.data.data.response);
            console.log('\n📊 Usage:', JSON.stringify(chatResponse.data.data.usage));
            
            // Check if AI understands EBookFarm correctly
            const response = chatResponse.data.data.response.toLowerCase();
            const checks = [
                { keyword: 'nông trại', found: response.includes('nông trại') },
                { keyword: 'truy xuất', found: response.includes('truy xuất') },
                { keyword: 'nhật ký', found: response.includes('nhật ký') },
                { keyword: 'không phải thư viện', found: response.includes('không phải') || response.includes('không phải thư viện') }
            ];

            console.log('\n🔍 Quality Check:');
            checks.forEach(check => {
                console.log(`  ${check.found ? '✅' : '❌'} ${check.keyword}: ${check.found ? 'Found' : 'Not found'}`);
            });

            const score = checks.filter(c => c.found).length;
            console.log(`\n📊 Score: ${score}/4 (${(score/4*100).toFixed(0)}%)`);
            
            if (score >= 3) {
                console.log('🎉 EXCELLENT! AI understands EBookFarm correctly!');
            } else if (score >= 2) {
                console.log('👍 GOOD! AI has basic understanding.');
            } else {
                console.log('⚠️ NEEDS IMPROVEMENT! Check system prompt.');
            }

        } else {
            console.log('❌ Chat failed:', chatResponse.data.message);
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('📄 Response:', error.response.data);
        }
        
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure backend server is running: npm run dev');
        console.log('2. Check GROQ_API_KEY in backend/.env');
        console.log('3. Get free API key: https://console.groq.com/');
    }
}

testGroq();