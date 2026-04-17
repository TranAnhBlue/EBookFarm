import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
    // Không thông báo lỗi cho 401 vì sẽ được chuyển hướng về trang login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      // Thông báo lỗi cho các trường hợp khác
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      message.error(errorMsg);
    }
    return Promise.reject(error);
  }
);

export default api;
