import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Leaf, ExternalLink } from 'lucide-react';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', values);
      message.success('Đã tạo link khôi phục mật khẩu!');
      // Catch the simulated link for testing
      if (data.resetLink) {
          setResetLink(data.resetLink);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Không tìm thấy người dùng này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] relative overflow-hidden p-6">
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-[480px] shadow-2xl rounded-[32px] border-white/50 bg-white/80 backdrop-blur-xl p-8 md:p-12 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 premium-gradient"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 mb-6">
            <MailOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!mb-1 !text-gray-800 font-bold tracking-tight">Quên mật khẩu?</Title>
          <Text className="text-gray-400 font-medium text-center">Đừng lo, hãy nhập tên đăng nhập để nhận link khôi phục.</Text>
        </div>
        
        {!resetLink ? (
          <Form
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              className="mb-8"
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="Tên đăng nhập" 
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
                Gửi link khôi phục
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="space-y-6">
            <Alert
              message="Yêu cầu thành công"
              description="Hệ thống đã tạo link khôi phục (Đây là bản mô phỏng trả về từ API)."
              type="success"
              showIcon
              className="rounded-xl border-green-100 bg-green-50"
            />
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 break-all">
                <Text strong className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Mô phỏng Email Link:</Text>
                <a href={resetLink} className="text-green-600 font-bold text-xs hover:underline flex items-center gap-2">
                    {resetLink} <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <Text className="text-[11px] text-gray-400 block text-center">
                Link khôi phục này sẽ hết hạn sau 10 phút.
            </Text>
          </div>
        )}

        <div className="text-center mt-12">
            <Link to="/login" className="text-green-600 font-bold hover:underline">
              Quay lại Đăng nhập
            </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
