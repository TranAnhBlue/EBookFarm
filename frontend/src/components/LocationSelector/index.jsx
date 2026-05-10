import React, { useState, useEffect } from 'react';
import { Select, Spin, Input, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { getProvinces, getWardsByProvince } from 'src/services/LocationService';

const { Option } = Select;
const { Text } = Typography;

/**
 * Component chá»n Ä‘á»‹a phÆ°Æ¡ng Viá»‡t Nam (sau sÃ¡p nháº­p 07/2025)
 * Cáº¥u trÃºc má»›i: Tá»‰nh/ThÃ nh phá»‘ â†’ PhÆ°á»ng/XÃ£ (bá» cáº¥p Quáº­n/Huyá»‡n)
 *
 * @param {Object} props
 * @param {Object} props.value  - { province, ward, detailAddress }
 * @param {Function} props.onChange
 * @param {boolean} props.disabled
 */
const LocationSelector = ({ value = {}, onChange, disabled = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load danh sÃ¡ch tá»‰nh/thÃ nh
  useEffect(() => {
    const fetch = async () => {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data);
      setLoadingProvinces(false);
    };
    fetch();
  }, []);

  // Load phÆ°á»ng/xÃ£ khi chá»n tá»‰nh
  useEffect(() => {
    const fetch = async () => {
      if (selectedProvinceCode) {
        setLoadingWards(true);
        const data = await getWardsByProvince(selectedProvinceCode);
        setWards(data);
        setLoadingWards(false);
      } else {
        setWards([]);
      }
    };
    fetch();
  }, [selectedProvinceCode]);

  const handleProvinceChange = (val, option) => {
    setSelectedProvinceCode(option.code);
    setWards([]);
    onChange?.({
      ...value,
      province: option.name,
      ward: null,
    });
  };

  const handleWardChange = (val, option) => {
    onChange?.({
      ...value,
      ward: option.name,
    });
  };

  const handleDetailChange = (e) => {
    onChange?.({
      ...value,
      detailAddress: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tá»‰nh / ThÃ nh phá»‘ */}
        <div className="flex flex-col gap-2">
          <Text className="text-gray-600 font-medium">Tá»‰nh/ThÃ nh phá»‘</Text>
          <Select
            placeholder="Chá»n tá»‰nh/thÃ nh phá»‘"
            value={value.province || undefined}
            onChange={handleProvinceChange}
            showSearch
            disabled={disabled}
            loading={loadingProvinces}
            notFoundContent={loadingProvinces ? <Spin size="small" /> : 'KhÃ´ng tÃ¬m tháº¥y'}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            className="h-12 rounded-xl"
          >
            {provinces.map((p) => (
              <Option value={p.name} key={p.code} code={p.code} name={p.name}>
                {p.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* PhÆ°á»ng / XÃ£ (trá»±c tiáº¿p tá»« tá»‰nh, khÃ´ng qua huyá»‡n) */}
        <div className="flex flex-col gap-2">
          <Text className="text-gray-600 font-medium">
            PhÆ°á»ng/XÃ£
            {!selectedProvinceCode && (
              <span className="text-gray-400 text-xs font-normal ml-1">(chá»n tá»‰nh trÆ°á»›c)</span>
            )}
          </Text>
          <Select
            placeholder="Chá»n phÆ°á»ng/xÃ£"
            value={value.ward || undefined}
            onChange={handleWardChange}
            showSearch
            disabled={disabled || !selectedProvinceCode}
            loading={loadingWards}
            notFoundContent={loadingWards ? <Spin size="small" /> : 'KhÃ´ng tÃ¬m tháº¥y'}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            className="h-12 rounded-xl"
          >
            {wards.map((w) => (
              <Option value={w.name} key={w.code} code={w.code} name={w.name}>
                {w.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Äá»‹a chá»‰ chi tiáº¿t */}
      <div className="flex flex-col gap-2">
        <Text className="text-gray-600 font-medium">Äá»‹a chá»‰ chi tiáº¿t</Text>
        <Input
          prefix={<EnvironmentOutlined className="text-gray-400" />}
          placeholder="Sá»‘ nhÃ , tÃªn Ä‘Æ°á»ng, thÃ´n/xÃ³m..."
          value={value.detailAddress}
          onChange={handleDetailChange}
          disabled={disabled}
          className="h-12 rounded-xl border-gray-200 hover:border-green-400 focus:border-green-500 transition-all"
        />
      </div>
    </div>
  );
};

export default LocationSelector;

