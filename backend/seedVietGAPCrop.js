const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const seedVietGAPCrop = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const standardCrops = [
      'Bí đỏ', 'Bưởi', 'Bầu sao', 'Bắp cải', 'Chè búp', 'Cà chua', 'Cà phê', 
      'Dâu tây', 'Dưa chuột', 'Dưa lưới', 'Hoa cúc', 'Lúa', 'Mướp ngọt', 
      'Mướp đắng', 'Ngô ngọt', 'Rau cải', 'Rau cải cúc', 'Rau cải thìa', 
      'Rau muống', 'Rau ngót', 'Rau xà lách', 'Vải', 'Cam', 'Xoài', 
      'Thanh long', 'Nhãn', 'Sầu riêng', 'Hồ tiêu', 'Điều', 'Chè xanh', 
      'Ổi', 'Na', 'Dứa', 'Chuối', 'Nhật ký sản xuất VietGAP (Trồng trọt)'
    ];

    const mushroomCrops = ['Nấm', 'Nấm Đông trùng'];

    const standardTables = [
      {
        tableName: 'Thông tin chung',
        isMultiRow: false,
        fields: [
          { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
          { name: 'diaChiCoSo', label: 'Địa chỉ', type: 'text', required: true },
          { name: 'hoTen', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
          { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text', required: true },
          { name: 'dienTich', label: 'Diện tích (m2)', type: 'number', required: true },
          { name: 'cayTrong', label: 'Cây trồng', type: 'text', required: true },
          { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text' },
          { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number' }
        ]
      },
      {
        tableName: 'Bảng 1. Đánh giá chỉ tiêu ATTP',
        isMultiRow: true,
        fields: [
          { name: 'ngayThang', label: 'Ngày tháng', type: 'date' },
          { name: 'dieuKien', label: 'Điều kiện (Đất/Nước/SP)', type: 'select', options: ['Đất/Giá thể', 'Nước tưới', 'Nước sơ chế', 'Sản phẩm'] },
          { name: 'tacNhan', label: 'Tác nhân gây ô nhiễm', type: 'multi-select', options: ['Kim loại nặng', 'Vi sinh vật', 'Dư lượng thuốc BVTV', 'Độc tố vi nấm trong sản phẩm', 'Khác'] },
          { name: 'danhGia', label: 'Đánh giá hiện tại', type: 'select', options: ['Đạt', 'Không đạt'] },
          { name: 'bienPhap', label: 'Biện pháp xử lý đã áp dụng', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 2. Theo dõi vật tư đầu vào',
        isMultiRow: true,
        fields: [
          { name: 'thoiGian', label: 'Thời gian', type: 'date' },
          { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
          { name: 'donViTinh', label: 'ĐVT', type: 'text' },
          { name: 'soLuong', label: 'Số lượng', type: 'number' },
          { name: 'diaChiMua', label: 'Tên và địa chỉ mua', type: 'text' },
          { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date' },
          { name: 'nguyenLieuTuSanXuat', label: 'Nguyên liệu (nếu tự SX)', type: 'text' },
          { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý', type: 'text' },
          { name: 'hoaChatXuLy', label: 'Hóa chất xử lý', type: 'text' },
          { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 3. Nhật ký canh tác',
        isMultiRow: true,
        fields: [
          { name: 'thoiGian', label: 'Thời gian thực hiện', type: 'date' },
          { name: 'maSoThua', label: 'Mã số thửa', type: 'text' },
          { name: 'loSx', label: 'Lô sản xuất', type: 'text' },
          { name: 'tenGiongCay', label: 'Tên giống cây', type: 'text' },
          { name: 'dienTich', label: 'Diện tích (m2)', type: 'number' },
          { name: 'ngayGieoTrong', label: 'Ngày gieo trồng', type: 'date' },
          { name: 'tenPhanBon', label: 'Tên phân bón', type: 'text' },
          { name: 'luongPhanBon', label: 'Lượng bón (Kg)', type: 'number' },
          { name: 'tenThuocBVTV', label: 'Tên thuốc BVTV', type: 'text' },
          { name: 'nongDoPha', label: 'Nồng độ pha', type: 'text' },
          { name: 'luongThuocSuDung', label: 'Lượng thuốc sử dụng', type: 'number' },
          { name: 'thoiGianCachLy', label: 'Thời gian cách ly (PHI)', type: 'number' },
          { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 4. Thu hoạch và tiêu thụ',
        isMultiRow: true,
        fields: [
          { name: 'thoiGianThuHoach', label: 'Thời gian thu hoạch', type: 'date' },
          { name: 'maSoLo', label: 'Mã số lô thu hoạch', type: 'text' },
          { name: 'tenSanPham', label: 'Tên sản phẩm', type: 'text' },
          { name: 'sanLuong', label: 'Sản lượng (kg)', type: 'number' },
          { name: 'diaDiemSoChe', label: 'Địa điểm sơ chế', type: 'text' },
          { name: 'ngayBan', label: 'Ngày bán', type: 'date' },
          { name: 'soLuongBan', label: 'Số lượng bán (kg)', type: 'number' },
          { name: 'donViMua', label: 'Đơn vị thu mua/Địa chỉ', type: 'text' },
          { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
        ]
      }
    ];

    const mushroomTables = [
      {
        tableName: 'Thông tin chung',
        isMultiRow: false,
        fields: [
          { name: 'tenCoSo', label: 'Tên cơ sở', type: 'text', required: true },
          { name: 'diaChiCoSo', label: 'Địa chỉ', type: 'text', required: true },
          { name: 'hoTen', label: 'Họ và tên tổ chức/cá nhân sản xuất', type: 'text', required: true },
          { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text' },
          { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text', required: true },
          { name: 'dienTich', label: 'Diện tích (m2)', type: 'number' },
          { name: 'tenGiong', label: 'Giống cây', type: 'text' },
          { name: 'matDo', label: 'Mật độ', type: 'text' },
          { name: 'tongTuiPhoi', label: 'Tổng túi phôi', type: 'number' },
          { name: 'ngayDatPhoi', label: 'Ngày bắt đầu đặt/treo túi phôi', type: 'date' }
        ]
      },
      {
        tableName: 'Bảng 1. Đánh giá chỉ tiêu ATTP',
        isMultiRow: true,
        fields: [
          { name: 'ngayThang', label: 'Ngày tháng', type: 'date' },
          { name: 'dieuKien', label: 'Điều kiện', type: 'select', options: ['Đất/giá thể', 'Nước tưới', 'Sản phẩm'] },
          { name: 'tacNhan', label: 'Tác nhân gây ô nhiễm', type: 'multi-select', options: ['Kim loại nặng', 'Vi sinh vật', 'Dư lượng thuốc BVTV', 'Độc tố vi nấm trong sản phẩm'] },
          { name: 'danhGia', label: 'Đánh giá hiện tại', type: 'select', options: ['Đạt', 'Không đạt'] },
          { name: 'bienPhap', label: 'Biện pháp xử lý đã áp dụng', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 2. Theo dõi giống đầu vào',
        isMultiRow: true,
        fields: [
          { name: 'tenGiong', label: 'Tên giống', type: 'text' },
          { name: 'maSoLo', label: 'Mã số lô giống', type: 'text' },
          { name: 'noiSanXuat', label: 'Nơi sản xuất', type: 'text' },
          { name: 'ngayMua', label: 'Ngày mua', type: 'date' },
          { name: 'soLuong', label: 'Số lượng (kg)', type: 'number' },
          { name: 'hoaChatXuLy', label: 'Tên hóa chất xử lý giống', type: 'text' },
          { name: 'lyDoXuLy', label: 'Lý do xử lý hóa chất', type: 'text' },
          { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 3. Theo dõi vật tư đầu vào',
        isMultiRow: true,
        fields: [
          { name: 'thoiGian', label: 'Thời gian mua/SX', type: 'date' },
          { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
          { name: 'donViTinh', label: 'ĐVT', type: 'text' },
          { name: 'soLuong', label: 'Số lượng', type: 'number' },
          { name: 'diaChiMua', label: 'Tên và địa chỉ mua', type: 'text' },
          { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'date' },
          { name: 'nguyenLieuSx', label: 'Nguyên liệu sx (nếu tự SX)', type: 'text' },
          { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý', type: 'text' },
          { name: 'hoaChatXuLy', label: 'Hóa chất xử lý', type: 'text' },
          { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 4. Nhật ký quá trình sản xuất',
        isMultiRow: true,
        fields: [
          { name: 'ngayThang', label: 'Ngày tháng', type: 'date' },
          { name: 'loSanXuat', label: 'Lô sản xuất', type: 'text' },
          { name: 'dienTich', label: 'Diện tích (m2)', type: 'number' },
          { name: 'congViec', label: 'Công việc', type: 'text' },
          { name: 'nhietDo', label: 'Nhiệt độ (°C)', type: 'number' },
          { name: 'doAm', label: 'Độ ẩm (%)', type: 'number' },
          { name: 'nguoiThucHien', label: 'Người thực hiện', type: 'text' }
        ]
      },
      {
        tableName: 'Bảng 5. Thu hoạch và tiêu thụ',
        isMultiRow: true,
        fields: [
          { name: 'thoiGianThuHoach', label: 'Thời gian thu hoạch', type: 'date' },
          { name: 'maSoLo', label: 'Mã số lô thu hoạch', type: 'text' },
          { name: 'tenSanPham', label: 'Tên sản phẩm', type: 'text' },
          { name: 'sanLuong', label: 'Sản lượng (kg)', type: 'number' },
          { name: 'veSinhDungCu', label: 'Vệ sinh dụng cụ (Đ/K)', type: 'select', options: ['Đ', 'K'] },
          { name: 'ngayBan', label: 'Ngày bán', type: 'date' },
          { name: 'soLuongBan', label: 'Số lượng bán (kg)', type: 'number' },
          { name: 'donViMua', label: 'Đơn vị thu mua/Địa chỉ', type: 'text' },
          { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
        ]
      }
    ];

    console.log('Starting to seed VietGAP Crop schemas...');

    // Seed Standard Crops
    for (const cropName of standardCrops) {
      await FormSchema.deleteMany({ name: { $regex: new RegExp(`^${cropName}$`, 'i') } });
      const schema = new FormSchema({
        name: cropName,
        description: `Sổ nhật ký điện tử cho ${cropName} tuân thủ tiêu chuẩn VietGAP.`,
        category: 'trongtrot',
        tables: standardTables
      });
      await schema.save();
      console.log(`- Seeded/Updated Standard: ${cropName}`);
    }

    // Seed Mushroom Crops
    for (const cropName of mushroomCrops) {
      await FormSchema.deleteMany({ name: { $regex: new RegExp(`^${cropName}$`, 'i') } });
      const schema = new FormSchema({
        name: cropName,
        description: `Sổ nhật ký điện tử chuyên biệt cho ${cropName} VietGAP.`,
        category: 'trongtrot',
        tables: mushroomTables
      });
      await schema.save();
      console.log(`- Seeded/Updated Mushroom: ${cropName}`);
    }

    console.log('\nAll VietGAP Crop Schemas updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding schemas:', error);
    process.exit(1);
  }
};

seedVietGAPCrop();
