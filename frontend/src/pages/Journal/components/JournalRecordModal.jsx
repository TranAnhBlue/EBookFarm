import React from 'react';
import { Modal, Form, Row, Col, Input, DatePicker, Select, InputNumber, Button } from 'antd';

const { Option } = Select;

export default function JournalRecordModal({
  visible,
  onCancel,
  onSave,
  form,
  currentTab,
  editingRecord
}) {
  if (!currentTab) return null;

  return (
    <Modal
      title={
        <div className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
          Nhập thông tin
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 border-none font-bold rounded-lg h-10 px-8 text-white shadow-sm"
        >
          Ghi
        </Button>
      ]}
      width={720}
      centered
    >
      <Form form={form} layout="vertical" className="mt-4" requiredMark={false}>
        <Row gutter={[20, 4]}>
          {currentTab.columns.map((col) => (
            <Col xs={24} md={col.colSpan || 12} key={col.key}>
              <Form.Item
                name={col.key}
                label={
                  <span className="text-gray-800 text-sm font-normal">
                    {col.required && <span className="text-red-500 mr-1">*</span>}
                    {col.label}
                  </span>
                }
                rules={col.required ? [{ required: true, message: `Vui lòng nhập ${col.label}!` }] : []}
              >
                {col.type === 'date' ? (
                  <DatePicker
                    format="DD/MM/YYYY"
                    className="w-full h-11 rounded-lg border-gray-200 hover:border-green-500 focus:border-green-500"
                    placeholder={col.placeholder || col.label}
                  />
                ) : col.type === 'datetime' ? (
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    className="w-full h-11 rounded-lg border-gray-200 hover:border-green-500 focus:border-green-500"
                    placeholder={col.placeholder || col.label}
                  />
                ) : col.type === 'select' ? (
                  <Select
                    placeholder={col.placeholder || col.label}
                    className="h-11 rounded-lg"
                    size="large"
                    allowClear
                  >
                    {(col.options || []).map((opt) => (
                      <Option key={opt} value={opt}>{opt}</Option>
                    ))}
                  </Select>
                ) : col.type === 'number' ? (
                  <InputNumber
                    min={0}
                    className="w-full h-11 rounded-lg border-gray-200"
                    placeholder={col.placeholder || col.label}
                  />
                ) : (
                  <Input
                    placeholder={col.placeholder || col.label}
                    className="h-11 rounded-lg border-gray-200 hover:border-green-500 focus:border-green-500"
                  />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
}
