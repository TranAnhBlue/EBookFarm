// List all available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    console.log('🔍 Listing available Gemini models...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ❌');
    console.log('');

    try {
        // Try to list models
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.models && data.models.length > 0) {
            console.log('✅ Available models:\n');
            data.models.forEach((model, index) => {
                console.log(`${index + 1}. ${model.name}`);
                console.log(`   Display Name: ${model.displayName}`);
                console.log(`   Description: ${model.description || 'N/A'}`);
                console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });

            console.log('\n💡 Khuyến nghị sử dụng:');
            const flashModel = data.models.find(m => m.name.includes('flash'));
            const proModel = data.models.find(m => m.name.includes('pro') && !m.name.includes('vision'));
            
            if (flashModel) {
                console.log(`✅ Nhanh: ${flashModel.name}`);
            }
            if (proModel) {
                console.log(`✅ Mạnh: ${proModel.name}`);
            }
        } else {
            console.log('⚠️  Không tìm thấy model nào');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            console.log('\n💡 API key không hợp lệ hoặc không có quyền');
            console.log('Hãy tạo API key mới tại: https://aistudio.google.com/app/apikey');
        } else if (error.message.includes('404')) {
            console.log('\n💡 Endpoint không tồn tại');
            console.log('API key có thể đã hết hạn hoặc không hợp lệ');
        }
    }
}

listModels();
