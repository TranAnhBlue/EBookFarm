import React from 'react';
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, RocketOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Leaf } from 'lucide-react';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', values);
      setCredentials(data.data, data.data.token);
      message.success('Đăng ký thành công! Hãy bắt đầu hành trình của bạn.');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại. Tên người dùng có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] relative overflow-hidden p-6">
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-green-300/20 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-[480px] shadow-2xl rounded-[32px] border-white/50 bg-white/80 backdrop-blur-xl p-8 md:p-12 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 premium-gradient"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 mb-6 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <Leaf className="w-9 h-9" />
          </div>
          <Title level={2} className="!mb-1 !text-gray-800 font-bold tracking-tight text-center">Tạo tài khoản mới</Title>
          <Text className="text-gray-400 font-medium text-center px-4">Tham gia cộng đồng nông nghiệp kỹ thuật số EBookFarm</Text>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="premium-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
            className="mb-5"
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Họ và tên hoặc Biệt danh" 
              className="rounded-xl h-12 border-gray-100 hover:border-green-400 focus:border-green-500"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
            className="mb-5"
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="Địa chỉ Gmail của bạn" 
              className="rounded-xl h-12 border-gray-100 hover:border-green-400 focus:border-green-500"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự' }
            ]}
            className="mb-10"
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Mật khẩu bảo mật" 
              className="rounded-xl h-12 border-gray-100 hover:border-green-400 focus:border-green-500"
            />
          </Form.Item>

          <Form.Item className="mb-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 rounded-xl text-md font-bold shadow-xl shadow-green-200" 
              loading={loading}
              icon={<RocketOutlined />}
            >
              Đăng ký tài khoản
            </Button>
          </Form.Item>
          
          <Divider plain className="border-gray-100">
            <Text className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Đã có tài khoản?</Text>
          </Divider>

          <div className="text-center mt-6">
            <Link to="/login" className="text-green-600 font-bold hover:underline">
              Quay lại trang Đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
      
      <div className="absolute bottom-8 text-center w-full text-green-800/40 text-[10px] uppercase font-bold tracking-widest pointer-events-none">
        Secure Infrastructure Powered by EBookFarm
      </div>
    </div>
  );
};

export default Register;
