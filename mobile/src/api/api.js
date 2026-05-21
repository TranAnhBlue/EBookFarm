import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get API URL from environment variable or use default
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ebookfarm.onrender.com/api';

console.log('🌐 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Logic handle unauthorized / token expired
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      // Dispatch logout or navigate to login...
    }
    return Promise.reject(error);
  }
);

export default api;
