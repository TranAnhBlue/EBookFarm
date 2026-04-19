const Consultation = require('../models/Consultation');

// @desc    Tạo yêu cầu tư vấn mới
// @route   POST /api/consultations
// @access  Public
exports.createConsultation = async (req, res) => {
    try {
        const { fullname, phone, email, organization } = req.body;

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

        const consultation = await Consultation.create({
            fullname,
            phone,
            email,
            organization
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.',
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
        
        if (status === 'contacted' && !consultation.contactedAt) {
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
