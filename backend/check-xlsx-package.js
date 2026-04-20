// Script để kiểm tra xem package xlsx đã được cài đặt chưa

try {
  const XLSX = require('xlsx');
  console.log('✅ Package xlsx đã được cài đặt!');
  console.log('📦 Version:', XLSX.version);
  console.log('');
  console.log('Bạn có thể chạy server bình thường:');
  console.log('  npm run dev');
} catch (error) {
  console.log('❌ Package xlsx CHƯA được cài đặt!');
  console.log('');
  console.log('Vui lòng chạy lệnh sau để cài đặt:');
  console.log('  npm install xlsx');
  console.log('');
  console.log('Sau khi cài đặt xong, chạy lại script này để kiểm tra:');
  console.log('  node check-xlsx-package.js');
}
