import apiClient from '../client';
import { API_ENDPOINTS } from '../constants';
import { 
  SignInRequest, 
  SignUpRequest, 
  AuthResponse, 
  User, 
  ApiResponse,
  BackendSignInResponse,
} from '../types';

export class AuthService {
  /**
   * Sign in user with email and password
   */
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      console.log('[AuthService] SignIn called with:', credentials);
      console.log('[AuthService] Endpoint:', API_ENDPOINTS.AUTH.SIGNIN);
      console.log('[AuthService] Base URL:', apiClient.defaults.baseURL);
      console.log('[AuthService] Full URL will be:', apiClient.defaults.baseURL + API_ENDPOINTS.AUTH.SIGNIN);
      console.log('[AuthService] Request payload:', JSON.stringify(credentials));
      console.log('[AuthService] About to make POST request...');
      
      const response = await apiClient.post<BackendSignInResponse>(
        API_ENDPOINTS.AUTH.SIGNIN,
        credentials
      );
      
      console.log('[AuthService] Request completed, response received');
      console.log('[AuthService] Full response object:', response);
      console.log('[AuthService] Response status:', response.status);
      console.log('[AuthService] Response data:', JSON.stringify(response.data, null, 2));
      
      const payload = response.data;
      
      // Handle different response formats
      let responseData: any = null;
      
      // Format 1: { success: true, data: { ... } }
      if (payload.success && payload.data) {
        responseData = payload.data;
        console.log('[AuthService] Using wrapped response format (success.data)');
      }
      // Format 2: Direct data response { accessToken: ..., id: ..., ... }
      else if (payload.accessToken || payload.token) {
        responseData = payload;
        console.log('[AuthService] Using direct response format');
      }
      // Format 3: Response is the data itself
      else if (payload.id || payload.email) {
        responseData = payload;
        console.log('[AuthService] Using flat response format');
      }
      
      if (responseData) {
        // Extract token (could be accessToken, token, or jwt)
        const token = responseData.accessToken || responseData.token || responseData.jwt || '';
        
        if (!token) {
          console.error('[AuthService] No token found in response:', responseData);
          throw new Error('No authentication token received from server');
        }
        
        // Build user object with flexible field mapping
        const normalized: AuthResponse = {
          token: token,
          user: {
            id: responseData.id || responseData.userId || '',
            username: responseData.username || responseData.userName || responseData.email || '',
            email: responseData.email || '',
            roleId: responseData.roleId || responseData.role?.id || responseData.roleId,
            roleName: responseData.roleName || responseData.role?.name || responseData.role?.title || responseData.role || '',
            privileges: responseData.privileges || responseData.permissions || [],
            type: responseData.type || responseData.userType,
          },
        };
        
        console.log('[AuthService] Normalized response:', normalized);
        
        // Persist for client
        localStorage.setItem('authToken', normalized.token);
        localStorage.setItem('user', JSON.stringify(normalized.user));
        console.log('[AuthService] SignIn successful, token saved');
        return normalized;
      }
      
      console.error('[AuthService] Unexpected response format:', payload);
      throw new Error(payload.message || payload.error || 'Sign in failed - unexpected response format');
    } catch (error: any) {
      console.error('[AuthService] SignIn error details:', error);
      console.error('[AuthService] Error message:', error.message);
      console.error('[AuthService] Error response:', error.response);
      console.error('[AuthService] Error config:', error.config);
      throw new Error(error.response?.data?.message || error.message || 'Sign in failed');
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.SIGNUP,
        userData
      );
      
      if (response.data.success && response.data.data) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Sign up failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Sign up failed');
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.SIGNOUT);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );
      
      if (response.data.success && response.data.data) {
        // Update stored tokens
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Token refresh failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  /**
   * Verify current token
   */
  static async verifyToken(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.VERIFY
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Token verification failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Get stored auth token
   */
  static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default AuthService;
