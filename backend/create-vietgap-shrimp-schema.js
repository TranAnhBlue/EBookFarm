const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const createVietGAPShrimpSchema = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const schemaData = {
      name: 'Tôm',
      category: 'thuysan',
      description: 'Sổ nhật ký nuôi tôm theo tiêu chuẩn VietGAP',
      tables: [
        {
          tableName: 'Thông tin chung',
          isMultiRow: false,
          fields: [
            { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
            { name: 'diaChi', label: 'Địa chỉ', type: 'text', required: true },
            { name: 'hoVaTen', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
            { name: 'maSoHo', label: 'Mã số hộ', type: 'text', required: false },
            { name: 'dienTich', label: 'Diện tích', type: 'text', required: false },
            { name: 'tenGiong', label: 'Tên giống', type: 'text', required: false },
            { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text', required: true },
            { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number', required: true }
          ]
        },
        {
          tableName: 'Biểu 1: Thông tin chung ao nuôi (1/2). Thông tin ao nuôi',
          isMultiRow: false,
          fields: [
            { name: 'aoNuoiSo', label: 'Ao nuôi số', type: 'text', required: true },
            { name: 'dienTichHa', label: 'Diện tích (ha)', type: 'number', required: true },
            { name: 'tenGiongTom', label: 'Tên giống tôm', type: 'text', required: true },
            { name: 'doSau', label: 'Độ sâu (m)', type: 'number', required: false }
          ]
        },
        {
          tableName: 'Biểu 1: Thông tin chung ao nuôi (2/2). Thông tin về thả giống',
          isMultiRow: true,
          fields: [
            { name: 'ngayThaGiong', label: 'Ngày thả giống', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'coTom', label: 'Cỡ tôm (gam)', type: 'number', required: true },
            { name: 'matDoTha', label: 'Mật độ thả (con/m2)', type: 'number', required: false },
            { name: 'tongLuongGiong', label: 'Tổng lượng giống thả (kg, con)', type: 'text', required: true },
            { name: 'coSoCungCap', label: 'Tên/Địa chỉ cơ sở cung cấp giống', type: 'text', required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 2: Thông tin cải tạo ao nuôi (1/3). Cải tạo ao',
          isMultiRow: false,
          fields: [
            { name: 'thoiGianBatDau', label: 'Thời gian cải tạo - Bắt đầu', type: 'date', required: true },
            { name: 'thoiGianKetThuc', label: 'Thời gian cải tạo - Kết thúc', type: 'date', required: true },
            { name: 'quyTrinhCaiTao', label: 'Mô tả tóm tắt quy trình cải tạo', type: 'textarea', required: true }
          ]
        },
        {
          tableName: 'Biểu 2: Thông tin cải tạo ao nuôi (2/3). Các loại hóa chất đã sử dụng',
          isMultiRow: true,
          fields: [
            { name: 'tenHoaChat', label: 'Tên hóa chất', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (g/kg/ml/lít)', type: 'text', required: true },
            { name: 'phuongPhap', label: 'Phương pháp sử dụng', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 2: Thông tin cải tạo ao nuôi (3/3). Xử lý bùn và kiểm tra sau cải tạo',
          isMultiRow: false,
          fields: [
            { name: 'thuGomBun', label: 'Cách thu gom xử lý bùn', type: 'textarea', required: false },
            { name: 'noiChuaBun', label: 'Nơi chứa bùn', type: 'text', required: false },
            { name: 'khoiLuongBun', label: 'Khối lượng bùn thải', type: 'text', required: false },
            { name: 'pH', label: 'pH sau cải tạo', type: 'number', required: false },
            { name: 'oxy', label: 'Oxy sau cải tạo', type: 'number', required: false },
            { name: 'nh3', label: 'NH3 sau cải tạo', type: 'number', required: false },
            { name: 'nhietDo', label: 'Nhiệt độ sau cải tạo', type: 'number', required: false },
            { name: 'chatDocKhac', label: 'Các chất độc khác', type: 'text', required: false }
          ]
        },
        {
          tableName: 'Biểu 3. Theo dõi nhập thức ăn',
          isMultiRow: true,
          fields: [
            { name: 'ngayNhap', label: 'Ngày tháng nhập', type: 'date', required: true },
            { name: 'tenThucAn', label: 'Tên loại thức ăn', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'soLo', label: 'Số lô', type: 'text', required: false },
            { name: 'ngaySanXuat', label: 'Ngày sản xuất', type: 'date', required: true },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date', required: true },
            { name: 'congTySanXuat', label: 'Tên/Địa chỉ công ty sản xuất', type: 'text', required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 4. Sử dụng thức ăn và môi trường',
          isMultiRow: true,
          fields: [
            { name: 'ngay', label: 'Ngày', type: 'date', required: true },
            { name: 'trongLuong', label: 'Trọng lượng (g)', type: 'number', required: false },
            { name: 'maSoThucAn', label: 'Mã số thức ăn', type: 'text', required: false },
            { name: 'doDam', label: 'Độ đạm', type: 'number', required: false },
            { name: 'tongThucAn', label: 'Tổng thức ăn (kg)', type: 'number', required: false },
            { name: 'thayNuoc', label: 'Thay nước (m3)', type: 'number', required: false },
            { name: 'doMan', label: 'Độ mặn', type: 'number', required: false },
            { name: 'doTrong', label: 'Độ trong', type: 'number', required: false },
            { name: 'nhietDo', label: 'Nhiệt độ', type: 'number', required: false },
            { name: 'pH', label: 'pH', type: 'number', required: false },
            { name: 'oxy', label: 'Oxy', type: 'number', required: false },
            { name: 'doKem', label: 'Độ kềm', type: 'number', required: false },
            { name: 'nh3', label: 'NH3', type: 'number', required: false },
            { name: 'h2s', label: 'H2S', type: 'number', required: false },
            { name: 'no2', label: 'NO2', type: 'number', required: false },
            { name: 'tenHoaChat', label: 'Tên hóa chất', type: 'text', required: false },
            { name: 'lyDoDung', label: 'Lý do dùng hóa chất', type: 'text', required: false },
            { name: 'soLuongHoaChat', label: 'Số lượng hóa chất', type: 'text', required: false },
            { name: 'thoiGianCachLy', label: 'Thời gian cách ly', type: 'text', required: false },
            { name: 'tinhTrangTom', label: 'Tình trạng tôm', type: 'text', required: false },
            { name: 'tomChet', label: 'Tôm chết (con)', type: 'number', required: false },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 5. Theo dõi nhập thuốc/sản phẩm xử lý',
          isMultiRow: true,
          fields: [
            { name: 'ngayNhap', label: 'Ngày tháng nhập', type: 'date', required: true },
            { name: 'tenThuoc', label: 'Tên thuốc/sản phẩm xử lý cải tạo môi trường', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg/lít)', type: 'number', required: true },
            { name: 'soLo', label: 'Số lô', type: 'text', required: false },
            { name: 'ngaySanXuat', label: 'Ngày sản xuất', type: 'date', required: true },
            { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date', required: true },
            { name: 'congTySanXuat', label: 'Tên/Địa chỉ công ty sản xuất', type: 'text', required: true },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 6. Theo dõi điều trị bệnh',
          isMultiRow: true,
          fields: [
            { name: 'ngayDieuTri', label: 'Ngày điều trị', type: 'date', required: true },
            { name: 'loaiBenh', label: 'Loại bệnh', type: 'text', required: true },
            { name: 'tenThuoc', label: 'Tên thuốc', type: 'text', required: true },
            { name: 'cachDieuTri', label: 'Cách điều trị', type: 'text', required: true },
            { name: 'ketQua', label: 'Kết quả sau khi trị bệnh', type: 'text', required: false },
            { name: 'nguoiDieuTri', label: 'Người điều trị', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 7. Theo dõi thu hoạch',
          isMultiRow: true,
          fields: [
            { name: 'ngayThuHoach', label: 'Ngày thu hoạch', type: 'date', required: true },
            { name: 'khoiLuong', label: 'Khối lượng (kg)', type: 'number', required: true },
            { name: 'coTom', label: 'Cỡ tôm (g/con)', type: 'number', required: true },
            { name: 'donViThuMua', label: 'Tên/Địa chỉ đơn vị thu mua', type: 'text', required: true },
            { name: 'vsCongNhan', label: 'Điều kiện vệ sinh - Công nhân', type: 'text', required: false },
            { name: 'vsSotThung', label: 'Điều kiện vệ sinh - Sọt/Thùng chứa', type: 'text', required: false },
            { name: 'vsLuoiKeo', label: 'Điều kiện vệ sinh - Lưới kéo', type: 'text', required: false },
            { name: 'nguoiTheoDoi', label: 'Người theo dõi', type: 'text', required: true },
            { name: 'chuKy', label: 'Chữ ký người phụ trách', type: 'signature', required: false }
          ]
        }
      ]
    };

    // Check if schema exists
    let schema = await FormSchema.findOne({ name: schemaData.name });
    
    if (schema) {
      console.log('Schema already exists, updating...');
      schema.tables = schemaData.tables;
      schema.description = schemaData.description;
      schema.category = schemaData.category;
      await schema.save();
      console.log('Schema updated successfully!');
    } else {
      console.log('Creating new schema...');
      schema = new FormSchema(schemaData);
      await schema.save();
      console.log('Schema created successfully!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

createVietGAPShrimpSchema();