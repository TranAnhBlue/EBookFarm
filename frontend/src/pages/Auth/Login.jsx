import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Divider, Checkbox } from 'antd';
import { LockOutlined, ArrowRightOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', {
          identifier: values.email, // Backend expects identifier (email/username)
          password: values.password
      });
      setCredentials(data.data, data.data.token);
      message.success('Đăng nhập thành công! Chào mừng trở lại EBookFarm.');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
      try {
          setLoading(true);
          const { data } = await api.post('/auth/google', { 
              tokenId: credentialResponse.credential // Pass the ID Token (JWT)
          });
          setCredentials(data.data, data.data.token);
          message.success('Đăng nhập Google thành công!');
          navigate('/dashboard');
      } catch (error) {
          message.error('Xác thực Google thất bại. Vui lòng thử lại.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex md:w-1/2 bg-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-800"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-10 h-10 object-contain p-1 mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col text-white">
                        <span className="font-black text-lg leading-none uppercase tracking-tighter">EBookFarm</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Agri-tech Solution</span>
                    </div>
                </div>

                <Title level={1} className="!text-white !font-black !text-4xl !mb-6 leading-tight">
                    Chào mừng bạn quay lại hệ thống
                </Title>
                <Paragraph className="text-emerald-50/80 text-lg leading-relaxed max-w-[320px]">
                    Tiếp tục quản lý nông trại và theo dõi nhật ký sản xuất chuẩn quốc gia ngay hôm nay.
                </Paragraph>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                        <ArrowRightOutlined className="text-xl" />
                    </div>
                    <Text className="text-white font-bold">500+ Nông trại đã tin dùng</Text>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <div className="mb-10 block md:hidden">
                <img src={logo} alt="Logo" className="h-12 w-auto mb-6" />
            </div>

            <div className="mb-10">
                <Title level={2} className="!font-black !text-gray-800 !mb-2">Đăng nhập</Title>
                <Text className="text-gray-400 font-medium tracking-tight">Vui lòng nhập thông tin để truy cập hệ thống</Text>
            </div>

            <Form
                name="login"
                layout="vertical"
                size="large"
                onFinish={onFinish}
                autoComplete="off"
                className="premium-form"
            >
                <Form.Item
                    name="email"
                    label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Email hoặc Tên tài khoản</span>}
                    rules={[{ required: true, message: 'Thông tin này là bắt buộc!' }]}
                >
                    <Input 
                        prefix={<MailOutlined className="text-gray-300" />} 
                        placeholder="example@farm.com" 
                        className="rounded-2xl h-14 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all font-medium"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Mật khẩu bảo mật</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password 
                        prefix={<LockOutlined className="text-gray-300" />} 
                        placeholder="••••••••" 
                        className="rounded-2xl h-14 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all font-medium"
                    />
                </Form.Item>

                <div className="flex justify-between items-center mb-8">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="text-gray-500 font-bold text-xs capitalize">Ghi nhớ tôi</Checkbox>
                    </Form.Item>
                    <Link to="/forgot-password" className="text-emerald-600 font-bold text-xs hover:underline">
                        Quên mật khẩu?
                    </Link>
                </div>

                <Form.Item className="mb-8">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg border-0 shadow-xl shadow-emerald-200"
                    >
                        Đăng nhập ngay
                    </Button>
                </Form.Item>

                <Divider plain className="border-gray-100">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[2px]">Hoặc sử dụng Google</span>
                </Divider>

                <div className="flex justify-center mt-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => message.error('Không thể kết nối với máy chủ Google.')}
                        useOneTap
                        shape="pill"
                        theme="outline"
                        width="100%"
                    />
                </div>
            </Form>

            <div className="mt-12 text-center">
                <Text className="text-gray-400 font-medium">Bạn chưa có tài khoản? </Text>
                <Link to="/register" className="text-emerald-600 font-black hover:underline px-1">
                    Đăng ký miễn phí
                </Link>
            </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none">
        Copyright 2026 © EBookFarm Security Standard
      </div>
    </div>
  );
};

export default Login;
