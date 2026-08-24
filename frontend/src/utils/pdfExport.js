import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { message } from 'antd';

/**
 * Generates an HTML preview string for the journal document
 */
export const generateJournalPdfHtml = (book) => {
  if (!book) return '';
  const bieu1Rows = book.tablesData?.bieu_1 || [];
  const bieu2Rows = book.tablesData?.bieu_2 || [];
  const bang3Rows = book.tablesData?.bang_3 || [];
  const bang4Rows = book.tablesData?.bang_4 || [];

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; width: 100%;">
      <style>
        .pdf-page { page-break-after: always; box-sizing: border-box; padding: 10px; margin-bottom: 20px; }
        .pdf-page:last-child { page-break-after: avoid; }
        .cover-border { border: 1.5px solid #000; padding: 35px 40px; min-height: 170mm; display: flex; flex-direction: column; }
        .cover-top { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 30px; line-height: 1.6; }
        .cover-main-title { text-align: center; font-size: 24pt; font-weight: bold; letter-spacing: 1.5px; margin: 25px 0 35px; }
        .cover-sub-title { text-align: center; font-size: 14pt; font-weight: bold; letter-spacing: 1px; margin-bottom: 25px; }
        .cover-info-list { font-size: 13pt; line-height: 2.2; margin-left: 20px; }
        .map-header-box { border: 1.5px solid #000; padding: 6px 16px; text-align: center; font-weight: bold; font-size: 13pt; margin: 0 auto 15px auto; width: 260px; }
        .map-frame { border: 4px double #000; min-height: 150mm; display: flex; align-items: center; justify-content: center; text-align: center; }
        .table-title { font-size: 12pt; font-weight: bold; margin-bottom: 12px; margin-top: 5px; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10.5pt; }
        table, th, td { border: 1px solid #000; }
        th { background-color: #f8fafc; font-weight: bold; text-align: center; padding: 8px 5px; vertical-align: middle; }
        td { padding: 8px 6px; vertical-align: middle; }
        .text-center { text-align: center; }
        .empty-row td { height: 32px; }
      </style>

      <!-- PAGE 1: THÔNG TIN CHUNG -->
      <div class="pdf-page">
        <div class="cover-border">
          <div class="cover-top">
            <div>Tên cơ sở: ${book.tenCoSo || ''}</div>
            <div>Địa chỉ: ${book.diaChi || 'Thach Hoa'}</div>
          </div>
          <div class="cover-main-title">SỔ NHẬT KÝ SẢN XUẤT</div>
          <div class="cover-sub-title">THÔNG TIN CHUNG</div>
          <div class="cover-info-list">
            <div>1. Họ và tên tổ chức/cá nhân sản xuất: ${book.hoTen || 'Trần Đức Anh Test'}</div>
            <div>2. Mã số nông hộ: ${book.maNongHo || 'BANHANG'}</div>
            <div>3. Diện tích (m2): ${book.dienTich || 'Test'}. &nbsp;&nbsp;&nbsp;&nbsp; Cây trồng: ${book.loaiSo || 'Cà phê'}. &nbsp;&nbsp;&nbsp;&nbsp; Tên giống: ...............</div>
            <div>4. Địa chỉ sản xuất: ${book.diaChiSanXuat || book.diaChi || ''}</div>
            <div>5. Năm sản xuất: ${dayjs().year()}</div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: SƠ ĐỒ VƯỜN TRỒNG -->
      <div class="pdf-page">
        <div class="map-header-box">SƠ ĐỒ VƯỜN TRỒNG</div>
        <div class="map-frame">
          ${book.soDoVuon ? `<div style="font-size: 13pt; font-weight: bold; color: #16a34a;">📄 Sơ đồ đính kèm: ${book.soDoVuon}</div>` : `<div style="color: #666; font-style: italic; font-size: 12pt;">(Khu vực sơ đồ vườn trồng / bản đồ phân lô)</div>`}
        </div>
      </div>

      <!-- PAGE 3: BIỂU 1 (ATTP) -->
      <div class="pdf-page">
        <div class="table-title">Bảng 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm</div>
        <table>
          <thead>
            <tr>
              <th style="width: 18%;">Ngày tháng</th>
              <th style="width: 18%;">Điều kiện</th>
              <th style="width: 26%;">Tác nhân gây ô nhiễm</th>
              <th style="width: 18%;">Đánh giá hiện tại</th>
              <th style="width: 20%;">Biện pháp xử lý</th>
            </tr>
          </thead>
          <tbody>
            ${bieu1Rows.length > 0 ? bieu1Rows.map(r => `
              <tr>
                <td class="text-center">${r.ngay_thang || ''}</td>
                <td>${r.dieu_kien || ''}</td>
                <td>${r.tac_nhan || ''}</td>
                <td class="text-center">${r.danh_gia || ''}</td>
                <td>${r.bien_phap || ''}</td>
              </tr>
            `).join('') : `
              <tr>
                <td class="text-center">${dayjs().format('24/08/YYYY')}</td>
                <td>Đất/giá thể</td>
                <td>Dư lượng thuốc BVTV</td>
                <td class="text-center">Đạt</td>
                <td></td>
              </tr>
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- PAGE 4: BIỂU 2 (VẬT TƯ ĐẦU VÀO) -->
      <div class="pdf-page">
        <div class="table-title">Biểu 2. Bảng theo dõi mua hoặc tự sản xuất vật tư đầu vào</div>
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Thời gian</th>
              <th style="width: 13%;">Tên vật tư</th>
              <th style="width: 8%;">Số lượng</th>
              <th style="width: 6%;">ĐVT</th>
              <th style="width: 16%;">Tên và địa chỉ mua vật tư</th>
              <th style="width: 10%;">Hạn sử dụng</th>
              <th style="width: 13%;">Nguyên liệu sản xuất</th>
              <th style="width: 12%;">Phương pháp xử lý</th>
              <th style="width: 12%;">Hóa chất xử lý</th>
            </tr>
          </thead>
          <tbody>
            ${bieu2Rows.length > 0 ? bieu2Rows.map(r => `
              <tr>
                <td class="text-center">${r.thoi_gian || ''}</td>
                <td>${r.ten_vat_tu || ''}</td>
                <td class="text-center">${r.so_luong || ''}</td>
                <td class="text-center">${r.dvt || ''}</td>
                <td>${r.ten_dia_chi_mua || ''}</td>
                <td class="text-center">${r.han_su_dung || ''}</td>
                <td>${r.nguyen_lieu_sx || ''}</td>
                <td>${r.phuong_phap_xl || ''}</td>
                <td>${r.hoa_chat_xl || ''}</td>
              </tr>
            `).join('') : `
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- PAGE 5: BẢNG 3 (CANH TÁC) -->
      <div class="pdf-page">
        <div class="table-title">Bảng 3. Bảng nhật ký canh tác</div>
        <table>
          <thead>
            <tr>
              <th style="width: 13%;">Thời gian thực hiện</th>
              <th style="width: 14%;">Tên phân bón</th>
              <th style="width: 11%;">Lượng sử dụng (Kg)</th>
              <th style="width: 14%;">Tên thuốc BVTV</th>
              <th style="width: 11%;">Nồng độ pha</th>
              <th style="width: 11%;">Lượng sử dụng</th>
              <th style="width: 12%;">Thời gian cách ly(ngày)</th>
              <th style="width: 14%;">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${bang3Rows.length > 0 ? bang3Rows.map(r => `
              <tr>
                <td class="text-center">${r.thoi_gian_th || ''}</td>
                <td>${r.ten_phan_bon || ''}</td>
                <td class="text-center">${r.luong_su_dung_kg || ''}</td>
                <td>${r.ten_thuoc_bvtv || ''}</td>
                <td>${r.nong_do_pha || ''}</td>
                <td>${r.luong_su_dung || ''}</td>
                <td class="text-center">${r.thoi_gian_cach_ly || ''}</td>
                <td>${r.ghi_chu || ''}</td>
              </tr>
            `).join('') : `
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- PAGE 6: BẢNG 4 (THU HOẠCH & TIÊU THỤ) -->
      <div class="pdf-page">
        <div class="table-title">Bảng 4. Thu hoạch sản phẩm và tiêu thụ</div>
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Thời gian thu hoạch</th>
              <th style="width: 10%;">Mã số lô thu hoạch</th>
              <th style="width: 11%;">Tên sản phẩm</th>
              <th style="width: 8%;">Sản lượng</th>
              <th style="width: 8%;">ĐVT Thu hoạch</th>
              <th style="width: 10%;">Địa điểm sơ chế</th>
              <th style="width: 9%;">Ngày bán</th>
              <th style="width: 8%;">Số lượng bán</th>
              <th style="width: 7%;">ĐVT Bán</th>
              <th style="width: 19%;">Đơn vị thu mua/Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            ${bang4Rows.length > 0 ? bang4Rows.map(r => `
              <tr>
                <td class="text-center">${r.thoi_gian_thu_hoach || ''}</td>
                <td>${r.ma_so_lo_th || ''}</td>
                <td>${r.ten_san_pham || ''}</td>
                <td class="text-center">${r.san_luong || ''}</td>
                <td class="text-center">${r.dvt_thu_hoach || ''}</td>
                <td>${r.dia_diem_so_che || ''}</td>
                <td class="text-center">${r.ngay_ban || ''}</td>
                <td class="text-center">${r.so_luong_ban || ''}</td>
                <td class="text-center">${r.dvt_ban || ''}</td>
                <td>${r.don_vi_thu_mua || ''}</td>
              </tr>
            `).join('') : `
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/**
 * Exports the journal book directly as a vector PDF with Times New Roman font
 */
export const exportJournalPdf = async (selectedBook) => {
  if (!selectedBook) return;
  const hide = message.loading('Đang khởi tạo font Times New Roman tiếng Việt và tạo file PDF...', 0);

  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Load Times New Roman Vietnamese TTF fonts
    let activeFont = 'times';
    try {
      const fonts = [
        { name: 'TimesNewRoman-Regular.ttf', style: 'normal', url: '/fonts/TimesNewRoman-Regular.ttf' },
        { name: 'TimesNewRoman-Bold.ttf', style: 'bold', url: '/fonts/TimesNewRoman-Bold.ttf' },
        { name: 'TimesNewRoman-Italic.ttf', style: 'italic', url: '/fonts/TimesNewRoman-Italic.ttf' }
      ];

      for (const font of fonts) {
        const response = await fetch(font.url);
        const buffer = await response.arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        doc.addFileToVFS(font.name, base64);
        doc.addFont(font.name, 'TimesNewRoman', font.style);
      }
      doc.setFont('TimesNewRoman', 'normal');
      activeFont = 'TimesNewRoman';
    } catch (fontErr) {
      console.warn('Font loading fallback:', fontErr);
    }

    const pageWidth = doc.internal.pageSize.getWidth(); // ~297 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // ~210 mm

    // ── PAGE 1: COVER PAGE & THÔNG TIN CHUNG ────────────────────────────────
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

    doc.setFontSize(13);
    doc.setFont(activeFont, 'bold');
    doc.text(`Tên cơ sở: ${selectedBook.tenCoSo || 'Cơ sở sản xuất'}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Địa chỉ: ${selectedBook.diaChi || 'Thach Hoa'}`, pageWidth / 2, 38, { align: 'center' });

    doc.setFontSize(24);
    doc.text('SỔ NHẬT KÝ SẢN XUẤT', pageWidth / 2, 68, { align: 'center' });

    doc.setFontSize(14);
    doc.text('THÔNG TIN CHUNG', pageWidth / 2, 92, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont(activeFont, 'normal');
    const startX = 35;
    let startY = 108;
    const lineHeight = 10;

    doc.text(`1. Họ và tên tổ chức/cá nhân sản xuất: ${selectedBook.hoTen || 'Trần Đức Anh Test'}`, startX, startY);
    startY += lineHeight;
    doc.text(`2. Mã số nông hộ: ${selectedBook.maNongHo || 'BANHANG'}`, startX, startY);
    startY += lineHeight;
    doc.text(`3. Diện tích (m2): ${selectedBook.dienTich || 'Test'}.       Cây trồng: ${selectedBook.loaiSo || 'Cà phê'}.       Tên giống: ...............`, startX, startY);
    startY += lineHeight;
    doc.text(`4. Địa chỉ sản xuất: ${selectedBook.diaChiSanXuat || selectedBook.diaChi || ''}`, startX, startY);
    startY += lineHeight;
    doc.text(`5. Năm sản xuất: ${dayjs().year()}`, startX, startY);

    // ── PAGE 2: SƠ ĐỒ VƯỜN TRỒNG ────────────────────────────────────────────
    doc.addPage('a4', 'landscape');

    const mapBoxWidth = 80;
    const mapBoxX = (pageWidth - mapBoxWidth) / 2;
    doc.rect(mapBoxX, 14, mapBoxWidth, 10);
    doc.setFontSize(12.5);
    doc.setFont(activeFont, 'bold');
    doc.text('SƠ ĐỒ VƯỜN TRỒNG', pageWidth / 2, 21, { align: 'center' });

    doc.setLineWidth(0.6);
    doc.rect(14, 28, pageWidth - 28, pageHeight - 42);
    doc.setLineWidth(0.2);
    doc.rect(15.5, 29.5, pageWidth - 31, pageHeight - 45);

    doc.setFontSize(11);
    doc.setFont(activeFont, 'normal');
    doc.setTextColor(120, 120, 120);
    if (selectedBook.soDoVuon) {
      doc.text(`📄 Sơ đồ đính kèm: ${selectedBook.soDoVuon}`, pageWidth / 2, 110, { align: 'center' });
    } else {
      doc.text('(Khu vực sơ đồ vườn trồng / bản đồ phân lô)', pageWidth / 2, 110, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);

    // ── PAGE 3: BẢNG 1 (ATTP) ───────────────────────────────────────────────
    doc.addPage('a4', 'landscape');
    doc.setFontSize(12);
    doc.setFont(activeFont, 'bold');
    doc.text('Bảng 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm', 14, 18);

    const bieu1Rows = selectedBook.tablesData?.bieu_1 || [];
    const table1Body = bieu1Rows.length > 0
      ? bieu1Rows.map(r => [r.ngay_thang || '', r.dieu_kien || '', r.tac_nhan || '', r.danh_gia || '', r.bien_phap || ''])
      : [
          [dayjs().format('24/08/YYYY'), 'Đất/giá thể', 'Dư lượng thuốc BVTV', 'Đạt', ''],
          ['', '', '', '', ''],
          ['', '', '', '', '']
        ];

    autoTable(doc, {
      head: [['Ngày tháng', 'Điều kiện', 'Tác nhân gây ô nhiễm', 'Đánh giá hiện tại', 'Biện pháp xử lý']],
      body: table1Body,
      startY: 24,
      styles: {
        font: activeFont,
        fontSize: 10.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 45 },
        1: { cellWidth: 45 },
        2: { cellWidth: 70 },
        3: { halign: 'center', cellWidth: 45 },
        4: { cellWidth: 'auto' }
      }
    });

    // ── PAGE 4: BIỂU 2 (VẬT TƯ ĐẦU VÀO) ─────────────────────────────────────
    doc.addPage('a4', 'landscape');
    doc.setFontSize(12);
    doc.setFont(activeFont, 'bold');
    doc.text('Biểu 2. Bảng theo dõi mua hoặc tự sản xuất vật tư đầu vào', 14, 18);

    const bieu2Rows = selectedBook.tablesData?.bieu_2 || [];
    const table2Body = bieu2Rows.length > 0
      ? bieu2Rows.map(r => [r.thoi_gian || '', r.ten_vat_tu || '', r.so_luong || '', r.dvt || '', r.ten_dia_chi_mua || '', r.han_su_dung || '', r.nguyen_lieu_sx || '', r.phuong_phap_xl || '', r.hoa_chat_xl || ''])
      : [
          ['', '', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', '', '']
        ];

    autoTable(doc, {
      head: [['Thời gian', 'Tên vật tư', 'Số lượng', 'ĐVT', 'Tên và địa chỉ mua vật tư', 'Hạn sử dụng', 'Nguyên liệu sản xuất', 'Phương pháp xử lý', 'Hóa chất xử lý']],
      body: table2Body,
      startY: 24,
      styles: {
        font: activeFont,
        fontSize: 9.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 26 },
        1: { cellWidth: 35 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 16 },
        4: { cellWidth: 45 },
        5: { halign: 'center', cellWidth: 26 },
        6: { cellWidth: 35 },
        7: { cellWidth: 33 },
        8: { cellWidth: 'auto' }
      }
    });

    // ── PAGE 5: BẢNG 3 (CANH TÁC) ───────────────────────────────────────────
    doc.addPage('a4', 'landscape');
    doc.setFontSize(12);
    doc.setFont(activeFont, 'bold');
    doc.text('Bảng 3. Bảng nhật ký canh tác', 14, 18);

    const bang3Rows = selectedBook.tablesData?.bang_3 || [];
    const table3Body = bang3Rows.length > 0
      ? bang3Rows.map(r => [r.thoi_gian_th || '', r.ten_phan_bon || '', r.luong_su_dung_kg || '', r.ten_thuoc_bvtv || '', r.nong_do_pha || '', r.luong_su_dung || '', r.thoi_gian_cach_ly || '', r.ghi_chu || ''])
      : [
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', '']
        ];

    autoTable(doc, {
      head: [['Thời gian thực hiện', 'Tên phân bón', 'Lượng sử dụng (Kg)', 'Tên thuốc BVTV', 'Nồng độ pha', 'Lượng sử dụng', 'Thời gian cách ly(ngày)', 'Ghi chú']],
      body: table3Body,
      startY: 24,
      styles: {
        font: activeFont,
        fontSize: 9.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 32 },
        1: { cellWidth: 40 },
        2: { halign: 'center', cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { halign: 'center', cellWidth: 34 },
        7: { cellWidth: 'auto' }
      }
    });

    // ── PAGE 6: BẢNG 4 (THU HOẠCH & TIÊU THỤ) ────────────────────────────────
    doc.addPage('a4', 'landscape');
    doc.setFontSize(12);
    doc.setFont(activeFont, 'bold');
    doc.text('Bảng 4. Thu hoạch sản phẩm và tiêu thụ', 14, 18);

    const bang4Rows = selectedBook.tablesData?.bang_4 || [];
    const table4Body = bang4Rows.length > 0
      ? bang4Rows.map(r => [r.thoi_gian_thu_hoach || '', r.ma_so_lo_th || '', r.ten_san_pham || '', r.san_luong || '', r.dvt_thu_hoach || '', r.dia_diem_so_che || '', r.ngay_ban || '', r.so_luong_ban || '', r.dvt_ban || '', r.don_vi_thu_mua || ''])
      : [
          ['', '', '', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', '', '', '']
        ];

    autoTable(doc, {
      head: [['Thời gian thu hoạch', 'Mã số lô thu hoạch', 'Tên sản phẩm', 'Sản lượng', 'ĐVT Thu hoạch', 'Địa điểm sơ chế', 'Ngày bán', 'Số lượng bán', 'ĐVT Bán', 'Đơn vị thu mua/Địa chỉ']],
      body: table4Body,
      startY: 24,
      styles: {
        font: activeFont,
        fontSize: 9.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 28 },
        1: { cellWidth: 28 },
        2: { cellWidth: 32 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 20 },
        5: { cellWidth: 28 },
        6: { halign: 'center', cellWidth: 24 },
        7: { halign: 'center', cellWidth: 20 },
        8: { halign: 'center', cellWidth: 18 },
        9: { cellWidth: 'auto' }
      }
    });

    const fileName = `So_Nhat_Ky_${selectedBook.loaiSo || 'VietGAP'}_${selectedBook.maNongHo || 'BANHANG'}_${dayjs().format('YYYYMMDD')}.pdf`;
    doc.save(fileName);
    hide();
    message.success(`Đã xuất và tải file PDF font Times New Roman thành công: ${fileName}`);
  } catch (err) {
    hide();
    console.error('jsPDF export error:', err);
    message.error('Lỗi khi xuất PDF. Đang mở bản in dự phòng...');
    printJournalHtml(selectedBook);
  }
};

/**
 * Print preview fallback
 */
export const printJournalHtml = (selectedBook) => {
  if (!selectedBook) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    message.error('Trình duyệt đã chặn popup. Vui lòng cho phép popup để xem bản in.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>SỔ NHẬT KÝ SẢN XUẤT - ${selectedBook.hoTen || 'EBookFarm'}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm 15mm 12mm 15mm; }
          body { margin: 0; padding: 0; background-color: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body>
        ${generateJournalPdfHtml(selectedBook)}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
