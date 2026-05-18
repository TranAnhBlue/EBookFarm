const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const createLayingHenSchema = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const schemaName = 'Gà đẻ trứng';
    await FormSchema.deleteMany({ name: schemaName });

    const layingHenSchema = new FormSchema({
      name: schemaName,
      description: 'Sổ nhật ký điện tử chăn nuôi gà đẻ trứng theo quy chuẩn VietGAHP (QĐ 4653/QĐ-BNN-CN).',
      category: 'channuoi',
      tables: [
        {
          tableName: 'Thông tin chung',
          isMultiRow: false,
          fields: [
            { name: 'tenChuHo', label: 'Họ và tên tổ chức/cá nhân chăn nuôi', type: 'text', required: true },
            { name: 'dienThoai', label: 'Điện thoại', type: 'text' },
            { name: 'diaChi', label: 'Địa chỉ (Thôn/Ấp/Xã/Huyện/Tỉnh)', type: 'text', required: true },
            { name: 'tenGiongGa', label: 'Tên giống gà', type: 'text', required: true },
            { name: 'coSoCungCap', label: 'Mua tại cơ sở', type: 'text' },
            { name: 'ngayBatDauNuoi', label: 'Ngày tháng bắt đầu nuôi', type: 'date', required: true },
            { name: 'tuoiBatDauNuoi', label: 'Tuổi bắt đầu nuôi', type: 'text' },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'phuongThucChanNuoi', label: 'Phương thức chăn nuôi', type: 'text' },
            { name: 'dienTichChuong', label: 'Diện tích chuồng nuôi (m2)', type: 'number' },
            { name: 'kieuChuongNuoi', label: 'Kiểu chuồng nuôi', type: 'text' },
            { name: 'dienTichKhuVuc', label: 'Diện tích toàn bộ khu vực chăn nuôi (m2)', type: 'number' },
            { name: 'nam', label: 'Năm', type: 'text', required: true }
          ]
        },
        {
          tableName: 'Biểu 1: THEO DÕI MUA THỨC ĂN CHĂN NUÔI',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenThucAn', label: 'Tên thức ăn', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'donGia', label: 'Đơn giá (đồng/kg)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng/đại lý bán và địa chỉ', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 2: THEO DÕI MUA NGUYÊN LIỆU THỨC ĂN CHĂN NUÔI',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenNguyenLieu', label: 'Tên nguyên liệu thức ăn', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (kg)', type: 'number', required: true },
            { name: 'donGia', label: 'Đơn giá (đồng/kg)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng/đại lý bán và địa chỉ', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 3: THEO DÕI MUA GÀ GIỐNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng mua (con)', type: 'number', required: true },
            { name: 'coSoBan', label: 'Cơ sở bán', type: 'text' },
            { name: 'giongGa', label: 'Giống gà', type: 'text', required: true },
            { name: 'ghiChu', label: 'Ghi chú', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 4: THEO DÕI MUA VACCIN VÀ THUỐC THÚ Y',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenThuoc', label: 'Tên vaccin và thuốc', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng (liều, kg, g, gói…)', type: 'text', required: true },
            { name: 'gia', label: 'Giá (đồng/liều, kg, g, gói…)', type: 'number' },
            { name: 'nhaCungCap', label: 'Tên người, cửa hàng/đại lý bán/nhà sản xuất và địa chỉ', type: 'text' },
            { name: 'cachBaoQuan', label: 'Cách bảo quản', type: 'select', options: ['Để trong tủ lạnh', 'Để bên ngoài', 'Khác'] }
          ]
        },
        {
          tableName: 'Biểu 5: THEO DÕI GHI CHÉP HÀNG NGÀY',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'soLuongGa', label: 'Số lượng gà (con)', type: 'number', required: true },
            { name: 'soLuongThucAn', label: 'Số lượng thức ăn (kg)', type: 'number' },
            { name: 'soLuongTrung', label: 'Số lượng trứng (quả)', type: 'number' },
            { name: 'tinhTrang', label: 'Tình trạng đàn gà', type: 'text' },
            { name: 'soLuongChet', label: 'Số lượng loại thải, chết (con)', type: 'number' }
          ]
        },
        {
          tableName: 'Biểu 6: THEO DÕI SỬ DỤNG VACCIN VÀ THUỐC THÚ Y',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'loaiThuoc', label: 'Loại vaccin hoặc thuốc thú y', type: 'text', required: true },
            { name: 'maSoHanSuDung', label: 'Mã số, hạn sử dụng', type: 'text' },
            { name: 'cachSuDung', label: 'Cách sử dụng (tiêm nhỏ, cho uống)', type: 'text' },
            { name: 'lieuLuong', label: 'Liều lượng sử dụng', type: 'text' },
            { name: 'tinhTrangSauDung', label: 'Tình trạng đàn gà sau khi sử dụng', type: 'text' },
            { name: 'soLuongChet', label: 'Số lượng loại thải, chết (con)', type: 'number' }
          ]
        },
        {
          tableName: 'Biểu 7: THEO DÕI SỬ DỤNG THUỐC SÁT TRÚNG',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'tenThuoc', label: 'Tên thuốc sát trùng', type: 'text', required: true },
            { name: 'soLuong', label: 'Số lượng thuốc', type: 'text' },
            { name: 'dienTichPhun', label: 'Diện tích phun', type: 'number' },
            { name: 'loaiMay', label: 'Loại máy/dụng cụ phun', type: 'text' },
            { name: 'nguoiPhun', label: 'Tên người phun (ký tên)', type: 'signature', required: true }
          ]
        },
        {
          tableName: 'Biểu 8: THEO DÕI SỨC KHỎE ĐÀN GÀ',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'trieuChung', label: 'Triệu chứng (biểu hiện)', type: 'text' },
            { name: 'soLuongOm', label: 'Số lượng ốm (con)', type: 'number' },
            { name: 'soLuongChet', label: 'Số lượng chết (con)', type: 'number' },
            { name: 'nguyenNhan', label: 'Nguyên nhân sơ bộ', type: 'text' }
          ]
        },
        {
          tableName: 'Biểu 9: THEO DÕI XỬ LÝ XÁC GÀ',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'soLuong', label: 'Số lượng (con)', type: 'number', required: true },
            { name: 'chon', label: 'Chôn (con)', type: 'number' },
            { name: 'dot', label: 'Đốt (con)', type: 'number' },
            { name: 'phuongPhapKhac', label: 'Phương pháp khác', type: 'text' },
            { name: 'vutXuongAo', label: 'Vứt xuống ao hồ', type: 'select', options: ['Có', 'Không'] },
            { name: 'nguoiXuLy', label: 'Tên người xử lý (ký tên)', type: 'signature', required: true }
          ]
        },
        {
          tableName: 'Biểu 10: THEO DÕI LẤY MẪU XÉT NGHIỆM',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'mauXetNghiem', label: 'Mẫu xét nghiệm (máu, cả con, nội tạng)', type: 'text', required: true },
            { name: 'lyDo', label: 'Lý do gửi xét nghiệm', type: 'text' },
            { name: 'noiGui', label: 'Nơi gửi xét nghiệm', type: 'text' },
            { name: 'ketLuan', label: 'Kết luận của cơ quan xét nghiệm', type: 'text' },
            { name: 'keHoach', label: 'Kế hoạch kiểm soát', type: 'text' },
            { name: 'nguoiLayMau', label: 'Tên người lấy mẫu (ký tên)', type: 'signature', required: true }
          ]
        },
        {
          tableName: 'Biểu 11: THEO DÕI XUẤT BÁN TRỨNG GÀ',
          isMultiRow: true,
          fields: [
            { name: 'ngayThuHoach', label: 'Ngày thu hoạch', type: 'date', required: true },
            { name: 'maLo', label: 'Mã lô sản phẩm', type: 'text', required: true },
            { name: 'soLuongThuHoach', label: 'Số lượng thu hoạch (quả)', type: 'number' },
            { name: 'diaDiem', label: 'Địa điểm (Ô/Chuồng số)', type: 'text' },
            { name: 'ngayXuatBan', label: 'Ngày xuất bán', type: 'date' },
            { name: 'soLuongXuat', label: 'Số lượng xuất bán (quả)', type: 'number' },
            { name: 'donViMua', label: 'Đơn vị thu mua/Địa chỉ', type: 'text' },
            { name: 'nguoiBan', label: 'Tên người bán (ký tên)', type: 'signature', required: true }
          ]
        },
        {
          tableName: 'Biểu 12: ĐÀO TẠO, TẬP HUẤN CHO CÁN BỘ, CÔNG NHÂN VIÊN',
          isMultiRow: true,
          fields: [
            { name: 'ngayThang', label: 'Ngày, tháng, năm', type: 'date', required: true },
            { name: 'nguoiThamGia', label: 'Người tham gia tập huấn', type: 'text' },
            { name: 'noiDung', label: 'Nội dung tập huấn', type: 'text', required: true },
            { name: 'donViToChuc', label: 'Đơn vị, tổ chức, địa chỉ', type: 'text' },
            { name: 'nguoiTapHuan', label: 'Người tập huấn (ký tên)', type: 'signature', required: true }
          ]
        }
      ]
    });

    await layingHenSchema.save();
    console.log('VietGAHP Laying Hen Schema created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createLayingHenSchema();
