import React from 'react';
import StandardJournalForm from '../StandardJournalForm';

const config = {
  emoji: '🌿',
  title: 'Danh sách sổ nhật ký trồng trọt theo mô hình VietGAP',
  standard: 'VietGAP',
  standardRef: 'TCVN 11892-1:2017',
  gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
  regionLabel: 'Vùng trồng trọt',
  cropLabel: 'Loại cây trồng',
  cropOptions: ['Lúa', 'Rau ăn lá', 'Rau ăn quả', 'Cây ăn trái', 'Sầu riêng', 'Xoài', 'Chôm chôm', 'Bưởi', 'Mít', 'Tiêu', 'Điều', 'Cà phê', 'Sắn', 'Ngô', 'Khoai lang'],
  activityOptions: ['Làm đất / Cày xới', 'Gieo hạt / Trồng cây', 'Bón phân', 'Tưới nước', 'Phun thuốc BVTV', 'Làm cỏ', 'Tỉa cành / Tạo tán', 'Kiểm tra sâu bệnh', 'Bao trái', 'Thu hoạch', 'Khác'],
};

export default function VietGAPTrongTrot() {
  const journalType = 'vietgaptrongtrot';
  return <StandardJournalForm journalType={journalType} config={config} />;
}
