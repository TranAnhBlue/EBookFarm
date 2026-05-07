const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryCategoryController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/', controller.getCategories);
router.post('/', controller.createCategory);
router.put('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
