const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const createCattleSchema = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const schemaName = 'Bò';
    await FormSchema.deleteMany({ name: schemaName });

    const cattleSchema = new FormSchema({
      name: schemaName,
      description: 'Sổ nhật ký điện tử chăn nuôi bò thịt/bò giống theo tiêu chuẩn VietGAHP.',
      category: 'channuoi',
      tables: [
        {
          tableName: 'Thông tin chung',
          isMultiRow: false,
          fields: [
            { name: 'tenChuHo', label: 'Họ và tên tổ chức/cá nhân chăn nuôi', type: 'text', required: true },
            { name: 'diaChi', label: 'Địa chỉ (Thôn/Xã/Huyện/Tỉnh)', type: 'text', required: true },
            { name: 'ngayNhapBo', label: 'Ngày nhập bò con', type: 'date', required: true },
            { name: 'tenGiongBo', label: 'Tên giống bò', type: 'text', required: true },
            { name: 'coSoCungCap', label: 'Mua tại cơ sở', type: 'text' },
            { name: 'soLuongCon', label: 'Số lượng con', type: 'number', required: true },
            { name: 'maSoLoBo', label: 'Mã số lô bò con', type: 'text', required: true },
            { name: 'trongLuongTB', label: 'Trọng lượng trung bình (kg/con)', type: 'number' },
            { name: 'oChuongSo', label: 'Ô/Chuồng nuôi số', type: 'text' },
            { name: 'matDoNuoi', label: 'Mật độ nuôi', type: 'text' },
            { name: 'dienTichChuong', label: 'Diện tích chuồng nuôi (m2)', type: 'number' },
            { name: 'dienTichKhuVuc', label: 'Diện tích toàn bộ khu vực chăn nuôi (m2)', type: 'number' }
          ]
        },
        {
          tableName: 'BIỂU 1: LÝ LỊCH GIỐNG',
          isMultiRow: false,
          fields: [
            { name: 'soHieu', label: 'Số hiệu con giống', type: 'text', required: true },
            { name: 'capGiong', label: 'Cấp giống', type: 'text' },
            { name: 'gioiTinh', label: 'Giới tính', type: 'select', options: ['Đực', 'Cái'] },
            { name: 'ngaySinh', label: 'Ngày, tháng, năm sinh', type: 'date' },
            { name: 'noiSinh', label: 'Nơi sinh', type: 'text' },
            { name: 'huyetThongBo', label: 'Thông tin Bố (Số hiệu/Cấp giống)', type: 'text' },
            { name: 'huyetThongMe', label: 'Thông tin Mẹ (Số hiệu/Cấp giống)', type: 'text' },
            { name: 'ongBaNoi', label: 'Huyết thống Ông/Bà nội', type: 'text' },
            { name: 'ongBaNgoai', label: 'Huyết thống Ông/Bà ngoại', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 2: MUA BÒ THỊT GIỐNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenGiong', label: 'Tên giống', type: 'text', required: true },
            { name: 'soHieu', label: 'Số hiệu', type: 'text' },
            { name: 'coSoBan', label: 'Cơ sở bán và địa chỉ', type: 'text' },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 3: THEO DÕI SINH TRƯỞNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'khoiLuongTB', label: 'Khối lượng trung bình (kg/con)', type: 'number', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'tongKhoiLuong', label: 'Tổng khối lượng bò (kg)', type: 'number' },
            { name: 'luongThucAn', label: 'Lượng thức ăn sử dụng (kg)', type: 'number' },
            { name: 'nguoiCan', label: 'Người phụ trách cân', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 4: MUA THỨC ĂN. CHẤT BỔ SUNG THỨC ĂN',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenThucAn', label: 'Tên thức ăn, chất bổ sung', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'donGia', label: 'Đơn giá (Đồng/kg)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng/đại lý bán', type: 'text' },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 5: SỬ DỤNG THỨC ĂN',
          isMultiRow: true,
          fields: [
            { name: 'ngay', label: 'Ngày', type: 'date', required: true },
            { name: 'loaiThucAn', label: 'Loại thức ăn', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'doiTuong', label: 'Đối tượng bò sử dụng', type: 'text' },
            { name: 'nguoiChoAn', label: 'Người phụ trách cho ăn', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 6: QUẢN LÝ DỊCH BỆNH',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'doiTuong', label: 'Đối tượng', type: 'text' },
            { name: 'loaiBenh', label: 'Loại dịch bệnh', type: 'text', required: true },
            { name: 'mucDo', label: 'Mức độ', type: 'select', options: ['Nhẹ', 'Trung bình', 'Nặng'] },
            { name: 'keHoach', label: 'Kế hoạch phòng và trị bệnh', type: 'text' },
            { name: 'tinhTrang', label: 'Tình trạng đàn sau xử lý', type: 'text' },
            { name: 'nguoiPhuTrach', label: 'Người phụ trách dịch bệnh', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 7: MUA THUỐC THÚ Y VÀ VACCIN',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenThuoc', label: 'Tên thuốc/Vaccin', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (gói/hộp/kg)', type: 'text', required: true },
            { name: 'donGia', label: 'Đơn giá (VNĐ)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng, đại lý', type: 'text' },
            { name: 'hangSanXuat', label: 'Tên hãng sản xuất', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 8: SỬ DỤNG THUỐC THÚ Y',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'loaiThuoc', label: 'Loại thuốc sử dụng', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (ml/lít/kg)', type: 'text', required: true },
            { name: 'loaiBenh', label: 'Loại bệnh điều trị', type: 'text' },
            { name: 'doiTuong', label: 'Đối tượng bò điều trị', type: 'text' },
            { name: 'nguoiDieuTri', label: 'Người điều trị', type: 'text' }
          ]
        },
        {
          tableName: 'BIỂU 9: ĐÀO TẠO, TẬP HUẤN',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'nguoiThamGia', label: 'Người tham gia tập huấn', type: 'text' },
            { name: 'noiDung', label: 'Nội dung tập huấn', type: 'text', required: true },
            { name: 'donViToChuc', label: 'Đơn vị, tổ chức, địa chỉ', type: 'text' },
            { name: 'nguoiTapHuan', label: 'Người tập huấn', type: 'text' }
          ]
        }
      ]
    });

    await cattleSchema.save();
    console.log('VietGAHP Cattle Schema restored with full names successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createCattleSchema();
