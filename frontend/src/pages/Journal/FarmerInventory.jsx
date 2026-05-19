import React, { useState, useRef } from 'react';
import { Card, Table, Typography, Space, Tag, Input, Statistic, Row, Col, Tabs, Button, Modal, Form, Select, InputNumber, message, Upload, Image } from 'antd';
import { SearchOutlined, InboxOutlined, AlertOutlined, SafetyCertificateOutlined, HistoryOutlined, ArrowDownOutlined, ArrowUpOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Tractor, Droplet } from 'lucide-react';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const FarmerInventory = () => {
  const { user } = useAuthStore();
  const [searchText, setSearchText] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [evidenceFileList, setEvidenceFileList] = useState([]);
  const evidenceUrlRef = useRef(null);
  const [form] = Form.useForm();

  // Fetch inventory
  const { data: inventory, isLoading: isInvLoading, refetch: refetchInv } = useQuery({
    queryKey: ['farmer-inventory'],
    queryFn: () => api.get('/inventory').then(res => res.data.data)
  });

  // Fetch transactions
  const { data: transactions, isLoading: isTransLoading, refetch: refetchTrans } = useQuery({
    queryKey: ['farmer-transactions'],
    queryFn: () => api.get('/inventory/transactions').then(res => res.data.data)
  });

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data?.url || null;
    } catch {
        message.error('Upload ảnh bằng chứng thất bại');
        return null;
    }
  };

  const uploadProps = {
    listType: 'picture-card',
    fileList: evidenceFileList,
    maxCount: 1,
    accept: 'image/*',
    customRequest: async ({ file, onSuccess, onError }) => {
        const url = await handleUpload(file);
        if (url) {
            evidenceUrlRef.current = url;
            const API_BASE = (import.meta.env.VITE_API_URL || 'https://ebookfarm.onrender.com/api').replace(/\/api$/, '');
            const displayUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            setEvidenceFileList([{ uid: file.uid, name: file.name, status: 'done', url: displayUrl }]);
            onSuccess(url);
        } else {
            onError(new Error('Upload failed'));
        }
    },
    onRemove: () => { setEvidenceFileList([]); evidenceUrlRef.current = null; },
  };

  const handleAddExternal = async (values) => {
    try {
      if (!evidenceUrlRef.current) {
        message.warning('Vui lòng tải lên ảnh hóa đơn hoặc bằng chứng mua hàng hợp lệ cho HTX duyệt!');
        return;
      }
      
      if (user?.htxId) {
        // Nông dân thuộc HTX -> Gửi đơn chờ duyệt
        const htxId = typeof user.htxId === 'object' ? user.htxId._id : user.htxId;
        await api.post('/supply-requests', {
          htxId,
          reason: 'Khai báo vật tư mua ngoài (Tự túc)',
          isExternalPurchase: true,
          evidenceImage: evidenceUrlRef.current,
          items: [{
            itemName: values.name,
            category: values.category,
            quantity: values.quantity,
            unit: values.unit
          }]
        });
        message.success('Đã gửi đơn khai báo mua ngoài! Vui lòng chờ HTX phê duyệt.');
      } else {
        // Nông dân độc lập -> Cộng thẳng vào kho
        await api.post('/inventory/add', { 
          ...values, 
          note: 'Tự mua ngoài / Tự túc (Nông dân độc lập)',
          evidenceImage: evidenceUrlRef.current
        });
        message.success('Đã thêm vật tư mua ngoài vào kho của bạn!');
      }
      
      setIsAddModalVisible(false);
      form.resetFields();
      setEvidenceFileList([]);
      evidenceUrlRef.current = null;
      refetchInv();
      refetchTrans();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi khai báo vật tư');
    }
  };

  const getStockStatus = (qty, threshold = 10) => {
    if (qty === 0) return { color: 'red', text: 'Hết hàng' };
    if (qty <= threshold) return { color: 'warning', text: 'Sắp hết' };
    return { color: 'success', text: 'Sẵn có' };
  };

  const invColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-medium">{index + 1}</span>
    },
    {
      title: 'Tên Vật tư',
      key: 'name',
      filters: [
        { text: 'Phân bón', value: 'Phân bón' },
        { text: 'Thuốc BVTV', value: 'Thuốc BVTV' },
        { text: 'Giống', value: 'Giống' },
        { text: 'Vật tư khác', value: 'Khác' }
      ],
      onFilter: (value, record) => record.category === value,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            {record.category === 'Phân bón' ? <Droplet className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-gray-800 text-base">{record.name}</Text>
            <Text type="secondary" className="text-xs uppercase">{record.category}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Tồn kho hiện tại',
      key: 'quantity',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text className="text-lg font-bold text-gray-800">
            {record.quantity} <span className="text-sm font-normal text-gray-500">{record.unit}</span>
          </Text>
          <Tag color={getStockStatus(record.quantity, record.minQuantity).color} className="rounded-md border-0 uppercase text-[10px] tracking-wider font-bold">
            {getStockStatus(record.quantity, record.minQuantity).text}
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

  const transColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-medium">{index + 1}</span>
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text className="text-gray-500">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'Loại giao dịch',
      key: 'type',
      filters: [
        { text: 'Nhập kho', value: 'Import' },
        { text: 'Được HTX cấp phát', value: 'Distribute' },
        { text: 'Đã sử dụng', value: 'Export' }
      ],
      onFilter: (value, record) => record.type === value,
      render: (_, record) => {
        if (record.type === 'Import') return <Tag icon={<ArrowDownOutlined />} color="blue">Nhập kho</Tag>;
        if (record.type === 'Distribute') return <Tag icon={<ArrowDownOutlined />} color="purple">Được HTX cấp phát</Tag>;
        if (record.type === 'Export') return <Tag icon={<ArrowUpOutlined />} color="orange">Đã sử dụng</Tag>;
        return <Tag>{record.type}</Tag>;
      }
    },
    {
      title: 'Vật tư',
      key: 'item',
      render: (_, record) => (
        <Text strong>{record.itemId?.name}</Text>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_, record) => {
        const isAddition = record.type === 'Import' || record.type === 'Distribute';
        return (
          <Text strong className={isAddition ? 'text-green-600' : 'text-orange-600'}>
            {isAddition ? '+' : '-'}{record.quantity} {record.itemId?.unit}
          </Text>
        );
      }
    },
    {
      title: 'Nguồn / Người thực hiện',
      key: 'performedBy',
      render: (_, record) => <Text>{record.performedBy?.fullname || record.performedBy?.username}</Text>
    },
    {
      title: 'Ghi chú / Bằng chứng',
      dataIndex: 'note',
      key: 'note',
      render: (text, record) => {
        const API_BASE = (import.meta.env.VITE_API_URL || 'https://ebookfarm.onrender.com/api').replace(/\/api$/, '');
        return (
          <div className="flex items-center gap-3">
            <Text type="secondary" className="text-xs max-w-[200px] block truncate" title={text}>{text}</Text>
            {record.evidenceImage && (
               <Image 
                 src={record.evidenceImage.startsWith('http') ? record.evidenceImage : `${API_BASE}${record.evidenceImage}`} 
                 width={36} 
                 height={36} 
                 className="rounded-lg object-cover border border-gray-200 shadow-sm cursor-pointer hover:border-green-400 transition-colors" 
               />
            )}
          </div>
        );
      }
    }
  ];

  const filteredData = inventory?.filter(item => 
    item.name?.toLowerCase().includes(searchText.toLowerCase()) || 
    item.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalItems = inventory?.length || 0;
  const lowStockItems = inventory?.filter(i => i.quantity <= (i.minQuantity || 10)).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <Title level={2} className="!mb-0 tracking-tight text-gray-800">Tồn kho Sản xuất</Title>
          <Text className="text-gray-400 font-medium">Quản lý vật tư cấp phát và hàng hóa tự mua ngoài</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => setIsAddModalVisible(true)}
          className="h-11 px-6 bg-green-600 border-0 rounded-xl font-bold shadow-lg shadow-green-100 flex items-center gap-2"
        >
          Nhập hàng mua ngoài
        </Button>
      </div>

      <Row gutter={[24, 24]}>
         <Col xs={24} md={12}>
            <Card className="rounded-3xl shadow-sm border border-green-100 bg-green-50/50 hover:shadow-md transition-shadow">
               <Statistic 
                  title={<span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tổng mã Số vật tư</span>}
                  value={totalItems} 
                  prefix={<InboxOutlined className="text-green-500" />}
                  styles={{ content: { fontSize: '36px', fontWeight: 800, color: '#166534' } }}
               />
            </Card>
         </Col>
         <Col xs={24} md={12}>
            <Card className="rounded-3xl shadow-sm border border-orange-100 bg-orange-50/50 hover:shadow-md transition-shadow">
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
        <Tabs defaultActiveKey="1" className="px-6 pt-4" items={[
          {
            key: '1',
            label: <span className="font-semibold text-base"><InboxOutlined /> Kho vật tư hiện tại</span>,
            children: (
              <>
                <div className="pb-6 pt-2 flex justify-between items-center">
                  <Input 
                    placeholder="Tìm kiếm vật tư theo tên hoặc phân loại..." 
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="w-full max-w-md h-12 rounded-xl border-gray-200"
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <Table 
                  columns={invColumns} 
                  dataSource={filteredData} 
                  rowKey="_id" 
                  loading={isInvLoading}
                  pagination={{ pageSize: 10 }}
                  className="premium-table-refined"
                />
              </>
            )
          },
          {
            key: '2',
            label: <span className="font-semibold text-base"><HistoryOutlined /> Lịch sử giao dịch & Cấp phát</span>,
            children: (
              <div className="pt-2">
                <Table 
                  columns={transColumns} 
                  dataSource={transactions} 
                  rowKey="_id" 
                  loading={isTransLoading}
                  pagination={{ pageSize: 10 }}
                  className="premium-table-refined"
                />
              </div>
            )
          }
        ]} />
      </Card>

      {/* Modal Nhập kho tự túc */}
      <Modal
        title={
          <Space>
            <InboxOutlined className="text-green-600" />
            <span className="font-bold text-lg">Khai báo vật tư mua ngoài</span>
          </Space>
        }
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        centered
        className="premium-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleAddExternal} className="mt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label={<Text className="font-semibold text-gray-700">Tên vật tư / hàng hóa</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="VD: Phân bón Đầu Trâu, Thuốc tím..." className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label={<Text className="font-semibold text-gray-700">Phân loại</Text>} rules={[{ required: true, message: 'Chọn phân loại' }]}>
                <Select className="h-11 premium-select" placeholder="Chọn loại">
                  <Select.Option value="Phân bón">Phân bón</Select.Option>
                  <Select.Option value="Thuốc BVTV">Thuốc bảo vệ thực vật</Select.Option>
                  <Select.Option value="Thuốc thú y">Thuốc thú y / Vaccine</Select.Option>
                  <Select.Option value="Thuốc thủy sản">Thuốc thủy sản</Select.Option>
                  <Select.Option value="Giống">Giống cây / con</Select.Option>
                  <Select.Option value="Thức ăn">Thức ăn chăn nuôi</Select.Option>
                  <Select.Option value="Khác">Vật tư khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label={<Text className="font-semibold text-gray-700">Đơn vị tính</Text>} rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                <Select className="h-11 premium-select" placeholder="VD: kg, bao, lít..." allowClear mode="tags" maxCount={1}>
                  <Select.Option value="kg">Kilogram (kg)</Select.Option>
                  <Select.Option value="lít">Lít (l)</Select.Option>
                  <Select.Option value="bao">Bao</Select.Option>
                  <Select.Option value="gói">Gói</Select.Option>
                  <Select.Option value="lọ">Lọ</Select.Option>
                  <Select.Option value="viên">Viên</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label={<Text className="font-semibold text-gray-700">Số lượng mua</Text>} rules={[{ required: true, message: 'Nhập số lượng' }]}>
                <InputNumber className="w-full h-11 rounded-xl flex items-center" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minQuantity" label={<Text className="font-semibold text-gray-700">Cảnh báo sắp hết (tùy chọn)</Text>} initialValue={10}>
                <InputNumber className="w-full h-11 rounded-xl flex items-center" min={0} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item 
                label={
                  <div className="flex flex-col mt-2">
                    <Text className="font-semibold text-gray-700">Bằng chứng mua hàng / Hóa đơn</Text>
                    <Text className="text-[10px] text-gray-400 font-normal">Bắt buộc tải lên ảnh chụp nhãn mác sản phẩm hoặc hóa đơn để HTX kiểm duyệt (Theo chuẩn VietGAHP)</Text>
                  </div>
                } 
                required
              >
                <Upload {...uploadProps}>
                  {evidenceFileList.length < 1 && (
                    <div className="flex flex-col items-center gap-1 text-gray-400 py-4 px-8 border border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:text-green-500 transition-colors cursor-pointer bg-gray-50 hover:bg-green-50">
                      <PictureOutlined className="text-2xl mb-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">Chọn tải ảnh</span>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsAddModalVisible(false)} className="rounded-xl h-11 px-6 font-semibold">Hủy</Button>
            <Button type="primary" htmlType="submit" className="rounded-xl h-11 px-8 font-bold bg-green-600 border-0 shadow-md shadow-green-100">
              Lưu vào kho
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmerInventory;
