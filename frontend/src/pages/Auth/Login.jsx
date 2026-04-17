import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined, GoogleOutlined } from '@ant-design/icons';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Leaf } from 'lucide-react';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', values);
      setCredentials(data.data, data.data.token);
      message.success('Đăng nhập thành công! Chào mừng trở lại.');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const { data } = await api.post('/auth/google', { tokenId: tokenResponse.access_token });
        setCredentials(data.data, data.data.token);
        message.success('Đăng nhập Google thành công! Chào mừng đến với EBookFarm.');
        navigate('/');
      } catch (error) {
        message.error('Đăng nhập Google thất bại. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => message.error('Không thể kết nối với tài khoản Google.')
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] relative overflow-hidden p-6">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-green-300/20 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-[480px] shadow-2xl rounded-[32px] border-white/50 bg-white/80 backdrop-blur-xl p-8 md:p-12 relative z-10 overflow-hidden">
        {/* Progress bar top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 premium-gradient"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 mb-6 transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <Leaf className="w-9 h-9" />
          </div>
          <Title level={2} className="!mb-1 !text-gray-800 font-bold tracking-tight">Chào mừng trở lại</Title>
          <Text className="text-gray-400 font-medium">Hệ thống quản lý nông trại EBookFarm AI</Text>
        </div>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="premium-form"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
            className="mb-6"
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Email / Gmail" 
              className="rounded-xl h-12 border-gray-100 hover:border-green-400 focus:border-green-500"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            className="mb-2"
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Mật khẩu" 
              className="rounded-xl h-12 border-gray-100 hover:border-green-400 focus:border-green-500"
            />
          </Form.Item>

          <div className="text-right mb-8">
            <Link to="/forgot-password" size="small" className="text-green-600 font-bold text-xs hover:text-green-700">
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item className="mb-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 rounded-xl text-md font-bold shadow-xl shadow-green-200" 
              loading={loading}
              icon={<ArrowRightOutlined />}
            >
              Đăng nhập ngay
            </Button>
          </Form.Item>
          
          <Divider plain className="border-gray-100">
            <Text className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Hoặc tiếp tục với</Text>
          </Divider>

          <Button 
            block 
            icon={<GoogleOutlined />} 
            onClick={() => googleLogin()}
            className="h-12 rounded-xl font-bold border-gray-100 shadow-sm hover:border-green-400 hover:text-green-600 mb-6 flex items-center justify-center gap-2"
          >
            Tài khoản Google
          </Button>

          <div className="text-center mt-6">
            <Text className="text-gray-400 font-medium">Chưa có tài khoản? </Text>
            <Link to="/register" className="text-green-600 font-bold hover:underline">
              Sẵn sàng tham gia!
            </Link>
          </div>
        </Form>
      </Card>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full text-green-800/40 text-[10px] uppercase font-bold tracking-widest pointer-events-none">
        Copyright © 2026 EBookFarm AI Ecosystem
      </div>
    </div>
  );
};

export default Login;
