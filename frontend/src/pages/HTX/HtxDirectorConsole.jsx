import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Space, Tag, List, message, Skeleton } from 'antd';
import {
  AuditOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const responsibilityGroups = [
  {
    title: 'Pháp lý và điều hành chung',
    description: 'Đại diện pháp luật, chịu trách nhiệm kết quả hoạt động và ký duyệt các nghiệp vụ trọng yếu.',
    icon: <AuditOutlined />,
    actions: [
      { label: 'Xem báo cáo tổng hợp', path: '/reports' },
      { label: 'Văn bản & thủ tục', path: '/htx/documents' },
    ],
  },
  {
    title: 'Hệ thống VietGAP',
    description: 'Chỉ đạo áp dụng, kiểm soát và phát triển hệ thống quản lý chất lượng VietGAP.',
    icon: <SafetyCertificateOutlined />,
    actions: [
      { label: 'Quản lý sổ HTX', path: '/htx/journals' },
      { label: 'Phê duyệt nhật ký', path: '/htx/approvals' },
    ],
  },
  {
    title: 'Nhân sự và thành viên',
    description: 'Theo dõi thành viên, phân công và kiểm soát việc thực hiện sản xuất của nông hộ.',
    icon: <TeamOutlined />,
    actions: [
      { label: 'Quản lý nông dân', path: '/htx/farmers' },
      { label: 'Phân công nhiệm vụ', path: '/htx/tasks' },
    ],
  },
  {
    title: 'Giám sát Ban kỹ thuật',
    description: 'Theo dõi hướng dẫn kỹ thuật, sâu bệnh, kiểm tra đầu ra, xử lý không phù hợp và giám sát vật tư.',
    icon: <SafetyCertificateOutlined />,
    actions: [
      { label: 'Hướng dẫn kỹ thuật', path: '/htx/technical-guidance' },
      { label: 'Kiểm tra đầu ra', path: '/htx/product-inspections' },
    ],
  },
  {
    title: 'Giám sát Ban phân phối',
    description: 'Theo dõi đơn hàng, vận chuyển, thị trường, phản hồi khách hàng và hoàn thiện sản phẩm.',
    icon: <ShoppingOutlined />,
    actions: [
      { label: 'Đơn đặt hàng', path: '/htx/distribution-orders' },
      { label: 'Vận chuyển & giao hàng', path: '/htx/distribution-shipments' },
    ],
  },
  {
    title: 'Giám sát kế toán',
    description: 'Theo dõi giao dịch tài chính, công nợ, báo cáo, nghĩa vụ thuế và khuyến nghị tài chính.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Giao dịch tài chính', path: '/htx/accounting-transactions' },
      { label: 'Báo cáo tài chính', path: '/htx/accounting-reports' },
    ],
  },
  {
    title: 'Kinh doanh và tiêu thụ',
    description: 'Theo dõi sản phẩm, lô hàng, truy xuất nguồn gốc và các nghiệp vụ liên kết tiêu thụ.',
    icon: <GlobalOutlined />,
    actions: [
      { label: 'Danh mục sản phẩm', path: '/htx/products' },
      { label: 'Quản lý lô & TXNG', path: '/htx/batches' },
    ],
  },
  {
    title: 'Tài chính và vật tư',
    description: 'Ký duyệt thu chi, nhập xuất, cấp phát vật tư và theo dõi các nghiệp vụ liên quan.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Phê duyệt vật tư', path: '/htx/supplies' },
      { label: 'Tài chính - thu chi', path: '/htx/finance' },
    ],
  },
  {
    title: 'Văn bản và đối tác',
    description: 'Xem xét hồ sơ, thủ tục, cấu hình đồng bộ và thông tin phục vụ đối tác, khách hàng.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'Đối tác & hợp đồng', path: '/htx/partners' },
      { label: 'Đào tạo & tập huấn', path: '/htx/training' },
    ],
  },
];

const HtxDirectorConsole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, farmersRes, journalsRes] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/htx/journals/farmers'),
          api.get('/htx/journals'),
        ]);
        setStats(statsRes.data?.data || {});
        setFarmers(farmersRes.data?.data || []);
        setJournals(journalsRes.data?.data || []);
      } catch (error) {
        message.error('Không thể tải dữ liệu điều hành HTX');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingJournalCount = useMemo(() => (
    journals.reduce((total, journal) => total + (journal.farmers?.filter(f => f.status === 'Chờ duyệt').length || 0), 0)
  ), [journals]);

  const quickStats = [
    {
      title: 'Nông hộ quản lý',
      value: stats?.totalFarmersCount ?? farmers.length,
      icon: <TeamOutlined />,
      color: '#16a34a',
    },
    {
      title: 'Sổ HTX',
      value: journals.length,
      icon: <FileTextOutlined />,
      color: '#2563eb',
    },
    {
      title: 'Chờ phê duyệt',
      value: pendingJournalCount,
      icon: <CheckCircleOutlined />,
      color: '#f97316',
    },
    {
      title: 'Diện tích quản lý',
      value: Math.round(Number(stats?.totalArea || 0)),
      suffix: 'm²',
      icon: <BarChartOutlined />,
      color: '#7c3aed',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Trung tâm điều hành HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <SettingOutlined className="text-green-600" /> Giám đốc HTX
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            Màn điều hành theo trách nhiệm của Giám đốc: chỉ đạo VietGAP, quản lý sản xuất, nhân sự, vật tư, đối tác, báo cáo và các nghiệp vụ cần phê duyệt.
          </Paragraph>
        </div>
        <Space wrap>
          <Button icon={<BarChartOutlined />} onClick={() => navigate('/reports')} className="rounded-xl h-10">
            Báo cáo
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => navigate('/htx/approvals')} className="rounded-xl h-10">
            Việc cần duyệt
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {quickStats.map(item => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full">
              <Skeleton loading={loading} active paragraph={false}>
                <Statistic
                  title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">{item.title}</Text>}
                  value={item.value}
                  suffix={item.suffix}
                  prefix={React.cloneElement(item.icon, { style: { color: item.color } })}
                  valueStyle={{ fontSize: 26, fontWeight: 700, color: '#111827' }}
                />
              </Skeleton>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {responsibilityGroups.map(group => (
          <Col xs={24} md={12} xl={8} key={group.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full" bodyStyle={{ padding: 20 }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg shrink-0">
                  {group.icon}
                </div>
                <div>
                  <Text strong className="text-base text-gray-900">{group.title}</Text>
                  <Paragraph className="!mb-0 mt-1 text-xs text-gray-500 leading-5">{group.description}</Paragraph>
                </div>
              </div>
              <List
                dataSource={group.actions}
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
            <Text strong className="block text-gray-900">Phạm vi quyền hạn hiện tại</Text>
            <Text className="text-gray-500 text-sm">Giám đốc HTX có quyền điều hành toàn bộ các phân hệ HTX và xem đầy đủ dữ liệu thuộc HTX.</Text>
          </div>
          <Space wrap>
            <Tag color="green">Quản lý thành viên</Tag>
            <Tag color="blue">Quản lý sổ HTX</Tag>
            <Tag color="orange">Phê duyệt</Tag>
            <Tag color="purple">Tài chính/vật tư</Tag>
            <Tag color="cyan">Truy xuất nguồn gốc</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HtxDirectorConsole;
