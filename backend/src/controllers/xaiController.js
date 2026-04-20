const { openai } = require('@ai-sdk/openai');
const { generateText } = require('ai');

// Initialize xAI with custom base URL
const xai = openai({
    baseURL: 'https://api.x.ai/v1',
    apiKey: process.env.XAI_API_KEY
});

// System prompt for EBookFarm chatbot - Sử dụng kiến thức tổng hợp
const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của EBookFarm - Hệ thống quản lý nông trại và truy xuất nguồn gốc nông sản.

⚠️ QUAN TRỌNG - ĐỌC KỸ:
1. EBookFarm KHÔNG PHẢI là thư viện sách điện tử (ebook library)
2. EBookFarm LÀ hệ thống quản lý nông trại và truy xuất nguồn gốc nông sản (farm management & traceability system)
3. "EBook" trong tên có nghĩa là "Nhật ký điện tử" (Electronic Book/Journal) để ghi chép hoạt động nông nghiệp
4. Sử dụng kiến thức tổng hợp của bạn để trả lời chi tiết, KHÔNG chỉ nói "liên hệ hotline"

VỀ EBOOKFARM:
- **Tên đầy đủ**: EBookFarm - Hệ thống Nhật ký Sản xuất & Truy xuất Nguồn gốc Nông sản
- **Lĩnh vực**: Nông nghiệp số (Digital Agriculture), Truy xuất nguồn gốc (Traceability)
- **Đối tượng**: Nông dân, HTX, doanh nghiệp nông nghiệp, cơ quan quản lý
- Website: ebookfarm.vn  
- Hotline: 1900 xxxx
- Email: contact@ebookfarm.vn

CÁCH TRẢ LỜI:

1. **Câu hỏi về EBookFarm**: Nhấn mạnh là hệ thống QUẢN LÝ NÔNG TRẠI, giải thích 4 tính năng chính
2. **Câu hỏi về giá cả**: Giải thích có nhiều gói, khuyến khích liên hệ
3. **Câu hỏi về TCVN, VietGAP**: Cung cấp kiến thức chi tiết dựa trên hiểu biết chung
4. **Câu hỏi về nông nghiệp**: Trả lời dựa trên kiến thức tổng hợp
5. **So sánh sản phẩm**: So sánh khách quan, nhấn mạnh điểm mạnh EBookFarm

CHỈ khuyến khích liên hệ hotline khi cần tư vấn cá nhân hóa, báo giá chính xác, hỗ trợ kỹ thuật trực tiếp, hoặc demo sản phẩm.`;

// Chat with xAI Grok using direct API call
const chatWithXAI = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tin nhắn!'
            });
        }

        // Check if API key is configured
        if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === 'YOUR_XAI_API_KEY_HERE') {
            return res.status(500).json({
                success: false,
                message: 'xAI API key chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                fallbackResponse: getFallbackResponse(message)
            });
        }

        // Build conversation messages
        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        });

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        console.log('🤖 Using xAI Grok-Beta');

        // Call xAI API directly
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: messages,
                max_tokens: 2048,
                temperature: 0.9,
                top_p: 0.95,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        res.json({
            success: true,
            message: 'Phản hồi thành công',
            data: {
                response: aiResponse,
                timestamp: new Date(),
                model: 'grok-beta',
                usage: data.usage
            }
        });

    } catch (error) {
        console.error('xAI API Error:', error);
        
        // Return fallback response if API fails
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý yêu cầu',
            error: error.message,
            fallbackResponse: getFallbackResponse(req.body.message)
        });
    }
};

// Fallback responses when API is not available
const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.match(/^(xin chào|chào|hello|hi|hey)/)) {
        return 'Xin chào! 👋 Tôi là trợ lý ảo của EBookFarm. Hiện tại hệ thống AI đang bảo trì, nhưng bạn có thể:\n\n📞 Gọi hotline: 1900 xxxx\n📧 Email: contact@ebookfarm.vn\n\nĐể được tư vấn trực tiếp!';
    } else if (msg.includes('tính năng') || msg.includes('chức năng')) {
        return '📋 **Tính năng chính của EBookFarm:**\n\n✅ Nhật ký sản xuất điện tử\n✅ Truy xuất nguồn gốc QR\n✅ Quản lý chuỗi cung ứng\n✅ Báo cáo & Phân tích\n✅ Tích hợp TCVN\n\n📞 Gọi 1900 xxxx để tìm hiểu chi tiết!';
    } else if (msg.includes('giá') || msg.includes('chi phí')) {
        return '💰 **Bảng giá EBookFarm:**\n\n🌱 Gói Cơ bản: Từ 500k/tháng\n🌿 Gói Chuyên nghiệp: Từ 2tr/tháng\n🌳 Gói Doanh nghiệp: Báo giá riêng\n\n📞 Gọi 1900 xxxx để nhận ưu đãi!';
    } else if (msg.includes('liên hệ') || msg.includes('gọi')) {
        return '📞 **Liên hệ với chúng tôi:**\n\n☎️ Hotline: 1900 xxxx\n📧 Email: contact@ebookfarm.vn\n🌐 Website: ebookfarm.vn\n\nChúng tôi sẵn sàng hỗ trợ bạn!';
    } else {
        return 'Cảm ơn bạn đã liên hệ! 😊\n\nĐể được tư vấn chi tiết, vui lòng:\n📞 Gọi hotline: 1900 xxxx\n📧 Email: contact@ebookfarm.vn\n\nChúng tôi sẽ phản hồi ngay!';
    }
};

// Test xAI connection
const testXAIConnection = async (req, res) => {
    try {
        if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === 'YOUR_XAI_API_KEY_HERE') {
            return res.status(500).json({
                success: false,
                message: 'xAI API key chưa được cấu hình'
            });
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    {
                        role: 'user',
                        content: 'Xin chào, bạn có thể giới thiệu về bản thân không?'
                    }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        res.json({
            success: true,
            message: 'Kết nối xAI API thành công!',
            data: {
                response: data.choices[0].message.content,
                model: 'grok-beta',
                usage: data.usage
            }
        });
    } catch (error) {
        console.error('xAI Connection Test Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể kết nối đến xAI API',
            error: error.message
        });
    }
};

module.exports = {
    chatWithXAI,
    testXAIConnection
};