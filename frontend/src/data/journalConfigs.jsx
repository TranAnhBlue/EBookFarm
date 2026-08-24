import React from 'react';

// Illustration icons & SVG graphics for various crops / livestock
export const CROP_ICONS = {
  'Sầu riêng': (
    <svg viewBox="0 0 120 100" className="w-24 h-24 drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="60" cy="90" rx="42" ry="6" fill="#cbd5e1" opacity="0.6" />
      {/* Outer green spiky rind */}
      <path d="M18 62C16 42 30 26 54 24C78 22 98 34 104 54C108 68 98 84 80 88C60 92 24 82 18 62Z" fill="#5b8c2a" stroke="#3b6016" strokeWidth="2.5" />
      {/* Spikes */}
      <path d="M16 48L10 44L18 40L14 34L22 32L20 25L28 26L30 18L38 21L42 14L50 20L58 14L64 22L72 16L78 24L86 20L90 28L98 26L98 34L106 36L102 44L108 48L102 56L108 62L100 68L104 76L94 78L96 86L86 86L82 92L72 88L64 94L54 88L44 92L38 84L28 86L26 78L18 76L20 68L14 62L20 56L16 48Z" fill="#6ba532" />
      {/* Open cavity (cream inner) */}
      <path d="M26 56C24 40 38 30 58 30C80 30 94 40 96 56C98 70 86 80 66 80C46 80 28 72 26 56Z" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
      {/* Yellow fruit segments */}
      <ellipse cx="44" cy="50" rx="14" ry="9" transform="rotate(-15 44 50)" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      <ellipse cx="72" cy="52" rx="16" ry="10" transform="rotate(15 72 52)" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      <ellipse cx="56" cy="64" rx="15" ry="8" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
      {/* Highlight reflections */}
      <path d="M40 46C44 44 50 46 52 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 47C74 46 80 49 82 52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  'Cà phê': (
    <svg viewBox="0 0 120 100" className="w-24 h-24 drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="60" cy="90" rx="42" ry="6" fill="#cbd5e1" opacity="0.6" />
      {/* Green leaves */}
      <path d="M72 44C88 32 108 34 114 44C108 58 88 56 72 44Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
      <path d="M74 44C86 40 98 42 110 44" stroke="#86efac" strokeWidth="1" />
      <path d="M68 34C82 18 100 18 108 26C104 38 86 42 68 34Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
      <path d="M70 34C82 28 92 28 102 28" stroke="#bbf7d0" strokeWidth="1" />
      {/* Roasted coffee beans cluster */}
      {/* Bean 1 */}
      <ellipse cx="38" cy="68" rx="16" ry="11" transform="rotate(-20 38 68)" fill="#451a03" stroke="#270f03" strokeWidth="1.5" />
      <path d="M28 64C34 68 42 66 48 72" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      {/* Bean 2 */}
      <ellipse cx="62" cy="72" rx="15" ry="10" transform="rotate(25 62 72)" fill="#5c2607" stroke="#270f03" strokeWidth="1.5" />
      <path d="M52 75C58 71 64 73 72 69" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      {/* Bean 3 */}
      <ellipse cx="50" cy="54" rx="14" ry="9" transform="rotate(-40 50 54)" fill="#78350f" stroke="#270f03" strokeWidth="1.5" />
      <path d="M42 50C48 54 52 56 58 60" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
      {/* Bean 4 */}
      <ellipse cx="74" cy="58" rx="14" ry="9" transform="rotate(10 74 58)" fill="#451a03" stroke="#270f03" strokeWidth="1.5" />
      <path d="M64 58C70 56 76 60 84 58" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
      {/* Bean 5 */}
      <ellipse cx="30" cy="56" rx="12" ry="8" transform="rotate(30 30 56)" fill="#5c2607" stroke="#270f03" strokeWidth="1.5" />
      <path d="M24 58C28 54 34 56 36 52" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'Lúa': (
    <svg viewBox="0 0 120 100" className="w-24 h-24 drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="90" rx="36" ry="5" fill="#cbd5e1" opacity="0.6" />
      {/* Rice stems */}
      <path d="M40 85C46 50 64 28 82 18" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 85C54 55 70 35 90 26" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 85C38 60 48 42 62 32" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round" />
      {/* Rice grains */}
      <ellipse cx="80" cy="20" rx="6" ry="3.5" transform="rotate(30 80 20)" fill="#facc15" stroke="#a16207" strokeWidth="1" />
      <ellipse cx="74" cy="26" rx="6" ry="3.5" transform="rotate(45 74 26)" fill="#facc15" stroke="#a16207" strokeWidth="1" />
      <ellipse cx="68" cy="34" rx="6" ry="3.5" transform="rotate(40 68 34)" fill="#facc15" stroke="#a16207" strokeWidth="1" />
      <ellipse cx="60" cy="42" rx="6" ry="3.5" transform="rotate(50 60 42)" fill="#facc15" stroke="#a16207" strokeWidth="1" />
      <ellipse cx="86" cy="30" rx="6" ry="3.5" transform="rotate(20 86 30)" fill="#fde047" stroke="#a16207" strokeWidth="1" />
      <ellipse cx="80" cy="38" rx="6" ry="3.5" transform="rotate(35 80 38)" fill="#fde047" stroke="#a16207" strokeWidth="1" />
      <ellipse cx="72" cy="48" rx="6" ry="3.5" transform="rotate(40 72 48)" fill="#fde047" stroke="#a16207" strokeWidth="1" />
    </svg>
  ),
  'Rau củ quả': (
    <svg viewBox="0 0 120 100" className="w-24 h-24 drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="90" rx="38" ry="5" fill="#cbd5e1" opacity="0.6" />
      {/* Cabbage / Lettuce */}
      <circle cx="56" cy="58" r="26" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
      <path d="M40 40C48 34 64 34 72 40C78 50 74 66 64 74C52 80 40 72 38 60C36 50 36 44 40 40Z" fill="#86efac" stroke="#15803d" strokeWidth="1.5" />
      <path d="M48 48C54 44 60 44 64 48C68 56 64 64 56 68C50 70 46 66 46 58C46 54 46 50 48 48Z" fill="#bbf7d0" stroke="#166534" strokeWidth="1" />
      {/* Tomato */}
      <circle cx="82" cy="68" r="16" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <path d="M82 52L84 48L80 50L78 46L79 51L74 51L78 53L82 52Z" fill="#15803d" />
      <circle cx="78" cy="64" r="3" fill="#fca5a5" opacity="0.7" />
    </svg>
  ),
  'Chăn nuôi': (
    <svg viewBox="0 0 120 100" className="w-24 h-24 drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="90" rx="38" ry="5" fill="#cbd5e1" opacity="0.6" />
      <circle cx="60" cy="54" r="28" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
      <circle cx="48" cy="50" r="3.5" fill="#1e293b" />
      <circle cx="72" cy="50" r="3.5" fill="#1e293b" />
      <ellipse cx="60" cy="62" rx="14" ry="8" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
      <ellipse cx="54" cy="62" rx="2" ry="3" fill="#9a3412" />
      <ellipse cx="66" cy="62" rx="2" ry="3" fill="#9a3412" />
      {/* Ears */}
      <path d="M38 34C32 26 24 30 26 40C28 46 36 44 38 34Z" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
      <path d="M82 34C88 26 96 30 94 40C92 46 84 44 82 34Z" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
    </svg>
  ),
  'Thủy sản': (
    <svg viewBox="0 0 120 100" className="w-24 h-24 drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="90" rx="38" ry="5" fill="#cbd5e1" opacity="0.6" />
      {/* Fish body */}
      <path d="M24 54C40 34 76 34 94 54C76 74 40 74 24 54Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
      {/* Tail */}
      <path d="M26 54L10 38V70L26 54Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
      {/* Fin */}
      <path d="M58 40C66 32 74 34 78 38" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 58C62 66 70 64 74 60" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="82" cy="50" r="3.5" fill="#0f172a" />
      <circle cx="83" cy="49" r="1" fill="#ffffff" />
      {/* Gills */}
      <path d="M72 46C70 50 70 58 72 62" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export const getCropIcon = (loaiSo) => {
  if (!loaiSo) return CROP_ICONS['Sầu riêng'];
  for (const key of Object.keys(CROP_ICONS)) {
    if (loaiSo.toLowerCase().includes(key.toLowerCase())) {
      return CROP_ICONS[key];
    }
  }
  return CROP_ICONS['Sầu riêng'];
};

// Exact 4 Tables Configuration for VietGAP / Organic Electronic Journals
export const FOUR_TABLES_CONFIG = [
  // ── BIỂU 1 ─────────────────────────────────────────────────────────────
  {
    key: 'bieu_1',
    shortLabel: 'Biểu 1',
    simpleTitle: 'Đất & Nguồn nước',
    desc: 'Đánh giá chỉ tiêu an toàn đất, nước tưới & sơ chế',
    icon: '🧪',
    label: 'Biểu 1. Đánh giá các chỉ tiêu ATTP trong đất, nước tưới',
    tableTitle: 'Biểu 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
    columns: [
      { key: 'ngay_thang', title: 'Ngày tháng', label: 'Ngày tháng kiểm tra', type: 'date', placeholder: 'Chọn ngày', required: true },
      { key: 'dieu_kien', title: 'Điều kiện kiểm tra', label: 'Đối tượng kiểm tra (Đất/Nước/Sản phẩm)', type: 'select', placeholder: 'Chọn đối tượng kiểm tra', options: ['Đất/giá thể', 'Nước tưới', 'Sản phẩm'], required: true },
      { key: 'tac_nhan', title: 'Tác nhân ô nhiễm', label: 'Tác nhân gây ô nhiễm', type: 'select_multiple', placeholder: 'Chọn hoặc tự động điền tác nhân', options: ['Kim loại nặng', 'Dư lượng thuốc BVTV', 'Vi sinh vật', 'Độc tố vi nấm trong sản phẩm'], required: true },
      { key: 'danh_gia', title: 'Đánh giá an toàn', label: 'Kết quả đánh giá', type: 'select', placeholder: 'Chọn Đạt hoặc Không đạt', options: ['Đạt', 'Không đạt', 'Cần xử lý thêm'], required: true },
      { key: 'bien_phap', title: 'Biện pháp xử lý đã làm', label: 'Biện pháp khắc phục / xử lý (nếu có)', type: 'text', placeholder: 'Ví dụ: Rắc vôi bột khử trùng, lắng lọc nước...', required: false, colSpan: 24 },
    ],
  },

  // ── BIỂU 2 ─────────────────────────────────────────────────────────────
  {
    key: 'bieu_2',
    shortLabel: 'Biểu 2',
    simpleTitle: 'Vật tư đầu vào',
    desc: 'Theo dõi mua phân bón, thuốc BVTV, chế phẩm',
    icon: '📦',
    label: 'Biểu 2. Theo dõi mua hoặc tự sản xuất vật tư',
    tableTitle: 'Biểu 2. Bảng theo dõi mua hoặc tự sản xuất vật tư đầu vào',
    columns: [
      { key: 'thoi_gian', title: 'Ngày mua / nhập', label: 'Ngày mua hoặc nhập vật tư', type: 'date', placeholder: 'Chọn ngày', required: true },
      { key: 'ten_vat_tu', title: 'Tên vật tư / Phân / Thuốc', label: 'Tên phân bón, thuốc hoặc vật tư', type: 'text', placeholder: 'Ví dụ: NPK 20-20-15, Ridomil Gold...', required: true },
      { key: 'so_luong', title: 'Số lượng', label: 'Số lượng mua', type: 'text', placeholder: 'Ví dụ: 50, 10...', required: false },
      { key: 'dvt', title: 'Đơn vị tính (ĐVT)', label: 'Đơn vị (Bao, Chai, Kg, Lít)', type: 'text', placeholder: 'Bao, Kg, Lít, Chai...', required: true },
      { key: 'ten_dia_chi_mua', title: 'Nơi mua vật tư', label: 'Tên đại lý / Cửa hàng bán', type: 'text', placeholder: 'Ví dụ: Đại lý VTNN Sáu Thắng - Thạch Hòa', required: true },
      { key: 'han_su_dung', title: 'Hạn sử dụng', label: 'Hạn dùng in trên bao bì', type: 'date', placeholder: 'Chọn ngày hết hạn', required: true },
      { key: 'nguyen_lieu_sx', title: 'Nguyên liệu SX', label: 'Nguyên liệu sản xuất (nếu tự ủ phân)', type: 'text', placeholder: 'Phân chuồng, vỏ trấu, vi sinh Trichoderma...', required: false },
      { key: 'phuong_phap_xl', title: 'Cách xử lý', label: 'Phương pháp xử lý / ủ', type: 'text', placeholder: 'Ủ hoai mục, lên men...', required: false },
      { key: 'hoa_chat_xl', title: 'Hóa chất xử lý', label: 'Chế phẩm kèm theo', type: 'text', placeholder: 'Men vi sinh, EM1...', required: false },
      { key: 'nguoi_xl', title: 'Người thực hiện', label: 'Người mua / người xử lý', type: 'text', placeholder: 'Tên người làm', required: false },
    ],
  },

  // ── BẢNG 3 ─────────────────────────────────────────────────────────────
  {
    key: 'bang_3',
    shortLabel: 'Biểu 3',
    simpleTitle: 'Nhật ký canh tác',
    desc: 'Ghi chép bón phân, xịt thuốc & thời gian cách ly',
    icon: '🌿',
    label: 'Bảng 3. Bảng nhật ký canh tác (Bón phân & Phun thuốc)',
    tableTitle: 'Bảng 3. Bảng nhật ký canh tác (Bón phân, chăm sóc & Phòng trừ sâu bệnh)',
    columns: [
      { key: 'thoi_gian_th', title: 'Ngày thực hiện', label: 'Ngày thực hiện công việc', type: 'date', placeholder: 'Chọn ngày bón/xịt', required: true },
      { key: 'ten_phan_bon', title: 'Tên phân bón', label: 'Tên loại phân bón đã dùng', type: 'text', placeholder: 'Ví dụ: Hữu cơ vi sinh, NPK 15-15-15...', required: false },
      { key: 'luong_su_dung_kg', title: 'Lượng phân (Kg)', label: 'Lượng phân đã bón (Kg hoặc Bao)', type: 'text', placeholder: 'Ví dụ: 20 kg, 2 bao...', required: false },
      { key: 'ten_thuoc_bvtv', title: 'Tên thuốc BVTV', label: 'Tên thuốc phòng trừ sâu bệnh', type: 'text', placeholder: 'Ví dụ: Anvil 5SC, Confidor...', required: false },
      { key: 'nong_do_pha', title: 'Nồng độ pha', label: 'Liều lượng pha (bình/phuy)', type: 'text', placeholder: 'Ví dụ: 20ml / bình 25 lít, 1 chai / 200 lít...', required: false },
      { key: 'luong_su_dung', title: 'Tổng lượng thuốc', label: 'Tổng số bình/phuy đã phun', type: 'text', placeholder: 'Ví dụ: 4 bình, 1 phuy 200L...', required: false },
      { key: 'thoi_gian_cach_ly', title: 'Cách ly (Ngày)', label: 'Thời gian cách ly an toàn (PHI - Ngày)', type: 'text', placeholder: 'Ví dụ: 7 ngày, 14 ngày...', required: false },
      { key: 'ghi_chu', title: 'Ghi chú / Tình trạng', label: 'Ghi chú thêm (thời tiết, sâu bệnh...)', type: 'text', placeholder: 'Trời râm mát, sâu cuốn lá giảm rõ rệt...', required: false, colSpan: 24 },
    ],
  },

  // ── BẢNG 4 ─────────────────────────────────────────────────────────────
  {
    key: 'bang_4',
    shortLabel: 'Biểu 4',
    simpleTitle: 'Thu hoạch & Bán hàng',
    desc: 'Ghi chép sản lượng, ngày thu hái và nơi tiêu thụ',
    icon: '🍈',
    label: 'Bảng 4. Thu hoạch sản phẩm và tiêu thụ',
    tableTitle: 'Bảng 4. Nhật ký thu hoạch và xuất bán sản phẩm',
    columns: [
      { key: 'thoi_gian_thu_hoach', title: 'Ngày thu hoạch', label: 'Ngày hái / thu hoạch', type: 'date', placeholder: 'Chọn ngày thu hái', required: true },
      { key: 'ma_so_lo_th', title: 'Mã lô thu hái', label: 'Mã số lô thu hoạch', type: 'text', placeholder: 'Ví dụ: LO-01-D1, DOT-1...', required: true },
      { key: 'ten_san_pham', title: 'Loại sản phẩm', label: 'Tên sản phẩm (Sầu riêng, Lúa...)', type: 'text', placeholder: 'Ví dụ: Sầu riêng Monthong loại 1', required: true },
      { key: 'san_luong', title: 'Sản lượng thu', label: 'Sản lượng thu được', type: 'text', placeholder: 'Ví dụ: 500, 1.2...', required: true },
      { key: 'dvt_thu_hoach', title: 'ĐVT Thu hoạch', label: 'Đơn vị tính (Kg, Tấn, Trái)', type: 'text', placeholder: 'Kg, Tạ, Tấn, Quả...', required: true },
      { key: 'dia_diem_so_che', title: 'Nơi sơ chế / đóng gói', label: 'Địa điểm sơ chế, rửa, đóng thùng', type: 'text', placeholder: 'Tại vựa HTX Tân Quan / Tại vườn', required: false },
      { key: 'ngay_ban', title: 'Ngày xuất bán', label: 'Ngày giao hoặc bán cho thương lái', type: 'date', placeholder: 'Chọn ngày bán', required: true },
      { key: 'so_luong_ban', title: 'Số lượng bán', label: 'Số lượng đã bán', type: 'text', placeholder: 'Ví dụ: 500...', required: true },
      { key: 'dvt_ban', title: 'ĐVT Bán', label: 'Đơn vị tính bán (Kg, Tấn)', type: 'text', placeholder: 'Kg, Tấn...', required: true },
      { key: 'don_vi_thu_mua', title: 'Nơi thu mua / Thương lái', label: 'Tên đơn vị hoặc thương lái thu mua', type: 'text', placeholder: 'HTX Tân Quan / Công ty XNK Hữu Nghị', required: true },
      { key: 'ghi_chu', title: 'Ghi chú', label: 'Ghi chú thêm (Giá bán, chất lượng...)', type: 'text', placeholder: 'Giá 85.000đ/kg, hàng đẹp...', required: false, colSpan: 24 },
    ],
  },
];

// Initial mock data
export const INITIAL_BOOKS = [
  {
    id: 'book-1',
    maNongHo: 'test',
    hoTen: 'test',
    loaiSo: 'Sầu riêng',
    dienTich: 'Test',
    ngayBatDau: '30/07/2026 11:16',
    matDo: '10',
    tongTuiPhoi: '10',
    ngayBatDauDatTui: '2',
    diaChi: 'tes',
    diaChiSanXuat: 'tes',
    loSanXuat: 'Test',
    tenCoSo: 'Cơ sở Test',
    maSoThua: 'Test01',
    soDoVuon: null,
    tablesData: { bieu_1: [], bieu_2: [], bang_3: [], bang_4: [] }
  },
  {
    id: 'book-2',
    maNongHo: 'BANHANG',
    hoTen: 'Trần Đức Anh Test',
    loaiSo: 'Cà phê',
    dienTich: 'Test',
    ngayBatDau: '24/08/2026 11:25',
    matDo: '10',
    tongTuiPhoi: '10',
    ngayBatDauDatTui: '2',
    diaChi: 'Thach Hoa',
    diaChiSanXuat: 'Thạch Hòa',
    loSanXuat: 'Test',
    tenCoSo: 'HTX Nông Nghiệp Thạch Hòa',
    maSoThua: 'Test02',
    soDoVuon: null,
    tablesData: { bieu_1: [], bieu_2: [], bang_3: [], bang_4: [] }
  }
];
