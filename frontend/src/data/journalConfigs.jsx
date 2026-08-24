import React from 'react';

// Illustration icons for various crops / livestock
export const CROP_ICONS = {
  'Sầu riêng': (
    <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-4xl shadow-sm">
      🍈
    </div>
  ),
  'Cà phê': (
    <div className="w-20 h-20 rounded-2xl bg-amber-900/10 border border-amber-900/20 flex items-center justify-center text-4xl shadow-sm">
      ☕
    </div>
  ),
  'Lúa': (
    <div className="w-20 h-20 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-4xl shadow-sm">
      🌾
    </div>
  ),
  'Rau củ quả': (
    <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-4xl shadow-sm">
      🥬
    </div>
  ),
  'Chăn nuôi': (
    <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-4xl shadow-sm">
      🐄
    </div>
  ),
  'Thủy sản': (
    <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-4xl shadow-sm">
      🐟
    </div>
  ),
};

export const getCropIcon = (loaiSo) => {
  if (!loaiSo) return CROP_ICONS['Sầu riêng'];
  for (const key of Object.keys(CROP_ICONS)) {
    if (loaiSo.toLowerCase().includes(key.toLowerCase())) {
      return CROP_ICONS[key];
    }
  }
  return (
    <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-4xl shadow-sm">
      🍈
    </div>
  );
};

// Exact 4 Tables Configuration for VietGAP / Organic Electronic Journals
export const FOUR_TABLES_CONFIG = [
  // ── BIỂU 1 ─────────────────────────────────────────────────────────────
  {
    key: 'bieu_1',
    label: 'Biểu 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
    tableTitle: 'Biểu 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
    columns: [
      { key: 'ngay_thang', title: 'Ngày tháng', label: 'Ngày tháng', type: 'datetime', placeholder: 'Ngày tháng', required: true },
      { key: 'dieu_kien', title: 'Điều kiện', label: 'Điều kiện', type: 'select', placeholder: 'Điều kiện', options: ['Đất/giá thể', 'Nước tưới', 'Nước phục vụ sơ chế', 'Sản phẩm'], required: true },
      { key: 'tac_nhan', title: 'Tác nhân gây ô nhiễm', label: 'Tác nhân gây ô nhiễm', type: 'select', placeholder: 'Tác nhân gây ô nhiễm', options: ['Dư lượng thuốc BVTV', 'Kim loại nặng', 'Vi sinh vật gây hại', 'Hóa chất bảo quản', 'Không có'], required: true },
      { key: 'danh_gia', title: 'Đánh giá hiện tại', label: 'Đánh giá hiện tại', type: 'select', placeholder: 'Đánh giá hiện tại', options: ['Đạt', 'Không đạt', 'Cần xử lý'], required: true },
      { key: 'bien_phap', title: 'Biện pháp xử lý đã áp dụng', label: 'Biện pháp xử lý đã áp dụng', type: 'text', placeholder: 'Biện pháp xử lý đã áp dụng', required: false, colSpan: 24 },
    ],
  },

  // ── BIỂU 2 ─────────────────────────────────────────────────────────────
  {
    key: 'bieu_2',
    label: 'Biểu 2. Bảng theo dõi mua hoặc tự sản xuất vật tư đầu vào',
    tableTitle: 'Biểu 2. Bảng theo dõi mua hoặc tự sản xuất vật tư đầu vào',
    columns: [
      { key: 'thoi_gian', title: 'Thời gian', label: 'Thời gian', type: 'date', placeholder: 'Thời gian', required: true },
      { key: 'ten_vat_tu', title: 'Tên vật tư', label: 'Tên vật tư', type: 'text', placeholder: 'Tên vật tư', required: true },
      { key: 'so_luong', title: 'Số lượng', label: 'Số lượng', type: 'text', placeholder: 'Số lượng', required: false },
      { key: 'dvt', title: 'ĐVT', label: 'ĐVT', type: 'text', placeholder: 'ĐVT', required: true },
      { key: 'ten_dia_chi_mua', title: 'Tên và địa chỉ mua vật tư', label: 'Tên và địa chỉ mua vật tư', type: 'text', placeholder: 'Tên và địa chỉ mua vật tư', required: true },
      { key: 'han_su_dung', title: 'Hạn sử dụng', label: 'Hạn sử dụng', type: 'date', placeholder: 'Hạn sử dụng', required: true },
      { key: 'nguyen_lieu_sx', title: 'Nguyên liệu sản xuất', label: 'Nguyên liệu sản xuất', type: 'text', placeholder: 'Nguyên liệu sản xuất', required: false },
      { key: 'phuong_phap_xl', title: 'Phương pháp xử lý', label: 'Phương pháp xử lý', type: 'text', placeholder: 'Phương pháp xử lý', required: false },
      { key: 'hoa_chat_xl', title: 'Hóa chất xử lý', label: 'Hóa chất xử lý', type: 'text', placeholder: 'Hóa chất xử lý', required: false },
      { key: 'nguoi_xl', title: 'Người xử lý', label: 'Người xử lý', type: 'text', placeholder: 'Người xử lý', required: false },
    ],
  },

  // ── BẢNG 3 ─────────────────────────────────────────────────────────────
  {
    key: 'bang_3',
    label: 'Bảng 3. Bảng nhật ký canh tác',
    tableTitle: 'Bảng 3. Bảng nhật ký canh tác',
    columns: [
      { key: 'thoi_gian_th', title: 'Thời gian thực hiện', label: 'Thời gian thực hiện', type: 'date', placeholder: 'Thời gian thực hiện', required: true },
      { key: 'ten_phan_bon', title: 'Tên phân bón', label: 'Tên phân bón', type: 'text', placeholder: 'Tên phân bón', required: false },
      { key: 'luong_su_dung_kg', title: 'Lượng sử dụng (Kg)', label: 'Lượng sử dụng (Kg)', type: 'text', placeholder: 'Lượng sử dụng (Kg)', required: false },
      { key: 'ten_thuoc_bvtv', title: 'Tên thuốc BVTV', label: 'Tên thuốc BVTV', type: 'text', placeholder: 'Tên thuốc BVTV', required: false },
      { key: 'nong_do_pha', title: 'Nồng độ pha', label: 'Nồng độ pha', type: 'text', placeholder: 'Nồng độ pha', required: false },
      { key: 'luong_su_dung', title: 'Lượng sử dụng', label: 'Lượng sử dụng', type: 'text', placeholder: 'Lượng sử dụng', required: false },
      { key: 'thoi_gian_cach_ly', title: 'Thời gian cách ly(ngày)', label: 'Thời gian cách ly(ngày)', type: 'text', placeholder: 'Thời gian cách ly(ngày)', required: false },
      { key: 'ghi_chu', title: 'Ghi chú', label: 'Ghi chú', type: 'text', placeholder: 'Ghi chú', required: false },
    ],
  },

  // ── BẢNG 4 ─────────────────────────────────────────────────────────────
  {
    key: 'bang_4',
    label: 'Bảng 4. Thu hoạch sản phẩm và tiêu thụ',
    tableTitle: 'Bảng 4. Thu hoạch sản phẩm và tiêu thụ',
    columns: [
      { key: 'thoi_gian_thu_hoach', title: 'Thời gian thu hoạch', label: 'Thời gian thu hoạch', type: 'date', placeholder: 'Thời gian thu hoạch', required: true },
      { key: 'ma_so_lo_th', title: 'Mã số lô thu hoạch', label: 'Mã số lô thu hoạch', type: 'text', placeholder: 'Mã số lô thu hoạch', required: true },
      { key: 'ten_san_pham', title: 'Tên sản phẩm', label: 'Tên sản phẩm', type: 'text', placeholder: 'Tên sản phẩm', required: true },
      { key: 'san_luong', title: 'Sản lượng', label: 'Sản lượng', type: 'text', placeholder: 'Sản lượng', required: true },
      { key: 'dvt_thu_hoach', title: 'ĐVT Thu hoạch', label: 'ĐVT Thu hoạch', type: 'text', placeholder: 'ĐVT Thu hoạch', required: true },
      { key: 'dia_diem_so_che', title: 'Địa điểm sơ chế', label: 'Địa điểm sơ chế', type: 'text', placeholder: 'Địa điểm sơ chế', required: false },
      { key: 'ngay_ban', title: 'Ngày bán', label: 'Ngày bán', type: 'date', placeholder: 'Ngày bán', required: true },
      { key: 'so_luong_ban', title: 'Số lượng bán', label: 'Số lượng bán', type: 'text', placeholder: 'Số lượng bán', required: true },
      { key: 'dvt_ban', title: 'ĐVT Bán', label: 'ĐVT Bán', type: 'text', placeholder: 'ĐVT Bán', required: true },
      { key: 'don_vi_thu_mua', title: 'Đơn vị thu mua/Địa chỉ', label: 'Đơn vị thu mua/Địa chỉ', type: 'text', placeholder: 'Đơn vị thu mua/Địa chỉ', required: true },
      { key: 'ghi_chu', title: 'Ghi chú', label: 'Ghi chú', type: 'text', placeholder: 'Ghi chú', required: false, colSpan: 24 },
    ],
  }
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
