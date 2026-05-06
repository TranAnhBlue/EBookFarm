import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin, message } from 'antd';
import { BellOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const NotificationBell = () => {
    const queryClient = useQueryClient();
    const [visible, setVisible] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotifications().then(res => res.data),
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            message.success('Đã đánh dấu tất cả là đã đọc');
        }
    });

    const handleMarkRead = (id) => {
        markReadMutation.mutate(id);
    };

    const notificationContent = (
        <div className="w-80 md:w-96 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                <Text strong className="text-lg">Thông báo</Text>
                {data?.unreadCount > 0 && (
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => markAllReadMutation.mutate()}
                        loading={markAllReadMutation.isLoading}
                    >
                        Đọc tất cả
                    </Button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-sidebar-scroll">
                {isLoading ? (
                    <div className="p-10 text-center">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </div>
                ) : data?.data?.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={data.data}
                        renderItem={(item) => (
                            <List.Item 
                                className={`px-4 cursor-pointer hover:bg-gray-50 transition-colors ${!item.isRead ? 'bg-blue-50/50' : ''}`}
                                onClick={() => !item.isRead && handleMarkRead(item._id)}
                                actions={[
                                    !item.isRead && (
                                        <Button 
                                            type="text" 
                                            icon={<CheckOutlined className="text-gray-400" />} 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkRead(item._id);
                                            }}
                                        />
                                    )
                                ].filter(Boolean)}
                            >
                                <List.Item.Meta
                                    title={
                                        <div className="flex justify-between items-start">
                                            <Text strong className={!item.isRead ? 'text-blue-600' : 'text-gray-700'}>
                                                {item.title}
                                            </Text>
                                            <Text type="secondary" className="text-[10px] whitespace-nowrap ml-2">
                                                {dayjs(item.createdAt).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <div className="mt-1">
                                            <Text className="text-xs text-gray-600 leading-tight block">
                                                {item.message}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        description="Không có thông báo nào" 
                        className="py-10"
                    />
                )}
            </div>
            
            <div className="p-2 border-t text-center bg-gray-50">
                <Button type="text" block size="small" className="text-gray-400">
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
                    count={data?.unreadCount || 0} 
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
