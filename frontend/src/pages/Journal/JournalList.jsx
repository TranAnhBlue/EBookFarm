import React, { useState } from 'react';
import { Card, Table, Typography, Button, Space, Modal, Select, QRCode, Tag, Badge } from 'antd';
import { PlusOutlined, EditOutlined, QrcodeOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

const JournalList = () => {
  const navigate = useNavigate();
  const [schemaModalVisible, setSchemaModalVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState('');

  const { data: journals, isLoading } = useQuery({ 
    queryKey: ['journals'], 
    queryFn: () => api.get('/journals').then(res => res.data.data) 
  });
  const { data: schemas } = useQuery({ 
    queryKey: ['schemas'], 
    queryFn: () => api.get('/schemas').then(res => res.data.data) 
  });

  const columns = [
    { 
      title: 'Tên quy trình', 
      dataIndex: ['schemaId', 'name'], 
      key: 'schema',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    { 
      title: 'Người tạo', 
      dataIndex: ['userId', 'username'], 
      key: 'user',
      render: (text) => <Tag color="blue" className="rounded-md border-blue-100 font-medium">{text}</Tag>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'Completed' ? 'success' : 'processing'} 
          text={<span className={`font-bold ${status === 'Completed' ? 'text-green-600' : 'text-blue-500'}`}>{status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}</span>} 
        />
      )
    },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (date) => <Text className="text-gray-400 font-medium">{new Date(date).toLocaleDateString('vi-VN')}</Text> 
    },
    { 
      title: 'Thao tác', 
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
           <Button 
            type="text" 
            className="flex items-center justify-center hover:bg-green-50 text-green-600 rounded-lg"
            icon={<EditOutlined />} 
            onClick={() => navigate(`/journal/edit/${record._id}`)} 
           />
           <Button 
            type="text" 
            className="flex items-center justify-center hover:bg-green-50 text-green-600 rounded-lg"
            icon={<QrcodeOutlined />} 
            onClick={() => {
              setCurrentQr(`${window.location.origin}/trace/${record.qrCode}`);
              setQrModalVisible(true);
            }} 
           />
           <Button 
            type="text" 
            className="flex items-center justify-center hover:bg-gray-100 text-gray-400 rounded-lg"
            icon={<EyeOutlined />} 
            onClick={() => window.open(`/trace/${record.qrCode}`)} 
           />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="space-y-1">
          <Title level={2} className="!mb-0 tracking-tight">Nhật ký sản xuất</Title>
          <Text className="text-gray-400 font-medium">Quản lý và theo dõi toàn bộ lịch trình canh tác điện tử</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => setSchemaModalVisible(true)}
          className="h-12 px-8 rounded-xl shadow-xl shadow-green-200 font-bold"
        >
          Tạo nhật ký mới
        </Button>
      </div>

      {/* Main Table Content */}
      <Card bordered={false} className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-gray-50 rounded-[24px] overflow-hidden">
        <div className="p-2">
          <Table 
            dataSource={journals} 
            columns={columns} 
            rowKey="_id" 
            loading={isLoading} 
            pagination={{ 
              pageSize: 8, 
              className: "px-6 py-4",
              showSizeChanger: false
            }}
            className="premium-table-refined"
          />
        </div>
      </Card>

      <Modal
        title={<span className="text-lg font-bold">Chọn quy trình sản xuất</span>}
        open={schemaModalVisible}
        onOk={() => {
           if(selectedSchema) {
               navigate(`/journal/new/${selectedSchema}`);
           }
        }}
        onCancel={() => setSchemaModalVisible(false)}
        okText="Bắt đầu nhập liệu"
        cancelText="Để sau"
        okButtonProps={{ disabled: !selectedSchema, size: 'large' }}
        cancelButtonProps={{ size: 'large' }}
        centered
        className="rounded-2xl overflow-hidden"
      >
         <div className="py-4">
             <Text className="block mb-4 text-gray-500">Vui lòng chọn loại cây trồng hoặc mô hình sản xuất bạn muốn ghi nhật ký:</Text>
             <Select 
              placeholder="Chọn một quy trình (ví dụ: Cà chua VietGAP)" 
              className="w-full h-12"
              onChange={setSelectedSchema}
             >
                 {schemas?.map((s) => (
                     <Select.Option value={s._id} key={s._id}>{s.name}</Select.Option>
                 ))}
             </Select>
         </div>
      </Modal>

      <Modal 
        title={<span className="text-lg font-bold">Mã QR Truy xuất nguồn gốc</span>} 
        open={qrModalVisible} 
        footer={null} 
        onCancel={() => setQrModalVisible(false)} 
        centered
        className="rounded-2xl overflow-hidden"
      >
         <div className="flex flex-col justify-center items-center p-8 bg-gray-50/50">
            <div className="bg-white p-6 rounded-3xl shadow-lg mb-6 border border-gray-100">
              <QRCode 
                value={currentQr} 
                size={220} 
                bordered={false}
                color="#15803d"
              />
            </div>
            <Text className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-widest">Quét mã để xem hồ sơ công khai</Text>
            <Text strong className="text-gray-800 break-all text-center">
              <a href={currentQr} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">{currentQr}</a>
            </Text>
         </div>
      </Modal>
    </div>
  );
};

export default JournalList;
