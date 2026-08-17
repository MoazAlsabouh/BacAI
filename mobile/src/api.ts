import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'https://bacai-backend-r5lf.onrender.com';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
