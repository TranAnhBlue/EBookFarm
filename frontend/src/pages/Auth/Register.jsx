import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Divider, Steps, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowRightOutlined, RocketFilled, SafetyCertificateFilled } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', {
          ...values,
          role: 'Farmer' // Default role for public registration
      });
      setCredentials(data.data, data.data.token);
      message.success('Tài khoản đã được tạo thành công! Chào mừng bạn đến với EBookFarm.');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại. Email hoặc tên tài khoản có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row-reverse bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Side Banner: Benefits */}
        <div className="hidden md:flex md:w-5/12 bg-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-800"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10">
                <Title level={1} className="!text-white !font-black !text-4xl !mb-8 leading-tight">
                    Bắt đầu hành trình nông nghiệp số
                </Title>
                
                <div className="space-y-8">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <RocketFilled className="text-white text-lg" />
                        </div>
                        <div>
                            <Text className="text-white font-bold block mb-1">Thiết lập nhanh</Text>
                            <Text className="text-emerald-50/60 text-xs">Chỉ mất 2 phút để bắt đầu quản lý nông trại đầu tiên của bạn.</Text>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <SafetyCertificateFilled className="text-white text-lg" />
                        </div>
                        <div>
                            <Text className="text-white font-bold block mb-1">Chuẩn TCVN/VietGAP</Text>
                            <Text className="text-emerald-50/60 text-xs">Phần mềm tuân thủ nghiêm ngặt các tiêu chuẩn nông nghiệp sạch.</Text>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                <Text className="text-white/80 text-xs font-medium italic italic">
                    "EBookFarm giúp chúng tôi chuyên nghiệp hóa quy trình sản xuất và nâng cao giá trị thương phẩm."
                </Text>
            </div>
        </div>

        {/* Form Content */}
        <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center bg-white/40">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 shadow-xl flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <Text className="font-black text-xl text-gray-800 tracking-tighter uppercase">EBookFarm</Text>
                </div>
                <Title level={2} className="!font-black !text-gray-800 !mb-2">Tạo tài khoản</Title>
                <Text className="text-gray-400 font-medium">Bắt đầu miễn phí ngay hôm nay</Text>
            </div>

            <Form
                name="register"
                layout="vertical"
                size="large"
                onFinish={onFinish}
                className="premium-form"
            >
                <Row gutter={20}>
                    <Col span={24}>
                        <Form.Item
                            name="fullname"
                            label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Họ và tên chủ sở hữu</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input 
                                placeholder="Nguyễn Văn A" 
                                className="rounded-2xl h-14 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all font-medium"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="username"
                            label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Tên tài khoản</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                        >
                            <Input 
                                prefix={<UserOutlined className="text-gray-300" />} 
                                placeholder="nva_farm" 
                                className="rounded-2xl h-14 border-gray-100"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="email"
                            label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Địa chỉ Email</span>}
                            rules={[
                                { required: true, message: 'Email là bắt buộc!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input 
                                prefix={<MailOutlined className="text-gray-300" />} 
                                placeholder="example@gmail.com" 
                                className="rounded-2xl h-14 border-gray-100"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="password"
                            label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Thiết lập mật khẩu</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                            ]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined className="text-gray-300" />} 
                                placeholder="••••••••" 
                                className="rounded-2xl h-14 border-gray-100"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item className="mt-4 mb-8">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg border-0 shadow-xl shadow-emerald-200"
                    >
                        Tạo tài khoản ngay
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center">
                <Text className="text-gray-400 font-medium">Bạn đã có tài khoản? </Text>
                <Link to="/login" className="text-emerald-600 font-black hover:underline px-1">
                    Đăng nhập tại đây
                </Link>
            </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none">
        Digital Agriculture Transformation Initiative
      </div>
    </div>
  );
};

export default Register;
