const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const FormSchema = require('./src/models/FormSchema');
const jwt = require('jsonwebtoken');

dotenv.config();

const testJournalAI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tạo admin token
        const adminUser = await User.findOne({ role: 'Admin' });
        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Lấy schema để test
        const schema = await FormSchema.findOne();
        console.log('📋 Testing with schema:', schema?.name);

        // Test 1: Quick Suggestions
        console.log('\n🚀 Testing Quick Suggestions...');
        const quickResponse = await fetch('http://localhost:5000/api/journal-ai/quick-suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fieldType: 'text',
                fieldName: 'thức ăn',
                schemaCategory: 'thuysan'
            })
        });

        const quickData = await quickResponse.json();
        console.log('📊 Quick Suggestions Result:', quickData.success ? 'SUCCESS' : 'FAILED');
        if (quickData.success) {
            console.log('💡 Suggestions:', quickData.data.suggestions);
        }

        // Test 2: AI Suggestions
        console.log('\n🧠 Testing AI Suggestions...');
        const aiResponse = await fetch('http://localhost:5000/api/journal-ai/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                schemaId: schema._id,
                currentData: {
                    'Diện tích': '500 m2',
                    'Lô sản xuất': 'Lô 01',
                    'Cho ăn': 'Thức ăn viên 2kg'
                },
                fieldName: 'Cho ăn',
                fieldValue: 'Thức ăn viên 2kg'
            })
        });

        const aiData = await aiResponse.json();
        console.log('🤖 AI Suggestions Result:', aiData.success ? 'SUCCESS' : 'FAILED');
        if (aiData.success) {
            console.log('💭 AI Response:', aiData.data.suggestions?.[0] || 'No suggestions');
        } else {
            console.log('❌ Error:', aiData.message);
        }

        // Test 3: Risk Analysis
        console.log('\n⚠️ Testing Risk Analysis...');
        const riskResponse = await fetch('http://localhost:5000/api/journal-ai/analyze-risks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                schemaId: schema._id,
                journalData: {
                    'Diện tích': '500 m2',
                    'Nhiệt độ nước': '35°C',
                    'Cho ăn': 'Thức ăn viên 5kg/ngày',
                    'Tình trạng': 'Một số con cá nổi lên mặt nước'
                }
            })
        });

        const riskData = await riskResponse.json();
        console.log('🔍 Risk Analysis Result:', riskData.success ? 'SUCCESS' : 'FAILED');
        if (riskData.success) {
            console.log('📈 Risk Level:', riskData.data.riskLevel);
            console.log('⚠️ Risks Found:', riskData.data.risks?.length || 0);
        }

        console.log('\n🎉 Journal AI Test Completed!');
        console.log('📝 Next steps:');
        console.log('1. Visit a journal entry page');
        console.log('2. Click on input fields to see AI suggestions');
        console.log('3. Check the AI Assistant sidebar');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testJournalAI();