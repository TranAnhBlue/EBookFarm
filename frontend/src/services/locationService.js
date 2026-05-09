import axios from 'axios';

/**
 * API v2 — Dữ liệu sau sáp nhập tỉnh thành 07/2025
 * Sau sáp nhập: cấp huyện bị bãi bỏ → Tỉnh/TP → Xã/Phường trực tiếp
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
 * Lấy danh sách tỉnh/thành phố (sau sáp nhập, còn 34 tỉnh)
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
 * Lấy danh sách phường/xã theo tỉnh (sau sáp nhập, không còn cấp huyện)
 * API v2 trả về `wards` trực tiếp từ province với depth=2
 * @param {number|string} provinceCode
 * @returns {Array<{ code, name, fullName, divisionType }>}
 */
export const getWardsByProvince = (provinceCode) => {
  if (!provinceCode) return Promise.resolve([]);
  return cached(`wards_${provinceCode}`, async () => {
    try {
      const { data } = await axios.get(`${LOCATION_API}/p/${provinceCode}?depth=2`);
      return (data?.wards || []).map(w => ({
        code: w.code,
        name: w.name,
        fullName: w.full_name || w.name,
        divisionType: w.division_type, // 'phường' | 'xã' | 'thị trấn'
      }));
    } catch {
      return [];
    }
  });
};

// Giữ lại để không breaking change nếu có nơi dùng API cũ
export const getDistrictsByProvince = () => Promise.resolve([]);
export const getWardsByDistrict = () => Promise.resolve([]);
export const checkMergeWarning = () => null;
