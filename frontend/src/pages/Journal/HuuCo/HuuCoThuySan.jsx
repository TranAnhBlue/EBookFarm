import React from 'react';
import StandardJournalForm from '../StandardJournalForm';

const config = {
  emoji: '🦐',
  title: 'Danh sách sổ nhật ký thủy sản theo mô hình Hữu cơ',
  standard: 'Hữu cơ',
  standardRef: 'TCVN 11041-4:2018',
  gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
  regionLabel: 'Vùng nuôi thủy sản hữu cơ',
  cropLabel: 'Loại thủy sản hữu cơ',
  cropOptions: ['Tôm hữu cơ', 'Cá hữu cơ', 'Cua hữu cơ', 'Khác'],
  activityOptions: ['Cải tạo ao (tự nhiên)', 'Thả giống sạch', 'Cho ăn (thức ăn tự nhiên)', 'Kiểm tra môi trường nước', 'Phòng bệnh sinh học', 'Thu hoạch', 'Khác'],
};

export default function HuuCoThuySan() {
  const journalType = 'huucothuysan';
  return <StandardJournalForm journalType={journalType} config={config} />;
}
