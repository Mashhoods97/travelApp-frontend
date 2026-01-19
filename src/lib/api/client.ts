import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false to avoid CORS preflight issues
  // Add CORS mode for better error handling
  validateStatus: (status) => {
    // Don't throw error for 4xx/5xx, let us handle it
    return status >= 200 && status < 600;
  },
});

// Always log base URL for debugging
console.log('[API Client] Created with baseURL:', API_CONFIG.BASE_URL);
console.log('[API Client] Full base URL:', apiClient.defaults.baseURL);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const bearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      (config.headers as any).Authorization = bearer;
    }
    // Log all requests for debugging
    console.log('[API Request]', config.method?.toUpperCase(), config.url);
    console.log('[API Request] Full URL:', config.baseURL + config.url);
    console.log('[API Request] Headers:', JSON.stringify(config.headers, null, 2));
    console.log('[API Request] Data:', config.data);
    console.log('[API Request] With Credentials:', config.withCredentials);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[API Response]', response.status, response.config.url);
    console.log('[API Response] Data:', response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.message);
    console.error('[API Response Error] URL:', error.config?.url);
    console.error('[API Response Error] Full URL:', error.config?.baseURL + error.config?.url);
    console.error('[API Response Error] Status:', error.response?.status);
    console.error('[API Response Error] Status Text:', error.response?.statusText);
    console.error('[API Response Error] Response Data:', error.response?.data);
    console.error('[API Response Error] Response Headers:', error.response?.headers);
    console.error('[API Response Error] Request Headers:', error.config?.headers);
    console.error('[API Response Error] Request Data:', error.config?.data);

    // Check for network errors (no response)
    if (!error.response) {
      console.error('[API Response Error] Network Error - No response from server');
      console.error('[API Response Error] Error code:', error.code);
      console.error('[API Response Error] Error message:', error.message);

      // Check for CORS error specifically
      if (error.message?.includes('CORS') || error.message?.includes('cross-origin') || error.code === 'ERR_NETWORK') {
        console.error('========================================');
        console.error('🚨 CORS ERROR DETECTED 🚨');
        console.error('========================================');
        console.error('Your backend needs to allow CORS from: http://localhost:3002');
        console.error('');
        console.error('Add this to your Spring Boot backend:');
        console.error('');
        console.error('@CrossOrigin(origins = "http://localhost:3002")');
        console.error('OR in a WebMvcConfigurer:');
        console.error('');
        console.error('@Override');
        console.error('public void addCorsMappings(CorsRegistry registry) {');
        console.error('    registry.addMapping("/**")');
        console.error('        .allowedOrigins("http://localhost:3002")');
        console.error('        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")');
        console.error('        .allowedHeaders("*")');
        console.error('        .allowCredentials(false);');
        console.error('}');
        console.error('========================================');
      } else {
        console.error('[API Response Error] This usually means:');
        console.error('  1. Backend is not running on port 8081');
        console.error('  2. CORS is blocking the request');
        console.error('  3. Network connectivity issue');
        console.error('  4. Wrong URL/endpoint');
        console.error('  5. Firewall blocking the connection');
      }
    }

    if (error.response?.status === 401) {
      // Avoid redirect loop flicker; let caller handle in UI
      // Optionally emit an event/flag here instead of hard redirect
    }
    return Promise.reject(error);
  }
);

export default apiClient;
