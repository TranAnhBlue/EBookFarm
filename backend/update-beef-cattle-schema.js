const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const updateBeefCattleSchema = async () => {
  try {
    console.log('🐄 Cập nhật schema Bò thịt theo form VietGAHP mới...');

    // Schema nhật ký chăn nuôi bò thịt theo form chuẩn VietGAHP
    const beefCattleSchema = {
      name: 'Bò thịt',
      description: 'Nhật ký chăn nuôi bò thịt - Theo tiêu chuẩn VietGAHP với 6 biểu đầy đủ',
      category: 'channuoi',
      tables: [
        {
          tableName: 'Biểu 1: Lý lịch giống',
          fields: [
            // Thông tin con giống
            { name: 'soHieuConGiong', label: 'Số hiệu con giống', type: 'text', required: true },
            { name: 'capGiongCon', label: 'Cấp giống con', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: true },
            { name: 'gioiTinhCon', label: 'Giới tính con', type: 'select', options: ['Đực', 'Cái'], required: true },
            { name: 'ngaySinhCon', label: 'Ngày, tháng, năm sinh con', type: 'date', required: true },
            { name: 'noiSinhCon', label: 'Nơi sinh con', type: 'text', required: true },
            
            // Huyết thống - Bố
            { name: 'tenBo', label: 'Tên bố', type: 'text', required: false },
            { name: 'soHieuBo', label: 'Số hiệu bố', type: 'text', required: false },
            { name: 'capGiongBo', label: 'Cấp giống bố', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: false },
            
            // Huyết thống - Mẹ
            { name: 'tenMe', label: 'Tên mẹ', type: 'text', required: false },
            { name: 'soHieuMe', label: 'Số hiệu mẹ', type: 'text', required: false },
            { name: 'capGiongMe', label: 'Cấp giống mẹ', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: false },
            
            // Huyết thống - Ông nội
            { name: 'tenOngNoi', label: 'Tên ông nội', type: 'text', required: false },
            { name: 'soHieuOngNoi', label: 'Số hiệu ông nội', type: 'text', required: false },
            { name: 'capGiongOngNoi', label: 'Cấp giống ông nội', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: false },
            
            // Huyết thống - Bà nội
            { name: 'tenBaNoi', label: 'Tên bà nội', type: 'text', required: false },
            { name: 'soHieuBaNoi', label: 'Số hiệu bà nội', type: 'text', required: false },
            { name: 'capGiongBaNoi', label: 'Cấp giống bà nội', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: false },
            
            // Huyết thống - Ông ngoại
            { name: 'tenOngNgoai', label: 'Tên ông ngoại', type: 'text', required: false },
            { name: 'soHieuOngNgoai', label: 'Số hiệu ông ngoại', type: 'text', required: false },
            { name: 'capGiongOngNgoai', label: 'Cấp giống ông ngoại', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: false },
            
            // Huyết thống - Bà ngoại
            { name: 'tenBaNgoai', label: 'Tên bà ngoại', type: 'text', required: false },
            { name: 'soHieuBaNgoai', label: 'Số hiệu bà ngoại', type: 'text', required: false },
            { name: 'capGiongBaNgoai', label: 'Cấp giống bà ngoại', type: 'select', options: ['Ông bà', 'Bố mẹ', 'F1', 'F2', 'F3', 'Khác'], required: false }
          ]
        },
        {
          tableName: 'Biểu 2: Ghi chép mua/chuyển bò thịt giống vào nuôi thương phẩm',
          fields: [
            { name: 'ngayThangNam', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenGiong', label: 'Tên giống', type: 'select', options: ['Bò Brahman', 'Bò Sind', 'Bò Lai Sind', 'Bò Zebu', 'Bò Lai F1', 'Bò Lai F2', 'Bò Việt Nam', 'Khác'], required: true },
            { name: 'soHieu', label: 'Số hiệu', type: 'text', required: true },
            { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'coSoBanVaDiaChi', label: 'Cơ sở bán và địa chỉ', type: 'text', required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 3: Theo dõi sinh trưởng',
          fields: [
            { name: 'ngayThangNam', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'khoiLuongTrungBinhConKg', label: 'Khối lượng trung bình (con/kg)', type: 'number', required: true },
            { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'tongKhoiLuongBoKg', label: 'Tổng khối lượng bò (kg)', type: 'number', required: true },
            { name: 'luongThucAnSuDungKg', label: 'Lượng thức ăn sử dụng (kg)', type: 'number', required: true },
            { name: 'nguoiPhuTrachCan', label: 'Người phụ trách cân', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 4: Theo dõi mua thức ăn & chất bổ sung thức ăn',
          fields: [
            { name: 'ngayThangNam', label: 'Ngày/tháng/năm', type: 'date', required: true },
            { name: 'tenThucAnChatBoSung', label: 'Tên thức ăn, chất bổ sung thức ăn', type: 'select', options: ['Cỏ tươi', 'Cỏ khô', 'Rơm rạ', 'Cám gạo', 'Bột ngô', 'Bột đậu tương', 'Bột cá', 'Premix vitamin', 'Muối khoáng', 'Khác'], required: true },
            { name: 'soLuongKg', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'donGiaDongKg', label: 'Đơn giá (Đồng/kg)', type: 'number', required: true },
            { name: 'tenNguoiCuaHangDaiLyVaDiaChi', label: 'Tên người/cửa hàng/đại lý và địa chỉ bán hàng', type: 'text', required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 5: Theo dõi phối trộn thức ăn (Tỷ lệ phối trộn)',
          fields: [
            { name: 'coRomCayKhacPhanTram', label: 'Cỏ + Rơm + cây khác (%)', type: 'number', required: true },
            { name: 'botCamGaoNgoPhanTram', label: 'Bột cám gạo + Ngô (%)', type: 'number', required: true },
            { name: 'botCayLacPhanTram', label: 'Bột cây lạc (%)', type: 'number', required: false },
            { name: 'botDauXanhPhanTram', label: 'Bột đậu xanh (%)', type: 'number', required: false },
            { name: 'nguoiPhuTrachPhoiTron', label: 'Người phụ trách phối trộn', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 6: Theo dõi sử dụng thức ăn',
          fields: [
            { name: 'ngayThangNam', label: 'Ngày/tháng/năm', type: 'date', required: true },
            { name: 'loaiThucAn', label: 'Loại thức ăn', type: 'select', options: ['Cỏ tươi', 'Cỏ khô', 'Rơm rạ', 'Thức ăn hỗn hợp', 'Cám gạo', 'Bột ngô', 'Thức ăn công nghiệp', 'Khác'], required: true },
            { name: 'soLuongKg', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'doiTuongBoSuDung', label: 'Đối tượng bò sử dụng', type: 'select', options: ['Bò con (dưới 6 tháng)', 'Bò tơ (6-12 tháng)', 'Bò thịt (12-24 tháng)', 'Bò giống', 'Tất cả đàn'], required: true },
            { name: 'nguoiPhuTrachChoAn', label: 'Người phụ trách cho ăn', type: 'text', required: true }
          ]
        }
      ]
    };

    // Tìm schema "Bò thịt" hiện có để cập nhật
    const existingSchema = await FormSchema.findOne({ name: 'Bò thịt', category: 'channuoi' });
    
    if (existingSchema) {
      // Cập nhật schema hiện có
      await FormSchema.findByIdAndUpdate(existingSchema._id, beefCattleSchema);
      console.log('✅ Đã cập nhật schema "Bò thịt" hiện có');
      console.log('📋 Schema ID:', existingSchema._id);
    } else {
      // Tạo schema mới nếu chưa có
      const newSchema = new FormSchema(beefCattleSchema);
      await newSchema.save();
      console.log('✅ Đã tạo schema "Bò thịt" mới');
      console.log('📋 Schema ID:', newSchema._id);
    }
    
    console.log('📊 Số biểu:', beefCattleSchema.tables.length);
    
    // Hiển thị thông tin các biểu
    beefCattleSchema.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tableName} (${table.fields.length} trường)`);
    });

    console.log('\n🔍 Các trường chính:');
    console.log('   - Lý lịch giống: Số hiệu, cấp giống, huyết thống đầy đủ');
    console.log('   - Mua/chuyển giống: Theo dõi nguồn gốc bò giống');
    console.log('   - Sinh trưởng: Cân đo định kỳ, theo dõi tăng trọng');
    console.log('   - Mua thức ăn: Quản lý nguồn cung cấp thức ăn');
    console.log('   - Phối trộn: Tỷ lệ dinh dưỡng hợp lý');
    console.log('   - Sử dụng thức ăn: Theo dõi khẩu phần hàng ngày');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật schema:', error);
    process.exit(1);
  }
};

updateBeefCattleSchema();