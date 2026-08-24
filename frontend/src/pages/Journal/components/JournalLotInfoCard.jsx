import React from 'react';
import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import {
  EditOutlined,
  FileImageOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  CompassOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  InboxOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { getCropIcon } from '../../../data/journalConfigs';

const { Title, Text } = Typography;

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
      <span className="flex items-center gap-2 text-slate-500 font-medium text-sm">
        {icon} {label}
      </span>
      <span className="font-bold text-slate-800 text-right text-sm">{value || '--'}</span>
    </div>
  );
}

export default function JournalLotInfoCard({ book, onEdit, onOpenMapUpload }) {
  if (!book) return null;

  return (
    <Card
      className="rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all mb-6 overflow-hidden"
      styles={{ body: { padding: '20px 24px' } }}
    >
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-center p-1 shadow-inner shrink-0 overflow-hidden">
            {getCropIcon(book.loaiSo || 'Sầu riêng')}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base md:text-lg font-black text-slate-800 tracking-tight leading-normal">
                Thông tin lô sản xuất
              </span>
              <span className="inline-flex items-center justify-center font-extrabold rounded-full px-2.5 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs leading-normal select-none">
                {book.loaiSo || 'Sầu riêng'}
              </span>
            </div>
            <div className="text-xs md:text-sm text-slate-400 font-medium">
              Mã nông hộ: <span className="font-bold text-slate-700">{book.maNongHo || 'BANHANG'}</span> • Lô: <span className="font-bold text-slate-700">{book.loSanXuat || 'Lô 01'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {book.soDoVuon ? (
            <Button
              type="default"
              icon={<CheckCircleFilled className="text-emerald-500" />}
              onClick={onOpenMapUpload}
              className="rounded-xl font-bold text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 h-10 text-sm"
            >
              Xem sơ đồ vườn
            </Button>
          ) : (
            <Button
              type="dashed"
              icon={<FileImageOutlined />}
              onClick={onOpenMapUpload}
              className="rounded-xl font-medium text-slate-600 hover:text-emerald-600 hover:border-emerald-500 h-10 text-sm"
            >
              Tải lên sơ đồ vườn
            </Button>
          )}

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onEdit}
            className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl font-bold h-10 px-5 text-sm shadow-sm"
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Detail info grid */}
      <Row gutter={[20, 10]}>
        {/* Left Column */}
        <Col xs={24} md={12} className="space-y-2.5">
          <InfoRow icon={<UserOutlined className="text-emerald-600" />} label="Họ tên tổ chức/cá nhân:" value={book.hoTen} />
          <InfoRow icon={<AppstoreOutlined className="text-emerald-600" />} label="Diện tích:" value={book.dienTich} />
          <InfoRow icon={<CompassOutlined className="text-emerald-600" />} label="Mật độ trồng:" value={book.matDo} />
          <InfoRow icon={<ThunderboltOutlined className="text-emerald-600" />} label="Ngày bắt đầu đặt/treo túi phôi:" value={book.ngayBatDauDatTui} />
        </Col>

        {/* Right Column */}
        <Col xs={24} md={12} className="space-y-2.5">
          <InfoRow icon={<EnvironmentOutlined className="text-emerald-600" />} label="Địa chỉ sản xuất:" value={book.diaChi} />
          <InfoRow icon={<CalendarOutlined className="text-emerald-600" />} label="Ngày tạo sổ:" value={book.ngayBatDau} />
          <InfoRow icon={<InboxOutlined className="text-emerald-600" />} label="Tổng túi phôi:" value={book.tongTuiPhoi} />
          <InfoRow icon={<HomeOutlined className="text-emerald-600" />} label="Mã số thửa / Cơ sở:" value={book.maSoThua || book.tenCoSo} />
        </Col>
      </Row>
    </Card>
  );
}
