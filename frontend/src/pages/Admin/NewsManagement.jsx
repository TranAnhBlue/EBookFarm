import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Typography, message, Card, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NewsManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: newsList, isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: () => api.get('/news').then(res => res.data.data)
    });

    const createMutation = useMutation({
        mutationFn: (values) => api.post('/news', values),
        onSuccess: () => {
            message.success('Đã đăng tin tức mới');
            queryClient.invalidateQueries(['news']);
            handleCancel();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }) => api.put(`/news/${id}`, values),
        onSuccess: () => {
            message.success('Đã cập nhật tin tức');
            queryClient.invalidateQueries(['news']);
            handleCancel();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/news/${id}`),
        onSuccess: () => {
            message.success('Đã xóa tin tức');
            queryClient.invalidateQueries(['news']);
        }
    });

    const handleEdit = (record) => {
        setEditingNews(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingNews(null);
        form.resetFields();
    };

    const onFinish = (values) => {
        if (editingNews) {
            updateMutation.mutate({ id: editingNews._id, values });
        } else {
            createMutation.mutate(values);
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="flex flex-col">
                    <Text strong className="text-gray-800">{text}</Text>
                    <Text type="secondary" className="text-xs line-clamp-1">{record.summary}</Text>
                </div>
            )
        },
        {
            title: 'Chuyên mục',
            dataIndex: 'category',
            key: 'category',
            render: (category) => {
                let color = 'blue';
                if (category === 'Thông báo') color = 'orange';
                if (category === 'Công nghệ') color = 'purple';
                if (category === 'Sản xuất') color = 'green';
                return <Tag color={color} className="rounded-full px-3">{category}</Tag>;
            }
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <Text className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <CalendarOutlined /> {new Date(date).toLocaleDateString('vi-VN')}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                      type="text" 
                      icon={<EditOutlined className="text-blue-500" />} 
                      onClick={() => handleEdit(record)} 
                      className="hover:bg-blue-50"
                    />
                    <Popconfirm
                        title="Xóa bài viết?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => deleteMutation.mutate(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined className="text-red-500" />} 
                          className="hover:bg-red-50"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                        <FileTextOutlined className="text-2xl text-green-600" />
                    </div>
                    <div>
                        <Title level={4} className="!mb-0">Quản lý tin tức hệ thống</Title>
                        <Text type="secondary">Cập nhật thông tin, xu hướng và thông báo tới người dùng</Text>
                    </div>
                </div>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 rounded-xl h-12 px-6 font-bold shadow-lg shadow-green-100"
                >
                    Thêm tin mới
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-100">
                <Table 
                    columns={columns} 
                    dataSource={newsList} 
                    loading={isLoading} 
                    rowKey="_id"
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={editingNews ? "Chỉnh sửa tin tức" : "Đăng tin mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={700}
                className="news-modal"
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ category: 'Sản xuất', isPublished: true }}
                    className="mt-6"
                >
                    <Form.Item name="title" label={<Text strong>Tiêu đề</Text>} rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                        <Input placeholder="VD: Hợp tác xã Krông Pắc đẩy mạnh xuất khẩu..." className="rounded-lg h-10" />
                    </Form.Item>

                    <Form.Item name="category" label={<Text strong>Chuyên mục</Text>} rules={[{ required: true }]}>
                        <Select className="rounded-lg h-10 w-full">
                            <Option value="Sản xuất">Sản xuất</Option>
                            <Option value="Công nghệ">Công nghệ</Option>
                            <Option value="Thị trường">Thị trường</Option>
                            <Option value="Thông báo">Thông báo</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="summary" label={<Text strong>Mô tả ngắn</Text>} rules={[{ required: true, message: 'Nhập mô tả tóm tắt' }]}>
                        <TextArea rows={2} placeholder="Tóm tắt ngắn gọn nội dung tin tức..." className="rounded-lg" />
                    </Form.Item>

                    <Form.Item name="image" label={<Text strong>Link ảnh minh họa</Text>}>
                        <Input placeholder="https://..." className="rounded-lg h-10" />
                    </Form.Item>

                    <Form.Item name="content" label={<Text strong>Nội dung chi tiết</Text>}>
                        <TextArea rows={6} placeholder="Nội dung bài viết..." className="rounded-lg" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button onClick={handleCancel} className="rounded-lg h-10 px-6">Hủy</Button>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={createMutation.isPending || updateMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 rounded-lg h-10 px-8 font-bold"
                        >
                            {editingNews ? "Cập nhật" : "Đăng bài"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default NewsManagement;
