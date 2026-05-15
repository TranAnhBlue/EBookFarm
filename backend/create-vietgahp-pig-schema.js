const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const createPigSchema = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const schemaName = 'Lợn thịt';
    await FormSchema.deleteMany({ name: schemaName });

    const pigSchema = new FormSchema({
      name: schemaName,
      description: 'Sổ nhật ký điện tử chăn nuôi lợn thịt theo quy chuẩn VietGAHP (QĐ 4653/QĐ-BNN-CN).',
      category: 'channuoi',
      tables: [
        {
          tableName: 'Thông tin chung',
          isMultiRow: false,
          fields: [
            { name: 'tenToChuc', label: 'Tên tổ chức/cá nhân chăn nuôi', type: 'text', required: true },
            { name: 'diaChi', label: 'Địa chỉ', type: 'text', required: true },
            { name: 'luaChanNuoi', label: 'Lứa chăn nuôi', type: 'text', required: true },
            { name: 'tenChuong', label: 'Tên chuồng nuôi/khu vực', type: 'text', required: true },
            { name: 'nam', label: 'Năm', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 1: PHIẾU NHẬP NGUYÊN LIỆU, THỨC ĂN',
          isMultiRow: true,
          fields: [
            { name: 'ngayNhap', label: 'Ngày nhập', type: 'date', required: true },
            { name: 'tenHang', label: 'Tên hàng', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'coSoSanXuat', label: 'Cơ sở sản xuất', type: 'text' },
            { name: 'ngaySanXuat', label: 'Ngày sản xuất', type: 'date' },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date' },
            { name: 'danhGia', label: 'Đánh giá cảm quan', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 2: MUA/CHUYỂN LỢN GIỐNG VÀO NUÔI',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'trongLuongTB', label: 'Trọng lượng trung bình (kg)', type: 'number' },
            { name: 'tenGiong', label: 'Tên giống lợn', type: 'text', required: true },
            { name: 'coSoGiong', label: 'Cơ sở sản xuất giống', type: 'text' },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 3: THEO DÕI KHO THUỐC, VẮC XIN',
          isMultiRow: true,
          fields: [
            { name: 'ngayNhap', label: 'Ngày nhập', type: 'date', required: true },
            { name: 'tenSanPham', label: 'Tên sản phẩm', type: 'text', required: true },
            { name: 'soLoHanDung', label: 'Số lô/Hạn sử dụng', type: 'text' },
            { name: 'donViTinh', label: 'Đơn vị tính', type: 'text' },
            { name: 'soLuong', label: 'Số lượng', type: 'number', required: true },
            { name: 'tacDung', label: 'Tác dụng', type: 'text' },
            { name: 'nhaCungCap', label: 'Tên và địa chỉ nhà cung cấp', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 4: THEO DÕI PHÂN PHỐI THỨC ĂN',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'tenThucAn', label: 'Tên thức ăn', type: 'text', required: true },
            { name: 'maSoLo', label: 'Mã số lô', type: 'text' },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text', required: true },
            { name: 'khoiLuongNgay', label: 'Khối lượng/ngày (kg)', type: 'number', required: true },
            { name: 'nguoiThucHien', label: 'Công nhân chăn nuôi', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 5: THEO DÕI ĐIỀU TRỊ BỆNH',
          isMultiRow: true,
          fields: [
            { name: 'ngayBatDau', label: 'Ngày bắt đầu điều trị', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number' },
            { name: 'trongLuong', label: 'Trọng lượng lợn (kg)', type: 'number' },
            { name: 'trieuChung', label: 'Triệu chứng', type: 'text' },
            { name: 'tenThuoc', label: 'Tên thuốc sử dụng', type: 'text', required: true },
            { name: 'lieuLuong', label: 'Liều lượng, cách dùng', type: 'text' },
            { name: 'ngayKetThuc', label: 'Ngày kết thúc điều trị', type: 'date' },
            { name: 'ketQua', label: 'Kết quả điều trị', type: 'text' },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 6: THEO DÕI SÁT TRÙNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'doiTuongSatTrung', label: 'Tên dụng cụ, trang thiết bị sát trùng', type: 'text' },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text' },
            { name: 'tenThuoc', label: 'Tên thuốc', type: 'text', required: true },
            { name: 'soLoHanDung', label: 'Số lô/Hạn sử dụng', type: 'text' },
            { name: 'lieuDung', label: 'Liều dùng', type: 'text' },
            { name: 'nguoiThucHien', label: 'Người thực hiện', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 7: THEO DÕI TIÊM VẮC XIN',
          isMultiRow: true,
          fields: [
            { name: 'ngayTiem', label: 'Ngày tiêm', type: 'date', required: true },
            { name: 'trongLuong', label: 'Trọng lượng (kg)', type: 'number' },
            { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number' },
            { name: 'tenVaccine', label: 'Tên vaccine', type: 'text', required: true },
            { name: 'mucDich', label: 'Mục đích', type: 'text' },
            { name: 'lieuLuong', label: 'Liều lượng', type: 'text' },
            { name: 'tongLuong', label: 'Tổng lượng vaccine sử dụng', type: 'text' },
            { name: 'nguoiTiem', label: 'Người tiêm', type: 'text' },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 8: THEO DÕI XUẤT BÁN LỢN THỊT',
          isMultiRow: true,
          fields: [
            { name: 'ngayXuat', label: 'Ngày xuất bán', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'khốiLuong', label: 'Khối lượng (kg)', type: 'number' },
            { name: 'maLoSanPham', label: 'Mã lô sản phẩm', type: 'text', required: true },
            { name: 'ngayTiemCuoi', label: 'Ngày tiêm phòng/trị bệnh lần cuối', type: 'date' },
            { name: 'loaiThuocCuoi', label: 'Loại vaccine/thuốc đã sử dụng', type: 'text' },
            { name: 'ngayKetThucDieuTri', label: 'Ngày kết thúc điều trị', type: 'date' },
            { name: 'nguoiMua', label: 'Tên/địa chỉ người mua', type: 'text' },
            { name: 'nguoiXuat', label: 'Người xuất bán', type: 'text' }
          ]
        }
      ]
    });

    await pigSchema.save();
    console.log('VietGAHP Pig Schema created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createPigSchema();