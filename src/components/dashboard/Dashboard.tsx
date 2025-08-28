import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Building2, MapPin, Package, Users, UserCheck, FileText, TrendingUp, DollarSign } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { hotels, destinations, packages, customers, quotations } = useData();

  const stats = [
    {
      title: 'Total Hotels',
      value: hotels.length,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Destinations',
      value: destinations.length,
      icon: <MapPin className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Packages',
      value: packages.length,
      icon: <Package className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Customers',
      value: customers.length,
      icon: <UserCheck className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Quotations',
      value: quotations.length,
      icon: <FileText className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Total Revenue',
      value: `$${quotations.filter(q => q.status === 'APPROVED').reduce((sum, q) => sum + q.finalPrice, 0).toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ];

  const recentQuotations = quotations.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl mb-2">Welcome to Travel Portal</h1>
        <p className="text-blue-100">
          Manage your travel business efficiently with our comprehensive platform
        </p>
        <div className="flex items-center space-x-4 mt-4">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {user?.role}
          </Badge>
          <span className="text-blue-100">{user?.businessName}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Recent Quotations</span>
            </CardTitle>
            <CardDescription>
              Latest quotation requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuotations.length > 0 ? (
              <div className="space-y-4">
                {recentQuotations.map((quotation) => {
                  const customer = customers.find(c => c.id === quotation.customerId);
                  const pkg = packages.find(p => p.id === quotation.packageId);
                  
                  return (
                    <div key={quotation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm">{customer?.name}</p>
                        <p className="text-xs text-gray-600">{pkg?.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(quotation.status)}>
                          {quotation.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          ${quotation.finalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No quotations yet</p>
            )}
          </CardContent>
        </Card>

        {/* Popular Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Popular Packages</span>
            </CardTitle>
            <CardDescription>
              Most requested travel packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {packages.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={pkg.image} 
                    alt={pkg.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm">{pkg.name}</p>
                    <p className="text-xs text-gray-600">{pkg.duration} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">${pkg.basePrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}