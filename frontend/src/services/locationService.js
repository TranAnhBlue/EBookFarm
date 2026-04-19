import axios from 'axios';

// API địa phương Việt Nam cập nhật mới nhất
// Sử dụng API từ danhmuchanhchinh.gso.gov.vn (Tổng cục Thống kê)
const LOCATION_API_BASE = 'https://provinces.open-api.vn/api';

// Backup: Nếu API chính không hoạt động, dùng API dự phòng
const BACKUP_API = 'https://vapi.vnappmob.com/api/province';

/**
 * Lấy danh sách tất cả tỉnh/thành phố
 * @returns {Promise<Array>} Danh sách tỉnh/thành
 */
export const getProvinces = async () => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/`);
    return response.data.map(province => ({
      code: province.code,
      name: province.name,
      nameEn: province.name_en,
      fullName: province.full_name,
      fullNameEn: province.full_name_en,
      codeName: province.code_name
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    // Fallback to backup API
    try {
      const backupResponse = await axios.get(BACKUP_API);
      return backupResponse.data.results.map(province => ({
        code: province.province_id,
        name: province.province_name,
        nameEn: province.province_name,
        fullName: province.province_name,
        fullNameEn: province.province_name,
        codeName: province.province_id
      }));
    } catch (backupError) {
      console.error('Backup API also failed:', backupError);
      return [];
    }
  }
};

/**
 * Lấy danh sách quận/huyện theo tỉnh/thành
 * @param {number} provinceCode - Mã tỉnh/thành
 * @returns {Promise<Array>} Danh sách quận/huyện
 */
export const getDistrictsByProvince = async (provinceCode) => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/${provinceCode}?depth=2`);
    return response.data.districts.map(district => ({
      code: district.code,
      name: district.name,
      nameEn: district.name_en,
      fullName: district.full_name,
      fullNameEn: district.full_name_en,
      codeName: district.code_name
    }));
  } catch (error) {
    console.error('Error fetching districts:', error);
    // Fallback to backup API
    try {
      const backupResponse = await axios.get(`${BACKUP_API}/district/${provinceCode}`);
      return backupResponse.data.results.map(district => ({
        code: district.district_id,
        name: district.district_name,
        nameEn: district.district_name,
        fullName: district.district_name,
        fullNameEn: district.district_name,
        codeName: district.district_id
      }));
    } catch (backupError) {
      console.error('Backup API also failed:', backupError);
      return [];
    }
  }
};

/**
 * Lấy danh sách phường/xã theo quận/huyện
 * @param {number} districtCode - Mã quận/huyện
 * @returns {Promise<Array>} Danh sách phường/xã
 */
export const getWardsByDistrict = async (districtCode) => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/d/${districtCode}?depth=2`);
    return response.data.wards.map(ward => ({
      code: ward.code,
      name: ward.name,
      nameEn: ward.name_en,
      fullName: ward.full_name,
      fullNameEn: ward.full_name_en,
      codeName: ward.code_name
    }));
  } catch (error) {
    console.error('Error fetching wards:', error);
    // Fallback to backup API
    try {
      const backupResponse = await axios.get(`${BACKUP_API}/ward/${districtCode}`);
      return backupResponse.data.results.map(ward => ({
        code: ward.ward_id,
        name: ward.ward_name,
        nameEn: ward.ward_name,
        fullName: ward.ward_name,
        fullNameEn: ward.ward_name,
        codeName: ward.ward_id
      }));
    } catch (backupError) {
      console.error('Backup API also failed:', backupError);
      return [];
    }
  }
};

/**
 * Tìm kiếm tỉnh/thành theo tên
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách tỉnh/thành phù hợp
 */
export const searchProvinces = async (keyword) => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/search/?q=${keyword}`);
    return response.data;
  } catch (error) {
    console.error('Error searching provinces:', error);
    return [];
  }
};

/**
 * Lấy thông tin chi tiết tỉnh/thành
 * @param {number} provinceCode - Mã tỉnh/thành
 * @returns {Promise<Object>} Thông tin chi tiết
 */
export const getProvinceDetail = async (provinceCode) => {
  try {
    const response = await axios.get(`${LOCATION_API_BASE}/p/${provinceCode}?depth=3`);
    return response.data;
  } catch (error) {
    console.error('Error fetching province detail:', error);
    return null;
  }
};

/**
 * Dữ liệu sáp nhập mới (2021-2024)
 * Cập nhật thủ công các thay đổi mới nhất
 */
export const getUpdatedLocations = () => {
  return {
    // TP.HCM: Sáp nhập Quận 2, 9, Thủ Đức cũ thành TP. Thủ Đức (01/01/2021)
    '79': {
      name: 'Hồ Chí Minh',
      updates: [
        {
          type: 'merge',
          date: '2021-01-01',
          description: 'Thành lập TP. Thủ Đức từ Quận 2, Quận 9, Quận Thủ Đức',
          newDistrict: 'Thành phố Thủ Đức',
          oldDistricts: ['Quận 2', 'Quận 9', 'Quận Thủ Đức']
        }
      ]
    },
    // Hà Nội: Sáp nhập một số xã vào quận (2019-2023)
    '01': {
      name: 'Hà Nội',
      updates: [
        {
          type: 'expand',
          date: '2019-12-01',
          description: 'Mở rộng địa giới hành chính các quận nội thành'
        }
      ]
    }
  };
};

/**
 * Kiểm tra và cảnh báo về sáp nhập
 * @param {string} provinceName - Tên tỉnh
 * @param {string} districtName - Tên quận/huyện
 * @returns {Object|null} Thông tin cảnh báo nếu có
 */
export const checkMergeWarning = (provinceName, districtName) => {
  const updates = getUpdatedLocations();
  
  // Kiểm tra TP.HCM
  if (provinceName === 'Hồ Chí Minh' || provinceName === 'TP. Hồ Chí Minh') {
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

