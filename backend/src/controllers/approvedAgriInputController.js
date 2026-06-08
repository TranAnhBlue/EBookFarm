const xlsx = require('xlsx');
const axios = require('axios');
const { PDFParse } = require('pdf-parse');
const ApprovedAgriInput = require('../models/ApprovedAgriInput');
const { createLog } = require('./logController');
const { ROLES, normalizeRole, isAdminRole, getHtxOwnerId } = require('../utils/roles');

const canManageAgriInputs = (role) => {
  const normalized = normalizeRole(role);
  return isAdminRole(role) || [ROLES.HTX_DIRECTOR, ROLES.HTX_TECHNICAL].includes(normalized);
};

const getScopeFilter = (req) => {
  if (isAdminRole(req.user.role)) return {};
  return {
    $or: [
      { scope: 'GLOBAL' },
      { scope: 'HTX', htxId: getHtxOwnerId(req.user) },
    ],
  };
};

const normalizeStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (['SUSPENDED', 'TAM_DUNG', 'TẠM DỪNG', 'TAM DUNG'].includes(normalized)) return 'SUSPENDED';
  if (['EXPIRED', 'HET_HIEU_LUC', 'HẾT HIỆU LỰC', 'HET HIEU LUC'].includes(normalized)) return 'EXPIRED';
  return 'ALLOWED';
};

const normalizeType = (value) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('phan') || text.includes('phân') || text.includes('fert')) return 'FERTILIZER';
  return 'PESTICIDE';
};

const parseDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const firstValue = (row, names) => {
  const entries = Object.entries(row || {});
  const found = entries.find(([key]) => names.some(name => String(key).trim().toLowerCase() === name));
  if (found) return found[1];
  const fuzzy = entries.find(([key]) => {
    const normalizedKey = String(key).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return names.some(name => normalizedKey.includes(name));
  });
  return fuzzy?.[1];
};

const mapImportedRow = (row, fallbackType) => ({
  type: normalizeType(firstValue(row, ['loai', 'type']) || fallbackType),
  tradeName: String(firstValue(row, ['ten thuong mai', 'tên thương mại', 'ten vat tu', 'tên vật tư', 'trade name', 'tradeName']) || '').trim(),
  activeIngredient: String(firstValue(row, ['hoat chat', 'hoạt chất', 'active ingredient', 'activeIngredient']) || '').trim(),
  registrationNo: String(firstValue(row, ['so dang ky', 'số đăng ký', 'registration no', 'registrationNo']) || '').trim(),
  manufacturer: String(firstValue(row, ['nha san xuat', 'nhà sản xuất', 'manufacturer']) || '').trim(),
  category: String(firstValue(row, ['nhom', 'nhóm', 'category']) || '').trim(),
  cropName: String(firstValue(row, ['cay trong', 'cây trồng', 'crop', 'cropName']) || '').trim(),
  targetPest: String(firstValue(row, ['doi tuong', 'đối tượng', 'sau benh', 'sâu bệnh', 'target']) || '').trim(),
  dosage: String(firstValue(row, ['lieu luong', 'liều lượng', 'dosage']) || '').trim(),
  phiDays: Number(firstValue(row, ['cach ly', 'cách ly', 'phi', 'phiDays']) || 0),
  status: normalizeStatus(firstValue(row, ['trang thai', 'trạng thái', 'status'])),
  legalDocumentNo: String(firstValue(row, ['van ban', 'văn bản', 'legal document', 'legalDocumentNo']) || '').trim(),
  version: String(firstValue(row, ['phien ban', 'phiên bản', 'version']) || '').trim(),
  sourceUrl: String(firstValue(row, ['nguon', 'nguồn', 'source', 'sourceUrl']) || '').trim(),
  notes: String(firstValue(row, ['ghi chu', 'ghi chú', 'notes']) || '').trim(),
  legalDocumentDate: parseDate(firstValue(row, ['ngay van ban', 'ngày văn bản', 'legalDocumentDate'])),
  effectiveFrom: parseDate(firstValue(row, ['hieu luc tu', 'hiệu lực từ', 'effectiveFrom'])),
  effectiveTo: parseDate(firstValue(row, ['hieu luc den', 'hiệu lực đến', 'effectiveTo'])),
});

const FORMULATION_PATTERN = /(?:\d+(?:[.,]\d+)?\s*)?(?:EC|EW|SC|SL|WP|WG|GR|DP|ME|OD|SP|AS|FS|CS|SE|ULV|WSC|BR|RB|TB|G|H|L|P)\b/gi;
const OFFICIAL_PPD_SOURCE_URL = 'https://ppd.gov.vn/FileUpload/Documents/Thuoc%20BVTV/25.12.30_PL%201%20-%20Danh%20m%E1%BB%A5c%20%C4%91%C6%B0%E1%BB%A3c%20ph%C3%A9p%20s%E1%BB%AD%20d%E1%BB%A5ng.pdf';

const isHeaderOrSectionLine = (line) => (
  !line
  || /^TT$/i.test(line)
  || /^HOẠT CHẤT/i.test(line)
  || /^THUỐC BẢO VỆ/i.test(line)
  || /^TÊN THƯƠNG PHẨM/i.test(line)
  || /^ĐỐI TƯỢNG PHÒNG TRỪ/i.test(line)
  || /^TỔ CHỨC ĐỀ NGHỊ/i.test(line)
  || /^DANH MỤC/i.test(line)
  || /^Phụ lục/i.test(line)
  || /^\(COMMON NAME\)/i.test(line)
  || /^\(TRADE NAME\)/i.test(line)
  || /^\(PEST\/ CROP\)/i.test(line)
  || /^\(APPLICANT\)/i.test(line)
  || /^[IVX]+\./i.test(line)
  || /^\d+\.\s/.test(line)
);

const cleanPdfLine = (line) => String(line || '').replace(/\s+/g, ' ').trim();

const splitTradeAndTarget = (line) => {
  const matches = [...line.matchAll(FORMULATION_PATTERN)];
  if (!matches.length) return null;
  const lastMatch = matches[matches.length - 1];
  const end = lastMatch.index + lastMatch[0].length;
  const tradeName = line.slice(0, end).trim();
  let targetPest = line.slice(end).trim();
  let applicant = '';
  const applicantIndex = targetPest.search(/\b(Công ty|Cty|TNHH|CP|MTV|Ltd|Co\.|Corporation|JSC|Pte)\b/i);
  if (applicantIndex > 8) {
    applicant = targetPest.slice(applicantIndex).trim();
    targetPest = targetPest.slice(0, applicantIndex).trim();
  }
  return { tradeName, targetPest, applicant };
};

const parsePpdPdfText = (text) => {
  const lines = String(text || '').split(/\r?\n/).map(cleanPdfLine).filter(Boolean);
  const rows = [];
  let currentActiveIngredient = '';
  let currentCategory = '';

  for (const rawLine of lines) {
    const line = cleanPdfLine(rawLine);
    if (isHeaderOrSectionLine(line)) {
      if (/thuốc trừ|thuốc xử lý|thuốc bảo quản|thuốc khử trùng|thuốc sử dụng/i.test(line)) {
        currentCategory = line.replace(/^\d+\.\s*/, '').replace(/:$/, '').trim();
      }
      continue;
    }

    const activeMatch = line.match(/^(\d{1,5})\s+(.+)$/);
    if (activeMatch && !FORMULATION_PATTERN.test(activeMatch[2])) {
      currentActiveIngredient = activeMatch[2].replace(/\(.*?\)/g, '').trim();
      FORMULATION_PATTERN.lastIndex = 0;
      continue;
    }
    FORMULATION_PATTERN.lastIndex = 0;

    if (!currentActiveIngredient) continue;
    const parsed = splitTradeAndTarget(line);
    FORMULATION_PATTERN.lastIndex = 0;
    if (!parsed || parsed.tradeName.length < 3) continue;

    rows.push({
      type: 'PESTICIDE',
      tradeName: parsed.tradeName,
      activeIngredient: currentActiveIngredient,
      targetPest: parsed.targetPest,
      manufacturer: parsed.applicant,
      category: currentCategory || 'Thuốc BVTV được phép sử dụng',
      status: 'ALLOWED',
      legalDocumentNo: 'Thông tư 75/2025/TT-BNNMT',
      version: 'Danh mục thuốc BVTV được phép sử dụng tại Việt Nam 2025',
      sourceUrl: OFFICIAL_PPD_SOURCE_URL,
    });
  }

  const unique = new Map();
  rows.forEach(row => {
    const key = `${ApprovedAgriInput.normalizeText(row.tradeName)}|${ApprovedAgriInput.normalizeText(row.activeIngredient)}`;
    if (!unique.has(key)) unique.set(key, row);
  });
  return [...unique.values()];
};

const chunkArray = (items, size = 1000) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const buildPayload = (req, body) => {
  const roleIsAdmin = isAdminRole(req.user.role);
  const scope = roleIsAdmin && body.scope === 'GLOBAL' ? 'GLOBAL' : 'HTX';
  return {
    type: body.type,
    scope,
    htxId: scope === 'HTX' ? getHtxOwnerId(req.user) : undefined,
    tradeName: body.tradeName,
    activeIngredient: body.activeIngredient,
    registrationNo: body.registrationNo,
    manufacturer: body.manufacturer,
    category: body.category,
    cropName: body.cropName,
    targetPest: body.targetPest,
    dosage: body.dosage,
    phiDays: Number(body.phiDays || 0),
    status: body.status || 'ALLOWED',
    legalDocumentNo: body.legalDocumentNo,
    legalDocumentDate: parseDate(body.legalDocumentDate),
    effectiveFrom: parseDate(body.effectiveFrom),
    effectiveTo: parseDate(body.effectiveTo),
    sourceUrl: body.sourceUrl,
    sourceFileUrl: body.sourceFileUrl,
    version: body.version,
    notes: body.notes,
    updatedBy: req.user._id,
  };
};

const listApprovedAgriInputs = async (req, res) => {
  try {
    if (!canManageAgriInputs(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem danh mục vật tư được phép.' });
    }

    const query = { ...getScopeFilter(req) };
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.q) {
      const normalized = ApprovedAgriInput.normalizeText(req.query.q);
      query.$and = [{
        $or: [
          { normalizedTradeName: { $regex: normalized, $options: 'i' } },
          { normalizedActiveIngredient: { $regex: normalized, $options: 'i' } },
          { registrationNo: { $regex: req.query.q, $options: 'i' } },
        ],
      }];
    }

    const items = await ApprovedAgriInput.find(query)
      .populate('createdBy updatedBy', 'fullname username')
      .sort({ type: 1, tradeName: 1 });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveApprovedAgriInput = async (req, res) => {
  try {
    if (!canManageAgriInputs(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật danh mục vật tư được phép.' });
    }

    const payload = buildPayload(req, req.body);
    let item;
    if (req.params.id) {
      item = await ApprovedAgriInput.findOneAndUpdate(
        { ...getScopeFilter(req), _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );
      if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy vật tư.' });
    } else {
      item = await ApprovedAgriInput.create({ ...payload, createdBy: req.user._id });
    }

    await createLog(req.user._id, req.params.id ? 'Cập nhật danh mục vật tư được phép' : 'Thêm vật tư được phép', item._id, 'ApprovedAgriInput', {
      type: item.type,
      tradeName: item.tradeName,
    });

    res.status(req.params.id ? 200 : 201).json({ success: true, data: item });
  } catch (error) {
    const isDuplicate = error.code === 11000;
    res.status(isDuplicate ? 409 : 500).json({
      success: false,
      message: isDuplicate ? 'Vật tư này đã tồn tại trong danh mục.' : error.message,
    });
  }
};

const deleteApprovedAgriInput = async (req, res) => {
  try {
    if (!canManageAgriInputs(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa vật tư.' });
    }
    const item = await ApprovedAgriInput.findOneAndDelete({ ...getScopeFilter(req), _id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy vật tư.' });
    await createLog(req.user._id, 'Xóa vật tư được phép', item._id, 'ApprovedAgriInput', { tradeName: item.tradeName });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const importApprovedAgriInputs = async (req, res) => {
  try {
    if (!canManageAgriInputs(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền nhập danh mục vật tư.' });
    }

    let rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    if (!rows.length && req.body.fileBase64) {
      const buffer = Buffer.from(String(req.body.fileBase64).replace(/^data:.*;base64,/, ''), 'base64');
      const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
      rows = workbook.SheetNames.flatMap(sheetName => xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' }));
    }

    const fallbackType = req.body.type || 'PESTICIDE';
    const payloads = rows.map(row => mapImportedRow(row, fallbackType)).filter(row => row.tradeName);
    let created = 0;
    let updated = 0;
    const errors = [];

    for (const row of payloads) {
      try {
        const payload = buildPayload(req, {
          ...row,
          scope: req.body.scope,
          sourceUrl: req.body.sourceUrl || row.sourceUrl,
          sourceFileUrl: req.body.sourceFileUrl,
        });
        const filter = {
          type: payload.type,
          scope: payload.scope,
          htxId: payload.htxId,
          normalizedTradeName: ApprovedAgriInput.normalizeText(payload.tradeName),
          registrationNo: payload.registrationNo || '',
        };
        const existing = await ApprovedAgriInput.findOne(filter);
        if (existing) {
          Object.assign(existing, payload);
          await existing.save();
          updated += 1;
        } else {
          await ApprovedAgriInput.create({ ...payload, createdBy: req.user._id });
          created += 1;
        }
      } catch (error) {
        errors.push({ tradeName: row.tradeName, message: error.message });
      }
    }

    await createLog(req.user._id, 'Nhập danh mục vật tư được phép', null, 'ApprovedAgriInput', { created, updated, errors: errors.length });
    res.json({ success: true, data: { created, updated, skipped: errors.length, errors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const importOfficialPpdPdf = async (req, res) => {
  try {
    if (!canManageAgriInputs(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền nhập danh mục thuốc BVTV.' });
    }

    const sourceUrl = String(req.body.sourceUrl || OFFICIAL_PPD_SOURCE_URL).trim();
    const sourceFileUrl = req.body.sourceFileUrl;
    const response = await axios.get(sourceUrl, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxRedirects: 5,
      headers: {
        Accept: 'application/pdf,*/*',
        'User-Agent': 'EBookFarm/1.0 PDF Importer',
      },
    });

    const parser = new PDFParse({ data: Buffer.from(response.data) });
    let parsedPdf;
    try {
      parsedPdf = await parser.getText();
    } finally {
      await parser.destroy();
    }
    const rows = parsePpdPdfText(parsedPdf.text || '').map(row => ({ ...row, sourceUrl, sourceFileUrl }));
    if (!rows.length) {
      return res.status(422).json({
        success: false,
        message: 'Không đọc được dòng thuốc BVTV hợp lệ từ PDF nguồn. Vui lòng nhập bằng Excel/CSV hoặc kiểm tra lại PDF.',
      });
    }

    let created = 0;
    let updated = 0;
    const errors = [];

    const operations = rows.map(row => {
      const payload = buildPayload(req, { ...row, scope: req.body.scope || 'HTX' });
      const normalizedTradeName = ApprovedAgriInput.normalizeText(payload.tradeName);
      const normalizedActiveIngredient = ApprovedAgriInput.normalizeText(payload.activeIngredient);
      return {
        updateOne: {
          filter: {
            type: payload.type,
            scope: payload.scope,
            htxId: payload.htxId,
            normalizedTradeName,
            normalizedActiveIngredient,
          },
          update: {
            $set: {
              ...payload,
              normalizedTradeName,
              normalizedActiveIngredient,
              updatedBy: req.user._id,
            },
            $setOnInsert: {
              createdBy: req.user._id,
            },
          },
          upsert: true,
        },
      };
    });

    for (const batch of chunkArray(operations)) {
      try {
        const result = await ApprovedAgriInput.bulkWrite(batch, { ordered: false });
        created += result.upsertedCount || 0;
        updated += result.modifiedCount || 0;
      } catch (error) {
        created += error.result?.result?.nUpserted || error.result?.upsertedCount || 0;
        updated += error.result?.result?.nModified || error.result?.modifiedCount || 0;
        const writeErrors = error.writeErrors || error.result?.result?.writeErrors || [];
        if (writeErrors.length) {
          writeErrors.slice(0, 50).forEach(writeError => {
            const failedOperation = batch[writeError.index];
            errors.push({
              tradeName: failedOperation?.updateOne?.update?.$set?.tradeName || 'Không xác định',
              message: writeError.errmsg || writeError.message || error.message,
            });
          });
        } else {
          errors.push({ tradeName: 'Import PDF', message: error.message });
        }
      }
    }

    await createLog(req.user._id, 'Nhập danh mục thuốc BVTV từ PDF Cục BVTV', null, 'ApprovedAgriInput', {
      created,
      updated,
      errors: errors.length,
      sourceUrl,
    });

    res.json({
      success: true,
      data: {
        created,
        updated,
        skipped: errors.length,
        totalParsed: rows.length,
        errors: errors.slice(0, 30),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Không thể nhập danh mục từ PDF Cục BVTV.' });
  }
};

const validateApprovedAgriInput = async (req, res) => {
  try {
    const normalizedTradeName = ApprovedAgriInput.normalizeText(req.body.tradeName);
    const normalizedActiveIngredient = ApprovedAgriInput.normalizeText(req.body.activeIngredient);
    const query = {
      ...getScopeFilter(req),
      type: req.body.type || 'PESTICIDE',
      status: 'ALLOWED',
      $or: [
        normalizedTradeName ? { normalizedTradeName } : null,
        normalizedActiveIngredient ? { normalizedActiveIngredient } : null,
        req.body.registrationNo ? { registrationNo: req.body.registrationNo } : null,
      ].filter(Boolean),
    };
    const item = query.$or.length ? await ApprovedAgriInput.findOne(query) : null;
    res.json({
      success: true,
      data: {
        ok: !!item,
        item,
        message: item ? 'Vật tư nằm trong danh mục được phép.' : 'Chưa tìm thấy vật tư trong danh mục được phép.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listApprovedAgriInputs,
  saveApprovedAgriInput,
  deleteApprovedAgriInput,
  importApprovedAgriInputs,
  importOfficialPpdPdf,
  validateApprovedAgriInput,
};
