import axios from 'axios'
import { message } from 'antd'
import authSession from '../core/authSession'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

http.interceptors.request.use((config) => {
  const token = authSession.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không thông báo lỗi cho 401 vì sẽ được chuyển hướng về trang login
    if (error.response && error.response.status === 401) {
      authSession.clearSession()
      window.location.href = '/login'
    } else {
      // Thông báo lỗi cho các trường hợp khác
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
      message.error(errorMsg)
    }
    return Promise.reject(error)
  }
)

export default http
