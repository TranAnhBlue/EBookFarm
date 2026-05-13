const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const seedVietGAPCrop = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebookfarm';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Xóa schema cũ nếu có cùng tên
    await FormSchema.deleteMany({ name: 'Nhật ký sản xuất VietGAP (Trồng trọt)' });

    const vietgapCropSchema = new FormSchema({
      name: 'Nhật ký sản xuất VietGAP (Trồng trọt)',
      description: 'Sổ nhật ký điện tử tuân thủ tiêu chuẩn VietGAP cho các loại cây trồng.',
      category: 'trongtrot',
      tables: [
        {
          tableName: 'Thông tin chung',
          isMultiRow: false,
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaChiCoSo', label: 'Địa chỉ', type: 'text', required: true },
            { name: 'hoTen', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
            { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text', required: true },
            { name: 'dienTich', label: 'Diện tích (m2)', type: 'number', required: true },
            { name: 'cayTrong', label: 'Cây trồng', type: 'text', required: true },
            { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text' },
            { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number' }
          ]
        },
        {
          tableName: 'Bảng 1. Đánh giá chỉ tiêu ATTP',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date' },
            { name: 'dieuKien', label: 'Điều kiện (Đất/Nước/SP)', type: 'select', options: ['Đất/Giá thể', 'Nước tưới', 'Nước sơ chế', 'Sản phẩm'] },
            { name: 'tacNhan', label: 'Tác nhân gây ô nhiễm', type: 'text' },
            { name: 'danhGia', label: 'Đánh giá hiện tại', type: 'select', options: ['Đạt', 'Không đạt'] },
            { name: 'bienPhap', label: 'Biện pháp xử lý đã áp dụng', type: 'text' }
          ]
        },
        {
          tableName: 'Bảng 2. Theo dõi vật tư đầu vào',
          isMultiRow: true,
          fields: [
            { name: 'thoiGian', label: 'Thời gian', type: 'date' },
            { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
            { name: 'donViTinh', label: 'ĐVT', type: 'text' },
            { name: 'soLuong', label: 'Số lượng', type: 'number' },
            { name: 'diaChiMua', label: 'Tên và địa chỉ mua', type: 'text' },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date' },
            { name: 'nguyenLieuTuSanXuat', label: 'Nguyên liệu (nếu tự SX)', type: 'text' },
            { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý', type: 'text' },
            { name: 'hoaChatXuLy', label: 'Hóa chất xử lý', type: 'text' },
            { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text' }
          ]
        },
        {
          tableName: 'Bảng 3. Nhật ký canh tác',
          isMultiRow: true,
          fields: [
            { name: 'thoiGian', label: 'Thời gian thực hiện', type: 'date' },
            { name: 'maSoThua', label: 'Mã số thửa', type: 'text' },
            { name: 'loSx', label: 'Lô sản xuất', type: 'text' },
            { name: 'tenPhanBon', label: 'Tên phân bón', type: 'text' },
            { name: 'luongPhanBon', label: 'Lượng bón (Kg)', type: 'number' },
            { name: 'tenThuocBVTV', label: 'Tên thuốc BVTV', type: 'text' },
            { name: 'nongDoPha', label: 'Nồng độ pha', type: 'text' },
            { name: 'luongThuocSuDung', label: 'Lượng thuốc sử dụng', type: 'number' },
            { name: 'thoiGianCachLy', label: 'Thời gian cách ly (PHI)', type: 'number' },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
          ]
        },
        {
          tableName: 'Bảng 4. Thu hoạch và tiêu thụ',
          isMultiRow: true,
          fields: [
            { name: 'thoiGianThuHoach', label: 'Thời gian thu hoạch', type: 'date' },
            { name: 'maSoLo', label: 'Mã số lô thu hoạch', type: 'text' },
            { name: 'tenSanPham', label: 'Tên sản phẩm', type: 'text' },
            { name: 'sanLuong', label: 'Sản lượng (kg)', type: 'number' },
            { name: 'diaDiemSoChe', label: 'Địa điểm sơ chế', type: 'text' },
            { name: 'ngayBan', label: 'Ngày bán', type: 'date' },
            { name: 'soLuongBan', label: 'Số lượng bán (kg)', type: 'number' },
            { name: 'donViMua', label: 'Đơn vị thu mua/Địa chỉ', type: 'text' },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
          ]
        }
      ]
    });

    await vietgapCropSchema.save();
    console.log('VietGAP Crop Schema seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding schema:', error);
    process.exit(1);
  }
};

seedVietGAPCrop();
