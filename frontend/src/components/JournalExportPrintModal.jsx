import React, { useRef } from 'react';
import { Modal, Button, Space, Typography, Tooltip, message, Tag } from 'antd';
import { PrinterOutlined, DownloadOutlined, FilePdfOutlined, FileExcelOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

/**
 * Helper to safely format date value
 */
const formatDate = (val) => {
  if (!val) return '';
  const d = dayjs(val);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(val);
};

const formatDateShort = (val) => {
  if (!val) return '';
  const d = dayjs(val);
  return d.isValid() ? d.format('YYYY-MM-DD') : String(val);
};

/**
 * Helper to find field value from entry object or array of entries
 */
const getFieldValue = (obj, fieldNames) => {
  if (!obj) return '';
  for (const name of fieldNames) {
    if (obj[name] !== undefined && obj[name] !== null && obj[name] !== '') {
      return obj[name];
    }
  }
  return '';
};

const JournalExportPrintModal = ({ visible, onClose, journal }) => {
  const printAreaRef = useRef(null);

  if (!journal) return null;

  const entries = journal.entries || {};
  const schema = journal.schemaId || {};
  const user = journal.userId || {};

  // Extract Thông tin chung
  const infoGeneral = entries['Thông tin chung'] || entries['thongTinChung'] || entries['thong_tin_chung'] || {};
  
  const tenCoSo = getFieldValue(infoGeneral, ['tenCoSo', 'tenTrangTrai', 'tenDonVi']) || user.farmName || user.organization || user.fullname || user.username || 'TRẦN QUỐC HUY';
  const diaChiCoSo = getFieldValue(infoGeneral, ['diaChiCoSo', 'diaChiTrangTrai', 'diaChi']) || user.address || user.province || '';
  const hoTen = getFieldValue(infoGeneral, ['hoTen', 'hoVaTen', 'tenNongDan', 'tenChuHo']) || user.fullname || user.username || tenCoSo;
  const maSoNongHo = getFieldValue(infoGeneral, ['maSoNongHo', 'maNongHo', 'maSo']) || user.farmCode || 'VG/TX-H.01';
  const dienTich = getFieldValue(infoGeneral, ['dienTich', 'dienTichM2', 'quyMo']) || user.farmArea || '5000';
  const cayTrong = getFieldValue(infoGeneral, ['cayTrong', 'tenCayTrong', 'giongCay']) || schema.name || '';
  const diaChiSanXuat = getFieldValue(infoGeneral, ['diaChiSanXuat', 'diaChi', 'diaDiem']) || user.address || (user.ward ? `${user.ward}, ${user.province || ''}` : '') || '';
  const namSanXuat = getFieldValue(infoGeneral, ['namSanXuat', 'nam']) || (journal.createdAt ? dayjs(journal.createdAt).year() : dayjs().year());

  // Helper to extract table data safely
  const getTableData = (tableKeySubstrings) => {
    for (const key of Object.keys(entries)) {
      const lower = key.toLowerCase();
      if (tableKeySubstrings.some(sub => lower.includes(sub.toLowerCase()))) {
        const val = entries[key];
        if (Array.isArray(val)) return val;
        if (typeof val === 'object' && val !== null) return [val];
      }
    }
    return [];
  };

  // Table 1: Đánh giá chỉ tiêu ATTP
  const table1Data = getTableData(['Bảng 1', 'Đánh giá', 'ATTP', 'danhGiaATTP']);

  // Table 2: Vật tư đầu vào
  const table2Raw = getTableData(['Bảng 2', 'vật tư', 'vatTu', 'Đầu vào']);
  
  // Table 2.1: Mua (tự động phân loại nếu có cờ tự sản xuất hoặc lấy từ bảng riêng)
  const table2_1Data = getTableData(['Bảng 2.1', 'vật tư đầu vào - Mua', 'Mua'])?.length > 0 
    ? getTableData(['Bảng 2.1', 'Mua']) 
    : table2Raw.filter(item => !item.nguyenLieuTuSanXuat && !item.phuongPhapXuLy && !item.isSelfProduced);

  // Table 2.2: Tự sản xuất
  const table2_2Data = getTableData(['Bảng 2.2', 'Tự sản xuất', 'tuSanXuat'])?.length > 0
    ? getTableData(['Bảng 2.2', 'Tự sản xuất', 'tuSanXuat'])
    : table2Raw.filter(item => item.nguyenLieuTuSanXuat || item.phuongPhapXuLy || item.isSelfProduced);

  // Table 3: Canh tác
  const table3Raw = getTableData(['Bảng 3', 'canh tác', 'canhTac', 'chăm sóc']);
  
  // Table 3.1: Bón phân
  const table3_1Data = getTableData(['Bảng 3.1', 'Bón phân', 'bonPhan'])?.length > 0
    ? getTableData(['Bảng 3.1', 'Bón phân', 'bonPhan'])
    : table3Raw.filter(item => item.tenPhanBon || item.luongPhanBon || (!item.tenThuocBVTV && !item.tenThuoc));

  // Table 3.2: Thuốc BVTV
  const table3_2Data = getTableData(['Bảng 3.2', 'Thuốc BVTV', 'BVTV', 'thuocBVTV'])?.length > 0
    ? getTableData(['Bảng 3.2', 'Thuốc BVTV', 'BVTV', 'thuocBVTV'])
    : table3Raw.filter(item => item.tenThuocBVTV || item.tenThuoc || item.nongDoPha || item.thoiGianCachLy);

  // Table 4: Thu hoạch & tiêu thụ
  const table4Raw = getTableData(['Bảng 4', 'thu hoạch', 'tiêu thụ', 'thuHoach', 'tieuThu']);

  // Table 4.1: Thu hoạch
  const table4_1Data = getTableData(['Bảng 4.1', 'Thu hoạch sản phẩm', 'thuHoach'])?.length > 0
    ? getTableData(['Bảng 4.1', 'Thu hoạch'])
    : (table4Raw.length > 0 ? table4Raw : []);

  // Table 4.2: Tiêu thụ
  const table4_2Data = getTableData(['Bảng 4.2', 'Tiêu thụ sản phẩm', 'tieuThu'])?.length > 0
    ? getTableData(['Bảng 4.2', 'Tiêu thụ'])
    : table4Raw.filter(item => item.ngayBan || item.soLuongBan || item.donViMua);

  // Print handler
  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SỔ NHẬT KÝ SẢN XUẤT - ${hoTen}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 12mm 15mm 12mm 15mm;
            }
            body {
              font-family: "Times New Roman", Times, serif;
              color: #000;
              margin: 0;
              padding: 0;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              page-break-after: always;
              min-height: 180mm;
              box-sizing: border-box;
              position: relative;
            }
            .page:last-child {
              page-break-after: avoid;
            }
            .cover-border {
              border: 1.5px solid #000;
              padding: 30px;
              min-height: 165mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .cover-header {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-bottom: 20px;
            }
            .cover-title {
              text-align: center;
              font-size: 26pt;
              font-weight: bold;
              margin: 40px 0;
              letter-spacing: 1px;
            }
            .info-section {
              font-size: 13pt;
              line-height: 2;
            }
            .info-section-title {
              font-weight: bold;
              margin-bottom: 10px;
              font-size: 14pt;
            }
            .info-item {
              margin-bottom: 4px;
            }
            .table-title {
              font-size: 13pt;
              font-weight: bold;
              margin-bottom: 12px;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11pt;
            }
            table, th, td {
              border: 1px solid #000;
            }
            th {
              background-color: #f9f9f9;
              font-weight: bold;
              text-align: center;
              padding: 8px 6px;
              vertical-align: middle;
            }
            td {
              padding: 8px 6px;
              vertical-align: middle;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      const response = await api.get(`/journals/export/${journal._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `so-nhat-ky-${hoTen.replace(/\s+/g, '-')}-${dayjs().format('YYYYMMDD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Tải file Excel thành công!');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi xuất file Excel');
    }
  };

  return (
    <Modal
      title={
        <Space className="py-1">
          <FilePdfOutlined className="text-red-500 text-lg" />
          <span className="font-bold text-gray-800 text-base">Sổ Nhật Ký Sản Xuất (Mẫu Chuẩn VietGAP)</span>
          <Tag color="green" className="ml-2 font-bold">{journal.status === 'Verified' ? 'ĐÃ DUYỆT' : (journal.status === 'Locked' ? 'ĐÃ KHÓA' : 'HOÀN THÀNH')}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1050}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Đóng
        </Button>,
        <Button key="excel" icon={<FileExcelOutlined />} className="text-emerald-700 border-emerald-500 hover:bg-emerald-50" onClick={handleExportExcel}>
          Xuất file Excel
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
          In sổ / Lưu PDF chuẩn
        </Button>
      ]}
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', backgroundColor: '#f1f5f9', padding: '20px' } }}
    >
      {/* Alert guide */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-4 text-xs flex justify-between items-center">
        <span>💡 <strong>Hướng dẫn:</strong> Bấm nút <strong>"In sổ / Lưu PDF chuẩn"</strong> và chọn đích đến là <strong>"Save as PDF" (Lưu dưới dạng PDF)</strong> với khổ giấy <strong>A4 Ngang (Landscape)</strong> để có bản PDF hoàn hảo theo form mẫu chuẩn.</span>
      </div>

      {/* Printable Area Container */}
      <div ref={printAreaRef} className="journal-print-document font-serif bg-white text-black shadow-lg mx-auto p-8 rounded-lg max-w-[950px]">
        
        {/* ================= PAGE 1: COVER ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="cover-border border-2 border-black p-8 min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="cover-header text-center mb-6">
                <div className="text-base font-bold">Tên cơ sở: {tenCoSo}</div>
                <div className="text-sm font-semibold mt-1">Địa chỉ: {diaChiCoSo || diaChiSanXuat}</div>
              </div>

              <div className="cover-title text-center text-3xl font-extrabold my-10 tracking-wide uppercase text-gray-900">
                SỔ NHẬT KÝ SẢN XUẤT
              </div>
            </div>

            <div className="info-section text-sm leading-relaxed mt-6 pl-4">
              <div className="info-section-title font-bold text-base uppercase mb-3 text-gray-900">
                THÔNG TIN CHUNG
              </div>
              <div className="info-item mb-1.5"><strong>1. Họ và tên tổ chức/cá nhân sản xuất:</strong> {hoTen}</div>
              <div className="info-item mb-1.5"><strong>2. Mã số nông hộ:</strong> {maSoNongHo}</div>
              <div className="info-item mb-1.5"><strong>3. Diện tích (m2):</strong> {dienTich}</div>
              <div className="info-item mb-1.5"><strong>4. Cây trồng:</strong> {cayTrong}</div>
              <div className="info-item mb-1.5"><strong>5. Địa chỉ sản xuất:</strong> {diaChiSanXuat || diaChiCoSo}</div>
              <div className="info-item mb-1.5"><strong>6. Năm sản xuất:</strong> {namSanXuat}</div>
            </div>
          </div>
        </div>

        {/* ================= PAGE 2: BẢNG 1 ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-28">Ngày tháng</th>
                <th className="border border-black p-2 text-center w-36">Điều kiện</th>
                <th className="border border-black p-2 text-center">Tác nhân gây ô nhiễm</th>
                <th className="border border-black p-2 text-center w-32">Đánh giá hiện tại</th>
                <th className="border border-black p-2 text-center">Biện pháp xử lý</th>
              </tr>
            </thead>
            <tbody>
              {table1Data.length > 0 ? (
                table1Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.ngayThang || row.thoiGian || row.date)}</td>
                    <td className="border border-black p-2">{row.dieuKien || row.condition || ''}</td>
                    <td className="border border-black p-2">{Array.isArray(row.tacNhan) ? row.tacNhan.join(', ') : (row.tacNhan || row.pollutant || '')}</td>
                    <td className="border border-black p-2 text-center font-medium">{row.danhGia || row.assessment || 'Đạt'}</td>
                    <td className="border border-black p-2">{row.bienPhap || row.action || ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu đánh giá ATTP</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 3: BẢNG 2.1 ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 2.1 Bảng theo dõi vật tư đầu vào - Mua
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-32">Ngày tháng</th>
                <th className="border border-black p-2 text-center">Tên vật tư</th>
                <th className="border border-black p-2 text-center w-24">Đơn vị tính</th>
                <th className="border border-black p-2 text-center w-24">Số lượng</th>
                <th className="border border-black p-2 text-center">Tên và địa chỉ mua vật tư</th>
                <th className="border border-black p-2 text-center w-28">Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {table2_1Data.length > 0 ? (
                table2_1Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.ngayThang || row.thoiGian || row.date)}</td>
                    <td className="border border-black p-2 font-medium">{row.tenVatTu || row.name || ''}</td>
                    <td className="border border-black p-2 text-center">{row.donViTinh || row.dvt || row.unit || 'Kg'}</td>
                    <td className="border border-black p-2 text-right">{row.soLuong !== undefined ? Number(row.soLuong).toLocaleString('vi-VN') : ''}</td>
                    <td className="border border-black p-2">{row.diaChiMua || row.tenVaDiaChiMua || row.supplier || ''}</td>
                    <td className="border border-black p-2 text-center">{formatDateShort(row.hanSuDung || row.expiryDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu vật tư mua vào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 4: BẢNG 2.2 ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 2.2 Bảng theo dõi vật tư đầu vào - Tự sản xuất
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center">Ngày tháng</th>
                <th className="border border-black p-2 text-center">Tên vật tư</th>
                <th className="border border-black p-2 text-center">ĐVT</th>
                <th className="border border-black p-2 text-center">Số lượng</th>
                <th className="border border-black p-2 text-center">Tên và địa chỉ mua vật tư</th>
                <th className="border border-black p-2 text-center">Hạn sử dụng</th>
                <th className="border border-black p-2 text-center">Nguyên liệu sản xuất</th>
                <th className="border border-black p-2 text-center">Phương pháp xử lý</th>
                <th className="border border-black p-2 text-center">Hóa chất xử lý</th>
                <th className="border border-black p-2 text-center">Người xử lý</th>
              </tr>
            </thead>
            <tbody>
              {table2_2Data.length > 0 ? (
                table2_2Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.ngayThang || row.thoiGian || row.date)}</td>
                    <td className="border border-black p-2 font-medium">{row.tenVatTu || row.name || ''}</td>
                    <td className="border border-black p-2 text-center">{row.donViTinh || row.dvt || 'Kg'}</td>
                    <td className="border border-black p-2 text-right">{row.soLuong !== undefined ? Number(row.soLuong).toLocaleString('vi-VN') : ''}</td>
                    <td className="border border-black p-2">{row.diaChiMua || ''}</td>
                    <td className="border border-black p-2 text-center">{formatDateShort(row.hanSuDung)}</td>
                    <td className="border border-black p-2">{row.nguyenLieuTuSanXuat || row.nguyenLieu || ''}</td>
                    <td className="border border-black p-2">{row.phuongPhapXuLy || ''}</td>
                    <td className="border border-black p-2">{row.hoaChatXuLy || ''}</td>
                    <td className="border border-black p-2">{row.nguoiXuLy || ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu vật tư tự sản xuất</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 5: BẢNG 3.1 ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 3.1 Nhật ký canh tác - Bón phân
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-36">Thời gian thực hiện</th>
                <th className="border border-black p-2 text-center">Tên phân bón</th>
                <th className="border border-black p-2 text-center w-36">Lượng sử dụng (Kg)</th>
                <th className="border border-black p-2 text-center w-28">Đơn vị tính</th>
                <th className="border border-black p-2 text-center w-48">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {table3_1Data.length > 0 ? (
                table3_1Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.thoiGian || row.thoiGianThucHien || row.ngayThang || row.date)}</td>
                    <td className="border border-black p-2 font-medium">{row.tenPhanBon || row.tenVatTu || row.name || ''}</td>
                    <td className="border border-black p-2 text-right">{row.luongPhanBon !== undefined ? row.luongPhanBon : (row.luongSuDung !== undefined ? row.luongSuDung : (row.soLuong || ''))}</td>
                    <td className="border border-black p-2 text-center">{row.donViTinh || row.dvt || 'Kg'}</td>
                    <td className="border border-black p-2">{row.ghiChu || row.note || ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu bón phân</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 6: BẢNG 3.2 ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 3.2 Nhật ký canh tác - Thuốc BVTV
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-32">Ngày tháng</th>
                <th className="border border-black p-2 text-center">Tên thuốc</th>
                <th className="border border-black p-2 text-center">Nồng độ pha</th>
                <th className="border border-black p-2 text-center w-24">Lượng sử dụng</th>
                <th className="border border-black p-2 text-center w-28">Thời gian cách ly (ngày)</th>
                <th className="border border-black p-2 text-center w-36">Ghi chú</th>
                <th className="border border-black p-2 text-center w-24">Đơn vị tính</th>
              </tr>
            </thead>
            <tbody>
              {table3_2Data.length > 0 ? (
                table3_2Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.ngayThang || row.thoiGian || row.thoiGianThucHien || row.date)}</td>
                    <td className="border border-black p-2 font-medium">{row.tenThuocBVTV || row.tenThuoc || row.name || ''}</td>
                    <td className="border border-black p-2">{row.nongDoPha || row.dosage || ''}</td>
                    <td className="border border-black p-2 text-right">{row.luongThuocSuDung !== undefined ? row.luongThuocSuDung : (row.luongSuDung !== undefined ? row.luongSuDung : (row.soLuong || ''))}</td>
                    <td className="border border-black p-2 text-center font-bold text-emerald-800">{row.thoiGianCachLy !== undefined ? row.thoiGianCachLy : (row.phiDays || '')}</td>
                    <td className="border border-black p-2">{row.ghiChu || ''}</td>
                    <td className="border border-black p-2 text-center">{row.donViTinh || row.dvt || 'mililit'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu sử dụng thuốc BVTV</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 7: BẢNG 4.1 ================= */}
        <div className="page pb-12 mb-12 border-b border-dashed border-gray-300">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 4.1. Thu hoạch sản phẩm
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-36">Thời gian thu hoạch</th>
                <th className="border border-black p-2 text-center w-36">Mã số lô thu hoạch</th>
                <th className="border border-black p-2 text-center">Tên sản phẩm</th>
                <th className="border border-black p-2 text-center w-28">Đơn vị tính</th>
                <th className="border border-black p-2 text-center w-36">Sản lượng</th>
              </tr>
            </thead>
            <tbody>
              {table4_1Data.length > 0 ? (
                table4_1Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.thoiGianThuHoach || row.thoiGian || row.ngayThang || row.date)}</td>
                    <td className="border border-black p-2 text-center font-medium">{row.maSoLo || row.maLo || row.batchCode || row.maSoLoThuHoach || ''}</td>
                    <td className="border border-black p-2 font-medium">{row.tenSanPham || cayTrong || ''}</td>
                    <td className="border border-black p-2 text-center">{row.donViTinh || row.dvt || 'Kg'}</td>
                    <td className="border border-black p-2 text-right font-bold">{row.sanLuong !== undefined ? Number(row.sanLuong).toLocaleString('vi-VN') : ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu thu hoạch sản phẩm</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 8: BẢNG 4.2 ================= */}
        <div className="page">
          <div className="table-title font-bold text-sm mb-3">
            Bảng 4.2 Tiêu thụ sản phẩm
          </div>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-36">Ngày bán</th>
                <th className="border border-black p-2 text-center w-32">Mã số lô thu hoạch</th>
                <th className="border border-black p-2 text-center">Tên sản phẩm</th>
                <th className="border border-black p-2 text-center w-28">Số lượng bán</th>
                <th className="border border-black p-2 text-center w-24">Đơn vị tính</th>
                <th className="border border-black p-2 text-center">Đơn vị thu mua/ Địa chỉ</th>
                <th className="border border-black p-2 text-center w-32">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {table4_2Data.length > 0 ? (
                table4_2Data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{formatDate(row.ngayBan || row.thoiGian || row.date)}</td>
                    <td className="border border-black p-2 text-center font-medium">{row.maSoLo || row.maLo || row.batchCode || row.maSoLoThuHoach || ''}</td>
                    <td className="border border-black p-2 font-medium">{row.tenSanPham || cayTrong || ''}</td>
                    <td className="border border-black p-2 text-right font-bold">{row.soLuongBan !== undefined ? Number(row.soLuongBan).toLocaleString('vi-VN') : ''}</td>
                    <td className="border border-black p-2 text-center">{row.donViTinh || row.dvt || 'Kg'}</td>
                    <td className="border border-black p-2">{row.donViMua || row.donViThuMua || row.buyer || 'Tư thương'}</td>
                    <td className="border border-black p-2">{row.ghiChu || ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border border-black p-4 text-center italic text-gray-400">Không có dữ liệu tiêu thụ sản phẩm</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Modal>
  );
};

export default JournalExportPrintModal;
