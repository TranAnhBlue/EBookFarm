import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put(`/auth/reset-password/${token}`, { password: values.password });
      message.success('Đổi mật khẩu thành công!');
      setSuccess(true);
    } catch (error) {
      message.error(error.response?.data?.message || 'Link khôi phục không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-6">
        <Card className="w-full max-w-[480px] shadow-2xl rounded-[32px] p-8 text-center">
            <Result
                status="success"
                title={<span className="font-bold text-gray-800">Mật khẩu đã được thay đổi!</span>}
                subTitle="Bây giờ bạn có thể sử dụng mật khẩu mới để đăng nhập vào hệ thống."
                extra={[
                    <Button type="primary" key="login" size="large" className="rounded-xl px-12 premium-gradient border-0 shadow-lg" onClick={() => window.location.href = '/login'}>
                        Đăng nhập ngay
                    </Button>,
                ]}
            />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] relative overflow-hidden p-6">
      <Card className="w-full max-w-[480px] shadow-2xl rounded-[32px] border-white/50 bg-white/80 backdrop-blur-xl p-8 md:p-12 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 premium-gradient"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 mb-6">
            <LockOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!mb-1 !text-gray-800 font-bold tracking-tight">Đặt lại mật khẩu</Title>
          <Text className="text-gray-400 font-medium text-center">Vui lòng nhập mật khẩu mới cực kỳ bảo mật cho tài khoản của bạn.</Text>
        </div>
        
        <Form
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Mật khẩu mới" 
              className="rounded-xl h-12 border-gray-100"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Xác nhận mật khẩu" 
              className="rounded-xl h-12 border-gray-100"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full h-12 rounded-xl text-md font-bold shadow-xl shadow-green-200" 
                loading={loading}
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
