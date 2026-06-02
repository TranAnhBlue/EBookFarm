import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, List, Row, Skeleton, Space, Statistic, Tag, Typography, message } from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const distributionDuties = [
  {
    title: 'ÄÆ¡n Ä‘áº·t hÃ ng',
    description: 'Quáº£n lÃ½ sá»‘ lÆ°á»£ng Ä‘Æ¡n Ä‘áº·t hÃ ng, tráº¡ng thÃ¡i Ä‘iá»u phá»‘i vÃ  nhu cáº§u sáº£n pháº©m tá»« khÃ¡ch hÃ ng/Ä‘á»‘i tÃ¡c.',
    icon: <ShoppingOutlined />,
    actions: [
      { label: 'ÄÆ¡n Ä‘áº·t hÃ ng', path: '/htx/distribution-orders' },
    ],
  },
  {
    title: 'Váº­n chuyá»ƒn & giao hÃ ng',
    description: 'Theo dÃµi thá»i gian, chi phÃ­ váº­n chuyá»ƒn, sáº¯p xáº¿p hÃ ng vÃ  tÃ¬nh tráº¡ng giao hÃ ng.',
    icon: <AuditOutlined />,
    actions: [
      { label: 'Váº­n chuyá»ƒn & giao hÃ ng', path: '/htx/distribution-shipments' },
    ],
  },
  {
    title: 'Kho vật tư tập trung',
    description: 'Theo dõi tồn kho vật tư, vật tư đóng gói, cấp phát và lịch sử nhập/xuất phục vụ phân phối.',
    icon: <InboxOutlined />,
    actions: [
      { label: 'Kho vật tư tập trung', path: '/inventory' },
      { label: 'Vận chuyển & giao hàng', path: '/htx/distribution-shipments' },
    ],
  },
  {
    title: 'PhÃ¡t triá»ƒn thá»‹ trÆ°á»ng',
    description: 'Theo dÃµi há»™i chá»£, kÃªnh bÃ¡n hÃ ng, sá»± kiá»‡n giá»›i thiá»‡u sáº£n pháº©m vÃ  cÆ¡ há»™i tiÃªu thá»¥.',
    icon: <GlobalOutlined />,
    actions: [
      { label: 'PhÃ¡t triá»ƒn thá»‹ trÆ°á»ng', path: '/htx/market-development' },
    ],
  },
  {
    title: 'Pháº£n há»“i khÃ¡ch hÃ ng',
    description: 'Tiáº¿p nháº­n vÃ  xá»­ lÃ½ Ã½ kiáº¿n khÃ¡ch hÃ ng/Ä‘á»‘i tÃ¡c vá» cháº¥t lÆ°á»£ng, bao gÃ³i, giao hÃ ng.',
    icon: <FileTextOutlined />,
    actions: [
      { label: 'Pháº£n há»“i khÃ¡ch hÃ ng', path: '/htx/customer-feedback' },
      { label: 'HoÃ n thiá»‡n sáº£n pháº©m', path: '/htx/product-finalization' },
    ],
  },
  {
    title: 'HoÃ n thiá»‡n sáº£n pháº©m',
    description: 'GiÃ¡m sÃ¡t phÃ¢n loáº¡i, Ä‘Ã³ng gÃ³i, dÃ¡n tem QR, bÃ n giao trÆ°á»›c khi chuyá»ƒn cho khÃ¡ch hÃ ng.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'HoÃ n thiá»‡n sáº£n pháº©m', path: '/htx/product-finalization' },
    ],
  },
  {
    title: 'Äá»‘i soÃ¡t tÃ i chÃ­nh',
    description: 'Táº­p há»£p doanh thu Ä‘Æ¡n hÃ ng, chi phÃ­ váº­n chuyá»ƒn/Ä‘Ã³ng gÃ³i vÃ  chuyá»ƒn sang Káº¿ toÃ¡n xá»­ lÃ½ thanh toÃ¡n hoáº·c cÃ´ng ná»£.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Äá»‘i soÃ¡t tÃ i chÃ­nh', path: '/htx/distribution-finance' },
      { label: 'Chi phÃ­ váº­n chuyá»ƒn', path: '/htx/distribution-shipments' },
    ],
  },
  {
    title: 'LiÃªn káº¿t nÃ´ng dÃ¢n',
    description: 'Gáº¯n Ä‘Æ¡n hÃ ng, pháº£n há»“i, yÃªu cáº§u hoÃ n thiá»‡n sáº£n pháº©m vá»›i cÃ¡c nÃ´ng há»™ liÃªn quan.',
    icon: <TeamOutlined />,
    actions: [
      { label: 'Äá»‘i soÃ¡t theo nÃ´ng há»™', path: '/htx/distribution-finance' },
    ],
  },
];

const HtxDistributionConsole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [financeRequests, setFinanceRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, shipmentsRes, feedbackRes, financeRes] = await Promise.all([
          api.get('/htx/management/distribution-orders'),
          api.get('/htx/management/distribution-shipments'),
          api.get('/htx/management/customer-feedback'),
          api.get('/htx/management/distribution-finance-requests'),
        ]);
        setOrders(ordersRes.data?.data || []);
        setShipments(shipmentsRes.data?.data || []);
        setFeedback(feedbackRes.data?.data || []);
        setFinanceRequests(financeRes.data?.data || []);
      } catch (error) {
        message.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u phÃ¢n phá»‘i HTX');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingOrders = useMemo(() => orders.filter(item => ['Pending', 'InProgress', 'Review'].includes(item.status)).length, [orders]);
  const activeShipments = useMemo(() => shipments.filter(item => ['Planned', 'InProgress', 'Review'].includes(item.status)).length, [shipments]);
  const pendingFinance = useMemo(() => financeRequests.filter(item => ['Pending', 'Review'].includes(item.status)).length, [financeRequests]);

  const summaryItems = [
    { title: 'ÄÆ¡n Ä‘ang xá»­ lÃ½', value: pendingOrders, icon: <ShoppingOutlined />, color: '#f97316' },
    { title: 'Chuyáº¿n giao hÃ ng', value: activeShipments, icon: <AuditOutlined />, color: '#2563eb' },
    { title: 'Phản hồi khách hàng', value: feedback.length, icon: <FileTextOutlined />, color: '#16a34a' },
    { title: 'Äá»‘i soÃ¡t tÃ i chÃ­nh', value: pendingFinance, icon: <WalletOutlined />, color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Trung tÃ¢m phÃ¢n phá»‘i HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <ShoppingOutlined className="text-green-600" /> Ban phÃ¢n phá»‘i
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            MÃ n nghiá»‡p vá»¥ cho Ban phÃ¢n phá»‘i: quáº£n lÃ½ Ä‘Æ¡n hÃ ng, váº­n chuyá»ƒn, hoÃ n thiá»‡n sáº£n pháº©m, phÃ¡t triá»ƒn thá»‹ trÆ°á»ng vÃ  xá»­ lÃ½ pháº£n há»“i khÃ¡ch hÃ ng/Ä‘á»‘i tÃ¡c.
          </Paragraph>
        </div>
        <Space wrap>
          <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/htx/distribution-orders')} className="rounded-xl h-10">
            ÄÆ¡n hÃ ng
          </Button>
          <Button icon={<WalletOutlined />} onClick={() => navigate('/htx/distribution-finance')} className="rounded-xl h-10">
            Äá»‘i soÃ¡t
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        className="rounded-2xl border-blue-100"
        message="TÃ¡c Ä‘á»™ng tá»›i nÃ´ng dÃ¢n"
        description="Ban phÃ¢n phá»‘i cÃ³ thá»ƒ gáº¯n Ä‘Æ¡n hÃ ng, pháº£n há»“i khÃ¡ch hÃ ng, yÃªu cáº§u hoÃ n thiá»‡n sáº£n pháº©m hoáº·c váº­n chuyá»ƒn vá»›i tá»«ng nÃ´ng dÃ¢n liÃªn quan. NÃ´ng dÃ¢n sáº½ nháº­n thÃ´ng bÃ¡o vÃ  xem á»Ÿ mÃ n YÃªu cáº§u tá»« HTX."
      />

      <Row gutter={[16, 16]}>
        {summaryItems.map(item => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full">
              <Skeleton loading={loading} active paragraph={false}>
                <Statistic
                  title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">{item.title}</Text>}
                  value={item.value}
                  prefix={React.cloneElement(item.icon, { style: { color: item.color } })}
                  valueStyle={{ fontSize: 26, fontWeight: 700, color: '#111827' }}
                />
              </Skeleton>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {distributionDuties.map(duty => (
          <Col xs={24} md={12} xl={8} key={duty.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full" bodyStyle={{ padding: 20 }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg shrink-0">
                  {duty.icon}
                </div>
                <div>
                  <Text strong className="text-base text-gray-900">{duty.title}</Text>
                  <Paragraph className="!mb-0 mt-1 text-xs text-gray-500 leading-5">{duty.description}</Paragraph>
                </div>
              </div>
              <List
                dataSource={duty.actions}
                split={false}
                renderItem={action => (
                  <List.Item className="!px-0 !py-1">
                    <Button block onClick={() => navigate(action.path)} className="text-left justify-start rounded-xl border-gray-100">
                      {action.label}
                    </Button>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <Text strong className="block text-gray-900">Quyá»n háº¡n phÃ¢n phá»‘i Ä‘Ã£ Ã¡p vÃ o há»‡ thá»‘ng</Text>
            <Text className="text-gray-500 text-sm">Ban phÃ¢n phá»‘i quáº£n lÃ½ sáº£n pháº©m, lÃ´ hÃ ng, Ä‘Æ¡n hÃ ng, váº­n chuyá»ƒn, pháº£n há»“i khÃ¡ch hÃ ng vÃ  yÃªu cáº§u hoÃ n thiá»‡n sáº£n pháº©m trÆ°á»›c khi giao.</Text>
          </div>
          <Space wrap>
            <Tag color="green">ÄÆ¡n hÃ ng</Tag>
            <Tag color="blue">Váº­n chuyá»ƒn</Tag>
            <Tag color="purple">Thá»‹ trÆ°á»ng</Tag>
            <Tag color="orange">Pháº£n há»“i</Tag>
            <Tag color="cyan">HoÃ n thiá»‡n sáº£n pháº©m</Tag>
            <Tag color="gold">Äá»‘i soÃ¡t tÃ i chÃ­nh</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HtxDistributionConsole;
