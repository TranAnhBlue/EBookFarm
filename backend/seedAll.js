/**
 * seedAll.js — Xoá toàn bộ FormSchema cũ và seed lại
 * với field `category` để phân biệt trồng trọt / chăn nuôi / thuỷ sản / hữu cơ
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FormSchema = require('./src/models/FormSchema');

dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Helper tables tái sử dụng ────────────────────────────────────────────
const pesticideTable = {
  tableName: 'Phun thuốc BVTV',
  fields: [
    { name: 'spray_date', label: 'Ngày phun', type: 'date', required: true },
    { name: 'pest_name',  label: 'Tên thuốc', type: 'text', required: true },
    { name: 'pest_type',  label: 'Loại thuốc', type: 'select', options: ['Thuốc sâu', 'Thuốc bệnh', 'Thuốc cỏ', 'Thuốc ốc', 'Thuốc nhện'], required: true },
    { name: 'dose',       label: 'Liều lượng (ml/l)', type: 'number', required: true },
    { name: 'phi_days',   label: 'Thời gian cách ly PHI (ngày)', type: 'number', required: true },
  ]
};

const harvestTable = (unit = 'kg') => ({
  tableName: 'Thu hoạch',
  fields: [
    { name: 'harvest_date',  label: 'Ngày thu hoạch',         type: 'date',   required: true  },
    { name: 'yield',         label: `Sản lượng (${unit})`,    type: 'number', required: true  },
    { name: 'quality_grade', label: 'Phân loại',              type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: false },
    { name: 'note',          label: 'Ghi chú',                type: 'text',   required: false },
  ]
});

const commonInfo = (extra = []) => ({
  tableName: 'Thông tin chung',
  fields: [
    { name: 'owner_name', label: 'Họ tên chủ hộ',      type: 'text',   required: true  },
    { name: 'address',    label: 'Địa chỉ',             type: 'text',   required: true  },
    { name: 'area',       label: 'Diện tích (m²/ha)',    type: 'number', required: true  },
    { name: 'start_date', label: 'Ngày bắt đầu',        type: 'date',   required: true  },
    { name: 'lot_code',   label: 'Lô sản xuất',         type: 'text',   required: false },
    ...extra
  ]
});

const careTable = {
  tableName: 'Chăm sóc & Phân bón',
  fields: [
    { name: 'care_date',       label: 'Ngày chăm sóc',      type: 'date',   required: true  },
    { name: 'fertilizer_type', label: 'Loại phân bón',       type: 'select', options: ['Urê', 'DAP', 'NPK', 'Phân hữu cơ', 'Phân vi sinh', 'Phân chuồng'], required: false },
    { name: 'fertilizer_amt',  label: 'Lượng bón (kg/ha)',   type: 'number', required: false },
    { name: 'irrigation',      label: 'Phương pháp tưới',   type: 'select', options: ['Tưới nhỏ giọt', 'Tưới phun mưa', 'Tưới rãnh', 'Tưới tay'], required: false },
    { name: 'note',            label: 'Ghi chú',             type: 'text',   required: false },
  ]
};

// ════════════════════════════════════════════════════════════
//  TRỒNG TRỌT  (category: 'trongtrot')
// ════════════════════════════════════════════════════════════
const trongtrotSchemas = [
  {
    name: 'Chè búp', category: 'trongtrot',
    description: 'Nhật ký sản xuất chè búp theo VietGAP',
    tables: [
      commonInfo([{ name: 'tea_variety', label: 'Giống chè', type: 'select', options: ['Kim Tuyên', 'Oolong', 'PH1', 'LDP1', 'LDP2', 'Trung du'], required: true }]),
      { tableName: 'Chăm sóc vườn chè', fields: [
        { name: 'care_date',   label: 'Ngày chăm sóc',  type: 'date',   required: true  },
        { name: 'prune_type',  label: 'Loại đốn cành',  type: 'select', options: ['Đốn phớt', 'Đốn lửng', 'Đốn đau', 'Đốn trẻ lại'], required: false },
        { name: 'fertilizer',  label: 'Loại phân bón',  type: 'text',   required: false },
        { name: 'fert_amount', label: 'Lượng bón (kg)', type: 'number', required: false },
        { name: 'irrigation',  label: 'Tưới nước',      type: 'select', options: ['Tưới nhỏ giọt', 'Tưới phun', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch búp chè', fields: [
        { name: 'harvest_date', label: 'Ngày hái',      type: 'date',   required: true  },
        { name: 'flush_type',   label: 'Tiêu chuẩn hái', type: 'select', options: ['1 tôm 2 lá', '1 tôm 3 lá', 'Búp mù xòe'], required: true },
        { name: 'yield_kg',     label: 'Sản lượng (kg búp tươi)', type: 'number', required: true },
        { name: 'quality',      label: 'Chất lượng',   type: 'select', options: ['Loại A', 'Loại B', 'Loại C'], required: false },
      ]},
    ]
  },
  {
    name: 'Cà phê', category: 'trongtrot',
    description: 'Nhật ký sản xuất cà phê theo VietGAP',
    tables: [
      commonInfo([{ name: 'coffee_variety', label: 'Giống cà phê', type: 'select', options: ['Robusta', 'Arabica', 'Catimor', 'Moka'], required: true }]),
      careTable, pesticideTable,
      { tableName: 'Thu hoạch cà phê', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',    type: 'date',   required: true  },
        { name: 'method',       label: 'Phương pháp thu',   type: 'select', options: ['Hái chọn', 'Hái tuốt', 'Hái cơ giới'], required: true },
        { name: 'yield_ton',    label: 'Sản lượng (tấn/ha)', type: 'number', required: true },
        { name: 'cherry_rate',  label: 'Tỉ lệ quả chín (%)', type: 'number', required: false },
      ]},
    ]
  },
  {
    name: 'Nấm', category: 'trongtrot',
    description: 'Nhật ký sản xuất nấm ăn',
    tables: [
      { tableName: 'Thông tin chung', fields: [
        { name: 'owner_name',    label: 'Họ tên chủ hộ',     type: 'text',   required: true  },
        { name: 'address',       label: 'Địa chỉ',            type: 'text',   required: true  },
        { name: 'mushroom_type', label: 'Loại nấm',           type: 'select', options: ['Nấm rơm', 'Nấm bào ngư', 'Nấm hương', 'Nấm linh chi', 'Nấm mộc nhĩ'], required: true },
        { name: 'substrate',     label: 'Nguyên liệu giá thể', type: 'select', options: ['Rơm rạ', 'Mùn cưa', 'Bã mía', 'Lõi ngô'], required: true },
        { name: 'start_date',    label: 'Ngày cấy giống',     type: 'date',   required: true  },
        { name: 'lot_code',      label: 'Mã mẻ',              type: 'text',   required: false },
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
  {
    name: 'Dưa lưới', category: 'trongtrot',
    description: 'Nhật ký canh tác dưa lưới trong nhà màng',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống dưa', type: 'select', options: ['TL-3', 'Kim Cô Nương', 'Taki', 'Hamster'], required: true }]),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',        type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày xuống giống',     type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách cây (cm)', type: 'number', required: false },
        { name: 'growing_method', label: 'Phương pháp', type: 'select', options: ['Nhà màng', 'Nhà lưới', 'Ngoài trời'], required: true },
      ]},
      { tableName: 'Dinh dưỡng & Tưới', fields: [
        { name: 'log_date',   label: 'Ngày ghi',             type: 'date',   required: true  },
        { name: 'ec_level',   label: 'EC dung dịch (mS/cm)', type: 'number', required: false },
        { name: 'ph_level',   label: 'pH dung dịch',         type: 'number', required: false },
        { name: 'irrigation', label: 'Tần suất tưới',        type: 'text',   required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',         type: 'date',   required: true  },
        { name: 'fruit_weight', label: 'Trọng lượng quả TB (g)', type: 'number', required: false },
        { name: 'brix',         label: 'Độ Brix (%)',            type: 'number', required: false },
        { name: 'yield_total',  label: 'Tổng sản lượng (kg)',    type: 'number', required: true  },
      ]},
    ]
  },
  {
    name: 'Lúa', category: 'trongtrot',
    description: 'Nhật ký sản xuất lúa theo VietGAP',
    tables: [
      commonInfo([
        { name: 'rice_variety', label: 'Giống lúa', type: 'select', options: ['IR504', 'OM5451', 'Jasmine 85', 'ST25', 'Đài thơm 8'], required: true },
        { name: 'season',       label: 'Vụ sản xuất', type: 'select', options: ['Đông Xuân', 'Hè Thu', 'Thu Đông'], required: true },
      ]),
      { tableName: 'Chuẩn bị đất & Gieo sạ', fields: [
        { name: 'plow_date',   label: 'Ngày cày bừa',       type: 'date',   required: true  },
        { name: 'seed_rate',   label: 'Lượng giống (kg/ha)', type: 'number', required: true  },
        { name: 'sow_date',    label: 'Ngày gieo sạ',        type: 'date',   required: true  },
        { name: 'water_level', label: 'Mức nước (cm)',        type: 'number', required: false },
      ]},
      careTable, pesticideTable, harvestTable('tấn/ha'),
    ]
  },
  {
    name: 'Rau muống', category: 'trongtrot',
    description: 'Nhật ký sản xuất rau muống',
    tables: [
      commonInfo([{ name: 'method', label: 'Phương pháp trồng', type: 'select', options: ['Trồng đất', 'Rau muống nước', 'Thủy canh'], required: true }]),
      { tableName: 'Xuống giống & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo / cắm hom', type: 'date',   required: true  },
        { name: 'fertilizer', label: 'Phân bón',             type: 'text',   required: false },
        { name: 'irrigation', label: 'Tưới nước',            type: 'select', options: ['Tưới ngập', 'Tưới phun', 'Tưới tay'], required: false },
      ]},
      pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Bí đỏ', category: 'trongtrot',
    description: 'Nhật ký sản xuất bí đỏ theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống bí', type: 'select', options: ['Bí đỏ lai F1', 'Kabocha', 'Bí đỏ địa phương'], required: true }]),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',      type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng cây con', type: 'date',   required: false },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
      ]},
      careTable, pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Rau cải cúc', category: 'trongtrot',
    description: 'Nhật ký sản xuất rau cải cúc (tần ô) theo VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo',        type: 'date',   required: true  },
        { name: 'fertilizer', label: 'Phân bón sử dụng', type: 'text',   required: false },
        { name: 'irrigation', label: 'Cách tưới',        type: 'select', options: ['Tưới phun mưa', 'Tưới nhỏ giọt', 'Tưới tay'], required: false },
      ]},
      pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Rau cải thìa', category: 'trongtrot',
    description: 'Nhật ký sản xuất rau cải thìa theo VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo',        type: 'date',   required: true  },
        { name: 'fertilizer', label: 'Phân bón sử dụng', type: 'text',   required: false },
        { name: 'irrigation', label: 'Cách tưới',        type: 'select', options: ['Tưới phun mưa', 'Tưới nhỏ giọt', 'Tưới tay'], required: false },
      ]},
      pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Rau xà lách', category: 'trongtrot',
    description: 'Nhật ký sản xuất rau xà lách theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống xà lách', type: 'select', options: ['Xà lách cuộn', 'Romaine', 'Iceberg', 'Oakleaf'], required: true }]),
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo',        type: 'date',   required: true  },
        { name: 'method',     label: 'Phương pháp',      type: 'select', options: ['Trồng đất', 'Thủy canh NFT', 'DWC'], required: true },
        { name: 'fertilizer', label: 'Phân / dung dịch', type: 'text',   required: false },
      ]},
      pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Ngô ngọt', category: 'trongtrot',
    description: 'Nhật ký sản xuất ngô ngọt theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống ngô', type: 'select', options: ['Sugar 75', 'Honey & Pearl', 'BD95'], required: true }]),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date', label: 'Ngày gieo hạt',    type: 'date',   required: true  },
        { name: 'spacing',  label: 'Khoảng cách (cm)', type: 'number', required: false },
      ]},
      careTable, pesticideTable,
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',     type: 'date',   required: true  },
        { name: 'yield',        label: 'Sản lượng (tấn/ha)', type: 'number', required: true  },
        { name: 'brix',         label: 'Độ Brix (%)',         type: 'number', required: false },
      ]},
    ]
  },
  {
    name: 'Rau cải', category: 'trongtrot',
    description: 'Nhật ký sản xuất rau cải (cải ngọt, cải xanh...) theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Loại cải', type: 'select', options: ['Cải ngọt', 'Cải xanh', 'Cải bẹ trắng', 'Cải bẹ xanh'], required: true }]),
      { tableName: 'Gieo trồng & Chăm sóc', fields: [
        { name: 'sow_date',   label: 'Ngày gieo', type: 'date', required: true },
        { name: 'fertilizer', label: 'Phân bón',  type: 'text', required: false },
        { name: 'irrigation', label: 'Cách tưới', type: 'select', options: ['Tưới phun mưa', 'Tưới nhỏ giọt', 'Tưới tay'], required: false },
      ]},
      pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Bắp cải', category: 'trongtrot',
    description: 'Nhật ký sản xuất bắp cải theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống bắp cải', type: 'select', options: ['KK Cross', 'Đông Dư', 'Sakata', 'Bắp cải tím'], required: true }]),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo vườn ươm', type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng',         type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách (cm)',   type: 'number', required: false },
      ]},
      careTable, pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Bầu sao', category: 'trongtrot',
    description: 'Nhật ký sản xuất bầu sao theo VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',     type: 'date',   required: true  },
        { name: 'plant_date', label: 'Ngày trồng cây con', type: 'date',  required: false },
        { name: 'trellis',    label: 'Làm giàn',           type: 'boolean',required: false },
      ]},
      careTable, pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Rau ngót', category: 'trongtrot',
    description: 'Nhật ký sản xuất rau ngót theo VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Trồng & Chăm sóc', fields: [
        { name: 'plant_date', label: 'Ngày trồng hom',   type: 'date',   required: true  },
        { name: 'fertilizer', label: 'Phân bón',          type: 'text',   required: false },
        { name: 'pruning',    label: 'Ngày cắt tỉa',      type: 'date',   required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch lá non', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',    type: 'date',   required: true  },
        { name: 'yield_kg',     label: 'Sản lượng (kg)',     type: 'number', required: true  },
        { name: 'cycle_days',   label: 'Chu kỳ thu (ngày)', type: 'number', required: false },
      ]},
    ]
  },
  {
    name: 'Mướp đắng', category: 'trongtrot',
    description: 'Nhật ký sản xuất mướp đắng (khổ qua) theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống', type: 'select', options: ['Lai F1 NS', 'Bitter melon xanh', 'Bitter melon trắng'], required: false }]),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt',    type: 'date',   required: true  },
        { name: 'trellis',    label: 'Loại giàn',         type: 'select', options: ['Giàn phẳng', 'Giàn mái', 'Leo rào'], required: false },
      ]},
      careTable, pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Mướp ngọt', category: 'trongtrot',
    description: 'Nhật ký sản xuất mướp ngọt theo VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date',   label: 'Ngày gieo hạt', type: 'date',   required: true  },
        { name: 'spacing',    label: 'Khoảng cách',   type: 'number', required: false },
      ]},
      careTable, pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Dưa chuột', category: 'trongtrot',
    description: 'Nhật ký sản xuất dưa chuột theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống dưa chuột', type: 'select', options: ['Cucumber F1', 'Mini cucumber', 'Dưa baby', 'Dưa chuột ta'], required: true }]),
      { tableName: 'Gieo trồng', fields: [
        { name: 'sow_date', label: 'Ngày gieo hạt', type: 'date', required: true },
        { name: 'method',   label: 'Phương thức', type: 'select', options: ['Trồng đất', 'Nhà màng', 'Nhà lưới'], required: false },
      ]},
      careTable, pesticideTable, harvestTable('kg'),
    ]
  },
  {
    name: 'Bưởi', category: 'trongtrot',
    description: 'Nhật ký sản xuất bưởi theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống bưởi', type: 'select', options: ['Năm Roi', 'Da Xanh', 'Diễn', 'Phúc Trạch', 'Đoan Hùng'], required: true }]),
      { tableName: 'Chăm sóc vườn', fields: [
        { name: 'care_date',   label: 'Ngày chăm sóc',   type: 'date',   required: true  },
        { name: 'fertilizer',  label: 'Loại phân',        type: 'text',   required: false },
        { name: 'fert_amt',    label: 'Lượng bón (kg/cây)',type: 'number', required: false },
        { name: 'pruning',     label: 'Cắt tỉa / tạo tán', type: 'boolean', required: false },
        { name: 'thin_fruit',  label: 'Tỉa quả',          type: 'boolean', required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',  type: 'date',   required: true  },
        { name: 'yield_ton',    label: 'Sản lượng (tấn)', type: 'number', required: true  },
        { name: 'avg_weight',   label: 'KL quả TB (g)',   type: 'number', required: false },
        { name: 'quality',      label: 'Phân loại',       type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: false },
      ]},
    ]
  },
  {
    name: 'Vải', category: 'trongtrot',
    description: 'Nhật ký sản xuất vải thiều theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống vải', type: 'select', options: ['Vải thiều Thanh Hà', 'Vải thiều Lục Ngạn', 'Vải sớm u hồng'], required: true }]),
      { tableName: 'Chăm sóc vườn', fields: [
        { name: 'care_date',        label: 'Ngày chăm sóc',  type: 'date',   required: true  },
        { name: 'fertilizer',       label: 'Loại phân',       type: 'text',   required: false },
        { name: 'fert_amt',         label: 'Lượng bón (kg)',  type: 'number', required: false },
        { name: 'pruning',          label: 'Cắt tỉa',         type: 'boolean', required: false },
        { name: 'flower_induction', label: 'Xử lý ra hoa',   type: 'boolean', required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',  type: 'date',   required: true  },
        { name: 'yield_ton',    label: 'Sản lượng (tấn)', type: 'number', required: true  },
        { name: 'quality',      label: 'Phân loại',       type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: false },
        { name: 'buyer',        label: 'Đơn vị thu mua', type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Hoa cúc', category: 'trongtrot',
    description: 'Nhật ký sản xuất hoa cúc theo VietGAP',
    tables: [
      commonInfo([{ name: 'variety', label: 'Giống hoa cúc', type: 'select', options: ['Cúc vàng', 'Cúc trắng', 'Cúc tím', 'Cúc mâm xôi', 'Cúc đại đóa'], required: true }]),
      { tableName: 'Trồng & Chăm sóc', fields: [
        { name: 'plant_date',    label: 'Ngày trồng hom',     type: 'date',   required: true  },
        { name: 'light_control', label: 'Điều tiết ánh sáng', type: 'select', options: ['Che tối', 'Đèn bổ sung', 'Tự nhiên'], required: false },
        { name: 'fertilizer',    label: 'Phân bón',           type: 'text',   required: false },
        { name: 'irrigation',    label: 'Tưới nước',          type: 'select', options: ['Nhỏ giọt', 'Phun sương', 'Tưới tay'], required: false },
      ]},
      pesticideTable,
      { tableName: 'Thu hoạch hoa', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',       type: 'date',   required: true  },
        { name: 'bunches',      label: 'Số bó / cành',         type: 'number', required: true  },
        { name: 'stage',        label: 'Độ nở khi cắt',        type: 'select', options: ['Nụ', 'Hé nở', 'Nở 1/2', 'Nở hoàn toàn'], required: false },
        { name: 'buyer',        label: 'Đơn vị tiêu thụ',     type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Nấm Đông trùng', category: 'trongtrot',
    description: 'Nhật ký sản xuất nấm Đông trùng hạ thảo',
    tables: [
      { tableName: 'Thông tin chung', fields: [
        { name: 'owner_name',  label: 'Họ tên chủ hộ',     type: 'text',   required: true  },
        { name: 'address',     label: 'Địa chỉ',            type: 'text',   required: true  },
        { name: 'room_area',   label: 'Diện tích phòng (m²)', type: 'number', required: true },
        { name: 'start_date',  label: 'Ngày cấy giống',     type: 'date',   required: true  },
        { name: 'lot_code',    label: 'Mã mẻ',              type: 'text',   required: false },
        { name: 'substrate',   label: 'Cơ chất',            type: 'select', options: ['Nhộng tằm', 'Gạo lứt', 'Gạo lức + Nhộng', 'Nhân tạo'], required: true },
      ]},
      { tableName: 'Kiểm soát môi trường', fields: [
        { name: 'log_date',     label: 'Ngày ghi',           type: 'date',   required: true  },
        { name: 'temperature',  label: 'Nhiệt độ (°C)',      type: 'number', required: true  },
        { name: 'humidity',     label: 'Độ ẩm (%)',          type: 'number', required: true  },
        { name: 'light_hours',  label: 'Chiếu sáng (giờ/ngày)', type: 'number', required: false },
        { name: 'growth_stage', label: 'Giai đoạn sinh trưởng', type: 'select', options: ['Ủ giống', 'Phát triển tơ', 'Ra quả thể', 'Thu hoạch'], required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch',   type: 'date',   required: true  },
        { name: 'yield_fresh',  label: 'Sản lượng tươi (g)', type: 'number', required: true  },
        { name: 'yield_dry',    label: 'Sản lượng khô (g)', type: 'number', required: false },
        { name: 'quality',      label: 'Chất lượng',        type: 'select', options: ['Loại 1', 'Loại 2', 'Không đạt'], required: false },
      ]},
    ]
  },
];

// ════════════════════════════════════════════════════════════
//  CHĂN NUÔI  (category: 'channuoi')
// ════════════════════════════════════════════════════════════
const channuoiSchemas = [
  {
    name: 'Gia cầm', category: 'channuoi',
    description: 'Nhật ký chăn nuôi gà, vịt, ngan, ngỗng theo VietGAP',
    tables: [
      { tableName: 'Thông tin trại', fields: [
        { name: 'farm_name',    label: 'Tên trại chăn nuôi',   type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ trại',          type: 'text',   required: true  },
        { name: 'poultry_type', label: 'Loại gia cầm',          type: 'select', options: ['Gà thịt', 'Gà đẻ', 'Vịt thịt', 'Vịt đẻ', 'Ngan', 'Ngỗng', 'Chim cút'], required: true  },
        { name: 'breed',        label: 'Giống',                 type: 'select', options: ['Gà Tam Hoàng', 'Gà Lương Phượng', 'Gà Ri', 'Ross 308', 'Vịt Super M'], required: false },
        { name: 'flock_size',   label: 'Quy mô đàn (con)',      type: 'number', required: true  },
        { name: 'entry_date',   label: 'Ngày nhập đàn',         type: 'date',   required: true  },
        { name: 'chick_source', label: 'Nguồn gốc con giống',   type: 'text',   required: false },
      ]},
      { tableName: 'Thức ăn & Nước uống', fields: [
        { name: 'feed_date',   label: 'Ngày cho ăn',            type: 'date',   required: true  },
        { name: 'feed_type',   label: 'Loại thức ăn',           type: 'select', options: ['Cám gà con', 'Cám gà thịt', 'Cám gà đẻ', 'Cám tự phối', 'Thóc + cám'], required: true  },
        { name: 'feed_amount', label: 'Lượng thức ăn (kg/ngày)', type: 'number', required: true },
        { name: 'supplement',  label: 'Bổ sung vitamin / men',  type: 'text',   required: false },
        { name: 'mortality',   label: 'Số con chết/bệnh hôm nay', type: 'number', required: false },
      ]},
      { tableName: 'Tiêm phòng vaccine', fields: [
        { name: 'vac_date',   label: 'Ngày tiêm', type: 'date',   required: true  },
        { name: 'vaccine',    label: 'Tên vaccine', type: 'text',  required: true  },
        { name: 'disease',    label: 'Phòng bệnh', type: 'select', options: ['Newcastle', 'Gumboro', 'H5N1', 'Tụ huyết trùng', 'Dịch tả vịt', 'Đậu gà'], required: true  },
        { name: 'method',     label: 'Đường dùng', type: 'select', options: ['Nhỏ mắt/mũi', 'Tiêm dưới da', 'Uống nước', 'Phun sương', 'Chích vào cánh'], required: true  },
        { name: 'head_count', label: 'Số con được tiêm', type: 'number', required: false },
        { name: 'vet_name',   label: 'Thú y thực hiện', type: 'text', required: false },
      ]},
      { tableName: 'Điều trị bệnh', fields: [
        { name: 'treat_date',    label: 'Ngày điều trị',     type: 'date',   required: true  },
        { name: 'symptom',       label: 'Triệu chứng',       type: 'text',   required: true  },
        { name: 'medicine',      label: 'Thuốc điều trị',    type: 'text',   required: true  },
        { name: 'withdraw_days', label: 'Ngưng thuốc trước xuất (ngày)', type: 'number', required: true },
        { name: 'treated_count', label: 'Số con điều trị',  type: 'number', required: false },
      ]},
      { tableName: 'Xuất bán', fields: [
        { name: 'export_date',  label: 'Ngày xuất bán',       type: 'date',   required: true  },
        { name: 'head_sold',    label: 'Số con xuất (con)',    type: 'number', required: true  },
        { name: 'avg_weight',   label: 'Trọng lượng TB (kg/con)', type: 'number', required: true },
        { name: 'price_per_kg', label: 'Giá bán (đ/kg)',      type: 'number', required: false },
        { name: 'buyer',        label: 'Đơn vị thu mua',      type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Bò thịt', category: 'channuoi',
    description: 'Nhật ký chăn nuôi bò thịt an toàn sinh học theo VietGAP',
    tables: [
      { tableName: 'Thông tin đàn bò', fields: [
        { name: 'farm_name',        label: 'Tên trại',              type: 'text',   required: true  },
        { name: 'address',          label: 'Địa chỉ',               type: 'text',   required: true  },
        { name: 'breed',            label: 'Giống bò',              type: 'select', options: ['Brahman', 'Lai Sind', 'BBB', 'Angus', 'Wagyu', 'F1 Brahman'], required: true  },
        { name: 'head_count',       label: 'Tổng số đầu (con)',     type: 'number', required: true  },
        { name: 'entry_date',       label: 'Ngày nhập đàn',         type: 'date',   required: true  },
        { name: 'avg_entry_weight', label: 'KL nhập TB (kg/con)',   type: 'number', required: false },
      ]},
      { tableName: 'Thức ăn hàng ngày', fields: [
        { name: 'log_date',      label: 'Ngày ghi',                type: 'date',   required: true  },
        { name: 'roughage_type', label: 'Loại thức ăn thô',        type: 'select', options: ['Cỏ voi', 'Rơm khô', 'Cây ngô ủ chua', 'Cỏ Ruzi', 'Bã bia'], required: true  },
        { name: 'roughage_kg',   label: 'Thức ăn thô (kg/con)',    type: 'number', required: true  },
        { name: 'concentrate',   label: 'Thức ăn tinh (kg/con)',   type: 'number', required: false },
        { name: 'water_supply',  label: 'Nước uống (lít/con)',     type: 'number', required: false },
      ]},
      { tableName: 'Thú y & Tiêm phòng', fields: [
        { name: 'vac_date',       label: 'Ngày thực hiện',         type: 'date',   required: true  },
        { name: 'treatment_type', label: 'Loại can thiệp',         type: 'select', options: ['Tiêm vaccine', 'Điều trị bệnh', 'Tẩy ký sinh trùng', 'Kiểm tra'], required: true  },
        { name: 'medicine',       label: 'Vaccine / thuốc',        type: 'text',   required: true  },
        { name: 'disease',        label: 'Phòng / điều trị',       type: 'select', options: ['Lở mồm long móng', 'Tụ huyết trùng', 'Xoắn khuẩn', 'Ký sinh trùng'], required: false },
        { name: 'withdraw_days',  label: 'Ngưng thuốc (ngày)',     type: 'number', required: true  },
      ]},
      { tableName: 'Theo dõi tăng trọng', fields: [
        { name: 'weigh_date', label: 'Ngày cân',              type: 'date',   required: true  },
        { name: 'avg_weight', label: 'KL TB đàn (kg/con)',   type: 'number', required: true  },
        { name: 'adg',        label: 'Tăng trọng bình quân (g/ngày)', type: 'number', required: false },
        { name: 'fcr',        label: 'Hệ số FCR',            type: 'number', required: false },
      ]},
      { tableName: 'Xuất chuồng', fields: [
        { name: 'export_date',     label: 'Ngày xuất',           type: 'date',   required: true  },
        { name: 'head_exported',   label: 'Số con xuất',         type: 'number', required: true  },
        { name: 'weight_per_head', label: 'KL xuất (kg/con)',    type: 'number', required: true  },
        { name: 'total_weight',    label: 'Tổng KL (kg)',        type: 'number', required: true  },
        { name: 'buyer',           label: 'Đơn vị thu mua',      type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Bò sữa', category: 'channuoi',
    description: 'Nhật ký chăn nuôi bò sữa, theo dõi sản lượng và chất lượng sữa',
    tables: [
      { tableName: 'Thông tin đàn bò sữa', fields: [
        { name: 'farm_name',    label: 'Tên trang trại',       type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ',              type: 'text',   required: true  },
        { name: 'breed',        label: 'Giống bò sữa',         type: 'select', options: ['Holstein Friesian (HF)', 'Jersey', 'Lai HF 75%', 'Brown Swiss'], required: true  },
        { name: 'milking_cows', label: 'Số bò vắt sữa (con)', type: 'number', required: true  },
        { name: 'entry_date',   label: 'Ngày bắt đầu',         type: 'date',   required: true  },
      ]},
      { tableName: 'Sản lượng sữa ngày', fields: [
        { name: 'log_date',       label: 'Ngày vắt',              type: 'date',   required: true  },
        { name: 'milking_times',  label: 'Số lần vắt/ngày',       type: 'select', options: ['1 lần', '2 lần', '3 lần'], required: true  },
        { name: 'morning_liter',  label: 'Sáng (lít)',            type: 'number', required: false },
        { name: 'evening_liter',  label: 'Chiều (lít)',           type: 'number', required: false },
        { name: 'total_liter',    label: 'Tổng sản lượng (lít)', type: 'number', required: true  },
        { name: 'rejected_liter', label: 'Sữa loại bỏ (lít)',    type: 'number', required: false },
        { name: 'reject_reason',  label: 'Lý do loại bỏ',        type: 'text',   required: false },
      ]},
      { tableName: 'Chất lượng sữa', fields: [
        { name: 'test_date',    label: 'Ngày kiểm tra',          type: 'date',   required: true  },
        { name: 'fat_pct',      label: 'Hàm lượng mỡ (%)',       type: 'number', required: false },
        { name: 'protein_pct',  label: 'Hàm lượng protein (%)', type: 'number', required: false },
        { name: 'mastitis',     label: 'Kiểm tra viêm vú (CMT)', type: 'select', options: ['Âm tính', 'Dương tính nhẹ', 'Dương tính nặng'], required: false },
        { name: 'antibiotic',   label: 'Dư lượng kháng sinh',   type: 'select', options: ['Không phát hiện', 'Phát hiện - loại bỏ'], required: false },
      ]},
      { tableName: 'Thức ăn bò sữa', fields: [
        { name: 'log_date',       label: 'Ngày ghi',              type: 'date',   required: true  },
        { name: 'silage_kg',      label: 'Cỏ ủ chua (kg/con)',    type: 'number', required: false },
        { name: 'concentrate_kg', label: 'Cám hỗn hợp (kg/con)', type: 'number', required: false },
        { name: 'roughage_kg',    label: 'Thức ăn thô khô (kg)', type: 'number', required: false },
        { name: 'mineral',        label: 'Khoáng chất / vitamin', type: 'text',   required: false },
      ]},
      { tableName: 'Thú y & Sinh sản', fields: [
        { name: 'event_date',    label: 'Ngày',               type: 'date',   required: true  },
        { name: 'event_type',    label: 'Sự kiện',            type: 'select', options: ['Phối giống', 'Kiểm tra có thai', 'Đẻ bê', 'Cạn sữa', 'Điều trị bệnh', 'Tiêm phòng'], required: true  },
        { name: 'medicine',      label: 'Thuốc / vaccine',    type: 'text',   required: false },
        { name: 'withdraw_days', label: 'Ngưng thuốc (ngày)', type: 'number', required: false },
        { name: 'note',          label: 'Ghi chú',            type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Ong', category: 'channuoi',
    description: 'Nhật ký nuôi ong mật theo VietGAP',
    tables: [
      { tableName: 'Thông tin trang trại', fields: [
        { name: 'farm_name',    label: 'Tên trang trại',      type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ đặt thùng',  type: 'text',   required: true  },
        { name: 'bee_species',  label: 'Loài ong',            type: 'select', options: ['Apis mellifera (Ý)', 'Apis cerana (Nội)', 'Ong khoái', 'Ong ruồi'], required: true  },
        { name: 'hive_count',   label: 'Số đàn ong',          type: 'number', required: true  },
        { name: 'start_date',   label: 'Ngày bắt đầu ghi',   type: 'date',   required: true  },
        { name: 'flora_source', label: 'Nguồn hoa chủ yếu',  type: 'text',   required: false },
      ]},
      { tableName: 'Kiểm tra đàn định kỳ', fields: [
        { name: 'check_date',   label: 'Ngày kiểm',          type: 'date',   required: true  },
        { name: 'hive_id',      label: 'Mã thùng / đàn',     type: 'text',   required: false },
        { name: 'queen_status', label: 'Tình trạng chúa',    type: 'select', options: ['Tốt - đang đẻ', 'Chúa già cần thay', 'Không thấy chúa', 'Đàn chia'], required: true  },
        { name: 'brood_frames', label: 'Số cầu con (cầu)',   type: 'number', required: false },
        { name: 'honey_frames', label: 'Số cầu mật (cầu)',   type: 'number', required: false },
        { name: 'disease_sign', label: 'Dấu hiệu bệnh',      type: 'boolean', required: false },
        { name: 'mite_level',   label: 'Mức độ ve Varroa',   type: 'select', options: ['Không phát hiện', 'Nhẹ (<3%)', 'Nặng (>3%)'], required: false },
      ]},
      { tableName: 'Xử lý bệnh & Chăm sóc', fields: [
        { name: 'treat_date', label: 'Ngày xử lý',           type: 'date',   required: true  },
        { name: 'treatment',  label: 'Biện pháp',            type: 'select', options: ['Nhỏ Oxalic acid', 'Strips Apistan', 'Nuôi chúa mới', 'Ghép đàn', 'Bổ sung thức ăn'], required: true  },
        { name: 'product',    label: 'Sản phẩm sử dụng',    type: 'text',   required: false },
        { name: 'withdraw_days', label: 'Ngưng trước quay mật (ngày)', type: 'number', required: false },
      ]},
      { tableName: 'Quay mật ong', fields: [
        { name: 'harvest_date',   label: 'Ngày quay mật',      type: 'date',   required: true  },
        { name: 'frames_harvest', label: 'Số cầu quay (cầu)',  type: 'number', required: true  },
        { name: 'honey_kg',       label: 'Sản lượng mật (kg)', type: 'number', required: true  },
        { name: 'moisture_pct',   label: 'Độ ẩm mật (%)',      type: 'number', required: false },
        { name: 'quality',        label: 'Đạt tiêu chuẩn',    type: 'select', options: ['Xuất khẩu', 'Nội địa', 'Không đạt'], required: false },
        { name: 'flora_label',    label: 'Loại hoa khai thác', type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Dê thịt', category: 'channuoi',
    description: 'Nhật ký chăn nuôi dê thịt an toàn sinh học theo VietGAP',
    tables: [
      { tableName: 'Thông tin đàn dê', fields: [
        { name: 'farm_name',    label: 'Tên trại',           type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ',            type: 'text',   required: true  },
        { name: 'breed',        label: 'Giống dê',           type: 'select', options: ['Boer', 'Bách Thảo', 'Boer lai Bách Thảo', 'Dê Cỏ', 'Beetal'], required: true  },
        { name: 'head_count',   label: 'Tổng số đầu (con)', type: 'number', required: true  },
        { name: 'entry_date',   label: 'Ngày nhập đàn',     type: 'date',   required: true  },
        { name: 'entry_weight', label: 'KL nhập TB (kg)',   type: 'number', required: false },
      ]},
      { tableName: 'Thức ăn & Dinh dưỡng', fields: [
        { name: 'feed_date',   label: 'Ngày cho ăn',         type: 'date',   required: true  },
        { name: 'grazing',     label: 'Phương thức chăn',   type: 'select', options: ['Chăn thả hoàn toàn', 'Bán chăn thả', 'Nhốt chuồng'], required: false },
        { name: 'grass_type',  label: 'Loại cỏ / lá cây',  type: 'select', options: ['Cỏ voi', 'Cỏ sả', 'Lá mít', 'Lá chuối', 'Cỏ khô', 'Rơm'], required: false },
        { name: 'grass_kg',    label: 'Cỏ/lá (kg/con)',     type: 'number', required: false },
        { name: 'concentrate', label: 'Cám/Bổ sung (kg/con)', type: 'number', required: false },
      ]},
      { tableName: 'Tiêm phòng & Thú y', fields: [
        { name: 'vac_date',      label: 'Ngày thực hiện',    type: 'date',   required: true  },
        { name: 'event_type',    label: 'Loại can thiệp',    type: 'select', options: ['Tiêm vaccine', 'Tẩy giun sán', 'Điều trị bệnh'], required: true  },
        { name: 'medicine',      label: 'Thuốc / vaccine',   type: 'text',   required: true  },
        { name: 'disease',       label: 'Phòng / điều trị', type: 'select', options: ['Lở mồm long móng', 'Đậu dê', 'Tụ huyết trùng', 'Giun sán'], required: false },
        { name: 'withdraw_days', label: 'Ngưng thuốc (ngày)', type: 'number', required: true },
      ]},
      { tableName: 'Sinh sản', fields: [
        { name: 'event_date', label: 'Ngày',             type: 'date',   required: true  },
        { name: 'doe_id',     label: 'Mã dê cái',       type: 'text',   required: false },
        { name: 'event',      label: 'Sự kiện',          type: 'select', options: ['Phối giống', 'Xác định có chửa', 'Đẻ dê con', 'Cai sữa'], required: true  },
        { name: 'kids_born',  label: 'Số dê con sinh',  type: 'number', required: false },
      ]},
      { tableName: 'Xuất chuồng', fields: [
        { name: 'export_date', label: 'Ngày xuất',         type: 'date',   required: true  },
        { name: 'head_sold',   label: 'Số con xuất (con)', type: 'number', required: true  },
        { name: 'avg_weight',  label: 'KL TB (kg/con)',    type: 'number', required: true  },
        { name: 'price_kg',    label: 'Giá bán (đ/kg)',   type: 'number', required: false },
        { name: 'buyer',       label: 'Đơn vị thu mua',   type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Dê sữa', category: 'channuoi',
    description: 'Nhật ký chăn nuôi dê sữa, theo dõi sản lượng sữa theo VietGAP',
    tables: [
      { tableName: 'Thông tin đàn dê sữa', fields: [
        { name: 'farm_name',    label: 'Tên trại sữa',          type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ',               type: 'text',   required: true  },
        { name: 'breed',        label: 'Giống dê sữa',          type: 'select', options: ['Saanen', 'Alpine', 'Nubian', 'Toggenburg', 'Bách Thảo (sữa)'], required: true  },
        { name: 'milking_does', label: 'Số dê vắt sữa (con)',  type: 'number', required: true  },
        { name: 'start_date',   label: 'Ngày bắt đầu',          type: 'date',   required: true  },
      ]},
      { tableName: 'Sản lượng sữa ngày', fields: [
        { name: 'log_date',      label: 'Ngày vắt',                  type: 'date',   required: true  },
        { name: 'doe_id',        label: 'Mã con / Nhóm',            type: 'text',   required: false },
        { name: 'morning_ml',    label: 'Sáng (ml)',                 type: 'number', required: false },
        { name: 'evening_ml',    label: 'Chiều (ml)',                type: 'number', required: false },
        { name: 'herd_total_l',  label: 'Tổng cả đàn (lít)',       type: 'number', required: true  },
      ]},
      { tableName: 'Chất lượng sữa dê', fields: [
        { name: 'test_date',   label: 'Ngày kiểm tra', type: 'date',   required: true  },
        { name: 'fat_pct',     label: 'Mỡ sữa (%)',    type: 'number', required: false },
        { name: 'protein_pct', label: 'Protein (%)',    type: 'number', required: false },
        { name: 'pasteurized', label: 'Đã thanh trùng', type: 'boolean', required: false },
      ]},
      { tableName: 'Thức ăn', fields: [
        { name: 'log_date',    label: 'Ngày ghi',          type: 'date',   required: true  },
        { name: 'grass_kg',    label: 'Cỏ xanh (kg/con)', type: 'number', required: false },
        { name: 'hay_kg',      label: 'Cỏ khô (kg/con)',  type: 'number', required: false },
        { name: 'concentrate', label: 'Cám tinh (kg/con)', type: 'number', required: false },
        { name: 'calcium_sup', label: 'Bổ sung canxi',     type: 'boolean', required: false },
      ]},
      { tableName: 'Sinh sản & Thú y', fields: [
        { name: 'event_date',    label: 'Ngày',               type: 'date',   required: true  },
        { name: 'doe_id',        label: 'Mã dê cái',          type: 'text',   required: false },
        { name: 'event',         label: 'Sự kiện',            type: 'select', options: ['Phối giống', 'Kiểm tra có chửa', 'Đẻ con', 'Cạn sữa', 'Tiêm phòng', 'Điều trị'], required: true  },
        { name: 'withdraw_days', label: 'Ngưng dùng sữa (ngày)', type: 'number', required: false },
        { name: 'note',          label: 'Ghi chú',            type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Lợn thịt', category: 'channuoi',
    description: 'Nhật ký chăn nuôi lợn thịt an toàn sinh học theo VietGAP',
    tables: [
      { tableName: 'Thông tin trại lợn', fields: [
        { name: 'farm_name',    label: 'Tên trại',            type: 'text',   required: true  },
        { name: 'address',      label: 'Địa chỉ',             type: 'text',   required: true  },
        { name: 'breed',        label: 'Giống lợn',           type: 'select', options: ['Yorkshire', 'Landrace', 'Duroc', 'Piétrain', 'Móng Cái', 'Lợn lai (L×Y)', 'Lợn 3 máu'], required: true  },
        { name: 'head_count',   label: 'Số con nhập (con)',   type: 'number', required: true  },
        { name: 'entry_date',   label: 'Ngày nhập đàn',       type: 'date',   required: true  },
        { name: 'entry_weight', label: 'KL nhập TB (kg/con)', type: 'number', required: false },
        { name: 'pig_source',   label: 'Nguồn cung cấp',      type: 'text',   required: false },
      ]},
      { tableName: 'Thức ăn & Dinh dưỡng', fields: [
        { name: 'feed_date',    label: 'Ngày cho ăn',          type: 'date',   required: true  },
        { name: 'growth_stage', label: 'Giai đoạn',            type: 'select', options: ['Lợn con (tập ăn)', 'Lợn nuôi (15-50kg)', 'Lợn vỗ béo (50kg+)'], required: true  },
        { name: 'feed_type',    label: 'Loại thức ăn',         type: 'select', options: ['Cám hỗn hợp công nghiệp', 'Cám tự phối', 'Cám lỏng', 'Cám ép viên'], required: true  },
        { name: 'feed_amount',  label: 'Lượng thức ăn (kg/con)', type: 'number', required: true },
        { name: 'additive',     label: 'Chất bổ sung (men, acid)', type: 'text', required: false },
      ]},
      { tableName: 'Tiêm phòng & Thú y', fields: [
        { name: 'vac_date',      label: 'Ngày tiêm / điều trị', type: 'date',  required: true  },
        { name: 'event_type',    label: 'Loại can thiệp',        type: 'select', options: ['Tiêm vaccine', 'Điều trị bệnh', 'Tẩy giun'], required: true  },
        { name: 'medicine',      label: 'Vaccine / thuốc',       type: 'text',  required: true  },
        { name: 'disease',       label: 'Phòng / điều trị',      type: 'select', options: ['Tai xanh (PRRS)', 'Dịch tả lợn', 'LMLM', 'Suyễn lợn', 'Tụ huyết trùng', 'Tiêu chảy'], required: false },
        { name: 'withdraw_days', label: 'Ngưng thuốc (ngày)',    type: 'number', required: true  },
        { name: 'vet_name',      label: 'Thú y thực hiện',       type: 'text',  required: false },
      ]},
      { tableName: 'Vệ sinh & An toàn sinh học', fields: [
        { name: 'log_date',     label: 'Ngày ghi',           type: 'date',   required: true  },
        { name: 'clean_type',   label: 'Công việc vệ sinh',  type: 'select', options: ['Vệ sinh chuồng hàng ngày', 'Phun tiêu độc', 'Tổng vệ sinh', 'Diệt chuột/ruồi'], required: true  },
        { name: 'disinfectant', label: 'Hoá chất khử trùng', type: 'text',   required: false },
        { name: 'barn_temp',    label: 'Nhiệt độ chuồng (°C)', type: 'number', required: false },
        { name: 'mortality',    label: 'Số con chết hôm nay', type: 'number', required: false },
      ]},
      { tableName: 'Theo dõi tăng trọng', fields: [
        { name: 'weigh_date', label: 'Ngày cân',                    type: 'date',   required: true  },
        { name: 'avg_weight', label: 'KL TB (kg/con)',              type: 'number', required: true  },
        { name: 'adg',        label: 'Tăng trọng bình quân (g/ngày)', type: 'number', required: false },
        { name: 'fcr',        label: 'Hệ số tiêu tốn thức ăn FCR', type: 'number', required: false },
      ]},
      { tableName: 'Xuất chuồng', fields: [
        { name: 'export_date',    label: 'Ngày xuất',           type: 'date',   required: true  },
        { name: 'head_count',     label: 'Số con xuất (con)',   type: 'number', required: true  },
        { name: 'avg_weight_kg',  label: 'KL xuất TB (kg/con)', type: 'number', required: true  },
        { name: 'total_kg',       label: 'Tổng KL (kg)',        type: 'number', required: true  },
        { name: 'slaughterhouse', label: 'Cơ sở giết mổ / thu mua', type: 'text', required: false },
      ]},
    ]
  },

];

// ════════════════════════════════════════════════════════════
//  THUỶ SẢN  (category: 'thuyssan')
// ════════════════════════════════════════════════════════════
const thuyssanSchemas = [
  {
    name: 'Cá tra', category: 'thuyssan',
    description: 'Nhật ký nuôi cá tra theo tiêu chuẩn VietGAP',
    tables: [
      commonInfo([{ name: 'pond_area', label: 'Diện tích ao (m²)', type: 'number', required: true }]),
      { tableName: 'Thả giống', fields: [
        { name: 'stock_date', label: 'Ngày thả', type: 'date', required: true },
        { name: 'density',    label: 'Mật độ thả (con/m²)', type: 'number', required: true },
        { name: 'size',       label: 'Kích cỡ giống (cm)', type: 'number', required: false },
        { name: 'source',     label: 'Nguồn gốc giống', type: 'text', required: false },
      ]},
      { tableName: 'Quản lý thức ăn', fields: [
        { name: 'log_date',    label: 'Ngày ghi', type: 'date', required: true },
        { name: 'feed_type',   label: 'Loại thức ăn', type: 'select', options: ['Cám 20% đạm', 'Cám 25% đạm', 'Cám 28% đạm', 'Thức ăn tự phối'], required: true },
        { name: 'feed_amount', label: 'Lượng cho ăn (kg/ngày)', type: 'number', required: true },
      ]},
      { tableName: 'Môi trường ao nuôi', fields: [
        { name: 'log_date',   label: 'Ngày đo', type: 'date', required: true },
        { name: 'ph',         label: 'Độ pH', type: 'number', required: false },
        { name: 'temp',       label: 'Nhiệt độ nước (°C)', type: 'number', required: false },
        { name: 'do_level',   label: 'Hàm lượng Oxy (mg/l)', type: 'number', required: false },
        { name: 'transparency', label: 'Độ trong (cm)', type: 'number', required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
        { name: 'yield_ton',    label: 'Sản lượng (tấn)', type: 'number', required: true },
        { name: 'avg_weight',   label: 'Trọng lượng TB (kg/con)', type: 'number', required: false },
      ]},
    ]
  },
  {
    name: 'Cá rô phi thương phẩm', category: 'thuyssan',
    description: 'Nhật ký nuôi cá rô phi thương phẩm theo VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Thả giống', fields: [
        { name: 'stock_date', label: 'Ngày thả', type: 'date', required: true },
        { name: 'density',    label: 'Mật độ thả (con/m²)', type: 'number', required: true },
        { name: 'size',       label: 'Cỡ giống (g/con)', type: 'number', required: false },
      ]},
      { tableName: 'Thức ăn & Chăm sóc', fields: [
        { name: 'log_date',    label: 'Ngày ghi', type: 'date', required: true },
        { name: 'feed_type',   label: 'Loại thức ăn', type: 'text', required: true },
        { name: 'feed_amount', label: 'Lượng cho ăn (kg)', type: 'number', required: true },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
        { name: 'yield',        label: 'Sản lượng (kg)', type: 'number', required: true },
        { name: 'fcr',          label: 'Hệ số FCR', type: 'number', required: false },
      ]},
    ]
  },
  {
    name: 'Tôm chân trắng', category: 'thuyssan',
    description: 'Nhật ký nuôi tôm thẻ chân trắng (Litopenaeus vannamei)',
    tables: [
      commonInfo([{ name: 'salinity_entry', label: 'Độ mặn ban đầu (‰)', type: 'number', required: false }]),
      { tableName: 'Thả giống', fields: [
        { name: 'stock_date', label: 'Ngày thả', type: 'date', required: true },
        { name: 'density',    label: 'Mật độ (con/m²)', type: 'number', required: true },
        { name: 'post_size',  label: 'Giai đoạn giống (Post)', type: 'text', required: false },
      ]},
      { tableName: 'Quản lý môi trường hàng ngày', fields: [
        { name: 'log_date',   label: 'Ngày ghi', type: 'date', required: true },
        { name: 'ph_am',      label: 'pH sáng', type: 'number', required: false },
        { name: 'ph_pm',      label: 'pH chiều', type: 'number', required: false },
        { name: 'alkalinity', label: 'Độ kiềm (mg/l)', type: 'number', required: false },
        { name: 'salinity',   label: 'Độ mặn (‰)', type: 'number', required: false },
        { name: 'do_level',   label: 'Oxy hòa tan (mg/l)', type: 'number', required: false },
      ]},
      { tableName: 'Thức ăn & Xi phông', fields: [
        { name: 'log_date',    label: 'Ngày ghi', type: 'date', required: true },
        { name: 'feed_amount', label: 'Tổng lượng cám (kg)', type: 'number', required: true },
        { name: 'siphon',      label: 'Xi phông đáy', type: 'boolean', required: false },
        { name: 'molting',     label: 'Tình trạng lột xác', type: 'select', options: ['Bình thường', 'Lột rộ', 'Hao hụt'], required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
        { name: 'size_count',   label: 'Kích cỡ (con/kg)', type: 'number', required: true },
        { name: 'yield_kg',     label: 'Tổng sản lượng (kg)', type: 'number', required: true },
      ]},
    ]
  },
  {
    name: 'Tôm sú', category: 'thuyssan',
    description: 'Nhật ký nuôi tôm sú theo tiêu chuẩn VietGAP',
    tables: [
      commonInfo(),
      { tableName: 'Thả giống', fields: [
        { name: 'stock_date', label: 'Ngày thả', type: 'date', required: true },
        { name: 'density',    label: 'Mật độ (con/m²)', type: 'number', required: true },
      ]},
      { tableName: 'Quản lý môi trường', fields: [
        { name: 'log_date', label: 'Ngày ghi', type: 'date', required: true },
        { name: 'ph',       label: 'pH', type: 'number', required: false },
        { name: 'salinity', label: 'Độ mặn (‰)', type: 'number', required: false },
        { name: 'color',    label: 'Màu nước', type: 'select', options: ['Xanh trà', 'Vàng nâu', 'Xanh đậm', 'Đỏ'], required: false },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
        { name: 'yield_kg',     label: 'Sản lượng (kg)', type: 'number', required: true },
        { name: 'size_count',   label: 'Kích cỡ (con/kg)', type: 'number', required: false },
      ]},
    ]
  },
  {
    name: 'Cua biển', category: 'thuyssan',
    description: 'Nhật ký nuôi cua biển thương phẩm',
    tables: [
      commonInfo(),
      { tableName: 'Thả giống', fields: [
        { name: 'stock_date', label: 'Ngày thả', type: 'date', required: true },
        { name: 'head_count', label: 'Số lượng thả (con)', type: 'number', required: true },
        { name: 'size',       label: 'Kích cỡ giống (cua me/cua bột)', type: 'text', required: false },
      ]},
      { tableName: 'Cho ăn', fields: [
        { name: 'feed_date',   label: 'Ngày cho ăn', type: 'date', required: true },
        { name: 'feed_type',   label: 'Loại thức ăn', type: 'select', options: ['Cá tạp', 'Ốc', 'Thức ăn viên'], required: true },
        { name: 'feed_amount', label: 'Lượng ăn (kg)', type: 'number', required: true },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
        { name: 'head_count',   label: 'Số lượng thu (con)', type: 'number', required: true },
        { name: 'yield_kg',     label: 'Sản lượng (kg)', type: 'number', required: true },
      ]},
    ]
  },
];

// ════════════════════════════════════════════════════════════
//  HỮU CƠ - CÂY TRỒNG (category: 'huuco_caytrong')
// ════════════════════════════════════════════════════════════
const huucoCayTrongSchemas = [
  {
    name: 'Bắp cải', category: 'huuco_caytrong',
    description: 'Sản xuất bắp cải theo phương pháp hữu cơ',
    tables: [
      commonInfo(),
      { tableName: 'Chuẩn bị đất & Phân bón lót', fields: [
        { name: 'plow_date',   label: 'Ngày làm đất', type: 'date', required: true },
        { name: 'compost',     label: 'Loại phân hữu cơ', type: 'text', required: true },
        { name: 'amount',      label: 'Lượng bón (kg)', type: 'number', required: true },
      ]},
      { tableName: 'Quản lý sâu bệnh sinh học', fields: [
        { name: 'log_date',    label: 'Ngày xử lý', type: 'date', required: true },
        { name: 'pest_name',   label: 'Đối tượng dịch hại', type: 'text', required: true },
        { name: 'method',      label: 'Biện pháp (bắt tay, thảo mộc, thiên địch)', type: 'text', required: true },
      ]},
      harvestTable('kg'),
    ]
  },
  {
    name: 'Mồng tơi', category: 'huuco_caytrong',
    description: 'Sản xuất rau mồng tơi theo phương pháp hữu cơ',
    tables: [commonInfo(), careTable, harvestTable('kg')]
  },
  {
    name: 'Cà chua', category: 'huuco_caytrong',
    description: 'Sản xuất cà chua theo phương pháp hữu cơ',
    tables: [commonInfo(), careTable, pesticideTable, harvestTable('kg')]
  },
  {
    name: 'Cải bó xôi', category: 'huuco_caytrong',
    description: 'Sản xuất cải bó xôi (Spinach) hữu cơ',
    tables: [commonInfo(), careTable, harvestTable('kg')]
  },
  {
    name: 'Khoai tây', category: 'huuco_caytrong',
    description: 'Sản xuất khoai tây hữu cơ',
    tables: [
      commonInfo(),
      { tableName: 'Vun gốc & Chăm sóc', fields: [
        { name: 'date', label: 'Ngày thực hiện', type: 'date', required: true },
        { name: 'action', label: 'Nội dung (vun gốc, làm cỏ, bón phân)', type: 'text', required: true },
      ]},
      harvestTable('kg')
    ]
  },
  {
    name: 'Cây táo', category: 'huuco_caytrong',
    description: 'Sản xuất táo theo phương pháp hữu cơ',
    tables: [
      commonInfo(),
      { tableName: 'Chăm sóc tán & Phân bón', fields: [
        { name: 'date', label: 'Ngày thực hiện', type: 'date', required: true },
        { name: 'fertilizer', label: 'Phân hữu cơ / Vi sinh', type: 'text', required: false },
        { name: 'pruning', label: 'Cắt tỉa cành', type: 'boolean', required: false },
      ]},
      harvestTable('kg')
    ]
  },
  {
    name: 'Rau muống', category: 'huuco_caytrong',
    description: 'Sản xuất rau muống hữu cơ',
    tables: [commonInfo(), careTable, harvestTable('kg')]
  },
  {
    name: 'Lúa', category: 'huuco_caytrong',
    description: 'Sản xuất lúa hữu cơ không dùng hoá chất, đạt chứng nhận hữu cơ',
    tables: [
      { tableName: 'Thông tin chung', fields: [
        { name: 'owner_name',    label: 'Họ tên chủ hộ',        type: 'text',   required: true  },
        { name: 'address',       label: 'Địa chỉ vùng trồng',   type: 'text',   required: true  },
        { name: 'area_ha',       label: 'Diện tích (ha)',        type: 'number', required: true  },
        { name: 'start_date',    label: 'Ngày bắt đầu vụ',      type: 'date',   required: true  },
        { name: 'lot_code',      label: 'Mã lô ruộng',           type: 'text',   required: false },
        { name: 'rice_variety',  label: 'Giống lúa hữu cơ',    type: 'select', options: ['ST25', 'Japonica', 'Nàng Thơm Chợ Đào', 'Tím thơm', 'Nếp cẩm'], required: true  },
        { name: 'season',        label: 'Vụ sản xuất',          type: 'select', options: ['Đông Xuân', 'Hè Thu', 'Thu Đông'], required: true  },
        { name: 'certification', label: 'Chứng nhận hữu cơ',   type: 'select', options: ['TCVN 11041-2:2017', 'USDA Organic', 'EU Organic', 'PGS'], required: false },
      ]},
      { tableName: 'Chuẩn bị đất (không hoá chất)', fields: [
        { name: 'plow_date',     label: 'Ngày cày đất',              type: 'date',   required: true  },
        { name: 'compost_type',  label: 'Loại phân bón lót',        type: 'select', options: ['Phân chuồng ủ hoai', 'Phân trùn quế', 'Phân vi sinh', 'Phân xanh'], required: true  },
        { name: 'compost_ton',   label: 'Lượng phân hữu cơ (tấn/ha)', type: 'number', required: true },
        { name: 'sow_date',      label: 'Ngày gieo sạ',             type: 'date',   required: true  },
        { name: 'seed_rate',     label: 'Lượng giống (kg/ha)',       type: 'number', required: true  },
      ]},
      { tableName: 'Chăm sóc hữu cơ', fields: [
        { name: 'care_date',     label: 'Ngày',                     type: 'date',   required: true  },
        { name: 'input_type',    label: 'Loại đầu vào được dùng',  type: 'select', options: ['Phân hữu cơ', 'Chế phẩm vi sinh', 'Nước tiểu ủ', 'Tro bếp', 'Nước biogas'], required: true  },
        { name: 'irrigation',    label: 'Quản lý nước',             type: 'select', options: ['Tưới ngập SRI', 'Tưới ướt-khô AWD', 'Ngập thường xuyên'], required: false },
        { name: 'weed_control',  label: 'Quản lý cỏ dại',           type: 'select', options: ['Làm cỏ tay', 'Thả vịt ăn cỏ', 'Phủ rơm', 'Không làm'], required: false },
      ]},
      { tableName: 'Quản lý sâu bệnh (sinh học)', fields: [
        { name: 'log_date',   label: 'Ngày ghi',          type: 'date',   required: true  },
        { name: 'pest',       label: 'Đối tượng sâu/bệnh', type: 'text',  required: true  },
        { name: 'severity',   label: 'Mức độ phát sinh',  type: 'select', options: ['Nhẹ', 'Trung bình', 'Nặng'], required: true  },
        { name: 'bio_method', label: 'Biện pháp sinh học', type: 'select', options: ['Phóng thả thiên địch', 'Bẫy pheromone', 'Bẫy đèn', 'Chế phẩm Bt', 'Nấm Metarhizium'], required: true  },
      ]},
      { tableName: 'Thu hoạch', fields: [
        { name: 'harvest_date',   label: 'Ngày gặt',              type: 'date',   required: true  },
        { name: 'harvest_method', label: 'Phương thức gặt',       type: 'select', options: ['Gặt tay', 'Máy gặt đập liên hợp'], required: false },
        { name: 'yield_ton_ha',   label: 'Năng suất (tấn/ha)',   type: 'number', required: true  },
        { name: 'moisture_pct',   label: 'Độ ẩm hạt lúa (%)',   type: 'number', required: false },
        { name: 'buyer',          label: 'Đơn vị thu mua',       type: 'text',   required: false },
      ]},
    ]
  },
  {
    name: 'Ngưu bàng', category: 'huuco_caytrong',
    description: 'Sản xuất ngưu bàng hữu cơ',
    tables: [commonInfo(), careTable, harvestTable('kg')]
  },
  {
    name: 'Bí xanh', category: 'huuco_caytrong',
    description: 'Sản xuất bí xanh hữu cơ',
    tables: [commonInfo(), careTable, harvestTable('kg')]
  },
  {
    name: 'Dưa chuột', category: 'huuco_caytrong',
    description: 'Sản xuất dưa chuột hữu cơ',
    tables: [commonInfo(), careTable, harvestTable('kg')]
  },
];


// ════════════════════════════════════════════════════════════
//  CHẠY SEED (Dùng Upsert để giữ nguyên ID nếu trùng tên)
// ════════════════════════════════════════════════════════════
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    const all = [
      ...trongtrotSchemas, 
      ...channuoiSchemas, 
      ...thuyssanSchemas,
      ...huucoCayTrongSchemas
    ];
    
    console.log('⏳ Đang cập nhật schemas (Upsert)...');
    
    for (const s of all) {
      await FormSchema.findOneAndUpdate(
        { name: s.name, category: s.category },
        s,
        { upsert: true, new: true }
      );
    }

    console.log(`\n✅ TRỒNG TRỌT (${trongtrotSchemas.length} schema):`);
    trongtrotSchemas.forEach(s => console.log(`   - ${s.name}`));

    console.log(`\n✅ CHĂN NUÔI (${channuoiSchemas.length} schema):`);
    channuoiSchemas.forEach(s => console.log(`   - ${s.name}`));

    console.log(`\n✅ THUỶ SẢN (${thuyssanSchemas.length} schema):`);
    thuyssanSchemas.forEach(s => console.log(`   - ${s.name}`));

    console.log(`\n✅ HỮU CƠ - CÂY TRỒNG (${huucoCayTrongSchemas.length} schema):`);
    huucoCayTrongSchemas.forEach(s => console.log(`   - ${s.name}`));

    console.log(`\n🎉 Tổng cộng ${all.length} schema đã được cập nhật/thêm mới!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

seed();
