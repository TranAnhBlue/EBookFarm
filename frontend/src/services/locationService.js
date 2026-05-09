import axios from 'axios';

/**
 * API v2 — Dữ liệu sau sáp nhập tỉnh thành 07/2025
 * Docs: https://provinces.open-api.vn/
 */
const LOCATION_API = 'https://provinces.open-api.vn/api/v2';

// ── Simple in-memory cache ──────────────────────────────────────────────────
const cache = {};
const cached = async (key, fetcher) => {
  if (cache[key]) return cache[key];
  cache[key] = await fetcher();
  return cache[key];
};
// ───────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách tỉnh/thành phố (sau sáp nhập)
 * @returns {Array<{ code, name, fullName }>}
 */
export const getProvinces = () =>
  cached('provinces', async () => {
    try {
      const { data } = await axios.get(`${LOCATION_API}/p/`);
      return (data || []).map(p => ({
        code: p.code,
        name: p.name,
        fullName: p.full_name || p.name,
      }));
    } catch {
      return [];
    }
  });

/**
 * Lấy danh sách quận/huyện theo tỉnh (sau sáp nhập)
 * @param {number|string} provinceCode
 * @returns {Array<{ code, name, fullName }>}
 */
export const getDistrictsByProvince = (provinceCode) => {
  if (!provinceCode) return Promise.resolve([]);
  return cached(`districts_${provinceCode}`, async () => {
    try {
      const { data } = await axios.get(`${LOCATION_API}/p/${provinceCode}?depth=2`);
      return (data?.districts || []).map(d => ({
        code: d.code,
        name: d.name,
        fullName: d.full_name || d.name,
      }));
    } catch {
      return [];
    }
  });
};

/**
 * Lấy danh sách phường/xã theo quận/huyện (sau sáp nhập)
 * @param {number|string} districtCode
 * @returns {Array<{ code, name, fullName }>}
 */
export const getWardsByDistrict = (districtCode) => {
  if (!districtCode) return Promise.resolve([]);
  return cached(`wards_${districtCode}`, async () => {
    try {
      const { data } = await axios.get(`${LOCATION_API}/d/${districtCode}?depth=2`);
      return (data?.wards || []).map(w => ({
        code: w.code,
        name: w.name,
        fullName: w.full_name || w.name,
      }));
    } catch {
      return [];
    }
  });
};

// Giữ lại export này để tránh lỗi nếu có nơi nào đó import
export const checkMergeWarning = () => null;
