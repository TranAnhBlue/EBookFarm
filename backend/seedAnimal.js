const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FormSchema = require('./src/models/FormSchema');

dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Schema chăn nuôi & hữu cơ (THÊM MỚI, không xoá cũ) ─────────────────
const animalSchemas = [

  // 1. Gia cầm
  {
    name: 'Gia cầm',
    description: 'Nhật ký chăn nuôi gà, vịt, ngan, ngỗng theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin trại',
        fields: [
          { name: 'farm_name',    label: 'Tên trại chăn nuôi',   type: 'text',   required: true  },
          { name: 'address',      label: 'Địa chỉ trại',          type: 'text',   required: true  },
          { name: 'poultry_type', label: 'Loại gia cầm',          type: 'select', options: ['Gà thịt', 'Gà đẻ', 'Vịt thịt', 'Vịt đẻ', 'Ngan', 'Ngỗng', 'Chim cút'], required: true  },
          { name: 'breed',        label: 'Giống',                 type: 'select', options: ['Gà Tam Hoàng', 'Gà Lương Phượng', 'Gà Ri', 'Ross 308', 'Vịt Super M', 'Vịt Xiêm'], required: false },
          { name: 'flock_size',   label: 'Quy mô đàn (con)',      type: 'number', required: true  },
          { name: 'entry_date',   label: 'Ngày nhập đàn',         type: 'date',   required: true  },
          { name: 'chick_source', label: 'Nguồn gốc con giống',   type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Chuồng trại & Vệ sinh',
        fields: [
          { name: 'log_date',       label: 'Ngày ghi',                   type: 'date',   required: true  },
          { name: 'barn_type',      label: 'Kiểu chuồng',                type: 'select', options: ['Chuồng kín', 'Chuồng hở', 'Thả vườn', 'Thả đồng'], required: false },
          { name: 'clean_date',     label: 'Ngày vệ sinh chuồng',        type: 'date',   required: false },
          { name: 'disinfect',      label: 'Phun sát trùng',             type: 'boolean',required: false },
          { name: 'density_m2',     label: 'Mật độ thả (con/m²)',        type: 'number', required: false },
          { name: 'mortality_num',  label: 'Số con chết/bệnh trong ngày',type: 'number', required: false },
        ]
      },
      {
        tableName: 'Thức ăn & Nước uống',
        fields: [
          { name: 'feed_date',    label: 'Ngày cho ăn',            type: 'date',   required: true  },
          { name: 'feed_type',    label: 'Loại thức ăn',           type: 'select', options: ['Cám gà con', 'Cám gà thịt', 'Cám gà đẻ', 'Cám tự phối', 'Thóc + cám'], required: true  },
          { name: 'feed_amount',  label: 'Lượng thức ăn (kg/ngày)', type: 'number', required: true  },
          { name: 'water_supply', label: 'Hệ thống nước uống',     type: 'select', options: ['Núm uống tự động', 'Máng uống dài', 'Xô chậu'], required: false },
          { name: 'supplement',   label: 'Bổ sung vitamin / men',  type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Tiêm phòng vaccine',
        fields: [
          { name: 'vac_date',    label: 'Ngày tiêm',          type: 'date',   required: true  },
          { name: 'vaccine',     label: 'Tên vaccine',        type: 'text',   required: true  },
          { name: 'disease',     label: 'Phòng bệnh',        type: 'select', options: ['Newcastle', 'Gumboro', 'H5N1 (Cúm gia cầm)', 'Tụ huyết trùng', 'Dịch tả vịt', 'Đậu gà'], required: true  },
          { name: 'method',      label: 'Đường tiêm / dùng', type: 'select', options: ['Nhỏ mắt/mũi', 'Tiêm dưới da', 'Uống nước', 'Phun sương', 'Chích vào cánh'], required: true  },
          { name: 'head_count',  label: 'Số con được tiêm',  type: 'number', required: false },
          { name: 'vet_name',    label: 'Thú y thực hiện',   type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Điều trị bệnh',
        fields: [
          { name: 'treat_date',    label: 'Ngày điều trị',          type: 'date',   required: true  },
          { name: 'symptom',       label: 'Triệu chứng bệnh',       type: 'text',   required: true  },
          { name: 'medicine',      label: 'Thuốc điều trị',         type: 'text',   required: true  },
          { name: 'dose',          label: 'Liều dùng',              type: 'text',   required: false },
          { name: 'withdraw_days', label: 'Ngưng thuốc trước xuất (ngày)', type: 'number', required: true  },
          { name: 'treated_count', label: 'Số con điều trị',        type: 'number', required: false },
        ]
      },
      {
        tableName: 'Xuất bán',
        fields: [
          { name: 'export_date',  label: 'Ngày xuất bán',         type: 'date',   required: true  },
          { name: 'head_sold',    label: 'Số con xuất (con)',      type: 'number', required: true  },
          { name: 'avg_weight',   label: 'Trọng lượng TB (kg/con)', type: 'number', required: true  },
          { name: 'price_per_kg', label: 'Giá bán (đ/kg)',        type: 'number', required: false },
          { name: 'buyer',        label: 'Đơn vị thu mua',        type: 'text',   required: false },
        ]
      }
    ]
  },

  // 2. Bò thịt
  {
    name: 'Bò thịt',
    description: 'Nhật ký chăn nuôi bò thịt an toàn sinh học theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin đàn bò',
        fields: [
          { name: 'farm_name',  label: 'Tên trại',          type: 'text',   required: true  },
          { name: 'address',    label: 'Địa chỉ',           type: 'text',   required: true  },
          { name: 'breed',      label: 'Giống bò',         type: 'select', options: ['Brahman', 'Lai Sind', 'BBB (Blanc Bleu Belge)', 'Angus', 'Wagyu', 'F1 Brahman', 'Bò cóc địa phương'], required: true  },
          { name: 'head_count', label: 'Tổng số đầu (con)',type: 'number', required: true  },
          { name: 'entry_date', label: 'Ngày nhập đàn',    type: 'date',   required: true  },
          { name: 'avg_entry_weight', label: 'KL nhập TB (kg/con)', type: 'number', required: false },
          { name: 'source',     label: 'Nguồn gốc con giống', type: 'text', required: false },
        ]
      },
      {
        tableName: 'Chuồng trại',
        fields: [
          { name: 'barn_area',   label: 'Diện tích chuồng (m²)', type: 'number', required: false },
          { name: 'barn_type',   label: 'Kiểu chuồng',           type: 'select', options: ['Chuồng kín', 'Chuồng nửa hở', 'Bãi chăn thả', 'Chuồng thang'], required: false },
          { name: 'clean_date',  label: 'Ngày vệ sinh chuồng',   type: 'date',   required: false },
          { name: 'disinfect',   label: 'Phun tiêu độc',         type: 'boolean',required: false },
        ]
      },
      {
        tableName: 'Thức ăn hàng ngày',
        fields: [
          { name: 'log_date',      label: 'Ngày ghi',               type: 'date',   required: true  },
          { name: 'roughage_type', label: 'Loại thức ăn thô',       type: 'select', options: ['Cỏ voi', 'Rơm khô', 'Cây ngô ủ chua', 'Cỏ Ruzi', 'Bã bia'], required: true  },
          { name: 'roughage_kg',   label: 'Thức ăn thô (kg/con)',   type: 'number', required: true  },
          { name: 'concentrate',   label: 'Thức ăn tinh (kg/con)',  type: 'number', required: false },
          { name: 'mineral_block', label: 'Đá liếm khoáng',         type: 'boolean',required: false },
          { name: 'water_supply',  label: 'Nước uống (lít/con)',    type: 'number', required: false },
        ]
      },
      {
        tableName: 'Thú y & Tiêm phòng',
        fields: [
          { name: 'vac_date',      label: 'Ngày thực hiện',       type: 'date',   required: true  },
          { name: 'treatment_type',label: 'Loại can thiệp',       type: 'select', options: ['Tiêm vaccine', 'Điều trị bệnh', 'Tẩy ký sinh trùng', 'Kiểm tra định kỳ'], required: true  },
          { name: 'medicine',      label: 'Vaccine / thuốc',      type: 'text',   required: true  },
          { name: 'disease',       label: 'Phòng / điều trị',     type: 'select', options: ['Lở mồm long móng', 'Tụ huyết trùng', 'Xoắn khuẩn Lepto', 'Ký sinh trùng máu', 'Giun sán'], required: false },
          { name: 'withdraw_days', label: 'Ngưng thuốc (ngày)',   type: 'number', required: true  },
          { name: 'vet_name',      label: 'Thú y thực hiện',      type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Theo dõi tăng trọng',
        fields: [
          { name: 'weigh_date',   label: 'Ngày cân',              type: 'date',   required: true  },
          { name: 'avg_weight',   label: 'KL TB đàn (kg/con)',   type: 'number', required: true  },
          { name: 'adg',          label: 'Tăng trọng bình quân (g/ngày)', type: 'number', required: false },
          { name: 'fcr',          label: 'Hệ số chuyển đổi FCR', type: 'number', required: false },
        ]
      },
      {
        tableName: 'Xuất chuồng',
        fields: [
          { name: 'export_date',    label: 'Ngày xuất',           type: 'date',   required: true  },
          { name: 'head_exported',  label: 'Số con xuất',         type: 'number', required: true  },
          { name: 'weight_per_head',label: 'KL xuất chuồng (kg/con)', type: 'number', required: true  },
          { name: 'total_weight',   label: 'Tổng khối lượng (kg)',type: 'number', required: true  },
          { name: 'price_kg',       label: 'Giá bán (đ/kg)',      type: 'number', required: false },
          { name: 'buyer',          label: 'Đơn vị thu mua',      type: 'text',   required: false },
        ]
      }
    ]
  },

  // 3. Bò sữa
  {
    name: 'Bò sữa',
    description: 'Nhật ký chăn nuôi bò sữa, theo dõi sản lượng và chất lượng sữa theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin đàn bò sữa',
        fields: [
          { name: 'farm_name',   label: 'Tên trang trại',        type: 'text',   required: true  },
          { name: 'address',     label: 'Địa chỉ',               type: 'text',   required: true  },
          { name: 'breed',       label: 'Giống bò sữa',          type: 'select', options: ['Holstein Friesian (HF)', 'Jersey', 'Lai HF 75%', 'Lai HF 87.5%', 'Brown Swiss'], required: true  },
          { name: 'total_cows',  label: 'Tổng số bò (con)',      type: 'number', required: true  },
          { name: 'milking_cows',label: 'Số bò đang vắt sữa',   type: 'number', required: true  },
          { name: 'entry_date',  label: 'Ngày bắt đầu vắt',     type: 'date',   required: true  },
        ]
      },
      {
        tableName: 'Sản lượng sữa ngày',
        fields: [
          { name: 'log_date',       label: 'Ngày vắt',              type: 'date',   required: true  },
          { name: 'milking_times',  label: 'Số lần vắt/ngày',       type: 'select', options: ['1 lần', '2 lần', '3 lần'], required: true  },
          { name: 'morning_liter',  label: 'Sáng (lít)',            type: 'number', required: false },
          { name: 'evening_liter',  label: 'Chiều (lít)',           type: 'number', required: false },
          { name: 'total_liter',    label: 'Tổng sản lượng (lít)', type: 'number', required: true  },
          { name: 'rejected_liter', label: 'Sữa loại bỏ (lít)',    type: 'number', required: false },
          { name: 'reject_reason',  label: 'Lý do loại bỏ',        type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Chất lượng sữa',
        fields: [
          { name: 'test_date',   label: 'Ngày kiểm tra',          type: 'date',   required: true  },
          { name: 'fat_pct',     label: 'Hàm lượng mỡ (%)',       type: 'number', required: false },
          { name: 'protein_pct', label: 'Hàm lượng protein (%)',  type: 'number', required: false },
          { name: 'somatic_cell',label: 'Tế bào soma (SCC)',       type: 'number', required: false },
          { name: 'mastitis',    label: 'Kiểm tra viêm vú (CMT)', type: 'select', options: ['Âm tính', 'Dương tính nhẹ', 'Dương tính nặng'], required: false },
          { name: 'antibiotic',  label: 'Dư lượng kháng sinh',    type: 'select', options: ['Không phát hiện', 'Phát hiện - loại bỏ'], required: false },
        ]
      },
      {
        tableName: 'Thức ăn bò sữa',
        fields: [
          { name: 'log_date',      label: 'Ngày ghi',                     type: 'date',   required: true  },
          { name: 'tme',           label: 'Khẩu phần TMR/ngày (kg/con)',  type: 'number', required: false },
          { name: 'silage_kg',     label: 'Cỏ ủ chua (kg/con)',          type: 'number', required: false },
          { name: 'concentrate_kg',label: 'Cám hỗn hợp (kg/con)',        type: 'number', required: false },
          { name: 'roughage_kg',   label: 'Thức ăn thô khô (kg/con)',    type: 'number', required: false },
          { name: 'mineral',       label: 'Khoáng chất / vitamin',        type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Thú y & Sinh sản',
        fields: [
          { name: 'event_date',   label: 'Ngày',                  type: 'date',   required: true  },
          { name: 'event_type',   label: 'Sự kiện',               type: 'select', options: ['Phối giống', 'Kiểm tra có thai', 'Đẻ bê', 'Cạn sữa', 'Điều trị bệnh', 'Tiêm phòng'], required: true  },
          { name: 'cow_id',       label: 'Mã số con bò',          type: 'text',   required: false },
          { name: 'medicine',     label: 'Thuốc / Vaccine',       type: 'text',   required: false },
          { name: 'withdraw_days',label: 'Ngưng thuốc (ngày)',    type: 'number', required: false },
          { name: 'note',         label: 'Ghi chú',               type: 'text',   required: false },
        ]
      }
    ]
  },

  // 4. Ong
  {
    name: 'Ong',
    description: 'Nhật ký nuôi ong mật theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin trang trại',
        fields: [
          { name: 'farm_name',   label: 'Tên trang trại',       type: 'text',   required: true  },
          { name: 'address',     label: 'Địa chỉ đặt thùng',   type: 'text',   required: true  },
          { name: 'bee_species', label: 'Loài ong',             type: 'select', options: ['Apis mellifera (Ý)', 'Apis cerana (Nội)', 'Ong khoái (Đá)', 'Ong ruồi'], required: true  },
          { name: 'hive_count',  label: 'Số đàn ong',          type: 'number', required: true  },
          { name: 'start_date',  label: 'Ngày bắt đầu ghi',   type: 'date',   required: true  },
          { name: 'flora_source',label: 'Nguồn hoa chủ yếu',  type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Kiểm tra đàn định kỳ',
        fields: [
          { name: 'check_date',   label: 'Ngày kiểm',          type: 'date',   required: true  },
          { name: 'hive_id',      label: 'Mã thùng / đàn',     type: 'text',   required: false },
          { name: 'queen_status', label: 'Tình trạng chúa',    type: 'select', options: ['Tốt - đang đẻ', 'Chúa già cần thay', 'Không thấy chúa', 'Đàn chia đàn'], required: true  },
          { name: 'brood_frames', label: 'Số cầu con (cầu)',   type: 'number', required: false },
          { name: 'honey_frames', label: 'Số cầu mật (cầu)',   type: 'number', required: false },
          { name: 'pollen_store', label: 'Tình trạng dự trữ phấn', type: 'select', options: ['Đủ', 'Thiếu', 'Cần bổ sung'], required: false },
          { name: 'disease_sign', label: 'Dấu hiệu bệnh',     type: 'boolean',required: false },
          { name: 'mite_level',   label: 'Mức độ ve Varroa',  type: 'select', options: ['Không phát hiện', 'Nhẹ (<3%)', 'Nặng (>3%) - cần xử lý'], required: false },
        ]
      },
      {
        tableName: 'Xử lý bệnh & Chăm sóc',
        fields: [
          { name: 'treat_date', label: 'Ngày xử lý',         type: 'date',   required: true  },
          { name: 'treatment',  label: 'Biện pháp',          type: 'select', options: ['Nhỏ Oxalic acid (ve)', 'Strips Apistan', 'Nuôi chúa mới', 'Ghép đàn', 'Bổ sung thức ăn'], required: true  },
          { name: 'product',    label: 'Sản phẩm sử dụng',  type: 'text',   required: false },
          { name: 'withdraw_days', label: 'Thời gian ngưng trước quay mật (ngày)', type: 'number', required: false },
        ]
      },
      {
        tableName: 'Quay mật ong',
        fields: [
          { name: 'harvest_date',   label: 'Ngày quay mật',        type: 'date',   required: true  },
          { name: 'frames_harvest', label: 'Số cầu quay (cầu)',    type: 'number', required: true  },
          { name: 'honey_kg',       label: 'Sản lượng mật (kg)',   type: 'number', required: true  },
          { name: 'moisture_pct',   label: 'Độ ẩm mật (%)',        type: 'number', required: false },
          { name: 'color',          label: 'Màu sắc mật',         type: 'select', options: ['Vàng nhạt', 'Vàng đậm', 'Nâu nhạt', 'Nâu đậm'], required: false },
          { name: 'quality',        label: 'Đạt tiêu chuẩn',      type: 'select', options: ['Xuất khẩu', 'Nội địa', 'Không đạt - loại bỏ'], required: false },
          { name: 'flora_source_label', label: 'Loại hoa khai thác', type: 'text', required: false },
        ]
      },
      {
        tableName: 'Sản phẩm phụ',
        fields: [
          { name: 'log_date',   label: 'Ngày ghi',           type: 'date',   required: true  },
          { name: 'product',    label: 'Loại sản phẩm',     type: 'select', options: ['Phấn hoa (g)', 'Sữa chúa (ml)', 'Keo ong (g)', 'Sáp ong (g)'], required: true  },
          { name: 'quantity',   label: 'Sản lượng',         type: 'number', required: true  },
        ]
      }
    ]
  },

  // 5. Dê thịt
  {
    name: 'Dê thịt',
    description: 'Nhật ký chăn nuôi dê thịt an toàn sinh học theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin đàn dê',
        fields: [
          { name: 'farm_name',   label: 'Tên trại',           type: 'text',   required: true  },
          { name: 'address',     label: 'Địa chỉ',            type: 'text',   required: true  },
          { name: 'breed',       label: 'Giống dê',          type: 'select', options: ['Boer', 'Bách Thảo', 'Boer lai Bách Thảo', 'Dê Cỏ', 'Beetal'], required: true  },
          { name: 'head_count',  label: 'Tổng số đầu (con)', type: 'number', required: true  },
          { name: 'entry_date',  label: 'Ngày nhập đàn',     type: 'date',   required: true  },
          { name: 'entry_weight',label: 'KL nhập TB (kg)',   type: 'number', required: false },
        ]
      },
      {
        tableName: 'Chuồng trại & Chăn thả',
        fields: [
          { name: 'log_date',    label: 'Ngày ghi',           type: 'date',   required: true  },
          { name: 'grazing',     label: 'Phương thức chăn',  type: 'select', options: ['Chăn thả hoàn toàn', 'Bán chăn thả', 'Nhốt chuồng hoàn toàn'], required: false },
          { name: 'grazing_area',label: 'Bãi chăn (ha)',     type: 'number', required: false },
          { name: 'clean_date',  label: 'Ngày vệ sinh chuồng', type: 'date', required: false },
          { name: 'mortality',   label: 'Số con chết/bệnh',  type: 'number', required: false },
        ]
      },
      {
        tableName: 'Thức ăn & Dinh dưỡng',
        fields: [
          { name: 'feed_date',   label: 'Ngày cho ăn',           type: 'date',   required: true  },
          { name: 'grass_type',  label: 'Loại cỏ / lá cây',      type: 'select', options: ['Cỏ voi', 'Cỏ sả', 'Lá mít', 'Lá chuối', 'Cỏ khô', 'Rơm'], required: false },
          { name: 'grass_kg',    label: 'Lượng cỏ/lá (kg/con)',  type: 'number', required: false },
          { name: 'concentrate', label: 'Cám/Bổ sung (kg/con)', type: 'number', required: false },
          { name: 'mineral',     label: 'Khoáng / muối',         type: 'boolean',required: false },
        ]
      },
      {
        tableName: 'Tiêm phòng & Thú y',
        fields: [
          { name: 'vac_date',      label: 'Ngày thực hiện',     type: 'date',   required: true  },
          { name: 'event_type',    label: 'Loại can thiệp',     type: 'select', options: ['Tiêm vaccine', 'Tẩy giun sán', 'Điều trị bệnh', 'Kiểm tra sức khoẻ'], required: true  },
          { name: 'medicine',      label: 'Thuốc / vaccine',    type: 'text',   required: true  },
          { name: 'disease',       label: 'Phòng / điều trị',  type: 'select', options: ['Lở mồm long móng', 'Đậu dê', 'Tụ huyết trùng', 'Giun sán', 'Tiêu chảy'], required: false },
          { name: 'withdraw_days', label: 'Ngưng thuốc (ngày)', type: 'number', required: true  },
        ]
      },
      {
        tableName: 'Sinh sản',
        fields: [
          { name: 'event_date', label: 'Ngày',              type: 'date',   required: true  },
          { name: 'doe_id',     label: 'Mã dê cái',        type: 'text',   required: false },
          { name: 'event',      label: 'Sự kiện',          type: 'select', options: ['Phối giống', 'Xác định có chửa', 'Đẻ dê con', 'Cai sữa'], required: true  },
          { name: 'kids_born',  label: 'Số dê con sinh',   type: 'number', required: false },
          { name: 'note',       label: 'Ghi chú',          type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Xuất chuồng',
        fields: [
          { name: 'export_date', label: 'Ngày xuất',           type: 'date',   required: true  },
          { name: 'head_sold',   label: 'Số con xuất (con)',   type: 'number', required: true  },
          { name: 'avg_weight',  label: 'KL TB (kg/con)',      type: 'number', required: true  },
          { name: 'price_kg',    label: 'Giá bán (đ/kg)',      type: 'number', required: false },
          { name: 'buyer',       label: 'Đơn vị thu mua',      type: 'text',   required: false },
        ]
      }
    ]
  },

  // 6. Dê sữa
  {
    name: 'Dê sữa',
    description: 'Nhật ký chăn nuôi dê sữa, theo dõi sản lượng sữa theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin đàn dê sữa',
        fields: [
          { name: 'farm_name',   label: 'Tên trại sữa',        type: 'text',   required: true  },
          { name: 'address',     label: 'Địa chỉ',              type: 'text',   required: true  },
          { name: 'breed',       label: 'Giống dê sữa',        type: 'select', options: ['Saanen', 'Alpine', 'Nubian', 'Toggenburg', 'Bách Thảo (sữa)', 'LaMancha'], required: true  },
          { name: 'doe_total',   label: 'Tổng số dê cái (con)', type: 'number', required: true  },
          { name: 'milking_does',label: 'Số dê đang vắt sữa',  type: 'number', required: true  },
          { name: 'start_date',  label: 'Ngày bắt đầu theo dõi', type: 'date', required: true  },
        ]
      },
      {
        tableName: 'Sản lượng sữa ngày',
        fields: [
          { name: 'log_date',     label: 'Ngày vắt',                   type: 'date',   required: true  },
          { name: 'doe_id',       label: 'Mã con / Nhóm dê',           type: 'text',   required: false },
          { name: 'morning_ml',   label: 'Sáng (ml)',                   type: 'number', required: false },
          { name: 'evening_ml',   label: 'Chiều (ml)',                  type: 'number', required: false },
          { name: 'daily_total_ml',label: 'Tổng/ngày/con (ml)',        type: 'number', required: true  },
          { name: 'herd_total_l', label: 'Tổng cả đàn (lít)',         type: 'number', required: true  },
        ]
      },
      {
        tableName: 'Chất lượng sữa dê',
        fields: [
          { name: 'test_date',   label: 'Ngày kiểm tra',        type: 'date',   required: true  },
          { name: 'fat_pct',     label: 'Mỡ sữa (%)',           type: 'number', required: false },
          { name: 'protein_pct', label: 'Protein (%)',           type: 'number', required: false },
          { name: 'ph_val',      label: 'pH sữa',               type: 'number', required: false },
          { name: 'pasteurized', label: 'Đã thanh trùng',       type: 'boolean',required: false },
        ]
      },
      {
        tableName: 'Thức ăn dê sữa',
        fields: [
          { name: 'log_date',     label: 'Ngày ghi',             type: 'date',   required: true  },
          { name: 'grass_kg',     label: 'Cỏ xanh (kg/con)',    type: 'number', required: false },
          { name: 'hay_kg',       label: 'Cỏ khô (kg/con)',     type: 'number', required: false },
          { name: 'concentrate',  label: 'Cám tinh (kg/con)',   type: 'number', required: false },
          { name: 'calcium_sup',  label: 'Bổ sung canxi',       type: 'boolean',required: false },
        ]
      },
      {
        tableName: 'Sinh sản & Thú y',
        fields: [
          { name: 'event_date',    label: 'Ngày',               type: 'date',   required: true  },
          { name: 'doe_id',        label: 'Mã dê cái',          type: 'text',   required: false },
          { name: 'event',         label: 'Sự kiện',            type: 'select', options: ['Phối giống', 'Kiểm tra có chửa', 'Đẻ con', 'Cạn sữa', 'Tiêm phòng', 'Điều trị'], required: true  },
          { name: 'medicine',      label: 'Thuốc / vaccine',    type: 'text',   required: false },
          { name: 'withdraw_days', label: 'Ngưng dùng sữa (ngày)', type: 'number', required: false },
          { name: 'note',          label: 'Ghi chú',            type: 'text',   required: false },
        ]
      }
    ]
  },

  // 7. Lợn thịt
  {
    name: 'Lợn thịt',
    description: 'Nhật ký chăn nuôi lợn thịt an toàn sinh học theo VietGAP',
    tables: [
      {
        tableName: 'Thông tin trại lợn',
        fields: [
          { name: 'farm_name',     label: 'Tên trại',              type: 'text',   required: true  },
          { name: 'address',       label: 'Địa chỉ',               type: 'text',   required: true  },
          { name: 'farm_area_m2',  label: 'Diện tích chuồng (m²)', type: 'number', required: false },
          { name: 'breed',         label: 'Giống lợn',             type: 'select', options: ['Yorkshire', 'Landrace', 'Duroc', 'Piétrain', 'Móng Cái', 'Lợn lai (L×Y)', 'Lợn 3 máu'], required: true  },
          { name: 'head_count',    label: 'Số con nhập (con)',     type: 'number', required: true  },
          { name: 'entry_date',    label: 'Ngày nhập đàn',         type: 'date',   required: true  },
          { name: 'entry_weight',  label: 'KL nhập TB (kg/con)',   type: 'number', required: false },
          { name: 'pig_source',    label: 'Nguồn cung cấp giống', type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Thức ăn & Dinh dưỡng',
        fields: [
          { name: 'feed_date',     label: 'Ngày cho ăn',             type: 'date',   required: true  },
          { name: 'growth_stage',  label: 'Giai đoạn',               type: 'select', options: ['Lợn con (tập ăn)', 'Lợn nuôi (15-50kg)', 'Lợn vỗ béo (50kg+)'], required: true  },
          { name: 'feed_type',     label: 'Loại thức ăn',            type: 'select', options: ['Cám hỗn hợp công nghiệp', 'Cám tự phối', 'Cám lỏng', 'Cám ép viên'], required: true  },
          { name: 'feed_amount',   label: 'Lượng thức ăn (kg/con)',  type: 'number', required: true  },
          { name: 'feed_times',    label: 'Số bữa/ngày',             type: 'select', options: ['2 bữa', '3 bữa', 'Tự do (ad libitum)'], required: false },
          { name: 'water_supply',  label: 'Nước uống tự động',       type: 'boolean',required: false },
          { name: 'additive',      label: 'Chất bổ sung (men, acid)', type: 'text',  required: false },
        ]
      },
      {
        tableName: 'Tiêm phòng & Thú y',
        fields: [
          { name: 'vac_date',      label: 'Ngày tiêm / điều trị',   type: 'date',   required: true  },
          { name: 'event_type',    label: 'Loại can thiệp',          type: 'select', options: ['Tiêm vaccine', 'Điều trị bệnh', 'Tẩy giun'], required: true  },
          { name: 'medicine',      label: 'Vaccine / thuốc',         type: 'text',   required: true  },
          { name: 'disease',       label: 'Phòng / điều trị bệnh',  type: 'select', options: ['Tai xanh (PRRS)', 'Dịch tả lợn', 'FMD (LMLM)', 'Suyễn lợn', 'Tụ huyết trùng', 'Tiêu chảy'], required: false },
          { name: 'dose_ml',       label: 'Liều lượng (ml/con)',     type: 'number', required: false },
          { name: 'withdraw_days', label: 'Ngưng thuốc trước xuất (ngày)', type: 'number', required: true  },
          { name: 'vet_name',      label: 'Thú y thực hiện',         type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Vệ sinh & An toàn sinh học',
        fields: [
          { name: 'log_date',     label: 'Ngày ghi',               type: 'date',   required: true  },
          { name: 'clean_type',   label: 'Công việc vệ sinh',      type: 'select', options: ['Vệ sinh chuồng hàng ngày', 'Phun tiêu độc', 'Tổng vệ sinh', 'Diệt chuột/ruồi'], required: true  },
          { name: 'disinfectant', label: 'Hoá chất khử trùng',    type: 'text',   required: false },
          { name: 'barn_temp',    label: 'Nhiệt độ chuồng (°C)',  type: 'number', required: false },
          { name: 'mortality',    label: 'Số con chết hôm nay',   type: 'number', required: false },
        ]
      },
      {
        tableName: 'Theo dõi tăng trọng',
        fields: [
          { name: 'weigh_date',  label: 'Ngày cân',              type: 'date',   required: true  },
          { name: 'sample_size', label: 'Số con cân (mẫu)',      type: 'number', required: false },
          { name: 'avg_weight',  label: 'KL TB (kg/con)',        type: 'number', required: true  },
          { name: 'adg',         label: 'Tăng trọng bình quân (g/ngày)', type: 'number', required: false },
          { name: 'fcr',         label: 'Hệ số tiêu tốn thức ăn FCR', type: 'number', required: false },
        ]
      },
      {
        tableName: 'Xuất chuồng',
        fields: [
          { name: 'export_date',   label: 'Ngày xuất',           type: 'date',   required: true  },
          { name: 'head_count',    label: 'Số con xuất (con)',   type: 'number', required: true  },
          { name: 'avg_weight_kg', label: 'KL xuất TB (kg/con)', type: 'number', required: true  },
          { name: 'total_kg',      label: 'Tổng khối lượng (kg)',type: 'number', required: true  },
          { name: 'price_kg',      label: 'Giá bán (đ/kg)',     type: 'number', required: false },
          { name: 'slaughterhouse',label: 'Cơ sở giết mổ / thu mua', type: 'text', required: false },
        ]
      }
    ]
  },

  // 8. Lúa hữu cơ
  {
    name: 'Lúa hữu cơ',
    description: 'Sản xuất lúa hữu cơ không sử dụng hoá chất tổng hợp, đạt tiêu chuẩn hữu cơ',
    tables: [
      {
        tableName: 'Thông tin chung',
        fields: [
          { name: 'owner_name',    label: 'Họ tên chủ hộ',        type: 'text',   required: true  },
          { name: 'address',       label: 'Địa chỉ vùng trồng',   type: 'text',   required: true  },
          { name: 'area_ha',       label: 'Diện tích (ha)',        type: 'number', required: true  },
          { name: 'start_date',    label: 'Ngày bắt đầu vụ',      type: 'date',   required: true  },
          { name: 'lot_code',      label: 'Mã lô ruộng',          type: 'text',   required: false },
          { name: 'rice_variety',  label: 'Giống lúa hữu cơ',    type: 'select', options: ['ST25', 'Japonica', 'Nàng Thơm Chợ Đào', 'Tím thơm', 'Nếp cẩm', 'Lúa đỏ địa phương'], required: true  },
          { name: 'season',        label: 'Vụ sản xuất',          type: 'select', options: ['Đông Xuân', 'Hè Thu', 'Thu Đông'], required: true  },
          { name: 'certification', label: 'Chứng nhận hữu cơ đang hướng đến', type: 'select', options: ['TCVN 11041-2:2017', 'USDA Organic', 'EU Organic', 'PGS (Hệ thống đảm bảo cùng tham gia)'], required: false },
          { name: 'organic_year',  label: 'Năm chuyển đổi hữu cơ',type: 'number', required: false },
        ]
      },
      {
        tableName: 'Chuẩn bị đất (không hoá chất)',
        fields: [
          { name: 'plow_date',    label: 'Ngày cày đất',              type: 'date',   required: true  },
          { name: 'soil_treatment',label: 'Cải tạo đất',             type: 'select', options: ['Vùi phân xanh', 'Rắc vôi (kiềm hoá)', 'Không xử lý'], required: false },
          { name: 'compost_type', label: 'Loại phân bón lót',        type: 'select', options: ['Phân chuồng ủ hoai mục', 'Phân trùn quế', 'Phân Lân hữu cơ vi sinh', 'Phân xanh'], required: true  },
          { name: 'compost_ton',  label: 'Lượng phân hữu cơ (tấn/ha)', type: 'number', required: true },
          { name: 'sow_date',     label: 'Ngày gieo sạ',             type: 'date',   required: true  },
          { name: 'seed_rate',    label: 'Lượng giống (kg/ha)',       type: 'number', required: true  },
          { name: 'seed_treatment',label: 'Xử lý hạt giống',        type: 'select', options: ['Nước muối 15%', 'Phơi nắng', 'Không xử lý hóa chất'], required: false },
        ]
      },
      {
        tableName: 'Chăm sóc hữu cơ',
        fields: [
          { name: 'care_date',       label: 'Ngày',                        type: 'date',   required: true  },
          { name: 'input_type',      label: 'Loại đầu vào được dùng',     type: 'select', options: ['Phân bón hữu cơ', 'Chế phẩm vi sinh', 'Nước tiểu ủ', 'Tro bếp', 'Nước bể hầm biogas'], required: true  },
          { name: 'product_name',    label: 'Tên sản phẩm / chế phẩm',   type: 'text',   required: false },
          { name: 'amount_applied',  label: 'Lượng sử dụng',              type: 'text',   required: false },
          { name: 'irrigation',      label: 'Quản lý nước',               type: 'select', options: ['Tưới ngập (SRI)', 'Tưới ướt - khô xen kẽ (AWD)', 'Ngập thường xuyên'], required: false },
          { name: 'weed_control',    label: 'Quản lý cỏ dại',             type: 'select', options: ['Làm cỏ tay', 'Thả vịt ăn cỏ', 'Phủ rơm', 'Không làm gì'], required: false },
        ]
      },
      {
        tableName: 'Quản lý sâu bệnh (sinh học)',
        fields: [
          { name: 'log_date',      label: 'Ngày ghi',                  type: 'date',   required: true  },
          { name: 'pest',          label: 'Đối tượng sâu / bệnh',     type: 'text',   required: true  },
          { name: 'severity',      label: 'Mức độ phát sinh',          type: 'select', options: ['Nhẹ (dưới ngưỡng)', 'Trung bình', 'Nặng'], required: true  },
          { name: 'bio_method',    label: 'Biện pháp sinh học áp dụng', type: 'select', options: ['Phóng thả thiên địch', 'Bẫy pheromone', 'Bẫy đèn', 'Chế phẩm Bt', 'Nấm xanh/Metarhizium', 'Không can thiệp'], required: true  },
          { name: 'note',          label: 'Ghi chú / Hiệu quả',        type: 'text',   required: false },
        ]
      },
      {
        tableName: 'Thu hoạch & Sau thu hoạch',
        fields: [
          { name: 'harvest_date',  label: 'Ngày gặt',                    type: 'date',   required: true  },
          { name: 'harvest_method',label: 'Phương thức gặt',             type: 'select', options: ['Gặt tay', 'Máy gặt đập liên hợp'], required: false },
          { name: 'yield_ton_ha',  label: 'Năng suất (tấn lúa tươi/ha)', type: 'number', required: true  },
          { name: 'moisture_pct',  label: 'Độ ẩm hạt lúa (%)',          type: 'number', required: false },
          { name: 'drying_method', label: 'Phơi / sấy',                 type: 'select', options: ['Phơi nắng', 'Sấy máy nhiệt độ thấp (<42°C)', 'Kho mát'], required: false },
          { name: 'storage',       label: 'Bảo quản sau thu hoạch',     type: 'select', options: ['Bao tải thông thường', 'Túi chân không', 'Kho lạnh'], required: false },
          { name: 'buyer',         label: 'Đơn vị thu mua / Chứng nhận', type: 'text', required: false },
        ]
      }
    ]
  }

];

// ─── Chạy seed (CHỈ THÊM, không xoá data cũ) ─────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    const existing = await FormSchema.find({}, 'name');
    const existingNames = new Set(existing.map(s => s.name));

    const toInsert = animalSchemas.filter(s => !existingNames.has(s.name));
    const skipped  = animalSchemas.filter(s =>  existingNames.has(s.name));

    if (skipped.length > 0) {
      console.log(`⏭️  Bỏ qua (đã tồn tại): ${skipped.map(s => s.name).join(', ')}`);
    }

    if (toInsert.length === 0) {
      console.log('⚠️  Không có schema mới nào cần thêm.');
    } else {
      await FormSchema.insertMany(toInsert);
      console.log(`✅ Đã thêm ${toInsert.length} schema mới:`);
      toInsert.forEach(s => console.log(`   - ${s.name}`));
    }

    console.log('\n🎉 Hoàn thành!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

seed();
