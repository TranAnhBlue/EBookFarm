import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, List, Row, Skeleton, Space, Statistic, Tag, Typography, message } from 'antd';
import {
  AuditOutlined,
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
    title: 'Đơn đặt hàng',
    description: 'Quản lý số lượng đơn đặt hàng, trạng thái điều phối và nhu cầu sản phẩm từ khách hàng/đối tác.',
    icon: <ShoppingOutlined />,
    actions: [
      { label: 'Đơn đặt hàng', path: '/htx/distribution-orders' },
    ],
  },
  {
    title: 'Vận chuyển & giao hàng',
    description: 'Theo dõi thời gian, chi phí vận chuyển, sắp xếp hàng và tình trạng giao hàng.',
    icon: <AuditOutlined />,
    actions: [
      { label: 'Vận chuyển & giao hàng', path: '/htx/distribution-shipments' },
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
    title: 'Phát triển thị trường',
    description: 'Theo dõi hội chợ, kênh bán hàng, sự kiện giới thiệu sản phẩm và cơ hội tiêu thụ.',
    icon: <GlobalOutlined />,
    actions: [
      { label: 'Phát triển thị trường', path: '/htx/market-development' },
    ],
  },
  {
    title: 'Phản hồi khách hàng',
    description: 'Tiếp nhận và xử lý ý kiến khách hàng/đối tác về chất lượng, bao gói, giao hàng.',
    icon: <FileTextOutlined />,
    actions: [
      { label: 'Phản hồi khách hàng', path: '/htx/customer-feedback' },
      { label: 'Hoàn thiện sản phẩm', path: '/htx/product-finalization' },
    ],
  },
  {
    title: 'Hoàn thiện sản phẩm',
    description: 'Giám sát phân loại, đóng gói, dán tem QR, bàn giao trước khi chuyển cho khách hàng.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'Hoàn thiện sản phẩm', path: '/htx/product-finalization' },
    ],
  },
  {
    title: 'Đối soát tài chính',
    description: 'Tập hợp doanh thu đơn hàng, chi phí vận chuyển/đóng gói và chuyển sang Kế toán xử lý thanh toán hoặc công nợ.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Đối soát tài chính', path: '/htx/distribution-finance' },
      { label: 'Chi phí vận chuyển', path: '/htx/distribution-shipments' },
    ],
  },
  {
    title: 'Liên kết nông dân',
    description: 'Gắn đơn hàng, phản hồi, yêu cầu hoàn thiện sản phẩm với các nông hộ liên quan.',
    icon: <TeamOutlined />,
    actions: [
      { label: 'Đối soát theo nông hộ', path: '/htx/distribution-finance' },
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
        message.error('Không thể tải dữ liệu phân phối HTX');
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
    { title: 'Đơn đang xử lý', value: pendingOrders, icon: <ShoppingOutlined />, color: '#f97316' },
    { title: 'Chuyến giao hàng', value: activeShipments, icon: <AuditOutlined />, color: '#2563eb' },
    { title: 'Phản hồi khách hàng', value: feedback.length, icon: <FileTextOutlined />, color: '#16a34a' },
    { title: 'Đối soát tài chính', value: pendingFinance, icon: <WalletOutlined />, color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Trung tâm phân phối HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <ShoppingOutlined className="text-green-600" /> Ban phân phối
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            Màn nghiệp vụ cho Ban phân phối: quản lý đơn hàng, vận chuyển, hoàn thiện sản phẩm, phát triển thị trường và xử lý phản hồi khách hàng/đối tác.
          </Paragraph>
        </div>
        <Space wrap>
          <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/htx/distribution-orders')} className="rounded-xl h-10">
            Đơn hàng
          </Button>
          <Button icon={<WalletOutlined />} onClick={() => navigate('/htx/distribution-finance')} className="rounded-xl h-10">
            Đối soát
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        className="rounded-2xl border-blue-100"
        message="Tác động tới nông dân"
        description="Ban phân phối có thể gắn đơn hàng, phản hồi khách hàng, yêu cầu hoàn thiện sản phẩm hoặc vận chuyển với từng nông dân liên quan. Nông dân sẽ nhận thông báo và xem ở màn Yêu cầu từ HTX."
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
            <Text strong className="block text-gray-900">Quyền hạn phân phối đã áp vào hệ thống</Text>
            <Text className="text-gray-500 text-sm">Ban phân phối quản lý sản phẩm, lô hàng, đơn hàng, vận chuyển, phản hồi khách hàng và yêu cầu hoàn thiện sản phẩm trước khi giao.</Text>
          </div>
          <Space wrap>
            <Tag color="green">Đơn hàng</Tag>
            <Tag color="blue">Vận chuyển</Tag>
            <Tag color="purple">Thị trường</Tag>
            <Tag color="orange">Phản hồi</Tag>
            <Tag color="cyan">Hoàn thiện sản phẩm</Tag>
            <Tag color="gold">Đối soát tài chính</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HtxDistributionConsole;
