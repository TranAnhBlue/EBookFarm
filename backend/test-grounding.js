// Quick test script for Gemini AI responses
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của EBookFarm. Sử dụng kiến thức tổng hợp để trả lời chi tiết, KHÔNG chỉ nói "liên hệ hotline".`;

async function testAI() {
    console.log('🧪 Testing Gemini AI responses...\n');

    try {
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-flash-latest',  // Thử model latest
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 2048,
            },
        });

        const testQuestions = [
            "So sánh EBookFarm với các phần mềm quản lý nông trại khác?",
            "TCVN 12827:2023 quy định gì về truy xuất nguồn gốc?",
            "EBookFarm có những tính năng gì?"
        ];

        for (let i = 0; i < testQuestions.length; i++) {
            const question = testQuestions[i];
            console.log(`\n📝 Test ${i + 1}: ${question}`);
            console.log('⏳ Đang xử lý...\n');

            const chat = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: 'Bạn là ai?' }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: SYSTEM_PROMPT }]
                    }
                ],
            });

            const result = await chat.sendMessage(question);
            const response = result.response;
            const text = response.text();

            console.log('✅ Kết quả:');
            console.log(text);
            console.log('\n' + '='.repeat(80));
        }

        console.log('\n✅ Test hoàn thành!');
        console.log('\n💡 Đánh giá:');
        console.log('✅ Nếu AI trả lời chi tiết với thông tin cụ thể → Tốt');
        console.log('⚠️  Nếu AI chỉ nói "liên hệ hotline" → Cần cải thiện prompt');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

testAI();
