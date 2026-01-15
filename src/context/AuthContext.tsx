import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../lib/api';
import { UserService } from '../lib/api/services/userService';

export type UserRole = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // backend-provided role title
  businessId: string;
  businessName: string;
  createdBy?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  createUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Check for existing session from backend
    const savedUser = AuthService.getCurrentUser();
    if (savedUser) {
      setUser({
        id: String(savedUser.id || ''),
        name: savedUser.username || savedUser.email || '',
        email: savedUser.email || '',
        role: savedUser.roleName || '',
        businessId: 'business-1',
        businessName: 'TravelCo Agency',
      });
    }
    // Load users from backend
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await UserService.getUsersPaged({ page: 1, size: 100 });
      if (response && response.content) {
        const mappedUsers: User[] = response.content.map((u: any) => ({
          id: String(u.id || ''),
          name: u.username || u.email || '',
          email: u.email || '',
          role: u.roleName || '',
          businessId: 'business-1',
          businessName: 'TravelCo Agency',
          createdBy: u.createdBy ? String(u.createdBy) : undefined,
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AuthContext] login called with email:', email);
    try {
      console.log('[AuthContext] Calling AuthService.signIn...');
      const result = await AuthService.signIn({ username: email, password });
      console.log('[AuthContext] AuthService.signIn result:', result);

      if (result && result.user) {
        const apiUser = result.user as any;
        const appUser: User = {
          id: String(apiUser.id ?? ''),
          name: apiUser.username || apiUser.email || '',
          email: apiUser.email || email,
          role: apiUser.roleName || '',
          businessId: 'business-1',
          businessName: 'TravelCo Agency',
        };

        console.log('[AuthContext] Setting user:', appUser);
        setUser(appUser);
        localStorage.setItem('travel_portal_user', JSON.stringify(appUser));
        // Reload users after login
        loadUsers();
        return true;
      }
      console.warn('[AuthContext] Login result missing user data');
      return false;
    } catch (error: any) {
      console.error('[AuthContext] Login error caught:', error);
      console.error('[AuthContext] Error type:', typeof error);
      console.error('[AuthContext] Error message:', error?.message);
      console.error('[AuthContext] Error stack:', error?.stack);
      console.error('[AuthContext] Full error object:', JSON.stringify(error, null, 2));
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('travel_portal_user');
    }
  };

  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      const payload: any = {
        username: userData.email,
        email: userData.email,
        phone: '',
        roleId: 0, // Should be provided
      };
      const created = await UserService.createUser(payload);
      const newUser: User = {
        id: String(created.id || ''),
        name: created.username || created.email || '',
        email: created.email || '',
        role: created.roleName || '',
        businessId: userData.businessId,
        businessName: userData.businessName,
      };
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      console.error('Failed to create user', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const payload: any = {
        email: userData.email,
        phone: '',
      };
      await UserService.updateUser(userId, payload);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await UserService.archiveUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      users,
      createUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}