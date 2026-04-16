import React from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Breadcrumb, Badge, Avatar } from 'antd';
import { 
  HomeOutlined, 
  SearchOutlined, 
  FileDoneOutlined, 
  QrcodeOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

const AdminJournalMgmt = () => {
  // Fetch All Journals
  const { data: journals, isLoading } = useQuery({
    queryKey: ['admin-journals'],
    queryFn: () => api.get('/journals').then(res => res.data.data)
  });

  const columns = [
    {
      title: 'THÔNG TIN NHẬT KÝ',
      key: 'journal',
      render: (record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-gray-800">{record.schemaId?.name || 'Chưa đặt tên'}</Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest">MÃ: {record.qrCode.substring(0, 8)}...</Text>
        </Space>
      )
    },
    {
      title: 'CHỦ SỞ HỮU',
      key: 'user',
      render: (record) => (
        <Space>
          <Avatar size={24} icon={<UserOutlined />} className="bg-green-50 text-green-600" />
          <Text className="text-sm font-medium">{record.userId?.username || 'N/A'}</Text>
        </Space>
      )
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : 'orange'} className="rounded-full px-3 font-bold text-[10px] uppercase">
          {status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
        </Tag>
      )
    },
    {
      title: 'CẬP NHẬT CUỐI',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (
        <Text className="text-gray-500 text-xs">{moment(date).format('HH:mm - DD/MM/YYYY')}</Text>
      )
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" className="rounded-md">Xem chi tiết</Button>
          <Button icon={<QrcodeOutlined />} size="small" type="primary" className="rounded-md bg-gray-800 border-0">QR Code</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> Dashboard</> },
            { title: <span className="text-green-600 font-bold">Quản lý nhật ký tổng</span> }
          ]}
        />
        <div className="flex justify-between items-center">
            <Title level={4} className="!mb-0">Giám sát Nhật ký Sản xuất</Title>
            <Input 
                prefix={<SearchOutlined className="text-gray-400" />} 
                placeholder="Tìm theo chủ sở hữu, mã QR..." 
                className="w-72 h-10 rounded-xl border-gray-100 shadow-sm"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[24px] border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white p-2">
             <Space direction="vertical" size={4}>
                <Text className="text-white/80 uppercase text-[10px] font-bold tracking-widest">Tổng số nhật ký</Text>
                <div className="flex items-end gap-2">
                    <Title level={2} className="!mb-0 !text-white">{journals?.length || 0}</Title>
                    <Badge status="processing" color="white" />
                </div>
             </Space>
          </Card>
          <Card className="rounded-[24px] border-0 shadow-sm p-2">
             <Space direction="vertical" size={4}>
                <Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Đang thực hiện</Text>
                <Title level={2} className="!mb-0">
                    {journals?.filter(j => j.status !== 'Completed').length || 0}
                </Title>
             </Space>
          </Card>
          <Card className="rounded-[24px] border-0 shadow-sm p-2">
             <Space direction="vertical" size={4}>
                <Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Đã hoàn tất</Text>
                <Title level={2} className="!mb-0 text-green-600">
                    {journals?.filter(j => j.status === 'Completed').length || 0}
                </Title>
             </Space>
          </Card>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px] overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={journals} 
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          rowKey="_id"
          className="premium-table"
        />
      </Card>
    </div>
  );
};

export default AdminJournalMgmt;
