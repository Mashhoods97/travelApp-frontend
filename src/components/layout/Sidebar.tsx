import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  MapPin, 
  Package, 
  UserCheck, 
  FileText,
  Plane
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['HEAD', 'MANAGER', 'SALES_MANAGER', 'OWNER', 'RESELLER']
  },
  {
    path: '/users',
    label: 'User Management',
    icon: <Users className="w-5 h-5" />,
    roles: ['HEAD', 'OWNER']
  },
  {
    path: '/hotels',
    label: 'Hotels',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['HEAD', 'MANAGER']
  },
  {
    path: '/destinations',
    label: 'Destinations',
    icon: <MapPin className="w-5 h-5" />,
    roles: ['HEAD', 'MANAGER']
  },
  {
    path: '/packages',
    label: 'Packages',
    icon: <Package className="w-5 h-5" />,
    roles: ['HEAD', 'MANAGER', 'SALES_MANAGER']
  },
  {
    path: '/customers',
    label: 'Customers',
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['HEAD', 'MANAGER']
  },
  {
    path: '/quotations',
    label: 'Quotations',
    icon: <FileText className="w-5 h-5" />,
    roles: ['HEAD', 'MANAGER', 'SALES_MANAGER']
  }
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Temporarily allow all users to see all modules (disable role-based filtering)
  const filteredMenuItems = menuItems;

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg">Travel Portal</h2>
            <p className="text-sm text-gray-600">{user?.businessName}</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}