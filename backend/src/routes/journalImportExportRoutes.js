const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  exportJournal,
  importJournal,
  exportMultipleJournals,
  generateImportTemplate
} = require('../controllers/journalImportExportController');

// @route   GET /api/journals/export/:id
// @desc    Export single journal to Excel
// @access  Private
router.get('/export/:id', protect, exportJournal);

// @route   POST /api/journals/import
// @desc    Import journal from Excel
// @access  Private
router.post('/import', protect, importJournal);

// @route   POST /api/journals/export-multiple
// @desc    Export multiple journals to Excel
// @access  Private
router.post('/export-multiple', protect, exportMultipleJournals);

// @route   GET /api/journals/template/:schemaId
// @desc    Generate import template for schema
// @access  Private
router.get('/template/:schemaId', protect, generateImportTemplate);

module.exports = router;