import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { getProvinces, getDistrictsByProvince, getWardsByDistrict } from '../services/locationService';

const { Option } = Select;

/**
 * Component chọn địa phương Việt Nam (Tỉnh/Thành - Quận/Huyện - Phường/Xã)
 * @param {Object} props
 * @param {Object} props.value - Giá trị hiện tại { province, district, ward }
 * @param {Function} props.onChange - Callback khi thay đổi
 * @param {boolean} props.disabled - Disable toàn bộ
 */
const LocationSelector = ({ value = {}, onChange, disabled = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load danh sách tỉnh/thành
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data);
      setLoadingProvinces(false);
    };
    fetchProvinces();
  }, []);

  // Load districts khi chọn province
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvinceCode) {
        setLoadingDistricts(true);
        const data = await getDistrictsByProvince(selectedProvinceCode);
        setDistricts(data);
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Load wards khi chọn district
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrictCode) {
        setLoadingWards(true);
        const data = await getWardsByDistrict(selectedDistrictCode);
        setWards(data);
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  const handleProvinceChange = (val, option) => {
    setSelectedProvinceCode(option.code);
    setDistricts([]);
    setWards([]);
    setSelectedDistrictCode(null);
    
    onChange?.({
      province: option.name,
      district: null,
      ward: null
    });
  };

  const handleDistrictChange = (val, option) => {
    setSelectedDistrictCode(option.code);
    setWards([]);
    
    onChange?.({
      province: value.province,
      district: option.name,
      ward: null
    });
  };

  const handleWardChange = (val, option) => {
    onChange?.({
      province: value.province,
      district: value.district,
      ward: option.name
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        placeholder="Chọn tỉnh/thành phố"
        value={value.province}
        onChange={handleProvinceChange}
        showSearch
        disabled={disabled}
        loading={loadingProvinces}
        notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy'}
        filterOption={(input, option) =>
          (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
        }
        className="h-11"
      >
        {provinces.map((province) => (
          <Option 
            value={province.name} 
            key={province.code}
            code={province.code}
            name={province.name}
          >
            {province.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Chọn quận/huyện"
        value={value.district}
        onChange={handleDistrictChange}
        showSearch
        disabled={disabled || !selectedProvinceCode}
        loading={loadingDistricts}
        notFoundContent={loadingDistricts ? <Spin size="small" /> : 'Không tìm thấy'}
        filterOption={(input, option) =>
          (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
        }
        className="h-11"
      >
        {districts.map((district) => (
          <Option 
            value={district.name} 
            key={district.code}
            code={district.code}
            name={district.name}
          >
            {district.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Chọn phường/xã"
        value={value.ward}
        onChange={handleWardChange}
        showSearch
        disabled={disabled || !selectedDistrictCode}
        loading={loadingWards}
        notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy'}
        filterOption={(input, option) =>
          (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
        }
        className="h-11"
      >
        {wards.map((ward) => (
          <Option 
            value={ward.name} 
            key={ward.code}
            code={ward.code}
            name={ward.name}
          >
            {ward.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default LocationSelector;
