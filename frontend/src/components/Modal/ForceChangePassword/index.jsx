import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert, Typography, Divider } from 'antd';
import { LockOutlined, KeyOutlined, SafetyOutlined } from '@ant-design/icons';
import api from 'src/services/01_axios';
import authSession from 'src/services/core/authSession';

const { Title, Text } = Typography;

const ForceChangePasswordModal = ({ visible, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const setUser = (user) => authSession.updateUser(user);;

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await http.put('/auth/force-change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.data.success) {
        message.success('Äá»•i máº­t kháº©u thÃ nh cÃ´ng! Báº¡n cÃ³ thá»ƒ sá»­ dá»¥ng há»‡ thá»‘ng ngay bÃ¢y giá».');
        
        // Update user in store to clear mustChangePassword flag
        setUser(response.data.data);
        
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Äá»•i máº­t kháº©u tháº¥t báº¡i');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      maskClosable={false}
      width={480}
      centered
      className="force-password-modal"
      modalRender={(modal) => (
        <div className="relative">
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>
          {modal}
        </div>
      )}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4 shadow-inner">
          <SafetyOutlined className="text-3xl text-emerald-600 animate-bounce" />
        </div>
        <Title level={3} className="!mb-1 !font-black !text-gray-800 uppercase tracking-tighter">Báº£o máº­t tÃ i khoáº£n</Title>
        <Text className="text-gray-400 font-medium italic">ChÃ o má»«ng báº¡n gia nháº­p cá»™ng Ä‘á»“ng EBookFarm</Text>
      </div>

      <Alert
        message={<span className="font-bold text-orange-800">YÃªu cáº§u thay Ä‘á»•i máº­t kháº©u</span>}
        description={<span className="text-xs text-orange-700/80">TÃ i khoáº£n nÃ y vá»«a Ä‘Æ°á»£c khá»Ÿi táº¡o. Äá»ƒ báº£o vá»‡ dá»¯ liá»‡u nÃ´ng nghiá»‡p cá»§a báº¡n, vui lÃ²ng thiáº¿t láº­p máº­t kháº©u cÃ¡ nhÃ¢n má»›i.</span>}
        type="warning"
        showIcon
        className="mb-8 rounded-2xl border-orange-100 bg-orange-50/50"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="premium-form"
      >
        <Form.Item
          name="currentPassword"
          label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Máº­t kháº©u khá»Ÿi táº¡o</span>}
          rules={[{ required: true, message: 'Vui lÃ²ng nháº­p máº­t kháº©u hiá»‡n táº¡i' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-emerald-500" />}
            placeholder="Nháº­p máº­t kháº©u Admin Ä‘Ã£ cáº¥p"
            size="large"
            className="rounded-2xl h-12 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all shadow-sm"
          />
        </Form.Item>

        <Divider className="my-6"><span className="text-[10px] text-gray-300 uppercase font-bold tracking-[4px]">Thiáº¿t láº­p má»›i</span></Divider>

        <Form.Item
          name="newPassword"
          label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Máº­t kháº©u má»›i</span>}
          rules={[
            { required: true, message: 'Vui lÃ²ng nháº­p máº­t kháº©u má»›i' },
            { min: 6, message: 'Máº­t kháº©u tá»‘i thiá»ƒu 6 kÃ½ tá»±' }
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<KeyOutlined className="text-emerald-500" />}
            placeholder="Máº­t kháº©u riÃªng tÆ° cá»§a báº¡n"
            size="large"
            className="rounded-2xl h-12 border-gray-100"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">XÃ¡c nháº­n láº¡i</span>}
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Vui lÃ²ng xÃ¡c nháº­n láº¡i máº­t kháº©u' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Máº­t kháº©u khÃ´ng khá»›p!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined className="text-emerald-500" />}
            placeholder="Nháº­p láº¡i máº­t kháº©u má»›i"
            size="large"
            className="rounded-2xl h-12 border-gray-100"
          />
        </Form.Item>

        <div className="mt-8">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            className="rounded-2xl h-14 font-black text-lg bg-emerald-600 hover:bg-emerald-700 border-0 shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 group"
          >
            <span>Báº¯t Ä‘áº§u sá»­ dá»¥ng</span>
            <LockOutlined className="group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ForceChangePasswordModal;

