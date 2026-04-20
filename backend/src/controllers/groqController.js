const Groq = require('groq-sdk');

// Initialize Groq with API key
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_demo_key' // Groq có demo key miễn phí
});

// System prompt theo cấp độ người dùng
const getSystemPromptByLevel = (chatLevel) => {
    const basePrompt = `Bạn là trợ lý AI thông minh của EBookFarm - Hệ thống quản lý nông trại và truy xuất nguồn gốc nông sản.

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
- Email: contact@ebookfarm.vn`;

    switch (chatLevel) {
        case 'guest':
            return basePrompt + `

🚫 GIỚI HẠN CHO KHÁCH VÃNG LAI:
- Chỉ trả lời thông tin cơ bản về EBookFarm và tính năng
- Giải thích TCVN, VietGAP, kỹ thuật nông nghiệp cơ bản
- KHÔNG cung cấp giá cụ thể, chỉ nói "có nhiều gói linh hoạt"
- Khi hỏi về giá: "Đăng ký miễn phí để nhận báo giá chi tiết theo nhu cầu"
- Khuyến khích đăng ký: "Đăng ký tài khoản để được tư vấn đầy đủ và có 50 lượt chat/ngày"
- Cuối mỗi câu trả lời, thêm: "💡 Đăng ký miễn phí để được tư vấn chi tiết hơn!"`;

        case 'user':
            return basePrompt + `

✅ QUYỀN LỢI USER ĐÃ ĐĂNG KÝ:
- Tư vấn chi tiết về tất cả tính năng
- Báo giá sơ bộ theo quy mô (VD: dưới 5ha: 500k/tháng, 5-50ha: 2tr/tháng)
- Tư vấn kỹ thuật nông nghiệp chi tiết
- So sánh các gói dịch vụ
- Khi cần giá chính xác: "Liên hệ sales 1900 xxxx để nhận báo giá chính xác cho quy mô cụ thể"
- Có thể đề xuất demo: "Bạn có muốn đăng ký demo miễn phí không?"`;

        case 'admin':
        case 'vip':
            return basePrompt + `

👑 QUYỀN LỢI VIP/ADMIN:
- Tư vấn chuyên sâu không giới hạn
- Báo giá chi tiết và chính xác theo quy mô
- Hỗ trợ kỹ thuật nâng cao
- Thông tin về ưu đãi đặc biệt
- Có thể kết nối trực tiếp với chuyên gia
- Ưu tiên phản hồi và hỗ trợ`;

        default:
            return basePrompt;
    }
};

// Chat with Groq AI
const chatWithGroq = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tin nhắn!'
            });
        }

        // Build conversation messages với system prompt theo cấp độ
        const systemPrompt = getSystemPromptByLevel(req.chatPermission.chatLevel);
        const messages = [
            {
                role: 'system',
                content: systemPrompt
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

        console.log(`🤖 Using Groq Llama-3.1-8B (${req.chatPermission.chatLevel.toUpperCase()}: ${req.chatPermission.remainingChats >= 0 ? req.chatPermission.remainingChats + ' left' : 'unlimited'})`);

        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant', // Model mới, nhanh và miễn phí
            messages: messages,
            max_tokens: 2048,
            temperature: 0.9,
            top_p: 0.95,
            stream: false
        });

        const response = completion.choices[0].message.content;

        res.json({
            success: true,
            message: 'Phản hồi thành công',
            data: {
                response: response,
                timestamp: new Date(),
                model: 'llama-3.1-8b-instant',
                usage: completion.usage,
                chatLevel: req.chatPermission.chatLevel,
                remainingChats: req.chatPermission.remainingChats
            }
        });

    } catch (error) {
        console.error('Groq API Error:', error);
        
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

// Test Groq connection
const testGroqConnection = async (req, res) => {
    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'user',
                    content: 'Xin chào, bạn có thể giới thiệu về bản thân không?'
                }
            ],
            max_tokens: 500
        });

        const response = completion.choices[0].message.content;

        res.json({
            success: true,
            message: 'Kết nối Groq API thành công!',
            data: {
                response: response,
                model: 'llama-3.1-8b-instant',
                usage: completion.usage
            }
        });
    } catch (error) {
        console.error('Groq Connection Test Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể kết nối đến Groq API',
            error: error.message
        });
    }
};

module.exports = {
    chatWithGroq,
    testGroqConnection
};