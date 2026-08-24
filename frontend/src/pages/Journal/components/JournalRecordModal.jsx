import React from 'react';
import { Modal, Form, Row, Col, Input, DatePicker, Select, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const EVAL_OPTIONS = [
  {
    value: 'Đạt',
    label: 'Đạt',
    icon: '✅',
    selected: 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/30',
    unselected: 'bg-white border-slate-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50',
  },
  {
    value: 'Không đạt',
    label: 'Không đạt',
    icon: '❌',
    selected: 'bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/30',
    unselected: 'bg-white border-slate-200 text-rose-700 hover:border-rose-400 hover:bg-rose-50',
  },
  {
    value: 'Cần xử lý',
    label: 'Cần xử lý',
    icon: '⚠️',
    selected: 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30',
    unselected: 'bg-white border-slate-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50',
  },
];

/** Custom evaluation picker — each option has its own distinct color when selected */
function EvalButtonGroup({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {EVAL_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 font-bold text-xs transition-all duration-150 cursor-pointer w-full select-none ${isSelected ? opt.selected : opt.unselected
              }`}
          >
            <span className="text-xl leading-none">{opt.icon}</span>
            <span className="leading-none text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function JournalRecordModal({
  visible,
  onCancel,
  onSave,
  form,
  currentTab,
  editingRecord
}) {
  if (!currentTab) return null;

  const isEditing = !!editingRecord;
  const watchedDieuKien = Form.useWatch('dieu_kien', form);

  // Dynamic handler when changing "Đối tượng kiểm tra" in Biểu 1
  const handleDieuKienChange = (val) => {
    if (currentTab.key === 'bieu_1') {
      if (val === 'Đất/giá thể') {
        form.setFieldValue('tac_nhan', ['Kim loại nặng']);
      } else if (val === 'Nước tưới') {
        form.setFieldValue('tac_nhan', ['Kim loại nặng']);
      } else if (val === 'Sản phẩm') {
        form.setFieldValue('tac_nhan', ['Kim loại nặng']);
      } else {
        form.setFieldValue('tac_nhan', undefined);
      }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 shadow-inner">
            {currentTab.icon || '📝'}
          </div>
          <div>
            <div className="text-base md:text-lg font-black text-slate-800 tracking-tight">
              {isEditing ? 'Chỉnh sửa bản ghi' : 'Thêm bản ghi nhật ký mới'}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {currentTab.label}
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <div key="actions" className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            key="cancel"
            onClick={onCancel}
            className="rounded-xl h-11 px-5 font-bold text-slate-600 hover:text-slate-900 border-slate-200 text-xs md:text-sm"
          >
            Đóng
          </Button>
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSave}
            className="bg-emerald-600 hover:bg-emerald-700 border-none font-extrabold rounded-xl h-11 px-8 text-white shadow-md shadow-emerald-600/20 text-xs md:text-sm flex items-center gap-2"
          >
            {isEditing ? 'Lưu thay đổi' : 'Lưu vào sổ nhật ký'}
          </Button>
        </div>
      ]}
      width={760}
      centered
      className="farmer-friendly-modal"
    >
      <div className="py-2">
        <div className="mb-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-center gap-2 text-xs text-emerald-800">
          <span className="font-bold">💡 Hướng dẫn:</span>
          <span>Bà con nông dân chỉ cần chọn ngày và điền các thông tin thực tế tại vườn, sau đó bấm <b>"Lưu vào sổ"</b>.</span>
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Row gutter={[16, 8]}>
            {currentTab.columns.map((col) => {
              const isColSpan24 = col.colSpan === 24 || col.key === 'bien_phap' || col.key === 'ghi_chu';

              // Dynamic options & multiple mode calculation
              let fieldOptions = col.options || [];
              const isMultipleSelect = col.type === 'select_multiple' || col.key === 'tac_nhan';
              const isBieu1TacNhan = currentTab.key === 'bieu_1' && col.key === 'tac_nhan';
              const isFieldDisabled = isBieu1TacNhan && !watchedDieuKien;

              if (isBieu1TacNhan) {
                if (watchedDieuKien === 'Đất/giá thể') {
                  fieldOptions = ['Kim loại nặng'];
                } else if (watchedDieuKien === 'Nước tưới' || watchedDieuKien === 'Nước phục vụ sơ chế') {
                  fieldOptions = ['Kim loại nặng', 'Vi sinh vật'];
                } else if (watchedDieuKien === 'Sản phẩm') {
                  fieldOptions = ['Kim loại nặng', 'Dư lượng thuốc BVTV', 'Vi sinh vật', 'Độc tố vi nấm trong sản phẩm'];
                } else {
                  fieldOptions = [];
                }
              }

              const dynamicPlaceholder = isBieu1TacNhan
                ? (!watchedDieuKien ? '⚠️ Vui lòng chọn Đối tượng kiểm tra trước' : 'Bấm để chọn tác nhân (có thể chọn nhiều)')
                : (col.placeholder || `Chọn ${col.label || col.title}`);

              return (
                <Col xs={24} md={isColSpan24 ? 24 : (col.colSpan || 12)} key={col.key}>
                  <Form.Item
                    name={col.key}
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="text-slate-800 text-xs md:text-sm font-bold flex items-center gap-1">
                          {col.label || col.title}
                          {col.required && <span className="text-rose-500 font-black text-sm">*</span>}
                        </span>
                        {isBieu1TacNhan && (
                          <span className={`text-[11px] font-medium ${!watchedDieuKien ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {!watchedDieuKien
                              ? '(Hãy chọn Đối tượng kiểm tra trước)'
                              : watchedDieuKien === 'Đất/giá thể'
                                ? '(Tự động chọn: Kim loại nặng)'
                                : '(Có thể chọn nhiều)'}
                          </span>
                        )}
                      </div>
                    }
                    rules={col.required ? [{ required: true, message: `Vui lòng nhập ${col.label || col.title}!` }] : []}
                    className="mb-3.5"
                  >
                    {col.key === 'danh_gia' ? (
                      <EvalButtonGroup />
                    ) : col.type === 'date' ? (
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full h-11 rounded-xl border-slate-200 hover:border-emerald-500 text-slate-800 text-sm font-medium"
                        placeholder={col.placeholder || `Chọn ${col.label || col.title}`}
                      />
                    ) : (col.type === 'select' || isMultipleSelect) ? (
                      <Select
                        mode={isMultipleSelect ? 'multiple' : undefined}
                        disabled={isFieldDisabled}
                        placeholder={dynamicPlaceholder}
                        className="w-full min-h-[44px] text-slate-800 font-medium"
                        size="large"
                        allowClear
                        maxTagCount="responsive"
                        onChange={col.key === 'dieu_kien' ? handleDieuKienChange : undefined}
                      >
                        {fieldOptions.map((opt) => (
                          <Option key={opt} value={opt}>
                            <span className="font-medium text-slate-800">{opt}</span>
                          </Option>
                        ))}
                      </Select>
                    ) : isColSpan24 ? (
                      <TextArea
                        rows={2}
                        placeholder={col.placeholder || `Nhập ${col.label || col.title}`}
                        className="rounded-xl border-slate-200 hover:border-emerald-500 text-slate-800 text-sm font-medium p-2.5"
                      />
                    ) : (
                      <Input
                        placeholder={col.placeholder || `Nhập ${col.label || col.title}`}
                        className="h-11 rounded-xl border-slate-200 hover:border-emerald-500 text-slate-800 text-sm font-medium px-3.5"
                      />
                    )}
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
