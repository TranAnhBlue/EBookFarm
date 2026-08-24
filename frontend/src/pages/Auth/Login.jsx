import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Divider, Checkbox } from 'antd';
import { LockOutlined, ArrowRightOutlined, GoogleOutlined, MailOutlined, TeamOutlined, HomeOutlined } from '@ant-design/icons';
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
  const [userType, setUserType] = React.useState(null); // 'household' | 'htx'
  const [step, setStep] = React.useState('select-type'); // 'select-type' | 'login'

  // Load remembered account
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const savedType = localStorage.getItem('userType');
    if (savedType) {
      setUserType(savedType);
      setStep('login');
    }
    if (rememberedEmail) {
      form.setFieldsValue({ email: rememberedEmail, remember: true });
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

      // Save user type preference
      if (userType) localStorage.setItem('userType', userType);

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
      if (userType) localStorage.setItem('userType', userType);
      message.success('Đăng nhập Google thành công!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Xác thực Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (type) => {
    setUserType(type);
    setStep('login');
  };

  const typeOptions = [
    {
      key: 'htx',
      icon: '🏛️',
      label: 'HTX / Hợp tác xã',
      sub: 'Tổ chức có nhiều hộ thành viên, nhiều vườn, nhiều cây',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      border: '#16a34a',
      bg: '#f0fdf4',
      textColor: '#14532d',
    },
    {
      key: 'household',
      icon: '🏡',
      label: 'Hộ Kinh Doanh',
      sub: 'Cá nhân / hộ gia đình sản xuất độc lập',
      gradient: 'linear-gradient(135deg, #d97706 0%, #eab308 100%)',
      border: '#d97706',
      bg: '#fefce8',
      textColor: '#78350f',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 50%, #fff7ed 100%)' }}>

      {/* Background decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(22,163,74,0.15)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(234,179,8,0.12)' }} />
      <div className="absolute top-[30%] right-[-5%] w-[25%] h-[25%] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.10)' }} />

      <div className="w-full max-w-[520px] relative z-10">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white shadow-xl rounded-[24px] mb-4 border border-green-50">
            <img src={logo} alt="EBookFarm" className="h-14 w-14 object-contain" />
          </div>
          <Title level={2} className="!mb-1 !font-black" style={{ color: '#14532d' }}>
            Nhật Ký Điện Tử
          </Title>
          <Text className="font-medium" style={{ color: '#16a34a' }}>EBookFarm – Minh bạch, đúng chuẩn, dễ dùng</Text>
        </div>

        {step === 'select-type' ? (
          /* === Step 1: Chọn loại người dùng === */
          <Card className="rounded-[40px] border-0 overflow-hidden"
            style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
            styles={{ body: { padding: '2.5rem' } }}>

            <div className="text-center mb-8">
              <Title level={4} className="!mb-2 !font-black !text-gray-800">Bạn là ai?</Title>
              <Text className="text-gray-400">Chọn đúng loại tài khoản để được hỗ trợ tốt nhất</Text>
            </div>

            <div className="space-y-4">
              {typeOptions.map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => handleSelectType(opt.key)}
                  className="relative rounded-[24px] p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                  style={{ background: opt.bg, border: `2px solid ${opt.border}30` }}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg"
                      style={{ background: opt.gradient }}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text strong className="text-lg font-black block" style={{ color: opt.textColor }}>
                        {opt.label}
                      </Text>
                      <Text className="text-gray-500 text-sm">{opt.sub}</Text>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:translate-x-1"
                      style={{ background: opt.gradient }}>
                      <ArrowRightOutlined className="text-white text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Text className="text-gray-400 text-sm">Chưa có tài khoản? </Text>
              <Link to="/register">
                <Button type="link" className="font-black p-0" style={{ color: '#16a34a' }}>Đăng ký ngay</Button>
              </Link>
            </div>
          </Card>

        ) : (
          /* === Step 2: Form đăng nhập === */
          <Card className="rounded-[40px] border-0 overflow-hidden"
            style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
            styles={{ body: { padding: '2.5rem' } }}>

            {/* Selected type badge */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: userType === 'htx' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #d97706, #eab308)' }}>
                  {userType === 'htx' ? '🏛️' : '🏡'}
                </div>
                <div>
                  <Text className="font-black text-gray-800 block text-sm">
                    {userType === 'htx' ? 'HTX / Hợp tác xã' : 'Hộ Kinh Doanh'}
                  </Text>
                  <button
                    onClick={() => setStep('select-type')}
                    className="text-[11px] font-bold underline cursor-pointer border-none bg-transparent p-0"
                    style={{ color: '#16a34a' }}>
                    Đổi loại
                  </button>
                </div>
              </div>
              <Title level={4} className="!mb-0 !font-black !text-gray-800">Đăng nhập</Title>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" requiredMark={false}>
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
                label={<Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Mật khẩu bảo mật</Text>}
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
                <Link to="/forgot-password" size="small" className="text-xs font-bold hover:opacity-80 transition-opacity" style={{ color: '#16a34a' }}>
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-14 border-0 rounded-[20px] text-lg font-black hover:translate-y-[-2px] transition-all duration-300"
                style={{ background: userType === 'htx' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #d97706, #eab308)' }}
              >
                Đăng nhập ngay
              </Button>

              <Divider className="my-8">
                <Text className="text-gray-300 text-[10px] font-bold uppercase tracking-[3px]">Hoặc</Text>
              </Divider>

              <div className="flex justify-center mb-6">
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
              <Text className="text-gray-400 font-medium">Bạn mới biết đến EBookFarm? </Text>
              <Link to="/register">
                <Button type="link" className="font-black p-0" style={{ color: '#16a34a' }}>
                  Đăng ký ngay
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
