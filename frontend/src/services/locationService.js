import axios from 'axios';

// API địa phương Việt Nam cập nhật mới nhất (Bản v1 ổn định đầy đủ 3 cấp)
const LOCATION_API_BASE = 'https://provinces.open-api.vn/api';

// Backup: Nếu API chính không hoạt động, dùng API dự phòng
const BACKUP_API = 'https://vapi.vnappmob.com/api/province';

/**
 * Dữ liệu sáp nhập mới nhất (Cập nhật 2024-2025)
 * Dùng để bổ sung hoặc thay thế dữ liệu API khi chưa kịp cập nhật
 */
const LOCATION_PATCHES = {
  // Ví dụ: Phú Thọ (Mã 25)
  districts: {
    '25': [
      // { code: 'new_01', name: 'Huyện Mới Sáp Nhập', fullName: 'Huyện Mới Sáp Nhập' }
    ]
  },
  wards: {
    // TP. Thủ Đức (Mã 760) - Đảm bảo đầy đủ các phường sau sáp nhập
    '760': [
      { code: '26734', name: 'Phường An Khánh', fullName: 'Phường An Khánh' },
      { code: '26743', name: 'Phường Thủ Thiêm', fullName: 'Phường Thủ Thiêm' }
    ]
  }
};

/**
 * Hàm bổ sung dữ liệu sáp nhập vào kết quả từ API
 */
const patchLocationData = (type, parentCode, originalData) => {
  const patches = LOCATION_PATCHES[type]?.[parentCode.toString()] || [];
  if (patches.length === 0) return originalData;

  // Hợp nhất dữ liệu, ưu tiên dữ liệu mới từ Patch nếu trùng Code
  const patchedData = [...originalData];
  patches.forEach(patch => {
    const index = patchedData.findIndex(item => item.code.toString() === patch.code.toString());
    if (index !== -1) {
      patchedData[index] = { ...patchedData[index], ...patch };
    } else {
      patchedData.push(patch);
    }
  });
  return patchedData;
};

/**
 * Lấy danh sách tất cả tỉnh/thành phố
 */
export const getProvinces = async () => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/`);
    return (response.data || []).map(province => ({
      code: province.code,
      name: province.name,
      fullName: province.full_name,
      codeName: province.code_name
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    try {
      const backupResponse = await axios.get(BACKUP_API);
      return (backupResponse.data?.results || []).map(p => ({
        code: p.province_id,
        name: p.province_name,
        fullName: p.province_name,
        codeName: p.province_id
      }));
    } catch (backupError) {
      return [];
    }
  }
};

/**
 * Lấy danh sách quận/huyện theo tỉnh/thành
 */
export const getDistrictsByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/${provinceCode}?depth=2`);
    const districts = (response.data?.districts || []).map(d => ({
      code: d.code,
      name: d.name,
      fullName: d.full_name,
      codeName: d.code_name
    }));
    return patchLocationData('districts', provinceCode, districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    try {
      // VAPI uses province_id directly in the path
      const backupResponse = await axios.get(`https://vapi.vnappmob.com/api/province/district/${provinceCode}`);
      const districts = (backupResponse.data?.results || []).map(d => ({
        code: d.district_id,
        name: d.district_name,
        fullName: d.district_name,
        codeName: d.district_id
      }));
      return patchLocationData('districts', provinceCode, districts);
    } catch (backupError) {
      return [];
    }
  }
};

/**
 * Lấy danh sách phường/xã theo quận/huyện
 */
export const getWardsByDistrict = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/d/${districtCode}?depth=2`);
    const wards = (response.data?.wards || []).map(w => ({
      code: w.code,
      name: w.name,
      fullName: w.full_name,
      codeName: w.code_name
    }));
    return patchLocationData('wards', districtCode, wards);
  } catch (error) {
    console.error('Error fetching wards:', error);
    try {
      const backupResponse = await axios.get(`https://vapi.vnappmob.com/api/province/ward/${districtCode}`);
      const wards = (backupResponse.data?.results || []).map(w => ({
        code: w.ward_id,
        name: w.ward_name,
        fullName: w.ward_name,
        codeName: w.ward_id
      }));
      return patchLocationData('wards', districtCode, wards);
    } catch (backupError) {
      return [];
    }
  }
};

/**
 * Kiểm tra và cảnh báo về sáp nhập (Helper)
 */
export const checkMergeWarning = (provinceName, districtName) => {
  if (provinceName?.includes('Hồ Chí Minh')) {
    const oldDistricts = ['Quận 2', 'Quận 9', 'Quận Thủ Đức'];
    if (oldDistricts.includes(districtName)) {
      return {
        type: 'warning',
        message: `${districtName} đã được sáp nhập vào TP. Thủ Đức từ 01/01/2021. Vui lòng chọn "Thành phố Thủ Đức".`
      };
    }
  }
  return null;
};
