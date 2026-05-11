import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không tự động chuyển hướng nếu đang ở trang login hoặc gọi api login/đổi mật khẩu bắt buộc
    const isLoginEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/force-change-password');
    const isLoginPage = window.location.pathname === '/login';

    if (error.response && error.response.status === 401 && !isLoginEndpoint && !isLoginPage) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response && error.response.status === 401 && isLoginEndpoint) {
      // Trường hợp sai mật khẩu tại trang login: Trả về để component Login tự xử lý
      return Promise.reject(error);
    } else {
      // Thông báo lỗi cho các trường hợp khác
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      message.error(errorMsg);
    }
    return Promise.reject(error);
  }
);

export default api;
