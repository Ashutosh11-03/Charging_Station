import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllStations = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/charging-stations${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch charging stations';
  }
};

export const getStationById = async (id) => {
  try {
    const response = await api.get(`/charging-stations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch charging station';
  }
};

export const createStation = async (stationData) => {
  try {
    const response = await api.post('/charging-stations', stationData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create charging station';
  }
};

export const updateStation = async (id, stationData) => {
  try {
    const response = await api.put(`/charging-stations/${id}`, stationData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update charging station';
  }
};

export const deleteStation = async (id) => {
  try {
    const response = await api.delete(`/charging-stations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete charging station';
  }
}; 