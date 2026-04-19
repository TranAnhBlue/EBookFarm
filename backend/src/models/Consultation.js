const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    organization: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    contactedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    contactedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index để tìm kiếm nhanh
consultationSchema.index({ email: 1 });
consultationSchema.index({ phone: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);
