import XLSX from 'xlsx';
import path from 'path';
import fileUrl from 'url';

const filePath = path.resolve('src/assets/So_nhat_ky_san_xuat_sau_rieng.xlsx');
console.log('Reading Excel file from:', filePath);

const workbook = XLSX.readFile(filePath);
console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n================ SHEET: ${sheetName} ================`);
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  json.forEach((row, idx) => {
    if (row && row.length > 0 && row.some(cell => cell !== null && cell !== '')) {
      console.log(`Row ${idx + 1}:`, JSON.stringify(row));
    }
  });
});
