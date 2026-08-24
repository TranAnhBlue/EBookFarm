import React from 'react';
import StandardJournalForm from '../StandardJournalForm';

const config = {
  emoji: '🐓',
  title: 'Danh sách sổ nhật ký chăn nuôi theo mô hình Hữu cơ',
  standard: 'Hữu cơ',
  standardRef: 'TCVN 11041-3:2017',
  gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
  regionLabel: 'Trại chăn nuôi hữu cơ',
  cropLabel: 'Loại vật nuôi hữu cơ',
  cropOptions: ['Heo hữu cơ', 'Bò hữu cơ', 'Gà ta hữu cơ', 'Vịt hữu cơ', 'Dê hữu cơ', 'Khác'],
  activityOptions: ['Cho ăn (thức ăn hữu cơ)', 'Kiểm tra sức khỏe', 'Phòng bệnh tự nhiên', 'Vệ sinh chuồng trại', 'Chăm sóc phúc lợi', 'Nhập giống được chứng nhận', 'Xuất bán', 'Khác'],
};

export default function HuuCoChanNuoi() {
  const journalType = 'huucochannuoi';
  return <StandardJournalForm journalType={journalType} config={config} />;
}
