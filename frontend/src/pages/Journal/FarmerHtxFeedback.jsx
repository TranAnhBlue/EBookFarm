import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, List, Modal, Row, Select, Space, Tag, Typography, message, Skeleton } from 'antd';
import {
  AlertOutlined,
  FileDoneOutlined,
  PlusOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const submissionTypes = [
  {
    module: 'farmer-reports',
    title: 'Báo sâu bệnh/sự cố',
    description: 'Báo kịp thời tình trạng sâu bệnh, thời tiết, hư hỏng vật tư hoặc rủi ro sản xuất.',
    icon: <AlertOutlined />,
    typeOptions: ['Sâu bệnh', 'Thời tiết', 'Hư hỏng vật tư', 'Sự cố sản xuất', 'An toàn thực phẩm', 'Khác'],
  },
  {
    module: 'farmer-suggestions',
    title: 'Đề xuất chuyên môn',
    description: 'Gửi ý kiến liên quan kỹ thuật, quy trình VietGAP, vật tư, thu hoạch hoặc bảo quản.',
    icon: <SafetyCertificateOutlined />,
    typeOptions: ['Kỹ thuật trồng trọt', 'Quy trình VietGAP', 'Vật tư', 'Thu hoạch', 'Bảo quản', 'Khác'],
  },
  {
    module: 'farmer-equipment-requests',
    title: 'Đề nghị dụng cụ/bảo hộ',
    description: 'Đề nghị trang bị dụng cụ, bảo hộ lao động hoặc thiết bị cần thiết cho công việc.',
    icon: <ToolOutlined />,
    typeOptions: ['Dụng cụ lao động', 'Bảo hộ lao động', 'Thiết bị bảo quản', 'Vật tư hỗ trợ', 'Khác'],
  },
  {
    module: 'farmer-duty-confirmations',
    title: 'Xác nhận nhiệm vụ/tập huấn',
    description: 'Xác nhận tham gia tuần tra, tập huấn, nhiệm vụ HTX giao hoặc nội dung đã đọc.',
    icon: <ReadOutlined />,
    typeOptions: ['Tuần tra bảo vệ', 'Tập huấn', 'Nhiệm vụ HTX', 'Xác nhận đã đọc', 'Khác'],
  },
];

const moduleLabels = Object.fromEntries(submissionTypes.map(item => [item.module, item]));

const statusLabels = {
  Pending: 'Đã gửi/chờ HTX xử lý',
  Review: 'HTX đang xem xét',
  InProgress: 'Đang xử lý',
  Approved: 'Đã chấp thuận',
  Completed: 'Hoàn thành',
  Rejected: 'Từ chối/không phù hợp',
};

const FarmerHtxFeedback = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(submissionTypes[0]);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['farmer-htx-submissions'],
    queryFn: () => api.get('/htx/management/farmer/submissions').then(res => res.data.data),
  });

  const records = data || [];

  const openModal = (type) => {
    setSelectedType(type);
    form.resetFields();
    form.setFieldsValue({ priority: 'Medium', documentType: type.typeOptions[0] });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    await api.post(`/htx/management/farmer/${selectedType.module}`, values);
    message.success('Đã gửi tới HTX');
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['farmer-htx-submissions'] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Phản hồi tới HTX</Text>
        <Title level={2} className="!mb-1 flex items-center gap-3">
          <FileDoneOutlined className="text-green-600" /> Báo cáo & đề xuất với HTX
        </Title>
        <Text className="text-gray-500">Thực hiện quyền báo cáo, đề xuất chuyên môn, đề nghị dụng cụ/bảo hộ và xác nhận nhiệm vụ/tập huấn.</Text>
      </div>

      <Row gutter={[16, 16]}>
        {submissionTypes.map(type => (
          <Col xs={24} md={12} xl={6} key={type.module}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full" bodyStyle={{ padding: 20 }}>
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg mb-3">{type.icon}</div>
              <Text strong className="block text-gray-900">{type.title}</Text>
              <Paragraph className="text-xs text-gray-500 mt-2 min-h-[54px]">{type.description}</Paragraph>
              <Button type="primary" block icon={<PlusOutlined />} onClick={() => openModal(type)} className="rounded-xl">
                Gửi
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Nội dung đã gửi" className="rounded-2xl border-gray-100 shadow-sm">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <List
            dataSource={records}
            locale={{ emptyText: 'Bạn chưa gửi nội dung nào tới HTX' }}
            renderItem={(record) => {
              const type = moduleLabels[record.module] || {};
              return (
                <List.Item className="!px-0">
                  <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <Space wrap className="mb-2">
                        <Tag color="green" className="rounded-full">{type.title || record.module}</Tag>
                        <Tag className="rounded-full">{statusLabels[record.status] || record.status}</Tag>
                      </Space>
                      <Text strong className="block">{record.title}</Text>
                      <Text className="text-sm text-gray-500">{record.description || 'Không có ghi chú.'}</Text>
                    </div>
                    <Text className="text-xs text-gray-400 shrink-0">{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Modal
        title={selectedType?.title}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Gửi tới HTX"
        cancelText="Hủy"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item name="documentType" label="Loại nội dung">
            <Select options={(selectedType?.typeOptions || []).map(item => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item name="priority" label="Mức độ">
            <Select options={[
              { value: 'Low', label: 'Thấp' },
              { value: 'Medium', label: 'Trung bình' },
              { value: 'High', label: 'Cao' },
              { value: 'Urgent', label: 'Khẩn cấp' },
            ]} />
          </Form.Item>
          <Form.Item name="location" label="Vị trí/xứ đồng">
            <Input placeholder="Ví dụ: Thôn 1, Bãi ven sông..." />
          </Form.Item>
          <Form.Item name="description" label="Nội dung chi tiết" rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết' }]}>
            <TextArea rows={4} placeholder="Mô tả cụ thể tình trạng, đề xuất hoặc yêu cầu..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmerHtxFeedback;
