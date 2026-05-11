const express = require('express');
const {
  createProduct, getProducts, getProductById,
  updateProduct, registerProductToNationalPortal
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// CRUD sản phẩm (cần đăng nhập)
router.route('/')
  .get(protect, getProducts)
  .post(protect, createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, updateProduct);

// Đăng ký sản phẩm lên cổng quốc gia
router.post('/:id/register-portal', protect, registerProductToNationalPortal);

module.exports = router;
