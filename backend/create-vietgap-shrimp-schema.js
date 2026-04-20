const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const createVietGAPShrimpSchema = async () => {
  try {
    console.log('🦐 Tạo schema nhật ký nuôi tôm theo VietGAP...');

    // Schema nhật ký nuôi tôm theo VietGAP chuẩn
    const vietgapShrimpSchema = new FormSchema({
      name: 'Nhật ký nuôi tôm VietGAP',
      description: 'Sổ nhật ký nuôi tôm theo tiêu chuẩn VietGAP thủy sản',
      category: 'thuyssan',
      tables: [
        {
          tableName: 'Thông tin chung',
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaChiCoSo', label: 'Địa chỉ cơ sở', type: 'text', required: true },
            { name: 'hoTenToChucCaNhan', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
            { name: 'maSoHo', label: 'Mã số hộ', type: 'text', required: true },
            { name: 'dienTich', label: 'Diện tích (ha)', type: 'number', required: true },
            { name: 'tenGiong', label: 'Tên giống tôm', type: 'text', required: true },
            { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text', required: true },
            { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number', required: true },
            { name: 'soDoAoHo', label: 'Sơ đồ ao/hồ nuôi kèm theo', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 1: Thông tin chung',
          fields: [
            { name: 'aoNuoiSo', label: 'Ao nuôi số', type: 'text', required: true },
            { name: 'dienTichAo', label: 'Diện tích ao (ha)', type: 'number', required: true },
            { name: 'tenGiongTom', label: 'Tên giống tôm', type: 'select', options: ['Tôm sú', 'Tôm chân trắng', 'Tôm càng xanh', 'Tôm he', 'Khác'], required: true },
            { name: 'doSau', label: 'Độ sâu (m)', type: 'number', required: true },
            { name: 'ngayThaGiong', label: 'Ngày thả giống', type: 'date', required: true },
            { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'coTom', label: 'Cỡ tôm (gram)', type: 'number', required: true },
            { name: 'matDoTha', label: 'Mật độ thả (con/m²)', type: 'number', required: true },
            { name: 'tongLuongGiongTha', label: 'Tổng lượng giống thả (kg)', type: 'number', required: true },
            { name: 'tenDiaChiCoSoCungCap', label: 'Tên/Địa chỉ cơ sở cung cấp giống', type: 'text', required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 2: Thông tin cải tạo ao nuôi',
          fields: [
            { name: 'thoiGianCaiTaoBatDau', label: 'Thời gian cải tạo bắt đầu', type: 'date', required: true },
            { name: 'thoiGianCaiTaoKetThuc', label: 'Thời gian cải tạo kết thúc', type: 'date', required: true },
            { name: 'moTaQuyTrinhCaiTao', label: 'Mô tả tóm tắt quy trình cải tạo', type: 'text', required: true },
            { name: 'tenHoaChat', label: 'Tên hóa chất đã sử dụng', type: 'text', required: false },
            { name: 'soLuongHoaChat', label: 'Số lượng hóa chất (g/kg/ml/lít)', type: 'text', required: false },
            { name: 'phuongPhapSuDungHoaChat', label: 'Phương pháp sử dụng hóa chất', type: 'select', options: ['Rắc trực tiếp', 'Pha loãng', 'Phun', 'Khác'], required: false },
            { name: 'cachThuGomXuLyBun', label: 'Cách thu gom xử lý bùn', type: 'text', required: true },
            { name: 'noiChuaBun', label: 'Nơi chứa bùn', type: 'text', required: true },
            { name: 'khoiLuongBunThai', label: 'Khối lượng bùn thải (m³)', type: 'number', required: true },
            { name: 'pHSauCaiTao', label: 'pH sau khi cải tạo', type: 'number', required: true },
            { name: 'oxySauCaiTao', label: 'Oxy sau khi cải tạo (mg/l)', type: 'number', required: true },
            { name: 'nh3SauCaiTao', label: 'NH3 sau khi cải tạo (mg/l)', type: 'number', required: true },
            { name: 'nhietDoSauCaiTao', label: 'Nhiệt độ sau khi cải tạo (°C)', type: 'number', required: true },
            { name: 'cacChatDocKhac', label: 'Các chất độc khác', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 3: Theo dõi nhập thức ăn',
          fields: [
            { name: 'ngayThangNhapThucAn', label: 'Ngày tháng nhập', type: 'date', required: true },
            { name: 'tenLoaiThucAn', label: 'Tên loại thức ăn', type: 'text', required: true },
            { name: 'soLuongKg', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'soLo', label: 'Số lô', type: 'text', required: true },
            { name: 'ngaySanXuat', label: 'Ngày sản xuất', type: 'date', required: true },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date', required: true },
            { name: 'tenDiaChiCongTySanXuat', label: 'Tên/Địa chỉ công ty sản xuất', type: 'text', required: true },
            { name: 'nguoiTheoDoiNhapThucAn', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 4: Theo dõi sử dụng thức ăn',
          fields: [
            { name: 'ngaySuDung', label: 'Ngày sử dụng', type: 'date', required: true },
            { name: 'trongLuongTom', label: 'Trọng lượng tôm (g)', type: 'number', required: true },
            { name: 'maSoThucAn', label: 'Mã số thức ăn', type: 'text', required: true },
            { name: 'doDamThucAn', label: 'Độ đạm thức ăn (%)', type: 'number', required: true },
            { name: 'tongKgThucAn', label: 'Tổng thức ăn (kg)', type: 'number', required: true },
            { name: 'thayNuocM3', label: 'Thay nước (m³)', type: 'number', required: false },
            { name: 'doMan', label: 'Độ mặn (‰)', type: 'number', required: true },
            { name: 'doTrong', label: 'Độ trong (cm)', type: 'number', required: true },
            { name: 'nhietDo', label: 'Nhiệt độ (°C)', type: 'number', required: true },
            { name: 'pH', label: 'pH', type: 'number', required: true },
            { name: 'oxy', label: 'Oxy (mg/l)', type: 'number', required: true },
            { name: 'doKem', label: 'Độ kiềm (mg/l)', type: 'number', required: false },
            { name: 'nh3', label: 'NH3 (mg/l)', type: 'number', required: false },
            { name: 'h2s', label: 'H2S (mg/l)', type: 'number', required: false },
            { name: 'no2', label: 'NO2 (mg/l)', type: 'number', required: false },
            { name: 'tenHoaChatSuDung', label: 'Tên hóa chất sử dụng', type: 'text', required: false },
            { name: 'lyDoSuDungHoaChat', label: 'Lý do dùng hóa chất', type: 'select', options: ['Xử lý nước', 'Diệt khuẩn', 'Tăng oxy', 'Điều chỉnh pH', 'Khác'], required: false },
            { name: 'soLuongHoaChatSuDung', label: 'Số lượng hóa chất', type: 'text', required: false },
            { name: 'thoiGianCachLy', label: 'Thời gian cách ly (ngày)', type: 'number', required: false },
            { name: 'tinhTrangTom', label: 'Tình trạng tôm', type: 'select', options: ['Bình thường', 'Yếu', 'Có bệnh', 'Chết'], required: true },
            { name: 'tomChet', label: 'Tôm chết (con)', type: 'number', required: false },
            { name: 'nguoiTheoDoiSuDung', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 5: Theo dõi nhập thuốc/hóa chất/sản phẩm xử lý cải tạo môi trường',
          fields: [
            { name: 'ngayThangNhapThuoc', label: 'Ngày tháng nhập', type: 'date', required: true },
            { name: 'tenThuocHoaChatSanPham', label: 'Tên thuốc/hóa chất/sản phẩm xử lý cải tạo môi trường', type: 'text', required: true },
            { name: 'soLuongKgThuoc', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'soLoThuoc', label: 'Số lô', type: 'text', required: true },
            { name: 'ngaySanXuatThuoc', label: 'Ngày sản xuất', type: 'date', required: true },
            { name: 'hanSuDungThuoc', label: 'Hạn sử dụng', type: 'date', required: true },
            { name: 'tenDiaChiCongTySanXuatThuoc', label: 'Tên/Địa chỉ công ty sản xuất', type: 'text', required: true },
            { name: 'nguoiTheoDoiNhapThuoc', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 6: Theo dõi điều trị bệnh',
          fields: [
            { name: 'ngayDieuTri', label: 'Ngày điều trị', type: 'date', required: true },
            { name: 'loaiBenh', label: 'Loại bệnh', type: 'select', options: ['Bệnh đốm trắng', 'Bệnh hoại tử gan tụy cấp', 'Bệnh đầu vàng', 'Bệnh vi khuẩn', 'Bệnh nấm', 'Khác'], required: true },
            { name: 'tenThuocDieuTri', label: 'Tên thuốc', type: 'text', required: true },
            { name: 'cachDieuTri', label: 'Cách điều trị', type: 'select', options: ['Trộn thức ăn', 'Tắm thuốc', 'Rắc trực tiếp', 'Pha nước', 'Khác'], required: true },
            { name: 'ketQuaSauKhiTriBenh', label: 'Kết quả sau khi trị bệnh', type: 'select', options: ['Khỏi hoàn toàn', 'Giảm bệnh', 'Không hiệu quả', 'Tái phát'], required: true },
            { name: 'nguoiDieuTri', label: 'Người điều trị', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 7: Theo dõi thu hoạch',
          fields: [
            { name: 'ngayThuHoach', label: 'Ngày thu hoạch', type: 'date', required: true },
            { name: 'khoiLuongKg', label: 'Khối lượng (kg)', type: 'number', required: true },
            { name: 'coTomThuHoach', label: 'Cỡ tôm (g/con)', type: 'number', required: true },
            { name: 'tenDiaChiDonViThuMua', label: 'Tên/Địa chỉ đơn vị thu mua', type: 'text', required: true },
            { name: 'dieuKienVeSinhSot', label: 'Điều kiện vệ sinh - Sọt/Thùng chứa', type: 'select', options: ['Sạch sẽ', 'Đạt yêu cầu', 'Cần cải thiện'], required: true },
            { name: 'dieuKienVeSinhLuoiKeo', label: 'Điều kiện vệ sinh - Lưới kéo', type: 'select', options: ['Sạch sẽ', 'Đạt yêu cầu', 'Cần cải thiện'], required: true },
            { name: 'nguoiTheoDoiThuHoach', label: 'Người theo dõi', type: 'text', required: true },
            { name: 'congNhanThuHoach', label: 'Công nhân thu hoạch', type: 'text', required: true }
          ]
        }
      ]
    });

    // Lưu schema
    await vietgapShrimpSchema.save();
    console.log('✅ Đã tạo thành công schema nhật ký nuôi tôm VietGAP');
    console.log('📋 Schema ID:', vietgapShrimpSchema._id);
    console.log('📊 Số bảng:', vietgapShrimpSchema.tables.length);
    
    // Hiển thị thông tin các bảng
    vietgapShrimpSchema.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tableName} (${table.fields.length} trường)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo schema:', error);
    process.exit(1);
  }
};

createVietGAPShrimpSchema();