import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VietGAPHouseholds() {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [formData, setFormData] = useState({
    tenHo: '',
    maSoNongHo: '',
    dienTich: '',
    thon: '',
    xuDong: '',
    xa: '',
    huyen: '',
    tinh: '',
    soDienThoai: '',
    email: '',
    loaiHinh: 'Cây trồng',
    cayTrong: [],
    ghiChu: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/vietgap-households`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 }
      });
      setHouseholds(response.data.data || []);
    } catch (error) {
      console.error('Error fetching households:', error);
      alert('Lỗi khi tải danh sách hộ sản xuất');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        dienTich: parseFloat(formData.dienTich),
        cayTrong: formData.cayTrong.filter(c => c.trim())
      };

      if (editingHousehold) {
        await axios.put(
          `${API_URL}/api/vietgap-households/${editingHousehold._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Cập nhật hộ sản xuất thành công');
      } else {
        await axios.post(
          `${API_URL}/api/vietgap-households`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Tạo hộ sản xuất thành công');
      }

      setShowModal(false);
      setEditingHousehold(null);
      resetForm();
      fetchHouseholds();
    } catch (error) {
      console.error('Error saving household:', error);
      alert(error.response?.data?.message || 'Lỗi khi lưu hộ sản xuất');
    }
  };

  const handleEdit = (household) => {
    setEditingHousehold(household);
    setFormData({
      tenHo: household.tenHo || '',
      maSoNongHo: household.maSoNongHo || '',
      dienTich: household.dienTich || '',
      thon: household.thon || '',
      xuDong: household.xuDong || '',
      xa: household.xa || '',
      huyen: household.huyen || '',
      tinh: household.tinh || '',
      soDienThoai: household.soDienThoai || '',
      email: household.email || '',
      loaiHinh: household.loaiHinh || 'Cây trồng',
      cayTrong: household.cayTrong || [],
      ghiChu: household.ghiChu || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hộ này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/vietgap-households/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Xóa hộ sản xuất thành công');
      fetchHouseholds();
    } catch (error) {
      console.error('Error deleting household:', error);
      alert('Lỗi khi xóa hộ sản xuất');
    }
  };

  const resetForm = () => {
    setFormData({
      tenHo: '',
      maSoNongHo: '',
      dienTich: '',
      thon: '',
      xuDong: '',
      xa: '',
      huyen: '',
      tinh: '',
      soDienThoai: '',
      email: '',
      loaiHinh: 'Cây trồng',
      cayTrong: [],
      ghiChu: ''
    });
  };

  const filteredHouseholds = households.filter(h =>
    h.tenHo.toLowerCase().includes(search.toLowerCase()) ||
    h.maSoNongHo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách hộ sản xuất VietGAP</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingHousehold(null);
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Thêm hộ mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hộ hoặc mã số..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hộ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã số nông hộ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diện tích (m²)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại hình</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHouseholds.map((household, index) => (
              <tr key={household._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-sm font-medium">{household.tenHo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{household.maSoNongHo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{household.dienTich?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  {[household.thon, household.xuDong, household.xa].filter(Boolean).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{household.loaiHinh}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(household)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(household._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHouseholds.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingHousehold ? 'Cập nhật hộ sản xuất' : 'Thêm hộ sản xuất mới'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tên hộ */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên hộ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tenHo}
                      onChange={(e) => setFormData({ ...formData, tenHo: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Mã số nông hộ */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mã số nông hộ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.maSoNongHo}
                      onChange={(e) => setFormData({ ...formData, maSoNongHo: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Diện tích */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Diện tích (m²) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.dienTich}
                      onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Loại hình */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại hình</label>
                    <select
                      value={formData.loaiHinh}
                      onChange={(e) => setFormData({ ...formData, loaiHinh: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="Cây trồng">Cây trồng</option>
                      <option value="Chăn nuôi">Chăn nuôi</option>
                      <option value="Thủy sản">Thủy sản</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  {/* Thôn */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Thôn</label>
                    <input
                      type="text"
                      value={formData.thon}
                      onChange={(e) => setFormData({ ...formData, thon: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Xứ đồng */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Xứ đồng</label>
                    <input
                      type="text"
                      value={formData.xuDong}
                      onChange={(e) => setFormData({ ...formData, xuDong: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Xã */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Xã</label>
                    <input
                      type="text"
                      value={formData.xa}
                      onChange={(e) => setFormData({ ...formData, xa: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Huyện */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Huyện</label>
                    <input
                      type="text"
                      value={formData.huyen}
                      onChange={(e) => setFormData({ ...formData, huyen: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Tỉnh */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Tỉnh</label>
                    <input
                      type="text"
                      value={formData.tinh}
                      onChange={(e) => setFormData({ ...formData, tinh: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border rounded"
                  ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingHousehold(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {editingHousehold ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
