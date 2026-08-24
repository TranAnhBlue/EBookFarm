import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function JournalLotInfoCard({ book, onEdit, onOpenMapUpload }) {
  if (!book) return null;

  return (
    <Card
      className="rounded-2xl border-green-600 border-2 bg-white shadow-sm mb-6 overflow-hidden"
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <Title level={4} className="!mb-0 !font-black text-gray-900">
          Thông tin lô sản xuất
        </Title>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={onEdit}
          className="text-green-600 font-bold p-0"
        >
          Chỉnh sửa thông tin
        </Button>
      </div>

      <Row gutter={[32, 12]}>
        {/* Left Column */}
        <Col xs={24} md={12} className="space-y-2.5">
          <div className="flex items-center">
            <span className="w-56 font-bold text-gray-800 text-sm">Sơ đồ vườn trồng:</span>
            {book.soDoVuon ? (
              <span className="text-green-600 font-semibold cursor-pointer underline" onClick={onOpenMapUpload}>
                Đã tải sơ đồ (Bấm xem lại)
              </span>
            ) : (
              <button
                onClick={onOpenMapUpload}
                className="text-green-600 font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0 text-sm"
              >
                Tải lên sơ đồ
              </button>
            )}
          </div>

          <div className="flex items-center">
            <span className="w-56 font-bold text-gray-800 text-sm">Họ tên tổ chức/cá nhân:</span>
            <span className="text-gray-700 font-medium text-sm">{book.hoTen || 'test'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-56 font-bold text-gray-800 text-sm">Diện tích:</span>
            <span className="text-gray-700 font-medium text-sm">{book.dienTich || 'Test'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-56 font-bold text-gray-800 text-sm">Mật độ:</span>
            <span className="text-gray-700 font-medium text-sm">{book.matDo || '10'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-56 font-bold text-gray-800 text-sm">Ngày bắt đầu đặt/treo túi phôi:</span>
            <span className="text-gray-700 font-medium text-sm">{book.ngayBatDauDatTui || '2'}</span>
          </div>
        </Col>

        {/* Right Column */}
        <Col xs={24} md={12} className="space-y-2.5">
          <div className="flex items-center">
            <span className="w-40 font-bold text-gray-800 text-sm">Mã nông hộ:</span>
            <span className="text-gray-700 font-bold text-sm">{book.maNongHo || 'test'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-40 font-bold text-gray-800 text-sm">Địa chỉ:</span>
            <span className="text-gray-700 font-medium text-sm">{book.diaChi || 'tes'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-40 font-bold text-gray-800 text-sm">Ngày tạo:</span>
            <span className="text-gray-700 font-medium text-sm">{book.ngayBatDau || '30/07/2026 11:16'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-40 font-bold text-gray-800 text-sm">Tổng túi phôi:</span>
            <span className="text-gray-700 font-medium text-sm">{book.tongTuiPhoi || '10'}</span>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
