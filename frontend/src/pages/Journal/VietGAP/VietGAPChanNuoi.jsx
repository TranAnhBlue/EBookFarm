import React from 'react';
import StandardJournalForm from '../StandardJournalForm';

const config = {
  emoji: '🐄',
  title: 'Danh sách sổ nhật ký chăn nuôi theo mô hình VietGAP',
  standard: 'VietGAP',
  standardRef: 'VietGAHP:2015',
  gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
  regionLabel: 'Cơ sở chăn nuôi',
  cropLabel: 'Loại vật nuôi',
  cropOptions: ['Heo / Lợn', 'Bò thịt', 'Bò sữa', 'Gà thịt', 'Gà đẻ trứng', 'Vịt', 'Dê', 'Cừu', 'Thỏ', 'Khác'],
  activityOptions: ['Cho ăn', 'Tiêm phòng', 'Điều trị bệnh', 'Kiểm tra sức khỏe', 'Cân trọng lượng', 'Vệ sinh chuồng trại', 'Nhập giống', 'Xuất bán', 'Phối giống', 'Đẻ / Nở', 'Khác'],
};

export default function VietGAPChanNuoi() {
  const journalType = 'vietgapchannuoi';
  return <StandardJournalForm journalType={journalType} config={config} />;
}
