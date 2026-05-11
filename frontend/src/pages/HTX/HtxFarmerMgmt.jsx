import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Row, Col, Input, Button, Tag, Space, Avatar, Statistic, Tooltip, message, Badge, Select } from 'antd';
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
  HistoryOutlined
} from '@ant-design/icons';
import { Modal, List, Divider, Empty, Descriptions } from 'antd';
import api from '../../services/api';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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
        // Cập nhật lại list local
        const updatedFarmers = farmers.map(f => {
          if (f._id === selectedFarmer._id) {
            const updatedCerts = f.certifications.map(c => c._id === certId ? { ...c, status, verifiedAt: new Date() } : c);
            return { ...f, certifications: updatedCerts };
          }
          return f;
        });
        setFarmers(updatedFarmers);
        // Cập nhật nông dân đang chọn trong Modal
        const current = updatedFarmers.find(f => f._id === selectedFarmer._id);
        setSelectedFarmer(current);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi phê duyệt chứng nhận');
    } finally {
      setCertLoading(false);
    }
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
      width: 60,
      align: 'center',
      render: (_, __, index) => <Text className="text-gray-400">{(currentPage - 1) * pageSize + index + 1}</Text>
    },
    {
      title: 'NÔNG DÂN',
      key: 'farmer_info',
      render: (record) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar 
            size={40} 
            src={getAvatarUrl(record.avatar)} 
            className="border-2 border-green-50 shadow-sm"
          >
            {!record.avatar && getInitialAvatar(record.fullname || record.username)}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{record.fullname || record.username}</Text>
            <Text className="text-[11px] text-gray-400">{record.email}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'LIÊN HỆ',
      key: 'contact',
      render: (record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <PhoneOutlined className="text-xs text-green-500" />
            <Text className="text-xs">{record.phone || 'Chưa cập nhật'}</Text>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <EnvironmentOutlined className="text-xs" />
            <Text className="text-[10px] w-40 truncate" title={record.address}>{record.address || 'Chưa có địa chỉ'}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'NÔNG TRẠI',
      key: 'farm_info',
      render: (record) => (
        <div className="flex flex-col">
          <Text strong className="text-xs text-green-700">{record.farmName || 'Chưa đặt tên'}</Text>
          <div className="flex items-center gap-2 mt-1">
            <Tag color={record.farmType ? "cyan" : "default"} className="rounded-md border-0 text-[10px] uppercase font-bold">
              {record.farmType || 'Chưa cập nhật'}
            </Tag>
            {record.farmArea && (
              <span className="text-[10px] text-gray-400">
                <AreaChartOutlined className="mr-1" /> {record.farmArea.toLocaleString()} m²
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'CHỨNG NHẬN',
      dataIndex: 'certifications',
      key: 'certs',
      render: (certs, record) => (
        <Button 
          type="text" 
          size="small" 
          className="p-0 h-auto hover:bg-transparent"
          onClick={() => {
            setSelectedFarmer(record);
            setIsCertModalVisible(true);
          }}
        >
          <Space wrap size={[4, 4]}>
            {certs && certs.length > 0 ? certs.map((c, i) => {
              let color = 'default';
              if (c.status === 'Approved') color = 'success';
              if (c.status === 'Pending') color = 'warning';
              if (c.status === 'Rejected') color = 'error';
              return <Tag key={i} color={color} className="rounded-full border-0 text-[9px] font-bold px-2 m-0">{c.name || c}</Tag>;
            }) : <Text className="text-[10px] text-gray-300 italic">Chưa có</Text>}
            <Tooltip title="Quản lý chứng nhận">
               <SafetyCertificateOutlined className="text-blue-500 ml-1" />
            </Tooltip>
          </Space>
        </Button>
      )
    },
    {
      title: 'NGÀY THAM GIA',
      dataIndex: 'createdAt',
      key: 'join_date',
      render: (date) => (
        <div className="flex flex-col">
          <Text className="text-xs text-gray-600">{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text className="text-[10px] text-gray-400 italic">{dayjs(date).fromNow()}</Text>
        </div>
      )
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'center',
      render: () => <Tag color="green" icon={<CheckCircleOutlined />} className="rounded-full px-3">Đang hoạt động</Tag>
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button 
              size="small" 
              icon={<UserOutlined />} 
              onClick={() => {
                setSelectedFarmer(record);
                setIsProfileModalVisible(true);
              }}
              className="rounded-lg text-green-600 border-green-100 bg-green-50 hover:bg-green-100"
            />
          </Tooltip>
          <Tooltip title="Lịch sử nhật ký">
            <Button 
              size="small" 
              icon={<HistoryOutlined />} 
              onClick={() => {
                setSelectedFarmer(record);
                setIsHistoryModalVisible(true);
              }}
              className="rounded-lg text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100"
            />
          </Tooltip>
          <Tooltip title="Gán vào sổ mới">
            <Button 
              size="small" 
              type="primary"
              icon={<DeploymentUnitOutlined />} 
              onClick={() => {
                // Điều hướng sang trang quản lý sổ với ID nông dân được chọn
                message.info('Tính năng gán nhanh đang được phát triển...');
              }}
              className="rounded-lg bg-orange-500 border-0 shadow-sm"
            />
          </Tooltip>
          <Tooltip title="Gỡ khỏi HTX">
            <Button 
              size="small" 
              danger
              icon={<CloseCircleOutlined />} 
              onClick={() => handleDeleteFarmer(record)}
              className="rounded-lg"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleDeleteFarmer = (farmer) => {
    Modal.confirm({
      title: 'Xác nhận gỡ nông dân',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: `Bạn có chắc muốn gỡ nông dân "${farmer.fullname || farmer.username}" khỏi HTX? Họ sẽ không còn xuất hiện trong các sổ nhật ký của HTX này.`,
      okText: 'Gỡ ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      maskClosable: true,
      onOk: async () => {
        try {
          const res = await api.delete(`/htx/journals/farmers/${farmer._id}`);
          if (res.data.success) {
            message.success('Đã gỡ nông dân khỏi HTX');
            fetchFarmers(); // Load lại danh sách
          }
        } catch (error) {
          message.error(error.response?.data?.message || 'Lỗi khi gỡ nông dân');
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
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
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchFarmers}
          className="rounded-xl border-gray-200"
        >
          Làm mới
        </Button>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-600 to-green-700">
            <Statistic 
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số thành viên</Text>}
              value={farmers.length} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic 
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Quy mô trồng trọt</Text>}
              value={farmers.filter(f => f.farmType === 'Trồng trọt').length} 
              prefix={<DeploymentUnitOutlined className="text-green-500" />} 
              valueStyle={{ color: '#22c55e', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic 
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Tổng diện tích (m²)</Text>}
              value={farmers.reduce((acc, curr) => acc + (curr.farmArea || 0), 0)} 
              prefix={<AreaChartOutlined className="text-blue-500" />} 
              valueStyle={{ color: '#3b82f6', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm theo tên, email, SĐT..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full sm:w-80 h-10 rounded-xl"
              allowClear
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Tất cả loại hình"
              prefix={<FilterOutlined className="text-gray-400" />}
              className="w-48 h-10 premium-select"
              allowClear
              onChange={val => setFarmTypeFilter(val)}
              options={[
                { value: 'Trồng trọt', label: 'Trồng trọt' },
                { value: 'Chăn nuôi', label: 'Chăn nuôi' },
                { value: 'Thủy sản', label: 'Thủy sản' },
                { value: 'Hỗn hợp', label: 'Hỗn hợp' },
                { value: 'none', label: <Text type="secondary" italic>Chưa cập nhật</Text> },
              ]}
            />
            <Select
              placeholder="Tất cả trạng thái"
              className="w-48 h-10 premium-select"
              allowClear
              onChange={val => setStatusFilter(val)}
              options={[
                { value: 'Active', label: <Tag color="green" className="m-0 border-0">Đang hoạt động</Tag> },
                { value: 'Inactive', label: <Tag color="red" className="m-0 border-0">Ngừng hoạt động</Tag> },
              ]}
            />
          </Space>
          <Text className="text-gray-400 text-xs italic self-center">
            Đang hiển thị <Text strong className="text-green-600">{filteredFarmers.length}</Text> trên tổng số {farmers.length} hộ
          </Text>
        </div>
      </Card>

      {/* Table Section */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={filteredFarmers} 
          rowKey="_id"
          loading={loading}
          className="premium-table-refined custom-pagination"
          scroll={{ x: 1000 }}
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' },
            className: "pb-4 px-4 pt-4"
          }}
        />
      </Card>

      {/* Certification Management Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-gold-500" />
            <Text strong>Quản Lý Chứng Nhận: {selectedFarmer?.fullname || selectedFarmer?.username}</Text>
          </div>
        }
        open={isCertModalVisible}
        onCancel={() => setIsCertModalVisible(false)}
        footer={null}
        width={700}
        centered
        className="premium-modal"
      >
        <div className="py-4">
          <List
            dataSource={selectedFarmer?.certifications || []}
            locale={{ emptyText: <Empty description="Nông dân chưa tải lên chứng nhận nào" /> }}
            renderItem={(cert) => (
              <List.Item
                className="bg-gray-50/50 p-4 rounded-2xl mb-3 border border-gray-100"
                actions={[
                  cert.status === 'Pending' && (
                    <Space>
                      <Button 
                        size="small" 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        className="bg-green-600 border-0 rounded-lg"
                        onClick={() => handleVerifyCert(cert._id, 'Approved')}
                        loading={certLoading}
                      >
                        Duyệt
                      </Button>
                      <Button 
                        size="small" 
                        danger 
                        icon={<CloseCircleOutlined />}
                        className="rounded-lg"
                        onClick={() => handleVerifyCert(cert._id, 'Rejected')}
                        loading={certLoading}
                      >
                        Từ chối
                      </Button>
                    </Space>
                  ),
                  cert.status === 'Approved' && <Tag color="success" className="rounded-full border-0 font-bold uppercase text-[10px]">Đã duyệt</Tag>,
                  cert.status === 'Rejected' && <Tag color="error" className="rounded-full border-0 font-bold uppercase text-[10px]">Đã từ chối</Tag>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                      <span className="text-2xl">📜</span>
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <Text strong className="text-gray-800 text-base">{cert.name}</Text>
                      {cert.code && <Tag color="blue" className="m-0 font-mono text-[10px]">{cert.code}</Tag>}
                    </div>
                  }
                  description={
                    <div className="space-y-1 mt-1">
                      <div className="flex gap-4">
                        <Text type="secondary" className="text-xs">
                          <ClockCircleOutlined className="mr-1" />
                          Hạn dùng: {cert.expiryDate ? dayjs(cert.expiryDate).format('DD/MM/YYYY') : '---'}
                        </Text>
                        {cert.fileUrl && (
                          <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs flex items-center hover:underline">
                            <EyeOutlined className="mr-1" /> Xem tệp đính kèm
                          </a>
                        )}
                      </div>
                      {cert.verifiedAt && (
                        <Text type="secondary" className="text-[10px] italic block">
                          Đã xác minh vào {dayjs(cert.verifiedAt).format('HH:mm - DD/MM/YYYY')}
                        </Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/* Profile Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-green-600" />
            <Text strong>Hồ Sơ Chi Tiết Nông Dân</Text>
          </div>
        }
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsProfileModalVisible(false)} className="rounded-lg">Đóng</Button>
        ]}
        width={800}
        centered
        className="premium-modal"
      >
        {selectedFarmer && (
          <div className="py-4">
            <div className="flex items-center gap-6 mb-8 bg-green-50/50 p-6 rounded-3xl border border-green-100">
              <Avatar size={100} src={getAvatarUrl(selectedFarmer.avatar)} className="border-4 border-white shadow-md">
                {!selectedFarmer.avatar && getInitialAvatar(selectedFarmer.fullname || selectedFarmer.username)}
              </Avatar>
              <div className="flex flex-col gap-1">
                <Title level={3} className="!mb-0">{selectedFarmer.fullname || selectedFarmer.username}</Title>
                <Space>
                   <Tag color="green" className="rounded-full border-0 font-bold">NÔNG DÂN HTX</Tag>
                   <Text type="secondary" className="text-xs">ID: {selectedFarmer._id}</Text>
                </Space>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <ClockCircleOutlined /> Tham gia từ: {dayjs(selectedFarmer.createdAt).format('DD/MM/YYYY')}
                   </div>
                   <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <DeploymentUnitOutlined /> Loại hình: {selectedFarmer.farmType || 'Chưa cập nhật'}
                   </div>
                </div>
              </div>
            </div>

            <Descriptions bordered column={2} className="premium-descriptions" size="middle">
              <Descriptions.Item label={<Space><PhoneOutlined className="text-green-500"/>Số điện thoại</Space>} span={1}>
                <Text strong>{selectedFarmer.phone || 'Chưa cập nhật'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Space><EnvironmentOutlined className="text-blue-500"/>Email</Space>} span={1}>
                {selectedFarmer.email}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><HomeOutlined className="text-orange-500"/>Địa chỉ</Space>} span={2}>
                {selectedFarmer.address || 'Chưa có địa chỉ'}
              </Descriptions.Item>
              
              <Descriptions.Item label={<Space><BoxPlotOutlined className="text-purple-500"/>Tên nông trại</Space>} span={1}>
                <Text strong className="text-green-700">{selectedFarmer.farmName || 'Chưa đặt tên'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Space><AreaChartOutlined className="text-pink-500"/>Diện tích</Space>} span={1}>
                <Text strong>{selectedFarmer.farmArea?.toLocaleString() || 0} m²</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label={<Space><SafetyCertificateOutlined className="text-gold-500"/>Số chứng nhận</Space>} span={2}>
                <Space wrap>
                   {selectedFarmer.certifications?.length > 0 ? selectedFarmer.certifications.map((c, i) => (
                     <Tag key={i} color={c.status === 'Approved' ? 'success' : 'default'} className="rounded-full border-0 px-3">
                        {c.name} {c.code && `(${c.code})`}
                     </Tag>
                   )) : <Text italic type="secondary" className="text-xs">Chưa có chứng nhận nào</Text>}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* History Modal (Placeholder) */}
      <Modal
        title="Lịch Sử Sản Xuất"
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <div className="py-8 flex flex-col items-center justify-center text-center">
           <HistoryOutlined className="text-5xl text-gray-200 mb-4" />
           <Text className="text-gray-400">Tính năng đang được tổng hợp dữ liệu từ các sổ nhật ký...</Text>
        </div>
      </Modal>
    </div>
  );
};

export default HtxFarmerMgmt;

