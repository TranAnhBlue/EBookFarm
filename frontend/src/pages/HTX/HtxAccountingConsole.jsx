import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, List, Row, Skeleton, Space, Statistic, Tag, Typography, message } from 'antd';
import { AuditOutlined, FileDoneOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrencyVND } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const accountingDuties = [
  {
    title: 'Đối soát phân phối',
    description: 'Nhận đề nghị thu/chi, chi phí vận chuyển, đóng gói và đối soát đơn hàng do Ban phân phối chuyển sang.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Đối soát phân phối', path: '/htx/distribution-finance' },
      { label: 'Giao dịch tài chính', path: '/htx/accounting-transactions' },
    ],
  },
  {
    title: 'Giao dịch tài chính',
    description: 'Ghi nhận thu, chi, bán hàng, mua hàng, thanh toán và các nghiệp vụ tiền tệ.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Giao dịch tài chính', path: '/htx/accounting-transactions' },
    ],
  },
  {
    title: 'Công nợ phải thu',
    description: 'Theo dõi các khoản khách hàng, đối tác hoặc nông hộ còn phải thanh toán.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Công nợ phải thu', path: '/htx/accounting-receivables' },
    ],
  },
  {
    title: 'Công nợ phải trả',
    description: 'Theo dõi khoản phải trả cho nhà cung cấp, nông hộ, vận chuyển và chi phí hoạt động.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Công nợ phải trả', path: '/htx/accounting-payables' },
    ],
  },
  {
    title: 'Sổ sách & báo cáo',
    description: 'Lưu báo cáo tài sản, lợi nhuận/lỗ, dòng tiền và tổng hợp thu chi.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'Sổ sách & báo cáo', path: '/htx/accounting-reports' },
      { label: 'Báo cáo & thống kê', path: '/reports' },
    ],
  },
  {
    title: 'Thuế & chi phí khác',
    description: 'Theo dõi thủ tục thuế, phí, lệ phí và các khoản chi phí bắt buộc.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'Thuế & chi phí', path: '/htx/tax-obligations' },
      { label: 'Tài chính - thu chi', path: '/htx/finance' },
    ],
  },
  {
    title: 'Khuyến nghị tài chính',
    description: 'Ghi nhận cảnh báo và đề xuất cải thiện quản lý tài chính HTX.',
    icon: <AuditOutlined />,
    actions: [
      { label: 'Khuyến nghị tài chính', path: '/htx/financial-recommendations' },
    ],
  },
];

const HtxAccountingConsole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [reports, setReports] = useState([]);
  const [distributionFinance, setDistributionFinance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [txRes, recRes, payRes, reportRes, distributionFinanceRes] = await Promise.all([
          api.get('/htx/management/accounting-transactions'),
          api.get('/htx/management/accounting-receivables'),
          api.get('/htx/management/accounting-payables'),
          api.get('/htx/management/accounting-reports'),
          api.get('/htx/management/distribution-finance-requests'),
        ]);
        setTransactions(txRes.data?.data || []);
        setReceivables(recRes.data?.data || []);
        setPayables(payRes.data?.data || []);
        setReports(reportRes.data?.data || []);
        setDistributionFinance(distributionFinanceRes.data?.data || []);
      } catch (error) {
        message.error('Không thể tải dữ liệu kế toán HTX');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totals = useMemo(() => {
    const txIncome = transactions.filter(item => item.direction === 'Income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const txExpense = transactions.filter(item => item.direction === 'Expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const recPending = receivables.filter(item => item.status !== 'Paid').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const payPending = payables.filter(item => item.status !== 'Paid').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const distributionPending = distributionFinance.filter(item => ['Pending', 'Review'].includes(item.status)).length;
    return { txIncome, txExpense, recPending, payPending, distributionPending };
  }, [transactions, receivables, payables, distributionFinance]);

  const summaryItems = [
    { title: 'Tổng thu', value: formatCurrencyVND(totals.txIncome), color: '#16a34a' },
    { title: 'Tổng chi', value: formatCurrencyVND(totals.txExpense), color: '#ef4444' },
    { title: 'Phải thu', value: formatCurrencyVND(totals.recPending), color: '#2563eb' },
    { title: 'Phải trả', value: formatCurrencyVND(totals.payPending), color: '#f97316' },
    { title: 'Chờ phân phối', value: totals.distributionPending, suffix: '', color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Trung tâm kế toán HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <WalletOutlined className="text-green-600" /> Kế toán
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            Màn nghiệp vụ cho Kế toán: quản lý giao dịch tài chính, công nợ, sổ sách, báo cáo, thuế và khuyến nghị tài chính.
          </Paragraph>
        </div>
        <Space wrap>
          <Button type="primary" icon={<WalletOutlined />} onClick={() => navigate('/htx/accounting-transactions')} className="rounded-xl h-10">
            Giao dịch
          </Button>
          <Button icon={<WalletOutlined />} onClick={() => navigate('/htx/distribution-finance')} className="rounded-xl h-10">
            Đối soát phân phối
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        className="rounded-2xl border-blue-100"
        message="Tác động tới nông dân"
        description="Kế toán có thể gắn khoản phải thu, phải trả, thanh toán hoặc khuyến nghị tài chính với từng nông dân liên quan. Nông dân sẽ nhận thông báo và xem tại màn Yêu cầu từ HTX."
      />

      <Row gutter={[16, 16]}>
        {summaryItems.map(item => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full">
              <Skeleton loading={loading} active paragraph={false}>
                <Statistic title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">{item.title}</Text>} value={item.value} suffix={item.suffix} valueStyle={{ fontSize: 24, fontWeight: 700, color: item.color }} />
              </Skeleton>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {accountingDuties.map(duty => (
          <Col xs={24} md={12} xl={8} key={duty.title}>
            <Card className="rounded-2xl border-gray-100 shadow-sm h-full" bodyStyle={{ padding: 20 }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg shrink-0">{duty.icon}</div>
                <div>
                  <Text strong className="text-base text-gray-900">{duty.title}</Text>
                  <Paragraph className="!mb-0 mt-1 text-xs text-gray-500 leading-5">{duty.description}</Paragraph>
                </div>
              </div>
              <List dataSource={duty.actions} split={false} renderItem={action => (
                <List.Item className="!px-0 !py-1">
                  <Button block onClick={() => navigate(action.path)} className="text-left justify-start rounded-xl border-gray-100">{action.label}</Button>
                </List.Item>
              )} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <Text strong className="block text-gray-900">Quyền hạn kế toán đã áp vào hệ thống</Text>
            <Text className="text-gray-500 text-sm">Kế toán quản lý giao dịch, công nợ, sổ sách, báo cáo, thuế và đưa ra khuyến nghị tài chính trong phạm vi HTX.</Text>
          </div>
          <Space wrap>
            <Tag color="green">Thu</Tag>
            <Tag color="red">Chi</Tag>
            <Tag color="blue">Phải thu</Tag>
            <Tag color="orange">Phải trả</Tag>
            <Tag color="purple">Báo cáo</Tag>
            <Tag color="gold">Đối soát phân phối</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HtxAccountingConsole;
