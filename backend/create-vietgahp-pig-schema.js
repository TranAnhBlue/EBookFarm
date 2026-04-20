const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const createVietGAHPPigSchema = async () => {
  try {
    console.log('🐷 Tạo schema nhật ký chăn nuôi lợn thịt theo VietGAHP...');

    // Schema nhật ký chăn nuôi lợn theo VietGAHP chuẩn
    const vietgahpPigSchema = new FormSchema({
      name: 'Nhật ký chăn nuôi lợn thịt VietGAHP',
      description: 'Sổ nhật ký ghi chép chăn nuôi lợn theo tiêu chuẩn VietGAHP - Quyết định số 4653/QĐ-BNN-CN',
      category: 'channuoi',
      tables: [
        {
          tableName: 'Thông tin chung',
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaChiCoSo', label: 'Địa chỉ cơ sở', type: 'text', required: true },
            { name: 'tenNguoiGhiChep', label: 'Tên người ghi chép', type: 'text', required: true },
            { name: 'maSoHo', label: 'Mã số hộ', type: 'text', required: true },
            { name: 'hoTenToChucCaNhan', label: 'Họ và tên tổ chức/cá nhân', type: 'text', required: true },
            { name: 'diaDiemSanXuat', label: 'Địa điểm sản xuất', type: 'text', required: true },
            { name: 'luaChanNuoi', label: 'Lứa chăn nuôi', type: 'text', required: true },
            { name: 'tenChuongNuoi', label: 'Tên chuồng nuôi/khu vực', type: 'text', required: true },
            { name: 'thoiGianBatDauGhiChep', label: 'Thời gian bắt đầu ghi chép', type: 'date', required: true },
            { name: 'ngayNhapGiong', label: 'Ngày nhập giống', type: 'date', required: true },
            { name: 'tenGiong', label: 'Tên giống', type: 'text', required: true },
            { name: 'maSoLoGiong', label: 'Mã số lô giống', type: 'text', required: true },
            { name: 'muaTaiCoSo', label: 'Mua tại cơ sở', type: 'text', required: true },
            { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'ngayTuoi', label: 'Ngày tuổi', type: 'number', required: true },
            { name: 'trongLuongTrungBinh', label: 'Trọng lượng trung bình (kg/con)', type: 'number', required: true },
            { name: 'matDoNuoi', label: 'Mật độ nuôi (con/m²)', type: 'number', required: true },
            { name: 'phuongThucChanNuoi', label: 'Phương thức chăn nuôi', type: 'select', options: ['Nuôi nhốt', 'Nuôi bán thả', 'Nuôi thả'], required: true },
            { name: 'kieuChuongNuoi', label: 'Kiểu chuồng nuôi', type: 'select', options: ['Chuồng kín', 'Chuồng hở', 'Chuồng bán kín'], required: true },
            { name: 'dienTichChuongNuoi', label: 'Diện tích chuồng nuôi (m²)', type: 'number', required: true },
            { name: 'dienTichToanBo', label: 'Diện tích toàn bộ khu vực chăn nuôi (m²)', type: 'number', required: true },
            { name: 'soDoQuyHoach', label: 'Sơ đồ quy hoạch, đánh số từng ô/chuồng nuôi', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 1: Theo dõi mua/chuyển giống vào nuôi thương phẩm',
          fields: [
            { name: 'ngayThangMuaChuyenGiong', label: 'Ngày tháng mua/chuyển giống', type: 'date', required: true },
            { name: 'tenGiongMua', label: 'Tên giống', type: 'text', required: true },
            { name: 'maLoGiongMua', label: 'Mã lô giống', type: 'text', required: true },
            { name: 'soLuongConMua', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'tinhTrangToanDan', label: 'Tình trạng toàn đàn', type: 'select', options: ['Khỏe mạnh', 'Có bệnh', 'Yếu'], required: true },
            { name: 'tenNguoiCuaHang', label: 'Tên người/cửa hàng/đại lý và địa chỉ cơ sở sản xuất giống', type: 'text', required: true },
            { name: 'ngayTiem', label: 'Ngày tiêm', type: 'date', required: false },
            { name: 'loaiVaccin', label: 'Loại vaccin', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 2: Theo dõi nhập thức ăn/nguyên liệu thô',
          fields: [
            { name: 'ngayNhapThucAn', label: 'Ngày nhập TA/NL thô', type: 'date', required: true },
            { name: 'tenLoaiThucAn', label: 'Tên loại thức ăn, nguyên liệu thô', type: 'text', required: true },
            { name: 'kyHieu', label: 'Ký hiệu', type: 'text', required: true },
            { name: 'donVi', label: 'Đơn vị', type: 'select', options: ['kg', 'tấn', 'bao', 'thùng'], required: true },
            { name: 'soLuongThucAn', label: 'Số lượng', type: 'number', required: true },
            { name: 'tenNguoiBan', label: 'Tên người/cửa hàng/đại lý và địa chỉ nơi bán', type: 'text', required: true },
            { name: 'danhGiaCamQuan', label: 'Đánh giá cảm quan', type: 'select', options: ['Tốt', 'Trung bình', 'Kém'], required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 3: Theo dõi thông tin phối trộn thức ăn',
          fields: [
            { name: 'tuanTuoiThu', label: 'Tuần tuổi thứ', type: 'number', required: true },
            { name: 'tenLoaiThucAnPhoiTron', label: 'Tên loại thức ăn, nguyên liệu thô phối trộn', type: 'text', required: true },
            { name: 'maLoPhoiTron', label: 'Mã lô', type: 'text', required: true },
            { name: 'tyLePhoiTron', label: 'Tỷ lệ phối trộn (%)', type: 'number', required: true },
            { name: 'luongSuDungKgCon', label: 'Lượng sử dụng (kg/con)', type: 'number', required: true },
            { name: 'nguoiTron', label: 'Người trộn', type: 'text', required: true },
            { name: 'ghiChuPhoiTron', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 4: Theo dõi nhập thuốc thú y, vaccin, thuốc sát trùng, hóa chất',
          fields: [
            { name: 'ngayThangNamNhap', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenVaccinThuoc', label: 'Tên vaccin, thuốc, hóa chất', type: 'text', required: true },
            { name: 'maSoHanSuDung', label: 'Mã số/hạn sử dụng', type: 'text', required: true },
            { name: 'donViTinhThuoc', label: 'Đơn vị tính', type: 'select', options: ['lọ', 'chai', 'kg', 'g', 'ml', 'lít'], required: true },
            { name: 'soLuongThuoc', label: 'Số lượng', type: 'number', required: true },
            { name: 'tenDiaChiNhaCungCap', label: 'Tên và địa chỉ nhà cung cấp', type: 'text', required: true },
            { name: 'tenNguoiTheoDoiThuoc', label: 'Tên người theo dõi', type: 'text', required: true },
            { name: 'ghiChuThuoc', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 5: Theo dõi sử dụng thức ăn',
          fields: [
            { name: 'ngayThangNamSuDung', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'ngayTuoiThuSuDung', label: 'Ngày tuổi thứ', type: 'number', required: true },
            { name: 'oChuongNuoiSo', label: 'Ô/Chuồng nuôi số', type: 'text', required: true },
            { name: 'soLuongConSuDung', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'maLoTenLoaiThucAn', label: 'Mã lô/Tên loại thức ăn, nguyên liệu thô', type: 'text', required: true },
            { name: 'khoiLuongThucAnCungCap', label: 'Khối lượng thức ăn cung cấp (kg/ngày)', type: 'number', required: true },
            { name: 'nguoiTheoDoiThucAn', label: 'Người theo dõi', type: 'text', required: true },
            { name: 'ghiChuThucAn', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 6: Theo dõi sử dụng vaccin/thuốc điều trị bệnh',
          fields: [
            { name: 'ngayThangThucHien', label: 'Ngày tháng thực hiện', type: 'date', required: true },
            { name: 'ngayTuoiThuDieuTri', label: 'Ngày tuổi thứ', type: 'number', required: true },
            { name: 'noiDungThucHien', label: 'Nội dung thực hiện', type: 'select', options: ['Tiêm phòng', 'Điều trị bệnh', 'Tẩy giun', 'Khác'], required: true },
            { name: 'soLuongConDieuTri', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'tenVaccinThuocSuDung', label: 'Tên Vaccin/Thuốc sử dụng', type: 'text', required: true },
            { name: 'lieuLuongCachDung', label: 'Liều lượng/cách dùng', type: 'text', required: true },
            { name: 'soLuongLoaiThaiChet', label: 'Số lượng loại thải, chết (con)', type: 'number', required: false },
            { name: 'ghiChuDieuTri', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 7: Theo dõi sử dụng thuốc sát trùng',
          fields: [
            { name: 'ngayThangThucHienSatTrung', label: 'Ngày tháng thực hiện', type: 'date', required: true },
            { name: 'noiDungThucHienSatTrung', label: 'Nội dung thực hiện', type: 'select', options: ['Khử trùng chuồng', 'Khử trùng dụng cụ', 'Khử trùng môi trường', 'Khác'], required: true },
            { name: 'tenThuocSatTrung', label: 'Tên thuốc', type: 'text', required: true },
            { name: 'lieuLuongSatTrung', label: 'Liều lượng', type: 'text', required: true },
            { name: 'phuongPhapSatTrung', label: 'Phương pháp', type: 'select', options: ['Phun', 'Rắc', 'Ngâm', 'Khác'], required: true },
            { name: 'tenNguoiThucHienSatTrung', label: 'Tên người thực hiện', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 8: Theo dõi thu gom xử lý vật nuôi chết',
          fields: [
            { name: 'ngayThangNamXuLy', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'soLuongChet', label: 'Số lượng chết (con)', type: 'number', required: true },
            { name: 'chonCon', label: 'Chôn (con)', type: 'number', required: false },
            { name: 'dotCon', label: 'Đốt (con)', type: 'number', required: false },
            { name: 'phuongPhapKhac', label: 'Phương pháp khác', type: 'text', required: false },
            { name: 'tenNguoiXuLy', label: 'Tên người xử lý', type: 'text', required: true },
            { name: 'ghiChuXuLy', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 9: Theo dõi thu gom xử lý rác thải',
          fields: [
            { name: 'ngayThangThuGom', label: 'Ngày, tháng thu gom', type: 'date', required: true },
            { name: 'loaiRacThai', label: 'Loại rác thải', type: 'select', options: ['Rác hữu cơ', 'Rác vô cơ', 'Chất thải y tế', 'Khác'], required: true },
            { name: 'soLuongKg', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'soBaoThungChua', label: 'Số bao/thùng chứa', type: 'number', required: true },
            { name: 'noiTapKet', label: 'Nơi tập kết', type: 'text', required: true },
            { name: 'noiThuGomXuLy', label: 'Nơi thu gom xử lý', type: 'text', required: true },
            { name: 'benGiao', label: 'Bên giao (ký tên)', type: 'text', required: true },
            { name: 'benNhan', label: 'Bên nhận (ký tên)', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 10: Theo dõi diệt chuột và động vật gây hại',
          fields: [
            { name: 'ngayThangThucHienDietChuot', label: 'Ngày tháng thực hiện', type: 'date', required: true },
            { name: 'bienPhapApDung', label: 'Biện pháp áp dụng', type: 'select', options: ['Thuốc diệt chuột', 'Bẫy chuột', 'Mèo', 'Khác'], required: true },
            { name: 'ketQuaCon', label: 'Kết quả (con)', type: 'number', required: true },
            { name: 'nguoiThucHienDietChuot', label: 'Người thực hiện', type: 'text', required: true },
            { name: 'ghiChuDietChuot', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 11: Theo dõi lấy mẫu xét nghiệm',
          fields: [
            { name: 'ngayThangNamLayMau', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'mauXetNghiem', label: 'Mẫu xét nghiệm (máu, cả con, nội tạng)', type: 'select', options: ['Máu', 'Cả con', 'Nội tạng', 'Phân', 'Khác'], required: true },
            { name: 'lyDoGuiXetNghiem', label: 'Lý do gửi xét nghiệm', type: 'text', required: true },
            { name: 'noiGuiXetNghiem', label: 'Nơi gửi xét nghiệm', type: 'text', required: true },
            { name: 'ketLuanCoQuanXetNghiem', label: 'Kết luận của cơ quan xét nghiệm', type: 'text', required: false },
            { name: 'tenNguoiLayMau', label: 'Tên người lấy mẫu', type: 'text', required: true },
            { name: 'ghiChuLayMau', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 12: Theo dõi tiêu thụ, xuất bán',
          fields: [
            { name: 'ngayThuHoach', label: 'Ngày thu hoạch', type: 'date', required: true },
            { name: 'tenSanPham', label: 'Tên sản phẩm', type: 'text', required: true },
            { name: 'tongKhoiLuongThu', label: 'Tổng khối lượng thu (kg)', type: 'number', required: true },
            { name: 'tongKhoiLuongXuatBan', label: 'Tổng khối lượng xuất bán (kg)', type: 'number', required: true },
            { name: 'maSoLoXuatBan', label: 'Mã số lô xuất bán', type: 'text', required: true },
            { name: 'tenDiaChiBenMua', label: 'Tên/địa chỉ bên mua', type: 'text', required: true },
            { name: 'tenNguoiXuatBan', label: 'Tên người xuất bán', type: 'text', required: true }
          ]
        }
      ]
    });

    // Lưu schema
    await vietgahpPigSchema.save();
    console.log('✅ Đã tạo thành công schema nhật ký chăn nuôi lợn VietGAHP');
    console.log('📋 Schema ID:', vietgahpPigSchema._id);
    console.log('📊 Số bảng:', vietgahpPigSchema.tables.length);
    
    // Hiển thị thông tin các bảng
    vietgahpPigSchema.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tableName} (${table.fields.length} trường)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo schema:', error);
    process.exit(1);
  }
};

createVietGAHPPigSchema();