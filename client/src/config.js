const isDevelopment = process.env.NODE_ENV === 'development';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'
  : '/api';

const SOCKET_URL = isDevelopment 
  ? 'http://localhost:5000'
  : window.location.origin;

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/signup`,
  LOGIN: `${API_BASE_URL}/login`,
  MESSAGES: `${API_BASE_URL}/messages`,
  SEND_MESSAGE: `${API_BASE_URL}/message`,
};

export { API_BASE_URL, SOCKET_URL }; 