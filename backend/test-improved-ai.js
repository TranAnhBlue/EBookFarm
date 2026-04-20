/**
 * Test script for improved AI chatbot
 * Run: node test-improved-ai.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/gemini/chat';

const testCases = [
    {
        name: 'Test 1: Hiểu đúng về EBookFarm',
        message: 'EBookFarm là gì?',
        expectKeywords: ['quản lý nông trại', 'truy xuất nguồn gốc', 'nhật ký điện tử', 'KHÔNG phải thư viện sách']
    },
    {
        name: 'Test 2: Tính năng chi tiết',
        message: 'EBookFarm có tính năng gì?',
        expectKeywords: ['nhật ký', 'QR', 'chuỗi cung ứng', 'báo cáo']
    },
    {
        name: 'Test 3: Kiến thức TCVN',
        message: 'TCVN 12827:2023 là gì?',
        expectKeywords: ['truy xuất nguồn gốc', 'rau quả', 'tiêu chuẩn']
    },
    {
        name: 'Test 4: Tư vấn kỹ thuật',
        message: 'Làm sao để trồng cà chua an toàn?',
        expectKeywords: ['giống', 'phân bón', 'thuốc', 'chăm sóc']
    },
    {
        name: 'Test 5: So sánh tiêu chuẩn',
        message: 'VietGAP khác GlobalGAP như thế nào?',
        expectKeywords: ['VietGAP', 'GlobalGAP', 'so sánh', 'chi phí']
    }
];

async function testChat(testCase) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 ${testCase.name}`);
    console.log(`❓ Câu hỏi: "${testCase.message}"`);
    console.log(`${'='.repeat(80)}`);

    try {
        const response = await axios.post(API_URL, {
            message: testCase.message,
            conversationHistory: []
        });

        if (response.data.success && response.data.data) {
            const aiResponse = response.data.data.response;
            console.log(`\n✅ Phản hồi từ AI:\n`);
            console.log(aiResponse);

            // Check if response contains expected keywords
            console.log(`\n🔍 Kiểm tra từ khóa mong đợi:`);
            let foundCount = 0;
            testCase.expectKeywords.forEach(keyword => {
                const found = aiResponse.toLowerCase().includes(keyword.toLowerCase());
                console.log(`  ${found ? '✅' : '❌'} "${keyword}": ${found ? 'Có' : 'Không có'}`);
                if (found) foundCount++;
            });

            const score = (foundCount / testCase.expectKeywords.length * 100).toFixed(0);
            console.log(`\n📊 Điểm: ${foundCount}/${testCase.expectKeywords.length} (${score}%)`);

            return { success: true, score: parseInt(score) };
        } else {
            console.log(`\n❌ Lỗi: ${response.data.message}`);
            if (response.data.fallbackResponse) {
                console.log(`\n⚠️ Fallback response:\n${response.data.fallbackResponse}`);
            }
            return { success: false, score: 0 };
        }
    } catch (error) {
        console.log(`\n❌ Lỗi kết nối: ${error.message}`);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Data:`, error.response.data);
        }
        return { success: false, score: 0 };
    }
}

async function runAllTests() {
    console.log('\n🚀 BẮT ĐẦU KIỂM TRA AI CHATBOT');
    console.log(`⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`);
    console.log(`🔗 API URL: ${API_URL}`);

    const results = [];

    for (const testCase of testCases) {
        const result = await testChat(testCase);
        results.push({ name: testCase.name, ...result });
        
        // Wait 2 seconds between tests to avoid rate limiting
        if (testCases.indexOf(testCase) < testCases.length - 1) {
            console.log('\n⏳ Chờ 2 giây trước test tiếp theo...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 TỔNG KẾT');
    console.log(`${'='.repeat(80)}`);

    const successCount = results.filter(r => r.success).length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.success ? '✅' : '❌'} (${result.score}%)`);
    });

    console.log(`\n✅ Thành công: ${successCount}/${results.length}`);
    console.log(`📊 Điểm trung bình: ${avgScore.toFixed(0)}%`);

    if (avgScore >= 80) {
        console.log(`\n🎉 XUẤT SẮC! AI chatbot hoạt động rất tốt!`);
    } else if (avgScore >= 60) {
        console.log(`\n👍 TỐT! AI chatbot hoạt động ổn, có thể cải thiện thêm.`);
    } else {
        console.log(`\n⚠️ CẦN CẢI THIỆN! Kiểm tra lại system prompt và API key.`);
    }

    console.log(`\n${'='.repeat(80)}\n`);
}

// Run tests
runAllTests().catch(error => {
    console.error('❌ Lỗi nghiêm trọng:', error);
    process.exit(1);
});
