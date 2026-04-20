const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const updateAllAquacultureSchemasToVietGAP = async () => {
  try {
    console.log('🦐 Cập nhật tất cả schema thủy sản sang VietGAP...');

    // Tìm tất cả schema thuộc category 'thuyssan'
    const aquacultureSchemas = await FormSchema.find({ category: 'thuyssan' });
    console.log(`📋 Tìm thấy ${aquacultureSchemas.length} schema thủy sản`);

    if (aquacultureSchemas.length === 0) {
      console.log('❌ Không tìm thấy schema thủy sản nào để cập nhật');
      process.exit(0);
    }

    // Schema VietGAP chuẩn cho thủy sản
    const vietgapTables = [
      {
        tableName: 'Thông tin chung',
        fields: [
          { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
          { name: 'diaChiCoSo', label: 'Địa chỉ cơ sở', type: 'text', required: true },
          { name: 'hoTenToChucCaNhan', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
          { name: 'maSoHo', label: 'Mã số hộ', type: 'text', required: true },
          { name: 'dienTich', label: 'Diện tích (ha)', type: 'number', required: true },
          { name: 'tenGiong', label: 'Tên giống thủy sản', type: 'text', required: true },
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
          { name: 'tenGiongThuySan', label: 'Tên giống thủy sản', type: 'select', options: ['Tôm sú', 'Tôm chân trắng', 'Cá tra', 'Cá rô phi', 'Cua biển', 'Khác'], required: true },
          { name: 'doSau', label: 'Độ sâu (m)', type: 'number', required: true },
          { name: 'ngayThaGiong', label: 'Ngày thả giống', type: 'date', required: true },
          { name: 'soLuongCon', label: 'Số lượng (con)', type: 'number', required: true },
          { name: 'coThuySan', label: 'Cỡ thủy sản (gram)', type: 'number', required: true },
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
          { name: 'trongLuongThuySan', label: 'Trọng lượng thủy sản (g)', type: 'number', required: true },
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
          { name: 'tinhTrangThuySan', label: 'Tình trạng thủy sản', type: 'select', options: ['Bình thường', 'Yếu', 'Có bệnh', 'Chết'], required: true },
          { name: 'thuySanChet', label: 'Thủy sản chết (con)', type: 'number', required: false },
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
          { name: 'loaiBenh', label: 'Loại bệnh', type: 'select', options: ['Bệnh đốm trắng', 'Bệnh hoại tử gan tụy cấp', 'Bệnh đầu vàng', 'Bệnh vi khuẩn', 'Bệnh nấm', 'Bệnh ký sinh trùng', 'Khác'], required: true },
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
          { name: 'coThuySanThuHoach', label: 'Cỡ thủy sản (g/con)', type: 'number', required: true },
          { name: 'tenDiaChiDonViThuMua', label: 'Tên/Địa chỉ đơn vị thu mua', type: 'text', required: true },
          { name: 'dieuKienVeSinhDungCu', label: 'Điều kiện vệ sinh - Dụng cụ thu hoạch', type: 'select', options: ['Sạch sẽ', 'Đạt yêu cầu', 'Cần cải thiện'], required: true },
          { name: 'dieuKienVeSinhBaoGoi', label: 'Điều kiện vệ sinh - Bao gói/Thùng chứa', type: 'select', options: ['Sạch sẽ', 'Đạt yêu cầu', 'Cần cải thiện'], required: true },
          { name: 'nguoiTheoDoiThuHoach', label: 'Người theo dõi', type: 'text', required: true },
          { name: 'congNhanThuHoach', label: 'Công nhân thu hoạch', type: 'text', required: true }
        ]
      }
    ];

    let updatedCount = 0;

    // Cập nhật từng schema
    for (const schema of aquacultureSchemas) {
      try {
        // Cập nhật tên và mô tả để phản ánh VietGAP
        const updatedName = schema.name.includes('VietGAP') ? schema.name : `${schema.name} VietGAP`;
        const updatedDescription = schema.description.includes('VietGAP') ? 
          schema.description : 
          `${schema.description} - Theo tiêu chuẩn VietGAP thủy sản`;

        // Cập nhật schema
        await FormSchema.findByIdAndUpdate(schema._id, {
          name: updatedName,
          description: updatedDescription,
          tables: vietgapTables
        });

        console.log(`✅ Đã cập nhật: ${schema.name} -> ${updatedName}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Lỗi cập nhật schema ${schema.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updatedCount}/${aquacultureSchemas.length} schema thủy sản`);
    console.log('📋 Tất cả schema thủy sản hiện đã sử dụng format VietGAP chuẩn');
    console.log('📊 Mỗi schema có 8 bảng với tổng cộng 86 trường dữ liệu');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật schema:', error);
    process.exit(1);
  }
};

updateAllAquacultureSchemasToVietGAP();