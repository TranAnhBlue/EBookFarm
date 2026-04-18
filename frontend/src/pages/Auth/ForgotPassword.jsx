import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleFilled, WarningFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logo from '../../assets/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Backend expects { email }
      const { data } = await api.post('/auth/forgot-password', { email: values.email });
      message.success('Yêu cầu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
      if (data.resetLink) {
          setResetLink(data.resetLink);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Không tìm thấy tài khoản với Email này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-[540px] bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-2xl p-10 md:p-16 border border-white relative z-10 animate-in fade-in slide-in-from-bottom duration-700">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-8">
            <MailOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!font-black !text-gray-800 !mb-2 text-center">Quên mật khẩu?</Title>
          <Text className="text-gray-400 font-medium text-center px-4">
              Nhập email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
          </Text>
        </div>

        {!resetLink ? (
          <Form
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="premium-form"
          >
            <Form.Item
              name="email"
              label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Địa chỉ Email của bạn</span>}
              rules={[
                  { required: true, message: 'Vui lòng nhập Email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
              ]}
              className="mb-10"
            >
              <Input 
                prefix={<MailOutlined className="text-gray-300" />} 
                placeholder="example@farm.com" 
                className="rounded-2xl h-14 border-gray-100 focus:border-emerald-500"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg border-0 shadow-xl shadow-emerald-200"
              >
                Gửi link khôi phục
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-start gap-4">
               <CheckCircleFilled className="text-emerald-500 text-2xl mt-1" />
               <div>
                   <Text className="text-emerald-900 font-bold block mb-1 text-lg">Kiểm tra Email của bạn</Text>
                   <Text className="text-emerald-700/80 leading-relaxed font-medium">
                       Hệ thống đã gửi hướng dẫn khôi phục mật khẩu. (Dưới đây là link mô phỏng cho quá trình thử nghiệm)
                   </Text>
               </div>
            </div>
            
            <div className="bg-white/50 p-6 rounded-3xl border border-dashed border-emerald-200">
                <Text strong className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-3">Link mô phỏng (Test Only):</Text>
                <a href={resetLink} className="text-emerald-600 font-black break-all text-sm hover:underline">
                    {resetLink}
                </a>
            </div>

            <Alert
              message="Lưu ý"
              description="Link này chỉ có hiệu lực trong vòng 10 phút. Nếu không nhận được email, hãy kiểm tra thư rác."
              type="info"
              showIcon
              className="rounded-2xl border-blue-50 bg-blue-50/50"
            />
          </div>
        )}

        <div className="mt-12 text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-emerald-600 font-black hover:underline group">
              <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" /> 
              Quay lại Đăng nhập
            </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none w-full text-center">
        EBookFarm identity protection system
      </div>
    </div>
  );
};

export default ForgotPassword;
