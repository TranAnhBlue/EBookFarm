import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Row, Col, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, message, Empty, Badge, Steps, Divider } from 'antd';
import { 
  PlusOutlined, 
  SendOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PlusSquareOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FarmerSupplyMgmt = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [htxList, setHtxList] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchHtxList();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/supply-requests');
      if (res.data.success) setRequests(res.data.data);
    } catch (error) {
      message.error('Lỗi khi tải lịch sử yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchHtxList = async () => {
    try {
      // In this system, farmers are often linked to an HTX. 
      // We'll fetch HTX users or just use the one they are linked to.
      // For now, let's fetch all users with role 'HTX' or 'Admin' as a fallback
      const res = await api.get('/users?role=HTX');
      if (res.data.success) setHtxList(res.data.data);
    } catch (error) {
      console.error('Failed to fetch HTX list');
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const res = await api.post('/supply-requests', {
        htxId: values.htxId,
        reason: values.reason,
        items: values.items
      });

      if (res.data.success) {
        message.success('Đơn yêu cầu đã được gửi tới HTX!');
        setIsModalVisible(false);
        form.resetFields();
        fetchRequests();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { color: 'orange', text: 'Đang chờ duyệt', icon: <ClockCircleOutlined /> };
      case 'Approved': return { color: 'green', text: 'Đã phê duyệt', icon: <CheckCircleOutlined /> };
      case 'Rejected': return { color: 'red', text: 'Bị từ chối', icon: <CloseCircleOutlined /> };
      default: return { color: 'default', text: status, icon: null };
    }
  };

  const columns = [
    {
      title: 'NGÀY GỬI',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => <Text className="text-xs font-medium">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'VẬT TƯ YÊU CẦU',
      key: 'items',
      render: (record) => (
        <div className="flex flex-wrap gap-2">
          {record.items.map((item, idx) => (
            <Tag key={idx} color="blue" className="rounded-md border-blue-100 bg-blue-50 text-blue-700 font-medium">
              {item.itemName} (x{item.quantity} {item.unit})
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'HTX TIẾP NHẬN',
      dataIndex: ['htx', 'fullname'],
      key: 'htx',
      render: (text, record) => <Text strong className="text-xs text-gray-600">{text || record.htx?.username}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const info = getStatusInfo(status);
        return <Tag color={info.color} icon={info.icon} className="rounded-full px-3 font-bold uppercase text-[10px]">{info.text}</Tag>;
      }
    },
    {
      title: 'PHẢN HỒI HTX',
      dataIndex: 'htxFeedback',
      key: 'feedback',
      render: (text) => text ? <Text className="text-xs text-amber-600 italic">{text}</Text> : <Text className="text-xs text-gray-300">---</Text>
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={3} className="!mb-1">Xin Cấp Vật Tư</Title>
          <Paragraph className="text-gray-400">Gửi yêu cầu hỗ trợ vật tư nông nghiệp tới Hợp tác xã</Paragraph>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusSquareOutlined />} 
          onClick={() => setIsModalVisible(true)}
          className="h-12 px-8 bg-green-600 border-0 rounded-2xl font-bold shadow-lg shadow-green-100 flex items-center gap-2"
        >
          Tạo đơn yêu cầu
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Side: Summary & Guide */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            <Card className="rounded-[32px] border-0 shadow-sm bg-gradient-to-br from-green-600 to-emerald-700 text-white overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <ShoppingOutlined style={{ fontSize: '120px' }} />
              </div>
              <div className="relative z-10">
                <Title level={4} className="!text-white !mb-2">Hỗ trợ sản xuất</Title>
                <Paragraph className="text-white/80 text-xs leading-relaxed mb-6">
                  Nông dân có thể gửi đơn xin cấp các loại vật tư như phân bón, thuốc BVTV, hạt giống... HTX sẽ xem xét và phê duyệt dựa trên định mức sản xuất.
                </Paragraph>
                <div className="flex gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <div className="text-2xl font-black">{requests.filter(r => r.status === 'Approved').length}</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Đã nhận</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <div className="text-2xl font-black">{requests.filter(r => r.status === 'Pending').length}</div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Chờ duyệt</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px] border-gray-100 shadow-sm">
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-500" /> Quy trình xử lý
              </Title>
              <Steps
                direction="vertical"
                size="small"
                current={-1}
                items={[
                  { title: 'Gửi yêu cầu', description: 'Chọn vật tư & số lượng cần thiết.' },
                  { title: 'HTX Tiếp nhận', description: 'Cán bộ HTX kiểm tra đơn và tồn kho.' },
                  { title: 'Phê duyệt', description: 'HTX duyệt đơn & thực hiện cấp phát.' },
                  { title: 'Nhận vật tư', description: 'Vật tư tự động cộng vào kho của bạn.' },
                ]}
              />
            </Card>
          </div>
        </Col>

        {/* Right Side: History Table */}
        <Col xs={24} lg={16}>
          <Card 
            title={<Space><HistoryOutlined className="text-green-600" /><Text strong>Lịch sử yêu cầu</Text></Space>} 
            className="rounded-[32px] border-gray-100 shadow-sm overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <Table 
              columns={columns} 
              dataSource={requests} 
              rowKey="_id"
              loading={loading}
              className="premium-table"
              locale={{ emptyText: <Empty description="Bạn chưa có yêu cầu nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              pagination={{ pageSize: 8, className: "px-6 py-4" }}
            />
          </Card>
        </Col>
      </Row>

      {/* New Request Modal */}
      <Modal
        title={<Title level={4} className="!mb-0 flex items-center gap-2"><SendOutlined className="text-green-600" /> Gửi đơn xin cấp vật tư</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={650}
        centered
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ items: [{}] }}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="htxId"
            label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Hợp tác xã tiếp nhận</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn HTX!' }]}
          >
            <Select placeholder="Chọn HTX của bạn" className="h-12 premium-select">
              {htxList.map(htx => (
                <Option key={htx._id} value={htx._id}>{htx.fullname || htx.username}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider className="my-4" />

          <Text className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1 block mb-3">Danh sách vật tư cần xin</Text>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} className="bg-gray-50/50 rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
                    <Row gutter={16} align="middle">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'itemName']}
                          rules={[{ required: true, message: 'Nhập tên vật tư!' }]}
                          className="!mb-0"
                        >
                          <Input placeholder="Tên vật tư (VD: Đạm Ure)" className="h-11 rounded-xl" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'category']}
                          rules={[{ required: true, message: 'Chọn loại!' }]}
                          className="!mb-0"
                        >
                          <Select placeholder="Loại vật tư" className="h-11 premium-select">
                            <Option value="Phân bón">Phân bón</Option>
                            <Option value="Thuốc BVTV">Thuốc BVTV</Option>
                            <Option value="Giống">Giống cây trồng</Option>
                            <Option value="Dụng cụ">Dụng cụ lao động</Option>
                            <Option value="Khác">Khác</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'Số lượng!' }]}
                          className="!mb-0"
                        >
                          <InputNumber placeholder="SL" min={1} className="w-full h-11 rounded-xl flex items-center" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                      <Col span={6} className="mt-2">
                         <Form.Item
                          {...restField}
                          name={[name, 'unit']}
                          rules={[{ required: true, message: 'Đơn vị!' }]}
                          className="!mb-0"
                        >
                          <Input placeholder="Đơn vị (kg, lít...)" className="h-9 rounded-lg text-xs" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />} 
                  className="h-12 rounded-2xl border-2 border-dashed border-green-200 text-green-600 hover:text-green-700 hover:border-green-400"
                >
                  Thêm vật tư khác
                </Button>
              </div>
            )}
          </Form.List>

          <Divider className="my-6" />

          <Form.Item
            name="reason"
            label={<Text className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Lý do xin cấp (Nếu có)</Text>}
          >
            <TextArea rows={3} placeholder="Mô tả mục đích sử dụng..." className="rounded-2xl border-gray-100 bg-gray-50 focus:bg-white" />
          </Form.Item>

          <div className="flex gap-4 pt-4">
            <Button block size="large" className="h-14 rounded-2xl font-bold border-2" onClick={() => setIsModalVisible(false)}>
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              block 
              size="large" 
              htmlType="submit"
              loading={submitting}
              className="h-14 rounded-2xl font-black bg-green-600 border-0 shadow-lg shadow-green-100"
            >
              Gửi yêu cầu ngay
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmerSupplyMgmt;
