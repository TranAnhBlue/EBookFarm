const guavaVietgapTables = [
  {
    tableName: 'Thông tin chung',
    isMultiRow: false,
    fields: [
      { name: 'nguoiGhiChep', label: 'Họ và tên người ghi chép', type: 'text', required: true },
      { name: 'truongNhom', label: 'Trưởng nhóm', type: 'text' },
      { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text' },
      { name: 'diaChiSanXuat', label: 'Địa chỉ sản xuất', type: 'text', required: true },
      { name: 'dienTich', label: 'Diện tích (m2)', type: 'number', required: true },
      { name: 'cayTrong', label: 'Cây trồng', type: 'text', required: true },
      { name: 'quyTrinhSanXuat', label: 'Quy trình sản xuất, tiêu chuẩn đã áp dụng (nếu có)', type: 'text' },
      { name: 'namSanXuat', label: 'Năm sản xuất', type: 'number', required: true }
    ]
  },
  {
    tableName: 'Bảng 1. Đánh giá chỉ tiêu ATTP',
    isMultiRow: true,
    fields: [
      { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
      { name: 'dieuKien', label: 'Điều kiện', type: 'select', options: ['Đất/giá thể', 'Nước tưới', 'Nước phục vụ sơ chế', 'Sản phẩm'], required: true },
      { name: 'tacNhan', label: 'Tác nhân gây ô nhiễm', type: 'select', options: ['Kim loại nặng', 'Vi sinh vật', 'Dư lượng thuốc BVTV', 'Độc tố vi nấm trong sản phẩm', 'Khác'], required: true },
      { name: 'danhGia', label: 'Đánh giá hiện tại', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
      { name: 'bienPhapXuLy', label: 'Biện pháp xử lý đã áp dụng', type: 'textarea' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 2. Theo dõi vật tư nông nghiệp đầu vào',
    isMultiRow: true,
    fields: [
      { name: 'loaiDong', label: 'Loại dòng', type: 'select', options: ['Nhập/mua vật tư', 'Phân bổ vật tư theo hộ'], required: true },
      { name: 'thoiGian', label: 'Thời gian thực hiện', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
      { name: 'donViTinh', label: 'ĐVT', type: 'text' },
      { name: 'soLuong', label: 'Số lượng', type: 'number' },
      { name: 'tenDiaChiMua', label: 'Tên và địa chỉ mua vật tư', type: 'textarea' },
      { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'text' },
      { name: 'nguoiMuaSuDung', label: 'Tên người mua/sử dụng', type: 'text' },
      { name: 'nguyenLieuSanXuat', label: 'Nguyên liệu sản xuất (nếu tự sản xuất)', type: 'textarea' },
      { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý', type: 'textarea' },
      { name: 'hoaChatXuLy', label: 'Hóa chất xử lý', type: 'text' },
      { name: 'nguoiXuLy', label: 'Người xử lý', type: 'text' },
      { name: 'tt', label: 'TT hộ', type: 'number' },
      { name: 'tenHo', label: 'Tên hộ', type: 'text' },
      { name: 'dienTichHo', label: 'Diện tích hộ (m2)', type: 'number' },
      { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text' },
      { name: 'bayDanDu', label: 'Bẫy dẫn dụ (cái)', type: 'number' },
      { name: 'voiKg', label: 'Vôi (kg)', type: 'number' },
      { name: 'phanHuuCoKg', label: 'Phân hữu cơ (kg)', type: 'number' },
      { name: 'superLanKg', label: 'Super lân (kg)', type: 'number' },
      { name: 'npk16168Kg', label: 'NPK 16-16-8 (kg)', type: 'number' },
      { name: 'npk15520TeKg', label: 'NPK 15-5-20+TE (kg)', type: 'number' },
      { name: 'abapoMl', label: 'Abapo 1.8EC (ml)', type: 'number' },
      { name: 'coc85WpGam', label: 'Coc 85 WP (gam)', type: 'number' },
      { name: 'canxiBoMl', label: 'Canxi-Bo (ml)', type: 'number' },
      { name: 'aminoAcidMl', label: 'Amino acid (ml)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 3. Theo dõi bón lót',
    isMultiRow: true,
    fields: [
      { name: 'loaiDong', label: 'Loại dòng', type: 'select', options: ['Hướng dẫn sử dụng', 'Lượng sử dụng theo hộ'], required: true },
      { name: 'ngaySuDung', label: 'Ngày tháng sử dụng', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
      { name: 'mucDichSuDung', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'lieuLuongNongDo', label: 'Liều lượng/nồng độ pha', type: 'text' },
      { name: 'cachDung', label: 'Cách dùng', type: 'textarea' },
      { name: 'tt', label: 'TT hộ', type: 'number' },
      { name: 'tenHo', label: 'Tên hộ', type: 'text' },
      { name: 'dienTichHo', label: 'Diện tích hộ (m2)', type: 'number' },
      { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text' },
      { name: 'voiKg', label: 'Vôi (kg)', type: 'number' },
      { name: 'phanHuuCoKg', label: 'Phân hữu cơ (kg)', type: 'number' },
      { name: 'superLanKg', label: 'Super lân (kg)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 4. Theo dõi bón thúc',
    isMultiRow: true,
    fields: [
      { name: 'loaiDong', label: 'Loại dòng', type: 'select', options: ['Hướng dẫn sử dụng', 'Lượng sử dụng theo hộ'], required: true },
      { name: 'ngaySuDung', label: 'Ngày tháng sử dụng', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
      { name: 'mucDichSuDung', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'lieuLuongNongDo', label: 'Liều lượng/nồng độ pha', type: 'text' },
      { name: 'cachDung', label: 'Cách dùng', type: 'textarea' },
      { name: 'ghiChuHuongDan', label: 'Ghi chú hướng dẫn/lần phun', type: 'text' },
      { name: 'tt', label: 'TT hộ', type: 'number' },
      { name: 'tenHo', label: 'Tên hộ', type: 'text' },
      { name: 'dienTichHo', label: 'Diện tích hộ (m2)', type: 'number' },
      { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text' },
      { name: 'npk16168Kg', label: 'NPK 16-16-8 (kg)', type: 'number' },
      { name: 'aminoAcidMl', label: 'Amino acid (ml)', type: 'number' },
      { name: 'canxiBoMl', label: 'Canxi-Bo (ml)', type: 'number' },
      { name: 'npk15520TeKg', label: 'NPK 15-5-20+TE (kg)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 5. Theo dõi sử dụng thuốc BVTV',
    isMultiRow: true,
    fields: [
      { name: 'loaiDong', label: 'Loại dòng', type: 'select', options: ['Hướng dẫn sử dụng', 'Lượng sử dụng theo hộ'], required: true },
      { name: 'ngaySuDung', label: 'Ngày tháng sử dụng', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư/thuốc BVTV', type: 'text' },
      { name: 'mucDichSuDung', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'lieuLuongNongDo', label: 'Liều lượng/nồng độ pha', type: 'text' },
      { name: 'cachDung', label: 'Cách dùng', type: 'textarea' },
      { name: 'thoiGianCachLy', label: 'Thời gian cách ly', type: 'text' },
      { name: 'ghiChuHuongDan', label: 'Ghi chú hướng dẫn/lần phun', type: 'text' },
      { name: 'tt', label: 'TT hộ', type: 'number' },
      { name: 'tenHo', label: 'Tên hộ', type: 'text' },
      { name: 'dienTichHo', label: 'Diện tích hộ (m2)', type: 'number' },
      { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text' },
      { name: 'abapoMl', label: 'Abapo 1.8EC (ml)', type: 'number' },
      { name: 'coc85WpGam', label: 'Coc 85 WP (gam)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 6. Nhật ký thu hoạch và bán sản phẩm',
    isMultiRow: true,
    fields: [
      { name: 'loaiSanPham', label: 'Loại sản phẩm', type: 'text' },
      { name: 'soVuNam', label: 'Số vụ/năm', type: 'text' },
      { name: 'nangSuat', label: 'Năng suất', type: 'text' },
      { name: 'sanLuong', label: 'Sản lượng', type: 'text' },
      { name: 'noiSoCheBaoQuan', label: 'Nơi sơ chế/bảo quản', type: 'text' },
      { name: 'phatHienNguyCo', label: 'Phát hiện nguy cơ', type: 'select', options: ['Có', 'Không'] },
      { name: 'daXuLy', label: 'Đã xử lý', type: 'select', options: ['Có', 'Không'] },
      { name: 'tt', label: 'TT', type: 'number' },
      { name: 'tenHo', label: 'Tên hộ', type: 'text', required: true },
      { name: 'dienTichHo', label: 'Diện tích hộ (m2)', type: 'number' },
      { name: 'maSoNongHo', label: 'Mã số nông hộ', type: 'text' },
      { name: 'ngayThuHoach', label: 'Ngày thu hoạch', type: 'date' },
      { name: 'luongThuHoachKg', label: 'Lượng thu hoạch (kg)', type: 'number' },
      { name: 'chatLuongSanPham', label: 'Chất lượng SP', type: 'select', options: ['Đạt', 'Chưa đạt'] },
      { name: 'ngayBan', label: 'Ngày bán', type: 'date' },
      { name: 'luongBanKg', label: 'Lượng bán (kg)', type: 'number' },
      { name: 'nguoiMua', label: 'Người mua', type: 'text' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  }
];

const guavaVietgapSchema = {
  name: 'Ổi VietGAP',
  description: 'Sổ ghi chép nhật ký sản xuất cây trồng Ổi theo tiêu chuẩn VietGAP với Thông tin chung và các Bảng từ 1-6. Danh sách hộ sản xuất được quản lý riêng trong menu Admin.',
  category: 'trongtrot',
  tables: guavaVietgapTables
};

module.exports = { guavaVietgapSchema, guavaVietgapTables };
