require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const FormSchema = require('./src/models/FormSchema');

const durianSchema = {
  name: 'Sổ nhật ký Sầu riêng VietGAP & GACC Xuất Khẩu 2026',
  description: 'Sổ nhật ký canh tác sầu riêng (Monthong / Dona / TR6) theo chuẩn VietGAP và GACC xuất khẩu chính ngạch sang Trung Quốc – HTX Sầu Riêng Tân Quan Ecofarm',
  category: 'trongtrot',
  tables: [
    // 1. Thông tin vườn
    {
      tableName: 'Thông tin vườn sầu riêng',
      isMultiRow: false,
      fields: [
        { name: 'owner_name', label: 'Chủ hộ / Tên nông dân', type: 'text', required: true },
        { name: 'parcel_code', label: 'Mã số vùng trồng (MSVT)', type: 'text', required: true },
        { name: 'area_ha', label: 'Diện tích (ha)', type: 'number', required: true },
        { name: 'crop_variety', label: 'Giống sầu riêng', type: 'select', options: ['Monthong', 'Dona', 'TR6', 'Monthong & Dona', 'Dona & TR6', 'Monthong & TR6'], required: true },
        { name: 'tree_count', label: 'Số cây', type: 'number', required: true },
        { name: 'address', label: 'Địa chỉ vườn', type: 'text', required: true },
        { name: 'plant_year', label: 'Năm trồng', type: 'number', required: false },
        { name: 'htx_name', label: 'HTX / Tổ chức', type: 'text', required: false }
      ]
    },
    // 2. Thông tin số lô
    {
      tableName: 'Thông tin lô sản xuất',
      isMultiRow: true,
      fields: [
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'lot_area', label: 'Diện tích lô (ha)', type: 'number', required: true },
        { name: 'lot_variety', label: 'Giống sầu riêng', type: 'select', options: ['Monthong', 'Dona', 'TR6'], required: true },
        { name: 'plant_year', label: 'Năm trồng', type: 'number', required: true },
        { name: 'tree_count', label: 'Số cây trên lô', type: 'number', required: true },
        { name: 'lot_note', label: 'Ghi chú', type: 'textarea', required: false }
      ]
    },
    // 3. Nhật ký chăm sóc
    {
      tableName: 'Nhật ký Chăm sóc',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày thực hiện', type: 'date', required: true },
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'task', label: 'Công việc chăm sóc', type: 'select', options: [
          'Tỉa cành tạo tán',
          'Tỉa chồi nước / cành phụ',
          'Làm cỏ quanh gốc',
          'Bao trái sầu riêng',
          'Xử lý ra hoa nghịch vụ',
          'Xiết nước kích hoa',
          'Tưới phá xiết',
          'Bấm ngọn cành',
          'Phun bổ sung dinh dưỡng lá',
          'Vệ sinh lô vườn',
          'Kiểm tra sinh trưởng'
        ], required: true },
        { name: 'content', label: 'Nội dung chi tiết', type: 'textarea', required: false },
        { name: 'executor', label: 'Người thực hiện', type: 'text', required: true },
        { name: 'note', label: 'Ghi chú', type: 'textarea', required: false }
      ]
    },
    // 4. Nhật ký bón phân
    {
      tableName: 'Nhật ký Bón phân',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày bón phân', type: 'date', required: true },
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'fertilizer_name', label: 'Tên phân bón', type: 'select', options: [
          'NPK 15-15-15+TE (Đầu Trâu)',
          'NPK 20-20-15+TE',
          'Phân Hữu Cơ Vi Sinh Trichoderma',
          'Phân Cá Thủy Phân (Amino Acid)',
          'Canxi Bor (Ca-B) tăng cường đậu trái',
          'Magie Sunfat (MgSO4)',
          'Kali Clorua (KCl 60%)',
          'Phân Super Lân',
          'Phân Urea 46%',
          'Phân hữu cơ ủ hoai',
          'Chế phẩm Humate + Fulvate',
          'Tự nhập (khác)'
        ], required: true },
        { name: 'dose', label: 'Liều lượng', type: 'number', required: true },
        { name: 'unit', label: 'Đơn vị', type: 'select', options: ['kg/gốc', 'g/gốc', 'lít/gốc', 'ml/gốc', 'kg/ha', 'g/ha'], required: true },
        { name: 'method', label: 'Phương pháp bón', type: 'select', options: ['Bón gốc', 'Phun lá', 'Tưới nhỏ giọt qua gốc', 'Vùi đất quanh tán'], required: false },
        { name: 'executor', label: 'Người thực hiện', type: 'text', required: true }
      ]
    },
    // 5. Nhật ký thuốc BVTV
    {
      tableName: 'Nhật ký Thuốc bảo vệ thực vật (BVTV)',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày phun thuốc', type: 'date', required: true },
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'pesticide_name', label: 'Tên thuốc BVTV', type: 'select', options: [
          'Anvil 5SC (Hexaconazole - Trừ nấm hồng)',
          'Ridomil Gold MZ 68WG (Metalaxyl - Trừ thối rễ)',
          'Kasumin 2SL (Kasugamycin - Trừ vi khuẩn)',
          'Actara 25WG (Thiamethoxam - Trừ rầy, bọ trĩ)',
          'Confidor 700WG (Imidacloprid - Trừ rệp sáp)',
          'Emamectin Benzoate (Trừ sâu đục trái)',
          'Phù Đổng Sinh Học (Trichoderma spp.)',
          'Dầu khoáng SK Enspray 99EC',
          'Tự nhập (khác)'
        ], required: true },
        { name: 'active_ingredient', label: 'Hoạt chất chính', type: 'text', required: true },
        { name: 'dose', label: 'Liều lượng pha', type: 'text', required: true },
        { name: 'phi_days', label: 'Thời gian cách ly PHI (ngày)', type: 'number', required: true },
        { name: 'safe_harvest_date', label: 'Ngày thu hoạch an toàn (sau PHI)', type: 'date', required: true },
        { name: 'target_pest', label: 'Đối tượng phòng trừ', type: 'text', required: false },
        { name: 'executor', label: 'Người thực hiện', type: 'text', required: true }
      ]
    },
    // 6. Nhật ký tưới nước
    {
      tableName: 'Nhật ký Tưới nước',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày tưới', type: 'date', required: true },
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'water_source', label: 'Nguồn nước', type: 'select', options: [
          'Hồ tưới Tân Quan',
          'Giếng khoan tại vườn',
          'Hệ thống tưới nhỏ giọt HTX',
          'Suối tự nhiên',
          'Nước mưa thu gom'
        ], required: true },
        { name: 'duration_minutes', label: 'Thời gian tưới (phút)', type: 'number', required: true },
        { name: 'irrigation_method', label: 'Phương pháp tưới', type: 'select', options: ['Tưới nhỏ giọt', 'Tưới phun mưa', 'Tưới gốc', 'Tưới tràn'], required: false },
        { name: 'executor', label: 'Người thực hiện', type: 'text', required: true }
      ]
    },
    // 7. Nhật ký sâu bệnh
    {
      tableName: 'Nhật ký Sâu bệnh & Xử lý',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày phát hiện', type: 'date', required: true },
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'pest_type', label: 'Loại sâu / bệnh hại', type: 'select', options: [
          'Nấm hồng (Corticium salmonicolor)',
          'Thối rễ Phytophthora',
          'Bệnh cháy lá',
          'Rệp sáp hại rễ & thân',
          'Nhện đỏ hại lá',
          'Sâu đục trái sầu riêng',
          'Bọ trĩ hại hoa',
          'Rầy bông hại hoa',
          'Ruồi đục quả',
          'Bệnh thán thư hại trái'
        ], required: true },
        { name: 'severity', label: 'Mức độ gây hại', type: 'select', options: ['Nhẹ (Dưới 5%)', 'Trung bình (5–20%)', 'Nặng (Trên 20%)'], required: true },
        { name: 'method', label: 'Biện pháp xử lý', type: 'textarea', required: true },
        { name: 'result', label: 'Kết quả sau xử lý', type: 'select', options: ['Đã kiểm soát hoàn toàn', 'Giảm nhẹ – cần theo dõi thêm', 'Chưa kiểm soát được'], required: true },
        { name: 'executor', label: 'Người kiểm tra', type: 'text', required: true }
      ]
    },
    // 8. Nhật ký thu hoạch
    {
      tableName: 'Nhật ký Thu hoạch',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày thu hoạch', type: 'date', required: true },
        { name: 'lot_code', label: 'Mã lô', type: 'text', required: true },
        { name: 'crop_variety', label: 'Giống sầu riêng thu hoạch', type: 'select', options: ['Monthong', 'Dona', 'TR6'], required: true },
        { name: 'yield_kg', label: 'Sản lượng (kg)', type: 'number', required: true },
        { name: 'fruit_count', label: 'Số quả', type: 'number', required: false },
        { name: 'avg_weight_kg', label: 'Trọng lượng quả trung bình (kg)', type: 'number', required: false },
        { name: 'buyer', label: 'Khách hàng / Thương lái', type: 'text', required: false },
        { name: 'gacc_standard', label: 'Đánh giá tiêu chuẩn GACC', type: 'select', options: ['Đạt chuẩn GACC xuất khẩu', 'Đạt tiêu dùng nội địa', 'Loại B (tiêu thụ nội địa)'], required: true },
        { name: 'note', label: 'Ghi chú', type: 'textarea', required: false }
      ]
    },
    // 9. Nhật ký bán hàng
    {
      tableName: 'Nhật ký Bán hàng & Doanh thu',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày bán', type: 'date', required: true },
        { name: 'buyer', label: 'Khách hàng / Đối tác', type: 'text', required: true },
        { name: 'weight_kg', label: 'Khối lượng (kg)', type: 'number', required: true },
        { name: 'unit_price', label: 'Đơn giá (VNĐ/kg)', type: 'number', required: true },
        { name: 'total_amount', label: 'Thành tiền (VNĐ)', type: 'number', required: true },
        { name: 'invoice_no', label: 'Mã hóa đơn / Phiếu xuất', type: 'text', required: false },
        { name: 'payment_method', label: 'Hình thức thanh toán', type: 'select', options: ['Tiền mặt', 'Chuyển khoản ngân hàng', 'Công nợ HTX'], required: false }
      ]
    },
    // 10. Đánh giá nội bộ VietGAP / GACC
    {
      tableName: 'Đánh giá Nội bộ VietGAP & GACC',
      isMultiRow: true,
      fields: [
        { name: 'date', label: 'Ngày đánh giá', type: 'date', required: true },
        { name: 'content', label: 'Nội dung kiểm tra', type: 'select', options: [
          'Kiểm tra nhật ký cách ly PHI thuốc BVTV',
          'Kiểm tra danh mục vật tư được phép sử dụng',
          'Kiểm tra tồn dư hoá chất trên trái',
          'Kiểm tra hạ tầng kho bãi & vệ sinh vườn',
          'Đánh giá theo tiêu chí GACC xuất khẩu',
          'Kiểm tra hồ sơ truy xuất nguồn gốc QR',
          'Kiểm tra IoT nhiệt độ độ ẩm & tưới nước'
        ], required: true },
        { name: 'result', label: 'Kết quả đánh giá', type: 'select', options: ['Đạt chuẩn VietGAP / GACC', 'Cần khắc phục nhỏ', 'Không đạt – cần xử lý ngay'], required: true },
        { name: 'remediation', label: 'Biện pháp khắc phục (nếu có)', type: 'textarea', required: false },
        { name: 'auditor', label: 'Người kiểm tra', type: 'text', required: true },
        { name: 'signature', label: 'Chữ ký xác nhận', type: 'signature', required: false }
      ]
    }
  ]
};

const run = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');

    // Kiểm tra xem schema sầu riêng đã tồn tại chưa
    const existing = await FormSchema.findOne({ name: durianSchema.name });
    if (existing) {
      await FormSchema.deleteOne({ _id: existing._id });
      console.log('🗑️  Đã xóa schema Sầu riêng cũ để cập nhật lại');
    }

    const created = await FormSchema.create(durianSchema);
    console.log('🌿 Đã tạo Schema Sổ Nhật Ký Sầu Riêng GACC thành công!');
    console.log('   ID:', created._id);
    console.log('   Tên:', created.name);
    console.log('   Số bảng nhật ký:', created.tables.length);
    created.tables.forEach((t, i) => {
      console.log(`   [${i + 1}] ${t.tableName} (${t.fields.length} trường)`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
