/**
 * nationalPortalService.js
 * Service tích hợp với Cổng Thông Tin TXNG Quốc Gia
 * 
 * Lưu ý: API thực tế của cổng quốc gia (https://txng.gov.vn hoặc tương đương)
 * cần được cấu hình theo tài liệu kỹ thuật chính thức.
 * File này mô phỏng đúng luồng tích hợp chuẩn.
 */

const axios = require('axios');
const SyncLog = require('../models/SyncLog');

// Base URL cổng quốc gia (cấu hình qua env)
const PORTAL_BASE_URL = process.env.NATIONAL_PORTAL_URL || 'https://txng.gov.vn/api/v1';
const PORTAL_TIMEOUT = 15000; // 15 giây

/**
 * Tạo axios instance có auth header từ credentials của HTX
 */
const createPortalClient = (credentials) => {
  return axios.create({
    baseURL: PORTAL_BASE_URL,
    timeout: PORTAL_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Enterprise-Code': credentials.enterpriseCode,
      'X-Api-Key': credentials.apiKey,
      ...(credentials.apiSecret && { 'X-Api-Secret': credentials.apiSecret }),
    }
  });
};

/**
 * Lưu log đồng bộ
 */
const saveLog = async ({ entityType, entityId, performedBy, action, status, requestPayload, responseData, httpStatus, errorMessage, portalEndpoint, portalEntityId, retryCount = 0 }) => {
  try {
    const log = new SyncLog({
      entityType, entityId, performedBy, action, status,
      requestPayload, responseData, httpStatus, errorMessage,
      portalEndpoint, portalEntityId, retryCount
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('[SyncLog] Lỗi ghi log:', err.message);
  }
};

/**
 * Chuyển đổi dữ liệu Product sang format cổng quốc gia
 */
const mapProductToPortalFormat = (product, manufacturer) => {
  return {
    gtin: product.gtin,
    productName: product.name,
    productDescription: product.description || '',
    category: mapCategory(product.category),
    unit: product.unit || 'kg',
    weight: product.weight || null,
    manufacturer: {
      code: manufacturer.portalCredentials?.enterpriseCode,
      name: manufacturer.organization || manufacturer.fullname || manufacturer.username,
      province: manufacturer.province || '',
      ward: manufacturer.ward || '',
      address: manufacturer.address || '',
      phone: manufacturer.phone || ''
    },
    images: product.images || []
  };
};

/**
 * Chuyển đổi dữ liệu Batch + Journal sang format EPCIS Event của cổng quốc gia
 */
const mapBatchToPortalFormat = (batch, product, farmJournals = [], htxUser = null) => {
  // Tổng hợp sự kiện từ nhật ký nông dân
  const events = buildEPCISEvents(batch, farmJournals);

  return {
    batchCode: batch.batchCode,
    traceId: batch.traceId,
    gtin: product.gtin,
    productName: product.name,
    productionDate: batch.productionDate?.toISOString().split('T')[0], // YYYY-MM-DD
    expiryDate: batch.expiryDate?.toISOString().split('T')[0],
    quantity: batch.quantity,
    unit: batch.unit,
    productionLocation: batch.productionLocation || {},
    manufacturer: htxUser ? {
      code: htxUser.portalCredentials?.enterpriseCode,
      name: htxUser.organization || htxUser.fullname,
      province: htxUser.province,
      ward: htxUser.ward,
      address: htxUser.address
    } : null,
    events, // Danh sách EPCIS events (sự kiện chuỗi cung ứng)
    certifications: collectCertifications(farmJournals),
    notes: batch.notes || ''
  };
};

/**
 * Xây dựng danh sách EPCIS Events từ các nhật ký nông dân
 * Đây là phần cốt lõi của chuẩn EPCIS 2.0
 */
const buildEPCISEvents = (batch, farmJournals) => {
  const events = [];
  const epcUrn = `urn:epc:id:sgtin:${batch.batchCode}`;

  // Sự kiện thu hoạch / sản xuất
  if (batch.productionDate) {
    events.push({
      type: 'ObjectEvent',
      eventTime: batch.productionDate.toISOString(),
      epc: epcUrn,
      action: 'ADD',
      bizStep: 'urn:epcglobal:cbv:bizstep:commissioning', // Đưa vào lưu thông
      bizLocation: batch.productionLocation?.address || '',
      quantity: batch.quantity,
      unit: batch.unit,
      note: 'Lô hàng được tạo sau thu hoạch'
    });
  }

  // Sự kiện từ từng nhật ký nông dân (trồng trọt, chăm sóc, thu hoạch, v.v.)
  farmJournals.forEach(journal => {
    if (journal.entries && journal.status === 'Verified') {
      // Map entries thành sự kiện theo chuỗi thời gian
      const entryEvents = extractEventsFromEntries(journal.entries, epcUrn);
      events.push(...entryEvents);
    }
  });

  return events;
};

/**
 * Trích xuất sự kiện từ entries của FarmJournal
 * entries là dạng { tableName: { fieldName: value } }
 */
const extractEventsFromEntries = (entries, epcUrn) => {
  const events = [];
  
  // Map các bảng quan trọng trong nhật ký sang sự kiện EPCIS
  const bizStepMapping = {
    'thong_tin_chung': 'urn:epcglobal:cbv:bizstep:commissioning',
    'canh_tac': 'urn:epcglobal:cbv:bizstep:inspecting',
    'thu_hoach': 'urn:epcglobal:cbv:bizstep:harvesting',
    'so_che': 'urn:epcglobal:cbv:bizstep:receiving',
    'dong_goi': 'urn:epcglobal:cbv:bizstep:packing',
    'kiem_dinh': 'urn:epcglobal:cbv:bizstep:inspecting',
  };

  Object.keys(entries).forEach(tableName => {
    const tableData = entries[tableName];
    const bizStep = bizStepMapping[tableName] || 'urn:epcglobal:cbv:bizstep:inspecting';
    
    if (tableData && typeof tableData === 'object') {
      events.push({
        type: 'ObjectEvent',
        eventTime: tableData.ngay || tableData.date || new Date().toISOString(),
        epc: epcUrn,
        action: 'OBSERVE',
        bizStep,
        readPoint: tableData.dia_diem || tableData.location || '',
        extensions: tableData // Toàn bộ dữ liệu gốc làm extension
      });
    }
  });

  return events;
};

/**
 * Thu thập chứng nhận từ các nhật ký nông dân
 */
const collectCertifications = (farmJournals) => {
  const certs = [];
  farmJournals.forEach(journal => {
    if (journal.certifications && Array.isArray(journal.certifications)) {
      journal.certifications.forEach(cert => {
        certs.push({
          name: cert.name,
          issuer: cert.issuer,
          number: cert.number,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          fileUrl: cert.fileUrl
        });
      });
    }
  });
  return certs;
};

/**
 * Map category nội bộ sang category cổng quốc gia
 */
const mapCategory = (category) => {
  const map = {
    'trongtrot': 'CROP',
    'channuoi': 'LIVESTOCK',
    'thuysan': 'AQUACULTURE',
    'huuco': 'ORGANIC',
    'thucpham': 'FOOD',
    'khac': 'OTHER'
  };
  return map[category] || 'OTHER';
};

// ============================================================
// CÁC FUNCTION TÍCH HỢP CHÍNH
// ============================================================

/**
 * Đăng ký sản phẩm lên cổng quốc gia
 * @param {Object} product - Product document
 * @param {Object} manufacturer - User (HTX) document  
 * @param {ObjectId} performedBy - ID người thực hiện
 */
const registerProductToPortal = async (product, manufacturer, performedBy) => {
  const credentials = manufacturer.portalCredentials;
  if (!credentials?.apiKey || !credentials?.enterpriseCode) {
    throw new Error('HTX chưa cấu hình thông tin API cổng quốc gia');
  }

  const client = createPortalClient(credentials);
  const endpoint = '/products/register';
  const payload = mapProductToPortalFormat(product, manufacturer);

  try {
    const response = await client.post(endpoint, payload);
    
    await saveLog({
      entityType: 'Product', entityId: product._id, performedBy,
      action: 'RegisterProduct', status: 'Success',
      requestPayload: payload, responseData: response.data,
      httpStatus: response.status, portalEndpoint: endpoint,
      portalEntityId: response.data?.data?.productId || response.data?.id
    });

    return { success: true, portalProductId: response.data?.data?.productId, data: response.data };

  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    await saveLog({
      entityType: 'Product', entityId: product._id, performedBy,
      action: 'RegisterProduct', status: 'Failed',
      requestPayload: payload, responseData: error.response?.data,
      httpStatus: error.response?.status, errorMessage: errMsg,
      portalEndpoint: endpoint
    });
    return { success: false, error: errMsg };
  }
};

/**
 * Đồng bộ lô hàng lên cổng quốc gia
 * @param {Object} batch - ProductionBatch document (populated)
 * @param {Object} product - Product document
 * @param {Array} farmJournals - Mảng FarmJournal đã populate
 * @param {Object} htxUser - User (HTX) document
 * @param {ObjectId} performedBy - ID người thực hiện
 */
const syncBatchToPortal = async (batch, product, farmJournals, htxUser, performedBy) => {
  const credentials = htxUser.portalCredentials;
  if (!credentials?.apiKey || !credentials?.enterpriseCode) {
    throw new Error('HTX chưa cấu hình thông tin API cổng quốc gia');
  }

  // Kiểm tra sản phẩm đã đăng ký trên cổng chưa
  if (!product.portalProductId) {
    throw new Error('Sản phẩm chưa được đăng ký trên cổng quốc gia. Vui lòng đăng ký sản phẩm trước.');
  }

  const client = createPortalClient(credentials);
  const endpoint = '/batches/sync';
  const payload = mapBatchToPortalFormat(batch, product, farmJournals, htxUser);

  try {
    const response = await client.post(endpoint, payload);
    
    await saveLog({
      entityType: 'ProductionBatch', entityId: batch._id, performedBy,
      action: 'SyncBatch', status: 'Success',
      requestPayload: payload, responseData: response.data,
      httpStatus: response.status, portalEndpoint: endpoint,
      portalEntityId: response.data?.data?.batchId || response.data?.id
    });

    return { success: true, portalBatchId: response.data?.data?.batchId, data: response.data };

  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    
    await saveLog({
      entityType: 'ProductionBatch', entityId: batch._id, performedBy,
      action: 'SyncBatch', status: 'Failed',
      requestPayload: payload, responseData: error.response?.data,
      httpStatus: error.response?.status, errorMessage: errMsg,
      portalEndpoint: endpoint
    });
    return { success: false, error: errMsg };
  }
};

/**
 * Kiểm tra kết nối với cổng quốc gia bằng credentials của HTX
 */
const verifyPortalCredentials = async (credentials) => {
  const client = createPortalClient(credentials);
  try {
    const response = await client.get('/auth/verify');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      httpStatus: error.response?.status
    };
  }
};

module.exports = {
  registerProductToPortal,
  syncBatchToPortal,
  verifyPortalCredentials,
  mapBatchToPortalFormat,
  buildEPCISEvents
};
