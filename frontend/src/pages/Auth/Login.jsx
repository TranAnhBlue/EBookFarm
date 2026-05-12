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
      const { data } = await api.post('/auth/login', {
          identifier: values.email, 
          password: values.password
      });

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
          const { data } = await api.post('/auth/google', { 
              tokenId: credentialResponse.credential 
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-green-200/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-200/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-100/20 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-[480px] border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[40px] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-700 bg-white/80 backdrop-blur-xl border border-white/40">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-block p-5 bg-white shadow-xl shadow-green-100/50 rounded-[28px] mb-6 border border-green-50 animate-bounce-subtle">
              <img src={logo} alt="EBookFarm" className="h-14 w-14 object-contain" />
            </div>
            <Title level={2} className="!mb-2 !font-black text-gray-800 tracking-tight">Chào mừng trở lại</Title>
            <Paragraph className="text-gray-400 font-medium">Hệ thống quản lý nhật ký sản xuất EBookFarm</Paragraph>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Email / Số điện thoại</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-300" />} 
                placeholder="09xxxxxxxx"
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 hover:border-green-400 focus:border-green-500 transition-all font-medium"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <div className="flex justify-between w-full items-end">
                  <Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Mật khẩu</Text>
                  <Link to="/forgot-password" size="small" className="text-[11px] font-bold text-green-600 hover:text-green-700">Quên mật khẩu?</Link>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-300" />} 
                placeholder="••••••••"
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 hover:border-green-400 focus:border-green-500 transition-all"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-8 ml-1">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-500 font-bold text-xs">Ghi nhớ tôi</Checkbox>
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-14 bg-green-600 hover:bg-green-700 border-0 rounded-[20px] text-lg font-black shadow-[0_12px_24px_-8px_rgba(22,163,74,0.3)] hover:translate-y-[-2px] transition-all duration-300"
            >
              Đăng nhập ngay
            </Button>

            <Divider className="my-8">
              <Text className="text-gray-300 text-[10px] font-bold uppercase tracking-[3px]">Hoặc</Text>
            </Divider>

            <div className="flex justify-center mb-10">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => message.error('Đăng nhập Google thất bại.')}
                shape="pill"
                theme="outline"
                text="signin_with"
                width="320"
              />
            </div>
          </Form>

          <div className="text-center">
            <Text className="text-gray-400 font-medium">Bạn mới biết đến EBookFarm?</Text>
            <Link to="/register">
              <Button type="link" className="text-green-600 font-black hover:text-green-700 ml-1">
                Đăng ký Farmer
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase font-black tracking-[4px] text-gray-400/40 pointer-events-none">
        Copyright 2026 © EBookFarm Security Standard
      </div>
    </div>
  );
};t-0 right-0 text-center text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none">
        Copyright 2026 © EBookFarm Security Standard
      </div>
    </div>
  );
};

export default Login;
