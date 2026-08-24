import React from 'react';
import { Card, Popconfirm, Button } from 'antd';
import {
  DeleteOutlined,
  RightOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PaperClipOutlined,
  BookOutlined,
  TagOutlined
} from '@ant-design/icons';
import { getCropIcon } from '../../../data/journalConfigs';

export default function JournalBookCard({ book, onSelect, onDelete }) {
  if (!book) return null;

  const headerTitle = `${book.maNongHo || 'Mã'} - ${book.hoTen || 'Họ tên'}`;

  return (
    <Card
      className="rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden flex flex-col justify-between"
      styles={{ body: { padding: '20px 24px 14px 24px' } }}
    >
      <div>
        {/* Header: [Mã] - [Họ tên] + Delete Button */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100/80">
          <span className="text-slate-800 font-extrabold text-sm md:text-base truncate max-w-[85%]">
            {headerTitle}
          </span>
          <Popconfirm
            title="Xóa sổ nhật ký này?"
            description="Mọi bản ghi bên trong sẽ bị xóa vĩnh viễn."
            onConfirm={() => onDelete(book.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined className="text-slate-300 hover:text-rose-500 text-sm" />}
              size="small"
              className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center -mr-2"
            />
          </Popconfirm>
        </div>

        {/* Content: Left crop illustration, Right key-values */}
        <div className="flex items-center gap-5 py-2">
          {/* Left illustration */}
          <div className="w-28 h-28 shrink-0 flex items-center justify-center">
            {getCropIcon(book.loaiSo)}
          </div>

          {/* Right key-values */}
          <div className="flex-1 space-y-2 text-xs md:text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                <PaperClipOutlined className="text-emerald-600 text-sm" />
                <span>Diện tích:</span>
              </span>
              <span className="font-bold text-slate-800 text-right truncate">
                {book.dienTich || '--'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                <CalendarOutlined className="text-emerald-600 text-sm" />
                <span>Ngày bắt đầu:</span>
              </span>
              <span className="font-bold text-slate-800 text-right truncate">
                {book.ngayBatDau || '--'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                <EnvironmentOutlined className="text-emerald-600 text-sm" />
                <span>Địa chỉ:</span>
              </span>
              <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">
                {book.diaChi || '--'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                <BookOutlined className="text-emerald-600 text-sm" />
                <span>Loại sổ:</span>
              </span>
              <span className="font-bold text-slate-800 text-right truncate">
                {book.loaiSo || '--'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                <TagOutlined className="text-emerald-600 text-sm" />
                <span>Lô sản xuất:</span>
              </span>
              <span className="font-bold text-slate-800 text-right truncate">
                {book.loSanXuat || '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer link button */}
      <div className="pt-3 mt-2 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => onSelect(book.id)}
          className="inline-flex items-center justify-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-extrabold text-sm md:text-base cursor-pointer hover:underline py-1 px-4 transition-colors"
        >
          <span>Vào sổ nhật ký</span>
          <RightOutlined className="text-xs" />
        </button>
      </div>
    </Card>
  );
}
