import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';
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
import AgricultureModels from './pages/Admin/AgricultureModels';
import AccountInfo from './pages/Admin/AccountInfo';
import AdminJournalMgmt from './pages/Admin/AdminJournalMgmt';
import Reports from './pages/Admin/Reports';
import RolesManagement from './pages/Admin/RolesManagement';
import ChangePassword from './pages/Admin/ChangePassword';
import GroupManagement from './pages/Admin/GroupManagement';
import BackupMgmt from './pages/Admin/BackupMgmt';
import ProductionTech from './pages/Journal/ProductionTech';
import FarmerInventory from './pages/Journal/FarmerInventory';

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
          <AntdApp>
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
                  <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="form-builder" element={<ProtectedRoute requireAdmin><FormBuilder /></ProtectedRoute>} />
                  <Route path="admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
                  <Route path="account-info" element={<ProtectedRoute><AccountInfo /></ProtectedRoute>} />
                  <Route path="admin/dashboard" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
                  <Route path="admin/journals" element={<ProtectedRoute requireAdmin><AdminJournalMgmt /></ProtectedRoute>} />
                  <Route path="change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                  <Route path="admin/roles" element={<ProtectedRoute requireAdmin><RolesManagement /></ProtectedRoute>} />
                  <Route path="admin/rights" element={<ProtectedRoute requireAdmin><RolesManagement /></ProtectedRoute>} />
                  <Route path="admin/logs/access" element={<ProtectedRoute requireAdmin><SystemLogs /></ProtectedRoute>} />
                  <Route path="admin/logs/changes" element={<ProtectedRoute requireAdmin><SystemLogs /></ProtectedRoute>} />
                  <Route path="admin/groups" element={<ProtectedRoute requireAdmin><GroupManagement /></ProtectedRoute>} />
                  <Route path="admin/customers" element={<ProtectedRoute requireAdmin><CustomerManagement /></ProtectedRoute>} />
                  <Route path="agriculture-models" element={<ProtectedRoute requireAdmin><AgricultureModels /></ProtectedRoute>} />
                  <Route path="admin/customer-rights" element={<ProtectedRoute requireAdmin><RolesManagement /></ProtectedRoute>} />
                  <Route path="inventory/items" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
                  <Route path="inventory/models" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
                  <Route path="admin/config/backup" element={<ProtectedRoute requireAdmin><BackupMgmt /></ProtectedRoute>} />
                  <Route path="journal" element={<JournalList />} />
                  <Route path="journal/new/:schemaId" element={<JournalEntry />} />
                  <Route path="journal/edit/:id" element={<JournalEntry />} />
                  
                  {/* Farmer Specific Routes */}
                  <Route path="vietgap/*" element={<ProductionTech />} />
                  <Route path="huuco/*" element={<ProductionTech />} />
                  <Route path="thongminh/*" element={<ProductionTech />} />
                  <Route path="inventory/farmer" element={<FarmerInventory />} />
                </Route>
              </Routes>
            </Router>
          </AntdApp>
        </ConfigProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
