const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const updateAllLivestockSchemasToVietGAHP = async () => {
  try {
    console.log('🐷 Cập nhật tất cả schemas chăn nuôi thành format VietGAHP chuẩn...');

    // Lấy tất cả schemas chăn nuôi (category: 'channuoi')
    const livestockSchemas = await FormSchema.find({ 
      category: { $in: ['channuoi', 'huuco_channuoi'] }
    });

    console.log(`📋 Tìm thấy ${livestockSchemas.length} schemas chăn nuôi cần cập nhật:`);
    
    livestockSchemas.forEach((schema, index) => {
      console.log(`   ${index + 1}. ${schema.name} (${schema.category})`);
    });

    // Template VietGAHP chuẩn cho tất cả chăn nuôi (có thể điều chỉnh theo từng loại)
    const vietgahpTables = [
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
        tableName: 'Theo dõi mua/chuyển giống',
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
        tableName: 'Theo dõi nhập thức ăn/nguyên liệu',
        fields: [
          { name: 'ngayNhapThucAn', label: 'Ngày nhập thức ăn/nguyên liệu', type: 'date', required: true },
          { name: 'tenLoaiThucAn', label: 'Tên loại thức ăn, nguyên liệu', type: 'text', required: true },
          { name: 'kyHieu', label: 'Ký hiệu', type: 'text', required: true },
          { name: 'donVi', label: 'Đơn vị', type: 'select', options: ['kg', 'tấn', 'bao', 'thùng'], required: true },
          { name: 'soLuongThucAn', label: 'Số lượng', type: 'number', required: true },
          { name: 'tenNguoiBan', label: 'Tên người/cửa hàng/đại lý và địa chỉ nơi bán', type: 'text', required: true },
          { name: 'danhGiaCamQuan', label: 'Đánh giá cảm quan', type: 'select', options: ['Tốt', 'Trung bình', 'Kém'], required: true },
          { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
        ]
      },
      {
        tableName: 'Theo dõi sử dụng thức ăn',
        fields: [
          { name: 'ngayThangNamSuDung', label: 'Ngày, tháng, năm', type: 'date', required: true },
          { name: 'ngayTuoiThuSuDung', label: 'Ngày tuổi thứ', type: 'number', required: true },
          { name: 'oChuongNuoiSo', label: 'Ô/Chuồng nuôi số', type: 'text', required: true },
          { name: 'soLuongConSuDung', label: 'Số lượng (con)', type: 'number', required: true },
          { name: 'maLoTenLoaiThucAn', label: 'Mã lô/Tên loại thức ăn, nguyên liệu', type: 'text', required: true },
          { name: 'khoiLuongThucAnCungCap', label: 'Khối lượng thức ăn cung cấp (kg/ngày)', type: 'number', required: true },
          { name: 'nguoiTheoDoiThucAn', label: 'Người theo dõi', type: 'text', required: true },
          { name: 'ghiChuThucAn', label: 'Ghi chú', type: 'text', required: false }
        ]
      },
      {
        tableName: 'Theo dõi nhập thuốc thú y, vaccin',
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
        tableName: 'Theo dõi sử dụng vaccin/thuốc điều trị',
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
        tableName: 'Theo dõi vệ sinh và khử trùng',
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
        tableName: 'Theo dõi xử lý vật nuôi chết và rác thải',
        fields: [
          { name: 'ngayThangNamXuLy', label: 'Ngày, tháng, năm', type: 'date', required: true },
          { name: 'soLuongChet', label: 'Số lượng chết (con)', type: 'number', required: false },
          { name: 'phuongPhapXuLyChet', label: 'Phương pháp xử lý vật chết', type: 'select', options: ['Chôn', 'Đốt', 'Khác'], required: false },
          { name: 'loaiRacThai', label: 'Loại rác thải', type: 'select', options: ['Rác hữu cơ', 'Rác vô cơ', 'Chất thải y tế', 'Khác'], required: false },
          { name: 'soLuongRacThai', label: 'Số lượng rác thải (kg)', type: 'number', required: false },
          { name: 'phuongPhapXuLyRac', label: 'Phương pháp xử lý rác', type: 'text', required: false },
          { name: 'tenNguoiXuLy', label: 'Tên người xử lý', type: 'text', required: true },
          { name: 'ghiChuXuLy', label: 'Ghi chú', type: 'text', required: false }
        ]
      },
      {
        tableName: 'Theo dõi tiêu thụ, xuất bán',
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
    ];

    console.log('\n🔄 Bắt đầu cập nhật...\n');

    let updatedCount = 0;
    
    for (const schema of livestockSchemas) {
      try {
        // Cập nhật schema với tables VietGAHP chuẩn
        await FormSchema.findByIdAndUpdate(schema._id, {
          $set: {
            tables: vietgahpTables,
            description: `${schema.description} - Cập nhật theo tiêu chuẩn VietGAHP với đầy đủ các biểu theo dõi`
          }
        });
        
        console.log(`✅ Đã cập nhật: ${schema.name}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Lỗi cập nhật ${schema.name}:`, error.message);
      }
    }

    console.log(`\n🎯 Hoàn thành! Đã cập nhật ${updatedCount}/${livestockSchemas.length} schemas`);
    console.log('\n📋 Tất cả schemas chăn nuôi giờ đã có:');
    console.log('   1. Thông tin chung (22 trường)');
    console.log('   2. Theo dõi mua/chuyển giống (8 trường)');
    console.log('   3. Theo dõi nhập thức ăn/nguyên liệu (8 trường)');
    console.log('   4. Theo dõi sử dụng thức ăn (8 trường)');
    console.log('   5. Theo dõi nhập thuốc thú y, vaccin (8 trường)');
    console.log('   6. Theo dõi sử dụng vaccin/thuốc điều trị (8 trường)');
    console.log('   7. Theo dõi vệ sinh và khử trùng (6 trường)');
    console.log('   8. Theo dõi xử lý vật nuôi chết và rác thải (8 trường)');
    console.log('   9. Theo dõi tiêu thụ, xuất bán (7 trường)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

updateAllLivestockSchemasToVietGAHP();