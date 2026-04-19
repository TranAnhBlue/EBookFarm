import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Typography, Statistic, Row, Col } from 'antd';
import { 
    PhoneOutlined, 
    MailOutlined, 
    ShopOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ConsultationManagement = () => {
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [form] = Form.useForm();

    // Fetch consultations
    const { data: consultationsData, isLoading } = useQuery({
        queryKey: ['consultations', selectedStatus],
        queryFn: async () => {
            const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
            const response = await api.get('/consultations', { params });
            return response.data;
        }
    });

    // Update consultation mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/consultations/${id}`, data),
        onSuccess: () => {
            message.success('Cập nhật thành công!');
            queryClient.invalidateQueries(['consultations']);
            setIsModalVisible(false);
            form.resetFields();
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    });

    // Delete consultation mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/consultations/${id}`),
        onSuccess: () => {
            message.success('Xóa thành công!');
            queryClient.invalidateQueries(['consultations']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    });

    const handleEdit = (record) => {
        setSelectedConsultation(record);
        form.setFieldsValue({
            status: record.status,
            notes: record.notes
        });
        setIsModalVisible(true);
    };

    const handleUpdate = (values) => {
        updateMutation.mutate({
            id: selectedConsultation._id,
            data: values
        });
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            contacted: 'blue',
            completed: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xử lý',
            contacted: 'Đã liên hệ',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return texts[status] || status;
    };

    // Calculate statistics
    const stats = {
        total: consultationsData?.total || 0,
        pending: consultationsData?.data?.filter(c => c.status === 'pending').length || 0,
        contacted: consultationsData?.data?.filter(c => c.status === 'contacted').length || 0,
        completed: consultationsData?.data?.filter(c => c.status === 'completed').length || 0
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => (
                <div className="space-y-1">
                    <Text className="block text-sm font-medium text-gray-900">{dayjs(date).format('DD/MM/YYYY')}</Text>
                    <Text className="block text-xs text-gray-500">{dayjs(date).format('HH:mm')}</Text>
                    <Text className="block text-xs text-blue-600 font-medium">{dayjs(date).fromNow()}</Text>
                </div>
            ),
            sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            defaultSortOrder: 'descend'
        },
        {
            title: 'Thông tin khách hàng',
            key: 'customer',
            width: 280,
            render: (_, record) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <UserOutlined className="text-green-600" />
                        </div>
                        <Text strong className="text-base">{record.fullname}</Text>
                    </div>
                    <div className="flex items-center gap-2 pl-10">
                        <PhoneOutlined className="text-gray-400 text-xs" />
                        <Text className="text-sm text-gray-700">{record.phone}</Text>
                    </div>
                    <div className="flex items-center gap-2 pl-10">
                        <MailOutlined className="text-gray-400 text-xs" />
                        <Text className="text-sm text-blue-600">{record.email}</Text>
                    </div>
                    {record.organization && (
                        <div className="flex items-center gap-2 pl-10">
                            <ShopOutlined className="text-gray-400 text-xs" />
                            <Text className="text-sm text-gray-600">{record.organization}</Text>
                        </div>
                    )}
                </div>
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
                    color={getStatusColor(status)} 
                    className="rounded-full px-4 py-1 font-medium text-sm"
                >
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Chờ xử lý', value: 'pending' },
                { text: 'Đã liên hệ', value: 'contacted' },
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Đã hủy', value: 'cancelled' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
            render: (notes) => notes ? (
                <Text className="text-sm text-gray-700">{notes}</Text>
            ) : (
                <Text className="text-sm text-gray-400 italic">Chưa có ghi chú</Text>
            )
        },
        {
            title: 'Người xử lý',
            dataIndex: 'contactedBy',
            key: 'contactedBy',
            width: 160,
            render: (contactedBy, record) => contactedBy ? (
                <div className="space-y-1">
                    <Text className="block text-sm font-medium text-gray-900">{contactedBy.fullname}</Text>
                    {record.contactedAt && (
                        <Text className="block text-xs text-gray-500">
                            {dayjs(record.contactedAt).format('DD/MM HH:mm')}
                        </Text>
                    )}
                </div>
            ) : (
                <Text className="text-sm text-gray-400 italic">Chưa xử lý</Text>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space direction="vertical" size="small" className="w-full">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                        className="bg-blue-500 w-full"
                        block
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa yêu cầu tư vấn"
                        description="Bạn có chắc chắn muốn xóa yêu cầu này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            block
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <HomeOutlined />
                <span>Quản lý</span>
                <span className="text-gray-200">/</span>
                <span className="text-green-600">Yêu cầu tư vấn</span>
            </div>

            <Title level={4} className="!mb-0">Quản lý yêu cầu tư vấn</Title>

            {/* Statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Tổng yêu cầu"
                            value={stats.total}
                            prefix={<UserOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Chờ xử lý"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#f97316' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Đã liên hệ"
                            value={stats.contacted}
                            prefix={<PhoneOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                            valueStyle={{ color: '#22c55e' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <Space size="middle">
                        <Text strong className="text-base">Lọc theo trạng thái:</Text>
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            style={{ width: 200 }}
                            size="large"
                            className="rounded-lg"
                        >
                            <Option value="all">
                                <Space>
                                    <span>Tất cả</span>
                                </Space>
                            </Option>
                            <Option value="pending">
                                <Space>
                                    <span>Chờ xử lý</span>
                                </Space>
                            </Option>
                            <Option value="contacted">
                                <Space>
                                    <span>Đã liên hệ</span>
                                </Space>
                            </Option>
                            <Option value="completed">
                                <Space>
                                    <span>Hoàn thành</span>
                                </Space>
                            </Option>
                            <Option value="cancelled">
                                <Space>
                                    <span>Đã hủy</span>
                                </Space>
                            </Option>
                        </Select>
                    </Space>
                    
                    <Text className="text-sm text-gray-500">
                        Hiển thị <Text strong className="text-green-600">{consultationsData?.data?.length || 0}</Text> / {consultationsData?.total || 0} yêu cầu
                    </Text>
                </div>

                <Table
                    columns={columns}
                    dataSource={consultationsData?.data || []}
                    rowKey="_id"
                    loading={isLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} yêu cầu`,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    className="consultation-table"
                    rowClassName={(record) => {
                        if (record.status === 'pending') return 'bg-orange-50';
                        if (record.status === 'completed') return 'bg-green-50';
                        return '';
                    }}
                />
            </Card>

            {/* Update Modal */}
            <Modal
                title="Cập nhật yêu cầu tư vấn"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                {selectedConsultation && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <UserOutlined />
                                <Text strong>{selectedConsultation.fullname}</Text>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneOutlined />
                                <Text>{selectedConsultation.phone}</Text>
                            </div>
                            <div className="flex items-center gap-2">
                                <MailOutlined />
                                <Text>{selectedConsultation.email}</Text>
                            </div>
                            {selectedConsultation.organization && (
                                <div className="flex items-center gap-2">
                                    <ShopOutlined />
                                    <Text>{selectedConsultation.organization}</Text>
                                </div>
                            )}
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdate}
                        >
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select size="large" className="rounded-lg">
                                    <Option value="pending">Chờ xử lý</Option>
                                    <Option value="contacted">Đã liên hệ</Option>
                                    <Option value="completed">Hoàn thành</Option>
                                    <Option value="cancelled">Đã hủy</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="notes"
                                label="Ghi chú"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Thêm ghi chú về cuộc trao đổi, yêu cầu của khách hàng..."
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item className="mb-0">
                                <Space className="w-full justify-end">
                                    <Button onClick={() => setIsModalVisible(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={updateMutation.isLoading}
                                        className="bg-green-600"
                                    >
                                        Cập nhật
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ConsultationManagement;
