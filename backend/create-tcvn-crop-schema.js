const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const createTCVNCropSchema = async () => {
  try {
    console.log('🌱 Tạo schema nhật ký cây trồng theo mẫu TCVN...');

    // Schema nhật ký cây trồng theo mẫu TCVN chuẩn
    const tcvnCropSchema = new FormSchema({
      name: 'Nhật ký sản xuất cây trồng TCVN',
      description: 'Sổ ghi chép nhật ký sản xuất cây trồng theo tiêu chuẩn TCVN - Đầy đủ các bảng theo quy định',
      category: 'trongtrot',
      tables: [
        {
          tableName: 'Thông tin chung',
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaChiCoSo', label: 'Địa chỉ cơ sở', type: 'text', required: true },
            { name: 'hoTenNguoiGhiChep', label: 'Họ và tên người ghi chép', type: 'text', required: true },
            { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text', required: false },
            { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text', required: true },
            { name: 'tenCayTrong', label: 'Tên cây trồng', type: 'text', required: true },
            { name: 'dienTich', label: 'Diện tích (m²)', type: 'number', required: true },
            { name: 'quyTrinhSanXuat', label: 'Quy trình sản xuất, tiến bộ kỹ thuật đã áp dụng', type: 'text', required: false },
            { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number', required: true },
            { name: 'soDoVuon', label: 'Sơ đồ vườn trồng (mô tả)', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Đánh giá chỉ tiêu ATTP',
          fields: [
            { name: 'ngayDanhGia', label: 'Ngày đánh giá', type: 'date', required: true },
            { name: 'dieuKienDanhGia', label: 'Điều kiện đánh giá', type: 'select', options: ['Đất/giá thể', 'Nước tưới', 'Sản phẩm'], required: true },
            { name: 'tacNhanGayONhiem', label: 'Tác nhân gây ô nhiễm', type: 'select', options: ['Kim loại nặng', 'Vi sinh vật', 'Dư lượng thuốc BVTV', 'Độc tố vi nấm'], required: true },
            { name: 'ketQuaDanhGia', label: 'Kết quả đánh giá', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'bienPhapXuLy', label: 'Biện pháp xử lý đã áp dụng', type: 'text', required: false },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Nhật ký mua vật tư nông nghiệp',
          fields: [
            { name: 'thoiGianMua', label: 'Thời gian mua (Ngày tháng)', type: 'date', required: true },
            { name: 'tenVatTu', label: 'Tên vật tư (Phân bón, thuốc BVTV...)', type: 'text', required: true },
            { name: 'donViTinh', label: 'Đơn vị tính (kg, g, lít, ml, chai, gói)', type: 'select', options: ['kg', 'g', 'lít', 'ml', 'chai', 'gói', 'bao', 'thùng'], required: true },
            { name: 'soLuong', label: 'Số lượng', type: 'number', required: true },
            { name: 'tenDiaChiMua', label: 'Tên và địa chỉ mua vật tư', type: 'text', required: true },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date', required: true },
            { name: 'nguoiMua', label: 'Tên người mua/Sử dụng', type: 'text', required: true },
            { name: 'nguyenLieuSanXuat', label: 'Nguyên liệu sản xuất (nếu tự sản xuất)', type: 'text', required: false },
            { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý (nếu tự sản xuất)', type: 'text', required: false },
            { name: 'hoaChatXuLy', label: 'Hóa chất xử lý (nếu tự sản xuất)', type: 'text', required: false },
            { name: 'nguoiXuLy', label: 'Người xử lý (nếu tự sản xuất)', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Nhật ký thực hành sản xuất',
          fields: [
            { name: 'tenThuaRuong', label: 'Tên thửa ruộng (mã số)', type: 'text', required: true },
            { name: 'loSanXuat', label: 'Lô sản xuất', type: 'text', required: true },
            { name: 'dienTichLo', label: 'Diện tích lô (m²/sào/ha)', type: 'text', required: true },
            { name: 'matDoTrong', label: 'Mật độ trồng (cây/m²)', type: 'number', required: true },
            { name: 'giongCayTrong', label: 'Giống cây trồng', type: 'text', required: true },
            { name: 'ngayTrong', label: 'Ngày trồng', type: 'date', required: true },
            { name: 'soLuongCayTrong', label: 'Số lượng cây trồng', type: 'number', required: true },
            { name: 'duKienThuHoachTu', label: 'Dự kiến thu hoạch từ ngày', type: 'date', required: false },
            { name: 'duKienThuHoachDen', label: 'Dự kiến thu hoạch đến ngày', type: 'date', required: false },
            { name: 'duKienSanLuong', label: 'Dự kiến sản lượng', type: 'text', required: false },
            { name: 'baoHoLaoDong', label: 'Bảo hộ lao động', type: 'select', options: ['Có', 'Không'], required: true },
            { name: 'racThaiDungNoi', label: 'Rác thải để đúng nơi quy định', type: 'select', options: ['Có', 'Không'], required: true },
            { name: 'thoiGianThucHien', label: 'Thời gian thực hiện', type: 'date', required: true },
            { name: 'congViec', label: 'Công việc', type: 'text', required: true },
            { name: 'tenVatTuSuDung', label: 'Tên vật tư sử dụng (Phân bón, thuốc BVTV...)', type: 'text', required: false },
            { name: 'mucDichSuDung', label: 'Mục đích sử dụng/Tên sâu bệnh', type: 'text', required: false },
            { name: 'lieuLuongNongDo', label: 'Liều lượng/Nồng độ pha', type: 'text', required: false },
            { name: 'donViTinhSuDung', label: 'Đơn vị tính sử dụng', type: 'select', options: ['kg', 'g', 'lít', 'ml', 'chai', 'gói'], required: false },
            { name: 'luongSuDung', label: 'Lượng sử dụng', type: 'number', required: false },
            { name: 'thoiGianCachLy', label: 'Thời gian cách ly (ngày)', type: 'number', required: false },
            { name: 'nguoiThucHien', label: 'Tên người thực hiện', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Nhật ký thu hoạch và bán sản phẩm',
          fields: [
            { name: 'noiSoChe', label: 'Nơi sơ chế/bảo quản', type: 'text', required: true },
            { name: 'loaiCayTrong', label: 'Loại cây trồng', type: 'text', required: true },
            { name: 'phatHienNguyCo', label: 'Phát hiện nguy cơ', type: 'select', options: ['Có', 'Không'], required: true },
            { name: 'daXuLyNguyCo', label: 'Đã xử lý nguy cơ', type: 'select', options: ['Có', 'Không'], required: false },
            { name: 'thoiGianThuHoach', label: 'Thời gian thu hoạch', type: 'date', required: true },
            { name: 'tenMaSoThuaRuong', label: 'Tên/mã số thửa ruộng', type: 'text', required: true },
            { name: 'donViTinhSanPham', label: 'Đơn vị tính sản phẩm', type: 'select', options: ['kg', 'tấn', 'tạ', 'yến', 'bó', 'quả'], required: true },
            { name: 'sanLuongThuHoach', label: 'Sản lượng thu hoạch', type: 'number', required: true },
            { name: 'chatLuongSanPham', label: 'Chất lượng sản phẩm', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
            { name: 'ngayBan', label: 'Ngày bán', type: 'date', required: false },
            { name: 'soLuongBan', label: 'Số lượng bán', type: 'number', required: false },
            { name: 'hinhThucBan', label: 'Hình thức bán', type: 'select', options: ['Bán lẻ', 'Bán buôn', 'Bán theo hợp đồng'], required: false },
            { name: 'nguoiMua', label: 'Người mua/Đơn vị mua', type: 'text', required: false },
            { name: 'nguoiThucHienThuHoach', label: 'Người thực hiện thu hoạch', type: 'text', required: true }
          ]
        }
      ]
    });

    // Lưu schema
    await tcvnCropSchema.save();
    console.log('✅ Đã tạo thành công schema nhật ký cây trồng TCVN');
    console.log('📋 Schema ID:', tcvnCropSchema._id);
    console.log('📊 Số bảng:', tcvnCropSchema.tables.length);
    
    // Hiển thị thông tin các bảng
    tcvnCropSchema.tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tableName} (${table.fields.length} trường)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo schema:', error);
    process.exit(1);
  }
};

createTCVNCropSchema();