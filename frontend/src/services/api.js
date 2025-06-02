import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'An error occurred';
  }
};

export const signup = async (name, email, password) => {
  try {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'An error occurred';
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'An error occurred';
  }
}; 