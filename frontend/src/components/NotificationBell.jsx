import React, { useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin, message, Tag } from 'antd';
import { BellOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const HTX_ROLES = ['HTX', 'HTX_DIRECTOR', 'HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'];

const normalizeRole = (role) => String(role || '').trim().toUpperCase();
const isHtxRole = (role) => HTX_ROLES.includes(normalizeRole(role));
const isAdminRole = (role) => normalizeRole(role) === 'ADMIN';
const isFarmerRole = (role) => normalizeRole(role) === 'FARMER' || normalizeRole(role) === 'USER';

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

const getNotificationRoute = (item, user) => {
  const role = user?.role;
  const model = item.relatedModel;

  if (item.type === 'Journal_Assigned') return isFarmerRole(role) ? '/htx-assignments' : '/htx/journals';
  if (item.type === 'Journal_Submitted') return isHtxRole(role) ? '/htx/approvals' : '/admin/journals';
  if (item.type === 'Journal_Verified' || item.type === 'Journal_Revision_Requested' || item.type === 'Journal_Locked') {
    return model === 'FarmJournal' && item.relatedId ? `/journals/view/${item.relatedId}` : '/htx-assignments';
  }
  if (item.type === 'Brand_Authorized') return isFarmerRole(role) ? '/htx-assignments' : '/htx/journals';
  if (item.type === 'Farmer_Removed_From_HTX') return '/account-info';
  if (item.type === 'Supply_Request_Submitted' || item.type === 'Supply_Request_Processed') {
    return isHtxRole(role) || isAdminRole(role) ? '/htx/supplies' : '/supplies/farmer';
  }
  if (item.type === 'Inventory_Distributed' || item.type === 'Inventory_LowStock') {
    return isFarmerRole(role) ? '/inventory/farmer' : '/inventory';
  }
  if (item.type === 'Distribution_Finance_Submitted') return '/htx/distribution-finance';
  if (item.type === 'Distribution_Finance_Processed') {
    return isFarmerRole(role) ? '/htx-assignments' : '/htx/distribution-finance';
  }
  if (item.type === 'Accounting_Record_Created') return moduleRouteMap[item.categoryLabel] || '/htx/accounting-transactions';
  if (item.type === 'HTX_Management_Assigned' || item.type === 'HTX_Management_Updated') {
    return isFarmerRole(role) ? '/htx-assignments' : (moduleRouteMap[item.categoryLabel] || '/htx/director');
  }
  if (item.type === 'HTX_Internal_Task') return moduleRouteMap[item.categoryLabel] || '/htx/director';
  if (item.type === 'Farmer_Feedback_Submitted') return moduleRouteMap[item.categoryLabel] || '/htx/farmer-reports';

  switch (model) {
    case 'HtxJournal':
      return '/htx/journals';
    case 'FarmJournal':
      return item.relatedId ? `/journals/view/${item.relatedId}` : '/htx/approvals';
    case 'HtxManagementRecord':
      return isFarmerRole(role) ? '/htx-assignments' : (moduleRouteMap[item.categoryLabel] || '/htx/director');
    case 'InventoryItem':
      return isFarmerRole(role) ? '/inventory/farmer' : '/inventory';
    case 'SupplyRequest':
      return isHtxRole(role) || isAdminRole(role) ? '/htx/supplies' : '/supplies/farmer';
    case 'Consultation':
      return '/admin/consultations';
    case 'User':
      return item.categoryLabel === 'certification' ? '/account-info' : '/admin/users';
    case 'News':
      return item.relatedId ? `/news/${item.relatedId}` : '/news';
    case 'ProductionBatch':
      return isHtxRole(role) ? '/htx/batches' : '/dashboard';
    default:
      return isHtxRole(role) ? '/htx/director' : '/dashboard';
  }
};

const getTypeTag = (type) => {
  switch (type) {
    case 'Journal_Submitted': return <Tag color="blue" className="mr-0">Gửi duyệt</Tag>;
    case 'Journal_Verified': return <Tag color="green" className="mr-0">Đã duyệt</Tag>;
    case 'Journal_Revision_Requested': return <Tag color="orange" className="mr-0">Cần sửa</Tag>;
    case 'Journal_Assigned': return <Tag color="purple" className="mr-0">Phân công</Tag>;
    case 'Supply_Request_Submitted': return <Tag color="gold" className="mr-0">Vật tư</Tag>;
    case 'Supply_Request_Processed': return <Tag color="gold" className="mr-0">Vật tư</Tag>;
    case 'Distribution_Finance_Submitted': return <Tag color="volcano" className="mr-0">Đối soát</Tag>;
    case 'Distribution_Finance_Processed': return <Tag color="volcano" className="mr-0">Đối soát</Tag>;
    case 'Accounting_Record_Created': return <Tag color="cyan" className="mr-0">Kế toán</Tag>;
    case 'HTX_Management_Assigned': return <Tag color="geekblue" className="mr-0">HTX giao</Tag>;
    case 'HTX_Management_Updated': return <Tag color="geekblue" className="mr-0">HTX cập nhật</Tag>;
    case 'HTX_Internal_Task': return <Tag color="purple" className="mr-0">Nội bộ</Tag>;
    case 'Farmer_Feedback_Submitted': return <Tag color="orange" className="mr-0">Phản hồi</Tag>;
    case 'Brand_Authorized': return <Tag color="green" className="mr-0">Thương hiệu</Tag>;
    case 'System': return <Tag color="cyan" className="mr-0">Hệ thống</Tag>;
    case 'Announcement': return <Tag color="magenta" className="mr-0">Tin tức</Tag>;
    case 'Inventory_LowStock': return <Tag color="red" className="mr-0 border-red-200 bg-red-50 text-red-600 font-bold">Kho</Tag>;
    default: return null;
  }
};

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(res => res.data),
    refetchInterval: 10000,
  });

  const { data: inventory } = useQuery({
    queryKey: ['farmer-inventory-alert'],
    queryFn: () => api.get('/inventory').then(res => res.data.data),
    enabled: !!user && isFarmerRole(user.role),
    refetchInterval: 30000,
  });

  const lowStockItems = (inventory || []).filter(item => item.quantity <= (item.minQuantity || 10));
  const combinedNotifications = [...(data?.data || [])];

  lowStockItems.forEach(item => {
    const isOutOfStock = item.quantity === 0;
    combinedNotifications.unshift({
      _id: `inv-${item._id}`,
      type: 'Inventory_LowStock',
      title: isOutOfStock ? 'Hết hàng' : 'Cảnh báo sắp hết hàng',
      message: `Vật tư "${item.name}" ${isOutOfStock ? 'đã hết sạch' : `chỉ còn ${item.quantity} ${item.unit}`}. Vui lòng nhập thêm.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedModel: 'InventoryItem',
    });
  });

  const totalUnreadCount = (data?.unreadCount || 0) + lowStockItems.length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      message.success('Đã đánh dấu tất cả là đã đọc');
    },
  });

  const handleNotificationClick = (item) => {
    if (!item.isRead && !String(item._id).startsWith('inv-')) {
      markReadMutation.mutate(item._id);
    }

    setVisible(false);
    navigate(getNotificationRoute(item, user));
  };

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    if (!String(id).startsWith('inv-')) {
      markReadMutation.mutate(id);
    }
  };

  const notificationContent = (
    <div className="w-80 md:w-[400px] max-h-[500px] overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <Text strong className="text-base">Thông báo</Text>
          {totalUnreadCount > 0 && <Badge count={totalUnreadCount} className="notification-badge-small" />}
        </div>
        {data?.unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            className="text-green-600 p-0 h-auto"
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-sidebar-scroll bg-[#f8fafc]">
        {isLoading ? (
          <div className="p-12 text-center">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        ) : combinedNotifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={combinedNotifications}
            renderItem={(item) => (
              <List.Item
                className={`px-4 py-3 cursor-pointer hover:bg-white transition-all border-b border-gray-50 last:border-0 ${!item.isRead ? 'bg-green-50/30' : 'bg-white/50'}`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeTag(item.type)}
                      {item.categoryLabel && (
                        <Tag color="default" className="mr-0 opacity-70 bg-gray-100 border-gray-200 text-gray-600">
                          {item.categoryLabel}
                        </Tag>
                      )}
                      <Text strong className={`text-[13px] ${!item.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.title}
                      </Text>
                    </div>
                    <Text type="secondary" className="text-[10px] whitespace-nowrap ml-2 opacity-60">
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </div>
                  <div className="flex justify-between items-end gap-3">
                    <Text className={`text-xs block leading-snug flex-1 ${!item.isRead ? 'text-gray-700' : 'text-gray-400'}`}>
                      {item.message}
                    </Text>
                    {!item.isRead && !String(item._id).startsWith('inv-') && (
                      <Button
                        type="text"
                        icon={<CheckOutlined className="text-green-500" />}
                        size="small"
                        className="h-6 w-6 flex items-center justify-center p-0 hover:bg-green-100"
                        onClick={(e) => handleMarkRead(item._id, e)}
                      />
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-400 text-xs">Không có thông báo mới</span>}
            className="py-12"
          />
        )}
      </div>

      <div className="p-2 border-t text-center bg-white">
        <Button type="text" block size="small" className="text-gray-400 text-xs font-medium hover:text-green-600">
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      overlayClassName="notification-popover"
      contentStyle={{ padding: 0 }}
    >
      <div className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded-xl transition-all relative">
        <Badge
          count={totalUnreadCount}
          size="small"
          offset={[-2, 2]}
          styles={{ badge: { fontSize: '10px', height: '16px', minWidth: '16px', lineHeight: '16px' } }}
        >
          <BellOutlined className="text-gray-400 text-lg" />
        </Badge>
      </div>
    </Popover>
  );
};

export default NotificationBell;
