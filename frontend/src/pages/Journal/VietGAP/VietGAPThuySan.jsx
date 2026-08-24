import React from 'react';
import StandardJournalForm from '../StandardJournalForm';

const config = {
  emoji: '🐟',
  title: 'Danh sách sổ nhật ký thủy sản theo mô hình VietGAP',
  standard: 'VietGAP',
  standardRef: 'VietGAP Thủy sản:2014',
  gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
  regionLabel: 'Ao nuôi / Vùng nuôi',
  cropLabel: 'Loại thủy sản',
  cropOptions: ['Tôm sú', 'Tôm thẻ chân trắng', 'Cá tra / Cá ba sa', 'Cá lóc', 'Cá rô phi', 'Cá chép', 'Cua biển', 'Ốc hương', 'Nghêu / Sò', 'Khác'],
  activityOptions: ['Cải tạo ao', 'Thả giống', 'Cho ăn', 'Bón vôi / xử lý ao', 'Thay nước', 'Kiểm tra chất lượng nước', 'Phòng bệnh', 'Điều trị bệnh', 'Kiểm tra tăng trưởng', 'Thu hoạch', 'Khác'],
};

export default function VietGAPThuySan() {
  const journalType = 'vietgapthuysan';
  return <StandardJournalForm journalType={journalType} config={config} />;
}
