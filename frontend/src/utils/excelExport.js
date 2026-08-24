import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { message } from 'antd';

/**
 * Export journal records to a multi-sheet Excel file (.xlsx)
 */
export const exportJournalExcel = (selectedBook, tabsConfig) => {
  if (!selectedBook) return;
  try {
    const wb = XLSX.utils.book_new();
    tabsConfig.forEach(tab => {
      const rows = selectedBook.tablesData?.[tab.key] || [];
      const formattedRows = rows.map(r => {
        const rowObj = {};
        tab.columns.forEach(c => { rowObj[c.title] = r[c.key] || ''; });
        return rowObj;
      });
      const ws = XLSX.utils.json_to_sheet(formattedRows);
      XLSX.utils.book_append_sheet(wb, ws, tab.label.substring(0, 30));
    });

    const fileName = `NhatKy_${selectedBook.loaiSo || 'VietGAP'}_${selectedBook.maNongHo || 'BANHANG'}_${dayjs().format('YYYYMMDD')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    message.success('Đã xuất file Excel thành công!');
  } catch (err) {
    console.error('Excel export error:', err);
    message.error('Lỗi khi xuất file Excel');
  }
};
