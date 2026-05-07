const Consultation = require('../models/Consultation');
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_demo_key'
});

// @desc    Tạo yêu cầu tư vấn mới
// @route   POST /api/consultations
// @access  Public
exports.createConsultation = async (req, res) => {
    try {
        const { fullname, phone, email, organization, category, message: userMessage } = req.body;

        // Kiểm tra xem email hoặc phone đã tồn tại trong 24h gần nhất chưa
        const existingConsultation = await Consultation.findOne({
            $or: [{ email }, { phone }],
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (existingConsultation) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã gửi yêu cầu tư vấn trong 24h qua. Vui lòng chờ chúng tôi liên hệ!'
            });
        }

        // 1. Tạo bản ghi cơ bản trước
        let consultation = new Consultation({
            fullname,
            phone,
            email,
            organization,
            category,
            message: userMessage
        });

        // 2. Nếu là yêu cầu kỹ thuật, gọi AI để lấy câu trả lời sơ bộ
        if (category === 'Kỹ thuật' || !category) {
            try {
                const completion = await groq.chat.completions.create({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: `Bạn là chuyên gia nông nghiệp của EBookFarm. Hãy đưa ra câu trả lời sơ bộ, chuyên nghiệp và hữu ích cho yêu cầu tư vấn của người dùng. 
                            Lưu ý: 
                            1. Đây là câu trả lời TỰ ĐỘNG từ AI để hỗ trợ người dùng ngay lập tức.
                            2. Luôn nhắc nhở người dùng rằng chuyên gia của EBookFarm sẽ liên hệ trực tiếp để tư vấn chi tiết hơn.
                            3. Trả lời bằng tiếng Việt, súc tích, đi thẳng vào vấn đề kỹ thuật.`
                        },
                        {
                            role: 'user',
                            content: `Họ tên: ${fullname}\nVấn đề: ${userMessage}`
                        }
                    ],
                    max_tokens: 1024,
                    temperature: 0.7
                });

                consultation.aiResponse = completion.choices[0].message.content;
            } catch (aiError) {
                console.error('AI Consultation Error:', aiError);
                // Không chặn việc tạo consultation nếu AI lỗi
            }
        }

        await consultation.save();

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! AI đã đưa ra gợi ý sơ bộ cho bạn.',
            data: consultation
        });
    } catch (error) {
        console.error('Create consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại!'
        });
    }
};

// @desc    Lấy danh sách yêu cầu tư vấn (Admin only)
// @route   GET /api/consultations
// @access  Private/Admin
exports.getConsultations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) query.status = status;

        const consultations = await Consultation.find(query)
            .populate('contactedBy', 'fullname email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Consultation.countDocuments(query);

        res.json({
            success: true,
            data: consultations,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get consultations error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra!'
        });
    }
};

// @desc    Cập nhật trạng thái yêu cầu tư vấn (Admin only)
// @route   PUT /api/consultations/:id
// @access  Private/Admin
exports.updateConsultation = async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const consultation = await Consultation.findById(req.params.id);
        
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu tư vấn!'
            });
        }

        if (status) consultation.status = status;
        if (notes) consultation.notes = notes;
        
        // Luôn ghi nhận/cập nhật người xử lý nếu trạng thái không phải pending
        if (status && status !== 'pending') {
            consultation.contactedAt = new Date();
            consultation.contactedBy = req.user._id;
        }

        await consultation.save();

        res.json({
            success: true,
            message: 'Cập nhật thành công!',
            data: consultation
        });
    } catch (error) {
        console.error('Update consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra!'
        });
    }
};

// @desc    Xóa yêu cầu tư vấn (Admin only)
// @route   DELETE /api/consultations/:id
// @access  Private/Admin
exports.deleteConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu tư vấn!'
            });
        }

        await consultation.deleteOne();

        res.json({
            success: true,
            message: 'Xóa thành công!'
        });
    } catch (error) {
        console.error('Delete consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra!'
        });
    }
};
