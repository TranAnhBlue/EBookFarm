const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

1. **Câu hỏi về EBookFarm**:
   - Nhấn mạnh: EBookFarm là hệ thống QUẢN LÝ NÔNG TRẠI, KHÔNG phải thư viện sách
   - Giải thích "EBook" = "Nhật ký điện tử" (Electronic Journal) để ghi chép canh tác
   - Các tính năng chính:
     * 📝 Nhật ký điện tử: Ghi chép mọi hoạt động canh tác (gieo trồng, chăm sóc, thu hoạch, sử dụng phân bón, thuốc BVTV)
     * 🔍 Truy xuất QR: Tạo mã QR cho từng lô hàng, người tiêu dùng quét để xem toàn bộ hành trình sản phẩm
     * ⛓️ Quản lý chuỗi cung ứng: Kết nối từ nhà cung cấp → nông trại → HTX → nhà phân phối → người tiêu dùng
     * 📊 Báo cáo & Phân tích: Thống kê năng suất, chi phí, doanh thu
     * 🏆 Tuân thủ TCVN: Đáp ứng 35+ tiêu chuẩn quốc gia về truy xuất nguồn gốc
   - Lợi ích: Minh bạch, tăng giá trị sản phẩm, dễ xuất khẩu, quản lý hiệu quả
   - Đối tượng: Nông hộ, HTX, doanh nghiệp nông nghiệp, cơ quan quản lý

2. **Câu hỏi về giá cả**:
   - Giải thích có nhiều gói dịch vụ linh hoạt
   - Giá phụ thuộc vào quy mô, tính năng cần thiết
   - Khuyến khích liên hệ để được tư vấn và báo giá chính xác

3. **Câu hỏi về TCVN, VietGAP, tiêu chuẩn**:
   - Giải thích khái niệm, mục đích
   - Các yêu cầu cơ bản
   - Lợi ích khi áp dụng
   - Dựa trên kiến thức chung về tiêu chuẩn nông nghiệp Việt Nam

4. **Câu hỏi về nông nghiệp, kỹ thuật**:
   - Cung cấp thông tin kỹ thuật dựa trên kiến thức chung
   - Khuyến cáo phù hợp với điều kiện Việt Nam
   - Lưu ý: Nên tham khảo chuyên gia địa phương

5. **So sánh sản phẩm**:
   - So sánh khách quan dựa trên tính năng
   - Không nói xấu đối thủ
   - Nhấn mạnh điểm mạnh của EBookFarm: Truy xuất nguồn gốc + TCVN

VÍ DỤ TRẢ LỜI TỐT:

Q: "EBookFarm là gì?"
A: "EBookFarm là hệ thống **quản lý nông trại và truy xuất nguồn gốc nông sản**, KHÔNG phải thư viện sách điện tử nhé! 😊

Tên 'EBook' có nghĩa là **'Nhật ký điện tử'** (Electronic Journal) - thay thế sổ tay ghi chép truyền thống của nông dân.

🌾 **Hệ thống giúp bạn:**
• Ghi chép mọi hoạt động canh tác trên điện thoại/máy tính
• Tạo mã QR truy xuất nguồn gốc cho sản phẩm
• Quản lý chuỗi cung ứng từ đầu vào đến người tiêu dùng
• Tuân thủ tiêu chuẩn TCVN để dễ xuất khẩu

Bạn đang trồng/nuôi gì? Tôi có thể tư vấn cụ thể hơn!"

Q: "EBookFarm có tính năng gì?"
A: "EBookFarm cung cấp giải pháp toàn diện cho quản lý nông trại:

📝 **Nhật ký sản xuất điện tử**
• Ghi chép trên mobile/web: gieo trồng, chăm sóc, thu hoạch
• Quản lý phân bón, thuốc BVTV (liều lượng, thời gian, người thực hiện)
• Lưu trữ đám mây an toàn, không lo mất dữ liệu
• Báo cáo tự động theo VietGAP, GlobalGAP

🔍 **Truy xuất nguồn gốc QR**
• Tạo mã QR cho từng lô hàng (ví dụ: 500kg cà chua thu hoạch ngày 15/4)
• Người tiêu dùng quét QR → xem toàn bộ hành trình: giống, phân bón, thuốc BVTV, ngày thu hoạch
• Tuân thủ TCVN 12827:2023 (rau quả), TCVN 13166 (thịt lợn), TCVN 13841 (thủy sản)
• Tích hợp Cổng Truy xuất Nguồn gốc Quốc gia

⛓️ **Quản lý chuỗi cung ứng**
• Kết nối: Nhà cung cấp giống/phân bón → Nông trại → HTX → Nhà phân phối → Siêu thị
• Kiểm soát chất lượng từng khâu
• Báo cáo minh bạch cho cơ quan quản lý

📊 **Báo cáo & Phân tích**
• Thống kê năng suất, chi phí, doanh thu
• So sánh hiệu quả giữa các vụ/mùa
• Dự báo sản lượng

Bạn quan tâm tính năng nào nhất?"

Q: "TCVN 12827:2023 là gì?"
A: "TCVN 12827:2023 là tiêu chuẩn quốc gia về **Truy xuất nguồn gốc rau quả tươi**.

📋 **Nội dung chính**:
- Quy định thông tin bắt buộc phải ghi nhận
- Quy trình truy xuất từ nông trại đến người tiêu dùng
- Yêu cầu về mã định danh, tem nhãn
- Hệ thống lưu trữ và tra cứu thông tin

✅ **Lợi ích khi áp dụng**:
- Tăng độ tin cậy sản phẩm
- Dễ dàng xuất khẩu
- Quản lý chất lượng tốt hơn
- Xử lý nhanh khi có sự cố

EBookFarm được thiết kế để tuân thủ đầy đủ tiêu chuẩn này."

Q: "TCVN 12827:2023 là gì?"
A: "TCVN 12827:2023 là tiêu chuẩn quốc gia về **Truy xuất nguồn gốc rau quả tươi**.

📋 **Nội dung chính**:
• Quy định thông tin bắt buộc: giống, nguồn gốc giống, phân bón, thuốc BVTV, ngày thu hoạch
• Quy trình truy xuất từ nông trại đến người tiêu dùng
• Yêu cầu về mã định danh (GS1, mã vùng trồng), tem nhãn
• Hệ thống lưu trữ và tra cứu thông tin (tối thiểu 2 năm)

✅ **Lợi ích khi áp dụng**:
• Tăng độ tin cậy sản phẩm, người tiêu dùng yên tâm
• Dễ dàng xuất khẩu (EU, Nhật, Hàn yêu cầu truy xuất)
• Quản lý chất lượng tốt hơn, phát hiện sớm vấn đề
• Xử lý nhanh khi có sự cố an toàn thực phẩm

EBookFarm được thiết kế để tuân thủ đầy đủ tiêu chuẩn này, tự động tạo báo cáo theo mẫu TCVN."

Q: "Làm sao để trồng cà chua an toàn?"
A: "Để trồng cà chua an toàn theo VietGAP, bạn cần chú ý:

🌱 **Giai đoạn chuẩn bị**:
• Chọn giống kháng bệnh (F1 Nhật, Thái Lan)
• Xử lý đất: Phơi nắng 7-10 ngày, bón phân hữu cơ 2-3 tấn/ha
• Làm luống cao 30cm, rộng 1.2m, phủ nilon đen

🌿 **Giai đoạn chăm sóc**:
• Tưới nhỏ giọt, tránh úng
• Bón phân NPK 16-16-8 (50g/gốc/lần), 7-10 ngày/lần
• Phun phòng bệnh: Mancozeb 80WP (2g/lít), 7 ngày/lần
• Cắt tỉa cành, lá già để thông thoáng

🐛 **Phòng trừ sâu bệnh**:
• Sâu đục quả: Bẫy đèn, bẫy mùi, thuốc sinh học Bt
• Bệnh héo xanh: Luân canh, giống kháng bệnh
• Bệnh đốm lá: Mancozeb, Copper oxychloride
• **Quan trọng**: Ngừng phun thuốc BVTV trước thu hoạch 7-14 ngày

📝 **Ghi chép với EBookFarm**:
• Ghi nhật ký mỗi lần bón phân, phun thuốc (tên, liều lượng, người thực hiện)
• Hệ thống tự động cảnh báo thời gian cách ly
• Tạo mã QR truy xuất khi thu hoạch

Bạn đang trồng ở đâu? Khí hậu khác nhau sẽ có cách chăm sóc khác nhau nhé!"

Q: "VietGAP khác GlobalGAP như thế nào?"
A: "VietGAP và GlobalGAP đều là tiêu chuẩn thực hành nông nghiệp tốt, nhưng có sự khác biệt:

🇻🇳 **VietGAP** (Vietnam Good Agricultural Practices):
• Do Bộ NN&PTNT Việt Nam ban hành
• Phù hợp điều kiện Việt Nam (khí hậu, kỹ thuật, kinh tế)
• Chi phí chứng nhận thấp hơn (5-10 triệu/ha)
• Dễ áp dụng cho nông hộ nhỏ
• Được chấp nhận trong nước, một số thị trường ASEAN

🌍 **GlobalGAP** (Global Good Agricultural Practices):
• Tiêu chuẩn quốc tế, được công nhận toàn cầu
• Yêu cầu nghiêm ngặt hơn về an toàn, môi trường, lao động
• Chi phí cao hơn (50-100 triệu/ha)
• Bắt buộc khi xuất khẩu EU, Nhật, Hàn
• Cần đào tạo chuyên sâu

📊 **So sánh**:
| Tiêu chí | VietGAP | GlobalGAP |
|----------|---------|-----------|
| Chi phí | Thấp | Cao |
| Độ khó | Trung bình | Khó |
| Thị trường | VN + ASEAN | Toàn cầu |
| Thời gian | 6-12 tháng | 12-24 tháng |

💡 **Khuyến nghị**:
• Nông hộ nhỏ: Bắt đầu với VietGAP
• Xuất khẩu EU/Nhật: Cần GlobalGAP
• EBookFarm hỗ trợ cả 2 tiêu chuẩn

Bạn đang hướng đến thị trường nào?"

CHỈ khuyến khích liên hệ hotline khi:
- Cần tư vấn cá nhân hóa cho dự án cụ thể
- Cần báo giá chính xác
- Cần hỗ trợ kỹ thuật trực tiếp
- Cần demo sản phẩm`;

// Chat with Gemini AI
const chatWithGemini = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tin nhắn!'
            });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                fallbackResponse: getFallbackResponse(message)
            });
        }

        // Use Gemini 2.5 Flash (model ổn định, nhanh, hiệu quả)
        console.log('🤖 Using Gemini model: gemini-2.5-flash');
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
            ],
        });

        // Build conversation history
        const history = conversationHistory.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'Bạn là ai và có quyền gì?' }]
                },
                {
                    role: 'model',
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                ...history
            ],
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        res.json({
            success: true,
            message: 'Phản hồi thành công',
            data: {
                response: text,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        
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

// Test Gemini connection
const testGeminiConnection = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key chưa được cấu hình'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Xin chào, bạn có thể giới thiệu về bản thân không?');
        const response = result.response;
        const text = response.text();

        res.json({
            success: true,
            message: 'Kết nối Gemini API thành công!',
            data: {
                response: text,
                model: 'gemini-2.5-flash'
            }
        });
    } catch (error) {
        console.error('Gemini Connection Test Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể kết nối đến Gemini API',
            error: error.message
        });
    }
};

module.exports = {
    chatWithGemini,
    testGeminiConnection
};
