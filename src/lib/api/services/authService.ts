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
      const response = await apiClient.post<BackendSignInResponse>(
        API_ENDPOINTS.AUTH.SIGNIN,
        credentials
      );
      const payload = response.data;
      if (payload.success && payload.data) {
        const d = payload.data;
        const normalized: AuthResponse = {
          token: d.accessToken,
          user: {
            id: d.id,
            username: d.username,
            email: d.email,
            roleId: d.roleId,
            roleName: d.roleName,
            privileges: d.privileges,
            type: d.type,
          },
        };
        // Persist for client
        localStorage.setItem('authToken', normalized.token);
        localStorage.setItem('user', JSON.stringify(normalized.user));
        return normalized;
      }
      
      throw new Error(payload.message || 'Sign in failed');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.response?.data?.message || 'Sign in failed');
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
