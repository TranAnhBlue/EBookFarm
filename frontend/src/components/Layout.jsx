import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer, Grid, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BarcodeOutlined,
  BorderOutlined,
  BoxPlotOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InboxOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuOutlined,
  PhoneOutlined,
  ReadOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Leaf, RefreshCcw, Sprout, Tractor } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrl, getInitialAvatar } from '../utils/helpers';
import api from '../services/api';
import NotificationBell from './NotificationBell';
import {
  isAdmin,
  isHtx,
  isHtxDirector,
  isHtxTechnical,
  isHtxDistribution,
  isHtxAccountant,
  isHtxSupervisor,
  normalizeRole,
  roleLabel,
  canManageHtxJournals,
  canManageSupplies,
  canManageTraceability,
  canViewTraceability,
  canViewHtxJournals,
  canViewHtxMembers,
  canViewInventory,
  canAccessHtxFarmerManagement,
  canViewHtxReports,
  canManageTechnicalOperations,
  canHandleFarmerSubmissions,
  canManageDistributionOperations,
  canManageAccountingOperations,
  canManageDistributionFinance,
} from '../utils/roles';
import logoImg from '../assets/logo-ebookfarm.jpg';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const label = (text, count = 0) => (
  <span className="font-medium inline-flex items-center gap-2 min-w-0">
    <span className="truncate">{text}</span>
    {count > 0 && (
      <Badge
        count={count}
        overflowCount={99}
        size="small"
        styles={{
          indicator: {
            backgroundColor: '#16a34a',
            color: '#fff',
            boxShadow: '0 0 0 2px #ecfdf5',
            borderRadius: 999,
            fontWeight: 700,
          },
        }}
      />
    )}
  </span>
);

const actionStatuses = new Set(['Pending', 'Review', 'InProgress', 'Chờ duyệt', 'Cần chỉnh sửa', 'Chưa nhập', 'Đang nhập']);
const countActionRecords = (records = []) => records.filter(item => actionStatuses.has(item.status)).length;
const sumPathCounts = (counts, paths = []) => paths.reduce((total, path) => total + (counts[path] || 0), 0);

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const role = normalizeRole(user?.role);

  const { data: sidebarCounts = {} } = useQuery({
    queryKey: ['sidebar-badges', user?._id, role],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const counts = {};
      const readData = (result) => result.status === 'fulfilled' ? (result.value?.data?.data || []) : [];

      if (isHtx(role)) {
        const moduleRouteMap = {
          documents: '/htx/documents',
          tasks: '/htx/tasks',
          finance: '/htx/finance',
          partners: '/htx/partners',
          training: '/htx/training',
          'technical-guidance': '/htx/technical-guidance',
          'technical-training': '/htx/technical-training',
          'pest-control': '/htx/pest-control',
          'product-inspections': '/htx/product-inspections',
          nonconformities: '/htx/nonconformities',
          'material-supervision': '/htx/material-supervision',
          'technical-proposals': '/htx/technical-proposals',
          'technical-reports': '/htx/technical-reports',
          'farmer-reports': '/htx/farmer-reports',
          'farmer-suggestions': '/htx/farmer-suggestions',
          'farmer-equipment-requests': '/htx/farmer-equipment-requests',
          'farmer-duty-confirmations': '/htx/farmer-duty-confirmations',
          'distribution-orders': '/htx/distribution-orders',
          'distribution-shipments': '/htx/distribution-shipments',
          'market-development': '/htx/market-development',
          'customer-feedback': '/htx/customer-feedback',
          'product-finalization': '/htx/product-finalization',
          'distribution-finance-requests': '/htx/distribution-finance',
          'accounting-transactions': '/htx/accounting-transactions',
          'accounting-receivables': '/htx/accounting-receivables',
          'accounting-payables': '/htx/accounting-payables',
          'accounting-reports': '/htx/accounting-reports',
          'tax-obligations': '/htx/tax-obligations',
          'financial-recommendations': '/htx/financial-recommendations',
        };

        const modules = [];
        const addModules = (items) => items.forEach(item => {
          if (!modules.includes(item)) modules.push(item);
        });

        if (isHtxDirector(role)) addModules(['documents', 'tasks', 'finance', 'partners', 'training']);
        if (canManageTechnicalOperations(role) && (isHtxDirector(role) || isHtxTechnical(role))) {
          addModules(['technical-guidance', 'technical-training', 'pest-control', 'product-inspections', 'nonconformities', 'material-supervision', 'technical-proposals', 'technical-reports']);
        }
        if ((isHtxDirector(role) || isHtxTechnical(role)) && canHandleFarmerSubmissions(role)) {
          addModules(['farmer-reports', 'farmer-suggestions', 'farmer-equipment-requests', 'farmer-duty-confirmations']);
        }
        if (canManageDistributionOperations(role) && (isHtxDirector(role) || isHtxDistribution(role))) {
          addModules(['distribution-orders', 'distribution-shipments', 'market-development', 'customer-feedback', 'product-finalization', 'distribution-finance-requests']);
        }
        if (canManageAccountingOperations(role) && (isHtxDirector(role) || isHtxAccountant(role))) {
          addModules(['distribution-finance-requests', 'accounting-transactions', 'accounting-receivables', 'accounting-payables', 'accounting-reports', 'tax-obligations', 'financial-recommendations']);
        }

        const [approvalsRes, suppliesRes, inventoryRes, journalsRes, ...moduleResponses] = await Promise.allSettled([
          canManageHtxJournals(role) ? api.get('/htx/journals/approvals/pending') : Promise.resolve({ data: { data: [] } }),
          canManageSupplies(role) ? api.get('/supply-requests') : Promise.resolve({ data: { data: [] } }),
          canViewInventory(role) ? api.get('/inventory') : Promise.resolve({ data: { data: [] } }),
          canViewHtxJournals(role) ? api.get('/htx/journals') : Promise.resolve({ data: { data: [] } }),
          ...modules.map(moduleKey => api.get(`/htx/management/${moduleKey}`)),
        ]);

        counts['/htx/approvals'] = readData(approvalsRes).length;
        counts['/htx/supplies'] = readData(suppliesRes).filter(item => item.status === 'Pending').length;
        counts['/inventory'] = readData(inventoryRes).filter(item => Number(item.quantity || 0) <= Number(item.minQuantity || 10)).length;
        counts['/htx/journals'] = readData(journalsRes).reduce((total, journal) => {
          const farmers = Array.isArray(journal.farmers) ? journal.farmers : [];
          return total + farmers.filter(farmer => actionStatuses.has(farmer.status)).length;
        }, 0);

        modules.forEach((moduleKey, index) => {
          counts[moduleRouteMap[moduleKey]] = countActionRecords(readData(moduleResponses[index]));
        });
      }

      if (!isHtx(role) && !isAdmin(role)) {
        const [assignmentsRes, submissionsRes, suppliesRes, inventoryRes] = await Promise.allSettled([
          api.get('/htx/management/farmer/assignments'),
          api.get('/htx/management/farmer/submissions'),
          api.get('/supply-requests'),
          api.get('/inventory'),
        ]);

        counts['/htx-assignments'] = countActionRecords(readData(assignmentsRes));
        counts['/htx-feedback'] = countActionRecords(readData(submissionsRes));
        counts['/supplies/farmer'] = readData(suppliesRes).filter(item => item.status === 'Pending').length;
        counts['/inventory/farmer'] = readData(inventoryRes).filter(item => Number(item.quantity || 0) <= Number(item.minQuantity || 10)).length;
      }

      return counts;
    },
  });

  const badge = (path) => sidebarCounts[path] || 0;
  const groupBadge = (paths) => sumPathCounts(sidebarCounts, paths);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const adminItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: label('Tổng quan') },
    { key: '/htx/gis-map', icon: <EnvironmentOutlined />, label: label('Bản đồ số GIS 100ha') },
    { key: '/htx/iot-dashboard', icon: <ThunderboltOutlined />, label: label('Giám sát thông minh IoT') },
    { key: '/reports', icon: <BarChartOutlined />, label: label('Báo cáo & Thống kê') },
    { key: '/account-info', icon: <UserOutlined />, label: label('Thông tin tài khoản') },
    { key: '/form-builder', icon: <FileTextOutlined />, label: label('Biểu mẫu nhật ký') },
    { key: '/tcvn', icon: <ReadOutlined />, label: label('Tra cứu TCVN') },
    { key: '/admin/news', icon: <FileTextOutlined />, label: label('Quản lý tin tức') },
    { key: '/admin/consultations', icon: <PhoneOutlined />, label: label('Yêu cầu tư vấn') },
    { key: '/agriculture-models', icon: <GlobalOutlined />, label: label('Mô hình nông nghiệp') },
    { key: '/admin/journals', icon: <SettingOutlined />, label: label('Quản lý nhật ký') },
    {
      key: 'inventory-mgmt',
      icon: <Tractor className="w-5 h-5" />,
      label: label('Quản lý kho vật tư'),
      children: [
        { key: '/inventory/categories', label: 'Danh mục vật tư' },
        { key: '/inventory/items', label: 'Kho tổng vật tư' },
      ],
    },
    {
      key: 'accounts-mgmt',
      icon: <BorderOutlined />,
      label: label('Quản lý tài khoản'),
      children: [
        { key: '/admin/users', label: 'Danh sách tài khoản' },
        { key: '/admin/groups', label: 'Quản lý HTX' },
        { key: '/admin/vietgap-households', label: 'Hộ sản xuất VietGAP' },
        { key: '/admin/roles', label: 'Phân quyền & vai trò' },
      ],
    },
    {
      key: 'customer-mgmt',
      icon: <GlobalOutlined />,
      label: label('Quản lý khách hàng'),
      children: [
        { key: '/admin/customers', label: 'Danh sách khách hàng' },
        { key: '/admin/customer-rights', label: 'Quyền tài khoản thành viên' },
      ],
    },
    { key: '/admin/logs', icon: <SettingOutlined />, label: label('Nhật ký hệ thống') },
    {
      key: 'ai-tools',
      icon: <ThunderboltOutlined />,
      label: label('Công cụ AI'),
      children: [
        { key: '/admin/groq-test', label: 'Test Groq AI' },
        { key: '/admin/rag-test', label: 'Test RAG System' },
        { key: '/admin/chat-stats', label: 'Thống kê Chat AI' },
      ],
    },
    {
      key: 'system-config',
      icon: <SettingOutlined />,
      label: label('Cấu hình hệ thống'),
      children: [{ key: '/admin/backup', label: 'Sao lưu & phục hồi dữ liệu' }],
    },
  ];

  const farmerItems = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: label('Tổng quan') },
    { key: '/reports', icon: <BarChartOutlined />, label: label('Báo cáo & Thống kê') },
    {
      key: 'vietgap',
      icon: <Sprout className="w-5 h-5 text-green-600" />,
      label: label('Sản xuất VietGAP'),
      children: [
        { key: '/vietgap/trong-trot', label: 'VietGAP Trồng trọt' },
        { key: '/vietgap/chan-nuoi', label: 'VietGAHP Chăn nuôi' },
        { key: '/vietgap/thuy-san', label: 'VietGAP Thủy sản' },
      ],
    },
    {
      key: 'huuco',
      icon: <Leaf className="w-5 h-5 text-green-600" />,
      label: label('Nông nghiệp hữu cơ'),
      children: [
        { key: '/huuco/cay-trong', label: 'Cây trồng' },
        { key: '/huuco/chan-nuoi', label: 'Chăn nuôi' },
        { key: '/huuco/thuy-san', label: 'Thủy sản' },
      ],
    },
    {
      key: 'thongminh',
      icon: <RefreshCcw className="w-5 h-5 text-green-600" />,
      label: label('Nông nghiệp thông minh'),
      children: [
        { key: '/thongminh/rau-cu-qua', label: 'Rau củ quả' },
        { key: '/thongminh/lua', label: 'Lúa' },
        { key: '/thongminh/chan-nuoi', label: 'Chăn nuôi' },
      ],
    },
    { key: '/htx-assignments', icon: <FileDoneOutlined />, label: label('Yêu cầu từ HTX', badge('/htx-assignments')) },
    { key: '/htx-feedback', icon: <FileTextOutlined />, label: label('Báo cáo & đề xuất', badge('/htx-feedback')) },
    { key: '/inventory/farmer', icon: <InboxOutlined />, label: label('Tồn kho vật tư', badge('/inventory/farmer')) },
    { key: '/supplies/farmer', icon: <ShoppingOutlined />, label: label('Xin cấp vật tư', badge('/supplies/farmer')) },
    {
      key: 'docs-submenu',
      icon: <ReadOutlined />,
      label: label('Tiêu chuẩn & quy trình'),
      children: [
        { key: '/docs', label: 'Quy trình kỹ thuật' },
        { key: '/tcvn', label: 'Tra cứu TCVN' },
      ],
    },
  ];

  const traceabilityChildren = [
    { key: '/htx/gis-map', icon: <EnvironmentOutlined />, label: 'Bản đồ số GIS 100ha' },
    { key: '/htx/iot-dashboard', icon: <ThunderboltOutlined />, label: 'Giám sát thông minh IoT' },
    canViewTraceability(role) && { key: '/htx/products', icon: <BarcodeOutlined />, label: 'Danh mục sản phẩm' },
    canViewTraceability(role) && { key: '/htx/batches', icon: <BoxPlotOutlined />, label: 'Quản lý lô & TXNG' },
    canManageTraceability(role) && { key: '/htx/portal-settings', icon: <CloudSyncOutlined />, label: 'Cấu hình Cổng QG' },
  ].filter(Boolean);

  const directorAdminPaths = ['/htx/documents', '/htx/tasks', '/htx/finance', '/htx/partners', '/htx/training'];
  const farmerSubmissionPaths = ['/htx/farmer-reports', '/htx/farmer-suggestions', '/htx/farmer-equipment-requests', '/htx/farmer-duty-confirmations'];
  const technicalPaths = ['/htx/technical-guidance', '/htx/technical-training', '/htx/pest-control', '/htx/product-inspections', '/htx/nonconformities', '/htx/material-supervision', '/htx/approved-agri-inputs', '/htx/technical-proposals', '/htx/technical-reports', '/htx/farmer-reports', '/htx/farmer-suggestions', '/htx/farmer-duty-confirmations'];
  const distributionPaths = ['/htx/distribution-orders', '/htx/distribution-shipments', '/htx/market-development', '/htx/customer-feedback', '/htx/product-finalization', '/htx/distribution-finance'];
  const accountingPaths = ['/htx/accounting-transactions', '/htx/distribution-finance', '/htx/accounting-receivables', '/htx/accounting-payables', '/htx/accounting-reports', '/htx/tax-obligations', '/htx/financial-recommendations'];

  const htxItems = [
    isHtxDirector(role) && { key: '/htx/director', icon: <AuditOutlined />, label: label('Điều hành HTX') },
    isHtxTechnical(role) && { key: '/htx/technical', icon: <ExperimentOutlined />, label: label('Ban kỹ thuật') },
    isHtxDistribution(role) && { key: '/htx/distribution', icon: <ShoppingOutlined />, label: label('Ban phân phối') },
    isHtxAccountant(role) && { key: '/htx/accounting', icon: <WalletOutlined />, label: label('Kế toán') },
    (isHtxDirector(role) || canViewTraceability(role)) && { key: '/htx/planting-regions', icon: <EnvironmentOutlined />, label: label('Quản lý vùng trồng') },

    canViewHtxReports(role) && { key: '/reports', icon: <BarChartOutlined />, label: label('Báo cáo & Thống kê') },
    isHtxDirector(role) && {
      key: 'director-admin',
      icon: <FileDoneOutlined />,
      label: label('Quản trị điều hành', groupBadge(directorAdminPaths)),
      children: [
        { key: '/htx/documents', label: label('Văn bản & thủ tục', badge('/htx/documents')) },
        { key: '/htx/tasks', label: label('Phân công nhiệm vụ', badge('/htx/tasks')) },
        { key: '/htx/finance', label: label('Tài chính - thu chi', badge('/htx/finance')) },
        { key: '/htx/partners', label: label('Đối tác & hợp đồng', badge('/htx/partners')) },
        { key: '/htx/training', label: label('Đào tạo & tập huấn', badge('/htx/training')) },
      ],
    },
    isHtxDirector(role) && {
      key: 'farmer-submissions',
      icon: <FileTextOutlined />,
      label: label('Phản hồi nông dân', groupBadge(farmerSubmissionPaths)),
      children: [
        { key: '/htx/farmer-reports', label: label('Báo cáo sự cố', badge('/htx/farmer-reports')) },
        { key: '/htx/farmer-suggestions', label: label('Đề xuất chuyên môn', badge('/htx/farmer-suggestions')) },
        { key: '/htx/farmer-equipment-requests', label: label('Dụng cụ & bảo hộ', badge('/htx/farmer-equipment-requests')) },
        { key: '/htx/farmer-duty-confirmations', label: label('Xác nhận nhiệm vụ', badge('/htx/farmer-duty-confirmations')) },
      ],
    },
    canManageTechnicalOperations(role) && (isHtxDirector(role) || isHtxTechnical(role)) && {
      key: 'technical-admin',
      icon: <ExperimentOutlined />,
      label: label('Nghiệp vụ kỹ thuật', groupBadge(technicalPaths)),
      children: [
        { key: '/htx/technical-guidance', label: label('Hướng dẫn kỹ thuật', badge('/htx/technical-guidance')) },
        { key: '/htx/technical-training', label: label('Đào tạo xã viên', badge('/htx/technical-training')) },
        { key: '/htx/pest-control', label: label('Sâu bệnh & xử lý', badge('/htx/pest-control')) },
        { key: '/htx/product-inspections', label: label('Kiểm tra đầu ra', badge('/htx/product-inspections')) },
        { key: '/htx/nonconformities', label: label('Không phù hợp', badge('/htx/nonconformities')) },
        { key: '/htx/material-supervision', label: label('Giám sát vật tư', badge('/htx/material-supervision')) },
        { key: '/htx/approved-agri-inputs', label: label('Danh mục vật tư được phép', badge('/htx/approved-agri-inputs')) },
        { key: '/htx/technical-proposals', label: label('Đề xuất kỹ thuật', badge('/htx/technical-proposals')) },
        { key: '/htx/technical-reports', label: label('Báo cáo kỹ thuật', badge('/htx/technical-reports')) },
        isHtxTechnical(role) && canHandleFarmerSubmissions(role) && { key: '/htx/farmer-reports', label: label('Báo cáo nông dân', badge('/htx/farmer-reports')) },
        isHtxTechnical(role) && canHandleFarmerSubmissions(role) && { key: '/htx/farmer-suggestions', label: label('Đề xuất nông dân', badge('/htx/farmer-suggestions')) },
        isHtxTechnical(role) && canHandleFarmerSubmissions(role) && { key: '/htx/farmer-duty-confirmations', label: label('Xác nhận nhiệm vụ', badge('/htx/farmer-duty-confirmations')) },
      ].filter(Boolean),
    },
    canManageDistributionOperations(role) && (isHtxDirector(role) || isHtxDistribution(role)) && {
      key: 'distribution-admin',
      icon: <ShoppingOutlined />,
      label: label('Nghiệp vụ phân phối', groupBadge(distributionPaths)),
      children: [
        { key: '/htx/distribution-orders', label: label('Đơn đặt hàng', badge('/htx/distribution-orders')) },
        { key: '/htx/distribution-shipments', label: label('Vận chuyển', badge('/htx/distribution-shipments')) },
        { key: '/htx/market-development', label: label('Phát triển thị trường', badge('/htx/market-development')) },
        { key: '/htx/customer-feedback', label: label('Phản hồi khách hàng', badge('/htx/customer-feedback')) },
        { key: '/htx/product-finalization', label: label('Hoàn thiện sản phẩm', badge('/htx/product-finalization')) },
        { key: '/htx/distribution-finance', label: label('Đối soát tài chính', badge('/htx/distribution-finance')) },
      ],
    },
    canManageAccountingOperations(role) && (isHtxDirector(role) || isHtxAccountant(role)) && {
      key: 'accounting-admin',
      icon: <WalletOutlined />,
      label: label('Nghiệp vụ kế toán', groupBadge(accountingPaths)),
      children: [
        { key: '/htx/accounting-transactions', label: label('Giao dịch tài chính', badge('/htx/accounting-transactions')) },
        isHtxAccountant(role) && canManageDistributionFinance(role) && { key: '/htx/distribution-finance', label: label('Đối soát phân phối', badge('/htx/distribution-finance')) },
        { key: '/htx/accounting-receivables', label: label('Công nợ phải thu', badge('/htx/accounting-receivables')) },
        { key: '/htx/accounting-payables', label: label('Công nợ phải trả', badge('/htx/accounting-payables')) },
        { key: '/htx/accounting-reports', label: label('Sổ sách & báo cáo', badge('/htx/accounting-reports')) },
        { key: '/htx/tax-obligations', label: label('Thuế & chi phí', badge('/htx/tax-obligations')) },
        { key: '/htx/financial-recommendations', label: label('Khuyến nghị tài chính', badge('/htx/financial-recommendations')) },
      ].filter(Boolean),
    },
    canAccessHtxFarmerManagement(role) && canViewHtxMembers(role) && { key: '/htx/farmers', icon: <TeamOutlined />, label: label('Quản lý nông dân') },
    canViewHtxJournals(role) && (isHtxDirector(role) || isHtxTechnical(role) || isHtxSupervisor(role)) && { key: '/htx/journals', icon: <SettingOutlined />, label: label('Quản lý sổ HTX', badge('/htx/journals')) },
    canManageHtxJournals(role) && { key: '/htx/approvals', icon: <CheckCircleOutlined />, label: label('Phê duyệt nhật ký', badge('/htx/approvals')) },
    canManageSupplies(role) && { key: '/htx/supplies', icon: <ShoppingOutlined />, label: label('Phê duyệt vật tư', badge('/htx/supplies')) },
    traceabilityChildren.length > 0 && { key: 'traceability', icon: <GlobalOutlined />, label: label('Truy xuất nguồn gốc'), children: traceabilityChildren },
    canViewInventory(role) && (isHtxDirector(role) || isHtxTechnical(role) || isHtxDistribution(role) || isHtxSupervisor(role)) && { key: '/inventory', icon: <InboxOutlined />, label: label('Kho vật tư tập trung', badge('/inventory')) },
  ].filter(Boolean);

  const items = isAdmin(role) ? adminItems : isHtx(role) ? htxItems : farmerItems;

  const selectedKey = (() => {
    const flat = items.flatMap(item => item.children ? [item, ...item.children] : [item]);
    return flat.find(item => item.key && location.pathname.startsWith(item.key))?.key || location.pathname;
  })();

  const menuContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="h-24 flex items-center justify-center border-b border-gray-50 px-4 shrink-0">
        {collapsed && !isMobile ? (
          <img src={logoImg} alt="Logo" className="w-11 h-11 object-contain mix-blend-multiply" />
        ) : (
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="EBook Farm Logo" className="w-[65px] h-[65px] object-contain mix-blend-multiply" />
            <div className="flex flex-col text-center">
              <span className="text-green-600 font-bold text-[15px] leading-[1.2]">NHẬT KÝ SẢN XUẤT</span>
              <span className="text-green-600 font-bold text-[15px] leading-[1.2]">ĐIỆN TỬ</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={({ key }) => {
            if (String(key).startsWith('/')) navigate(key);
            setMobileMenuOpen(false);
          }}
          className="border-r-0 px-3 py-4"
        />
      </div>
      {(!collapsed || isMobile) && (
        <div className="p-5 border-t border-gray-50 shrink-0 bg-white">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <Text strong className="text-green-800 text-xs block mb-1">Hỗ trợ kỹ thuật?</Text>
            <Text className="text-green-600 text-[10px] block mb-3">Liên hệ hotline: 0981.439.283</Text>
            <Button type="primary" size="small" block className="rounded-lg text-[10px] h-8 font-bold">Gửi yêu cầu</Button>
          </div>
        </div>
      )}
    </div>
  );

  const dropdownItems = [
    {
      key: 'user-header',
      label: (
        <div className="p-2 min-w-[160px]">
          <Text strong className="block text-gray-800">{user?.fullname || user?.username || 'Thành viên'}</Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{roleLabel(role)}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    { key: 'account-info', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'change-password', icon: <LockOutlined />, label: 'Đổi mật khẩu' },
    { type: 'divider' },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Đăng xuất' },
  ];

  const handleDropdownClick = ({ key }) => {
    if (key === 'logout') return handleLogout();
    if (key === 'account-info') return navigate('/account-info');
    if (key === 'change-password') return navigate('/change-password');
    return null;
  };

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          width={280}
          collapsedWidth={80}
          className="shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-50 h-screen sticky top-0"
        >
          {menuContent}
        </Sider>
      )}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        width={280}
        closable={false}
      >
        {menuContent}
      </Drawer>

      <Layout className="min-w-0">
        <Header className={`bg-white/80 backdrop-blur-md p-0 flex justify-between items-center z-10 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-gray-50 ${isMobile ? 'px-4 h-16' : 'px-8 h-20'}`}>
          <Button
            type="text"
            icon={<MenuOutlined className="text-green-600 text-xl" />}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className="w-10 h-10 flex items-center justify-center hover:bg-green-50 rounded-xl"
          />
          <div className="flex items-center gap-2 md:gap-6">
            <Space size={isMobile ? 8 : 16} className="mr-0 md:mr-4">
              <NotificationBell />
              {!isMobile && <Button type="text" icon={<SettingOutlined className="text-gray-400 text-lg" />} className="w-10 h-10 rounded-xl hover:bg-gray-50" />}
            </Space>
            {!isMobile && <div className="h-10 w-px bg-gray-100" />}
            <Dropdown menu={{ items: dropdownItems, onClick: handleDropdownClick }} placement="bottomRight" trigger={['click']}>
              <button type="button" className="flex items-center gap-2 md:gap-3 cursor-pointer bg-transparent border-0 hover:bg-green-50/50 p-1.5 md:pr-3 rounded-2xl">
                <Avatar
                  size={isMobile ? 32 : 44}
                  src={getAvatarUrl(user?.avatar)}
                  className="bg-green-50 text-green-600 border-2 border-green-200 font-bold"
                >
                  {!user?.avatar && getInitialAvatar(user?.fullname || user?.username || 'U')}
                </Avatar>
                {!isMobile && (
                  <div className="text-left flex flex-col justify-center">
                    <Text className="font-bold text-gray-800 block text-sm leading-tight">{user?.fullname || user?.username || 'Thành viên'}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{roleLabel(role)}</Text>
                  </div>
                )}
              </button>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-4 md:p-8 min-h-[calc(100vh-80px)] overflow-x-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

