const express = require('express');
const router = express.Router();
const {
    createConsultation,
    getConsultations,
    updateConsultation,
    deleteConsultation
} = require('../controllers/consultationController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route
router.post('/', createConsultation);

// Admin routes
router.get('/', protect, admin, getConsultations);
router.put('/:id', protect, admin, updateConsultation);
router.delete('/:id', protect, admin, deleteConsultation);

module.exports = router;
