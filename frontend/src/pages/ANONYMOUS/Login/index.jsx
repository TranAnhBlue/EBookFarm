import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Divider, Checkbox } from 'antd';
import { LockOutlined, ArrowRightOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';

import authSession from 'src/services/core/authSession';
import logo from 'src/assets/logo-ebookfarm.jpg';
import AuthService from 'src/services/AuthService'

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const setCredentials = (user, token) => authSession.setSessionTokens({ user, token });
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();

  // Load remembered account
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      form.setFieldsValue({ 
        email: rememberedEmail,
        remember: true 
      });
    }
  }, [form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await AuthService.login({
          identifier: values.email, 
          password: values.password
      });

      // Handle Remember Me
      if (values.remember) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

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
          const { data } = await AuthService.googleLogin({ 
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-6 bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-[1000px] mx-auto flex flex-col md:flex-row bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex md:w-1/2 bg-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-800"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="relative z-10">
                <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border border-white/20 p-2">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col text-white">
                        <span className="font-black text-2xl leading-none uppercase tracking-tighter">EBookFarm</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-emerald-100">Agri-tech Solution</span>
                    </div>
                </Link>

                <Title level={1} className="!text-white !font-black !text-4xl !mb-6 leading-tight">
                    Chào mừng bạn quay lại hệ thống
                </Title>
                <Paragraph className="text-emerald-50/80 text-lg leading-relaxed max-w-[320px]">
                    Tiếp tục quản lý nông trại và theo dõi nhật ký sản xuất chuẩn quốc gia ngay hôm nay.
                </Paragraph>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border border-gray-100 p-2">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <Text className="font-black text-2xl text-gray-800 tracking-tighter uppercase">EBookFarm</Text>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-5 sm:p-10 md:p-16 flex flex-col justify-center">
            <div className="mb-4 md:mb-10 block md:hidden">
                <Link to="/">
                    <img src={logo} alt="Logo" className="h-8 w-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" />
                </Link>
            </div>

            <div className="mb-6 md:mb-10">
                <Title level={3} className="!font-black !text-gray-800 !mb-1 md:!text-3xl">Đăng nhập</Title>
                <Text className="text-gray-400 font-medium tracking-tight text-xs md:text-sm">Vui lòng nhập thông tin để truy cập hệ thống</Text>
            </div>

            <Form
                form={form}
                name="login"
                layout="vertical"
                size="large"
                onFinish={onFinish}
                autoComplete="off"
                className="premium-form"
            >
                <Form.Item
                    name="email"
                    label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Email hoặc Tên tài khoản</span>}
                    rules={[{ required: true, message: 'Thông tin này là bắt buộc!' }]}
                    className="mb-3 md:mb-6"
                >
                    <Input 
                        prefix={<MailOutlined className="text-gray-300" />} 
                        placeholder="example@farm.com" 
                        className="rounded-xl h-12 md:h-14 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all font-medium text-sm md:text-base"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Mật khẩu bảo mật</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    className="mb-4 md:mb-6"
                >
                    <Input.Password 
                        prefix={<LockOutlined className="text-gray-300" />} 
                        placeholder="••••••••" 
                        className="rounded-xl h-12 md:h-14 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all font-medium text-sm md:text-base"
                    />
                </Form.Item>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6 md:mb-8">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="text-gray-500 font-bold text-[11px] capitalize">Ghi nhớ tôi</Checkbox>
                    </Form.Item>
                    <Link to="/forgot-password" alt="Quên mật khẩu" className="text-emerald-600 font-bold text-[11px] hover:underline">
                        Quên mật khẩu?
                    </Link>
                </div>

                <Form.Item className="mb-6 md:mb-8">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="w-full h-12 md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base md:text-lg border-0 shadow-xl shadow-emerald-200"
                    >
                        Đăng nhập ngay
                    </Button>
                </Form.Item>

                <Divider plain className="border-gray-100">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[2px]">Hoặc sử dụng Google</span>
                </Divider>

                <div className="flex justify-center mt-4 md:mt-6 w-full">
                    <div className="max-w-full mx-auto overflow-hidden flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => message.error('Không thể kết nối với máy chủ Google.')}
                            shape="pill"
                            theme="outline"
                            width="280"
                        />
                    </div>
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
