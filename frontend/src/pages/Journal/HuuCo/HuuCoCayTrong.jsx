import React from 'react';
import StandardJournalForm from '../StandardJournalForm';

const config = {
  emoji: '🌱',
  title: 'Danh sách sổ nhật ký trồng trọt theo mô hình Hữu cơ',
  standard: 'Hữu cơ',
  standardRef: 'TCVN 11041-2:2017',
  gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
  regionLabel: 'Vùng trồng hữu cơ',
  cropLabel: 'Loại cây trồng hữu cơ',
  cropOptions: ['Rau hữu cơ', 'Lúa hữu cơ', 'Cây ăn trái hữu cơ', 'Sầu riêng hữu cơ', 'Xoài hữu cơ', 'Chè hữu cơ', 'Cà phê hữu cơ', 'Hồ tiêu hữu cơ', 'Sachi hữu cơ', 'Khác'],
  activityOptions: ['Làm đất (không hóa chất)', 'Bón phân hữu cơ', 'Tưới nước sạch', 'Kiểm soát cỏ dại (cơ học)', 'Phòng trừ sinh học', 'Kiểm tra sâu bệnh', 'Thu hoạch thủ công', 'Vệ sinh vườn', 'Khác'],
};

export default function HuuCoCayTrong() {
  const journalType = 'huucocaytrong';
  return <StandardJournalForm journalType={journalType} config={config} />;
}
