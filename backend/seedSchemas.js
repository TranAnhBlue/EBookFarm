const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FormSchema = require('./src/models/FormSchema');

dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Helper fields dùng chung ───────────────────────────────────────────────
const commonInfo = [
  { name: 'owner_name', label: 'Họ tên chủ hộ',     type: 'text',   required: true  },
  { name: 'address',    label: 'Địa chỉ',            type: 'text',   required: true  },
  { name: 'area',       label: 'Diện tích (m²/ha)',   type: 'number', required: true  },
  { name: 'start_date', label: 'Ngày bắt đầu',       type: 'date',   required: true  },
  { name: 'lot_code',   label: 'Lô sản xuất',        type: 'text',   required: false },
];

const careTable = {
  tableName: 'Chăm sóc & Phân bón',
  fields: [
    { name: 'care_date',       label: 'Ngày chăm sóc',        type: 'date',   required: true  },
    { name: 'fertilizer_type', label: 'Loại phân bón',        type: 'select', options: ['Urê', 'DAP', 'NPK', 'Phân hữu cơ', 'Phân vi sinh', 'Phân chuồng'], required: false },
    { name: 'fertilizer_amt',  label: 'Lượng bón (kg/ha)',    type: 'number', required: false },
    { name: 'irrigation',      label: 'Phương pháp tưới',     type: 'select', options: ['Tưới nhỏ giọt', 'Tưới phun mưa', 'Tưới rãnh', 'Tưới tay'], required: false },
    { name: 'note',            label: 'Ghi chú',              type: 'text',   required: false },
  ]
};

const pesticideTable = {
  tableName: 'Phun thuốc BVTV',
  fields: [
    { name: 'spray_date',   label: 'Ngày phun',                   type: 'date',   required: true  },
    { name: 'pest_name',    label: 'Tên thuốc',                   type: 'text',   required: true  },
    { name: 'pest_type',    label: 'Loại thuốc',                  type: 'select', options: ['Thuốc sâu', 'Thuốc bệnh', 'Thuốc cỏ', 'Thuốc ốc', 'Thuốc nhện'], required: true  },
    { name: 'dose',         label: 'Liều lượng (ml/l hoặc g/l)',  type: 'number', required: true  },
    { name: 'phi_days',     label: 'Thời gian cách ly PHI (ngày)',type: 'number', required: true  },
  ]
};

const harvestTable = (unit = 'kg') => ({
  tableName: 'Thu hoạch',
  fields: [
    { name: 'harvest_date',  label: 'Ngày thu hoạch',      type: 'date',   required: true  },
    { name: 'yield',         label: `Sản lượng (${unit})`, type: 'number', required: true  },
    { name: 'quality_grade', label: 'Phân loại',           type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: false },
    { name: 'note',          label: 'Ghi chú',             type: 'text',   required: false },
  ]
});

// ─── Danh sách schema ───────────────────────────────────────────────────────
const schemas = [

  // 1. Chè búp
  {
    name: 'Chè búp',
    description: 'Nhật ký sản xuất chè búp theo tiêu chuẩn VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'tea_variety', label: 'Giống chè', type: 'select', options: ['Kim Tuyên', 'Oolong', 'PH1', 'LDP1', 'LDP2', 'Trung du'], required: true }] },
      { tableName: 'Chăm sóc vườn chè', fields: [
        { name: 'prune_date',  label: 'Ngày đốn cành',   type: 'date',   required: false },
        { name: 'prune_type',  label: 'Loại đốn',        type: 'select', options: ['Đốn phớt', 'Đốn lửng', 'Đốn đau', 'Đốn trẻ lại'], required: false },
        { name: 'care_date',   label: 'Ngày bón phân',   type: 'date',   required: true  },
        { name: 'fertilizer',  label: 'Loại phân',       type: 'text',   required: false },
        { name: 'fert_amount', label: 'Lượng bón (kg)',  type: 'number', required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch búp chè', fields: [
        { name: 'harvest_date', label: 'Ngày hái',            type: 'date',   required: true  },
        { name: 'flush_type',   label: 'Tiêu chuẩn hái',     type: 'select', options: ['1 tôm 2 lá', '1 tôm 3 lá', 'Búp mù xòe'], required: true  },
        { name: 'yield_kg',     label: 'Sản lượng (kg búp tươi)', type: 'number', required: true },
        { name: 'quality',      label: 'Chất lượng',         type: 'select', options: ['Loại A', 'Loại B', 'Loại C'], required: false },
      ]},
    ]
  },

  // 2. Cà phê
  {
    name: 'Cà phê',
    description: 'Nhật ký sản xuất cà phê theo tiêu chuẩn VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'coffee_variety', label: 'Giống cà phê', type: 'select', options: ['Robusta', 'Arabica', 'Catimor', 'Moka'], required: true }] },
      careTable,
      pesticideTable,
      { tableName: 'Thu hoạch cà phê', fields: [
        { name: 'harvest_date',  label: 'Ngày thu hoạch',    type: 'date',   required: true  },
        { name: 'method',        label: 'Phương pháp thu',   type: 'select', options: ['Hái chọn', 'Hái tuốt', 'Hái cơ giới'], required: true  },
        { name: 'yield_ton',     label: 'Sản lượng (tấn/ha)', type: 'number', required: true },
        { name: 'cherry_rate',   label: 'Tỉ lệ quả chín (%)', type: 'number', required: false },
      ]},
    ]
  },

  // 3. Nấm
  {
    name: 'Nấm',
    description: 'Nhật ký sản xuất nấm ăn (nấm rơm, nấm bào ngư, nấm hương...)',
    tables: [
      { tableName: 'Thông tin chung', fields: [
        { name: 'owner_name',  label: 'Họ tên chủ hộ', type: 'text',   required: true },
        { name: 'address',     label: 'Địa chỉ',       type: 'text',   required: true },
        { name: 'mushroom_type', label: 'Loại nấm',    type: 'select', options: ['Nấm rơm', 'Nấm bào ngư', 'Nấm hương', 'Nấm linh chi', 'Nấm mộc nhĩ'], required: true },
        { name: 'substrate',   label: 'Nguyên liệu giá thể', type: 'select', options: ['Rơm rạ', 'Mùn cưa', 'Bã mía', 'Lõi ngô'], required: true },
        { name: 'start_date',  label: 'Ngày cấy giống', type: 'date',  required: true },
        { name: 'lot_code',    label: 'Mã mẻ',         type: 'text',   required: false },
      ]},
      { tableName: 'Quản lý nhà trồng', fields: [
        { name: 'log_date',    label: 'Ngày ghi',           type: 'date',   required: true  },
        { name: 'temperature', label: 'Nhiệt độ (°C)',      type: 'number', required: false },
        { name: 'humidity',    label: 'Độ ẩm (%)',          type: 'number', required: false },
        { name: 'mycelium',    label: 'Tình trạng tơ nấm', type: 'select', options: ['Lan đều', 'Lan chậm', 'Nhiễm bệnh'], required: false },
      ]},
      harvestTable('kg'),
    ]
  },

  // 4. Dưa lưới
  {
    name: 'Dưa lưới',
    description: 'Nhật ký canh tác dưa lưới trong nhà màng',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống dưa', type: 'select', options: ['TL-3', 'Kim Cô Nương', 'Taki', 'Hamster', 'F1 Lộc Trời'], required: true }] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',         type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày xuống giống',      type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách cây (cm)',  type: 'number', required: false },
        { name: 'growing_method', label: 'Phương pháp', type: 'select', options: ['Nhà màng', 'Nhà lưới', 'Ngoài trời'], required: true },
      ]},
      { tableName: 'Dinh dưỡng & Tưới', fields: [
        { name: 'log_date',    label: 'Ngày ghi',             type: 'date',   required: true  },
        { name: 'ec_level',    label: 'EC dung dịch (mS/cm)', type: 'number', required: false },
        { name: 'ph_level',    label: 'pH dung dịch',         type: 'number', required: false },
        { name: 'irrigation',  label: 'Tần suất tưới',        type: 'text',   required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',          type: 'date',   required: true  },
        { name: 'fruit_weight', label: 'Trọng lượng quả TB (g)',  type: 'number', required: false },
        { name: 'brix',         label: 'Độ Brix (%)',             type: 'number', required: false },
        { name: 'yield_total',  label: 'Tổng sản lượng (kg)',     type: 'number', required: true  },
      ]},
    ]
  },

  // 5. Lúa
  {
    name: 'Lúa',
    description: 'Nhật ký sản xuất lúa theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo,
        { name: 'rice_variety', label: 'Giống lúa', type: 'select', options: ['IR504', 'OM5451', 'Jasmine 85', 'ST25', 'Đài thơm 8', 'OM18'], required: true },
        { name: 'season', label: 'Vụ sản xuất', type: 'select', options: ['Đông Xuân', 'Hè Thu', 'Thu Đông'], required: true },
      ]},
      { tableName: 'Chuẩn bị đất & Gieo sạ', fields: [
        { name: 'plow_date',  label: 'Ngày cày bừa',        type: 'date',   required: true  },
        { name: 'seed_rate',  label: 'Lượng giống (kg/ha)', type: 'number', required: true  },
        { name: 'sow_date',   label: 'Ngày gieo sạ',        type: 'date',   required: true  },
        { name: 'water_level',label: 'Mức nước (cm)',        type: 'number', required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('tấn/ha'),
    ]
  },

  // 6. Rau muống
  {
    name: 'Rau muống',
    description: 'Nhật ký sản xuất rau muống (trồng đất / thủy canh)',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'method', label: 'Phương pháp trồng', type: 'select', options: ['Trồng đất', 'Rau muống nước', 'Thủy canh'], required: true }] },
      { tableName: 'Xuống giống & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo / cắm hom', type: 'date',   required: true  },
        { name: 'density',    label: 'Mật độ (cây/m²)',     type: 'number', required: false },
        { name: 'fertilizer', label: 'Phân bón',            type: 'text',   required: false },
        { name: 'irrigation', label: 'Tưới nước',           type: 'select', options: ['Tưới ngập', 'Tưới phun', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 7. Bí đỏ
  {
    name: 'Bí đỏ',
    description: 'Nhật ký sản xuất bí đỏ theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống bí', type: 'select', options: ['Bí đỏ lai F1', 'Kabocha', 'Bí đỏ địa phương'], required: true }] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',      type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng cây con', type: 'date',   required: false },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 8. Rau cải cúc
  {
    name: 'Rau cải cúc',
    description: 'Nhật ký sản xuất rau cải cúc (tần ô) theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo] },
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',    label: 'Ngày gieo',          type: 'date',   required: true  },
        { name: 'density',     label: 'Mật độ (cây/m²)',    type: 'number', required: false },
        { name: 'fertilizer',  label: 'Phân bón sử dụng',  type: 'text',   required: false },
        { name: 'irrigation',  label: 'Cách tưới',         type: 'select', options: ['Tưới phun mưa', 'Tưới nhỏ giọt', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 9. Rau cải thìa
  {
    name: 'Rau cải thìa',
    description: 'Nhật ký sản xuất rau cải thìa theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo] },
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',    label: 'Ngày gieo',          type: 'date',   required: true  },
        { name: 'transplant',  label: 'Ngày bứng cấy',     type: 'date',   required: false },
        { name: 'fertilizer',  label: 'Phân bón sử dụng',  type: 'text',   required: false },
        { name: 'irrigation',  label: 'Cách tưới',         type: 'select', options: ['Tưới phun mưa', 'Tưới nhỏ giọt', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 10. Rau xà lách
  {
    name: 'Rau xà lách',
    description: 'Nhật ký sản xuất rau xà lách theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống xà lách', type: 'select', options: ['Xà lách cuộn', 'Xà lách Romaine', 'Iceberg', 'Oakleaf'], required: true }] },
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',    label: 'Ngày gieo',          type: 'date',   required: true  },
        { name: 'plant_date',  label: 'Ngày trồng',        type: 'date',   required: false },
        { name: 'method',      label: 'Phương pháp',       type: 'select', options: ['Trồng đất', 'Thủy canh NFT', 'DWC'], required: true },
        { name: 'fertilizer',  label: 'Phân / dung dịch',  type: 'text',   required: false },
      ]},
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 11. Ngô ngọt
  {
    name: 'Ngô ngọt',
    description: 'Nhật ký sản xuất ngô ngọt (bắp ngọt) theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống ngô', type: 'select', options: ['Sugar 75', 'Honey & Pearl', 'BD95', 'AgriGold'], required: true }] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',      type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
        { name: 'density',    label: 'Mật độ (cây/ha)',    type: 'number', required: false },
      ]},
      careTable,
      pesticideTable,
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',       type: 'date',   required: true  },
        { name: 'days_after',   label: 'Ngày sau gieo',        type: 'number', required: false },
        { name: 'yield',        label: 'Sản lượng (tấn/ha)',  type: 'number', required: true  },
        { name: 'brix',         label: 'Độ Brix (%)',          type: 'number', required: false },
      ]},
    ]
  },

  // 12. Rau cải
  {
    name: 'Rau cải',
    description: 'Nhật ký sản xuất rau cải (cải ngọt, cải xanh...) theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Loại cải', type: 'select', options: ['Cải ngọt', 'Cải xanh', 'Cải bẹ trắng', 'Cải bẹ xanh'], required: true }] },
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo',          type: 'date',   required: true  },
        { name: 'fertilizer', label: 'Phân bón',           type: 'text',   required: false },
        { name: 'irrigation', label: 'Cách tưới',         type: 'select', options: ['Tưới phun mưa', 'Tưới nhỏ giọt', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 13. Bắp cải
  {
    name: 'Bắp cải',
    description: 'Nhật ký sản xuất bắp cải theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống bắp cải', type: 'select', options: ['KK Cross', 'Đông Dư', 'Sakata', 'Bắp cải tím'], required: true }] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo vườn ươm', type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng',         type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 14. Bầu sao
  {
    name: 'Bầu sao',
    description: 'Nhật ký sản xuất bầu sao theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',     type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng cây con',type: 'date',   required: false },
        { name: 'trellis',    label: 'Làm giàn',          type: 'boolean',required: false },
        { name: 'spacing',    label: 'Khoảng cách (cm)',  type: 'number', required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 15. Rau ngót
  {
    name: 'Rau ngót',
    description: 'Nhật ký sản xuất rau ngót theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo] },
      { tableName: 'Trồng & Chăm sóc', fields: [
        { name: 'plant_date', label: 'Ngày trồng hom',     type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
        { name: 'fertilizer', label: 'Phân bón',           type: 'text',   required: false },
        { name: 'pruning',    label: 'Ngày cắt tỉa',       type: 'date',   required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch lá non', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',   type: 'date',   required: true  },
        { name: 'yield_kg',     label: 'Sản lượng (kg)',   type: 'number', required: true  },
        { name: 'cycle_days',   label: 'Chu kỳ thu (ngày)',type: 'number', required: false },
      ]},
    ]
  },

  // 16. Mướp đắng
  {
    name: 'Mướp đắng',
    description: 'Nhật ký sản xuất mướp đắng (khổ qua) theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống mướp đắng', type: 'select', options: ['Lai F1 NS', 'Bitter melon xanh', 'Bitter melon trắng'], required: false }] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',      type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày xuống giống',   type: 'date',   required: false },
        { name: 'trellis',    label: 'Loại giàn',          type: 'select', options: ['Giàn phẳng', 'Giàn mái', 'Leo rào'], required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 17. Mướp ngọt
  {
    name: 'Mướp ngọt',
    description: 'Nhật ký sản xuất mướp ngọt theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',      type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng',         type: 'date',   required: false },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 18. Dưa chuột
  {
    name: 'Dưa chuột',
    description: 'Nhật ký sản xuất dưa chuột theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống dưa chuột', type: 'select', options: ['Cucumber F1', 'Mini cucumber', 'Dưa baby', 'Dưa chuột ta'], required: true }] },
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',      type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng cây con', type: 'date',   required: false },
        { name: 'method',     label: 'Phương thức',        type: 'select', options: ['Trồng đất', 'Nhà màng', 'Nhà lưới'], required: false },
      ]},
      careTable,
      pesticideTable,
      harvestTable('kg'),
    ]
  },

  // 19. Nấm Đông trùng
  {
    name: 'Nấm Đông trùng',
    description: 'Nhật ký sản xuất nấm Đông trùng hạ thảo (Cordyceps militaris)',
    tables: [
      { tableName: 'Thông tin chung', fields: [
        { name: 'owner_name',   label: 'Họ tên chủ hộ',     type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ',            type: 'text',   required: true  },
        { name: 'room_area',    label: 'Diện tích phòng (m²)', type: 'number', required: true },
        { name: 'start_date',   label: 'Ngày cấy giống',     type: 'date',   required: true  },
        { name: 'lot_code',     label: 'Mã mẻ nuôi cấy',    type: 'text',   required: false },
        { name: 'substrate',    label: 'Cơ chất',            type: 'select', options: ['Nhộng tằm', 'Gạo lứt', 'Gạo lức + Nhộng', 'Nhân tạo tổng hợp'], required: true },
      ]},
      { tableName: 'Kiểm soát môi trường', fields: [
        { name: 'log_date',     label: 'Ngày ghi',            type: 'date',   required: true  },
        { name: 'temperature',  label: 'Nhiệt độ (°C)',       type: 'number', required: true  },
        { name: 'humidity',     label: 'Độ ẩm (%)',           type: 'number', required: true  },
        { name: 'light_hours',  label: 'Thời gian chiếu sáng (giờ/ngày)', type: 'number', required: false },
        { name: 'co2_ppm',      label: 'CO₂ (ppm)',           type: 'number', required: false },
        { name: 'growth_stage', label: 'Giai đoạn sinh trưởng', type: 'select', options: ['Ủ giống', 'Phát triển tơ', 'Ra quả thể', 'Thu hoạch'], required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',      type: 'date',   required: true  },
        { name: 'yield_fresh',  label: 'Sản lượng tươi (g)',  type: 'number', required: true  },
        { name: 'yield_dry',    label: 'Sản lượng khô (g)',   type: 'number', required: false },
        { name: 'quality',      label: 'Chất lượng',          type: 'select', options: ['Loại 1 (vàng óng)', 'Loại 2', 'Không đạt'], required: false },
      ]},
    ]
  },

  // 20. Bưởi
  {
    name: 'Bưởi',
    description: 'Nhật ký sản xuất bưởi theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống bưởi', type: 'select', options: ['Bưởi Năm Roi', 'Bưởi Da Xanh', 'Bưởi Diễn', 'Bưởi Phúc Trạch', 'Bưởi Đoan Hùng'], required: true }] },
      { tableName: 'Chăm sóc vườn', fields: [
        { name: 'care_date',       label: 'Ngày chăm sóc',     type: 'date',   required: true  },
        { name: 'fertilizer_type', label: 'Loại phân',         type: 'text',   required: false },
        { name: 'fertilizer_amt',  label: 'Lượng bón (kg/cây)',type: 'number', required: false },
        { name: 'pruning',         label: 'Cắt tỉa / tạo tán', type: 'boolean',required: false },
        { name: 'thin_fruit',      label: 'Tỉa quả',           type: 'boolean',required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',    type: 'date',   required: true  },
        { name: 'yield_ton',    label: 'Sản lượng (tấn)',   type: 'number', required: true  },
        { name: 'avg_weight',   label: 'KL quả TB (g)',     type: 'number', required: false },
        { name: 'quality',      label: 'Phân loại',         type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: false },
      ]},
    ]
  },

  // 21. Vải
  {
    name: 'Vải',
    description: 'Nhật ký sản xuất vải thiều theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống vải', type: 'select', options: ['Vải thiều Thanh Hà', 'Vải thiều Lục Ngạn', 'Vải sớm u hồng', 'Vải lai chín sớm'], required: true }] },
      { tableName: 'Chăm sóc vườn', fields: [
        { name: 'care_date',       label: 'Ngày chăm sóc',   type: 'date',   required: true  },
        { name: 'fertilizer_type', label: 'Loại phân',       type: 'text',   required: false },
        { name: 'fertilizer_amt',  label: 'Lượng bón (kg)',  type: 'number', required: false },
        { name: 'pruning',         label: 'Cắt tỉa',         type: 'boolean',required: false },
        { name: 'flower_induction',label: 'Xử lý ra hoa',   type: 'boolean',required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',   type: 'date',   required: true  },
        { name: 'yield_ton',    label: 'Sản lượng (tấn)',  type: 'number', required: true  },
        { name: 'quality',      label: 'Phân loại',        type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: false },
        { name: 'buyer',        label: 'Đơn vị thu mua',  type: 'text',   required: false },
      ]},
    ]
  },

  // 22. Hoa cúc
  {
    name: 'Hoa cúc',
    description: 'Nhật ký sản xuất hoa cúc theo VietGAP',
    tables: [
      { tableName: 'Thông tin chung', fields: [...commonInfo, { name: 'variety', label: 'Giống hoa cúc', type: 'select', options: ['Cúc vàng', 'Cúc trắng', 'Cúc tím', 'Cúc mâm xôi', 'Cúc đại đóa'], required: true }] },
      { tableName: 'Trồng & Chăm sóc', fields: [
        { name: 'plant_date',   label: 'Ngày trồng hom',     type: 'date',   required: true  },
        { name: 'light_control',label: 'Điều tiết ánh sáng', type: 'select', options: ['Che tối', 'Đèn bổ sung', 'Tự nhiên'], required: false },
        { name: 'fertilizer',   label: 'Phân bón',           type: 'text',   required: false },
        { name: 'irrigation',   label: 'Tưới nước',         type: 'select', options: ['Nhỏ giọt', 'Phun sương', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch hoa', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',      type: 'date',   required: true  },
        { name: 'bunches',      label: 'Số bó / cành thu được', type: 'number', required: true },
        { name: 'stage',        label: 'Độ nở khi cắt',      type: 'select', options: ['Nụ', 'Hé nở', 'Nở 1/2', 'Nở hoàn toàn'], required: false },
        { name: 'buyer',        label: 'Đơn vị tiêu thụ',    type: 'text',   required: false },
      ]},
    ]
  },

];

// ─── Chạy seed ───────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    const deleted = await FormSchema.deleteMany({});
    console.log(`🗑️  Đã xoá ${deleted.deletedCount} schema cũ`);

    await FormSchema.insertMany(schemas);
    console.log(`✅ Đã thêm ${schemas.length} schema mới:`);
    schemas.forEach(s => console.log(`   - ${s.name}`));

    console.log('\n🎉 Hoàn thành!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

seed();
