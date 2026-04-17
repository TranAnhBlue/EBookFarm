import React from 'react';
import { Card, Typography, Form, Input, Button, Avatar, Space, message, Divider, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, HomeOutlined, SaveOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text } = Typography;

const AccountInfo = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const updateMutation = useMutation({
    mutationFn: (values) => {
      const updateData = {
        fullname: values.fullname,
        email: values.email
      };
      return api.put('/users/profile', updateData);
    },
    onSuccess: (res) => {
      setUser(res.data.data);
      message.success('Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => message.error(err.message || err.response?.data?.message || 'Có lỗi xảy ra!')
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Dashboard</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600">Thông tin tài khoản</span>
        </div>
        <Title level={4} className="!mb-0">Hồ sơ cá nhân</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col span={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 h-full">
            <Avatar 
                size={100} 
                icon={<UserOutlined />} 
                className="bg-green-50 text-green-600 border-4 border-white shadow-lg mb-4"
            />
            <Title level={4} className="!mb-0">{user?.fullname || user?.username}</Title>
            <Text type="secondary" className="text-xs uppercase font-bold tracking-widest text-green-600">{user?.role}</Text>
            
            <Divider className="my-6" />
            
            <div className="space-y-4 text-left px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <UserOutlined />
                    </div>
                    <div>
                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Username</Text>
                        <Text strong>@{user?.username}</Text>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <MailOutlined />
                    </div>
                    <div>
                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Email liên hệ</Text>
                        <Text strong>{user?.email || 'Chưa cập nhật'}</Text>
                    </div>
                </div>
            </div>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col span={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-[24px] p-4">
             <Title level={5} className="mb-6 flex items-center gap-2">
                 <EditOutlined className="text-green-500" />
                 Thay đổi thông tin
             </Title>
             
             <Form
                form={form}
                layout="vertical"
                initialValues={user}
                onFinish={(values) => updateMutation.mutate(values)}
             >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="fullname"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Nhập họ tên!' }]}
                    >
                        <Input className="h-11 rounded-lg" prefix={<UserOutlined className="text-gray-300" />} />
                    </Form.Item>
                    
                    <Form.Item
                        name="email"
                        label="Địa chỉ Email"
                        rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                    >
                        <Input className="h-11 rounded-lg" prefix={<MailOutlined className="text-gray-300" />} />
                    </Form.Item>
                </div>

                <div className="flex justify-end mt-4">
                    <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={() => form.submit()}
                        loading={updateMutation.isLoading}
                        className="h-11 px-8 rounded-xl premium-gradient border-0 font-bold shadow-lg shadow-green-100"
                    >
                        Lưu thông tin hồ sơ
                    </Button>
                </div>
             </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountInfo;
