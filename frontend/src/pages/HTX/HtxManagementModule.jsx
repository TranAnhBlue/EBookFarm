import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Image, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Statistic, Table, Tag, Tooltip, Typography, Upload, message } from 'antd';
import {
  AuditOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { formatCurrencyVND } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import { ROLES, normalizeRole } from '../../utils/roles';

const { Title, Text } = Typography;
const { TextArea } = Input;

const moduleConfigs = {
  documents: {
    title: 'Văn bản & thủ tục HTX',
    subtitle: 'Lưu hồ sơ pháp lý, văn bản nội bộ, biên bản và thủ tục cần Giám đốc xem xét.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm văn bản',
    codeLabel: 'Số/ký hiệu văn bản',
    typeLabel: 'Loại văn bản',
    typeOptions: ['Hồ sơ pháp lý', 'Biên bản', 'Quy trình', 'Quyết định', 'Công văn', 'Khác'],
    statusOptions: [
      { value: 'Draft', label: 'Dự thảo', color: 'default' },
      { value: 'Review', label: 'Chờ xem xét', color: 'processing' },
      { value: 'Approved', label: 'Đã ký duyệt', color: 'success' },
      { value: 'Archived', label: 'Lưu trữ', color: 'blue' },
    ],
  },
  tasks: {
    title: 'Phân công nhiệm vụ',
    subtitle: 'Giao việc cho từng bộ phận và theo dõi tiến độ thực hiện trong HTX.',
    icon: <TeamOutlined />,
    createText: 'Giao nhiệm vụ',
    codeLabel: 'Mã nhiệm vụ',
    typeLabel: 'Nhóm công việc',
    typeOptions: ['Sản xuất', 'Kỹ thuật', 'Phân phối', 'Kế toán', 'Kiểm soát', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chưa thực hiện', color: 'warning' },
      { value: 'InProgress', label: 'Đang thực hiện', color: 'processing' },
      { value: 'Review', label: 'Chờ kiểm tra', color: 'purple' },
      { value: 'Completed', label: 'Hoàn thành', color: 'success' },
    ],
  },
  finance: {
    title: 'Tài chính - thu chi',
    subtitle: 'Theo dõi nghiệp vụ thu, chi, nhập xuất và thanh toán cần Giám đốc ký duyệt.',
    icon: <WalletOutlined />,
    createText: 'Thêm giao dịch',
    codeLabel: 'Mã chứng từ',
    typeLabel: 'Loại chứng từ',
    typeOptions: ['Thu bán hàng', 'Chi vật tư', 'Thanh toán', 'Tạm ứng', 'Nhập kho', 'Xuất kho', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chờ duyệt', color: 'warning' },
      { value: 'Approved', label: 'Đã duyệt', color: 'success' },
      { value: 'Paid', label: 'Đã thanh toán', color: 'blue' },
      { value: 'Rejected', label: 'Từ chối', color: 'error' },
    ],
  },
  partners: {
    title: 'Đối tác & hợp đồng',
    subtitle: 'Quản lý đối tác liên kết, hợp đồng tiêu thụ và quyết định chấp thuận/từ chối.',
    icon: <AuditOutlined />,
    createText: 'Thêm hợp đồng',
    codeLabel: 'Mã hợp đồng',
    typeLabel: 'Loại hợp tác',
    typeOptions: ['Tiêu thụ sản phẩm', 'Cung ứng vật tư', 'Liên kết sản xuất', 'Dịch vụ', 'Khác'],
    statusOptions: [
      { value: 'Draft', label: 'Dự thảo', color: 'default' },
      { value: 'Review', label: 'Chờ xem xét', color: 'processing' },
      { value: 'Approved', label: 'Chấp thuận', color: 'success' },
      { value: 'Rejected', label: 'Từ chối', color: 'error' },
      { value: 'Expired', label: 'Hết hạn', color: 'default' },
    ],
  },
  training: {
    title: 'Đào tạo & tập huấn',
    subtitle: 'Theo dõi kế hoạch đào tạo, tái đào tạo nhân viên và xã viên HTX.',
    icon: <ReadOutlined />,
    createText: 'Thêm lớp tập huấn',
    codeLabel: 'Mã lớp',
    typeLabel: 'Chủ đề đào tạo',
    typeOptions: ['VietGAP', 'Kỹ thuật trồng trọt', 'Sử dụng vật tư', 'An toàn thực phẩm', 'Quản lý nhật ký', 'Khác'],
    statusOptions: [
      { value: 'Planned', label: 'Đã lên kế hoạch', color: 'processing' },
      { value: 'InProgress', label: 'Đang tổ chức', color: 'warning' },
      { value: 'Completed', label: 'Hoàn thành', color: 'success' },
      { value: 'Cancelled', label: 'Đã hủy', color: 'error' },
    ],
  },
  'technical-guidance': {
    title: 'Hướng dẫn kỹ thuật trồng trọt',
    subtitle: 'Lập và theo dõi các khuyến cáo kỹ thuật, quy trình chăm sóc, phòng ngừa rủi ro mùa vụ.',
    icon: <ReadOutlined />,
    createText: 'Thêm hướng dẫn',
    codeLabel: 'Mã hướng dẫn',
    typeLabel: 'Nhóm kỹ thuật',
    typeOptions: ['Chăm sóc cây trồng', 'Bón phân', 'Tưới tiêu', 'Thu hoạch', 'Bảo quản', 'Khác'],
    statusOptions: [
      { value: 'Draft', label: 'Dự thảo', color: 'default' },
      { value: 'Published', label: 'Đã ban hành', color: 'success' },
      { value: 'Review', label: 'Cần rà soát', color: 'warning' },
      { value: 'Archived', label: 'Lưu trữ', color: 'blue' },
    ],
  },
  'technical-training': {
    title: 'Đào tạo xã viên về kỹ thuật & vật tư',
    subtitle: 'Lập kế hoạch tập huấn, hướng dẫn bảo quản và sử dụng phân bón, thuốc BVTV cho thành viên VietGAP.',
    icon: <ReadOutlined />,
    createText: 'Thêm lớp tập huấn kỹ thuật',
    codeLabel: 'Mã lớp/tài liệu',
    typeLabel: 'Chủ đề đào tạo',
    typeOptions: ['VietGAP', 'Sử dụng phân bón', 'Sử dụng thuốc BVTV', 'Bảo quản vật tư', 'An toàn thực phẩm', 'Ghi chép nhật ký', 'Khác'],
    statusOptions: [
      { value: 'Planned', label: 'Đã lên kế hoạch', color: 'processing' },
      { value: 'InProgress', label: 'Đang tổ chức', color: 'warning' },
      { value: 'Completed', label: 'Hoàn thành', color: 'success' },
      { value: 'Review', label: 'Cần đánh giá lại', color: 'purple' },
      { value: 'Cancelled', label: 'Đã hủy', color: 'error' },
    ],
  },
  'pest-control': {
    title: 'Theo dõi sâu bệnh & biện pháp xử lý',
    subtitle: 'Ghi nhận dấu hiệu sâu bệnh, đề xuất phương pháp phòng trừ và theo dõi kết quả xử lý.',
    icon: <AuditOutlined />,
    createText: 'Thêm cảnh báo sâu bệnh',
    codeLabel: 'Mã cảnh báo',
    typeLabel: 'Loại rủi ro',
    typeOptions: ['Sâu hại', 'Bệnh hại', 'Thời tiết', 'Dinh dưỡng', 'Cỏ dại', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới ghi nhận', color: 'warning' },
      { value: 'InProgress', label: 'Đang xử lý', color: 'processing' },
      { value: 'Review', label: 'Theo dõi lại', color: 'purple' },
      { value: 'Completed', label: 'Đã xử lý', color: 'success' },
    ],
  },
  'product-inspections': {
    title: 'Kiểm tra sản phẩm đầu ra',
    subtitle: 'Lưu kết quả kiểm tra kỹ thuật, an toàn thực phẩm và chất lượng sản phẩm/lô hàng.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm phiếu kiểm tra',
    codeLabel: 'Mã phiếu',
    typeLabel: 'Nội dung kiểm tra',
    typeOptions: ['An toàn thực phẩm', 'Chất lượng quả', 'Dư lượng thuốc BVTV', 'Bao gói', 'Truy xuất nguồn gốc', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chờ kiểm tra', color: 'warning' },
      { value: 'Approved', label: 'Đạt', color: 'success' },
      { value: 'Review', label: 'Cần theo dõi', color: 'processing' },
      { value: 'Rejected', label: 'Không đạt', color: 'error' },
    ],
  },
  nonconformities: {
    title: 'Xử lý không phù hợp',
    subtitle: 'Theo dõi sản phẩm sai lỗi, nhật ký chưa đạt, tình huống cấp bách và biện pháp khắc phục.',
    icon: <AuditOutlined />,
    createText: 'Thêm sự không phù hợp',
    codeLabel: 'Mã sự vụ',
    typeLabel: 'Loại không phù hợp',
    typeOptions: ['Nhật ký sai thiếu', 'Sản phẩm sai lỗi', 'Vật tư không đúng', 'Quy trình không đạt', 'An toàn thực phẩm', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới phát hiện', color: 'warning' },
      { value: 'InProgress', label: 'Đang xử lý', color: 'processing' },
      { value: 'Review', label: 'Chờ xác nhận', color: 'purple' },
      { value: 'Completed', label: 'Đã khắc phục', color: 'success' },
    ],
  },
  'material-supervision': {
    title: 'Giám sát phân bón & thuốc BVTV',
    subtitle: 'Ghi nhận việc sắp xếp, bảo quản và sử dụng vật tư của xã viên theo yêu cầu VietGAP.',
    icon: <WalletOutlined />,
    createText: 'Thêm biên bản giám sát',
    codeLabel: 'Mã biên bản',
    typeLabel: 'Nhóm vật tư',
    typeOptions: ['Phân bón', 'Thuốc BVTV', 'Giống', 'Dụng cụ bảo hộ', 'Kho bảo quản', 'Khác'],
    statusOptions: [
      { value: 'Planned', label: 'Đã lên lịch', color: 'processing' },
      { value: 'InProgress', label: 'Đang giám sát', color: 'warning' },
      { value: 'Approved', label: 'Đạt yêu cầu', color: 'success' },
      { value: 'Rejected', label: 'Không đạt', color: 'error' },
    ],
  },
  'technical-proposals': {
    title: 'Đề xuất biện pháp kỹ thuật',
    subtitle: 'Ghi nhận đề xuất thay đổi biện pháp kỹ thuật, cơ cấu sản xuất hoặc phương án xử lý khi phát hiện không phù hợp.',
    icon: <AuditOutlined />,
    createText: 'Thêm đề xuất kỹ thuật',
    codeLabel: 'Mã đề xuất',
    typeLabel: 'Nhóm đề xuất',
    typeOptions: ['Thay đổi quy trình', 'Biện pháp phòng trừ', 'Điều chỉnh vật tư', 'Cơ cấu sản xuất', 'Xử lý khẩn cấp', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới đề xuất', color: 'warning' },
      { value: 'Review', label: 'Chờ Giám đốc xem xét', color: 'processing' },
      { value: 'Approved', label: 'Đã chấp thuận', color: 'success' },
      { value: 'InProgress', label: 'Đang áp dụng', color: 'blue' },
      { value: 'Rejected', label: 'Không chấp thuận', color: 'error' },
    ],
  },
  'technical-reports': {
    title: 'Báo cáo kỹ thuật',
    subtitle: 'Tổng hợp tình hình kỹ thuật, sâu bệnh, kiểm tra đầu ra, vật tư và các điểm cần lãnh đạo theo dõi.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm báo cáo kỹ thuật',
    codeLabel: 'Mã báo cáo',
    typeLabel: 'Loại báo cáo',
    typeOptions: ['Tình hình sâu bệnh', 'Kiểm tra đầu ra', 'Giám sát vật tư', 'Tiến độ nhật ký', 'An toàn thực phẩm', 'Tổng hợp tháng', 'Khác'],
    statusOptions: [
      { value: 'Draft', label: 'Dự thảo', color: 'default' },
      { value: 'Review', label: 'Chờ xem xét', color: 'processing' },
      { value: 'Approved', label: 'Đã xác nhận', color: 'success' },
      { value: 'Archived', label: 'Lưu trữ', color: 'blue' },
    ],
  },
  'distribution-orders': {
    title: 'Đơn đặt hàng',
    subtitle: 'Quản lý số lượng đơn đặt hàng, trạng thái điều phối và nhu cầu sản phẩm từ khách hàng/đối tác.',
    icon: <FileTextOutlined />,
    createText: 'Thêm đơn đặt hàng',
    codeLabel: 'Mã đơn hàng',
    typeLabel: 'Loại đơn hàng',
    typeOptions: ['Bán buôn', 'Bán lẻ', 'Đối tác tiêu thụ', 'Sự kiện', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới tiếp nhận', color: 'warning' },
      { value: 'InProgress', label: 'Đang điều phối', color: 'processing' },
      { value: 'Approved', label: 'Đã xác nhận', color: 'success' },
      { value: 'Completed', label: 'Hoàn thành', color: 'blue' },
      { value: 'Rejected', label: 'Từ chối', color: 'error' },
    ],
  },
  'distribution-shipments': {
    title: 'Vận chuyển & giao hàng',
    subtitle: 'Theo dõi thời gian, chi phí vận chuyển, khâu sắp xếp và hoàn thiện sản phẩm trước khi giao.',
    icon: <AuditOutlined />,
    createText: 'Thêm chuyến giao hàng',
    codeLabel: 'Mã vận đơn/chuyến',
    typeLabel: 'Hình thức vận chuyển',
    typeOptions: ['Nội thành', 'Liên tỉnh', 'Đối tác logistics', 'Tự vận chuyển', 'Khác'],
    statusOptions: [
      { value: 'Planned', label: 'Đã lên lịch', color: 'processing' },
      { value: 'InProgress', label: 'Đang vận chuyển', color: 'warning' },
      { value: 'Completed', label: 'Đã giao', color: 'success' },
      { value: 'Review', label: 'Cần đối soát', color: 'purple' },
      { value: 'Rejected', label: 'Có sự cố', color: 'error' },
    ],
  },
  'market-development': {
    title: 'Phát triển thị trường',
    subtitle: 'Theo dõi sự kiện giới thiệu sản phẩm, kênh tiêu thụ, xu hướng thị trường và cơ hội bán hàng.',
    icon: <ReadOutlined />,
    createText: 'Thêm hoạt động thị trường',
    codeLabel: 'Mã hoạt động',
    typeLabel: 'Nhóm hoạt động',
    typeOptions: ['Sự kiện', 'Hội chợ', 'Kênh bán hàng', 'Khảo sát thị trường', 'Đối tác mới', 'Khác'],
    statusOptions: [
      { value: 'Planned', label: 'Đã lên kế hoạch', color: 'processing' },
      { value: 'InProgress', label: 'Đang triển khai', color: 'warning' },
      { value: 'Completed', label: 'Hoàn thành', color: 'success' },
      { value: 'Review', label: 'Cần đánh giá', color: 'purple' },
    ],
  },
  'customer-feedback': {
    title: 'Phản hồi khách hàng/đối tác',
    subtitle: 'Tiếp nhận, phân loại và xử lý ý kiến phản hồi về sản phẩm của hợp tác xã.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm phản hồi',
    codeLabel: 'Mã phản hồi',
    typeLabel: 'Loại phản hồi',
    typeOptions: ['Chất lượng sản phẩm', 'Bao gói', 'Giao hàng', 'Giá bán', 'Truy xuất nguồn gốc', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới tiếp nhận', color: 'warning' },
      { value: 'InProgress', label: 'Đang xử lý', color: 'processing' },
      { value: 'Review', label: 'Chờ phản hồi lại', color: 'purple' },
      { value: 'Completed', label: 'Đã xử lý', color: 'success' },
    ],
  },
  'product-finalization': {
    title: 'Hoàn thiện sản phẩm',
    subtitle: 'Theo dõi khâu sắp xếp, phân loại, đóng gói và chuẩn bị sản phẩm trước khi giao khách hàng.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm phiếu hoàn thiện',
    codeLabel: 'Mã phiếu',
    typeLabel: 'Công đoạn',
    typeOptions: ['Phân loại', 'Đóng gói', 'Dán tem QR', 'Kiểm tra bao bì', 'Bàn giao vận chuyển', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chờ thực hiện', color: 'warning' },
      { value: 'InProgress', label: 'Đang hoàn thiện', color: 'processing' },
      { value: 'Approved', label: 'Đạt yêu cầu', color: 'success' },
      { value: 'Rejected', label: 'Cần làm lại', color: 'error' },
    ],
  },
  'distribution-finance-requests': {
    title: 'Đối soát tài chính phân phối',
    subtitle: 'Ban phân phối lập đề nghị thu/chi, chi phí vận chuyển, đối soát đơn hàng để Kế toán ghi nhận thanh toán hoặc công nợ.',
    icon: <WalletOutlined />,
    createText: 'Thêm đề nghị đối soát',
    codeLabel: 'Mã đơn/chứng từ',
    typeLabel: 'Loại đối soát',
    typeOptions: ['Thu bán hàng', 'Chi vận chuyển', 'Chi đóng gói', 'Đối soát đơn hàng', 'Hoàn tiền', 'Công nợ nông hộ', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chờ kế toán xử lý', color: 'warning' },
      { value: 'Review', label: 'Cần đối soát', color: 'purple' },
      { value: 'Approved', label: 'Đã xác nhận', color: 'success' },
      { value: 'Paid', label: 'Đã thanh toán', color: 'blue' },
      { value: 'Rejected', label: 'Từ chối', color: 'error' },
    ],
  },
  'accounting-transactions': {
    title: 'Giao dịch tài chính',
    subtitle: 'Quản lý thu, chi, bán hàng, mua hàng, thanh toán và các nghiệp vụ tiền tệ của HTX.',
    icon: <WalletOutlined />,
    createText: 'Thêm giao dịch',
    codeLabel: 'Mã chứng từ',
    typeLabel: 'Loại giao dịch',
    typeOptions: ['Thu bán hàng', 'Chi mua hàng', 'Chi vật tư', 'Thanh toán', 'Nhập kho', 'Xuất kho', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chờ ghi nhận', color: 'warning' },
      { value: 'Approved', label: 'Đã ghi nhận', color: 'success' },
      { value: 'Paid', label: 'Đã thanh toán', color: 'blue' },
      { value: 'Rejected', label: 'Hủy/từ chối', color: 'error' },
    ],
  },
  'accounting-receivables': {
    title: 'Công nợ phải thu',
    subtitle: 'Theo dõi các khoản khách hàng, đối tác hoặc nông hộ còn phải thanh toán cho HTX.',
    icon: <WalletOutlined />,
    createText: 'Thêm khoản phải thu',
    codeLabel: 'Mã công nợ',
    typeLabel: 'Nguồn phải thu',
    typeOptions: ['Bán hàng', 'Đối tác', 'Nông hộ', 'Hỗ trợ vật tư', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chưa thu', color: 'warning' },
      { value: 'InProgress', label: 'Thu một phần', color: 'processing' },
      { value: 'Paid', label: 'Đã thu', color: 'success' },
      { value: 'Review', label: 'Cần đối soát', color: 'purple' },
    ],
  },
  'accounting-payables': {
    title: 'Công nợ phải trả',
    subtitle: 'Theo dõi khoản phải trả cho nhà cung cấp, nông hộ, vận chuyển và chi phí hoạt động.',
    icon: <WalletOutlined />,
    createText: 'Thêm khoản phải trả',
    codeLabel: 'Mã công nợ',
    typeLabel: 'Nguồn phải trả',
    typeOptions: ['Nhà cung cấp', 'Nông hộ', 'Vận chuyển', 'Lương/phụ cấp', 'Thuế/phí', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chưa trả', color: 'warning' },
      { value: 'InProgress', label: 'Trả một phần', color: 'processing' },
      { value: 'Paid', label: 'Đã trả', color: 'success' },
      { value: 'Review', label: 'Cần đối soát', color: 'purple' },
    ],
  },
  'accounting-reports': {
    title: 'Sổ sách & báo cáo tài chính',
    subtitle: 'Lưu báo cáo tài sản, lợi nhuận/lỗ, dòng tiền và các báo cáo tài chính nội bộ.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm báo cáo',
    codeLabel: 'Mã báo cáo',
    typeLabel: 'Loại báo cáo',
    typeOptions: ['Báo cáo tài sản', 'Lợi nhuận/lỗ', 'Dòng tiền', 'Tổng hợp thu chi', 'Khác'],
    statusOptions: [
      { value: 'Draft', label: 'Dự thảo', color: 'default' },
      { value: 'Review', label: 'Chờ xem xét', color: 'processing' },
      { value: 'Approved', label: 'Đã duyệt', color: 'success' },
      { value: 'Archived', label: 'Lưu trữ', color: 'blue' },
    ],
  },
  'tax-obligations': {
    title: 'Thuế & chi phí khác',
    subtitle: 'Theo dõi thủ tục thuế, phí, lệ phí và các khoản chi phí bắt buộc của HTX.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm nghĩa vụ thuế/phí',
    codeLabel: 'Mã hồ sơ',
    typeLabel: 'Loại nghĩa vụ',
    typeOptions: ['Thuế', 'Phí/lệ phí', 'Bảo hiểm', 'Chi phí hành chính', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Chưa thực hiện', color: 'warning' },
      { value: 'InProgress', label: 'Đang thực hiện', color: 'processing' },
      { value: 'Completed', label: 'Hoàn thành', color: 'success' },
      { value: 'Review', label: 'Cần bổ sung', color: 'purple' },
    ],
  },
  'financial-recommendations': {
    title: 'Khuyến nghị tài chính',
    subtitle: 'Ghi nhận nhận xét, cảnh báo và đề xuất cải thiện quản lý tài chính HTX.',
    icon: <AuditOutlined />,
    createText: 'Thêm khuyến nghị',
    codeLabel: 'Mã khuyến nghị',
    typeLabel: 'Nhóm khuyến nghị',
    typeOptions: ['Kiểm soát chi phí', 'Công nợ', 'Dòng tiền', 'Tồn kho/vật tư', 'Doanh thu', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới đề xuất', color: 'warning' },
      { value: 'Review', label: 'Chờ xem xét', color: 'processing' },
      { value: 'Approved', label: 'Chấp thuận', color: 'success' },
      { value: 'Completed', label: 'Đã áp dụng', color: 'blue' },
    ],
  },
  'farmer-reports': {
    title: 'Báo cáo sự cố từ nông dân',
    subtitle: 'Tiếp nhận báo cáo sâu bệnh, thời tiết, hư hỏng vật tư hoặc rủi ro sản xuất do nông dân gửi lên HTX.',
    icon: <ExperimentOutlined />,
    createText: 'Thêm ghi nhận',
    codeLabel: 'Mã báo cáo',
    typeLabel: 'Loại sự cố',
    typeOptions: ['Sâu bệnh', 'Thời tiết', 'Hư hỏng vật tư', 'Sự cố sản xuất', 'An toàn thực phẩm', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới tiếp nhận', color: 'warning' },
      { value: 'InProgress', label: 'Đang xử lý', color: 'processing' },
      { value: 'Review', label: 'Cần theo dõi lại', color: 'purple' },
      { value: 'Completed', label: 'Đã xử lý', color: 'success' },
      { value: 'Rejected', label: 'Không phù hợp', color: 'error' },
    ],
  },
  'farmer-suggestions': {
    title: 'Đề xuất chuyên môn từ nông dân',
    subtitle: 'Tiếp nhận ý kiến, đề xuất kỹ thuật, quy trình VietGAP và phản ánh chuyên môn từ thành viên/nông hộ.',
    icon: <AuditOutlined />,
    createText: 'Thêm đề xuất',
    codeLabel: 'Mã đề xuất',
    typeLabel: 'Nhóm đề xuất',
    typeOptions: ['Kỹ thuật trồng trọt', 'Quy trình VietGAP', 'Vật tư', 'Thu hoạch', 'Bảo quản', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới tiếp nhận', color: 'warning' },
      { value: 'Review', label: 'Đang xem xét', color: 'processing' },
      { value: 'Approved', label: 'Chấp thuận', color: 'success' },
      { value: 'InProgress', label: 'Đang triển khai', color: 'blue' },
      { value: 'Rejected', label: 'Không chấp thuận', color: 'error' },
    ],
  },
  'farmer-equipment-requests': {
    title: 'Đề nghị dụng cụ & bảo hộ',
    subtitle: 'Giám đốc HTX tiếp nhận đề nghị trang bị dụng cụ lao động, bảo hộ hoặc thiết bị cần thiết cho nông dân.',
    icon: <WalletOutlined />,
    createText: 'Thêm đề nghị',
    codeLabel: 'Mã đề nghị',
    typeLabel: 'Loại đề nghị',
    typeOptions: ['Dụng cụ lao động', 'Bảo hộ lao động', 'Thiết bị bảo quản', 'Vật tư hỗ trợ', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới tiếp nhận', color: 'warning' },
      { value: 'Review', label: 'Chờ Giám đốc xem xét', color: 'processing' },
      { value: 'Approved', label: 'Đã chấp thuận', color: 'success' },
      { value: 'InProgress', label: 'Đang cấp phát', color: 'blue' },
      { value: 'Completed', label: 'Đã cấp phát', color: 'success' },
      { value: 'Rejected', label: 'Từ chối', color: 'error' },
    ],
  },
  'farmer-duty-confirmations': {
    title: 'Xác nhận nhiệm vụ/tập huấn',
    subtitle: 'Theo dõi xác nhận của nông dân về tuần tra bảo vệ, tập huấn, nhiệm vụ HTX giao hoặc nội dung đã đọc.',
    icon: <FileDoneOutlined />,
    createText: 'Thêm xác nhận',
    codeLabel: 'Mã xác nhận',
    typeLabel: 'Loại xác nhận',
    typeOptions: ['Tuần tra bảo vệ', 'Tập huấn', 'Nhiệm vụ HTX', 'Xác nhận đã đọc', 'Khác'],
    statusOptions: [
      { value: 'Pending', label: 'Mới tiếp nhận', color: 'warning' },
      { value: 'Review', label: 'Chờ kiểm tra', color: 'processing' },
      { value: 'Approved', label: 'Đã xác nhận', color: 'success' },
      { value: 'Completed', label: 'Hoàn thành', color: 'blue' },
      { value: 'Rejected', label: 'Không hợp lệ', color: 'error' },
    ],
  },
};

const priorityOptions = [
  { value: 'Low', label: 'Thấp' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'High', label: 'Cao' },
  { value: 'Urgent', label: 'Khẩn cấp' },
];

const roleOptions = [
  { value: 'HTX_TECHNICAL', label: 'Ban kỹ thuật' },
  { value: 'HTX_DISTRIBUTION', label: 'Ban phân phối' },
  { value: 'HTX_ACCOUNTANT', label: 'Kế toán' },
  { value: 'HTX_SUPERVISOR', label: 'Ban kiểm soát' },
  { value: 'FARMER', label: 'Thành viên/nông hộ' },
];

const formatDate = (value) => value ? dayjs(value).format('DD/MM/YYYY') : '--';
const financialModules = ['finance', 'distribution-finance-requests', 'accounting-transactions', 'accounting-receivables', 'accounting-payables'];
const distributionFinanceProcessors = [ROLES.ADMIN, ROLES.HTX_DIRECTOR, ROLES.HTX_ACCOUNTANT];
const distributionFinanceCreators = [ROLES.ADMIN, ROLES.HTX_DIRECTOR, ROLES.HTX_DISTRIBUTION];
const attachmentEnabledModules = [
  'documents',
  'partners',
  'training',
  'technical-training',
  'pest-control',
  'product-inspections',
  'nonconformities',
  'material-supervision',
  'distribution-shipments',
  'customer-feedback',
  'product-finalization',
  'finance',
  'distribution-finance-requests',
  'accounting-transactions',
  'accounting-receivables',
  'accounting-payables',
  'accounting-reports',
  'tax-obligations',
];

const isImageAttachment = (file) => file?.type === 'image' || file?.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file?.url || file?.name || '');

const fileToAttachment = (file) => file?.attachment || file?.response?.attachment || {
  url: file.url || file.response?.url,
  name: file.name,
  type: isImageAttachment(file) ? 'image' : 'document',
  mimeType: file.type || file.mimeType || '',
  size: file.size || 0,
};

const HtxManagementModule = ({ moduleKey }) => {
  const { user } = useAuthStore();
  const config = moduleConfigs[moduleKey] || moduleConfigs.documents;
  const isFinancialModule = financialModules.includes(moduleKey);
  const normalizedRole = normalizeRole(user?.role);
  const isDistributionFinanceModule = moduleKey === 'distribution-finance-requests';
  const canProcessDistributionFinance = isDistributionFinanceModule && distributionFinanceProcessors.includes(normalizedRole);
  const canCreateRecord = !isDistributionFinanceModule || distributionFinanceCreators.includes(normalizedRole);
  const canModifyRecord = !isDistributionFinanceModule || distributionFinanceCreators.includes(normalizedRole);
  const [records, setRecords] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [processingRecord, setProcessingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [attachmentFileList, setAttachmentFileList] = useState([]);
  const [attachmentPreview, setAttachmentPreview] = useState({ open: false, url: '', title: '' });
  const [form] = Form.useForm();
  const [processForm] = Form.useForm();
  const canUseAttachments = attachmentEnabledModules.includes(moduleKey);

  const statusMap = useMemo(() => Object.fromEntries(config.statusOptions.map(item => [item.value, item])), [config.statusOptions]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/htx/management/${moduleKey}`);
      if (res.data.success) setRecords(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/htx/journals/farmers');
      if (res.data.success) setFarmers(res.data.data || []);
    } catch (error) {
      setFarmers([]);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchFarmers();
  }, [moduleKey]);

  const openCreate = () => {
    setEditingRecord(null);
    setAttachmentFileList([]);
    form.resetFields();
    form.setFieldsValue({
      priority: 'Medium',
      direction: isFinancialModule ? 'Expense' : 'None',
      status: config.statusOptions[0]?.value,
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setAttachmentFileList((record.attachments || []).map((attachment, index) => ({
      uid: attachment._id || `attachment-${index}`,
      name: attachment.name || `Tệp đính kèm ${index + 1}`,
      status: 'done',
      url: isImageAttachment(attachment) ? undefined : attachment.url,
      thumbUrl: isImageAttachment(attachment) ? attachment.url : undefined,
      type: attachment.mimeType || (attachment.type === 'image' ? 'image/*' : 'application/octet-stream'),
      size: attachment.size || 0,
      attachment,
    })));
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      dueDate: record.dueDate ? dayjs(record.dueDate) : null,
      farmerIds: record.farmerIds?.map(item => item._id || item) || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
      dueDate: values.dueDate?.toISOString(),
      attachments: canUseAttachments
        ? attachmentFileList.map(fileToAttachment).filter(item => item?.url)
        : [],
    };

    if (!isFinancialModule) {
      payload.direction = 'None';
      payload.amount = values.amount || 0;
    }

    if (editingRecord) {
      await api.put(`/htx/management/${moduleKey}/${editingRecord._id}`, payload);
      message.success('Đã cập nhật dữ liệu');
    } else {
      await api.post(`/htx/management/${moduleKey}`, payload);
      message.success('Đã lưu dữ liệu');
    }

    setModalOpen(false);
    setAttachmentFileList([]);
    fetchRecords();
  };

  const uploadAttachment = async ({ file, onSuccess, onError }) => {
    try {
      const isImage = file.type?.startsWith('image/');
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(isImage ? '/upload/image' : '/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = isImage
        ? { url: response.data.url, name: file.name, type: 'image', mimeType: file.type, size: file.size }
        : { url: response.data.data?.url, name: response.data.data?.filename || file.name, type: 'document', mimeType: file.type, size: response.data.data?.size || file.size };
      onSuccess({ attachment: uploaded, url: uploaded.url });
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải tệp lên Cloudinary');
      onError(error);
    }
  };

  const validateAttachment = (file) => {
    const isAllowedSize = file.size / 1024 / 1024 <= 10;
    if (!isAllowedSize) {
      message.error('Mỗi tệp đính kèm không được quá 10 MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleAttachmentChange = ({ fileList }) => {
    setAttachmentFileList(fileList.map(file => {
      const attachment = fileToAttachment(file);
      const isImage = isImageAttachment(attachment || file);
      return {
        ...file,
        url: isImage ? undefined : (attachment?.url || file.url),
        thumbUrl: isImage ? (attachment?.url || file.thumbUrl || file.url) : undefined,
        attachment,
      };
    }));
  };

  const handleAttachmentPreview = (file) => {
    const attachment = fileToAttachment(file);
    const url = attachment?.url || file.url || file.thumbUrl;
    if (!url) return;
    if (!isImageAttachment(attachment || file)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    setAttachmentPreview({
      open: true,
      url,
      title: attachment?.name || file.name || 'Ảnh đính kèm',
    });
  };

  const handleDelete = async (record) => {
    await api.delete(`/htx/management/${moduleKey}/${record._id}`);
    message.success('Đã xóa dữ liệu');
    fetchRecords();
  };

  const openProcess = (record) => {
    setProcessingRecord(record);
    processForm.resetFields();
    processForm.setFieldsValue({
      status: record.status === 'Paid' ? 'Paid' : 'Approved',
      targetModule: record.direction === 'Income' ? 'accounting-receivables' : 'accounting-payables',
      paymentStatus: record.status === 'Paid' ? 'Paid' : 'Pending',
    });
    setProcessModalOpen(true);
  };

  const handleProcessSubmit = async (values) => {
    if (!processingRecord) return;
    await api.post(`/htx/management/distribution-finance-requests/${processingRecord._id}/process`, values);
    message.success(values.targetModule ? 'Đã tạo bản ghi kế toán từ đối soát' : 'Đã cập nhật trạng thái đối soát');
    setProcessModalOpen(false);
    setProcessingRecord(null);
    fetchRecords();
  };

  const income = records.filter(r => r.direction === 'Income').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const expense = records.filter(r => r.direction === 'Expense').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const columns = [
    {
      title: 'Nội dung',
      key: 'title',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-gray-900">{record.title}</Text>
          <Text className="text-xs text-gray-400">{record.code || 'Chưa có mã'} · {record.documentType || 'Chưa phân loại'}</Text>
        </div>
      ),
    },
    moduleKey === 'partners' && {
      title: 'Đối tác',
      dataIndex: 'partnerName',
      width: 180,
      render: (value) => value || '--',
    },
    moduleKey === 'tasks' && {
      title: 'Phân công',
      width: 190,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text>{record.assignedToName || '--'}</Text>
          <Text className="text-xs text-gray-400">{roleOptions.find(r => r.value === record.assignedToRole)?.label || record.assignedToRole || '--'}</Text>
        </div>
      ),
    },
    isFinancialModule && {
      title: 'Giá trị',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Text strong className={record.direction === 'Income' ? 'text-green-600' : 'text-red-500'}>
          {record.direction === 'Income' ? '+' : '-'}{formatCurrencyVND(record.amount)}
        </Text>
      ),
    },
    {
      title: 'Nông dân liên quan',
      key: 'farmers',
      width: 190,
      render: (_, record) => {
        const linked = record.farmerIds || [];
        if (!linked.length) return <Text className="text-gray-400">Toàn HTX/nội bộ</Text>;
        return (
          <Space wrap size={[0, 4]}>
            <Tag color="green" className="rounded-full">{linked.length} nông dân</Tag>
          </Space>
        );
      },
    },
    canUseAttachments && {
      title: 'Đính kèm',
      key: 'attachments',
      width: 140,
      render: (_, record) => {
        const attachments = record.attachments || [];
        if (!attachments.length) return <Text className="text-gray-400">--</Text>;
        const images = attachments.filter(isImageAttachment);
        const documents = attachments.filter(item => !isImageAttachment(item));
        return (
          <Space size={4} wrap>
            {!!images.length && (
              <Image.PreviewGroup>
                {images.slice(0, 3).map((item, index) => (
                  <Image key={item.url || index} src={item.url} width={28} height={28} className="rounded-lg object-cover border" />
                ))}
              </Image.PreviewGroup>
            )}
            {!!documents.length && (
              <Tooltip title={documents.map(item => item.name || 'Tài liệu').join(', ')}>
                <Tag icon={<PaperClipOutlined />} className="rounded-full cursor-pointer" onClick={() => window.open(documents[0].url, '_blank')}>
                  {documents.length}
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        const item = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={item.color} className="rounded-full px-3">{item.label}</Tag>;
      },
    },
    {
      title: 'Hạn/ngày',
      key: 'date',
      width: 140,
      render: (_, record) => formatDate(record.dueDate || record.endDate || record.startDate),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: isDistributionFinanceModule ? 220 : 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          {canProcessDistributionFinance && (
            <Button size="small" type="primary" icon={<AuditOutlined />} onClick={() => openProcess(record)} className="rounded-lg">
              Xử lý
            </Button>
          )}
          {canModifyRecord && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} className="rounded-lg" />
          )}
          {canModifyRecord && (
            <Popconfirm title="Xóa dữ liệu này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record)}>
              <Button size="small" danger icon={<DeleteOutlined />} className="rounded-lg" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Quản trị điều hành HTX</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            {config.icon} {config.title}
          </Title>
          <Text className="text-gray-500">{config.subtitle}</Text>
        </div>
        {canCreateRecord && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="rounded-xl h-11 px-5">
            {config.createText}
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={isFinancialModule ? 6 : 8}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic title="Tổng số bản ghi" value={records.length} prefix={<FileTextOutlined className="text-green-600" />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={isFinancialModule ? 6 : 8}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic title="Đang xử lý" value={records.filter(r => ['Draft', 'Pending', 'InProgress', 'Review', 'Planned'].includes(r.status)).length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={isFinancialModule ? 6 : 8}>
          <Card className="rounded-2xl border-gray-100">
            <Statistic title="Hoàn tất/đã duyệt" value={records.filter(r => ['Approved', 'Completed', 'Paid', 'Archived'].includes(r.status)).length} />
          </Card>
        </Col>
        {isFinancialModule && (
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border-gray-100">
              <Statistic title="Chênh lệch thu chi" value={formatCurrencyVND(income - expense)} valueStyle={{ color: income - expense >= 0 ? '#16a34a' : '#ef4444' }} />
            </Card>
          </Col>
        )}
      </Row>

      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="_id"
          loading={loading}
          className="premium-table-refined"
          scroll={{ x: canUseAttachments ? 1040 : 900 }}
          pagination={{ pageSize: 10, showSizeChanger: true, locale: { items_per_page: '/ trang' } }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Cập nhật dữ liệu' : config.createText}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setAttachmentFileList([]); }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={760}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="Tiêu đề/nội dung" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                <Input placeholder="Nhập tiêu đề" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="code" label={config.codeLabel}>
                <Input placeholder="Mã/số hiệu" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="documentType" label={config.typeLabel}>
                <Select options={config.typeOptions.map(item => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={config.statusOptions.map(({ value, label }) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="Mức ưu tiên">
                <Select options={priorityOptions} />
              </Form.Item>
            </Col>
            {isFinancialModule && (
              <>
                <Col span={8}>
                  <Form.Item name="direction" label="Loại thu/chi" rules={[{ required: true }]}>
                    <Select options={[{ value: 'Income', label: 'Thu' }, { value: 'Expense', label: 'Chi' }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
                    <InputNumber
                      min={0}
                      className="w-full"
                      addonAfter="đ"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      parser={(value) => value?.replace(/\./g, '') || ''}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {moduleKey === 'partners' && (
              <Col span={8}>
                <Form.Item name="partnerName" label="Tên đối tác">
                  <Input placeholder="Tên đối tác" />
                </Form.Item>
              </Col>
            )}
            {(moduleKey === 'tasks' || moduleKey === 'training' || moduleKey === 'technical-training' || moduleKey === 'technical-proposals' || moduleKey === 'technical-reports' || moduleKey === 'distribution-finance-requests') && (
              <>
                <Col span={8}>
                  <Form.Item name="assignedToRole" label="Bộ phận phụ trách">
                    <Select allowClear options={roleOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="assignedToName" label="Người/nhóm phụ trách">
                    <Input placeholder="Tên người hoặc nhóm" />
                  </Form.Item>
                </Col>
              </>
            )}
            <Col span={8}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dueDate" label="Hạn xử lý">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="farmerIds" label="Nông dân/thành viên VietGAP liên quan">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Chọn nông dân để gửi thông báo và hiển thị ở tài khoản nông dân"
                  optionFilterProp="label"
                  options={farmers.map(farmer => ({
                    value: farmer._id,
                    label: `${farmer.fullname || farmer.username} - ${farmer.farmCode || farmer.username || ''}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="location" label="Địa điểm">
                <Input placeholder="Địa điểm thực hiện/lưu trữ" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Ghi chú/mô tả">
                <TextArea rows={4} placeholder="Nhập nội dung chi tiết" />
              </Form.Item>
            </Col>
            {canUseAttachments && (
              <Col span={24}>
                <Form.Item
                  label="Ảnh/tài liệu đính kèm"
                  extra="Ảnh hiển thị xem trước, tài liệu mở bằng liên kết Cloudinary. Hỗ trợ JPG, PNG, GIF, WebP, PDF, Word, Excel. Tối đa 10 tệp, mỗi tệp không quá 10 MB."
                >
                  <Upload
                    listType="picture-card"
                    fileList={attachmentFileList}
                    beforeUpload={validateAttachment}
                    customRequest={uploadAttachment}
                    onChange={handleAttachmentChange}
                    onPreview={handleAttachmentPreview}
                    maxCount={10}
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.xls,.xlsx"
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true,
                    }}
                  >
                    {attachmentFileList.length < 10 && (
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                        <PlusOutlined className="text-xl" />
                        <span className="text-xs font-semibold">Thêm tệp</span>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
      <Image
        src={attachmentPreview.url}
        alt={attachmentPreview.title}
        style={{ display: 'none' }}
        preview={{
          visible: attachmentPreview.open,
          src: attachmentPreview.url,
          onVisibleChange: (visible) => setAttachmentPreview(prev => ({ ...prev, open: visible })),
        }}
      />
      <Modal
        title="Xử lý đối soát phân phối"
        open={processModalOpen}
        onCancel={() => setProcessModalOpen(false)}
        onOk={() => processForm.submit()}
        okText="Xử lý"
        cancelText="Hủy"
        width={680}
        centered
      >
        <div className="mb-4 rounded-2xl border border-green-100 bg-green-50 p-4">
          <Text strong className="block">{processingRecord?.title}</Text>
          <Text className="text-gray-500 text-sm">
            {processingRecord?.documentType || 'Chưa phân loại'} · {processingRecord?.direction === 'Income' ? 'Thu' : 'Chi'} · {formatCurrencyVND(processingRecord?.amount)}
          </Text>
          {!!processingRecord?.farmerIds?.length && (
            <Tag color="green" className="mt-2 rounded-full">{processingRecord.farmerIds.length} nông dân liên quan</Tag>
          )}
        </div>
        <Form form={processForm} layout="vertical" onFinish={handleProcessSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Kết quả xử lý" rules={[{ required: true, message: 'Vui lòng chọn kết quả xử lý' }]}>
                <Select
                  options={[
                    { value: 'Review', label: 'Cần đối soát' },
                    { value: 'Approved', label: 'Đã xác nhận và tạo nghiệp vụ' },
                    { value: 'Paid', label: 'Đã thanh toán và tạo nghiệp vụ' },
                    { value: 'Rejected', label: 'Từ chối' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetModule" label="Tạo bản ghi sang">
                <Select
                  allowClear
                  placeholder="Không tạo nếu chỉ cần đối soát/từ chối"
                  options={[
                    { value: 'accounting-transactions', label: 'Giao dịch tài chính' },
                    { value: 'accounting-receivables', label: 'Công nợ phải thu' },
                    { value: 'accounting-payables', label: 'Công nợ phải trả' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paymentStatus" label="Trạng thái bản ghi kế toán">
                <Select
                  options={[
                    { value: 'Pending', label: 'Chờ xử lý/chưa thu trả' },
                    { value: 'Approved', label: 'Đã ghi nhận' },
                    { value: 'Paid', label: 'Đã thanh toán/đã thu' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="note" label="Ghi chú xử lý">
                <TextArea rows={4} placeholder="Nhập kết quả kiểm tra, lý do cần đối soát hoặc ghi chú thanh toán" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HtxManagementModule;

