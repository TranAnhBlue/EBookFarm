import React from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { setCredentials } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', {
          ...values,
          role: 'Farmer' // Vai trò mặc định cho đăng ký công khai
      });
      
      setCredentials(data.data, data.data.token);
      message.success('Tài khoản đã được tạo thành công!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại. Email hoặc Số điện thoại có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-green-200/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-200/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-5%] w-[30%] h-[30%] bg-blue-100/20 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-[520px] border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[40px] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-700 bg-white/80 backdrop-blur-xl border border-white/40">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-block p-5 bg-white shadow-xl shadow-green-100/50 rounded-[28px] mb-6 border border-green-50 animate-bounce-subtle">
              <img src={logo} alt="EBookFarm" className="h-14 w-14 object-contain" />
            </div>
            <Title level={2} className="!mb-2 !font-black text-gray-800 tracking-tight">Đăng ký thành viên</Title>
            <Paragraph className="text-gray-400 font-medium">Tham gia cộng đồng nông nghiệp số EBookFarm</Paragraph>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  name="fullname"
                  label={<Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Họ và tên nông dân</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="text-gray-300" />} 
                    placeholder="Nguyễn Văn A"
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 hover:border-green-400 focus:border-green-500 transition-all font-medium"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="phone"
              label={<Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Số điện thoại (Tài khoản)</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined className="text-gray-300" />} 
                placeholder="09xxxxxxxx"
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 hover:border-green-400 focus:border-green-500 transition-all font-medium"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Địa chỉ Email (Nếu có)</Text>}
              rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-300" />} 
                placeholder="example@gmail.com"
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 hover:border-green-400 focus:border-green-500 transition-all font-medium"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 ml-1">Mật khẩu bảo mật</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-300" />} 
                placeholder="••••••••"
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 hover:border-green-400 focus:border-green-500 transition-all"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-14 mt-6 bg-green-600 hover:bg-green-700 border-0 rounded-[20px] text-lg font-black shadow-[0_12px_24px_-8px_rgba(22,163,74,0.3)] hover:translate-y-[-2px] transition-all duration-300"
            >
              Đăng ký ngay
            </Button>
          </Form>

          <Divider className="my-10">
            <Text className="text-gray-300 text-[10px] font-bold uppercase tracking-[3px]">Đã có tài khoản?</Text>
          </Divider>

          <div className="text-center">
            <Link to="/login">
              <Button type="link" icon={<ArrowLeftOutlined />} className="text-green-600 font-black hover:text-green-700">
                Quay lại Đăng nhập
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
};

export default Register;
