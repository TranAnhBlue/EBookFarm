import React from 'react';
import { Modal, Button } from 'antd';
import { FilePdfOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';

export default function JournalExportModal({
  visible,
  onCancel,
  onExportPdf,
  onExportExcel,
  onPrintPreview
}) {
  return (
    <Modal
      title={<span className="text-lg font-black text-gray-900">📤 Xuất báo cáo sổ nhật ký điện tử</span>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={520}
    >
      <div className="py-3 space-y-3.5">
        <p className="text-sm text-gray-600 mb-2">
          Chọn định dạng để tải ngay file báo cáo về máy tính/điện thoại:
        </p>

        {/* Option 1: Tải trực tiếp file PDF Times New Roman */}
        <Button
          block
          size="large"
          icon={<FilePdfOutlined className="text-red-500 text-xl" />}
          onClick={onExportPdf}
          className="h-16 rounded-2xl font-bold flex items-center justify-start px-5 bg-red-50/50 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all shadow-sm"
        >
          <div className="text-left ml-3">
            <div className="font-black text-red-600 text-sm">Tải trực tiếp file PDF (.pdf)</div>
            <div className="text-xs text-gray-500 font-normal">Font Times New Roman chuẩn bìa + sơ đồ + 4 bảng biểu</div>
          </div>
        </Button>

        {/* Option 2: Xuất file Excel */}
        <Button
          block
          size="large"
          icon={<FileExcelOutlined className="text-green-600 text-xl" />}
          onClick={onExportExcel}
          className="h-16 rounded-2xl font-bold flex items-center justify-start px-5 bg-green-50/50 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all shadow-sm"
        >
          <div className="text-left ml-3">
            <div className="font-black text-green-700 text-sm">Xuất file Excel (.xlsx)</div>
            <div className="text-xs text-gray-500 font-normal">Đầy đủ 4 sheet biểu mẫu theo đúng chuẩn TCVN / VietGAP</div>
          </div>
        </Button>

        {/* Option 3: Xem trước & In ấn */}
        <Button
          block
          size="large"
          icon={<PrinterOutlined className="text-blue-600 text-xl" />}
          onClick={onPrintPreview}
          className="h-14 rounded-2xl font-bold flex items-center justify-start px-5 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all"
        >
          <div className="text-left ml-3">
            <div className="font-bold text-gray-800 text-xs">Xem trước & In qua trình duyệt</div>
            <div className="text-[11px] text-gray-400 font-normal">Mở trang in và xem trước bố cục</div>
          </div>
        </Button>
      </div>
    </Modal>
  );
}
