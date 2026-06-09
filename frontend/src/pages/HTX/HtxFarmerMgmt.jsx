import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  AreaChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeploymentUnitOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  HomeOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '../../services/api';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import JournalEntry from '../Journal/JournalEntry';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const statusInfo = {
  'Chưa nhập': { color: 'default', label: 'Chưa nhập' },
  'Đang nhập': { color: 'processing', label: 'Đang nhập' },
  'Chờ duyệt': { color: 'warning', label: 'Chờ duyệt' },
  'Đã duyệt': { color: 'success', label: 'Đã duyệt' },
  'Cần chỉnh sửa': { color: 'orange', label: 'Cần chỉnh sửa' },
  'Không đạt': { color: 'error', label: 'Không đạt' },
  Draft: { color: 'default', label: 'Chưa nhập' },
  InProgress: { color: 'processing', label: 'Đang nhập' },
  Submitted: { color: 'warning', label: 'Chờ duyệt' },
  Verified: { color: 'success', label: 'Đã duyệt' },
  RevisionRequested: { color: 'orange', label: 'Cần chỉnh sửa' },
  Rejected: { color: 'error', label: 'Không đạt' },
};

const HtxFarmerMgmt = () => {
  const [farmers, setFarmers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [journalLoading, setJournalLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [farmTypeFilter, setFarmTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [journalPreviewOpen, setJournalPreviewOpen] = useState(false);
  const [previewJournalId, setPreviewJournalId] = useState(null);
  const [selectedJournalIds, setSelectedJournalIds] = useState([]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx/journals/farmers');
      setFarmers(res.data?.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách nông dân');
    } finally {
      setLoading(false);
    }
  };

  const fetchJournals = async () => {
    try {
      setJournalLoading(true);
      const res = await api.get('/htx/journals');
      setJournals(res.data?.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách sổ HTX');
    } finally {
      setJournalLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
    fetchJournals();
  }, []);

  const refreshAll = async () => {
    await Promise.all([fetchFarmers(), fetchJournals()]);
  };

  const filteredFarmers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return farmers.filter((farmer) => {
      const matchesKeyword = !keyword
        || (farmer.fullname || farmer.username || '').toLowerCase().includes(keyword)
        || (farmer.email || '').toLowerCase().includes(keyword)
        || (farmer.phone || '').includes(keyword)
        || (farmer.farmCode || '').toLowerCase().includes(keyword);
      const matchesType = !farmTypeFilter || (farmTypeFilter === 'none' ? !farmer.farmType : farmer.farmType === farmTypeFilter);
      const matchesStatus = !statusFilter || farmer.status === statusFilter;
      return matchesKeyword && matchesType && matchesStatus;
    });
  }, [farmers, farmTypeFilter, searchText, statusFilter]);

  const selectedFarmerHistory = useMemo(() => {
    if (!selectedFarmer) return [];
    return journals
      .map((journal) => {
        const entry = journal.farmers?.find((item) => {
          const id = item.farmerId?._id || item.farmerId;
          return String(id) === String(selectedFarmer._id);
        });
        if (!entry) return null;
        return {
          journal,
          entry,
          farmJournalId: entry.farmJournalId?._id || entry.farmJournalId,
          schemaName: journal.schemaId?.name || journal.schemaId?.title || 'Biểu mẫu chưa xác định',
        };
      })
      .filter(Boolean)
      .sort((a, b) => dayjs(b.journal.createdAt).valueOf() - dayjs(a.journal.createdAt).valueOf());
  }, [journals, selectedFarmer]);

  const assignableJournals = useMemo(() => {
    if (!selectedFarmer) return [];
    return journals.filter((journal) => {
      const alreadyAssigned = journal.farmers?.some((item) => {
        const id = item.farmerId?._id || item.farmerId;
        return String(id) === String(selectedFarmer._id);
      });
      return !alreadyAssigned;
    });
  }, [journals, selectedFarmer]);

  const journalAssignOptions = useMemo(() => {
    if (!selectedFarmer) return [];
    return journals.map((journal) => {
      const alreadyAssigned = journal.farmers?.some((item) => {
        const id = item.farmerId?._id || item.farmerId;
        return String(id) === String(selectedFarmer._id);
      });
      const schemaName = journal.schemaId?.name || journal.schemaId?.title || 'Biểu mẫu';
      return {
        value: journal._id,
        label: `${journal.name} - ${schemaName}${alreadyAssigned ? ' (Đã gán)' : ''}`,
        disabled: alreadyAssigned,
        journal,
        alreadyAssigned,
      };
    });
  }, [journals, selectedFarmer]);

  const openProfile = (farmer) => {
    setSelectedFarmer(farmer);
    setProfileOpen(true);
  };

  const openHistory = (farmer) => {
    setSelectedFarmer(farmer);
    setHistoryOpen(true);
  };

  const openJournalPreview = (journalId) => {
    if (!journalId) return;
    setPreviewJournalId(journalId);
    setJournalPreviewOpen(true);
  };

  const openAssign = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedJournalIds([]);
    setAssignOpen(true);
  };

  const handleAssignJournals = async () => {
    if (!selectedFarmer || selectedJournalIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sổ để gán');
      return;
    }
    try {
      setAssigning(true);
      await Promise.all(selectedJournalIds.map((journalId) => (
        api.post(`/htx/journals/${journalId}/farmers`, { farmerIds: [selectedFarmer._id] })
      )));
      message.success(`Đã gán ${selectedJournalIds.length} sổ cho ${selectedFarmer.fullname || selectedFarmer.username}`);
      setAssignOpen(false);
      setSelectedJournalIds([]);
      await fetchJournals();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi gán sổ cho nông dân');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveFarmer = (farmer) => {
    Modal.confirm({
      title: 'Xác nhận gỡ nông dân khỏi HTX',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: (
        <div>
          <Paragraph className="!mb-2">
            Bạn có chắc muốn gỡ <Text strong>{farmer.fullname || farmer.username}</Text> khỏi HTX?
          </Paragraph>
          <Text type="secondary">Nông dân sẽ bị bỏ liên kết HTX và bị gỡ khỏi các sổ HTX hiện tại.</Text>
        </div>
      ),
      okText: 'Gỡ khỏi HTX',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await api.delete(`/htx/journals/farmers/${farmer._id}`);
          message.success('Đã gỡ nông dân khỏi HTX');
          await refreshAll();
        } catch (error) {
          message.error(error.response?.data?.message || 'Lỗi khi gỡ nông dân khỏi HTX');
        }
      },
    });
  };

  const handleVerifyCert = async (certId, status) => {
    if (!selectedFarmer) return;
    try {
      await api.put(`/users/${selectedFarmer._id}/certifications/${certId}/verify`, { status });
      message.success(status === 'Approved' ? 'Đã duyệt chứng nhận' : 'Đã từ chối chứng nhận');
      await fetchFarmers();
      setSelectedFarmer((current) => {
        if (!current) return current;
        const updated = farmers.find((item) => item._id === current._id);
        return updated || current;
      });
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật chứng nhận');
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 70,
      align: 'center',
      render: (_, __, index) => <Text className="text-gray-400 text-xs">{(currentPage - 1) * pageSize + index + 1}</Text>,
    },
    {
      title: 'Nông dân',
      key: 'farmer',
      width: 260,
      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} src={getAvatarUrl(record.avatar)} className="border shadow-sm shrink-0">
            {!record.avatar && getInitialAvatar(record.fullname || record.username)}
          </Avatar>
          <div className="min-w-0">
            <Text strong className="block text-gray-800 truncate">{record.fullname || record.username}</Text>
            <Text className="block text-xs text-gray-400 truncate">{record.email || record.username}</Text>
            {record.farmCode && <Tag color="green" className="mt-1 rounded-full text-[10px]">{record.farmCode}</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 220,
      render: (record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PhoneOutlined className="text-green-500 text-xs" />
            <Text className="text-xs">{record.phone || 'Chưa cập nhật SĐT'}</Text>
          </div>
          <div className="flex items-center gap-2">
            <EnvironmentOutlined className="text-gray-400 text-xs" />
            <Text className="text-xs text-gray-500 truncate max-w-[170px]" title={record.address}>{record.address || 'Chưa cập nhật địa chỉ'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Nông trại',
      key: 'farm',
      width: 260,
      render: (record) => (
        <div>
          <Text strong className="block text-xs text-green-700 truncate max-w-[220px]">{record.farmName || 'Hộ trồng ổi VietGAP'}</Text>
          <Space size={6} wrap className="mt-1">
            <Tag color={record.farmType ? 'cyan' : 'default'} className="rounded-md border-0 text-[10px] uppercase font-bold">
              {record.farmType || 'Khác'}
            </Tag>
            <Text className="text-xs text-gray-400">{Number(record.farmArea || 0).toLocaleString('vi-VN')} m²</Text>
          </Space>
        </div>
      ),
    },
    {
      title: 'Chứng nhận',
      dataIndex: 'certifications',
      key: 'certifications',
      width: 120,
      align: 'center',
      render: (certs, record) => (
        <Button type="text" onClick={() => { setSelectedFarmer(record); setCertOpen(true); }}>
          <Badge count={certs?.length || 0} size="small">
            <SafetyCertificateOutlined className="text-blue-500 text-xl" />
          </Badge>
        </Button>
      ),
    },
    {
      title: 'Tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => (
        <div>
          <Text className="block text-xs text-gray-600">{date ? dayjs(date).format('DD/MM/YYYY') : '--'}</Text>
          <Text className="block text-[11px] text-gray-400 italic">{date ? dayjs(date).fromNow() : ''}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (record) => (
        <Tag color={record.status === 'Inactive' ? 'default' : 'green'} className="rounded-full border-0 px-3">
          {record.status === 'Inactive' ? 'Tạm dừng' : 'Hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Hồ sơ">
            <Button size="small" icon={<UserOutlined />} onClick={() => openProfile(record)} className="rounded-lg text-green-600 border-green-100 bg-green-50 w-8 h-8" />
          </Tooltip>
          <Tooltip title="Lịch sử">
            <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistory(record)} className="rounded-lg text-blue-600 border-blue-100 bg-blue-50 w-8 h-8" />
          </Tooltip>
          <Tooltip title="Gán sổ">
            <Button size="small" type="primary" icon={<DeploymentUnitOutlined />} onClick={() => openAssign(record)} className="rounded-lg border-0 shadow-sm w-8 h-8" />
          </Tooltip>
          <Tooltip title="Gỡ khỏi HTX">
            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleRemoveFarmer(record)} className="rounded-lg w-8 h-8" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <HomeOutlined />
            <span>Quản lý HTX</span>
            <span className="text-gray-200">/</span>
            <span className="text-green-600">Danh sách nông dân</span>
          </div>
          <Title level={4} className="!mb-0">Quản lý thành viên nông dân</Title>
        </div>
        <Button icon={<ReloadOutlined />} onClick={refreshAll} loading={loading || journalLoading} className="rounded-xl border-gray-200">
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-600 to-green-700">
            <Statistic title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số thành viên</Text>} value={farmers.length} prefix={<TeamOutlined />} valueStyle={{ color: '#fff', fontSize: 24, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic title={<Text className="text-gray-400 uppercase text-xs font-bold">Quy mô trồng trọt</Text>} value={farmers.filter((f) => f.farmType === 'Trồng trọt').length} prefix={<DeploymentUnitOutlined className="text-green-500" />} valueStyle={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic title={<Text className="text-gray-400 uppercase text-xs font-bold">Tổng diện tích (m²)</Text>} value={farmers.reduce((sum, item) => sum + Number(item.farmArea || 0), 0)} prefix={<AreaChartOutlined className="text-blue-500" />} valueStyle={{ color: '#3b82f6', fontSize: 24, fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: 12 }}>
        <Space size="middle" wrap>
          <Input placeholder="Tìm tên, SĐT, mã hộ..." prefix={<SearchOutlined className="text-gray-400" />} className="w-72 h-9 rounded-xl" allowClear value={searchText} onChange={(event) => setSearchText(event.target.value)} />
          <Select placeholder="Loại hình" allowClear value={farmTypeFilter} onChange={setFarmTypeFilter} className="w-40 h-9" options={[
            { value: 'Trồng trọt', label: 'Trồng trọt' },
            { value: 'Chăn nuôi', label: 'Chăn nuôi' },
            { value: 'Thủy sản', label: 'Thủy sản' },
            { value: 'none', label: 'Khác' },
          ]} />
          <Select placeholder="Trạng thái" allowClear value={statusFilter} onChange={setStatusFilter} className="w-40 h-9" options={[
            { value: 'Active', label: 'Hoạt động' },
            { value: 'Inactive', label: 'Tạm dừng' },
          ]} />
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredFarmers}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1280 }}
          pagination={{
            current: currentPage,
            pageSize,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            locale: { items_per_page: '/ trang' },
          }}
        />
      </Card>

      <Modal title={<Space><UserOutlined className="text-green-600" /><Text strong>Hồ sơ nông dân</Text></Space>} open={profileOpen} onCancel={() => setProfileOpen(false)} footer={<Button onClick={() => setProfileOpen(false)}>Đóng</Button>} width={820} centered>
        {selectedFarmer && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-white p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar size={72} src={getAvatarUrl(selectedFarmer.avatar)} className="border-4 border-white shadow">
                  {!selectedFarmer.avatar && getInitialAvatar(selectedFarmer.fullname || selectedFarmer.username)}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Title level={4} className="!mb-1 truncate">{selectedFarmer.fullname || selectedFarmer.username}</Title>
                  <Space size={8} wrap>
                    <Tag color="green" className="rounded-full px-3">Thành viên VietGAP</Tag>
                    <Tag color={selectedFarmer.status === 'Inactive' ? 'default' : 'success'} className="rounded-full px-3">
                      {selectedFarmer.status === 'Inactive' ? 'Tạm dừng' : 'Hoạt động'}
                    </Tag>
                    <Tag className="rounded-full px-3">{selectedFarmer.farmCode || 'Chưa có mã nông hộ'}</Tag>
                  </Space>
                </div>
              </div>
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <Card size="small" className="rounded-xl border-gray-100">
                  <Text type="secondary" className="text-xs uppercase font-bold">Diện tích</Text>
                  <div className="mt-1 text-xl font-bold text-green-700">{Number(selectedFarmer.farmArea || 0).toLocaleString('vi-VN')} m²</div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="rounded-xl border-gray-100">
                  <Text type="secondary" className="text-xs uppercase font-bold">Ngày tham gia</Text>
                  <div className="mt-1 text-xl font-bold text-gray-800">{selectedFarmer.createdAt ? dayjs(selectedFarmer.createdAt).format('DD/MM/YYYY') : '--'}</div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="rounded-xl border-gray-100">
                  <Text type="secondary" className="text-xs uppercase font-bold">Chứng nhận</Text>
                  <div className="mt-1 text-xl font-bold text-blue-600">{selectedFarmer.certifications?.length || 0}</div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Thông tin liên hệ" size="small" className="rounded-xl border-gray-100 h-full">
                  <div className="space-y-3">
                    <div><Text type="secondary">Tài khoản</Text><Text strong className="block break-all">{selectedFarmer.username || '--'}</Text></div>
                    <div><Text type="secondary">Email</Text><Text strong className="block break-all">{selectedFarmer.email || '--'}</Text></div>
                    <div><Text type="secondary">Điện thoại</Text><Text strong className="block">{selectedFarmer.phone || 'Chưa cập nhật'}</Text></div>
                    <div><Text type="secondary">Địa chỉ</Text><Text strong className="block">{selectedFarmer.address || '--'}</Text></div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Thông tin sản xuất" size="small" className="rounded-xl border-gray-100 h-full">
                  <div className="space-y-3">
                    <div><Text type="secondary">Tên nông trại</Text><Text strong className="block">{selectedFarmer.farmName || '--'}</Text></div>
                    <div><Text type="secondary">Loại hình</Text><Text strong className="block">{selectedFarmer.farmType || '--'}</Text></div>
                    <div><Text type="secondary">HTX quản lý</Text><Text strong className="block">Hợp tác xã dịch vụ nông nghiệp Đông Dư</Text></div>
                    <div><Text type="secondary">Số sổ đã gán</Text><Text strong className="block">{selectedFarmerHistory.length}</Text></div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <Modal title={<Space><HistoryOutlined className="text-blue-600" /><Text strong>Lịch sử sổ của {selectedFarmer?.fullname || selectedFarmer?.username}</Text></Space>} open={historyOpen} onCancel={() => setHistoryOpen(false)} footer={<Button onClick={() => setHistoryOpen(false)}>Đóng</Button>} width={820} centered>
        <List
          className="mt-4"
          loading={journalLoading}
          dataSource={selectedFarmerHistory}
          locale={{ emptyText: <Empty description="Nông dân này chưa được gán sổ HTX nào" /> }}
          renderItem={({ journal, entry, schemaName, farmJournalId }) => {
            const info = statusInfo[entry.status] || { color: 'default', label: entry.status || 'Chưa rõ' };
            return (
              <List.Item
                actions={[
                  farmJournalId && <Button size="small" onClick={() => openJournalPreview(farmJournalId)}>Xem sổ</Button>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined className="text-green-600 text-xl mt-1" />}
                  title={<Space wrap><Text strong>{journal.name}</Text><Tag color={info.color}>{info.label}</Tag></Space>}
                  description={(
                    <div className="space-y-1">
                      <Text className="block text-gray-500 text-sm">{schemaName}</Text>
                      <Text className="block text-gray-400 text-xs">Gán ngày: {entry.assignedAt ? dayjs(entry.assignedAt).format('DD/MM/YYYY HH:mm') : dayjs(journal.createdAt).format('DD/MM/YYYY')}</Text>
                      {entry.feedback && <Text className="block text-orange-600 text-xs">Phản hồi: {entry.feedback}</Text>}
                    </div>
                  )}
                />
              </List.Item>
            );
          }}
        />
      </Modal>

      <Modal title={<Space><DeploymentUnitOutlined className="text-green-600" /><Text strong>Gán sổ cho {selectedFarmer?.fullname || selectedFarmer?.username}</Text></Space>} open={assignOpen} onCancel={() => setAssignOpen(false)} onOk={handleAssignJournals} okText="Gán sổ" cancelText="Hủy" confirmLoading={assigning} width={720} centered>
        <div className="mt-4 space-y-3">
          <Text className="block text-gray-500">Chọn một hoặc nhiều sổ HTX chưa gán cho nông dân này. Sổ đã gán sẽ chỉ hiển thị để đối chiếu.</Text>
          <Select
            mode="multiple"
            placeholder="Chọn sổ nhật ký HTX"
            value={selectedJournalIds}
            onChange={setSelectedJournalIds}
            loading={journalLoading}
            className="w-full"
            optionFilterProp="label"
            options={journalAssignOptions}
            optionRender={(option) => {
              const item = option.data;
              return (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Text strong className="block truncate">{item.journal.name}</Text>
                    <Text type="secondary" className="block text-xs truncate">{item.journal.schemaId?.name || item.journal.schemaId?.title || 'Biểu mẫu'}</Text>
                  </div>
                  {item.alreadyAssigned && <Tag color="green" className="shrink-0 rounded-full">Đã gán</Tag>}
                </div>
              );
            }}
          />
          {!journals.length && <Empty description="HTX chưa có sổ nhật ký nào" />}
          {journals.length > 0 && !assignableJournals.length && (
            <Empty description="Nông dân này đã được gán vào tất cả sổ HTX hiện có" />
          )}
        </div>
      </Modal>

      <Modal title={<Space><SafetyCertificateOutlined className="text-blue-500" /><Text strong>Chứng nhận của {selectedFarmer?.fullname || selectedFarmer?.username}</Text></Space>} open={certOpen} onCancel={() => setCertOpen(false)} footer={<Button onClick={() => setCertOpen(false)}>Đóng</Button>} width={680} centered>
        <List
          className="mt-4"
          dataSource={selectedFarmer?.certifications || []}
          locale={{ emptyText: <Empty description="Chưa có chứng nhận" /> }}
          renderItem={(cert) => (
            <List.Item
              actions={[
                cert.status !== 'Approved' && <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleVerifyCert(cert._id, 'Approved')}>Duyệt</Button>,
                cert.status !== 'Rejected' && <Button size="small" danger onClick={() => handleVerifyCert(cert._id, 'Rejected')}>Từ chối</Button>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={<Space wrap><Text strong>{cert.name || 'Chứng nhận'}</Text><Tag color={cert.status === 'Approved' ? 'success' : cert.status === 'Rejected' ? 'error' : 'warning'}>{cert.status || 'Pending'}</Tag></Space>}
                description={(
                  <div>
                    <Text className="block text-gray-500 text-sm">Mã: {cert.code || '--'} · Đơn vị cấp: {cert.issuer || '--'}</Text>
                    <Text className="block text-gray-400 text-xs">Hiệu lực: {cert.issueDate ? dayjs(cert.issueDate).format('DD/MM/YYYY') : '--'} - {cert.expiryDate ? dayjs(cert.expiryDate).format('DD/MM/YYYY') : '--'}</Text>
                  </div>
                )}
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={<Space><FileTextOutlined className="text-green-600" /><Text strong>Xem sổ nhật ký</Text></Space>}
        open={journalPreviewOpen}
        onCancel={() => setJournalPreviewOpen(false)}
        footer={null}
        width="92vw"
        style={{ top: 24 }}
        bodyStyle={{ maxHeight: '82vh', overflowY: 'auto', background: '#f8fafc', padding: 16 }}
        destroyOnClose
      >
        {previewJournalId && <JournalEntry id={previewJournalId} />}
      </Modal>
    </div>
  );
};

export default HtxFarmerMgmt;

