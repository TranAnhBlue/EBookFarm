const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const createOrganicRiceSchema = async () => {
  try {
    console.log('🌾 Tạo schema Lúa hữu cơ theo tiêu chuẩn TCVN 11041-5:2018...');

    // Schema nhật ký sản xuất lúa hữu cơ theo TCVN 11041-5:2018
    const organicRiceSchema = {
      name: 'Lúa hữu cơ',
      description: 'Sổ nhật ký sản xuất hữu cơ theo tiêu chuẩn quốc gia TCVN 11041-5:2018 - Lúa hữu cơ với 5 bảng đầy đủ',
      category: 'huuco_caytrong',
      tables: [
        {
          tableName: 'Thông tin chung',
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaDiemThucHien', label: 'Địa điểm thực hiện', type: 'text', required: true },
            { name: 'hoTenToChucCaNhan', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
            { name: 'maSoHoLoSanXuat', label: 'Mã số hộ/lô sản xuất', type: 'text', required: true },
            { name: 'dienTichCanhTac', label: 'Diện tích canh tác (m²)', type: 'number', required: true },
            { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text', required: true },
            { name: 'giongCayTrong', label: 'Giống cây trồng', type: 'select', options: ['X33', 'OM18', 'ST24', 'ST25', 'Jasmine 85', 'IR64', 'Khác'], required: true },
            { name: 'thoiGianTrong', label: 'Thời gian trồng', type: 'date', required: true },
            { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number', required: true },
            { name: 'soDoKhuVucSanXuat', label: 'Sơ đồ khu vực sản xuất', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 1: Đánh giá chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
          fields: [
            { name: 'thoiGianDanhGia', label: 'Thời gian đánh giá (ngày, tháng, năm)', type: 'date', required: true },
            { name: 'chiTieuDat', label: 'Chỉ tiêu - Đất/giá thể', type: 'select', options: ['Kim loại nặng trong đất/giá thể', 'Độc tố', 'Vi sinh vật', 'Khác'], required: true },
            { name: 'ketQuaDat', label: 'Kết quả phân tích - Đất/giá thể', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'chiTieuKhongDatDat', label: 'Chỉ tiêu không đạt - Đất/giá thể', type: 'text', required: false },
            { name: 'nguyenNhanBienPhapDat', label: 'Nguyên nhân, biện pháp khắc phục - Đất/giá thể', type: 'text', required: false },
            { name: 'chiTieuNuoc', label: 'Chỉ tiêu - Nước tưới/sản xuất', type: 'select', options: ['Kim loại nặng/vi sinh vật trong nước tưới', 'Nước sản xuất rau mầm, nấm', 'Nước sử dụng sau thu hoạch', 'Khác'], required: true },
            { name: 'ketQuaNuoc', label: 'Kết quả phân tích - Nước tưới/sản xuất', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'chiTieuKhongDatNuoc', label: 'Chỉ tiêu không đạt - Nước tưới/sản xuất', type: 'text', required: false },
            { name: 'nguyenNhanBienPhapNuoc', label: 'Nguyên nhân, biện pháp khắc phục - Nước tưới/sản xuất', type: 'text', required: false },
            { name: 'chiTieuSanPham', label: 'Chỉ tiêu - Sản phẩm', type: 'select', options: ['Kim loại nặng', 'Dư lượng thuốc BVTV', 'Vi sinh vật', 'Độc tố vi nấm trong sản phẩm'], required: true },
            { name: 'ketQuaSanPham', label: 'Kết quả phân tích - Sản phẩm', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'chiTieuKhongDatSanPham', label: 'Chỉ tiêu không đạt - Sản phẩm', type: 'text', required: false },
            { name: 'nguyenNhanBienPhapSanPham', label: 'Nguyên nhân, biện pháp khắc phục - Sản phẩm', type: 'text', required: false },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 2: Theo dõi mua hoặc tự sản xuất giống',
          fields: [
            { name: 'thoiGianMuaHoacSanXuat', label: 'Thời gian mua hoặc sản xuất (ngày/tháng/năm)', type: 'date', required: true },
            { name: 'tenGiong', label: 'Tên giống', type: 'select', options: ['X33', 'OM18', 'ST24', 'ST25', 'Jasmine 85', 'IR64', 'Khác'], required: true },
            { name: 'soLuongKg', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'tenVaDiaChiMuaHoacTuSanXuat', label: 'Tên và địa chỉ mua hoặc tự sản xuất', type: 'text', required: true },
            { name: 'maSoLoGiong', label: 'Mã số lô giống', type: 'text', required: true },
            { name: 'capGiong', label: 'Cấp giống', type: 'select', options: ['Siêu nguyên chủng', 'Nguyên chủng', 'Cấp giống', 'Giống thương phẩm', 'Khác'], required: true },
            { name: 'xuLyGiong', label: 'Xử lý giống', type: 'select', options: ['Có', 'Không'], required: true },
            { name: 'tenNguoiMuaGiongTuDeGiong', label: 'Tên người mua giống - tự để giống', type: 'text', required: true },
            { name: 'tenHoaChatXuLyGiong', label: 'Tên hóa chất xử lý giống', type: 'text', required: false },
            { name: 'lyDoXuLyHoaChat', label: 'Lý do xử lý hóa chất', type: 'select', options: ['Khử trùng', 'Diệt nấm', 'Diệt khuẩn', 'Tăng cường miễn dịch', 'Không xử lý', 'Khác'], required: false },
            { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 3: Theo dõi mua hoặc tự sản xuất vật tư đầu vào',
          fields: [
            { name: 'thoiGianMuaHoacSanXuat', label: 'Thời gian mua hoặc sản xuất (ngày/tháng/năm)', type: 'date', required: true },
            { name: 'tenVatTu', label: 'Tên vật tư', type: 'select', options: ['Vôi bột', 'Phân hữu cơ', 'Phân trùn quế', 'Trichoderma', 'Lân nung chảy', 'Phân khoáng hữu cơ', 'Phân chuồng', 'Phân compost', 'Vi sinh vật có ích', 'Khác'], required: true },
            { name: 'donViTinh', label: 'Đơn vị tính', type: 'select', options: ['kg', 'tấn', 'lít', 'bao', 'thùng', 'chai', 'lọ'], required: true },
            { name: 'soLuong', label: 'Số lượng', type: 'number', required: true },
            { name: 'tenVaDiaChiMuaVatTu', label: 'Tên và địa chỉ mua vật tư', type: 'text', required: true },
            { name: 'hanSuDung', label: 'Hạn sử dụng (ngày/tháng/năm)', type: 'date', required: false },
            { name: 'nguyenLieuSanXuat', label: 'Nguyên liệu sản xuất (đối với phân bón, thuốc BVTV)', type: 'text', required: false },
            { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý', type: 'select', options: ['Ủ compost', 'Lên men', 'Sấy khô', 'Nghiền', 'Trộn đều', 'Không xử lý', 'Khác'], required: false },
            { name: 'chatHoTroXuLy', label: 'Chất hỗ trợ xử lý', type: 'text', required: false },
            { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 4: Theo dõi quá trình sản xuất',
          fields: [
            { name: 'ngayThangNam', label: 'Ngày/tháng/năm', type: 'date', required: true },
            { name: 'congViec', label: 'Công việc', type: 'select', options: ['Làm đất, cày vỡ', 'Bón vôi bột', 'Làm đất', 'Bón lót', 'Gieo xạ', 'Bón thúc lần 1', 'Tỉa, dặm lúa, nhổ cỏ', 'Bón thúc lần 2', 'Phun thuốc BVTV', 'Tưới nước', 'Thu hoạch', 'Khác'], required: true },
            { name: 'mucDichApDung', label: 'Mục đích áp dụng', type: 'text', required: true },
            { name: 'phuongPhap', label: 'Phương pháp', type: 'text', required: true },
            { name: 'thietBiSuDung', label: 'Thiết bị sử dụng', type: 'select', options: ['Máy bừa', 'Xô, chậu nhựa', 'Chậu nhựa', 'Thủ công', 'Máy cày', 'Máy gặt', 'Máy phun', 'Khác'], required: false },
            { name: 'nguyenVatLieu', label: 'Nguyên vật liệu (Tên phân bón/thuốc BVTV)', type: 'text', required: false },
            { name: 'donViTinh', label: 'Đơn vị tính', type: 'select', options: ['kg', 'lít', 'ml', 'gam', 'tấn'], required: false },
            { name: 'lieuLuongKgHa', label: 'Liều lượng (Kg/ha)', type: 'number', required: false },
            { name: 'tongLuongSuDung', label: 'Tổng lượng sử dụng (kg)', type: 'number', required: false }
          ]
        },
        {
          tableName: 'Bảng 5: Theo dõi thu hoạch/tiêu thụ sản phẩm',
          fields: [
            { name: 'ngayThangNamThuHoach', label: 'Ngày/tháng/năm thu hoạch', type: 'date', required: true },
            { name: 'sanLuongKg', label: 'Sản lượng (kg)', type: 'number', required: true },
            { name: 'maSoLoThuHoach', label: 'Mã số lô thu hoạch', type: 'text', required: true },
            { name: 'diaDiemCachThucSoChe', label: 'Địa điểm, cách thức sơ chế (nếu có)', type: 'text', required: false },
            { name: 'thoiGianXuatBan', label: 'Thời gian xuất bán (ngày/tháng/năm)', type: 'date', required: false },
            { name: 'tenDiaChiCoSoThuMuaHoacTieuThu', label: 'Tên, địa chỉ cơ sở thu mua hoặc tiêu thụ', type: 'text', required: false },
            { name: 'khoiLuongTieuThuKg', label: 'Khối lượng tiêu thụ (kg)', type: 'number', required: false },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        }
      ]
    };

    // Tìm schema "Lúa hữu cơ" hiện có để cập nhật hoặc tạo mới
    const existingSchema = await FormSchema.findOne({ name: 'Lúa hữu cơ', category: 'huuco_caytrong' });
    
    if (existingSchema) {
      // Cập nhật schema hiện có
      await FormSchema.findByIdAndUpdate(existingSchema._id, organicRiceSchema);
      console.log('✅ Đã cập nhật schema "Lúa hữu cơ" hiện có');
      console.log('📋 Schema ID:', existingSchema._id);
    } else {
      // Tạo schema mới nếu chưa có
      const newSchema = new FormSchema(organicRiceSchema);
      await newSchema.save();
      console.log('✅ Đã tạo schema "Lúa hữu cơ" mới');
      console.log('📋 Schema ID:', newSchema._id);
    }
    
    console.log('📊 Số bảng:', organicRiceSchema.tables.length);
    
    // Hiển thị thông tin các bảng
    organicRiceSchema.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tableName} (${table.fields.length} trường)`);
    });

    console.log('\n🔍 Các trường chính:');
    console.log('   - Thông tin chung: Tên cơ sở, diện tích, giống lúa, thời gian trồng');
    console.log('   - Đánh giá ATTP: Kim loại nặng, vi sinh vật, độc tố trong đất/nước/sản phẩm');
    console.log('   - Theo dõi giống: Nguồn gốc, cấp giống, xử lý giống hữu cơ');
    console.log('   - Vật tư đầu vào: Phân hữu cơ, vi sinh vật có ích, không hóa chất');
    console.log('   - Quá trình sản xuất: Làm đất, bón phân, chăm sóc theo chuẩn hữu cơ');
    console.log('   - Thu hoạch/tiêu thụ: Sản lượng, truy xuất nguồn gốc, tiêu thụ');

    console.log('\n📜 Tiêu chuẩn: TCVN 11041-5:2018 - Sản xuất hữu cơ');
    console.log('🌱 Đặc điểm: Không sử dụng hóa chất tổng hợp, thuốc BVTV hóa học');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo schema:', error);
    process.exit(1);
  }
};

createOrganicRiceSchema();