import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, List, Row, Skeleton, Space, Statistic, Tag, Typography, message } from 'antd';
import { AuditOutlined, FileDoneOutlined, TeamOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrencyVND } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const accountingDuties = [
  {
    title: 'Äá»‘i soÃ¡t phÃ¢n phá»‘i',
    description: 'Nháº­n Ä‘á» nghá»‹ thu/chi, chi phÃ­ váº­n chuyá»ƒn, Ä‘Ã³ng gÃ³i vÃ  Ä‘á»‘i soÃ¡t Ä‘Æ¡n hÃ ng do Ban phÃ¢n phá»‘i chuyá»ƒn sang.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Äá»‘i soÃ¡t phÃ¢n phá»‘i', path: '/htx/distribution-finance' },
      { label: 'Giao dá»‹ch tÃ i chÃ­nh', path: '/htx/accounting-transactions' },
    ],
  },
  {
    title: 'Giao dá»‹ch tÃ i chÃ­nh',
    description: 'Ghi nháº­n thu, chi, bÃ¡n hÃ ng, mua hÃ ng, thanh toÃ¡n vÃ  cÃ¡c nghiá»‡p vá»¥ tiá»n tá»‡.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'Giao dá»‹ch tÃ i chÃ­nh', path: '/htx/accounting-transactions' },
    ],
  },
  {
    title: 'CÃ´ng ná»£ pháº£i thu',
    description: 'Theo dÃµi cÃ¡c khoáº£n khÃ¡ch hÃ ng, Ä‘á»‘i tÃ¡c hoáº·c nÃ´ng há»™ cÃ²n pháº£i thanh toÃ¡n.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'CÃ´ng ná»£ pháº£i thu', path: '/htx/accounting-receivables' },
    ],
  },
  {
    title: 'CÃ´ng ná»£ pháº£i tráº£',
    description: 'Theo dÃµi khoáº£n pháº£i tráº£ cho nhÃ  cung cáº¥p, nÃ´ng há»™, váº­n chuyá»ƒn vÃ  chi phÃ­ hoáº¡t Ä‘á»™ng.',
    icon: <WalletOutlined />,
    actions: [
      { label: 'CÃ´ng ná»£ pháº£i tráº£', path: '/htx/accounting-payables' },
    ],
  },
  {
    title: 'Sá»• sÃ¡ch & bÃ¡o cÃ¡o',
    description: 'LÆ°u bÃ¡o cÃ¡o tÃ i sáº£n, lá»£i nhuáº­n/lá»—, dÃ²ng tiá»n vÃ  tá»•ng há»£p thu chi.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'Sá»• sÃ¡ch & bÃ¡o cÃ¡o', path: '/htx/accounting-reports' },
      { label: 'BÃ¡o cÃ¡o & thá»‘ng kÃª', path: '/reports' },
    ],
  },
  {
    title: 'Thuáº¿ & chi phÃ­ khÃ¡c',
    description: 'Theo dÃµi thá»§ tá»¥c thuáº¿, phÃ­, lá»‡ phÃ­ vÃ  cÃ¡c khoáº£n chi phÃ­ báº¯t buá»™c.',
    icon: <FileDoneOutlined />,
    actions: [
      { label: 'Thuáº¿ & chi phÃ­', path: '/htx/tax-obligations' },
      { label: 'TÃ i chÃ­nh - thu chi', path: '/htx/finance' },
    ],
  },
  {
    title: 'Khuyáº¿n nghá»‹ tÃ i chÃ­nh',
    description: 'Ghi nháº­n cáº£nh bÃ¡o vÃ  Ä‘á» xuáº¥t cáº£i thiá»‡n quáº£n lÃ½ tÃ i chÃ­nh HTX.',
    icon: <AuditOutlined />,
    actions: [
      { label: 'Khuyáº¿n nghá»‹ tÃ i chÃ­nh', path: '/htx/financial-recommendations' },
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
        message.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u káº¿ toÃ¡n HTX');
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
    { title: 'Tá»•ng thu', value: formatCurrencyVND(totals.txIncome), color: '#16a34a' },
    { title: 'Tá»•ng chi', value: formatCurrencyVND(totals.txExpense), color: '#ef4444' },
    { title: 'Pháº£i thu', value: formatCurrencyVND(totals.recPending), color: '#2563eb' },
    { title: 'Pháº£i tráº£', value: formatCurrencyVND(totals.payPending), color: '#f97316' },
    { title: 'Chá» phÃ¢n phá»‘i', value: totals.distributionPending, suffix: '', color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Trung tÃ¢m káº¿ toÃ¡n HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <WalletOutlined className="text-green-600" /> Káº¿ toÃ¡n
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            MÃ n nghiá»‡p vá»¥ cho Káº¿ toÃ¡n: quáº£n lÃ½ giao dá»‹ch tÃ i chÃ­nh, cÃ´ng ná»£, sá»• sÃ¡ch, bÃ¡o cÃ¡o, thuáº¿ vÃ  khuyáº¿n nghá»‹ tÃ i chÃ­nh.
          </Paragraph>
        </div>
        <Space wrap>
          <Button type="primary" icon={<WalletOutlined />} onClick={() => navigate('/htx/accounting-transactions')} className="rounded-xl h-10">
            Giao dá»‹ch
          </Button>
          <Button icon={<WalletOutlined />} onClick={() => navigate('/htx/distribution-finance')} className="rounded-xl h-10">
            Äá»‘i soÃ¡t phÃ¢n phá»‘i
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        className="rounded-2xl border-blue-100"
        message="TÃ¡c Ä‘á»™ng tá»›i nÃ´ng dÃ¢n"
        description="Káº¿ toÃ¡n cÃ³ thá»ƒ gáº¯n khoáº£n pháº£i thu, pháº£i tráº£, thanh toÃ¡n hoáº·c khuyáº¿n nghá»‹ tÃ i chÃ­nh vá»›i tá»«ng nÃ´ng dÃ¢n liÃªn quan. NÃ´ng dÃ¢n sáº½ nháº­n thÃ´ng bÃ¡o vÃ  xem táº¡i mÃ n YÃªu cáº§u tá»« HTX."
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
            <Text strong className="block text-gray-900">Quyá»n háº¡n káº¿ toÃ¡n Ä‘Ã£ Ã¡p vÃ o há»‡ thá»‘ng</Text>
            <Text className="text-gray-500 text-sm">Káº¿ toÃ¡n quáº£n lÃ½ giao dá»‹ch, cÃ´ng ná»£, sá»• sÃ¡ch, bÃ¡o cÃ¡o, thuáº¿ vÃ  Ä‘Æ°a ra khuyáº¿n nghá»‹ tÃ i chÃ­nh trong pháº¡m vi HTX.</Text>
          </div>
          <Space wrap>
            <Tag color="green">Thu</Tag>
            <Tag color="red">Chi</Tag>
            <Tag color="blue">Pháº£i thu</Tag>
            <Tag color="orange">Pháº£i tráº£</Tag>
            <Tag color="purple">BÃ¡o cÃ¡o</Tag>
            <Tag color="gold">Äá»‘i soÃ¡t phÃ¢n phá»‘i</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default HtxAccountingConsole;
