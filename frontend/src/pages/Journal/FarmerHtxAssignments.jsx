import React from 'react';
import { Button, Card, Empty, List, Space, Tag, Typography, Skeleton } from 'antd';
import {
  AuditOutlined,
  FileDoneOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';
import { formatCurrencyVND } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const moduleLabels = {
  documents: { label: 'Văn bản/thủ tục', color: 'blue', icon: <FileDoneOutlined /> },
  tasks: { label: 'Nhiệm vụ HTX', color: 'purple', icon: <TeamOutlined /> },
  finance: { label: 'Tài chính - thu chi', color: 'gold', icon: <WalletOutlined /> },
  partners: { label: 'Đối tác/hợp đồng', color: 'cyan', icon: <AuditOutlined /> },
  training: { label: 'Đào tạo/tập huấn', color: 'green', icon: <ReadOutlined /> },
  'technical-guidance': { label: 'Hướng dẫn kỹ thuật', color: 'green', icon: <ReadOutlined /> },
  'technical-training': { label: 'Đào tạo kỹ thuật', color: 'green', icon: <ReadOutlined /> },
  'pest-control': { label: 'Sâu bệnh/xử lý', color: 'orange', icon: <SafetyCertificateOutlined /> },
  'product-inspections': { label: 'Kiểm tra đầu ra', color: 'blue', icon: <SafetyCertificateOutlined /> },
  nonconformities: { label: 'Không phù hợp', color: 'red', icon: <AuditOutlined /> },
  'material-supervision': { label: 'Giám sát vật tư', color: 'gold', icon: <FileDoneOutlined /> },
  'technical-proposals': { label: 'Đề xuất kỹ thuật', color: 'purple', icon: <AuditOutlined /> },
  'technical-reports': { label: 'Báo cáo kỹ thuật', color: 'cyan', icon: <FileDoneOutlined /> },
  'distribution-orders': { label: 'Đơn hàng phân phối', color: 'blue', icon: <FileDoneOutlined /> },
  'distribution-shipments': { label: 'Vận chuyển/giao hàng', color: 'geekblue', icon: <AuditOutlined /> },
  'market-development': { label: 'Phát triển thị trường', color: 'cyan', icon: <ReadOutlined /> },
  'customer-feedback': { label: 'Phản hồi khách hàng', color: 'orange', icon: <AuditOutlined /> },
  'product-finalization': { label: 'Hoàn thiện sản phẩm', color: 'green', icon: <FileDoneOutlined /> },
  'distribution-finance-requests': { label: 'Đối soát phân phối', color: 'gold', icon: <WalletOutlined /> },
  'accounting-transactions': { label: 'Giao dịch tài chính', color: 'gold', icon: <WalletOutlined /> },
  'accounting-receivables': { label: 'Công nợ phải thu', color: 'orange', icon: <WalletOutlined /> },
  'accounting-payables': { label: 'Công nợ phải trả', color: 'red', icon: <WalletOutlined /> },
  'farmer-reports': { label: 'Báo cáo sự cố', color: 'orange', icon: <SafetyCertificateOutlined /> },
  'farmer-suggestions': { label: 'Đề xuất chuyên môn', color: 'purple', icon: <AuditOutlined /> },
  'farmer-equipment-requests': { label: 'Dụng cụ & bảo hộ', color: 'blue', icon: <FileDoneOutlined /> },
  'farmer-duty-confirmations': { label: 'Xác nhận nhiệm vụ', color: 'green', icon: <FileDoneOutlined /> },
};

const statusLabel = {
  Draft: 'Dự thảo',
  Pending: 'Chờ xử lý',
  InProgress: 'Đang xử lý',
  Review: 'Cần theo dõi',
  Approved: 'Đã duyệt/đạt',
  Completed: 'Hoàn thành',
  Rejected: 'Không đạt/từ chối',
  Published: 'Đã ban hành',
  Planned: 'Đã lên kế hoạch',
  Paid: 'Đã thanh toán',
  Archived: 'Lưu trữ',
};

const journalStatusLabel = {
  'Chưa nhập': { label: 'Chưa nhập', color: 'default' },
  'Đang nhập': { label: 'Đang nhập', color: 'processing' },
  'Chờ duyệt': { label: 'Chờ HTX duyệt', color: 'warning' },
  'Đã duyệt': { label: 'Đã được HTX duyệt', color: 'success' },
  'Cần chỉnh sửa': { label: 'Cần chỉnh sửa', color: 'orange' },
  'Không đạt': { label: 'Không đạt', color: 'error' },
};

const FarmerHtxAssignments = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['farmer-htx-assignments'],
    queryFn: () => api.get('/htx/management/farmer/assignments').then(res => res.data.data),
  });

  const { data: htxJournals, isLoading: isJournalLoading } = useQuery({
    queryKey: ['farmer-my-htx-journals'],
    queryFn: () => api.get('/htx/journals/my-journals').then(res => res.data.data),
  });

  const records = data || [];
  const journals = htxJournals || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Nội dung từ HTX</Text>
        <Title level={2} className="!mb-1 flex items-center gap-3">
          <FileDoneOutlined className="text-green-600" /> Yêu cầu & hướng dẫn từ HTX
        </Title>
        <Text className="text-gray-500">Các sổ nhật ký, nhiệm vụ, cảnh báo kỹ thuật, tập huấn, công nợ hoặc yêu cầu xử lý mà HTX gắn trực tiếp với bạn.</Text>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <div className="mb-4">
          <Text strong className="block text-gray-900">Sổ nhật ký HTX giao cho tôi</Text>
          <Text className="text-gray-500 text-sm">Mở sổ, ghi chép và bấm Gửi duyệt để chuyển sang Ban kỹ thuật/Giám đốc HTX thẩm định.</Text>
        </div>
        {isJournalLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : journals.length ? (
          <List
            itemLayout="vertical"
            dataSource={journals}
            className="mb-6"
            renderItem={(journal) => {
              const statusInfo = journalStatusLabel[journal.myStatus] || { label: journal.myStatus || 'Chưa nhập', color: 'default' };
              const canOpen = journal.myFarmJournalId && !['Chờ duyệt', 'Đã duyệt'].includes(journal.myStatus);
              return (
                <List.Item className="!px-0 border-b border-gray-100 last:border-b-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <Space wrap className="mb-2">
                        <Tag color="green" icon={<ReadOutlined />} className="rounded-full px-3">Sổ HTX</Tag>
                        <Tag color={statusInfo.color} className="rounded-full px-3">{statusInfo.label}</Tag>
                        {journal.schemaId?.name && <Tag className="rounded-full px-3">{journal.schemaId.name}</Tag>}
                      </Space>
                      <Text strong className="block text-gray-900 text-base">{journal.name}</Text>
                      <Paragraph className="!mb-0 mt-1 text-sm text-gray-500">{journal.description || 'Sổ nhật ký sản xuất do HTX phân công.'}</Paragraph>
                      {journal.myFeedback && <Text className="block mt-2 text-orange-600 text-sm">Phản hồi HTX: {journal.myFeedback}</Text>}
                    </div>
                    <Button
                      type={canOpen ? 'primary' : 'default'}
                      disabled={!journal.myFarmJournalId}
                      onClick={() => navigate(`/journals/view/${journal.myFarmJournalId}`)}
                      className="rounded-xl"
                    >
                      {canOpen ? 'Mở và gửi duyệt' : 'Xem nhật ký'}
                    </Button>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty className="mb-6" description="Chưa có sổ nhật ký HTX nào được phân công" />
        )}

        <div className="mb-4 pt-4 border-t border-gray-100">
          <Text strong className="block text-gray-900">Yêu cầu nghiệp vụ khác từ HTX</Text>
        </div>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : records.length ? (
          <List
            itemLayout="vertical"
            dataSource={records}
            renderItem={(record) => {
              const moduleInfo = moduleLabels[record.module] || { label: record.module, color: 'default', icon: <FileDoneOutlined /> };
              return (
                <List.Item className="!px-0 border-b border-gray-100 last:border-b-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <Space wrap className="mb-2">
                        <Tag color={moduleInfo.color} icon={moduleInfo.icon} className="rounded-full px-3">{moduleInfo.label}</Tag>
                        <Tag className="rounded-full px-3">{statusLabel[record.status] || record.status}</Tag>
                        {record.priority && <Tag color={record.priority === 'Urgent' ? 'red' : 'default'} className="rounded-full px-3">{record.priority}</Tag>}
                      </Space>
                      <Text strong className="block text-gray-900 text-base">{record.title}</Text>
                      <Paragraph className="!mb-0 mt-1 text-sm text-gray-500">{record.description || 'Không có ghi chú chi tiết.'}</Paragraph>
                      {!!record.amount && <Text className="block mt-2 text-sm text-gray-700">Số tiền: {formatCurrencyVND(record.amount)}</Text>}
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <Text className="block text-xs text-gray-400">Ngày tạo</Text>
                      <Text className="text-sm">{dayjs(record.createdAt).format('DD/MM/YYYY')}</Text>
                      {(record.dueDate || record.endDate) && (
                        <>
                          <Text className="block text-xs text-gray-400 mt-2">Hạn/ngày kết thúc</Text>
                          <Text className="text-sm">{dayjs(record.dueDate || record.endDate).format('DD/MM/YYYY')}</Text>
                        </>
                      )}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="Chưa có yêu cầu hoặc hướng dẫn nào từ HTX" />
        )}
      </Card>
    </div>
  );
};

export default FarmerHtxAssignments;
