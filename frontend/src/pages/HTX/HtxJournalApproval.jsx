import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Typography, Avatar, Input, Tooltip, Badge, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SearchOutlined, 
  UserOutlined, 
  EyeOutlined,
  FileTextOutlined,
  CheckOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import dayjs from 'dayjs';
import JournalEntry from '../Journal/JournalEntry';

const { Title, Text } = Typography;

const HtxJournalApproval = () => {
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx/journals');
      if (res.data.success) {
        // Gom tất cả nông dân đang chờ duyệt từ mọi sổ
        const allPending = [];
        res.data.data.forEach(journal => {
          journal.farmers.forEach(f => {
            if (f.status === 'Chờ duyệt') {
              allPending.push({
                ...f,
                journalId: journal._id,
                journalName: journal.name,
                schemaId: journal.schemaId
              });
            }
          });
        });
        
        // Sắp xếp theo thời gian nộp (giả định dùng updatedAt của farmer entry nếu có, hoặc tạo một field mới)
        // Hiện tại sắp xếp theo tên nông dân
        setPendingFarmers(allPending);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (journalId, farmerId, status, feedback) => {
    try {
      setLoading(true);
      const res = await api.put(`/htx/journals/${journalId}/farmers/${farmerId}/status`, {
        status,
        feedback
      });
      if (res.data.success) {
        message.success(status === 'Đã duyệt' ? 'Đã phê duyệt nhật ký' : 'Đã gửi yêu cầu chỉnh sửa');
        setIsFeedbackModalVisible(false);
        setFeedbackText('');
        fetchPendingApprovals();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (text, record, index) => <span className="text-gray-400 font-mono">{index + 1}</span>
    },
    {
      title: 'NÔNG DÂN',
      key: 'farmer',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={getAvatarUrl(record.farmerId?.avatar)} icon={<UserOutlined />}>
            {!record.farmerId?.avatar && getInitialAvatar(record.farmerId?.fullname || record.farmerId?.username)}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{record.farmerId?.fullname || record.farmerId?.username}</Text>
            <Text type="secondary" className="text-[11px] uppercase tracking-tighter">{record.farmerId?.phone || 'Chưa cập nhật SĐT'}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'SỔ NHẬT KÝ GỐC',
      key: 'journal',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text className="text-green-700 font-medium">{record.journalName}</Text>
          <Tag color="blue" className="w-fit text-[10px] m-0 mt-1 uppercase">{record.schemaId?.name}</Tag>
        </div>
      )
    },
    {
      title: 'THỜI GIAN NỘP',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => <Text className="text-gray-500 text-xs">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'center',
      render: () => <Tag color="orange" className="rounded-full px-3 font-bold animate-pulse">CHỜ DUYỆT</Tag>
    },
    {
      title: 'THAO TÁC PHÊ DUYỆT',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem nội dung nhật ký">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                setPreviewData(record);
                setIsPreviewVisible(true);
              }}
              className="rounded-lg border-gray-200"
            />
          </Tooltip>
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleUpdateStatus(record.journalId, record.farmerId?._id, 'Đã duyệt')}
            className="bg-green-600 hover:bg-green-700 rounded-lg border-0 shadow-md shadow-green-100 font-bold"
          >
            Duyệt
          </Button>
          <Button 
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setIsFeedbackModalVisible(true);
            }}
            className="rounded-lg font-bold"
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  const filteredData = pendingFarmers.filter(item => {
    const name = item.farmerId?.fullname || item.farmerId?.username || '';
    const journal = item.journalName || '';
    const phone = item.farmerId?.phone || '';
    return (
      name.toLowerCase().includes(searchText.toLowerCase()) || 
      journal.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.includes(searchText)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <Title level={2} className="!mb-0 tracking-tight">Phê Duyệt Nhật Ký</Title>
          <Text className="text-gray-400 font-medium">Danh sách các nông hộ đã hoàn tất ghi chép và đang đợi HTX thẩm định</Text>
        </div>
        <div className="flex items-center gap-4">
           <Badge count={pendingFarmers.length} overflowCount={99} style={{ backgroundColor: '#f59e0b' }}>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <HistoryOutlined className="text-xl" />
              </div>
           </Badge>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <Input 
            placeholder="Tìm theo tên nông dân hoặc tên sổ..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={e => setSearchText(e.target.value)}
            className="w-80 h-10 rounded-xl"
            allowClear
          />
          <Text className="text-xs text-gray-400 italic">Có <Text strong className="text-orange-500">{filteredData.length}</Text> yêu cầu đang chờ xử lý</Text>
        </div>
        
        <Table 
          columns={columns}
          dataSource={filteredData}
          rowKey={record => `${record.journalId}-${record.farmerId?._id}`}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' }
          }}
          className="premium-table-refined"
          locale={{
            emptyText: <div className="py-12"><CheckCircleOutlined className="text-5xl text-green-100 mb-4" /><p className="text-gray-400">Tuyệt vời! Hiện không còn nhật ký nào đang chờ duyệt.</p></div>
          }}
        />
      </Card>

      {/* Preview Drawer / Modal */}
      <Modal
        title={<div className="flex items-center gap-2"><FileTextOutlined className="text-green-600" /><Text strong className="text-lg">Nội Dung Nhật Ký Chi Tiết</Text></div>}
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        width={1000}
        centered
        className="rounded-3xl overflow-hidden"
      >
        {previewData && (
          <div className="py-4">
             <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar size="large" src={getAvatarUrl(previewData.farmerId?.avatar)} />
                    <div>
                        <Text strong className="text-base block">{previewData.farmerId?.fullname || previewData.farmerId?.username}</Text>
                        <Text type="secondary" className="text-xs italic">Nộp từ sổ: {previewData.journalName}</Text>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button type="primary" onClick={() => { setIsPreviewVisible(false); handleUpdateStatus(previewData.journalId, previewData.farmerId?._id, 'Đã duyệt'); }} className="bg-green-600 border-0 rounded-lg font-bold">Duyệt Luôn</Button>
                    <Button danger onClick={() => { setIsPreviewVisible(false); setSelectedItem(previewData); setIsFeedbackModalVisible(true); }} className="rounded-lg font-bold">Từ Chối</Button>
                </div>
             </div>
             <JournalEntry 
                id={previewData.farmJournalId?._id || previewData.farmJournalId} 
                viewOnly={true} 
             />
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title="Yêu cầu chỉnh sửa"
        open={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        onOk={() => handleUpdateStatus(selectedItem.journalId, selectedItem.farmerId?._id, 'Cần chỉnh sửa', feedbackText)}
        confirmLoading={loading}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        okButtonProps={{ danger: true, disabled: !feedbackText.trim() }}
      >
        <div className="py-2">
          <Text className="text-gray-500 block mb-3">Vui lòng nhập lý do từ chối hoặc các nội dung nông dân cần chỉnh sửa thêm:</Text>
          <Input.TextArea 
            rows={4} 
            placeholder="Vd: Thiếu thông tin ngày bón phân, ảnh minh họa chưa rõ..."
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </Modal>
    </div>
  );
};

export default HtxJournalApproval;
