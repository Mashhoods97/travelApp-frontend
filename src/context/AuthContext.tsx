import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../lib/api';

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

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Head',
    email: 'head@travelco.com',
    role: 'HEAD',
    businessId: 'business-1',
    businessName: 'TravelCo Agency',
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@travelco.com',
    role: 'MANAGER',
    businessId: 'business-1',
    businessName: 'TravelCo Agency',
    createdBy: '1',
    
  },
  {
    id: '3',
    name: 'Mike Sales',
    email: 'sales@travelco.com',
    role: 'SALES_MANAGER',
    businessId: 'business-1',
    businessName: 'TravelCo Agency',
    createdBy: '1',
    
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('travel_portal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to authenticate with your backend first
      const result = await AuthService.signIn({ username: email, password });

      if (result && result.user) {
        const apiUser = result.user as any;
        // Map backend user to app user focusing on role title
        const appUser: User = {
          id: String(apiUser.id ?? ''),
          name: apiUser.username || apiUser.email || '',
          email: apiUser.email || email,
          role: apiUser.roleName || '',
          businessId: 'business-1',
          businessName: 'TravelCo Agency',
        };

        setUser(appUser);
        localStorage.setItem('travel_portal_user', JSON.stringify(appUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock authentication for demo
      const foundUser = users.find(u => u.email === email);
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('travel_portal_user', JSON.stringify(foundUser));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('travel_portal_user');
  };

  const createUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
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