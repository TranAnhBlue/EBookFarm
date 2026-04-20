const Groq = require('groq-sdk');
const FormSchema = require('../models/FormSchema');
const FarmJournal = require('../models/FarmJournal');
const User = require('../models/User');

// Initialize Groq function
const getGroqClient = () => {
    return new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
};

/**
 * AI Assistant cho Nhật ký Sản xuất
 * Cung cấp gợi ý thông minh dựa trên:
 * - Loại schema (chăn nuôi, thủy sản, cây trồng)
 * - Dữ liệu đã nhập
 * - Thời tiết hiện tại
 * - Lịch sử nhật ký
 */

// System prompt cho AI Assistant nhật ký
const getJournalAISystemPrompt = (schemaType, currentData, weatherInfo, historicalData) => {
    return `Bạn là AI Assistant chuyên gia nông nghiệp của EBookFarm, hỗ trợ nông dân nhập nhật ký sản xuất thông minh.

🎯 NHIỆM VỤ:
- Phân tích dữ liệu nhật ký hiện tại và đưa ra gợi ý hữu ích
- Cảnh báo sớm về vấn đề tiềm ẩn
- Đề xuất hành động cải thiện
- Nhắc nhở về quy trình TCVN/VietGAP

📊 THÔNG TIN HIỆN TẠI:
- Loại sản xuất: ${schemaType}
- Dữ liệu đã nhập: ${JSON.stringify(currentData, null, 2)}
- Thời tiết: ${weatherInfo || 'Không có thông tin'}
- Lịch sử: ${historicalData || 'Chưa có dữ liệu lịch sử'}

🧠 KIẾN THỨC CHUYÊN MÔN:

${getExpertKnowledge(schemaType)}

🎯 NGUYÊN TẮC TRẢ LỜI:
1. Ngắn gọn, cụ thể, dễ hiểu
2. Ưu tiên an toàn và tuân thủ quy định
3. Đưa ra lý do khoa học
4. Gợi ý hành động cụ thể
5. Sử dụng emoji phù hợp

VÍ DỤ GỢI Ý TỐT:
"🌧️ Hôm nay mưa to, nên:
• Kiểm tra hệ thống thoát nước ao nuôi
• Tăng cường sục khí để tránh thiếu oxy
• Hoãn việc thả giống đến khi thời tiết ổn định
• Ghi nhận mực nước và độ trong của ao"

PHẢN HỒI THEO FORMAT:
{
  "suggestions": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
  "warnings": ["Cảnh báo nếu có"],
  "reminders": ["Nhắc nhở về quy trình"],
  "nextActions": ["Hành động tiếp theo nên làm"]
}`;
};

// Kiến thức chuyên môn theo từng lĩnh vực
const getExpertKnowledge = (schemaType) => {
    switch (schemaType) {
        case 'thuysan':
            return `🐟 KIẾN THỨC THỦY SẢN:
- Chất lượng nước: pH 6.5-8.5, DO > 4mg/L, NH3 < 0.1mg/L
- Mật độ thả: Cá tra 3-5 con/m2, Tôm 15-20 con/m2
- Thức ăn: 3-4% trọng lượng thân/ngày, chia 3-4 bữa
- Bệnh thường gặp: Xuất huyết, gan thận mủ, đốm trắng
- Thời vụ: Tránh thả giống mùa mưa bão (T9-T11)
- TCVN: Ghi nhận nguồn gốc giống, thức ăn, thuốc thú y`;

        case 'channuoi':
            return `🐷 KIẾN THỨC CHĂN NUÔI:
- Thức ăn: Lợn 2.5-3kg/ngày, Gà 100-120g/ngày
- Vaccine: Dịch tả lợn, cúm gia cầm, Newcastle
- Nhiệt độ: Lợn con 28-32°C, Gà con 32-35°C
- Bệnh thường gặp: Tiêu chảy, sốt, cúm
- Vệ sinh: Khử trùng chuồng 2 lần/tuần
- TCVN: Ghi nhận nguồn thức ăn, thuốc thú y, vaccine`;

        case 'caytrong':
            return `🌱 KIẾN THỨC CÂY TRỒNG:
- Tưới nước: Sáng sớm hoặc chiều mát
- Phân bón: NPK theo từng giai đoạn sinh trưởng
- Sâu bệnh: Phòng trừ tổng hợp IPM
- Thời vụ: Theo lịch thời vụ của địa phương
- Thu hoạch: Đúng độ chín, thời điểm thích hợp
- TCVN: Ghi nhận nguồn giống, phân bón, thuốc BVTV`;

        default:
            return `🌾 KIẾN THỨC NÔNG NGHIỆP TỔNG HỢP:
- Tuân thủ quy trình kỹ thuật
- Ghi chép đầy đủ, chính xác
- An toàn thực phẩm
- Bảo vệ môi trường`;
    }
};

/**
 * Lấy gợi ý AI cho nhật ký
 */
const getJournalSuggestions = async (req, res) => {
    try {
        const { schemaId, currentData, fieldName, fieldValue } = req.body;

        // Lấy thông tin schema
        const schema = await FormSchema.findById(schemaId);
        if (!schema) {
            return res.status(404).json({
                success: false,
                message: 'Schema không tồn tại'
            });
        }

        // Lấy lịch sử nhật ký của user (5 bản gần nhất)
        const historicalJournals = await FarmJournal.find({
            userId: req.user._id,
            schemaId: schemaId
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('entries createdAt');

        // Phân tích dữ liệu hiện tại
        const analysisPrompt = `Phân tích dữ liệu nhật ký và đưa ra gợi ý:

TRƯỜNG ĐANG NHẬP: ${fieldName}
GIÁ TRỊ: ${fieldValue}

DỮ LIỆU HIỆN TẠI:
${JSON.stringify(currentData, null, 2)}

Hãy đưa ra gợi ý cụ thể cho trường "${fieldName}" và các lưu ý quan trọng.`;

        // Gọi AI
        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: getJournalAISystemPrompt(
                        schema.category,
                        currentData,
                        'Thời tiết ổn định', // TODO: Tích hợp API thời tiết
                        historicalJournals.map(j => j.entries)
                    )
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        // Parse JSON response nếu có thể
        let structuredResponse;
        try {
            structuredResponse = JSON.parse(aiResponse);
        } catch (e) {
            // Nếu không parse được JSON, tạo cấu trúc mặc định
            structuredResponse = {
                suggestions: [aiResponse],
                warnings: [],
                reminders: [],
                nextActions: []
            };
        }

        res.json({
            success: true,
            data: {
                fieldName,
                fieldValue,
                suggestions: structuredResponse.suggestions || [],
                warnings: structuredResponse.warnings || [],
                reminders: structuredResponse.reminders || [],
                nextActions: structuredResponse.nextActions || [],
                rawResponse: aiResponse,
                schemaType: schema.category,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Journal AI Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi AI Assistant',
            error: error.message
        });
    }
};

/**
 * Lấy gợi ý nhanh dựa trên loại trường
 */
const getQuickSuggestions = async (req, res) => {
    try {
        const { fieldType, fieldName, schemaCategory, fieldValue } = req.body;

        const quickSuggestions = getQuickSuggestionsByField(fieldType, fieldName, schemaCategory, fieldValue);

        res.json({
            success: true,
            data: {
                fieldType,
                fieldName,
                fieldValue,
                suggestions: quickSuggestions,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Quick suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy gợi ý nhanh',
            error: error.message
        });
    }
};

// Gợi ý nhanh theo loại trường
const getQuickSuggestionsByField = (fieldType, fieldName, schemaCategory, fieldValue = '') => {
    const suggestions = [];

    // Kiểm tra trường hợp chất lượng không đạt trước
    if (fieldValue && (fieldValue.toLowerCase().includes('không đạt') || fieldValue.toLowerCase().includes('khong dat')) || 
        fieldName.toLowerCase().includes('không đạt') || fieldName.toLowerCase().includes('khong dat')) {
        suggestions.push(
            '⚠️ Cần xác định nguyên nhân chất lượng không đạt',
            '🔍 Kiểm tra lại quy trình sản xuất',
            '📋 Báo cáo với cơ quan quản lý nếu cần thiết',
            '🛡️ Không đưa sản phẩm ra thị trường'
        );
        return suggestions;
    }
    
    // Gợi ý theo tên trường cho tất cả loại sản xuất
    if (fieldName.includes('thức ăn') || fieldName.includes('cho ăn')) {
        if (schemaCategory === 'thuysan') {
            suggestions.push(
                'Cho ăn 3-4 lần/ngày, mỗi lần 30-45 phút',
                'Kiểm tra tôm/cá ăn hết thức ăn trong 1-2 giờ',
                'Điều chỉnh lượng thức ăn theo thời tiết',
                'Ghi nhận nguồn gốc và hạn sử dụng thức ăn'
            );
        } else if (schemaCategory === 'channuoi') {
            suggestions.push(
                'Cho ăn đúng giờ, đủ lượng theo độ tuổi',
                'Kiểm tra chất lượng thức ăn trước khi cho ăn',
                'Ghi nhận nguồn gốc và hạn sử dụng thức ăn',
                'Điều chỉnh khẩu phần theo giai đoạn sinh trưởng'
            );
        }
    }
    
    else if (fieldName.includes('phân') || fieldName.includes('bón') || fieldName.includes('NPK')) {
        suggestions.push(
            'Bón phân đúng liều lượng theo khuyến cáo kỹ thuật',
            'Bón phân vào buổi sáng sớm hoặc chiều mát',
            'Tưới nước sau khi bón phân để phân tan đều',
            'Ghi chép đầy đủ loại phân, liều lượng, thời gian bón'
        );
    }
    else if (fieldName.includes('thuốc') || fieldName.includes('BVTV') || fieldName.includes('trừ sâu') || fieldName.includes('vaccine') || fieldName.includes('kháng sinh')) {
        if (schemaCategory === 'channuoi') {
            suggestions.push(
                'Sử dụng thuốc thú y có nguồn gốc rõ ràng, còn hạn sử dụng',
                'Tuân thủ liều lượng theo hướng dẫn bác sĩ thú y',
                'Ghi chép đầy đủ tên thuốc, liều lượng, thời gian sử dụng',
                'Tuân thủ thời gian cách ly trước khi xuất chuồng',
                'Lưu trữ hóa đơn mua thuốc làm bằng chứng'
            );
        } else if (schemaCategory === 'thuysan') {
            suggestions.push(
                'Sử dụng thuốc thú y được phép trong nuôi trồng thủy sản',
                'Tuân thủ liều lượng và cách sử dụng theo hướng dẫn',
                'Ghi chép đầy đủ thông tin sử dụng thuốc',
                'Tuân thủ thời gian cách ly trước thu hoạch',
                'Kiểm tra chất lượng nước sau khi sử dụng thuốc'
            );
        } else {
            suggestions.push(
                'Sử dụng thuốc BVTV có nguồn gốc rõ ràng, còn hạn sử dụng',
                'Tuân thủ liều lượng và nồng độ theo hướng dẫn',
                'Đeo đầy đủ bảo hộ lao động khi phun thuốc',
                'Tuân thủ thời gian cách ly trước thu hoạch',
                'Phun thuốc vào buổi sáng sớm hoặc chiều mát, tránh gió'
            );
        }
    }
    
    else if (fieldName.includes('giống') || fieldName.includes('hạt giống')) {
        suggestions.push(
            'Chọn giống phù hợp với điều kiện thổ nhưỡng và khí hậu',
            'Sử dụng giống có nguồn gốc rõ ràng, chất lượng tốt',
            'Xử lý hạt giống trước khi gieo trồng',
            'Ghi chép nguồn gốc, ngày gieo, tỷ lệ nảy mầm'
        );
    }
    
    else if (fieldName.includes('tưới') || fieldName.includes('nước')) {
        suggestions.push(
            'Tưới nước đều đặn, tránh úng ngập',
            'Sử dụng nước sạch, không ô nhiễm',
            'Tưới vào buổi sáng sớm hoặc chiều mát',
            'Kiểm tra chất lượng nước tưới định kỳ'
        );
    }
    
    else if (fieldName.includes('thu hoạch') || fieldName.includes('sản lượng')) {
        suggestions.push(
            'Thu hoạch đúng độ chín, thời điểm thích hợp',
            'Sử dụng dụng cụ sạch sẽ khi thu hoạch',
            'Bảo quản sản phẩm ở nơi khô ráo, thoáng mát',
            'Ghi chép đầy đủ sản lượng, chất lượng sản phẩm'
        );
    }
    
    else if (fieldName.includes('chất lượng') || fieldName.includes('ATTP') || fieldValue === 'Không đạt') {
        if (fieldValue === 'Không đạt' || fieldName.includes('Không đạt')) {
            suggestions.push(
                '⚠️ Cần xác định nguyên nhân chất lượng không đạt',
                '🔍 Kiểm tra lại quy trình sản xuất',
                '📋 Báo cáo với cơ quan quản lý nếu cần thiết',
                '🛡️ Không đưa sản phẩm ra thị trường'
            );
        } else {
            suggestions.push(
                'Tuân thủ quy trình VietGAP/TCVN',
                'Kiểm tra chất lượng sản phẩm định kỳ',
                'Đảm bảo an toàn thực phẩm',
                'Lưu trữ hồ sơ chứng minh chất lượng'
            );
        }
    }
    
    else if (fieldName.includes('bệnh') || fieldName.includes('sâu hại')) {
        suggestions.push(
            'Phát hiện sớm và xử lý kịp thời',
            'Áp dụng biện pháp phòng trừ tổng hợp IPM',
            'Loại bỏ cây bệnh, tiêu hủy đúng quy định',
            'Khử trùng dụng cụ sau khi sử dụng'
        );
    }
    
    else if (fieldName.includes('đất') || fieldName.includes('giá thể')) {
        suggestions.push(
            'Cải tạo đất trước khi trồng',
            'Kiểm tra pH đất, bổ sung vôi nếu cần',
            'Bón phân hữu cơ để cải thiện độ phì nhiêu',
            'Luân canh cây trồng để duy trì độ phì đất'
        );
    }

    // Gợi ý theo danh mục schema
    if (schemaCategory === 'trongtrot') {
        if (suggestions.length === 0) {
            suggestions.push(
                'Tuân thủ quy trình kỹ thuật canh tác',
                'Ghi chép đầy đủ, chính xác các hoạt động',
                'Sử dụng vật tư đầu vào có nguồn gốc rõ ràng',
                'Đảm bảo an toàn lao động và môi trường'
            );
        }
    }

    // Gợi ý mặc định nếu không có gợi ý cụ thể
    if (suggestions.length === 0) {
        suggestions.push(
            'Ghi chép đầy đủ, chính xác thông tin',
            'Tuân thủ quy trình kỹ thuật',
            'Lưu giữ hóa đơn, chứng từ liên quan',
            'Đảm bảo truy xuất nguồn gốc'
        );
    }

    return suggestions;
};

/**
 * Phân tích và cảnh báo rủi ro
 */
const analyzeRisks = async (req, res) => {
    try {
        const { schemaId, journalData } = req.body;

        const schema = await FormSchema.findById(schemaId);
        if (!schema) {
            return res.status(404).json({
                success: false,
                message: 'Schema không tồn tại'
            });
        }

        // Phân tích rủi ro bằng AI
        const groq = getGroqClient();
        const riskAnalysisPrompt = `Phân tích rủi ro trong dữ liệu nhật ký sau và đưa ra cảnh báo:

LOẠI SẢN XUẤT: ${schema.category}
DỮ LIỆU NHẬT KÝ:
${JSON.stringify(journalData, null, 2)}

Hãy phân tích và cảnh báo về:
1. Rủi ro về bệnh tật
2. Rủi ro về môi trường
3. Rủi ro về an toàn thực phẩm
4. Vi phạm quy trình TCVN/VietGAP

Trả về JSON format:
{
  "riskLevel": "low|medium|high",
  "risks": [
    {
      "type": "disease|environment|food_safety|compliance",
      "severity": "low|medium|high", 
      "description": "Mô tả rủi ro",
      "recommendation": "Khuyến nghị xử lý"
    }
  ]
}`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là chuyên gia phân tích rủi ro nông nghiệp. Trả lời bằng JSON format.'
                },
                {
                    role: 'user',
                    content: riskAnalysisPrompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.3
        });

        const aiResponse = completion.choices[0].message.content;
        
        let riskAnalysis;
        try {
            riskAnalysis = JSON.parse(aiResponse);
        } catch (e) {
            riskAnalysis = {
                riskLevel: 'low',
                risks: [{
                    type: 'general',
                    severity: 'low',
                    description: 'Không phát hiện rủi ro đặc biệt',
                    recommendation: 'Tiếp tục theo dõi và ghi chép đầy đủ'
                }]
            };
        }

        res.json({
            success: true,
            data: {
                riskLevel: riskAnalysis.riskLevel,
                risks: riskAnalysis.risks,
                analysisTime: new Date(),
                schemaType: schema.category
            }
        });

    } catch (error) {
        console.error('Risk analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi phân tích rủi ro',
            error: error.message
        });
    }
};

module.exports = {
    getJournalSuggestions,
    getQuickSuggestions,
    analyzeRisks
};