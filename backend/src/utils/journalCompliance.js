const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const includesAny = (value, keywords) => {
  const text = normalizeText(value);
  return keywords.some(keyword => text.includes(normalizeText(keyword)));
};

const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const flattenEntryRows = (entries = {}) => {
  const rows = [];
  Object.entries(entries || {}).forEach(([tableName, tableValue]) => {
    const values = Array.isArray(tableValue) ? tableValue : [tableValue];
    values.filter(Boolean).forEach(row => rows.push({ tableName, row }));
  });
  return rows;
};

const getFieldValueByKeywords = (row, keywords) => {
  const foundKey = Object.keys(row || {}).find(key => includesAny(key, keywords));
  return foundKey ? row[foundKey] : undefined;
};

const collectComplianceFacts = (entries = {}) => {
  const rows = flattenEntryRows(entries);
  const pesticideEvents = [];
  const fertilizerEvents = [];
  const harvestEvents = [];

  rows.forEach(({ tableName, row }) => {
    const joined = `${tableName} ${Object.keys(row || {}).join(' ')} ${Object.values(row || {}).join(' ')}`;
    const dateValue = getFieldValueByKeywords(row, ['ngay', 'date', 'thoi gian', 'time']);
    const date = parseDate(dateValue);

    if (includesAny(joined, ['thuoc', 'bvtv', 'bao ve thuc vat', 'phun', 'pesticide', 'hoat chat', 'cach ly'])) {
      pesticideEvents.push({
        tableName,
        date,
        tradeName: getFieldValueByKeywords(row, ['ten thuoc', 'thuoc', 'ten vat tu', 'trade', 'commercial']) || '',
        activeIngredient: getFieldValueByKeywords(row, ['hoat chat', 'active']) || '',
        registrationNo: getFieldValueByKeywords(row, ['so dang ky', 'registration']) || '',
        phiDays: Number(getFieldValueByKeywords(row, ['cach ly', 'phi', 'preharvest']) || 0),
      });
    }

    if (includesAny(joined, ['phan bon', 'phan', 'fertilizer', 'bon goc', 'bon la'])) {
      fertilizerEvents.push({
        tableName,
        date,
        tradeName: getFieldValueByKeywords(row, ['ten phan', 'phan bon', 'ten vat tu', 'trade']) || '',
        activeIngredient: getFieldValueByKeywords(row, ['thanh phan', 'hoat chat', 'active']) || '',
        registrationNo: getFieldValueByKeywords(row, ['so dang ky', 'registration']) || '',
      });
    }

    if (includesAny(joined, ['thu hoach', 'harvest', 'san luong'])) {
      harvestEvents.push({ tableName, date });
    }
  });

  return { pesticideEvents, fertilizerEvents, harvestEvents };
};

const findApprovedInput = async ({ type, tradeName, activeIngredient, registrationNo, htxId }) => {
  const ApprovedAgriInput = require('../models/ApprovedAgriInput');
  const normalizedTradeName = ApprovedAgriInput.normalizeText(tradeName);
  const normalizedActiveIngredient = ApprovedAgriInput.normalizeText(activeIngredient);
  const or = [
    normalizedTradeName ? { normalizedTradeName } : null,
    normalizedActiveIngredient ? { normalizedActiveIngredient } : null,
    registrationNo ? { registrationNo } : null,
  ].filter(Boolean);

  if (!or.length) return null;

  return ApprovedAgriInput.findOne({
    type,
    status: 'ALLOWED',
    $or: [
      { scope: 'GLOBAL' },
      ...(htxId ? [{ scope: 'HTX', htxId }] : []),
    ],
    $and: [{ $or: or }],
  }).lean();
};

const validatePreHarvestInterval = (entries = {}) => {
  const { pesticideEvents, fertilizerEvents, harvestEvents } = collectComplianceFacts(entries);
  const warnings = [];
  const blockers = [];

  pesticideEvents.forEach(event => {
    if (!event.date) {
      warnings.push('Có ghi nhận thuốc BVTV nhưng chưa xác định được ngày sử dụng.');
      return;
    }

    const phiDays = Number(event.phiDays || 0);
    if (!phiDays) {
      warnings.push(`Thuốc BVTV ${event.tradeName || event.activeIngredient || 'chưa đặt tên'} chưa có số ngày cách ly.`);
      return;
    }

    harvestEvents.forEach(harvest => {
      if (!harvest.date) return;
      const diffDays = Math.floor((harvest.date.getTime() - event.date.getTime()) / DAY_MS);
      if (diffDays >= 0 && diffDays < phiDays) {
        blockers.push(`Thời gian cách ly chưa đạt: thu hoạch sau ${diffDays} ngày, yêu cầu tối thiểu ${phiDays} ngày.`);
      }
    });
  });

  return {
    ok: blockers.length === 0,
    warnings: [...new Set(warnings)],
    blockers: [...new Set(blockers)],
    facts: { pesticideEvents, fertilizerEvents, harvestEvents },
  };
};

const validateJournalAgainstApprovedInputs = async (entries = {}, htxId) => {
  const { pesticideEvents, fertilizerEvents, harvestEvents } = collectComplianceFacts(entries);
  const warnings = [];
  const blockers = [];

  for (const event of pesticideEvents) {
    const approved = await findApprovedInput({ type: 'PESTICIDE', ...event, htxId });
    const name = event.tradeName || event.activeIngredient || event.registrationNo || 'chưa đặt tên';

    if (!approved) {
      blockers.push(`Thuốc BVTV "${name}" chưa nằm trong danh mục được phép.`);
      continue;
    }

    if (!event.date) {
      warnings.push(`Thuốc BVTV "${name}" chưa xác định được ngày sử dụng.`);
      continue;
    }

    const phiDays = Number(event.phiDays || approved.phiDays || 0);
    if (!phiDays) {
      warnings.push(`Thuốc BVTV "${approved.tradeName || name}" chưa có số ngày cách ly trong danh mục.`);
      continue;
    }

    harvestEvents.forEach(harvest => {
      if (!harvest.date) return;
      const diffDays = Math.floor((harvest.date.getTime() - event.date.getTime()) / DAY_MS);
      if (diffDays >= 0 && diffDays < phiDays) {
        blockers.push(`Thuốc "${approved.tradeName || name}" chưa đủ cách ly: thu hoạch sau ${diffDays} ngày, yêu cầu tối thiểu ${phiDays} ngày.`);
      }
    });
  }

  for (const event of fertilizerEvents) {
    const approved = await findApprovedInput({ type: 'FERTILIZER', ...event, htxId });
    const name = event.tradeName || event.activeIngredient || event.registrationNo || 'chưa đặt tên';
    if (!approved) {
      warnings.push(`Phân bón/vật tư "${name}" chưa được đối chiếu trong danh mục được phép.`);
    }
  }

  return {
    ok: blockers.length === 0,
    warnings: [...new Set(warnings)],
    blockers: [...new Set(blockers)],
    facts: { pesticideEvents, fertilizerEvents, harvestEvents },
  };
};

module.exports = {
  collectComplianceFacts,
  validatePreHarvestInterval,
  validateJournalAgainstApprovedInputs,
};
