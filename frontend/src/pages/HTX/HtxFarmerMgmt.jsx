import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Row, Col, Input, Button, Tag, Space, Avatar, Statistic, Tooltip, message, Badge } from 'antd';
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
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const HtxFarmerMgmt = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [farmTypeFilter, setFarmTypeFilter] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx-journals/farmers');
      if (res.data.success) {
        setFarmers(res.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách nông dân');
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => {
    const searchVal = searchText.toLowerCase();
    const nameMatch = (f.fullname || f.username || '').toLowerCase().includes(searchVal);
    const emailMatch = (f.email || '').toLowerCase().includes(searchVal);
    const phoneMatch = (f.phone || '').includes(searchVal);
    const farmTypeMatch = farmTypeFilter ? f.farmType === farmTypeFilter : true;
    return (nameMatch || emailMatch || phoneMatch) && farmTypeMatch;
  });

  const columns = [
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
            <Tag color="cyan" className="rounded-md border-0 text-[10px] uppercase font-bold">{record.farmType || 'N/A'}</Tag>
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
      render: (certs) => (
        <Space wrap size={[4, 4]}>
          {certs && certs.length > 0 ? certs.map(c => (
            <Tag key={c} color="success" className="rounded-full border-0 text-[9px] font-bold px-2">{c}</Tag>
          )) : <Text className="text-[10px] text-gray-300 italic">Chưa có</Text>}
        </Space>
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
    }
  ];

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
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-1 rounded-xl border border-gray-100">
               <FilterOutlined className="text-gray-400" />
               <select 
                 className="bg-transparent border-0 text-sm font-medium focus:outline-none py-1"
                 onChange={e => setFarmTypeFilter(e.target.value || null)}
               >
                 <option value="">Tất cả loại hình</option>
                 <option value="Trồng trọt">Trồng trọt</option>
                 <option value="Chăn nuôi">Chăn nuôi</option>
                 <option value="Thủy sản">Thủy sản</option>
                 <option value="Hỗn hợp">Hỗn hợp</option>
               </select>
            </div>
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
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' },
            className: "pb-4 px-4 pt-4"
          }}
        />
      </Card>
    </div>
  );
};

export default HtxFarmerMgmt;
