import React, { useState } from 'react';
import { Modal, Input, Alert, Form } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const EditReasonModal = ({ visible, onConfirm, onCancel, journalStatus }) => {
  const [reason, setReason] = useState('');
  const [form] = Form.useForm();

  const handleOk = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason('');
    form.resetFields();
  };

  const handleCancel = () => {
    setReason('');
    form.resetFields();
    onCancel();
  };

  const getStatusMessage = (status) => {
    const messages = {
      'Submitted': 'Nháº­t kÃ½ Ä‘Ã£ Ä‘Æ°á»£c gá»­i xÃ¡c nháº­n. Má»i thay Ä‘á»•i sáº½ Ä‘Æ°á»£c ghi láº¡i trong lá»‹ch sá»­.',
      'Verified': 'Nháº­t kÃ½ Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c minh. Chá»‰ ká»¹ thuáº­t viÃªn vÃ  quáº£n trá»‹ viÃªn má»›i cÃ³ thá»ƒ chá»‰nh sá»­a.',
      'Locked': 'Nháº­t kÃ½ Ä‘Ã£ bá»‹ khÃ³a. Chá»‰ quáº£n trá»‹ viÃªn má»›i cÃ³ thá»ƒ chá»‰nh sá»­a.'
    };
    return messages[status] || 'Nháº­t kÃ½ nÃ y yÃªu cáº§u ghi rÃµ lÃ½ do khi chá»‰nh sá»­a.';
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500 text-xl" />
          <span className="text-lg font-bold">XÃ¡c nháº­n chá»‰nh sá»­a</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="XÃ¡c nháº­n sá»­a"
      cancelText="Há»§y"
      okButtonProps={{
        disabled: !reason.trim(),
        className: 'bg-orange-500 hover:bg-orange-600'
      }}
      width={500}
    >
      <div className="space-y-4">
        {/* Warning Alert */}
        <Alert
          message="Cáº£nh bÃ¡o"
          description={getStatusMessage(journalStatus)}
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />

        {/* Reason Input */}
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="font-medium">LÃ½ do chá»‰nh sá»­a</span>}
            name="reason"
            rules={[
              { required: true, message: 'Vui lÃ²ng nháº­p lÃ½ do chá»‰nh sá»­a' },
              { min: 10, message: 'LÃ½ do pháº£i cÃ³ Ã­t nháº¥t 10 kÃ½ tá»±' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="VÃ­ dá»¥: Nháº­p sai sá»‘ lÆ°á»£ng, cáº§n cáº­p nháº­t thÃ´ng tin chÃ­nh xÃ¡c..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>LÆ°u Ã½:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>LÃ½ do sáº½ Ä‘Æ°á»£c lÆ°u vÃ o lá»‹ch sá»­ chá»‰nh sá»­a</li>
              <li>Má»i ngÆ°á»i cÃ³ quyá»n xem lá»‹ch sá»­ Ä‘á»u cÃ³ thá»ƒ tháº¥y lÃ½ do nÃ y</li>
              <li>HÃ£y ghi rÃµ rÃ ng vÃ  trung thá»±c</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditReasonModal;

