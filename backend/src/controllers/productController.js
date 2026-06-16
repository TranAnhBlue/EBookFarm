const Product = require('../models/Product');
const User = require('../models/User');
const { registerProductToPortal } = require('../utils/nationalPortalService');
const { createLog } = require('./logController');

/**
 * HTX tạo sản phẩm mới
 */
const createProduct = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    const isHtxDirector = role === 'HTX' || role === 'HTX_DIRECTOR';
    if (!isHtxDirector && role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Chỉ HTX hoặc Admin mới có thể tạo sản phẩm.' });
    }

    const { gtin, name, description, category, unit, weight, images, schemaId } = req.body;

    // Kiểm tra GTIN trùng
    const existing = await Product.findOne({ gtin });
    if (existing) {
      return res.status(400).json({ success: false, message: `Mã GTIN "${gtin}" đã tồn tại trong hệ thống.` });
    }

    const product = new Product({
      gtin, name, description, category, unit, weight, images, schemaId,
      manufacturerId: req.user._id,
      manufacturerName: req.user.organization || req.user.fullname || req.user.username
    });

    const saved = await product.save();

    await createLog(req.user._id, 'Tạo sản phẩm', saved._id, 'Product', { gtin, name });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy danh sách sản phẩm
 */
const getProducts = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    const filter = role === 'ADMIN' ? {} : { manufacturerId: req.user._id };

    const products = await Product.find(filter)
      .populate('manufacturerId', 'fullname username organization')
      .populate('schemaId', 'name category')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy chi tiết sản phẩm
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('manufacturerId', 'fullname username organization province ward address phone')
      .populate('schemaId', 'name category tables');

    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cập nhật sản phẩm
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    const role = req.user.role?.toUpperCase();
    if (role !== 'ADMIN' && product.manufacturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền chỉnh sửa sản phẩm này.' });
    }

    const allowedFields = ['name', 'description', 'category', 'unit', 'weight', 'images', 'status', 'schemaId'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    const updated = await product.save();
    await createLog(req.user._id, 'Cập nhật sản phẩm', updated._id, 'Product', { name: updated.name });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Đăng ký sản phẩm lên Cổng TXNG Quốc Gia
 */
const registerProductToNationalPortal = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    // Lấy thông tin HTX (người sở hữu sản phẩm)
    const manufacturer = await User.findById(product.manufacturerId);
    if (!manufacturer) return res.status(404).json({ success: false, message: 'Không tìm thấy nhà sản xuất.' });

    if (!manufacturer.portalCredentials?.apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'HTX chưa cấu hình API cổng quốc gia. Vào Cài đặt → Cổng Quốc Gia để nhập thông tin.' 
      });
    }

    // Gọi service đăng ký
    product.portalSyncStatus = 'Pending';
    await product.save();

    const result = await registerProductToPortal(product, manufacturer, req.user._id);

    if (result.success) {
      product.portalProductId = result.portalProductId;
      product.portalSyncStatus = 'Registered';
      product.portalRegisteredAt = new Date();
      await product.save();

      return res.json({ 
        success: true, 
        message: 'Sản phẩm đã được đăng ký thành công lên Cổng TXNG Quốc Gia.',
        portalProductId: result.portalProductId,
        data: product
      });
    } else {
      product.portalSyncStatus = 'Failed';
      await product.save();
      return res.status(502).json({ success: false, message: result.error });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, registerProductToNationalPortal };
