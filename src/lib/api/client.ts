import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS
});

// Debug base URL when logging is enabled
if (API_CONFIG.ENABLE_LOGGING) {
  // eslint-disable-next-line no-console
  console.info('[API] Base URL:', API_CONFIG.BASE_URL);
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const bearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      (config.headers as any).Authorization = bearer;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop flicker; let caller handle in UI
      // Optionally emit an event/flag here instead of hard redirect
    }
    return Promise.reject(error);
  }
);

export default apiClient;
