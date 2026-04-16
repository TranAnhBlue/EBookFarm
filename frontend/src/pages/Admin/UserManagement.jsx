import React, { useState } from 'react';
import { Card, Table, Typography, Button, Space, Tag, Input, Modal, Form, Select, message, Popconfirm, Breadcrumb } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text } = Typography;

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(res => res.data.data)
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (values) => {
      if (editingUser) {
        return api.put(`/users/${editingUser._id}`, values);
      }
      return api.post('/users', values);
    },
    onSuccess: () => {
      message.success(`${editingUser ? 'Cập nhật' : 'Thêm mới'} người dùng thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      message.success('Đã xóa người dùng!');
      queryClient.invalidateQueries(['users']);
    }
  });

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 80,
      render: (_, __, index) => <Text className="font-medium text-gray-400">{index + 1}</Text>
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    {
      title: 'Họ tên',
      key: 'fullname',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-gray-700">{record.fullname || 'Chưa cập nhật'}</Text>
          <Text type="secondary" className="text-xs">{record.email || 'N/A'}</Text>
        </div>
      )
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Admin' ? 'purple' : 'cyan'} className="rounded-md font-bold px-3">
          {role}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'Active' ? 'success' : 'default'} 
          className="rounded-full px-4 border-0 font-bold"
        >
          {status === 'Active' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            className="text-blue-500 hover:bg-blue-50 rounded-lg"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa tài khoản này không?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              className="hover:bg-red-50 rounded-lg"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredData = users?.filter(u => 
    u.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumb Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Dashboard</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600">Tài khoản quản trị</span>
        </div>
        <Title level={4} className="!mb-0">Danh sách</Title>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Tìm kiếm..." 
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-64 h-10 rounded-xl border-gray-100 hover:border-green-300 focus:border-green-500"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button type="primary" className="h-10 rounded-xl px-6 bg-blue-500 hover:bg-blue-600 border-0 shadow-lg shadow-blue-100">Tìm kiếm</Button>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-6 rounded-xl premium-gradient border-0 shadow-xl shadow-green-100 font-bold"
          >
            Thêm mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="_id" 
          loading={isLoading}
          pagination={{ pageSize: 8, className: "px-2" }}
          className="premium-table-refined"
        />
      </Card>

      <Modal
        title={<span className="text-lg font-bold">{editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</span>}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        okText={editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
        cancelText="Để sau"
        centered
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          className="mt-4"
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Ví dụ: Nguyễn Văn A" className="h-11 rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined />} className="h-11 rounded-lg" disabled={!!editingUser} />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
            >
              <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="admin@gmail.com" className="h-11 rounded-lg" />
            </Form.Item>
          </div>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu initial"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password className="h-11 rounded-lg" />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label="Quyền hạn"
              initialValue="User"
            >
              <Select className="h-11 w-full" dropdownClassName="rounded-xl">
                <Select.Option value="Admin">Admin</Select.Option>
                <Select.Option value="User">Farmer (User)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              initialValue="Active"
            >
              <Select className="h-11 w-full">
                <Select.Option value="Active">Hoạt động</Select.Option>
                <Select.Option value="Inactive">Tạm khóa</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
