import React from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
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
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-300/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-[480px] border-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden relative z-10">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-green-50 rounded-[24px] mb-6 animate-bounce-subtle">
              <img src={logo} alt="EBookFarm" className="h-12 w-12 object-contain" />
            </div>
            <Title level={2} className="!mb-2 !font-bold text-gray-800">Đăng ký Farmer</Title>
            <Paragraph className="text-gray-400 mb-0">Hợp tác cùng EBookFarm - Chuyển đổi số nông nghiệp</Paragraph>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="fullname"
              label={<Text className="text-xs font-bold uppercase tracking-wider text-gray-400">Họ và tên</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-300" />} 
                placeholder="Nguyễn Văn A"
                className="h-12 rounded-xl bg-gray-50 border-gray-100 hover:border-green-400 focus:border-green-500"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<Text className="text-xs font-bold uppercase tracking-wider text-gray-400">Số điện thoại (Tài khoản)</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined className="text-gray-300" />} 
                placeholder="0912345678"
                className="h-12 rounded-xl bg-gray-50 border-gray-100"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text className="text-xs font-bold uppercase tracking-wider text-gray-400">Địa chỉ Email</Text>}
              rules={[
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-300" />} 
                placeholder="example@gmail.com"
                className="h-12 rounded-xl bg-gray-50 border-gray-100"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text className="text-xs font-bold uppercase tracking-wider text-gray-400">Mật khẩu</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-300" />} 
                placeholder="••••••••"
                className="h-12 rounded-xl bg-gray-50 border-gray-100"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-14 mt-4 bg-green-600 hover:bg-green-700 border-0 rounded-2xl text-lg font-bold shadow-[0_10px_20px_rgba(22,163,74,0.2)]"
            >
              Tạo tài khoản Farmer
            </Button>
          </Form>

          <Divider className="my-8"><Text className="text-gray-300 text-xs uppercase tracking-widest">Đã có tài khoản?</Text></Divider>

          <div className="text-center">
            <Link to="/login">
              <Button type="link" icon={<ArrowLeftOutlined />} className="text-green-600 font-bold hover:text-green-700">
                Quay lại Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none">
        Digital Agriculture Transformation Initiative
      </div>
    </div>
  );
};

export default Register;
