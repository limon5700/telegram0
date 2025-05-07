import axios from 'axios';
import { API_ENDPOINTS } from '../config';

const api = axios.create({
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

export const authService = {
  signup: async (userData) => {
    const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },
};

export const messageService = {
  getMessages: async (senderId, receiverId) => {
    const response = await api.get(`${API_ENDPOINTS.MESSAGES}/${senderId}/${receiverId}`);
    return response.data;
  },
  
  sendMessage: async (messageData) => {
    const response = await api.post(API_ENDPOINTS.SEND_MESSAGE, messageData);
    return response.data;
  },
}; 