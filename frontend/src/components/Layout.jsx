import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer, Grid } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BarcodeOutlined,
  BorderOutlined,
  BoxPlotOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
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

const label = (text) => <span className="font-medium">{text}</span>;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const role = normalizeRole(user?.role);

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
    { key: '/htx-assignments', icon: <FileDoneOutlined />, label: label('Yêu cầu từ HTX') },
    { key: '/htx-feedback', icon: <FileTextOutlined />, label: label('Báo cáo & đề xuất') },
    { key: '/inventory/farmer', icon: <InboxOutlined />, label: label('Tồn kho vật tư') },
    { key: '/supplies/farmer', icon: <ShoppingOutlined />, label: label('Xin cấp vật tư') },
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
    canViewTraceability(role) && { key: '/htx/products', icon: <BarcodeOutlined />, label: 'Danh mục sản phẩm' },
    canViewTraceability(role) && { key: '/htx/batches', icon: <BoxPlotOutlined />, label: 'Quản lý lô & TXNG' },
    canManageTraceability(role) && { key: '/htx/portal-settings', icon: <CloudSyncOutlined />, label: 'Cấu hình Cổng QG' },
  ].filter(Boolean);

  const htxItems = [
    isHtxDirector(role) && { key: '/htx/director', icon: <AuditOutlined />, label: label('Điều hành HTX') },
    isHtxTechnical(role) && { key: '/htx/technical', icon: <ExperimentOutlined />, label: label('Ban kỹ thuật') },
    isHtxDistribution(role) && { key: '/htx/distribution', icon: <ShoppingOutlined />, label: label('Ban phân phối') },
    isHtxAccountant(role) && { key: '/htx/accounting', icon: <WalletOutlined />, label: label('Kế toán') },
    canViewHtxReports(role) && { key: '/reports', icon: <BarChartOutlined />, label: label('Báo cáo & Thống kê') },
    isHtxDirector(role) && {
      key: 'director-admin',
      icon: <FileDoneOutlined />,
      label: label('Quản trị điều hành'),
      children: [
        { key: '/htx/documents', label: 'Văn bản & thủ tục' },
        { key: '/htx/tasks', label: 'Phân công nhiệm vụ' },
        { key: '/htx/finance', label: 'Tài chính - thu chi' },
        { key: '/htx/partners', label: 'Đối tác & hợp đồng' },
        { key: '/htx/training', label: 'Đào tạo & tập huấn' },
      ],
    },
    isHtxDirector(role) && {
      key: 'farmer-submissions',
      icon: <FileTextOutlined />,
      label: label('Phản hồi nông dân'),
      children: [
        { key: '/htx/farmer-reports', label: 'Báo cáo sự cố' },
        { key: '/htx/farmer-suggestions', label: 'Đề xuất chuyên môn' },
        { key: '/htx/farmer-equipment-requests', label: 'Dụng cụ & bảo hộ' },
        { key: '/htx/farmer-duty-confirmations', label: 'Xác nhận nhiệm vụ' },
      ],
    },
    canManageTechnicalOperations(role) && (isHtxDirector(role) || isHtxTechnical(role)) && {
      key: 'technical-admin',
      icon: <ExperimentOutlined />,
      label: label('Nghiệp vụ kỹ thuật'),
      children: [
        { key: '/htx/technical-guidance', label: 'Hướng dẫn kỹ thuật' },
        { key: '/htx/technical-training', label: 'Đào tạo xã viên' },
        { key: '/htx/pest-control', label: 'Sâu bệnh & xử lý' },
        { key: '/htx/product-inspections', label: 'Kiểm tra đầu ra' },
        { key: '/htx/nonconformities', label: 'Không phù hợp' },
        { key: '/htx/material-supervision', label: 'Giám sát vật tư' },
        { key: '/htx/technical-proposals', label: 'Đề xuất kỹ thuật' },
        { key: '/htx/technical-reports', label: 'Báo cáo kỹ thuật' },
        isHtxTechnical(role) && canHandleFarmerSubmissions(role) && { key: '/htx/farmer-reports', label: 'Báo cáo nông dân' },
        isHtxTechnical(role) && canHandleFarmerSubmissions(role) && { key: '/htx/farmer-suggestions', label: 'Đề xuất nông dân' },
        isHtxTechnical(role) && canHandleFarmerSubmissions(role) && { key: '/htx/farmer-duty-confirmations', label: 'Xác nhận nhiệm vụ' },
      ].filter(Boolean),
    },
    canManageDistributionOperations(role) && (isHtxDirector(role) || isHtxDistribution(role)) && {
      key: 'distribution-admin',
      icon: <ShoppingOutlined />,
      label: label('Nghiệp vụ phân phối'),
      children: [
        { key: '/htx/distribution-orders', label: 'Đơn đặt hàng' },
        { key: '/htx/distribution-shipments', label: 'Vận chuyển' },
        { key: '/htx/market-development', label: 'Phát triển thị trường' },
        { key: '/htx/customer-feedback', label: 'Phản hồi khách hàng' },
        { key: '/htx/product-finalization', label: 'Hoàn thiện sản phẩm' },
        { key: '/htx/distribution-finance', label: 'Đối soát tài chính' },
      ],
    },
    canManageAccountingOperations(role) && (isHtxDirector(role) || isHtxAccountant(role)) && {
      key: 'accounting-admin',
      icon: <WalletOutlined />,
      label: label('Nghiệp vụ kế toán'),
      children: [
        { key: '/htx/accounting-transactions', label: 'Giao dịch tài chính' },
        isHtxAccountant(role) && canManageDistributionFinance(role) && { key: '/htx/distribution-finance', label: 'Đối soát phân phối' },
        { key: '/htx/accounting-receivables', label: 'Công nợ phải thu' },
        { key: '/htx/accounting-payables', label: 'Công nợ phải trả' },
        { key: '/htx/accounting-reports', label: 'Sổ sách & báo cáo' },
        { key: '/htx/tax-obligations', label: 'Thuế & chi phí' },
        { key: '/htx/financial-recommendations', label: 'Khuyến nghị tài chính' },
      ].filter(Boolean),
    },
    canAccessHtxFarmerManagement(role) && canViewHtxMembers(role) && { key: '/htx/farmers', icon: <TeamOutlined />, label: label('Quản lý nông dân') },
    canViewHtxJournals(role) && (isHtxDirector(role) || isHtxTechnical(role) || isHtxSupervisor(role)) && { key: '/htx/journals', icon: <SettingOutlined />, label: label('Quản lý sổ HTX') },
    canManageHtxJournals(role) && { key: '/htx/approvals', icon: <CheckCircleOutlined />, label: label('Phê duyệt nhật ký') },
    canManageSupplies(role) && { key: '/htx/supplies', icon: <ShoppingOutlined />, label: label('Phê duyệt vật tư') },
    traceabilityChildren.length > 0 && { key: 'traceability', icon: <GlobalOutlined />, label: label('Truy xuất nguồn gốc'), children: traceabilityChildren },
    canViewInventory(role) && (isHtxDirector(role) || isHtxTechnical(role) || isHtxDistribution(role) || isHtxSupervisor(role)) && { key: '/inventory', icon: <InboxOutlined />, label: label('Kho vật tư tập trung') },
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

