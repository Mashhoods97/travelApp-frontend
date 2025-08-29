import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { UserManagement } from './components/users/UserManagement';
import { HotelManagement } from './components/master-data/HotelManagement';
import { DestinationManagement } from './components/master-data/DestinationManagement';
import { PackageManagement } from './components/master-data/PackageManagement';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { QuotationManagement } from './components/quotations/QuotationManagement';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import DestinationFormPage from './components/master-data/DestinationFormPage';
import HotelFormPage from './components/master-data/HotelFormPage';
import PackageFormPage from './components/master-data/PackageFormPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import queryClient from './lib/api/queryClient';

function AppContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={logout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/hotels" element={<HotelManagement />} />
            <Route path="/hotels/new" element={<HotelFormPage />} />
            <Route path="/hotels/:id" element={<HotelFormPage />} />
            <Route path="/destinations" element={<DestinationManagement />} />
            <Route path="/destinations/new" element={<DestinationFormPage />} />
            <Route path="/destinations/:id" element={<DestinationFormPage />} />
            <Route path="/packages" element={<PackageManagement />} />
            <Route path="/packages/new" element={<PackageFormPage />} />
            <Route path="/packages/:id" element={<PackageFormPage />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/quotations" element={<QuotationManagement />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </Router>

    </QueryClientProvider>
  );
}