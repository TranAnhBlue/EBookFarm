/**
 * Component: Dropdown chọn hộ sản xuất VietGAP
 * Tự động điền các trường: Tên hộ, Diện tích hộ, Mã số nông hộ
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function HouseholdSelector({ 
  value,
  onChange,
  onSelect,
  disabled = false,
  className = ''
}) {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/vietgap-households/dropdown`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHouseholds(response.data.data || []);
    } catch (error) {
      console.error('Error fetching households:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const selectedId = e.target.value;
    
    if (onChange) {
      onChange(selectedId);
    }

    if (onSelect && selectedId) {
      const household = households.find(h => h._id === selectedId);
      if (household) {
        onSelect(household);
      }
    }
  };

  if (loading) {
    return (
      <select disabled className={className}>
        <option>Đang tải...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    >
      <option value="">-- Chọn hộ sản xuất --</option>
      {households.map((household) => (
        <option key={household._id} value={household._id}>
          {household.tenHo} - {household.maSoNongHo}
        </option>
      ))}
    </select>
  );
}
