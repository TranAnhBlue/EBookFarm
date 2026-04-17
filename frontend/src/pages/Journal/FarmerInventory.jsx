import React, { useState } from 'react';
import { Card, Table, Typography, Space, Tag, Input, Statistic, Row, Col } from 'antd';
import { SearchOutlined, InboxOutlined, AlertOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Tractor, Droplet } from 'lucide-react';

const { Title, Text } = Typography;

const FarmerInventory = () => {
  const [searchText, setSearchText] = useState('');

  // Fetch inventory
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['farmer-inventory'],
    queryFn: () => api.get('/inventory').then(res => res.data.data)
  });

  const getStockStatus = (qty, threshold = 10) => {
    if (qty === 0) return { color: 'red', text: 'Hết hàng' };
    if (qty <= threshold) return { color: 'warning', text: 'Sắp hết' };
    return { color: 'success', text: 'Sẵn có' };
  };

  const columns = [
    {
      title: 'Mã Vật tư',
      dataIndex: ['modelId', 'sku'],
      key: 'sku',
      render: (text) => <Text strong className="text-gray-500">{text}</Text>
    },
    {
      title: 'Tên Vật tư / Sản phẩm',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            {record.modelId?.category === 'Phân bón' ? <Droplet className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-gray-800 text-base">{record.modelId?.name}</Text>
            <Text type="secondary" className="text-xs">{record.modelId?.category}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['modelId', 'manufacturer'],
      key: 'manufacturer',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Tồn kho hiện tại',
      key: 'quantity',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text className="text-lg font-bold text-gray-800">
            {record.quantity} <span className="text-sm font-normal text-gray-500">{record.modelId?.unit}</span>
          </Text>
          <Tag color={getStockStatus(record.quantity).color} className="rounded-md border-0 uppercase text-[10px] tracking-wider font-bold">
            {getStockStatus(record.quantity).text}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Bảo quản',
      key: 'storage',
      render: () => (
        <div className="flex items-center gap-2 text-xs text-gray-500">
           <SafetyCertificateOutlined className="text-green-500" /> Đúng tiêu chuẩn
        </div>
      )
    }
  ];

  const filteredData = inventory?.filter(item => 
    item.modelId?.name.toLowerCase().includes(searchText.toLowerCase()) || 
    item.modelId?.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalItems = inventory?.length || 0;
  const lowStockItems = inventory?.filter(i => i.quantity <= 10).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Title level={2} className="!mb-0 tracking-tight text-gray-800">Tồn kho Sản xuất</Title>
        <Text className="text-gray-400 font-medium">Báo cáo tồn kho vật tư, phân bón, thuốc BVTV và nông sản</Text>
      </div>

      <Row gutter={[24, 24]}>
         <Col xs={24} md={12}>
            <Card className="rounded-3xl shadow-sm border border-green-100 bg-green-50/50">
               <Statistic 
                  title={<span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tổng mã Số vật tư</span>}
                  value={totalItems} 
                  prefix={<InboxOutlined className="text-green-500" />}
                  styles={{ content: { fontSize: '36px', fontWeight: 800, color: '#166534' } }}
               />
            </Card>
         </Col>
         <Col xs={24} md={12}>
            <Card className="rounded-3xl shadow-sm border border-orange-100 bg-orange-50/50">
               <Statistic 
                  title={<span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cần nhập thêm (Sắp hết hàng)</span>}
                  value={lowStockItems} 
                  prefix={<AlertOutlined className="text-orange-500" />}
                  styles={{ content: { fontSize: '36px', fontWeight: 800, color: '#9a3412' } }}
               />
            </Card>
         </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm border border-gray-100 rounded-[24px] overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <Input 
            placeholder="Tìm kiếm vật tư theo tên hoặc mã SKU..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full max-w-md h-12 rounded-xl border-gray-200"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="_id" 
          loading={isLoading}
          pagination={{ pageSize: 10, className: "px-6 py-4" }}
          className="premium-table-refined"
        />
      </Card>
    </div>
  );
};

export default FarmerInventory;
