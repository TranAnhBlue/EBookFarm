import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Space, Tag, List, message, Skeleton, Alert } from 'antd';
import {
  BugOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const technicalDuties = [
  {
    title: 'Kỹ thuật trồng trọt',
    description: 'Theo dõi việc áp dụng kỹ thuật sản xuất, biểu mẫu VietGAP và tiến độ ghi chép của các nông hộ.',
    icon: <ExperimentOutlined />,
    actions: [
      { label: 'Hướng dẫn kỹ thuật', path: '/htx/technical-guidance' },
      { label: 'Đề xuất kỹ thuật', path: '/htx/technical-proposals' },
      { label: 'Quản lý sổ HTX', path: '/htx/journals' },
    ],
  },
  {
    title: 'Phòng trừ sâu bệnh',
    description: 'Kiểm tra nhật ký canh tác, phát hiện bất thường và yêu cầu nông hộ chỉnh sửa khi có dấu hiệu không phù hợp.',
    icon: <BugOutlined />,
    actions: [
      { label: 'Sâu bệnh & xử lý', path: '/htx/pest-control' },
      { label: 'Việc chờ thẩm định', path: '/htx/approvals' },
    ],
  },
  {
    title: 'Hướng dẫn vật tư, thuốc BVTV',
    description: 'Giám sát tồn kho, sắp xếp, bảo quản và việc sử dụng phân bón, thuốc BVTV của xã viên.',
    icon: <MedicineBoxOutlined />,
    actions: [
      { label: 'Giám sát vật tư', path: '/htx/material-supervision' },
      { label: 'Kho vật tư tập trung', path: '/inventory' },
    ],
  },
  {
    title: 'Kiểm tra sản phẩm đầu ra',
    description: 'Theo dõi sản phẩm, lô hàng, truy xuất nguồn gốc và dấu hiệu ảnh hưởng đến an toàn thực phẩm.',
    icon: <SafetyCertificateOutlined />,
    actions: [
      { label: 'Kiểm tra đầu ra', path: '/htx/product-inspections' },
      { label: 'Quản lý lô & TXNG', path: '/htx/batches' },
    ],
  },
  {
    title: 'Xử lý không phù hợp',
    description: 'Chủ động xử lý tình huống cấp bách liên quan sản phẩm sai lỗi hoặc nhật ký không đạt trước khi báo cáo lãnh đạo.',
    icon: <ToolOutlined />,
    actions: [
      { label: 'Không phù hợp', path: '/htx/nonconformities' },
      { label: 'Báo cáo & thống kê', path: '/reports' },
    ],
  },
  {
    title: 'Đào tạo xã viên',
    description: 'Theo dõi hồ sơ, chứng nhận và nhu cầu hướng dẫn lại cho các thành viên VietGAP.',
    icon: <TeamOutlined />,
    actions: [
      { label: 'Hồ sơ nông dân', path: '/htx/farmers' },
      { label: 'Đào tạo xã viên', path: '/htx/technical-training' },
    ],
  },
  {
    title: 'Báo cáo kỹ thuật',
    description: 'Tổng hợp tình hình kỹ thuật, nhật ký, sâu bệnh, đầu ra và vật tư để báo cáo Giám đốc HTX.',
    icon: <FileSearchOutlined />,
    actions: [
      { label: 'Báo cáo kỹ thuật', path: '/htx/technical-reports' },
      { label: 'Báo cáo & thống kê', path: '/reports' },
    ],
  },
];

const HtxTechnicalConsole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, farmersRes, journalsRes, productsRes, batchesRes] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/htx/journals/farmers'),
          api.get('/htx/journals'),
          api.get('/products'),
          api.get('/batches'),
        ]);
        setStats(statsRes.data?.data || {});
        setFarmers(farmersRes.data?.data || []);
        setJournals(journalsRes.data?.data || []);
        setProducts(productsRes.data?.data || []);
        setBatches(batchesRes.data?.data || []);
      } catch (error) {
        message.error('Không thể tải dữ liệu kỹ thuật HTX');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingJournalCount = useMemo(() => (
    journals.reduce((total, journal) => total + (journal.farmers?.filter(f => f.status === 'Chờ duyệt').length || 0), 0)
  ), [journals]);

  const activeJournalCount = useMemo(() => journals.filter(journal => journal.status === 'Active').length, [journals]);

  const summaryItems = [
    {
      title: 'Nông hộ cần theo dõi',
      value: stats?.totalFarmersCount ?? farmers.length,
      icon: <TeamOutlined />,
      color: '#16a34a',
    },
    {
      title: 'Sổ đang hoạt động',
      value: activeJournalCount,
      icon: <FileTextOutlined />,
      color: '#2563eb',
    },
    {
      title: 'Nhật ký chờ kiểm tra',
      value: pendingJournalCount,
      icon: <CheckCircleOutlined />,
      color: '#f97316',
    },
    {
      title: 'Lô/sản phẩm cần giám sát',
      value: products.length + batches.length,
      icon: <FileSearchOutlined />,
      color: '#7c3aed',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Trung tâm kỹ thuật HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <ExperimentOutlined className="text-green-600" /> Ban kỹ thuật
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            Màn nghiệp vụ cho Ban kỹ thuật: theo dõi kỹ thuật trồng trọt, phòng trừ sâu bệnh, hướng dẫn vật tư/thuốc BVTV, kiểm tra sản phẩm đầu ra và xử lý điểm không phù hợp.
          </Paragraph>
        </div>
        <Space wrap>
          <Button icon={<TeamOutlined />} onClick={() => navigate('/htx/farmers')} className="rounded-xl h-10">
            Nông dân
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => navigate('/htx/approvals')} className="rounded-xl h-10">
            Kiểm tra nhật ký
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        className="rounded-2xl border-blue-100"
        message="Phạm vi Ban kỹ thuật"
        description="Được quyền quản lý/phê duyệt sổ kỹ thuật, quản lý thành viên trong phạm vi kỹ thuật, xem sản phẩm/lô để kiểm tra đầu ra và giám sát kho vật tư. Không có quyền phê duyệt vật tư hay cấu hình Cổng QG."
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
        {technicalDuties.map(duty => (
          <Col xs={24} md={12} xl={8} key={duty.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full" bodyStyle={{ padding: 20 }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
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
            <Text strong className="block text-gray-900">Quyền hạn kỹ thuật đã áp vào hệ thống</Text>
            <Text className="text-gray-500 text-sm">Ban kỹ thuật được thao tác trên nhật ký kỹ thuật và hồ sơ thành viên; các phân hệ kinh doanh/vật tư chỉ mở đúng phần cần giám sát kỹ thuật.</Text>
          </div>
          <Space wrap>
            <Tag color="green">Kỹ thuật VietGAP</Tag>
            <Tag color="orange">Phòng trừ sâu bệnh</Tag>
            <Tag color="blue">Kiểm tra nhật ký</Tag>
            <Tag color="purple">Giám sát đầu ra</Tag>
            <Tag color="cyan">Theo dõi vật tư</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HtxTechnicalConsole;
