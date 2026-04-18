const mongoose = require('mongoose');

const tcvnSchema = new mongoose.Schema({
    stt: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    scope: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for search
tcvnSchema.index({ code: 'text', name: 'text', scope: 'text' });

const TCVN = mongoose.model('TCVN', tcvnSchema);

module.exports = TCVN;
