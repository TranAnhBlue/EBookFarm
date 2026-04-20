const mongoose = require('mongoose');

const chatUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null cho khách vãng lai
    },
    userIP: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    chatLevel: {
        type: String,
        enum: ['guest', 'user', 'vip', 'admin'],
        required: true
    },
    model: {
        type: String,
        default: 'llama-3.1-8b-instant'
    },
    usage: {
        prompt_tokens: { type: Number, default: 0 },
        completion_tokens: { type: Number, default: 0 },
        total_tokens: { type: Number, default: 0 }
    },
    responseTime: {
        type: Number, // milliseconds
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tối ưu query
chatUsageSchema.index({ userId: 1, date: 1 });
chatUsageSchema.index({ userIP: 1, date: 1 });
chatUsageSchema.index({ chatLevel: 1, date: 1 });

// Method để đếm chat trong ngày
chatUsageSchema.statics.getDailyCount = async function(userId, userIP) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (userId) {
        return await this.countDocuments({
            userId: userId,
            date: { $gte: today, $lt: tomorrow }
        });
    } else {
        return await this.countDocuments({
            userIP: userIP,
            userId: null,
            date: { $gte: today, $lt: tomorrow }
        });
    }
};

// Method để lấy thống kê chat
chatUsageSchema.statics.getStats = async function(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    chatLevel: "$chatLevel"
                },
                count: { $sum: 1 },
                totalTokens: { $sum: "$usage.total_tokens" },
                avgResponseTime: { $avg: "$responseTime" }
            }
        },
        { $sort: { "_id.date": -1 } }
    ]);
};

module.exports = mongoose.model('ChatUsage', chatUsageSchema);