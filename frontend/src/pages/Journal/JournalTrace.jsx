import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Descriptions, Spin, Tag, Button, Image, Divider, Timeline, Row, Col, Statistic, Space, Modal, message } from 'antd';
import { CheckCircleOutlined, EnvironmentOutlined, CalendarOutlined, UserOutlined, SafetyOutlined, FileTextOutlined, HomeOutlined, QrcodeOutlined, EyeOutlined, ShareAltOutlined, SafetyCertificateOutlined, PictureOutlined, FacebookOutlined, LinkOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const JournalTrace = () => {
  const { qrCode } = useParams();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const { data: journal, isLoading, isError } = useQuery({
      queryKey: ['trace', qrCode],
      queryFn: () => axios.get(`http://localhost:5000/api/journals/qr/${qrCode}`).then(res => res.data.data),
  });

  // Share functions
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Xem nguồn gốc sản phẩm ${journal?.schemaId?.name} - EBookFarm`;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'zalo':
        shareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
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
      'HACCP': { color: 'orange', icon: '✓' },
      'ISO': { color: 'purple', icon: '⭐' },
    };
    return badges[certName] || { color: 'default', icon: '📜' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Spin size="large" />
        <Text className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</Text>
      </div>
    );
  }

  if (isError || !journal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <Title level={2} className="text-red-600">Không tìm thấy thông tin</Title>
          <Paragraph className="text-gray-600 mb-6">
            Mã QR không hợp lệ hoặc sản phẩm chưa được đăng ký trong hệ thống.
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

  const schema = journal.schemaId;
  const thongTinChung = journal.entries?.['Thông tin chung'] || {};

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      'Draft': { color: 'default', text: 'Đang cập nhật', icon: '📝' },
      'Submitted': { color: 'processing', text: 'Đã gửi', icon: '📤' },
      'Verified': { color: 'success', text: 'Đã xác minh', icon: '✅' },
      'Completed': { color: 'success', text: 'Hoàn thành', icon: '✅' },
      'Locked': { color: 'error', text: 'Đã khóa', icon: '🔒' },
    };
    return statusMap[status] || statusMap['Draft'];
  };

  const statusInfo = getStatusInfo(journal.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full mr-4">
              <CheckCircleOutlined className="text-4xl text-green-600" />
            </div>
            <div>
              <Title level={1} className="!text-white !mb-0">Truy xuất nguồn gốc</Title>
              <Text className="text-green-100 text-lg">Sản phẩm nông nghiệp an toàn - Minh bạch - Uy tín</Text>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30">
              <QrcodeOutlined className="mr-2" />
              <Text className="text-white font-mono font-bold">ID: {journal.qrCode?.substring(0, 8).toUpperCase()}</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Product Info Card */}
        <Card className="mb-6 shadow-lg rounded-2xl overflow-hidden border-0">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-100 p-4 rounded-xl">
                  <FileTextOutlined className="text-3xl text-green-600" />
                </div>
                <div className="flex-1">
                  <Title level={2} className="!mb-2">{schema.name}</Title>
                  <Text className="text-gray-500 text-base">{schema.description || 'Sản phẩm nông nghiệp chất lượng cao'}</Text>
                </div>
              </div>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="flex items-center gap-2 mb-3">
                    <HomeOutlined className="text-green-600" />
                    <Text strong>Tên cơ sở:</Text>
                  </div>
                  <Text className="text-base">{thongTinChung.tenCoSo || 'Chưa cập nhật'}</Text>
                </Col>
                <Col span={12}>
                  <div className="flex items-center gap-2 mb-3">
                    <UserOutlined className="text-green-600" />
                    <Text strong>Người sản xuất:</Text>
                  </div>
                  <Text className="text-base">{journal.userId?.fullname || journal.userId?.username || 'Chưa cập nhật'}</Text>
                </Col>
                <Col span={12}>
                  <div className="flex items-center gap-2 mb-3">
                    <EnvironmentOutlined className="text-green-600" />
                    <Text strong>Địa chỉ sản xuất:</Text>
                  </div>
                  <Text className="text-base">{thongTinChung.diaChiSanXuat || thongTinChung.diaChiCoSo || 'Chưa cập nhật'}</Text>
                </Col>
                <Col span={12}>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarOutlined className="text-green-600" />
                    <Text strong>Ngày tạo:</Text>
                  </div>
                  <Text className="text-base">{dayjs(journal.createdAt).format('DD/MM/YYYY')}</Text>
                </Col>
              </Row>
            </Col>

            <Col xs={24} md={8}>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl h-full flex flex-col justify-center items-center">
                <SafetyOutlined className="text-6xl text-green-600 mb-4" />
                <Tag color={statusInfo.color} className="text-lg px-4 py-2 rounded-full mb-3">
                  {statusInfo.icon} {statusInfo.text}
                </Tag>
                <Text className="text-center text-gray-600">
                  Sản phẩm đã được xác thực và đăng ký trong hệ thống truy xuất nguồn gốc
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          {thongTinChung.dienTich && (
            <Col xs={12} sm={6}>
              <Card className="shadow-md rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <Statistic
                  title={<Text strong className="text-blue-800">Diện tích</Text>}
                  value={thongTinChung.dienTich}
                  suffix="m²"
                  valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          )}
          {thongTinChung.namSanXuat && (
            <Col xs={12} sm={6}>
              <Card className="shadow-md rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
                <Statistic
                  title={<Text strong className="text-green-800">Năm sản xuất</Text>}
                  value={thongTinChung.namSanXuat}
                  valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          )}
          <Col xs={12} sm={6}>
            <Card className="shadow-md rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <Statistic
                title={<Text strong className="text-purple-800">Lượt xem</Text>}
                value={journal.viewCount || 0}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card 
              className="shadow-md rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShareModalVisible(true)}
            >
              <div className="text-center">
                <ShareAltOutlined className="text-3xl text-orange-600 mb-2" />
                <Text strong className="text-orange-800 block">Chia sẻ</Text>
                <Text className="text-orange-600 text-xs">Nhấn để chia sẻ</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Certifications */}
        {journal.certifications && journal.certifications.length > 0 && (
          <Card 
            className="mb-6 shadow-lg rounded-2xl border-0"
            title={
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <SafetyCertificateOutlined className="text-xl text-yellow-600" />
                </div>
                <div>
                  <Title level={3} className="!mb-0">Chứng nhận</Title>
                  <Text className="text-gray-500">Các chứng nhận chất lượng và an toàn</Text>
                </div>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              {journal.certifications.map((cert, index) => {
                const badge = getCertBadge(cert.name);
                return (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-green-400 transition-colors">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <Tag color={badge.color} className="text-base px-4 py-1 rounded-full mb-3">
                          {cert.name}
                        </Tag>
                        <Divider className="my-3" />
                        <div className="text-left space-y-2">
                          {cert.issuer && (
                            <div>
                              <Text className="text-gray-500 text-xs">Tổ chức cấp:</Text>
                              <Text className="block font-medium">{cert.issuer}</Text>
                            </div>
                          )}
                          {cert.number && (
                            <div>
                              <Text className="text-gray-500 text-xs">Số chứng nhận:</Text>
                              <Text className="block font-medium font-mono">{cert.number}</Text>
                            </div>
                          )}
                          {cert.issueDate && (
                            <div>
                              <Text className="text-gray-500 text-xs">Ngày cấp:</Text>
                              <Text className="block font-medium">{dayjs(cert.issueDate).format('DD/MM/YYYY')}</Text>
                            </div>
                          )}
                          {cert.expiryDate && (
                            <div>
                              <Text className="text-gray-500 text-xs">Hiệu lực đến:</Text>
                              <Text className="block font-medium text-green-600">{dayjs(cert.expiryDate).format('DD/MM/YYYY')}</Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        )}

        {/* Product Images */}
        {journal.images && journal.images.length > 0 && (
          <Card 
            className="mb-6 shadow-lg rounded-2xl border-0"
            title={
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <PictureOutlined className="text-xl text-pink-600" />
                </div>
                <div>
                  <Title level={3} className="!mb-0">Hình ảnh sản phẩm</Title>
                  <Text className="text-gray-500">Ảnh thực tế từ quá trình sản xuất</Text>
                </div>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              {journal.images.map((img, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <div 
                    className="relative group cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => {
                      setPreviewImage(img.url);
                      setImagePreviewVisible(true);
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `Ảnh ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl"
                      preview={false}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <EyeOutlined className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <Text className="text-white text-xs">{img.caption}</Text>
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Production Timeline */}
        <Card 
          className="shadow-lg rounded-2xl border-0"
          title={
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CalendarOutlined className="text-xl text-green-600" />
              </div>
              <div>
                <Title level={3} className="!mb-0">Quy trình sản xuất</Title>
                <Text className="text-gray-500">Chi tiết từng giai đoạn sản xuất</Text>
              </div>
            </div>
          }
        >
          <Timeline
            className="mt-6"
            items={schema.tables.map((table, index) => {
              const tableData = journal.entries?.[table.tableName];
              const hasData = tableData && Object.keys(tableData).length > 0;

              return {
                dot: hasData ? (
                  <CheckCircleOutlined className="text-xl text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                ),
                color: hasData ? 'green' : 'gray',
                children: (
                  <div className="pb-6">
                    <Title level={4} className="!mb-3 text-gray-800">
                      {index + 1}. {table.tableName}
                    </Title>
                    {hasData ? (
                      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm">
                        <Descriptions 
                          size="small" 
                          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                          bordered
                          className="custom-descriptions"
                        >
                          {table.fields.map((field) => {
                            const value = tableData[field.name];
                            let displayValue = value;

                            // Format date
                            if (field.type === 'date' && value) {
                              displayValue = dayjs(value).format('DD/MM/YYYY');
                            }
                            // Format number
                            else if (field.type === 'number' && value) {
                              displayValue = value.toLocaleString('vi-VN');
                            }
                            // Format boolean
                            else if (field.type === 'boolean') {
                              displayValue = value ? 'Có' : 'Không';
                            }

                            return (
                              <Descriptions.Item 
                                label={<Text strong className="text-gray-700">{field.label}</Text>} 
                                key={field.name}
                              >
                                <Text className="text-gray-900">
                                  {displayValue || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                </Text>
                              </Descriptions.Item>
                            );
                          })}
                        </Descriptions>
                      </Card>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <Text className="text-gray-400 italic">Chưa có thông tin cho giai đoạn này</Text>
                      </div>
                    )}
                  </div>
                ),
              };
            })}
          />
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center pb-8">
          <Divider />
          <div className="bg-white rounded-2xl shadow-md p-6 inline-block">
            <Text className="text-gray-600 block mb-2">Được cung cấp bởi</Text>
            <Title level={3} className="!mb-2 text-green-600">🌿 EBookFarm</Title>
            <Text className="text-gray-500">Hệ thống quản lý và truy xuất nguồn gốc nông sản</Text>
            <div className="mt-4">
              <Link to="/">
                <Button type="primary" size="large" className="bg-green-600 rounded-full px-8">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShareAltOutlined className="text-green-600" />
            <span>Chia sẻ sản phẩm</span>
          </div>
        }
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        centered
      >
        <div className="py-4">
          <Text className="block mb-4 text-gray-600">Chia sẻ thông tin truy xuất nguồn gốc sản phẩm này:</Text>
          <Space direction="vertical" size="middle" className="w-full">
            <Button
              block
              size="large"
              icon={<FacebookOutlined />}
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 text-white hover:bg-blue-700 border-0 rounded-lg h-12"
            >
              Chia sẻ lên Facebook
            </Button>
            <Button
              block
              size="large"
              icon={<span className="text-lg">💬</span>}
              onClick={() => handleShare('zalo')}
              className="bg-blue-500 text-white hover:bg-blue-600 border-0 rounded-lg h-12"
            >
              Chia sẻ qua Zalo
            </Button>
            <Button
              block
              size="large"
              icon={<LinkOutlined />}
              onClick={() => handleShare('copy')}
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-lg h-12"
            >
              Copy link
            </Button>
          </Space>
          <Divider />
          <div className="bg-gray-50 p-3 rounded-lg">
            <Text className="text-xs text-gray-500 block mb-1">Link truy xuất:</Text>
            <Text className="text-xs font-mono break-all">{window.location.href}</Text>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={imagePreviewVisible}
        footer={null}
        onCancel={() => setImagePreviewVisible(false)}
        width="80%"
        centered
        bodyStyle={{ padding: 0 }}
      >
        <Image
          src={previewImage}
          alt="Preview"
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .custom-descriptions .ant-descriptions-item-label {
          background-color: #f0f9ff;
          font-weight: 600;
        }
        .custom-descriptions .ant-descriptions-item-content {
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default JournalTrace;
