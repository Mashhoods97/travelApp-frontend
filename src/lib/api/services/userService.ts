import apiClient from '../client';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, CreateUserRequest, UpdateUserRequest, User, Role } from '../types';

export class UserService {
  static async createUser(payload: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.USER.CREATE, payload);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create user');
  }

  static async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.ROLE.LIST);
    if (response.data.success && response.data.data) {
      const raw = response.data.data;
      // Normalize to Role[] regardless of backend shape (array or map)
      if (Array.isArray(raw)) {
        return raw as Role[];
      }
      if (raw && typeof raw === 'object') {
        // Case: { "1": "OWNER", "2": "RESELLER", ... }
        const entries = Object.entries(raw) as [string, any][];
        return entries.map(([id, title]) => ({ id: Number(id), title: String(title) }));
      }
      return [];
    }
    throw new Error(response.data.message || 'Failed to fetch roles');
  }

  static async getUsersPaged(params: {
    page?: number;
    size?: number;
    name?: string;
    email?: string;
    phone?: string;
  } = {}) {
    const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.USER.LIST_PAGED, {
      params,
    });
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch users');
  }

  static async updateUser(id: string | number, payload: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.USER.UPDATE(id), payload);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update user');
  }

  static async archiveUser(id: string | number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.USER.DELETE(id));
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Failed to archive user');
  }
}

export default UserService;


