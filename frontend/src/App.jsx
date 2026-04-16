import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import MainLayout from './components/Layout';
import Dashboard from './pages/Admin/Dashboard';
import FormBuilder from './pages/Admin/FormBuilder';
import JournalList from './pages/Journal/JournalList';
import JournalEntry from './pages/Journal/JournalEntry';
import JournalTrace from './pages/Journal/JournalTrace';
import UserManagement from './pages/Admin/UserManagement';
import SystemLogs from './pages/Admin/SystemLogs';
import AdminInventory from './pages/Admin/AdminInventory';
import CustomerManagement from './pages/Admin/CustomerManagement';

import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'Admin') return <Navigate to="/journal" replace />;
  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
        <ConfigProvider 
          theme={{ 
            token: { 
              colorPrimary: '#22c55e',
              borderRadius: 12,
              fontFamily: "'Outfit', sans-serif",
              colorSuccess: '#16a34a',
              colorLink: '#15803d',
              colorLinkHover: '#22c55e',
            },
            components: {
              Button: {
                controlHeight: 40,
                fontWeight: 600,
              },
              Menu: {
                itemHeight: 50,
                itemSelectedBg: '#f0fdf4',
                itemSelectedColor: '#15803d',
              }
            }
          }}
        >
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/trace/:qrCode" element={<JournalTrace />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="form-builder" element={<ProtectedRoute requireAdmin><FormBuilder /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
                <Route path="admin/logs/access" element={<ProtectedRoute requireAdmin><SystemLogs /></ProtectedRoute>} />
                <Route path="admin/logs/changes" element={<ProtectedRoute requireAdmin><SystemLogs /></ProtectedRoute>} />
                <Route path="admin/customers" element={<ProtectedRoute requireAdmin><CustomerManagement /></ProtectedRoute>} />
                <Route path="admin/customer-rights" element={<ProtectedRoute requireAdmin><CustomerManagement /></ProtectedRoute>} />
                <Route path="inventory/items" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
                <Route path="inventory/models" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
                <Route path="journal" element={<JournalList />} />
                <Route path="journal/new/:schemaId" element={<JournalEntry />} />
                <Route path="journal/edit/:id" element={<JournalEntry />} />
              </Route>
            </Routes>
          </Router>
        </ConfigProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
