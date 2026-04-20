import React, { useState, useEffect } from 'react';
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
import NewsManagement from './pages/Admin/NewsManagement';
import ConsultationManagement from './pages/Admin/ConsultationManagement';
import GeminiTest from './pages/Admin/GeminiTest';
import OpenAITest from './pages/Admin/OpenAITest';
import NewsListAll from './pages/News/NewsListAll';
import NewsDetail from './pages/News/NewsDetail';
import TCVNReference from './pages/Reference/TCVNReference';
import LandingPage from './pages/Landing/LandingPage';
import PublicLayout from './components/PublicLayout';
import ProductionTech from './pages/Journal/ProductionTech';
import FarmerInventory from './pages/Journal/FarmerInventory';
import NotFound from './pages/Auth/NotFound';
import Forbidden from './pages/Auth/Forbidden';
import ForceChangePasswordModal from './components/ForceChangePasswordModal';

import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

// Redirect về đúng trang của mỗi role sau khi đăng nhập
const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === 'Admin') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

// Route cho khách, nếu đã login thì đẩy vào dashboard
const AnonymousRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

// Bảo vệ route có phân quyền
const ProtectedRoute = ({ children, requireAdmin, farmerOnly }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  // Admin cố tình vào trang Farmer-only → hiện 403
  if (farmerOnly && user.role === 'Admin') return <Navigate to="/403" replace />;
  // Farmer cố vào trang Admin-only → hiện 403
  if (requireAdmin && user.role !== 'Admin') return <Navigate to="/403" replace />;
  return children;
};

const App = () => {
  const { user } = useAuthStore();
  const [showForceChangePassword, setShowForceChangePassword] = useState(false);

  useEffect(() => {
    // Check if user needs to change password
    if (user && user.mustChangePassword) {
      setShowForceChangePassword(true);
    } else {
      setShowForceChangePassword(false);
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="147676468818-86oa6l06us45c8as6272v1mbc6egenf5.apps.googleusercontent.com">
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
            <ForceChangePasswordModal 
              visible={showForceChangePassword}
              onSuccess={() => setShowForceChangePassword(false)}
            />
            <Router>
              <Routes>
                {/* Public Guest Portal */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="reference/tcvn" element={<TCVNReference />} />
                  <Route path="news" element={<NewsListAll />} />
                  <Route path="news/:id" element={<NewsDetail />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/trace/:qrCode" element={<JournalTrace />} />
                <Route path="/403" element={<Forbidden />} />
                <Route path="/404" element={<NotFound />} />

                {/* Main App Layout (Authenticated) */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="app" element={<RoleBasedRedirect />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="account-info" element={<AccountInfo />} />
                  <Route path="change-password" element={<ChangePassword />} />

                  {/* Admin-only routes */}
                  <Route path="form-builder" element={<ProtectedRoute requireAdmin><FormBuilder /></ProtectedRoute>} />
                  <Route path="admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
                  <Route path="admin/dashboard" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
                  <Route path="admin/journals" element={<ProtectedRoute requireAdmin><AdminJournalMgmt /></ProtectedRoute>} />
                  <Route path="admin/accounts-mgmt" element={<ProtectedRoute requireAdmin><AccountInfo /></ProtectedRoute>} />
                  <Route path="admin/groups" element={<ProtectedRoute requireAdmin><GroupManagement /></ProtectedRoute>} />
                  <Route path="admin/roles" element={<ProtectedRoute requireAdmin><RolesManagement /></ProtectedRoute>} />
                  <Route path="admin/news" element={<ProtectedRoute requireAdmin><NewsManagement /></ProtectedRoute>} />
                  <Route path="admin/consultations" element={<ProtectedRoute requireAdmin><ConsultationManagement /></ProtectedRoute>} />
                  <Route path="admin/gemini-test" element={<ProtectedRoute requireAdmin><GeminiTest /></ProtectedRoute>} />
                  <Route path="admin/openai-test" element={<ProtectedRoute requireAdmin><OpenAITest /></ProtectedRoute>} />
                  <Route path="admin/logs" element={<ProtectedRoute requireAdmin><SystemLogs /></ProtectedRoute>} />
                  <Route path="admin/backup" element={<ProtectedRoute requireAdmin><BackupMgmt /></ProtectedRoute>} />

                  {/* Agriculture Models & Inventory */}
                  <Route path="agriculture-models" element={<ProtectedRoute><AgricultureModels /></ProtectedRoute>} />
                  <Route path="inventory/items" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />
                  <Route path="inventory/models" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />
                  
                  {/* Farmer-only routes (Category-based nesting) */}
                  <Route path="vietgap/:subCategory">
                    <Route index element={<ProtectedRoute farmerOnly><JournalList /></ProtectedRoute>} />
                    <Route path="new/:schemaId" element={<ProtectedRoute farmerOnly><JournalEntry /></ProtectedRoute>} />
                    <Route path="edit/:id" element={<ProtectedRoute farmerOnly><JournalEntry /></ProtectedRoute>} />
                  </Route>

                  <Route path="huuco/:subCategory">
                    <Route index element={<ProtectedRoute farmerOnly><JournalList /></ProtectedRoute>} />
                    <Route path="new/:schemaId" element={<ProtectedRoute farmerOnly><JournalEntry /></ProtectedRoute>} />
                    <Route path="edit/:id" element={<ProtectedRoute farmerOnly><JournalEntry /></ProtectedRoute>} />
                  </Route>

                  <Route path="thongminh/:subCategory">
                    <Route index element={<ProtectedRoute farmerOnly><JournalList /></ProtectedRoute>} />
                    <Route path="new/:schemaId" element={<ProtectedRoute farmerOnly><JournalEntry /></ProtectedRoute>} />
                    <Route path="edit/:id" element={<ProtectedRoute farmerOnly><JournalEntry /></ProtectedRoute>} />
                  </Route>

                  <Route path="docs" element={<ProtectedRoute farmerOnly><ProductionTech /></ProtectedRoute>} />
                  <Route path="inventory/farmer" element={<ProtectedRoute farmerOnly><FarmerInventory /></ProtectedRoute>} />
                </Route>

                {/* Catch-all: 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AntdApp>
        </ConfigProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
