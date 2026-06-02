import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';
import vi_VN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import NotFound from './pages/Auth/NotFound';
import Forbidden from './pages/Auth/Forbidden';
import MainLayout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import ForceChangePasswordModal from './components/ForceChangePasswordModal';

import Dashboard from './pages/Admin/Dashboard';
import FormBuilder from './pages/Admin/FormBuilder';
import UserManagement from './pages/Admin/UserManagement';
import SystemLogs from './pages/Admin/SystemLogs';
import AdminInventory from './pages/Admin/AdminInventory';
import InventoryCategory from './pages/Admin/InventoryCategory';
import AgricultureModels from './pages/Admin/AgricultureModels';
import AccountInfo from './pages/Admin/AccountInfo';
import AdminJournalMgmt from './pages/Admin/AdminJournalMgmt';
import RolesManagement from './pages/Admin/RolesManagement';
import ChangePassword from './pages/Admin/ChangePassword';
import GroupManagement from './pages/Admin/GroupManagement';
import BackupMgmt from './pages/Admin/BackupMgmt';
import NewsManagement from './pages/Admin/NewsManagement';
import ConsultationManagement from './pages/Admin/ConsultationManagement';
import GeminiTest from './pages/Admin/GeminiTest';
import OpenAITest from './pages/Admin/OpenAITest';
import GroqTest from './pages/Admin/GroqTest';
import RAGTest from './pages/Admin/RAGTest';
import ChatStats from './pages/Admin/ChatStats';

import JournalList from './pages/Journal/JournalList';
import JournalEntry from './pages/Journal/JournalEntry';
import JournalTrace from './pages/Journal/JournalTrace';
import ProductionTech from './pages/Journal/ProductionTech';
import FarmerInventory from './pages/Journal/FarmerInventory';
import HtxJournalMgmt from './pages/HTX/HtxJournalMgmt';
import HtxJournalApproval from './pages/HTX/HtxJournalApproval';
import NewsListAll from './pages/News/NewsListAll';
import NewsDetail from './pages/News/NewsDetail';
import TCVNReference from './pages/Reference/TCVNReference';
import LandingPage from './pages/Landing/LandingPage';
import { useAuthStore } from './store/authStore';
import {
  isAdmin,
  isFarmer,
  isHtx,
  isHtxDirector,
  isHtxTechnical,
  isHtxDistribution,
  isHtxAccountant,
  normalizeRole,
  canAccessHtxFarmerManagement,
  canHandleFarmerSubmissions,
  canManageAccountingOperations,
  canManageDistributionFinance,
  canManageDistributionOperations,
  canManageFinance,
  canManageHtxJournals,
  canManageSupplies,
  canManageTechnicalOperations,
  canManageTraceability,
  canViewHtxJournals,
  canViewHtxReports,
  canViewInventory,
  canViewTraceability,
  getRoleHomePath,
} from './utils/roles';

const HtxFarmerMgmt = lazy(() => import('./pages/HTX/HtxFarmerMgmt'));
const HtxInventoryMgmt = lazy(() => import('./pages/HTX/HtxInventoryMgmt'));
const HtxProductMgmt = lazy(() => import('./pages/HTX/HtxProductMgmt'));
const HtxBatchMgmt = lazy(() => import('./pages/HTX/HtxBatchMgmt'));
const HtxSupplyMgmt = lazy(() => import('./pages/HTX/HtxSupplyMgmt'));
const HtxPortalSettings = lazy(() => import('./pages/HTX/HtxPortalSettings'));
const HtxDirectorConsole = lazy(() => import('./pages/HTX/HtxDirectorConsole'));
const HtxTechnicalConsole = lazy(() => import('./pages/HTX/HtxTechnicalConsole'));
const HtxDistributionConsole = lazy(() => import('./pages/HTX/HtxDistributionConsole'));
const HtxAccountingConsole = lazy(() => import('./pages/HTX/HtxAccountingConsole'));
const HtxManagementModule = lazy(() => import('./pages/HTX/HtxManagementModule'));
const Reports = lazy(() => import('./pages/Admin/Reports'));
const FarmerSupplyMgmt = lazy(() => import('./pages/Journal/FarmerSupplyMgmt'));
const FarmerHtxAssignments = lazy(() => import('./pages/Journal/FarmerHtxAssignments'));
const FarmerHtxFeedback = lazy(() => import('./pages/Journal/FarmerHtxFeedback'));

dayjs.locale('vi');

const queryClient = new QueryClient();

const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

const AnonymousRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

const ProtectedRoute = ({ children, requireAdmin, farmerOnly, htxOnly, allowedRoles, canAccess }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (farmerOnly && !isFarmer(user.role)) return <Navigate to="/403" replace />;
  if (htxOnly && !isHtx(user.role) && !isAdmin(user.role)) return <Navigate to="/403" replace />;
  if (allowedRoles && !allowedRoles.includes(normalizeRole(user.role))) return <Navigate to="/403" replace />;
  if (canAccess && !canAccess(user.role)) return <Navigate to="/403" replace />;
  if (requireAdmin && !isAdmin(user.role)) return <Navigate to="/403" replace />;
  return children;
};

const App = () => {
  const { user } = useAuthStore();
  const [showForceChangePassword, setShowForceChangePassword] = useState(false);

  useEffect(() => {
    setShowForceChangePassword(!!user?.mustChangePassword);
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '147676468818-86oa6l06us45c8as6272v1mbc6egenf5.apps.googleusercontent.com'}>
        <ConfigProvider
          locale={vi_VN}
          theme={{
            token: {
              colorPrimary: '#22c55e',
              borderRadius: 12,
              fontFamily: "'Roboto', sans-serif",
              colorSuccess: '#16a34a',
              colorLink: '#15803d',
              colorLinkHover: '#22c55e',
            },
            components: {
              Button: { controlHeight: 40, fontWeight: 600 },
              Menu: { itemHeight: 50, itemSelectedBg: '#f0fdf4', itemSelectedColor: '#15803d' },
            },
          }}
        >
          <AntdApp>
            <ForceChangePasswordModal visible={showForceChangePassword} onSuccess={() => setShowForceChangePassword(false)} />
            <Router>
              <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="reference/tcvn" element={<TCVNReference />} />
                    <Route path="news" element={<NewsListAll />} />
                    <Route path="news/:id" element={<NewsDetail />} />
                  </Route>

                  <Route path="/login" element={<AnonymousRoute><Login /></AnonymousRoute>} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/trace/:qrCode" element={<JournalTrace />} />
                  <Route path="/trace/batch/:traceId" element={<JournalTrace isBatch />} />
                  <Route path="/403" element={<Forbidden />} />
                  <Route path="/404" element={<NotFound />} />

                  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="app" element={<RoleBasedRedirect />} />
                    <Route path="htx" element={<RoleBasedRedirect />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="farmers" element={<ProtectedRoute htxOnly canAccess={canAccessHtxFarmerManagement}><HtxFarmerMgmt /></ProtectedRoute>} />
                    <Route path="inventory" element={<ProtectedRoute htxOnly canAccess={canViewInventory}><HtxInventoryMgmt /></ProtectedRoute>} />
                    <Route path="reports" element={<ProtectedRoute canAccess={(role) => !isHtx(role) || canViewHtxReports(role)}><Reports /></ProtectedRoute>} />
                    <Route path="tcvn" element={<TCVNReference />} />
                    <Route path="account-info" element={<AccountInfo />} />
                    <Route path="change-password" element={<ChangePassword />} />

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
                    <Route path="admin/groq-test" element={<ProtectedRoute requireAdmin><GroqTest /></ProtectedRoute>} />
                    <Route path="admin/rag-test" element={<ProtectedRoute requireAdmin><RAGTest /></ProtectedRoute>} />
                    <Route path="admin/chat-stats" element={<ProtectedRoute requireAdmin><ChatStats /></ProtectedRoute>} />
                    <Route path="admin/logs" element={<ProtectedRoute requireAdmin><SystemLogs /></ProtectedRoute>} />
                    <Route path="admin/backup" element={<ProtectedRoute requireAdmin><BackupMgmt /></ProtectedRoute>} />

                    <Route path="htx/director" element={<ProtectedRoute htxOnly canAccess={isHtxDirector}><HtxDirectorConsole /></ProtectedRoute>} />
                    <Route path="htx/technical" element={<ProtectedRoute htxOnly canAccess={isHtxTechnical}><HtxTechnicalConsole /></ProtectedRoute>} />
                    <Route path="htx/distribution" element={<ProtectedRoute htxOnly canAccess={isHtxDistribution}><HtxDistributionConsole /></ProtectedRoute>} />
                    <Route path="htx/accounting" element={<ProtectedRoute htxOnly canAccess={isHtxAccountant}><HtxAccountingConsole /></ProtectedRoute>} />
                    <Route path="htx/documents" element={<ProtectedRoute htxOnly canAccess={isHtxDirector}><HtxManagementModule moduleKey="documents" /></ProtectedRoute>} />
                    <Route path="htx/tasks" element={<ProtectedRoute htxOnly canAccess={isHtxDirector}><HtxManagementModule moduleKey="tasks" /></ProtectedRoute>} />
                    <Route path="htx/finance" element={<ProtectedRoute htxOnly canAccess={canManageFinance}><HtxManagementModule moduleKey="finance" /></ProtectedRoute>} />
                    <Route path="htx/partners" element={<ProtectedRoute htxOnly canAccess={isHtxDirector}><HtxManagementModule moduleKey="partners" /></ProtectedRoute>} />
                    <Route path="htx/training" element={<ProtectedRoute htxOnly canAccess={isHtxDirector}><HtxManagementModule moduleKey="training" /></ProtectedRoute>} />
                    <Route path="htx/technical-guidance" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="technical-guidance" /></ProtectedRoute>} />
                    <Route path="htx/technical-training" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="technical-training" /></ProtectedRoute>} />
                    <Route path="htx/pest-control" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="pest-control" /></ProtectedRoute>} />
                    <Route path="htx/product-inspections" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="product-inspections" /></ProtectedRoute>} />
                    <Route path="htx/nonconformities" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="nonconformities" /></ProtectedRoute>} />
                    <Route path="htx/material-supervision" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="material-supervision" /></ProtectedRoute>} />
                    <Route path="htx/technical-proposals" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="technical-proposals" /></ProtectedRoute>} />
                    <Route path="htx/technical-reports" element={<ProtectedRoute htxOnly canAccess={canManageTechnicalOperations}><HtxManagementModule moduleKey="technical-reports" /></ProtectedRoute>} />
                    <Route path="htx/farmer-reports" element={<ProtectedRoute htxOnly canAccess={canHandleFarmerSubmissions}><HtxManagementModule moduleKey="farmer-reports" /></ProtectedRoute>} />
                    <Route path="htx/farmer-suggestions" element={<ProtectedRoute htxOnly canAccess={canHandleFarmerSubmissions}><HtxManagementModule moduleKey="farmer-suggestions" /></ProtectedRoute>} />
                    <Route path="htx/farmer-equipment-requests" element={<ProtectedRoute htxOnly canAccess={(role) => isAdmin(role) || isHtxDirector(role)}><HtxManagementModule moduleKey="farmer-equipment-requests" /></ProtectedRoute>} />
                    <Route path="htx/farmer-duty-confirmations" element={<ProtectedRoute htxOnly canAccess={canHandleFarmerSubmissions}><HtxManagementModule moduleKey="farmer-duty-confirmations" /></ProtectedRoute>} />
                    <Route path="htx/distribution-orders" element={<ProtectedRoute htxOnly canAccess={canManageDistributionOperations}><HtxManagementModule moduleKey="distribution-orders" /></ProtectedRoute>} />
                    <Route path="htx/distribution-shipments" element={<ProtectedRoute htxOnly canAccess={canManageDistributionOperations}><HtxManagementModule moduleKey="distribution-shipments" /></ProtectedRoute>} />
                    <Route path="htx/market-development" element={<ProtectedRoute htxOnly canAccess={canManageDistributionOperations}><HtxManagementModule moduleKey="market-development" /></ProtectedRoute>} />
                    <Route path="htx/customer-feedback" element={<ProtectedRoute htxOnly canAccess={canManageDistributionOperations}><HtxManagementModule moduleKey="customer-feedback" /></ProtectedRoute>} />
                    <Route path="htx/product-finalization" element={<ProtectedRoute htxOnly canAccess={canManageDistributionOperations}><HtxManagementModule moduleKey="product-finalization" /></ProtectedRoute>} />
                    <Route path="htx/distribution-finance" element={<ProtectedRoute htxOnly canAccess={canManageDistributionFinance}><HtxManagementModule moduleKey="distribution-finance-requests" /></ProtectedRoute>} />
                    <Route path="htx/accounting-transactions" element={<ProtectedRoute htxOnly canAccess={canManageAccountingOperations}><HtxManagementModule moduleKey="accounting-transactions" /></ProtectedRoute>} />
                    <Route path="htx/accounting-receivables" element={<ProtectedRoute htxOnly canAccess={canManageAccountingOperations}><HtxManagementModule moduleKey="accounting-receivables" /></ProtectedRoute>} />
                    <Route path="htx/accounting-payables" element={<ProtectedRoute htxOnly canAccess={canManageAccountingOperations}><HtxManagementModule moduleKey="accounting-payables" /></ProtectedRoute>} />
                    <Route path="htx/accounting-reports" element={<ProtectedRoute htxOnly canAccess={canManageAccountingOperations}><HtxManagementModule moduleKey="accounting-reports" /></ProtectedRoute>} />
                    <Route path="htx/tax-obligations" element={<ProtectedRoute htxOnly canAccess={canManageAccountingOperations}><HtxManagementModule moduleKey="tax-obligations" /></ProtectedRoute>} />
                    <Route path="htx/financial-recommendations" element={<ProtectedRoute htxOnly canAccess={canManageAccountingOperations}><HtxManagementModule moduleKey="financial-recommendations" /></ProtectedRoute>} />
                    <Route path="htx/journals" element={<ProtectedRoute htxOnly canAccess={canViewHtxJournals}><HtxJournalMgmt /></ProtectedRoute>} />
                    <Route path="htx/approvals" element={<ProtectedRoute htxOnly canAccess={canManageHtxJournals}><HtxJournalApproval /></ProtectedRoute>} />
                    <Route path="htx/farmers" element={<ProtectedRoute htxOnly canAccess={canAccessHtxFarmerManagement}><HtxFarmerMgmt /></ProtectedRoute>} />
                    <Route path="htx/products" element={<ProtectedRoute htxOnly canAccess={canViewTraceability}><HtxProductMgmt /></ProtectedRoute>} />
                    <Route path="htx/batches" element={<ProtectedRoute htxOnly canAccess={canViewTraceability}><HtxBatchMgmt /></ProtectedRoute>} />
                    <Route path="htx/supplies" element={<ProtectedRoute htxOnly canAccess={canManageSupplies}><HtxSupplyMgmt /></ProtectedRoute>} />
                    <Route path="htx/portal-settings" element={<ProtectedRoute htxOnly canAccess={canManageTraceability}><HtxPortalSettings /></ProtectedRoute>} />
                    <Route path="journals/view/:id" element={<ProtectedRoute><JournalEntry /></ProtectedRoute>} />

                    <Route path="agriculture-models" element={<ProtectedRoute><AgricultureModels /></ProtectedRoute>} />
                    <Route path="inventory/items" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />
                    <Route path="inventory/categories" element={<ProtectedRoute><InventoryCategory /></ProtectedRoute>} />
                    <Route path="inventory/models" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />

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
                    <Route path="htx-assignments" element={<ProtectedRoute farmerOnly><FarmerHtxAssignments /></ProtectedRoute>} />
                    <Route path="htx-feedback" element={<ProtectedRoute farmerOnly><FarmerHtxFeedback /></ProtectedRoute>} />
                    <Route path="inventory/farmer" element={<ProtectedRoute farmerOnly><FarmerInventory /></ProtectedRoute>} />
                    <Route path="supplies/farmer" element={<ProtectedRoute farmerOnly><FarmerSupplyMgmt /></ProtectedRoute>} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </AntdApp>
        </ConfigProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
