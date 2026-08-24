import React from 'react';
import { Modal, Form, Row, Col, Input, Select, DatePicker } from 'antd';

const { Option } = Select;

export default function JournalCreateModal({
  visible,
  onCancel,
  onCreate,
  form,
  cropOptions = []
}) {
  return (
    <Modal
      title={<span className="text-lg font-black text-gray-900">📖 Tạo sổ nhật ký điện tử mới</span>}
      open={visible}
      onOk={onCreate}
      onCancel={onCancel}
      okText="Tạo sổ ngay"
      cancelText="Hủy bỏ"
      width={650}
      centered
      okButtonProps={{ className: 'bg-green-600 hover:bg-green-700 font-bold rounded-xl h-10 px-6' }}
      cancelButtonProps={{ className: 'rounded-xl h-10 px-6 font-bold' }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="loaiSo" label="Loại cây trồng / Vật nuôi" rules={[{ required: true, message: 'Bắt buộc!' }]}>
              <Select className="h-11 rounded-xl" placeholder="Chọn loại sổ...">
                {cropOptions.map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="loSanXuat" label="Mã số thửa / Lô sản xuất" rules={[{ required: true, message: 'Bắt buộc!' }]}>
              <Input placeholder="Ví dụ: Lô A1, Thửa 01, Test..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="maNongHo" label="Mã nông hộ" rules={[{ required: true, message: 'Bắt buộc!' }]}>
              <Input placeholder="Ví dụ: BANHANG, test..." className="h-11 rounded-xl uppercase" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="hoTen" label="Họ tên tổ chức / cá nhân" rules={[{ required: true, message: 'Bắt buộc!' }]}>
              <Input placeholder="Ví dụ: test, Trần Đức Anh..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="dienTich" label="Diện tích" rules={[{ required: true, message: 'Bắt buộc!' }]}>
              <Input placeholder="Ví dụ: Test, 2.5 ha, 5000 m²..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="matDo" label="Mật độ">
              <Input placeholder="Ví dụ: 10..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="tongTuiPhoi" label="Tổng túi phôi / số cây">
              <Input placeholder="Ví dụ: 10..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="ngayBatDauDatTui" label="Ngày bắt đầu đặt/treo túi phôi">
              <Input placeholder="Ví dụ: 2..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="diaChi" label="Địa chỉ">
              <Input placeholder="Ví dụ: tes, Thạch Hòa..." className="h-11 rounded-xl" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
