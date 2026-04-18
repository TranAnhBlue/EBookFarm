const TCVN = require('../models/TCVN');
const asyncHandler = require('express-async-handler');

// @desc    Get all TCVNs
// @route   GET /api/tcvn
// @access  Private
const getTCVNs = asyncHandler(async (req, res) => {
    const { keyword } = req.query;
    let query = {};

    if (keyword) {
        query = {
            $or: [
                { code: { $regex: keyword, $options: 'i' } },
                { name: { $regex: keyword, $options: 'i' } },
                { scope: { $regex: keyword, $options: 'i' } }
            ]
        };
    }

    const tcvns = await TCVN.find(query).sort({ stt: 1 });
    res.json({
        success: true,
        count: tcvns.length,
        data: tcvns
    });
});

module.exports = {
    getTCVNs
};
