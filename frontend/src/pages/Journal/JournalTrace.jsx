import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Descriptions, Spin, Tag, Button, Image, Divider, Timeline, Row, Col, Statistic, Space, Modal, message, Tooltip, Avatar } from 'antd';
import { 
  CheckCircleOutlined, EnvironmentOutlined, CalendarOutlined, 
  UserOutlined, SafetyOutlined, FileTextOutlined, HomeOutlined, 
  QrcodeOutlined, EyeOutlined, ShareAltOutlined, SafetyCertificateOutlined, 
  PictureOutlined, FacebookOutlined, LinkOutlined, BoxPlotOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_URL, getAvatarUrl, getInitialAvatar } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const JournalTrace = ({ isBatch }) => {
  const { qrCode, traceId } = useParams();
  const id = isBatch ? traceId : qrCode;
  
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const { data: traceData, isLoading: isTraceLoading, isError } = useQuery({
    queryKey: ['trace', id, isBatch],
    queryFn: () => {
      const endpoint = isBatch 
        ? `${API_URL}/batches/trace/${id}`
        : `${API_URL}/journals/qr/${id}`;
      return axios.get(endpoint).then(res => res.data.data);
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory-public'],
    queryFn: () => axios.get(`${API_URL}/inventory/items/public`).then(res => res.data.data),
    enabled: !!traceData
  });

  const isLoading = isTraceLoading;

  // Share functions
  const handleShare = (platform) => {
    const url = window.location.href;
    const itemName = isBatch ? traceData?.productId?.name : traceData?.schemaId?.name;
    const text = `Xem nguồn gốc sản phẩm ${itemName} - EBookFarm`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        message.success('Đã copy link!');
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Get certification badge
  const getCertBadge = (certName) => {
    const badges = {
      'VietGAP': { color: 'green', icon: '🌿' },
      'Organic': { color: 'lime', icon: '🍃' },
      'GlobalGAP': { color: 'blue', icon: '🌍' },
      'HACCP': { color: 'orange', icon: '🛡️' },
      'ISO': { color: 'purple', icon: '⭐' },
      'OCOP': { color: 'volcano', icon: '💎' },
      'VietGAHP': { color: 'cyan', icon: '🐄' },
    };
    return badges[certName] || { color: 'default', icon: '📜' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Spin size="large" />
        <Text className="mt-4 text-gray-600">Đang tải dữ liệu truy xuất...</Text>
      </div>
    );
  }

  if (isError || !traceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <Title level={2} className="text-red-600">Không tìm thấy thông tin</Title>
          <Paragraph className="text-gray-600 mb-6">
            Mã truy xuất không hợp lệ hoặc sản phẩm chưa được đăng ký trong hệ thống.
          </Paragraph>
          <Link to="/">
            <Button type="primary" size="large" className="bg-green-600">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Data mapping for Journal
  const journal = isBatch ? null : traceData;
  const batch = isBatch ? traceData : null;

  const itemName = isBatch ? batch.productId?.name : journal.schemaId?.name;
  const itemDesc = isBatch ? batch.productId?.description : journal.schemaId?.description;
  const traceCode = isBatch ? batch.traceId : journal.qrCode;

  // 1. Helper function to find values in entries by label or name
  const getEntryValue = (journalObj, searchLabels) => {
    if (!journalObj?.entries || !journalObj?.schemaId) return null;

    const normalizedSearchLabels = searchLabels.map(label => label.toLowerCase().trim());
    const entries = journalObj.entries || {};
    const schema = journalObj.schemaId;

    // A. Search via schema labels
    const targetFields = [];
    if (schema.tables) {
      schema.tables.forEach(table => {
        if (table.fields) {
          table.fields.forEach(field => {
            const lowerLabel = field.label.toLowerCase().trim();
            const lowerName = field.name.toLowerCase().trim();

            if (normalizedSearchLabels.some(sn =>
              lowerLabel.includes(sn) || sn.includes(lowerLabel) ||
              lowerName.includes(sn) || sn.includes(lowerName)
            )) {
              targetFields.push({ tableName: table.tableName, fieldName: field.name });
            }
          });
        }
      });
    }

    for (const target of targetFields) {
      const tableData = entries[target.tableName];
      if (!tableData) continue;
      if (Array.isArray(tableData)) {
        const val = tableData[0]?.[target.fieldName];
        if (val !== undefined && val !== null && val !== '') return val;
      } else {
        const val = tableData[target.fieldName];
        if (val !== undefined && val !== null && val !== '') return val;
      }
    }

    // B. Fallback: Full scan of entries
    for (const table in entries) {
      const tableObj = entries[table];
      if (tableObj && typeof tableObj === 'object') {
        const rows = Array.isArray(tableObj) ? tableObj : [tableObj];
        for (const row of rows) {
          for (const key in row) {
            const lowerKey = key.toLowerCase().trim();
            if (normalizedSearchLabels.some(sn => lowerKey.includes(sn) || sn.includes(lowerKey))) {
              const val = row[key];
              if (val !== undefined && val !== null && val !== '') return val;
            }
          }
        }
      }
    }
    return null;
  };

  let tenCoSo = '';
  let diaChi = '';
  if (!isBatch) {
    tenCoSo = getEntryValue(journal, ['tên cơ sở', 'coSo', 'tên nông trại', 'người đại diện', 'họ và tên tổ chức/cá nhân sản xuất']);
    diaChi = getEntryValue(journal, ['địa chỉ', 'địa chỉ sản xuất', 'vị trí', 'nơi sản xuất', 'location', 'address']);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full mr-4 shadow-lg">
              <CheckCircleOutlined className="text-4xl text-green-600" />
            </div>
            <div>
              <Title level={1} className="!text-white !mb-0 text-3xl md:text-4xl">Truy xuất nguồn gốc</Title>
              <Text className="text-green-100 text-lg">Sản phẩm nông nghiệp Minh bạch - Uy tín</Text>
            </div>
          </div>

          <div className="text-center mt-6">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30 shadow-inner">
              <QrcodeOutlined className="mr-2" />
              <Text className="text-white font-mono font-bold tracking-widest uppercase">ID: {traceCode?.substring(0, 12)}</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Info Card */}
        <Card className="mb-6 shadow-xl rounded-3xl overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={16}>
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100 shadow-sm">
                  {isBatch ? <BoxPlotOutlined className="text-4xl text-green-600" /> : <FileTextOutlined className="text-4xl text-green-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Title level={2} className="!mb-0 text-2xl md:text-3xl text-gray-800">{itemName}</Title>
                    {isBatch ? (
                      <Tag color="blue" className="rounded-full px-4 py-0.5 font-bold border-0 shadow-sm">Lô sản xuất</Tag>
                    ) : (
                      <Tag color="green" className="rounded-full px-4 py-0.5 font-bold border-0 shadow-sm">Sổ nhật ký</Tag>
                    )}
                  </div>
                  <Text className="text-gray-500 text-base italic">{itemDesc || 'Sản phẩm chất lượng cao từ EBookFarm'}</Text>
                </div>
              </div>

              <Divider className="my-4" />

              <Row gutter={[16, 24]}>
                {isBatch ? (
                  <>
                    <Col xs={12} sm={8}>
                      <Text className="text-gray-400 text-xs block mb-1 uppercase font-bold">Mã GTIN (GS1)</Text>
                      <Text strong className="text-base font-mono">{batch.productId?.gtin || 'Chưa cập nhật'}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text className="text-gray-400 text-xs block mb-1 uppercase font-bold">Mã lô hàng</Text>
                      <Text strong className="text-base">{batch.batchCode}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text className="text-gray-400 text-xs block mb-1 uppercase font-bold">Trọng lượng</Text>
                      <Text strong className="text-base">{batch.quantity} {batch.unit}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text className="text-gray-400 text-xs block mb-1 uppercase font-bold">Ngày sản xuất</Text>
                      <Text strong className="text-base">{dayjs(batch.productionDate).format('DD/MM/YYYY')}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text className="text-gray-400 text-xs block mb-1 uppercase font-bold">Hạn sử dụng</Text>
                      <Text strong className="text-base text-red-500">{dayjs(batch.expiryDate).format('DD/MM/YYYY')}</Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text className="text-gray-400 text-xs block mb-1 uppercase font-bold">Đơn vị sản xuất</Text>
                      <Text strong className="text-base">{batch.htxJournalId?.htxId?.fullname || 'Hợp Tác Xã'}</Text>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col xs={24} sm={12}>
                      <div className="flex items-center gap-3 mb-2">
                        <HomeOutlined className="text-green-600" />
                        <Text strong className="text-gray-600">Chủ nông hộ:</Text>
                        <Text className="text-gray-800">{journal.userId?.fullname || journal.userId?.username}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-center gap-3 mb-2">
                        <EnvironmentOutlined className="text-green-600" />
                        <Text strong className="text-gray-600">Khu vực:</Text>
                        <Text className="text-gray-800">{journal.userId?.province || diaChi || 'Chưa cập nhật'}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-center gap-3 mb-2">
                        <HomeOutlined className="text-green-600" />
                        <Text strong className="text-gray-600">Tên cơ sở:</Text>
                        <Text className="text-gray-800">{tenCoSo || 'Chưa cập nhật'}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarOutlined className="text-green-600" />
                        <Text strong className="text-gray-600">Ngày tạo:</Text>
                        <Text className="text-gray-800">{dayjs(journal.createdAt).format('DD/MM/YYYY')}</Text>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </Col>

            <Col xs={24} md={8}>
              <div className="bg-gradient-to-br from-green-600 to-blue-700 p-8 rounded-3xl h-full flex flex-col justify-center items-center text-white relative overflow-hidden shadow-xl">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <SafetyCertificateOutlined style={{ fontSize: '120px' }} />
                </div>
                <SafetyCertificateOutlined className="text-5xl mb-4 text-yellow-300" />
                <Title level={4} className="!text-white !mb-1 uppercase tracking-widest text-center font-black">Chứng Thực</Title>
                <Tag className="bg-white text-green-700 border-0 font-bold px-4 py-1 rounded-full mb-4 shadow-md">
                  VERIFIED BY EBOOKFARM
                </Tag>
                <Paragraph className="text-center text-white/90 text-sm mb-0">
                  Dữ liệu đã được kiểm chứng qua hệ thống nhật ký điện tử và được bảo lãnh bởi đơn vị sản xuất.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

        {isBatch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <Card className="rounded-2xl border-0 shadow-lg" title={<Text strong><EnvironmentOutlined className="mr-2 text-green-600" />Vùng nguyên liệu & Sản xuất</Text>}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Địa chỉ">{batch.productionLocation?.address || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Quy trình áp dụng">{batch.productId?.schemaId?.name || 'Chuẩn VietGAP'}</Descriptions.Item>
                  <Descriptions.Item label="Số hộ tham gia">{batch.farmJournalIds?.length || 1} nông hộ</Descriptions.Item>
                </Descriptions>
                <Divider className="my-3" />
                <div className="flex -space-x-2 overflow-hidden">
                   {batch.farmJournalIds?.map((fj, i) => (
                     <Tooltip key={i} title={fj.userId?.fullname || fj.userId?.username}>
                       <Avatar size="small" src={getAvatarUrl(fj.userId?.avatar)} className="border-2 border-white shadow-sm" />
                     </Tooltip>
                   ))}
                </div>
             </Card>
             <Card 
               className="rounded-2xl border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-500 to-red-500 text-white"
               onClick={() => setShareModalVisible(true)}
             >
                <div className="h-full flex flex-col items-center justify-center py-4">
                  <ShareAltOutlined className="text-4xl mb-2" />
                  <Title level={4} className="!text-white !mb-0">Chia sẻ nguồn gốc</Title>
                  <Text className="text-white/80">Lan tỏa giá trị nông sản sạch</Text>
                </div>
             </Card>
          </div>
        )}

        {/* Timeline Section */}
        <Card
          className="shadow-xl rounded-3xl border-0 mb-6"
          title={
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-2xl">
                <CalendarOutlined className="text-2xl text-green-600" />
              </div>
              <div>
                <Title level={3} className="!mb-0 text-xl">Hành trình nông sản</Title>
                <Text className="text-gray-400">Minh bạch quá trình chăm sóc & thu hoạch</Text>
              </div>
            </div>
          }
        >
          {isBatch ? (
            <Timeline className="mt-8 px-4" mode="alternate">
              <Timeline.Item color="green" label="Gieo trồng">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block text-left w-full max-w-sm">
                   <Text strong className="block text-green-700">Khởi đầu chu kỳ</Text>
                   <Text className="text-xs text-gray-400 block mb-2">{dayjs(batch.productionDate).subtract(3, 'month').format('DD/MM/YYYY')}</Text>
                   <Text className="text-sm">Lựa chọn giống và chuẩn bị đất trồng theo tiêu chuẩn {batch.productId?.schemaId?.name || 'VietGAP'}.</Text>
                 </div>
              </Timeline.Item>
              <Timeline.Item color="green" label="Chăm sóc">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block text-left w-full max-w-sm">
                   <Text strong className="block text-green-700">Giai đoạn phát triển</Text>
                   <Text className="text-sm">Áp dụng kỹ thuật bón phân hữu cơ và quản lý dịch bệnh IPM.</Text>
                 </div>
              </Timeline.Item>
              <Timeline.Item color="blue" label="Thu hoạch" dot={<CheckCircleOutlined className="text-xl" />}>
                 <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100 inline-block text-left w-full max-w-sm">
                   <Text strong className="block text-blue-700">Thu hoạch & Đóng gói</Text>
                   <Text className="text-xs text-gray-500 block mb-2">{dayjs(batch.productionDate).format('DD/MM/YYYY')}</Text>
                   <Text className="text-sm">Thu hoạch đúng độ chín, đóng gói đạt chuẩn vệ sinh an toàn thực phẩm.</Text>
                 </div>
              </Timeline.Item>
            </Timeline>
          ) : (
             <Timeline className="mt-8">
                {journal.schemaId?.tables?.map((table, index) => {
                  const data = journal.entries?.[table.tableName];
                  const hasData = data && Object.keys(data).length > 0;
                  return (
                    <Timeline.Item key={index} color={hasData ? 'green' : 'gray'}>
                      <Title level={5} className="!mb-2">{table.tableName}</Title>
                      {hasData ? (
                        <div className="space-y-4">
                          {(Array.isArray(data) ? data : [data]).map((row, rowIdx) => (
                            <Card key={rowIdx} size="small" className="bg-gray-50/50 rounded-xl border-gray-100 shadow-sm mb-4 last:mb-0">
                              <Descriptions column={1} size="small" bordered>
                                {table.fields.map(f => {
                                  const rawValue = row[f.name];
                                  let displayValue = rawValue || <span className="text-gray-400 italic">Chưa cập nhật</span>;

                                  // 1. Xử lý nếu là ID vật tư (map sang tên)
                                  if (inventory && typeof rawValue === 'string' && rawValue.length === 24) {
                                    const item = inventory.find(i => i._id === rawValue);
                                    if (item) displayValue = item.name;
                                  } 
                                  // 2. Xử lý nếu là ngày tháng (định dạng dd/MM/yyyy)
                                  else if (typeof rawValue === 'string' && (
                                    /^\d{4}-\d{2}-\d{2}/.test(rawValue) || // ISO format
                                    f.label.toLowerCase().includes('ngày') || 
                                    f.label.toLowerCase().includes('tháng')
                                  )) {
                                    const d = dayjs(rawValue);
                                    if (d.isValid()) displayValue = d.format('DD/MM/YYYY');
                                  }

                                  return (
                                    <Descriptions.Item key={f.name} label={<Text strong>{f.label}</Text>}>
                                      {displayValue}
                                    </Descriptions.Item>
                                  );
                                })}
                              </Descriptions>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
                          <Text className="text-gray-400 italic text-xs">Chưa có thông tin cho giai đoạn này</Text>
                        </div>
                      )}
                    </Timeline.Item>
                  );
                })}
             </Timeline>
          )}
        </Card>

        {/* Certifications and Images for Journal */}
        {!isBatch && (
          <>
            {journal.certifications?.length > 0 && (
              <Card className="mb-6 shadow-xl rounded-3xl border-0" title={<div className="flex items-center gap-2"><SafetyCertificateOutlined className="text-yellow-600" /><Text strong>Chứng nhận & Kiểm định</Text></div>}>
                 <Row gutter={[16, 16]}>
                    {journal.certifications.map((cert, idx) => {
                      const badge = getCertBadge(cert.name);
                      return (
                        <Col xs={24} sm={12} md={8} key={idx}>
                          <div className="bg-white border-2 border-gray-50 p-4 rounded-2xl text-center shadow-sm hover:border-green-200 transition-all">
                             <div className="text-4xl mb-2">{badge.icon}</div>
                             <Tag color={badge.color} className="mb-2 font-bold">{cert.name}</Tag>
                             <div className="text-left text-xs space-y-1">
                               <div className="flex justify-between"><Text type="secondary">Số hiệu:</Text><Text strong>{cert.number}</Text></div>
                               <div className="flex justify-between"><Text type="secondary">Ngày cấp:</Text><Text>{dayjs(cert.issueDate).format('DD/MM/YYYY')}</Text></div>
                             </div>
                          </div>
                        </Col>
                      );
                    })}
                 </Row>
              </Card>
            )}
            {journal.images?.length > 0 && (
              <Card className="mb-6 shadow-xl rounded-3xl border-0" title={<div className="flex items-center gap-2"><PictureOutlined className="text-pink-600" /><Text strong>Hình ảnh thực tế</Text></div>}>
                 <Row gutter={[16, 16]}>
                    {journal.images.map((img, idx) => (
                      <Col xs={12} sm={8} md={6} key={idx}>
                        <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm" onClick={() => { setPreviewImage(img.url); setImagePreviewVisible(true); }}>
                           <Image src={img.url} preview={false} className="w-full h-40 object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <EyeOutlined className="text-white text-2xl" />
                           </div>
                        </div>
                      </Col>
                    ))}
                 </Row>
              </Card>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center py-10">
           <Title level={4} className="!text-green-600 !mb-1">🌿 EBookFarm Ecosystem</Title>
           <Text className="text-gray-400">Trusted Traceability Solution for Smart Agriculture</Text>
           <div className="mt-8 flex justify-center gap-4">
              <Button type="primary" shape="round" size="large" onClick={() => window.location.href = '/'} className="bg-green-600 px-10 h-12 font-bold shadow-lg shadow-green-100">Về Trang Chủ</Button>
              <Button shape="round" size="large" icon={<ShareAltOutlined />} onClick={() => setShareModalVisible(true)} className="px-10 h-12 font-bold border-2 border-green-600 text-green-600">Chia sẻ</Button>
           </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal title="Chia sẻ nguồn gốc" open={shareModalVisible} onCancel={() => setShareModalVisible(false)} footer={null} centered className="rounded-3xl overflow-hidden">
        <div className="flex flex-col gap-4 py-4">
           <Button block size="large" icon={<FacebookOutlined />} onClick={() => handleShare('facebook')} className="bg-blue-600 text-white border-0 h-12 font-bold rounded-xl">Facebook</Button>
           <Button block size="large" icon={<LinkOutlined />} onClick={() => handleShare('copy')} className="bg-green-50 text-green-600 border-green-200 h-12 font-bold rounded-xl">Sao chép liên kết</Button>
           <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <Text className="text-xs text-gray-400 block mb-1 uppercase font-bold">Link Truy Xuất</Text>
              <Text className="text-[10px] break-all font-mono">{window.location.href}</Text>
           </div>
        </div>
      </Modal>

      {/* Image Preview */}
      <Modal open={imagePreviewVisible} footer={null} onCancel={() => setImagePreviewVisible(false)} width="80%" centered bodyStyle={{ padding: 0 }}>
        <img src={previewImage} alt="Preview" style={{ width: '100%' }} />
      </Modal>

      <style jsx>{`
        .ant-timeline-item-label { font-weight: bold; color: #059669; }
        .ant-descriptions-item-label { background-color: #f0fdf4 !important; width: 140px; }
      `}</style>
    </div>
  );
};

export default JournalTrace;
