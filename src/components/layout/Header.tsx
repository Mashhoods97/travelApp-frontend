import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { user } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'HEAD':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'SALES_MANAGER':
        return 'bg-green-100 text-green-800';
      case 'OWNER':
        return 'bg-red-100 text-red-800';
      case 'RESELLER':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-sm text-gray-600">Manage your travel business efficiently</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm">{user?.name}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={getRoleColor(user?.role || '')}>
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}