import axios from 'axios';

// API nguồn chuẩn (GSO)
const LOCATION_API_BASE = 'https://provinces.open-api.vn/api';

// ĐƯỜNG DẪN API BẢN VÁ (PATCH DATA) - Bạn có thể thay bằng URL Server của bạn hoặc Github Gist
// File này sẽ chứa các thông tin sáp nhập mới nhất (ví dụ Phú Thọ, TP. Thủ Đức...)
const PATCH_DATA_URL = 'https://raw.githubusercontent.com/TranAnhBlue/EBookFarm-Data/main/location_patches.json';

// Biến lưu trữ dữ liệu bản vá sau khi kéo về
let cachedPatches = null;

/**
 * Hàm kéo dữ liệu sáp nhập mới nhất từ API/Github
 */
const fetchLocationPatches = async () => {
  if (cachedPatches) return cachedPatches;
  try {
    const response = await axios.get(PATCH_DATA_URL);
    cachedPatches = response.data;
    console.log('✅ Đã tải dữ liệu sáp nhập địa giới hành chính mới nhất.');
    return cachedPatches;
  } catch (error) {
    console.warn('⚠️ Không thể kéo dữ liệu sáp nhập từ xa, đang sử dụng dữ liệu mặc định.');
    // Dữ liệu dự phòng nếu không kéo được API
    return {
      wards: {
        '232': [
          { code: 'ts_01', name: 'Xã Thanh Sơn', fullName: 'Xã Thanh Sơn' },
          { code: 'ts_02', name: 'Xã Võ Miếu', fullName: 'Xã Võ Miếu' },
          { code: 'ts_03', name: 'Xã Văn Miếu', fullName: 'Xã Văn Miếu' },
          { code: 'ts_04', name: 'Xã Cự Đồng', fullName: 'Xã Cự Đồng' },
          { code: 'ts_05', name: 'Xã Hương Cần', fullName: 'Xã Hương Cần' },
          { code: 'ts_06', name: 'Xã Lương Nha', fullName: 'Xã Lương Nha' },
          { code: 'ts_07', name: 'Xã Khả Cửu', fullName: 'Xã Khả Cửu' }
        ]
      }
    };
  }
};

/**
 * Hàm hợp nhất dữ liệu API với dữ liệu sáp nhập
 */
const applyPatches = async (type, parentCode, originalData) => {
  const patches = await fetchLocationPatches();
  const currentPatches = patches[type]?.[parentCode.toString()] || [];
  
  if (currentPatches.length === 0) return originalData;

  const patchedData = [...originalData];
  currentPatches.forEach(patch => {
    const index = patchedData.findIndex(item => item.code.toString() === patch.code.toString());
    if (index !== -1) {
      patchedData[index] = { ...patchedData[index], ...patch };
    } else {
      patchedData.push(patch);
    }
  });
  return patchedData;
};

export const getProvinces = async () => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/`);
    return (response.data || []).map(p => ({
      code: p.code,
      name: p.name,
      fullName: p.full_name,
      codeName: p.code_name
    }));
  } catch (error) {
    return [];
  }
};

export const getDistrictsByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/${provinceCode}?depth=2`);
    const districts = (response.data?.districts || []).map(d => ({
      code: d.code,
      name: d.name,
      fullName: d.full_name
    }));
    return await applyPatches('districts', provinceCode, districts);
  } catch (error) {
    return [];
  }
};

export const getWardsByDistrict = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/d/${districtCode}?depth=2`);
    const wards = (response.data?.wards || []).map(w => ({
      code: w.code,
      name: w.name,
      fullName: w.full_name
    }));
    return await applyPatches('wards', districtCode, wards);
  } catch (error) {
    return [];
  }
};

export const checkMergeWarning = (provinceName, districtName) => {
  if (provinceName?.includes('Hồ Chí Minh')) {
    const oldDistricts = ['Quận 2', 'Quận 9', 'Quận Thủ Đức'];
    if (oldDistricts.includes(districtName)) {
      return {
        type: 'warning',
        message: `${districtName} đã được sáp nhập vào TP. Thủ Đức.`
      };
    }
  }
  return null;
};
