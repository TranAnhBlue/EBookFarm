const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const updateCordycepsMushroomSchema = async () => {
  try {
    console.log('🍄 Cập nhật schema Nấm Đông trùng theo form mới...');

    // Schema nhật ký sản xuất nấm Đông trùng theo form chuẩn
    const cordycepsSchema = {
      name: 'Nấm Đông trùng',
      description: 'Nhật ký sản xuất nấm Đông trùng hạ thảo - Theo tiêu chuẩn TCVN với 5 bảng đầy đủ',
      category: 'trongtrot',
      tables: [
        {
          tableName: 'Thông tin chung',
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaChiCoSo', label: 'Địa chỉ cơ sở', type: 'text', required: true },
            { name: 'hoTenToChucCaNhan', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
            { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text', required: true },
            { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text', required: true },
            { name: 'dienTich', label: 'Diện tích (m²)', type: 'number', required: true },
            { name: 'giongNam', label: 'Giống nấm', type: 'select', options: ['Nấm Đông trùng hạ thảo', 'Cordyceps militaris', 'Cordyceps sinensis', 'Khác'], required: true },
            { name: 'matDo', label: 'Mật độ (/m²)', type: 'number', required: true },
            { name: 'tongTuiPhoi', label: 'Tổng túi phôi (bịch)', type: 'number', required: true },
            { name: 'ngayBatDauDatTreoTuiPhoi', label: 'Ngày bắt đầu đặt/treo túi phôi', type: 'date', required: true },
            { name: 'soDoVuonTrong', label: 'Sơ đồ vườn trồng', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 1: Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'dieuKienDatGiaThe', label: 'Điều kiện - Đất/giá thể', type: 'select', options: ['Kim loại nặng', 'Độc tố', 'Vi sinh vật', 'Khác'], required: true },
            { name: 'tacNhanGayONhiemDat', label: 'Tác nhân gây ô nhiễm - Đất/giá thể', type: 'text', required: true },
            { name: 'danhGiaHienTaiDat', label: 'Đánh giá hiện tại - Đất/giá thể', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'bienPhapXuLyDat', label: 'Biện pháp xử lý đã áp dụng - Đất/giá thể', type: 'text', required: false },
            { name: 'dieuKienNuocTuoi', label: 'Điều kiện - Nước tưới', type: 'select', options: ['Kim loại nặng', 'Vi sinh vật', 'Độc tố', 'Khác'], required: true },
            { name: 'tacNhanGayONhiemNuoc', label: 'Tác nhân gây ô nhiễm - Nước tưới', type: 'text', required: true },
            { name: 'danhGiaHienTaiNuoc', label: 'Đánh giá hiện tại - Nước tưới', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'bienPhapXuLyNuoc', label: 'Biện pháp xử lý đã áp dụng - Nước tưới', type: 'text', required: false },
            { name: 'dieuKienSanPham', label: 'Điều kiện - Sản phẩm', type: 'select', options: ['Kim loại nặng', 'Dư lượng thuốc BVTV', 'Vi sinh vật', 'Độc tố vi nấm'], required: true },
            { name: 'tacNhanGayONhiemSanPham', label: 'Tác nhân gây ô nhiễm - Sản phẩm', type: 'text', required: true },
            { name: 'danhGiaHienTaiSanPham', label: 'Đánh giá hiện tại - Sản phẩm', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'bienPhapXuLySanPham', label: 'Biện pháp xử lý đã áp dụng - Sản phẩm', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 2: Theo dõi mua hoặc tự sản xuất giống đầu vào',
          fields: [
            { name: 'tenGiong', label: 'Tên giống', type: 'select', options: ['Nấm Đông trùng hạ thảo', 'Cordyceps militaris', 'Cordyceps sinensis', 'Khác'], required: true },
            { name: 'maSoLoGiong', label: 'Mã số lô giống', type: 'text', required: true },
            { name: 'noiSanXuat', label: 'Nơi sản xuất', type: 'text', required: true },
            { name: 'ngayMua', label: 'Ngày mua', type: 'date', required: true },
            { name: 'soLuongKg', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'tenHoaChatXuLyGiong', label: 'Tên hóa chất xử lý giống', type: 'text', required: false },
            { name: 'lyDoXuLyHoaChat', label: 'Lý do xử lý hóa chất', type: 'select', options: ['Khử trùng', 'Diệt nấm', 'Diệt khuẩn', 'Tăng cường miễn dịch', 'Khác'], required: false },
            { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 3: Theo dõi mua hoặc tự sản xuất vật tư đầu vào',
          fields: [
            { name: 'thoiGianMuaHoacSanXuat', label: 'Thời gian mua hoặc sản xuất', type: 'date', required: true },
            { name: 'tenVatTu', label: 'Tên vật tư', type: 'select', options: ['Giá thể nuôi cấy', 'Phân bón hữu cơ', 'Thuốc BVTV', 'Hóa chất khử trùng', 'Túi phôi', 'Dụng cụ', 'Khác'], required: true },
            { name: 'donViTinh', label: 'Đơn vị tính', type: 'select', options: ['kg', 'lít', 'bịch', 'túi', 'chai', 'lọ', 'cái'], required: true },
            { name: 'soLuong', label: 'Số lượng', type: 'number', required: true },
            { name: 'tenVaDiaChiMuaVatTu', label: 'Tên và địa chỉ mua vật tư', type: 'text', required: false },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date', required: false },
            { name: 'nguyenLieuSanXuat', label: 'Nguyên liệu sản xuất', type: 'text', required: false },
            { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý', type: 'select', options: ['Hấp khử trùng', 'Sấy khô', 'Ủ men', 'Lên men', 'Khác'], required: false },
            { name: 'hoaChatXuLy', label: 'Hóa chất xử lý', type: 'text', required: false },
            { name: 'nguoiXuLyVatTu', label: 'Người xử lý', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Bảng 4: Nhật ký quá trình sản xuất',
          fields: [
            { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
            { name: 'loSanXuat', label: 'Lô sản xuất', type: 'text', required: true },
            { name: 'dienTichM2', label: 'Diện tích (m²)', type: 'number', required: true },
            { name: 'congViec', label: 'Công việc', type: 'select', options: ['Chuẩn bị giá thể', 'Tiêm giống', 'Nuôi cấy', 'Kích thích ra nấm', 'Chăm sóc', 'Thu hoạch', 'Vệ sinh', 'Khử trùng', 'Khác'], required: true },
            { name: 'nhietDo', label: 'Nhiệt độ (°C)', type: 'number', required: true },
            { name: 'doAm', label: 'Độ ẩm (%)', type: 'number', required: true },
            { name: 'nguoiThucHien', label: 'Người thực hiện', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Bảng 5: Thu hoạch và tiêu thụ sản phẩm',
          fields: [
            { name: 'thoiGianThuHoach', label: 'Thời gian thu hoạch', type: 'date', required: true },
            { name: 'maSoLoThuHoach', label: 'Mã số lô thu hoạch', type: 'text', required: true },
            { name: 'tenSanPham', label: 'Tên sản phẩm', type: 'select', options: ['Nấm Đông trùng tươi', 'Nấm Đông trùng khô', 'Bột nấm Đông trùng', 'Cao nấm Đông trùng', 'Khác'], required: true },
            { name: 'sanLuongKg', label: 'Sản lượng (kg)', type: 'number', required: true },
            { name: 'veSinhDungCuThuHoach', label: 'Vệ sinh dụng cụ thu hoạch', type: 'select', options: ['Đạt (Đ)', 'Không đạt (K)'], required: true },
            { name: 'ngayBan', label: 'Ngày bán', type: 'date', required: false },
            { name: 'soLuongBanKg', label: 'Số lượng bán (kg)', type: 'number', required: false },
            { name: 'donViThuMuaDiaChi', label: 'Đơn vị thu mua/Địa chỉ', type: 'text', required: false },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text', required: false }
          ]
        }
      ]
    };

    // Tìm schema "Nấm Đông trùng" hiện có để cập nhật
    const existingSchema = await FormSchema.findOne({ name: 'Nấm Đông trùng', category: 'trongtrot' });
    
    if (existingSchema) {
      // Cập nhật schema hiện có
      await FormSchema.findByIdAndUpdate(existingSchema._id, cordycepsSchema);
      console.log('✅ Đã cập nhật schema "Nấm Đông trùng" hiện có');
      console.log('📋 Schema ID:', existingSchema._id);
    } else {
      // Tạo schema mới nếu chưa có
      const newSchema = new FormSchema(cordycepsSchema);
      await newSchema.save();
      console.log('✅ Đã tạo schema "Nấm Đông trùng" mới');
      console.log('📋 Schema ID:', newSchema._id);
    }
    
    console.log('📊 Số bảng:', cordycepsSchema.tables.length);
    
    // Hiển thị thông tin các bảng
    cordycepsSchema.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tableName} (${table.fields.length} trường)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật schema:', error);
    process.exit(1);
  }
};

updateCordycepsMushroomSchema();