import React from 'react';
import { Card, Typography, Popconfirm, Button } from 'antd';
import {
  DeleteOutlined, RightOutlined, TagOutlined,
  CalendarOutlined, EnvironmentOutlined, FileTextOutlined
} from '@ant-design/icons';
import { getCropIcon } from '../../../data/journalConfigs';

const { Text } = Typography;

export default function JournalBookCard({ book, onSelect, onDelete }) {
  if (!book) return null;

  return (
    <Card
      className="rounded-2xl border border-gray-200 hover:shadow-md transition-all h-full bg-white relative overflow-hidden group"
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <Text strong className="text-gray-900 text-sm font-bold">
            {book.maNongHo || 'test'} - {book.hoTen || 'test'}
          </Text>
          <Popconfirm
            title="Xóa sổ nhật ký này?"
            description="Mọi bản ghi bên trong sẽ bị xóa."
            onConfirm={() => onDelete(book.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined className="text-gray-400 hover:text-red-500" />}
              size="small"
            />
          </Popconfirm>
        </div>

        {/* Body: Left Icon + Right Details */}
        <div className="flex items-start gap-5">
          <div className="shrink-0 pt-1">
            {getCropIcon(book.loaiSo)}
          </div>

          <div className="flex-1 space-y-1.5 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <TagOutlined className="text-green-600 text-xs" /> Diện tích:
              </span>
              <span className="font-bold text-gray-900">{book.dienTich || 'Test'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <CalendarOutlined className="text-green-600 text-xs" /> Ngày bắt đầu:
              </span>
              <span className="font-bold text-gray-900">{book.ngayBatDau || '30/07/2026'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <EnvironmentOutlined className="text-green-600 text-xs" /> Địa chỉ:
              </span>
              <span className="font-bold text-gray-900">{book.diaChi || 'tes'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <FileTextOutlined className="text-green-600 text-xs" /> Loại sổ:
              </span>
              <span className="font-bold text-gray-900">{book.loaiSo || 'Sầu riêng'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500">
                <TagOutlined className="text-green-600 text-xs" /> Lô sản xuất:
              </span>
              <span className="font-bold text-gray-900">{book.loSanXuat || 'Test'}</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => onSelect(book.id)}
            className="text-green-600 hover:text-green-700 font-bold text-xs bg-transparent border-0 cursor-pointer inline-flex items-center gap-1 transition-all hover:translate-x-1"
          >
            Vào sổ nhật ký <RightOutlined className="text-[10px]" />
          </button>
        </div>
      </div>
    </Card>
  );
}
