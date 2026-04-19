import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert } from 'antd';
import { LockOutlined, KeyOutlined, SafetyOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const ForceChangePasswordModal = ({ visible, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/force-change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.data.success) {
        message.success('Đổi mật khẩu thành công! Bạn có thể sử dụng hệ thống ngay bây giờ.');
        
        // Update user in store to clear mustChangePassword flag
        setUser(response.data.data);
        
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={
        <div className="flex items-center gap-3">
          <SafetyOutlined className="text-2xl text-orange-500" />
          <div>
            <div className="text-lg font-bold">Bắt buộc đổi mật khẩu</div>
            <div className="text-xs text-gray-500 font-normal">Vì lý do bảo mật, bạn cần đổi mật khẩu ngay</div>
          </div>
        </div>
      }
      footer={null}
      closable={false}
      maskClosable={false}
      width={500}
      centered
    >
      <Alert
        message="Yêu cầu bảo mật"
        description="Tài khoản của bạn được tạo bởi quản trị viên. Để đảm bảo an toàn, vui lòng đổi sang mật khẩu mới mà chỉ bạn biết."
        type="warning"
        showIcon
        className="mb-6 rounded-xl"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label={<span className="font-semibold">Mật khẩu hiện tại</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Nhập mật khẩu được cấp"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={<span className="font-semibold">Mật khẩu mới</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Mật khẩu phải có chữ hoa, chữ thường và số'
            }
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<KeyOutlined className="text-gray-400" />}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="font-semibold">Xác nhận mật khẩu mới</span>}
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined className="text-gray-400" />}
            placeholder="Nhập lại mật khẩu mới"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="text-xs text-blue-800 font-semibold mb-2">💡 Gợi ý mật khẩu mạnh:</div>
          <ul className="text-xs text-blue-700 space-y-1 ml-4">
            <li>• Ít nhất 6 ký tự (khuyến nghị 8-12 ký tự)</li>
            <li>• Có chữ hoa, chữ thường và số</li>
            <li>• Không dùng thông tin cá nhân dễ đoán</li>
            <li>• Không chia sẻ mật khẩu với người khác</li>
          </ul>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            className="rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700 border-0 shadow-lg"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ForceChangePasswordModal;
