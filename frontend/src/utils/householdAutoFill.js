/**
 * Utility: Xử lý auto-fill thông tin hộ sản xuất VietGAP
 * 
 * Khi user chọn "TT hộ" từ dropdown, tự động điền:
 * - Tên hộ
 * - Diện tích hộ
 * - Mã số nông hộ
 */

/**
 * Kiểm tra xem field có phải là trường liên quan đến hộ không
 */
export const isHouseholdField = (fieldName) => {
  const householdFields = ['tt', 'ttHo', 'tenHo', 'dienTichHo', 'maSoNongHo'];
  return householdFields.includes(fieldName);
};

/**
 * Kiểm tra xem field có phải là field "TT hộ" (dropdown) không
 */
export const isHouseholdSelector = (fieldName, fieldLabel) => {
  return (
    fieldName === 'tt' || 
    fieldName === 'ttHo' || 
    (fieldLabel && fieldLabel.toLowerCase().includes('tt hộ'))
  );
};

/**
 * Lấy mapping giữa field name và household property
 */
export const getHouseholdFieldMapping = () => ({
  tt: 'householdId',
  ttHo: 'householdId',
  tenHo: 'tenHo',
  dienTichHo: 'dienTich',
  maSoNongHo: 'maSoNongHo'
});

/**
 * Auto-fill các trường hộ sau khi chọn từ dropdown
 * 
 * @param {Object} household - Thông tin hộ được chọn
 * @param {Object} form - Ant Design form instance
 * @param {Array} namePath - Path đến field trong form (cho nested tables)
 * @param {Array} tableFields - Danh sách các fields trong bảng
 */
export const autoFillHouseholdFields = (household, form, namePath, tableFields) => {
  if (!household || !form || !tableFields) return;

  // Lấy base path (bỏ field name cuối cùng)
  const basePath = namePath.slice(0, -1);

  // Tìm và fill các trường liên quan
  tableFields.forEach(field => {
    if (field.name === 'tenHo') {
      form.setFieldValue([...basePath, 'tenHo'], household.tenHo);
    } else if (field.name === 'dienTichHo') {
      form.setFieldValue([...basePath, 'dienTichHo'], household.dienTich);
    } else if (field.name === 'maSoNongHo') {
      form.setFieldValue([...basePath, 'maSoNongHo'], household.maSoNongHo);
    }
  });
};

/**
 * Kiểm tra xem field có nên bị disable (readonly) không
 * Các trường tự động điền sẽ bị disable để tránh chỉnh sửa
 */
export const shouldDisableField = (fieldName, ttValue) => {
  const autoFillFields = ['tenHo', 'dienTichHo', 'maSoNongHo'];
  
  // Chỉ disable nếu đã chọn hộ (ttValue có giá trị)
  return autoFillFields.includes(fieldName) && ttValue;
};

/**
 * Format display text cho household selector
 */
export const formatHouseholdDisplay = (household) => {
  if (!household) return '';
  return `${household.tenHo} - ${household.maSoNongHo}`;
};

/**
 * Validate household selection
 */
export const validateHouseholdSelection = (value, tableData, currentIndex) => {
  // Kiểm tra trùng lặp trong cùng bảng
  const duplicates = tableData.filter((row, idx) => 
    idx !== currentIndex && row.tt === value
  );

  if (duplicates.length > 0) {
    return Promise.reject(new Error('Hộ này đã được chọn trong bảng'));
  }

  return Promise.resolve();
};

/**
 * Get household info from form data
 */
export const getHouseholdFromFormData = (formData, namePath) => {
  const basePath = namePath.slice(0, -1);
  let current = formData;
  
  for (const key of basePath) {
    if (current && typeof current === 'object') {
      current = current[key];
    } else {
      return null;
    }
  }
  
  return current;
};

/**
 * Clear household fields when deselecting
 */
export const clearHouseholdFields = (form, namePath, tableFields) => {
  const basePath = namePath.slice(0, -1);
  
  tableFields.forEach(field => {
    if (['tenHo', 'dienTichHo', 'maSoNongHo'].includes(field.name)) {
      form.setFieldValue([...basePath, field.name], undefined);
    }
  });
};
