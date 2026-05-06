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
import { API_BASE_URL } from '../../utils/helpers';

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
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch All Journals
  const { data: journals, isLoading } = useQuery({
    queryKey: ['admin-journals'],
    queryFn: () => api.get('/journals').then(res => res.data.data)
  });

  // Filter and Sort journals
  const filteredJournals = React.useMemo(() => {
    if (!journals) return [];
    
    let result = journals.filter(journal => {
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

      // Date range filter
      const matchDate = !dateRange || (
        dayjs(journal.createdAt).isAfter(dateRange[0]) &&
        dayjs(journal.createdAt).isBefore(dateRange[1])
      );

      return matchSearch && matchStatus && matchDate;
    });

    // Apply Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [journals, searchText, statusFilter, dateRange, sortOrder]);

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

  const getStatusDisplay = (record) => {
    const { status, htxStatus } = record;
    if (status === 'Verified') return <Tag color="green" icon={<CheckCircleOutlined />} className="rounded-full px-3">HTX Đã duyệt</Tag>;
    if (status === 'Submitted') return <Tag color="blue" icon={<ClockCircleOutlined />} className="rounded-full px-3">Chờ duyệt</Tag>;
    if (status === 'Draft') return <Tag color="orange" icon={<ClockCircleOutlined />} className="rounded-full px-3">Đang thực hiện</Tag>;
    return <Tag color="default" className="rounded-full px-3">{status}</Tag>;
  };

  const columns = [
    {
      title: 'Thông tin nhật ký',
      key: 'journal_info',
      width: '35%',
      render: (record) => (
        <div className="flex flex-col gap-1">
          <Text strong className="text-base text-green-700">{record.schemaId?.name || 'Chưa đặt tên'}</Text>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
             <span className="bg-gray-100 px-1.5 py-0.5 rounded">Mã: {record.qrCode?.substring(0, 8)}...</span>
             <span>Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY')}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Nông dân',
      key: 'farmer_info',
      width: '25%',
      render: (record) => (
        <div className="flex items-center gap-2">
          <Avatar 
            size={32} 
            icon={<UserOutlined />} 
            className="bg-green-50 text-green-600 border border-green-100"
            src={record.userId?.avatar ? `${API_BASE_URL}${record.userId.avatar}` : null}
          />
          <div className="flex flex-col">
            <Text className="text-sm font-semibold text-gray-800">{record.userId?.fullname || record.userId?.username || 'N/A'}</Text>
            <Text className="text-[10px] text-gray-400 italic">@{record.userId?.username}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status_info',
      width: '20%',
      align: 'center',
      render: (record) => (
        <div className="flex flex-col items-center gap-1">
          {getStatusDisplay(record)}
          {record.htxStatus && (
            <Text className="text-[10px] text-gray-400 font-medium">HTX: {record.htxStatus}</Text>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '20%',
      align: 'right',
      render: (record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            size="middle" 
            onClick={() => handleViewDetail(record)}
            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm border-gray-100 hover:text-green-600"
          />
          <Button 
            icon={<QrcodeOutlined />} 
            size="middle" 
            type="primary" 
            onClick={() => handleViewQR(record)}
            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm bg-green-600 border-0"
          />
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

          <Select
            value={sortOrder}
            onChange={setSortOrder}
            className="w-40 h-10 ml-2"
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
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
