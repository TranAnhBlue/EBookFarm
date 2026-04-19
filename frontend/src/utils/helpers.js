// Helper functions

/**
 * Lấy URL đầy đủ của avatar
 * @param {string} avatarPath - Đường dẫn avatar từ database
 * @returns {string|null} - URL đầy đủ hoặc null
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${avatarPath}`;
};

/**
 * Lấy chữ cái đầu từ tên để làm avatar placeholder
 * @param {string} name - Tên người dùng
 * @returns {string} - Chữ cái đầu viết hoa
 */
export const getInitialAvatar = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

/**
 * Format số điện thoại
 * @param {string} phone - Số điện thoại
 * @returns {string} - Số điện thoại đã format
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Format: 0912 345 678
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

/**
 * Validate số điện thoại Việt Nam
 * @param {string} phone - Số điện thoại
 * @returns {boolean} - true nếu hợp lệ
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Format diện tích
 * @param {number} area - Diện tích (m²)
 * @returns {string} - Diện tích đã format
 */
export const formatArea = (area) => {
  if (!area) return '0 m²';
  if (area >= 10000) {
    return `${(area / 10000).toFixed(2)} ha`;
  }
  return `${area.toLocaleString()} m²`;
};
