const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const createPoultrySchema = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const schemaName = 'Gà thịt';
    await FormSchema.deleteMany({ name: schemaName });

    const poultrySchema = new FormSchema({
      name: schemaName,
      description: 'Sổ nhật ký điện tử chăn nuôi gà thịt theo quy chuẩn VietGAHP (QĐ 4653/QĐ-BNN-CN).',
      category: 'channuoi',
      tables: [
        {
          tableName: 'Thông tin chung',
          isMultiRow: false,
          fields: [
            { name: 'tenChuHo', label: 'Họ và tên tổ chức/cá nhân chăn nuôi', type: 'text', required: true },
            { name: 'dienThoai', label: 'Điện thoại', type: 'text' },
            { name: 'diaChi', label: 'Địa chỉ (Thôn/Ấp/Xã/Huyện/Tỉnh)', type: 'text', required: true },
            { name: 'tenGiongGa', label: 'Tên giống gà', type: 'text', required: true },
            { name: 'coSoCungCap', label: 'Mua tại cơ sở', type: 'text' },
            { name: 'ngayBatDauNuoi', label: 'Ngày tháng bắt đầu nuôi', type: 'date', required: true },
            { name: 'tuoiBatDauNuoi', label: 'Tuổi bắt đầu nuôi', type: 'text' },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'phuongThucChanNuoi', label: 'Phương thức chăn nuôi', type: 'text' },
            { name: 'dienTichChuong', label: 'Diện tích chuồng nuôi (m2)', type: 'number' },
            { name: 'kieuChuongNuoi', label: 'Kiểu chuồng nuôi', type: 'text' },
            { name: 'dienTichKhuVuc', label: 'Diện tích toàn bộ khu vực chăn nuôi (m2)', type: 'number' },
            { name: 'nam', label: 'Năm', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 1: THEO DÕI MUA THỨC ĂN CHĂN NUÔI',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'tenThucAn', label: 'Tên thức ăn', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'donGia', label: 'Đơn giá (đồng/kg)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng/đại lý bán và địa chỉ', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 2: THEO DÕI MUA NGUYÊN LIỆU THỨC ĂN CHĂN NUÔI',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'tenNguyenLieu', label: 'Tên nguyên liệu thức ăn', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'donGia', label: 'Đơn giá (đồng/kg)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng/đại lý bán và địa chỉ', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 3: THEO DÕI MUA GÀ GIỐNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng mua (con)', type: 'number', required: true },
            { name: 'coSoBan', label: 'Cơ sở bán', type: 'text', required: true },
            { name: 'tenGiongGa', label: 'Tên giống gà', type: 'text', required: true },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
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
            { name: 'nguoiThucHien', label: 'Công nhân chăn nuôi (ký tên)', type: 'signature', required: true },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 5: THEO DÕI ĐIỀU TRỊ BỆNH',
          isMultiRow: true,
          fields: [
            { name: 'ngayBatDau', label: 'Ngày bắt đầu điều trị', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number' },
            { name: 'trieuChung', label: 'Triệu chứng', type: 'text' },
            { name: 'tenThuoc', label: 'Tên thuốc sử dụng', type: 'text', required: true },
            { name: 'lieuLuong', label: 'Liều lượng, cách dùng', type: 'text' },
            { name: 'ngayKetThuc', label: 'Ngày kết thúc điều trị', type: 'date' },
            { name: 'ketQua', label: 'Kết quả điều trị', type: 'text' },
            { name: 'nguoiDieuTri', label: 'Người điều trị', type: 'text', required: true },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 6: THEO DÕI SÁT TRÙNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'doiTuongSatTrung', label: 'Tên dụng cụ, trang thiết bị sát trùng', type: 'text' },
            { name: 'tenThuoc', label: 'Tên thuốc', type: 'text', required: true },
            { name: 'lieuDung', label: 'Liều dùng', type: 'text' },
            { name: 'nguoiThucHien', label: 'Người thực hiện', type: 'text' },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 7: THEO DÕI TIÊM VẮC XIN',
          isMultiRow: true,
          fields: [
            { name: 'ngayTiem', label: 'Ngày tiêm', type: 'date', required: true },
            { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number' },
            { name: 'tenVaccine', label: 'Tên vaccine', type: 'text', required: true },
            { name: 'lieuLuong', label: 'Liều lượng', type: 'text' },
            { name: 'nguoiTiem', label: 'Người tiêm', type: 'text' },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 8: THEO DÕI XUẤT BÁN GÀ THỊT',
          isMultiRow: true,
          fields: [
            { name: 'ngayXuat', label: 'Ngày xuất bán', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'khốiLuong', label: 'Khối lượng (kg)', type: 'number' },
            { name: 'maLoSanPham', label: 'Mã lô sản phẩm', type: 'text', required: true },
            { name: 'nguoiMua', label: 'Tên/địa chỉ người mua', type: 'text' },
            { name: 'nguoiXuat', label: 'Người xuất bán (ký tên)', type: 'signature', required: true }
          ]
        }
      ]
    });

    await poultrySchema.save();
    console.log('VietGAHP Poultry Schema Biểu 1 updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createPoultrySchema();