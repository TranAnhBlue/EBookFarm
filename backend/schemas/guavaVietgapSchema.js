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
    tableName: 'Bảng 1. Đánh giá chỉ tiêu ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
    isMultiRow: true,
    fields: [
      { name: 'ngayThang', label: 'Ngày tháng', type: 'date', required: true },
      { name: 'dieuKien', label: 'Điều kiện', type: 'select', options: ['Đất/giá thể', 'Nước tưới', 'Nước phục vụ sơ chế', 'Sản phẩm'], required: true },
      { name: 'tacNhan', label: 'Tác nhân gây ô nhiễm', type: 'select', options: ['Kim loại nặng', 'Vi sinh vật', 'Dư lượng thuốc BVTV', 'Độc tố vi nấm trong sản phẩm', 'Khác'], required: true },
      { name: 'danhGia', label: 'Đánh giá hiện tại', type: 'select', options: ['Đạt', 'Không đạt'], required: true },
      { name: 'bienPhapXuLy', label: 'Biện pháp xử lý đã áp dụng', type: 'textarea' }
    ]
  },
  {
    tableName: 'Bảng 2. Theo dõi vật tư nông nghiệp hoặc tự sản xuất nguyên liệu đầu vào',
    isMultiRow: true,
    fields: [
      { name: 'thoiGianThucHien', label: 'Thời gian thực hiện (Ngày tháng)', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư (Phân bón, thuốc BVTV...)', type: 'text' },
      { name: 'donViTinh', label: 'ĐVT (kg, g, lit, ml, chai, gói)', type: 'text' },
      { name: 'soLuong', label: 'Số lượng', type: 'number' },
      { name: 'tenDiaChiMua', label: 'Tên và địa chỉ mua vật tư', type: 'textarea' },
      { name: 'hanSuDung', label: 'Hạn sử dụng', type: 'text' },
      { name: 'tenNguoiMuaSuDung', label: 'Tên người mua/Sử dụng', type: 'text' },
      { name: 'nguyenLieuSanXuat', label: 'Nguyên liệu sản xuất (nếu tự sản xuất)', type: 'textarea' },
      { name: 'phuongPhapXuLy', label: 'Phương pháp xử lý (nếu tự sản xuất)', type: 'textarea' },
      { name: 'hoaChatXuLy', label: 'Hóa chất xử lý (nếu tự sản xuất)', type: 'text' },
      { name: 'nguoiXuLy', label: 'Người xử lý (nếu tự sản xuất)', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 2b. Lượng vật tư đã nhập/sử dụng',
    isMultiRow: false,
    fields: [
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
    tableName: 'Bảng 3a. Hướng dẫn bón lót',
    isMultiRow: true,
    fields: [
      { name: 'ngaySuDung', label: 'Ngày tháng sử dụng', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
      { name: 'mucDichSuDung', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'lieuLuongNongDo', label: 'Liều lượng/Nồng độ pha', type: 'text' },
      { name: 'cachDung', label: 'Cách dùng', type: 'textarea' }
    ]
  },
  {
    tableName: 'Bảng 3b. Lượng bón lót đã sử dụng',
    isMultiRow: false,
    fields: [
      { name: 'voiKg', label: 'Vôi (kg)', type: 'number' },
      { name: 'phanHuuCoKg', label: 'Phân hữu cơ (kg)', type: 'number' },
      { name: 'superLanKg', label: 'Super lân (kg)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 4a. Hướng dẫn bón thúc',
    isMultiRow: true,
    fields: [
      { name: 'ngaySuDung', label: 'Ngày tháng sử dụng', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư', type: 'text' },
      { name: 'mucDichSuDung', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'lieuLuongNongDo', label: 'Liều lượng/Nồng độ pha', type: 'text' },
      { name: 'cachDung', label: 'Cách dùng', type: 'textarea' },
      { name: 'ghiChuHuongDan', label: 'Ghi chú hướng dẫn/Lần phun', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 4b. Lượng bón thúc đã sử dụng',
    isMultiRow: false,
    fields: [
      { name: 'npk16168Kg', label: 'NPK 16-16-8 (kg)', type: 'number' },
      { name: 'aminoAcidLan1Ml', label: 'Amino acid Lần 1 (ml)', type: 'number' },
      { name: 'aminoAcidLan2Ml', label: 'Amino acid Lần 2 (ml)', type: 'number' },
      { name: 'canxiBoLan1Ml', label: 'Canxi-Bo Lần 1 (ml)', type: 'number' },
      { name: 'canxiBoLan2Ml', label: 'Canxi-Bo Lần 2 (ml)', type: 'number' },
      { name: 'npk15520TeKg', label: 'NPK 15-5-20+TE (kg)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 5a. Hướng dẫn sử dụng thuốc BVTV',
    isMultiRow: true,
    fields: [
      { name: 'ngaySuDung', label: 'Ngày tháng sử dụng', type: 'date' },
      { name: 'tenVatTu', label: 'Tên vật tư/thuốc BVTV', type: 'text' },
      { name: 'mucDichSuDung', label: 'Mục đích sử dụng', type: 'textarea' },
      { name: 'lieuLuongNongDo', label: 'Liều lượng/Nồng độ pha', type: 'text' },
      { name: 'cachDung', label: 'Cách dùng', type: 'textarea' },
      { name: 'thoiGianCachLy', label: 'Thời gian cách ly', type: 'text' },
      { name: 'ghiChuHuongDan', label: 'Ghi chú hướng dẫn/Lần phun', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 5b. Lượng thuốc BVTV đã sử dụng',
    isMultiRow: false,
    fields: [
      { name: 'abapoLan1Ml', label: 'Abapo 1.8EC Lần 1 (ml)', type: 'number' },
      { name: 'coc85WpLan1Gam', label: 'Coc 85 WP Lần 1 (gam)', type: 'number' },
      { name: 'abapoLan2Ml', label: 'Abapo 1.8EC Lần 2 (ml)', type: 'number' },
      { name: 'coc85WpLan2Gam', label: 'Coc 85 WP Lần 2 (gam)', type: 'number' },
      { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
    ]
  },
  {
    tableName: 'Bảng 6. Nhật ký thu hoạch và bán sản phẩm',
    isMultiRow: true,
    fields: [
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
  description: 'Sổ ghi chép nhật ký sản xuất cây trồng Ổi theo tiêu chuẩn VietGAP. Thông tin hộ tự động điền từ tài khoản đăng nhập.',
  category: 'trongtrot',
  tables: guavaVietgapTables
};

module.exports = { guavaVietgapSchema, guavaVietgapTables };
