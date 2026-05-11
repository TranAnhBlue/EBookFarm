import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Row, Col, Input, Button, Tag, Space, Avatar, Statistic, Tooltip, message, Badge, Select, Modal, List, Divider, Empty, Descriptions } from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  EnvironmentOutlined,
  AreaChartOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  TeamOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  BoxPlotOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const HtxFarmerMgmt = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [farmTypeFilter, setFarmTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCertModalVisible, setIsCertModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx/journals/farmers');
      if (res.data.success) {
        setFarmers(res.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách nông dân');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCert = async (certId, status, feedback = '') => {
    try {
      setCertLoading(true);
      const res = await api.put(`/users/${selectedFarmer._id}/certifications/${certId}/verify`, { status, feedback });
      if (res.data.success) {
        message.success(res.data.message);
        const updatedFarmers = farmers.map(f => {
          if (f._id === selectedFarmer._id) {
            const updatedCerts = f.certifications.map(c => c._id === certId ? { ...c, status, verifiedAt: new Date() } : c);
            return { ...f, certifications: updatedCerts };
          }
          return f;
        });
        setFarmers(updatedFarmers);
        const current = updatedFarmers.find(f => f._id === selectedFarmer._id);
        setSelectedFarmer(current);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi phê duyệt chứng nhận');
    } finally {
      setCertLoading(false);
    }
  };

  const handleDeleteFarmer = (farmer) => {
    Modal.confirm({
      title: 'Xác nhận gỡ nông dân',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: `Bạn có chắc muốn gỡ nông dân "${farmer.fullname || farmer.username}" khỏi HTX? Họ sẽ không còn xuất hiện trong các sổ nhật ký của HTX này.`,
      okText: 'Gỡ ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          const res = await api.delete(`/htx/journals/farmers/${farmer._id}`);
          if (res.data.success) {
            message.success('Đã gỡ nông dân khỏi HTX');
            fetchFarmers();
          }
        } catch (error) {
          message.error(error.response?.data?.message || 'Lỗi khi gỡ nông dân');
        }
      }
    });
  };

  const filteredFarmers = farmers.filter(f => {
    const searchVal = searchText.toLowerCase();
    const nameMatch = (f.fullname || f.username || '').toLowerCase().includes(searchVal);
    const emailMatch = (f.email || '').toLowerCase().includes(searchVal);
    const phoneMatch = (f.phone || '').includes(searchVal);
    const farmTypeMatch = farmTypeFilter 
      ? (farmTypeFilter === 'none' ? !f.farmType : f.farmType === farmTypeFilter)
      : true;
    const statusMatch = statusFilter ? f.status === statusFilter : true;
    return (nameMatch || emailMatch || phoneMatch) && farmTypeMatch && statusMatch;
  });

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => <Text className="text-gray-400 text-[11px]">{(currentPage - 1) * pageSize + index + 1}</Text>
    },
    {
      title: 'NÔNG DÂN',
      key: 'farmer_info',
      width: 180,
      render: (record) => (
        <div className="flex items-center gap-2 py-1">
          <Avatar size={32} src={getAvatarUrl(record.avatar)} className="border shadow-sm shrink-0">
            {!record.avatar && getInitialAvatar(record.fullname || record.username)}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <Text strong className="text-gray-800 text-[12px] truncate">{record.fullname || record.username}</Text>
            <Text className="text-[10px] text-gray-400 truncate">{record.email}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'LIÊN HỆ',
      key: 'contact',
      width: 150,
      render: (record) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-gray-600">
            <PhoneOutlined style={{ fontSize: '10px' }} className="text-green-500" />
            <Text className="text-[11px]">{record.phone || '---'}</Text>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <EnvironmentOutlined style={{ fontSize: '10px' }} />
            <Text className="text-[10px] w-28 truncate" title={record.address}>{record.address || '---'}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'NÔNG TRẠI',
      key: 'farm_info',
      width: 160,
      render: (record) => (
        <div className="flex flex-col">
          <Text strong className="text-[11px] text-green-700 truncate w-28">{record.farmName || 'Chưa đặt tên'}</Text>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Tag color={record.farmType ? "cyan" : "default"} className="rounded-md border-0 text-[9px] uppercase font-bold m-0 px-1">
              {record.farmType || 'N/A'}
            </Tag>
            <span className="text-[9px] text-gray-400 whitespace-nowrap">
              {record.farmArea?.toLocaleString() || 0} m²
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'CC',
      dataIndex: 'certifications',
      key: 'certs',
      width: 60,
      align: 'center',
      render: (certs, record) => (
        <Button type="text" size="small" className="p-0 h-auto flex items-center justify-center w-full"
          onClick={() => { setSelectedFarmer(record); setIsCertModalVisible(true); }}
        >
          <Badge count={certs?.length || 0} size="small" className="premium-badge">
             <SafetyCertificateOutlined className="text-blue-500 text-lg" />
          </Badge>
        </Button>
      )
    },
    {
      title: 'THAM GIA',
      dataIndex: 'createdAt',
      key: 'join_date',
      width: 90,
      render: (date) => (
        <div className="flex flex-col">
          <Text className="text-[10px] text-gray-600">{dayjs(date).format('DD/MM/YY')}</Text>
          <Text className="text-[9px] text-gray-400 italic">{dayjs(date).fromNow()}</Text>
        </div>
      )
    },
    {
      title: 'T.THÁI',
      key: 'status',
      align: 'center',
      width: 80,
      render: () => <Tag color="green" className="rounded-full border-0 text-[9px] px-2 m-0">Active</Tag>
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Hồ sơ">
            <Button size="small" icon={<UserOutlined style={{ fontSize: '11px' }} />} onClick={() => { setSelectedFarmer(record); setIsProfileModalVisible(true); }}
              className="rounded-lg text-green-600 border-green-100 bg-green-50 hover:bg-green-100 w-7 h-7 flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="Lịch sử">
            <Button size="small" icon={<HistoryOutlined style={{ fontSize: '11px' }} />} onClick={() => { setSelectedFarmer(record); setIsHistoryModalVisible(true); }}
              className="rounded-lg text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 w-7 h-7 flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="Gán sổ">
            <Button size="small" type="primary" icon={<DeploymentUnitOutlined style={{ fontSize: '11px' }} />} onClick={() => message.info('Tính năng gán nhanh đang phát triển...')}
              className="rounded-lg bg-orange-500 border-0 shadow-sm w-7 h-7 flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="Gỡ">
            <Button size="small" danger icon={<CloseCircleOutlined style={{ fontSize: '11px' }} />} onClick={() => handleDeleteFarmer(record)}
              className="rounded-lg w-7 h-7 flex items-center justify-center"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <HomeOutlined />
            <span>Quản lý HTX</span>
            <span className="text-gray-200">/</span>
            <span className="text-green-600">Danh sách nông dân</span>
          </div>
          <Title level={4} className="!mb-0">Quản Lý Thành Viên Nông Dân</Title>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchFarmers} className="rounded-xl border-gray-200">Làm mới</Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-600 to-green-700">
            <Statistic title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số thành viên</Text>} value={farmers.length} prefix={<TeamOutlined />} valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic title={<Text className="text-gray-400 uppercase text-xs font-bold">Quy mô trồng trọt</Text>} value={farmers.filter(f => f.farmType === 'Trồng trọt').length} prefix={<DeploymentUnitOutlined className="text-green-500" />} valueStyle={{ color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic title={<Text className="text-gray-400 uppercase text-xs font-bold">Tổng diện tích (m²)</Text>} value={farmers.reduce((acc, curr) => acc + (curr.farmArea || 0), 0)} prefix={<AreaChartOutlined className="text-blue-500" />} valueStyle={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '12px' }}>
        <Space size="middle" wrap>
          <Input placeholder="Tìm tên, SĐT..." prefix={<SearchOutlined className="text-gray-400" />} className="w-64 h-9 rounded-xl" allowClear onChange={e => setSearchText(e.target.value)} />
          <Select placeholder="Loại hình" allowClear onChange={setFarmTypeFilter} className="w-32 h-9 premium-select" options={[{ value: 'Trồng trọt', label: 'Trồng trọt' }, { value: 'Chăn nuôi', label: 'Chăn nuôi' }, { value: 'none', label: 'Khác' }]} />
          <Select placeholder="Trạng thái" allowClear onChange={setStatusFilter} className="w-32 h-9 premium-select" options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={filteredFarmers} rowKey="_id" loading={loading} className="premium-table-refined" scroll={{ x: 900 }} pagination={{ current: currentPage, pageSize: pageSize, onChange: (p, s) => { setCurrentPage(p); setPageSize(s); }, showSizeChanger: true, locale: { items_per_page: '/ trang' } }} />
      </Card>

      {/* Certification Modal */}
      <Modal title={<Space><SafetyCertificateOutlined className="text-gold-500" /><Text strong>Chứng Nhận: {selectedFarmer?.fullname}</Text></Space>} open={isCertModalVisible} onCancel={() => setIsCertModalVisible(false)} footer={null} width={600} centered>
        <div className="py-4">
          <List dataSource={selectedFarmer?.certifications || []} renderItem={(cert) => (
            <List.Item className="bg-gray-50 p-3 rounded-xl mb-2 border border-gray-100">
              <List.Item.Meta title={<Text strong>{cert.name}</Text>} description={<Text className="text-[11px] text-gray-500">Hạn: {cert.expiryDate ? dayjs(cert.expiryDate).format('DD/MM/YYYY') : '---'}</Text>} />
              <Tag color={cert.status === 'Approved' ? 'success' : 'warning'}>{cert.status}</Tag>
            </List.Item>
          )} />
        </div>
      </Modal>

      {/* Profile Detail Modal */}
      <Modal title={<Space><UserOutlined className="text-green-600" /><Text strong>Hồ Sơ Chi Tiết</Text></Space>} open={isProfileModalVisible} onCancel={() => setIsProfileModalVisible(false)} footer={<Button onClick={() => setIsProfileModalVisible(false)}>Đóng</Button>} width={700} centered>
        {selectedFarmer && (
          <div className="py-4">
            <Descriptions bordered column={2} size="small" className="premium-descriptions">
              <Descriptions.Item label="Họ tên" span={2}><Text strong>{selectedFarmer.fullname || selectedFarmer.username}</Text></Descriptions.Item>
              <Descriptions.Item label="Điện thoại">{selectedFarmer.phone || '---'}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedFarmer.email}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selectedFarmer.address || '---'}</Descriptions.Item>
              <Descriptions.Item label="Trang trại">{selectedFarmer.farmName || '---'}</Descriptions.Item>
              <Descriptions.Item label="Diện tích">{selectedFarmer.farmArea?.toLocaleString()} m²</Descriptions.Item>
              <Descriptions.Item label="Loại hình">{selectedFarmer.farmType}</Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">{dayjs(selectedFarmer.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal title="Lịch Sử Sản Xuất" open={isHistoryModalVisible} onCancel={() => setIsHistoryModalVisible(false)} footer={null} width={500} centered>
        <div className="py-10 text-center text-gray-400 italic"><HistoryOutlined className="text-4xl mb-3 block mx-auto text-gray-200" />Đang tổng hợp dữ liệu...</div>
      </Modal>
    </div>
  );
};

export default HtxFarmerMgmt;
