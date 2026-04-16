import React from 'react';
import { Card, Table, Typography, Tag, Space, Breadcrumb, Badge } from 'antd';
import { HomeOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

const SystemLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => api.get('/logs').then(res => res.data.data)
  });

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => (
        <div className="flex flex-col">
          <Text strong>{moment(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" className="text-xs">{moment(date).format('HH:mm:ss')}</Text>
        </div>
      )
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{user?.fullname || user?.username || 'Unknown'}</Text>
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-tighter">{user?.role || 'SYSTEM'}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color="cyan" className="rounded-md px-3 font-semibold border-0 py-0.5">
          {action}
        </Tag>
      )
    },
    {
      title: 'Đối tượng',
      key: 'target',
      render: (_, record) => (
        <Space size="small">
          <Badge status="processing" color={record.targetType === 'User' ? 'blue' : 'green'} />
          <Text className="text-gray-600 font-medium">{record.targetType}</Text>
          <Text type="secondary" className="text-xs italic">(ID: {record.targetId?.substring(0, 8)}...)</Text>
        </Space>
      )
    },
    {
       title: 'Chi tiết',
       dataIndex: 'details',
       key: 'details',
       render: (details) => {
         if (!details) return '-';
         return (
           <div className="max-w-xs truncate">
             <Text type="secondary" className="text-xs">
               {JSON.stringify(details).replace(/[{}"]/g, '')}
             </Text>
           </div>
         );
       }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Dashboard</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600">Nhật ký hệ thống</span>
        </div>
        <Title level={4} className="!mb-0">Log truy cập & thay đổi</Title>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px]">
        <div className="flex items-center gap-2 mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <HistoryOutlined className="text-blue-500 text-xl" />
          <div>
             <Text strong className="block">Dữ liệu thời gian thực</Text>
             <Text type="secondary" className="text-xs italic">Hiển thị tối đa 100 hành động gần nhất trên toàn hệ thống.</Text>
          </div>
        </div>

        <Table 
          columns={columns} 
          dataSource={logs} 
          rowKey="_id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="premium-table-refined"
        />
      </Card>
    </div>
  );
};

export default SystemLogs;
