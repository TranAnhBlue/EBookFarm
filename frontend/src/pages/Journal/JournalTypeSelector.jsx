import React from 'react';
import { Card, Row, Col, Tag, Typography, Button, Badge } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, SafetyCertificateFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Title, Text, Paragraph } = Typography;

const JOURNAL_TYPES = [
  {
    key: 'vietgap-trong-trot',
    standard: 'VietGAP',
    standardColor: '#16a34a',
    standardBg: '#f0fdf4',
    category: 'Trồng trọt',
    emoji: '🌿',
    route: '/vietgap/trong-trot',
    description: 'Nhật ký canh tác theo tiêu chuẩn VietGAP – TCVN 11892-1. Ghi chép gieo trồng, chăm sóc, vật tư, thu hoạch.',
    fields: ['Thông tin vùng trồng', 'Giống cây trồng', 'Phân bón & vật tư đầu vào', 'Thuốc BVTV (PHI)', 'Thu hoạch & sản lượng'],
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    shadow: 'rgba(22,163,74,0.2)',
    standard_ref: 'TCVN 11892-1:2017',
  },
  {
    key: 'vietgap-chan-nuoi',
    standard: 'VietGAP',
    standardColor: '#16a34a',
    standardBg: '#f0fdf4',
    category: 'Chăn nuôi',
    emoji: '🐄',
    route: '/vietgap/chan-nuoi',
    description: 'Nhật ký chăn nuôi theo VietGAHP. Theo dõi đàn vật nuôi, thức ăn, thuốc thú y, dịch bệnh và xuất chuồng.',
    fields: ['Thông tin cơ sở chăn nuôi', 'Đàn vật nuôi', 'Thức ăn & nước uống', 'Thuốc thú y & tiêm phòng', 'Kiểm tra sức khỏe'],
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    shadow: 'rgba(22,163,74,0.2)',
    standard_ref: 'VietGAHP:2015',
  },
  {
    key: 'vietgap-thuy-san',
    standard: 'VietGAP',
    standardColor: '#16a34a',
    standardBg: '#f0fdf4',
    category: 'Thủy sản',
    emoji: '🐟',
    route: '/vietgap/thuy-san',
    description: 'Nhật ký nuôi trồng thủy sản theo VietGAP. Quản lý ao nuôi, con giống, thức ăn, chất lượng nước và thu hoạch.',
    fields: ['Thông tin ao/vùng nuôi', 'Con giống thủy sản', 'Thức ăn & hóa chất', 'Chất lượng môi trường nước', 'Thu hoạch'],
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    shadow: 'rgba(22,163,74,0.2)',
    standard_ref: 'VietGAP Thủy sản:2014',
  },
  {
    key: 'huuco-cay-trong',
    standard: 'Hữu cơ',
    standardColor: '#d97706',
    standardBg: '#fefce8',
    category: 'Cây trồng',
    emoji: '🌱',
    route: '/huuco/cay-trong',
    description: 'Nhật ký sản xuất hữu cơ cây trồng theo TCVN 11041-2. Không hóa chất tổng hợp, chứng nhận hữu cơ quốc gia.',
    fields: ['Thông tin vùng trồng hữu cơ', 'Lịch sử sử dụng đất', 'Phân bón hữu cơ được phép', 'Kiểm soát sinh học', 'Kiểm tra tạp chất'],
    gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
    shadow: 'rgba(217,119,6,0.2)',
    standard_ref: 'TCVN 11041-2:2017',
  },
  {
    key: 'huuco-chan-nuoi',
    standard: 'Hữu cơ',
    standardColor: '#d97706',
    standardBg: '#fefce8',
    category: 'Chăn nuôi',
    emoji: '🐓',
    route: '/huuco/chan-nuoi',
    description: 'Nhật ký chăn nuôi hữu cơ theo TCVN 11041-3. Quản lý đàn, thức ăn hữu cơ, phúc lợi động vật và không kháng sinh.',
    fields: ['Thông tin trại chăn nuôi hữu cơ', 'Đàn vật nuôi & giống', 'Thức ăn hữu cơ được chứng nhận', 'Phòng bệnh tự nhiên', 'Phúc lợi động vật'],
    gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
    shadow: 'rgba(217,119,6,0.2)',
    standard_ref: 'TCVN 11041-3:2017',
  },
  {
    key: 'huuco-thuy-san',
    standard: 'Hữu cơ',
    standardColor: '#d97706',
    standardBg: '#fefce8',
    category: 'Thủy sản',
    emoji: '🦐',
    route: '/huuco/thuy-san',
    description: 'Nhật ký nuôi trồng thủy sản hữu cơ theo TCVN 11041-4. Môi trường tự nhiên, không hóa chất, con giống sạch.',
    fields: ['Thông tin vùng nuôi hữu cơ', 'Con giống được chứng nhận', 'Thức ăn tự nhiên', 'Quản lý môi trường nước sạch', 'Phòng bệnh sinh học'],
    gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
    shadow: 'rgba(217,119,6,0.2)',
    standard_ref: 'TCVN 11041-4:2018',
  },
];

export default function JournalTypeSelector() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userType = localStorage.getItem('userType') || 'household';

  const vietgapTypes = JOURNAL_TYPES.filter(t => t.standard === 'VietGAP');
  const huucoTypes = JOURNAL_TYPES.filter(t => t.standard === 'Hữu cơ');

  const renderStandardGroup = (types, standard, standardColor, gradientBg) => (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: types[0].gradient }}>
          <SafetyCertificateFilled className="text-white text-xl" />
        </div>
        <div>
          <Text className="text-[10px] font-black uppercase tracking-widest block" style={{ color: standardColor }}>Tiêu chuẩn</Text>
          <Title level={3} className="!mb-0 font-black !text-gray-900">{standard === 'VietGAP' ? 'VietGAP / VietGAHP' : 'Nông nghiệp Hữu cơ'}</Title>
        </div>
        <div className="ml-auto">
          <Tag className="rounded-full px-4 py-1 font-black text-xs border-0"
            style={{ background: types[0].standardBg, color: standardColor }}>
            {types.length} loại nhật ký
          </Tag>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {types.map((type) => (
          <Col xs={24} md={8} key={type.key}>
            <Card
              hoverable
              onClick={() => navigate(type.route)}
              className="h-full rounded-[28px] border-0 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden group"
              style={{
                background: type.standardBg,
                border: `2px solid ${type.standardColor}20`,
                boxShadow: `0 4px 20px ${type.shadow}`,
              }}
              styles={{ body: { padding: '1.75rem' } }}
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                    style={{ background: type.gradient }}>
                    {type.emoji}
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1"
                    style={{ background: type.standardColor + '15' }}>
                    <ArrowRightOutlined style={{ color: type.standardColor, fontSize: 12 }} />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Text className="text-[10px] font-black uppercase tracking-wider block mb-1" style={{ color: type.standardColor }}>
                    {type.standard} • {type.standard_ref}
                  </Text>
                  <Title level={4} className="!mb-2 !text-gray-900 font-black">Nhật Ký {type.category}</Title>
                  <Paragraph className="text-gray-500 text-sm leading-relaxed !mb-0">{type.description}</Paragraph>
                </div>

                {/* Required fields preview */}
                <div className="space-y-1.5">
                  <Text className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Các mục bắt buộc ghi chép:</Text>
                  {type.fields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircleFilled style={{ color: type.standardColor, fontSize: 11 }} />
                      <Text className="text-gray-600 text-xs">{field}</Text>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button block type="primary" size="large" className="h-11 rounded-xl font-black border-0"
                  style={{ background: type.gradient }}>
                  Ghi nhật ký {type.category} →
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="px-6 py-8 md:py-12" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #14532d 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <span className="text-sm">📒</span>
              <Text className="text-green-400 font-black text-xs uppercase tracking-widest">Nhật Ký Sản Xuất Điện Tử</Text>
            </div>
            <Title className="!text-white !mb-3 !text-3xl md:!text-4xl font-black">Chọn Loại Nhật Ký</Title>
            <Paragraph className="text-gray-400 text-base max-w-xl mx-auto !mb-0">
              Chọn đúng loại nhật ký phù hợp với hoạt động sản xuất của bạn. Tất cả các mục đều bắt buộc điền đầy đủ để đảm bảo hồ sơ đúng chuẩn.
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Notice bar */}
      <div className="px-6 py-3" style={{ background: '#fefce8', borderBottom: '1px solid #fde68a' }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span>⚠️</span>
          <Text className="text-amber-800 text-sm font-semibold">
            Lưu ý: Sổ Nhật Ký không có tùy chọn bỏ qua – tất cả các trường đều bắt buộc để đáp ứng điều kiện xuất báo cáo tiêu chuẩn.
          </Text>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {renderStandardGroup(vietgapTypes, 'VietGAP', '#16a34a')}
        <div className="border-t-2 border-dashed border-gray-100 mb-12"></div>
        {renderStandardGroup(huucoTypes, 'Hữu cơ', '#d97706')}
      </div>
    </div>
  );
}
