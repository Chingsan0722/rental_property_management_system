import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PackageRentalFormProps {
  caseId: string | null;
  onClose: () => void;
}

export default function PackageRentalForm({ caseId, onClose }: PackageRentalFormProps) {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [formData, setFormData] = useState({
    case_address: '',
    owner_name: '',
    owner_phone: '',
    owner_id_number: '',
    property_type: '',
    layout: '',
    area: '',
    monthly_rent: '0',
    contract_start_date: '',
    contract_end_date: '',
    contract_years: '3',
    deposit: '0',
    status: '洽談中',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const fetchCase = async () => {
    try {
      const { data, error } = await supabase
        .from('package_rental_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;

      setFormData({
        case_address: data.case_address,
        owner_name: data.owner_name,
        owner_phone: data.owner_phone || '',
        owner_id_number: data.owner_id_number || '',
        property_type: data.property_type || '',
        layout: data.layout || '',
        area: data.area?.toString() || '',
        monthly_rent: data.monthly_rent.toString(),
        contract_start_date: data.contract_start_date || '',
        contract_end_date: data.contract_end_date || '',
        contract_years: data.contract_years.toString(),
        deposit: data.deposit.toString(),
        status: data.status,
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching case:', error);
      alert('載入案件失敗');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        case_address: formData.case_address,
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone || null,
        owner_id_number: formData.owner_id_number || null,
        property_type: formData.property_type || null,
        layout: formData.layout || null,
        area: formData.area ? Number(formData.area) : null,
        monthly_rent: Number(formData.monthly_rent),
        contract_start_date: formData.contract_start_date || null,
        contract_end_date: formData.contract_end_date || null,
        contract_years: Number(formData.contract_years),
        deposit: Number(formData.deposit),
        status: formData.status,
        notes: formData.notes || null,
      };

      if (caseId) {
        const { error } = await supabase
          .from('package_rental_cases')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', caseId);

        if (error) throw error;
        alert('案件已更新');
      } else {
        const { error } = await supabase
          .from('package_rental_cases')
          .insert([{
            ...dataToSave,
            user_id: userId,
          }]);

        if (error) throw error;
        alert('案件已新增');
      }

      onClose();
    } catch (error) {
      console.error('Error saving case:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
        <h3 className="text-2xl font-bold text-gray-900">
          {caseId ? '編輯包租案件' : '新增包租案件'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-lg font-semibold text-gray-700 mb-2">案件地址 *</label>
            <input
              type="text"
              required
              value={formData.case_address}
              onChange={(e) => handleInputChange('case_address', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">屋主名稱 *</label>
            <input
              type="text"
              required
              value={formData.owner_name}
              onChange={(e) => handleInputChange('owner_name', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">屋主電話</label>
            <input
              type="tel"
              value={formData.owner_phone}
              onChange={(e) => handleInputChange('owner_phone', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">屋主身分證字號</label>
            <input
              type="text"
              value={formData.owner_id_number}
              onChange={(e) => handleInputChange('owner_id_number', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">物件類型</label>
            <input
              type="text"
              value={formData.property_type}
              onChange={(e) => handleInputChange('property_type', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例：公寓、華廈、大樓"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">格局</label>
            <input
              type="text"
              value={formData.layout}
              onChange={(e) => handleInputChange('layout', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例：2房1廳1衛"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">坪數</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">每月租金 *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.monthly_rent}
              onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">押金</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.deposit}
              onChange={(e) => handleInputChange('deposit', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">合約年數 *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.contract_years}
              onChange={(e) => handleInputChange('contract_years', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">合約開始日</label>
            <input
              type="date"
              value={formData.contract_start_date}
              onChange={(e) => handleInputChange('contract_start_date', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">合約結束日</label>
            <input
              type="date"
              value={formData.contract_end_date}
              onChange={(e) => handleInputChange('contract_end_date', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">狀態 *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="洽談中">洽談中</option>
              <option value="已簽約">已簽約</option>
              <option value="已終止">已終止</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-semibold text-gray-700 mb-2">備註</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 text-lg border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? '儲存中...' : '儲存'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
