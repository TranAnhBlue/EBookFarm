import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Breadcrumb, Badge, Avatar, Select, DatePicker, Modal, Descriptions, Image, message, Statistic, Row, Col } from 'antd';
import { 
  HomeOutlined, 
  SearchOutlined, 
  FileDoneOutlined, 
  QrcodeOutlined,
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminJournalMgmt = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  // Fetch All Journals
  const { data: journals, isLoading } = useQuery({
    queryKey: ['admin-journals'],
    queryFn: () => api.get('/journals').then(res => res.data.data)
  });

  // Filter journals
  const filteredJournals = journals?.filter(journal => {
    // Search filter
    const searchLower = searchText.toLowerCase();
    const matchSearch = !searchText || 
      journal.userId?.username?.toLowerCase().includes(searchLower) ||
      journal.userId?.fullname?.toLowerCase().includes(searchLower) ||
      journal.qrCode?.toLowerCase().includes(searchLower) ||
      journal.schemaId?.name?.toLowerCase().includes(searchLower);

    // Status filter
    let matchStatus = true;
    if (statusFilter === 'completed') {
      matchStatus = journal.status === 'Completed';
    } else if (statusFilter === 'inprogress') {
      matchStatus = journal.status !== 'Completed';
    }
    // 'all' matches everything

    // Date range filter
    const matchDate = !dateRange || (
      dayjs(journal.createdAt).isAfter(dateRange[0]) &&
      dayjs(journal.createdAt).isBefore(dateRange[1])
    );

    return matchSearch && matchStatus && matchDate;
  });

  const handleViewDetail = (record) => {
    setSelectedJournal(record);
    setIsDetailModalVisible(true);
  };

  const handleViewQR = (record) => {
    setSelectedJournal(record);
    setIsQRModalVisible(true);
  };

  const handleDownloadQR = () => {
    if (!selectedJournal) return;
    
    // Create QR code URL - Dùng biến môi trường
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${baseUrl}/trace/${selectedJournal.qrCode}`;
    
    // Download
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${selectedJournal.qrCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Đã tải QR Code!');
  };

  const stats = {
    total: journals?.length || 0,
    inProgress: journals?.filter(j => j.status !== 'Completed').length || 0,
    completed: journals?.filter(j => j.status === 'Completed').length || 0,
    thisMonth: journals?.filter(j => dayjs(j.createdAt).isAfter(dayjs().startOf('month'))).length || 0
  };

  const columns = [
    {
      title: 'Thông tin nhật ký',
      key: 'journal',
      width: 250,
      render: (record) => (
        <Space direction="vertical" size={2}>
          <Text strong className="text-base text-gray-900">{record.schemaId?.name || 'Chưa đặt tên'}</Text>
          <Text className="text-xs text-gray-500">
            <FileTextOutlined className="mr-1" />
            Mã: {record.qrCode?.substring(0, 12)}...
          </Text>
          <Text className="text-xs text-gray-400">
            Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </Space>
      )
    },
    {
      title: 'Chủ sở hữu',
      key: 'user',
      width: 200,
      render: (record) => (
        <Space>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            className="bg-green-50 text-green-600"
            src={record.userId?.avatar ? `http://localhost:5000${record.userId.avatar}` : null}
          />
          <Space direction="vertical" size={0}>
            <Text className="text-sm font-medium text-gray-900">{record.userId?.fullname || record.userId?.username || 'N/A'}</Text>
            <Text className="text-xs text-gray-500">@{record.userId?.username}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => (
        <Tag 
          color={status === 'Completed' ? 'green' : 'orange'} 
          className="rounded-full px-4 py-1 font-medium"
          icon={status === 'Completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {status === 'Completed' ? 'Hoàn thành' : 'Đang thực hiện'}
        </Tag>
      ),
      filters: [
        { text: 'Đang thực hiện', value: 'In Progress' },
        { text: 'Hoàn thành', value: 'Completed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text className="text-sm text-gray-700">{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text className="text-xs text-gray-500">{dayjs(date).format('HH:mm')}</Text>
          <Text className="text-xs text-blue-600">{dayjs(date).fromNow()}</Text>
        </Space>
      ),
      sorter: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (record) => (
        <Space direction="vertical" size="small" className="w-full">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewDetail(record)}
            block
            className="rounded-lg"
          >
            Chi tiết
          </Button>
          <Button 
            icon={<QrcodeOutlined />} 
            size="small" 
            type="primary" 
            onClick={() => handleViewQR(record)}
            block
            className="rounded-lg bg-green-600 border-0"
          >
            QR Code
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Quản lý</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Giám sát nhật ký</span>
        </div>
        <Title level={4} className="!mb-0">Giám sát Nhật ký Sản xuất</Title>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số nhật ký</Text>}
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix={<Badge status="processing" color="white" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              prefix={<CalendarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <Space size="middle" wrap className="w-full">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Tìm theo tên, người dùng, mã QR..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-80 h-10 rounded-xl"
            allowClear
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48 h-10"
            placeholder="Lọc theo trạng thái"
          >
            <Option value="all">
              <Space>
                <FilterOutlined />
                <span>Tất cả trạng thái</span>
              </Space>
            </Option>
            <Option value="inprogress">
              <Space>
                <ClockCircleOutlined className="text-orange-500" />
                <span>Đang thực hiện</span>
              </Space>
            </Option>
            <Option value="completed">
              <Space>
                <CheckCircleOutlined className="text-green-500" />
                <span>Hoàn thành</span>
              </Space>
            </Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            className="h-10 rounded-xl"
          />

          {(searchText || statusFilter !== 'all' || dateRange) && (
            <Button
              onClick={() => {
                setSearchText('');
                setStatusFilter('all');
                setDateRange(null);
              }}
              className="h-10 rounded-xl"
            >
              Xóa bộ lọc
            </Button>
          )}

          <Text className="text-sm text-gray-500 ml-auto">
            Hiển thị <Text strong className="text-green-600">{filteredJournals?.length || 0}</Text> / {stats.total} nhật ký
          </Text>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredJournals} 
          loading={isLoading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhật ký`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          rowKey="_id"
          scroll={{ x: 1200 }}
          rowClassName={(record) => {
            if (record.status === 'Completed') return 'bg-green-50';
            return '';
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<Text strong className="text-lg">Chi tiết nhật ký sản xuất</Text>}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedJournal && (
          <div className="space-y-6">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Tên nhật ký" span={2}>
                <Text strong>{selectedJournal.schemaId?.name || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã QR">
                <Text copyable className="text-blue-600">{selectedJournal.qrCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedJournal.status === 'Completed' ? 'green' : 'orange'}>
                  {selectedJournal.status === 'Completed' ? 'Hoàn thành' : 'Đang thực hiện'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chủ sở hữu">
                {selectedJournal.userId?.fullname || selectedJournal.userId?.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedJournal.userId?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedJournal.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                {dayjs(selectedJournal.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {selectedJournal.data && Object.keys(selectedJournal.data).length > 0 && (
              <div>
                <Text strong className="block mb-3">Dữ liệu nhật ký:</Text>
                <Card className="bg-gray-50">
                  <pre className="text-xs overflow-auto max-h-96">
                    {JSON.stringify(selectedJournal.data, null, 2)}
                  </pre>
                </Card>
              </div>
            )}

            <Space className="w-full justify-end">
              <Button onClick={() => setIsDetailModalVisible(false)}>
                Đóng
              </Button>
              <Button 
                type="primary" 
                icon={<QrcodeOutlined />}
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleViewQR(selectedJournal);
                }}
                className="bg-green-600"
              >
                Xem QR Code
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={<Text strong className="text-lg">QR Code Truy xuất nguồn gốc</Text>}
        open={isQRModalVisible}
        onCancel={() => setIsQRModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedJournal && (
          <div className="space-y-6 text-center">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${import.meta.env.VITE_APP_URL || window.location.origin}/trace/${selectedJournal.qrCode}`}
                alt="QR Code"
                preview={false}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Text strong className="block text-base">{selectedJournal.schemaId?.name}</Text>
              <Text className="block text-sm text-gray-500">Mã: {selectedJournal.qrCode}</Text>
              <Text className="block text-xs text-gray-400">
                URL: {import.meta.env.VITE_APP_URL || window.location.origin}/trace/{selectedJournal.qrCode}
              </Text>
            </div>

            <Space className="w-full justify-center">
              <Button onClick={() => setIsQRModalVisible(false)}>
                Đóng
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleDownloadQR}
                className="bg-green-600"
              >
                Tải xuống QR Code
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminJournalMgmt;
