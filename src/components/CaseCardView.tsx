import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AutocompleteInput } from './AutocompleteInput';

type CaseType = 'package' | 'management' | 'agency';
const db = supabase as any;

interface CaseData {
  id?: string;
  case_number?: string;
  case_address: string;
  manager_name?: string;
  owner_name: string;
  owner_phone?: string;
  owner_id_number?: string;
  monthly_rent: number;
  [key: string]: any;
}

interface CaseCardViewProps {
  caseType: CaseType;
  title: string;
}

export default function CaseCardView({ caseType, title }: CaseCardViewProps) {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseData | null>(null);

  const tableNames = {
    package: 'package_rental_cases',
    management: 'property_management_cases',
    agency: 'rental_agency_cases',
  };

  useEffect(() => {
    fetchCases();
  }, [caseType]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await db
        .from(tableNames[caseType])
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      alert('載入案件失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCase(null);
    setShowForm(true);
  };

  const handleEdit = (caseData: CaseData) => {
    setEditingCase(caseData);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此案件嗎？')) return;

    try {
      const { error } = await db
        .from(tableNames[caseType])
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('刪除成功');
      fetchCases();
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('刪除失敗');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCase(null);
    fetchCases();
  };

  const handleCopy = async (caseData: CaseData) => {
    if (!confirm('確定要複製此案件嗎？')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const dataToCopy = { ...caseData };
      delete dataToCopy.id;
      delete dataToCopy.created_at;
      delete dataToCopy.updated_at;

      dataToCopy.case_address = `${caseData.case_address} (複製)`;
      dataToCopy.user_id = user?.id || null;

      const { error } = await db
        .from(tableNames[caseType])
        .insert([dataToCopy]);

      if (error) throw error;
      alert('案件已複製');
      fetchCases();
    } catch (error) {
      console.error('Error copying case:', error);
      alert('複製失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增案件</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseData) => (
          <CaseCard
            key={caseData.id}
            caseData={caseData}
            caseType={caseType}
            onEdit={() => handleEdit(caseData)}
            onDelete={() => handleDelete(caseData.id!)}
            onCopy={() => handleCopy(caseData)}
          />
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          <p className="text-lg">目前沒有案件資料</p>
          <p className="text-sm mt-2">點擊「新增案件」開始建立</p>
        </div>
      )}

      {showForm && (
        <FormModal
          caseType={caseType}
          caseData={editingCase}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

interface CaseCardProps {
  caseData: CaseData;
  caseType: CaseType;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

function CaseCard({ caseData, caseType, onEdit, onDelete, onCopy }: CaseCardProps) {
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      '洽談中': 'bg-yellow-100 text-yellow-800',
      '已簽約': 'bg-green-100 text-green-800',
      '已終止': 'bg-gray-100 text-gray-800',
      '執行中': 'bg-blue-100 text-blue-800',
      '尋找中': 'bg-orange-100 text-orange-800',
      '已出租': 'bg-green-100 text-green-800',
      '待租中': 'bg-yellow-100 text-yellow-800',
      '出租中': 'bg-green-100 text-green-800',
      '整修中': 'bg-purple-100 text-purple-800',
      '已退租': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 mb-1">
            {caseData.case_address}
          </h4>
          {caseData.case_number && (
            <p className="text-sm text-gray-500">編號：{caseData.case_number}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className="text-purple-600 hover:text-purple-800 transition-colors"
            title="複製"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="編輯"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="刪除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">屋主：</span>
          <span className="font-medium">{caseData.owner_name}</span>
        </div>
        {caseData.owner_phone && (
          <div className="flex justify-between">
            <span className="text-gray-600">電話：</span>
            <span className="font-medium">{caseData.owner_phone}</span>
          </div>
        )}
        {caseData.manager_name && (
          <div className="flex justify-between">
            <span className="text-gray-600">管理人：</span>
            <span className="font-medium">{caseData.manager_name}</span>
          </div>
        )}
        {caseData.tenant_name && (
          <div className="flex justify-between">
            <span className="text-gray-600">承租人：</span>
            <span className="font-medium">{caseData.tenant_name}</span>
          </div>
        )}
        {caseType === 'package' ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">承租金額：</span>
              <span className="font-bold text-teal-600">
                NT$ {Number(caseData.monthly_rent || 0).toLocaleString()}
              </span>
            </div>
            {caseData.rental_income !== undefined && caseData.rental_income !== null && (
              <div className="flex justify-between">
                <span className="text-gray-600">出租金額：</span>
                <span className="font-bold text-blue-600">
                  NT$ {Number(caseData.rental_income || 0).toLocaleString()}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-600">租金：</span>
            <span className="font-bold text-teal-600">
              NT$ {Number(caseData.monthly_rent || 0).toLocaleString()}
            </span>
          </div>
        )}
        {caseType === 'management' && caseData.management_fee && (
          <div className="flex justify-between">
            <span className="text-gray-600">管理費：</span>
            <span className="font-medium text-blue-600">
              NT$ {Number(caseData.management_fee).toLocaleString()}
            </span>
          </div>
        )}
        {caseType === 'agency' && caseData.service_fee && (
          <div className="flex justify-between">
            <span className="text-gray-600">服務費：</span>
            <span className="font-medium text-blue-600">
              NT$ {Number(caseData.service_fee).toLocaleString()}
            </span>
          </div>
        )}
        {caseData.contract_start_date && (
          <div className="flex justify-between">
            <span className="text-gray-600">合約日期：</span>
            <span className="font-medium">
              {caseData.contract_start_date} ~ {caseData.contract_end_date || ''}
            </span>
          </div>
        )}
        {caseData.status && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">狀態：</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
              {caseData.status}
            </span>
          </div>
        )}
        {caseData.rental_status && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">出租情況：</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.rental_status)}`}>
              {caseData.rental_status}
            </span>
          </div>
        )}
      </div>

      {caseData.notes && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">備註：{caseData.notes}</p>
        </div>
      )}
    </div>
  );
}

interface FormModalProps {
  caseType: CaseType;
  caseData: CaseData | null;
  onClose: () => void;
}

function FormModal({ caseType, caseData, onClose }: FormModalProps) {
  const [formData, setFormData] = useState<CaseData>(
    caseData || getInitialFormData(caseType)
  );
  const [saving, setSaving] = useState(false);

  const tableNames = {
    package: 'package_rental_cases',
    management: 'property_management_cases',
    agency: 'rental_agency_cases',
  };

  useEffect(() => {
    if (caseType === 'management') {
      const rent = Number(formData.monthly_rent || 0);
      const ratio = Number(formData.management_fee_ratio || 10);
      const fee = rent * (ratio / 100);
      setFormData(prev => ({ ...prev, management_fee: fee }));
    } else if (caseType === 'agency') {
      const rent = Number(formData.expected_rent || 0);
      const months = Number(formData.service_fee_months || 1);
      const fee = rent * months;
      setFormData(prev => ({ ...prev, service_fee: fee }));
    }
  }, [formData.monthly_rent, formData.management_fee_ratio, formData.expected_rent, formData.service_fee_months, caseType]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const dataToSave = { ...formData };
      delete dataToSave.id;

      if (caseData?.id) {
        const { error } = await db
          .from(tableNames[caseType])
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq('id', caseData.id);

        if (error) throw error;
        alert('更新成功');
      } else {
        const { error } = await db
          .from(tableNames[caseType])
          .insert([{ ...dataToSave, user_id: user?.id || null }]);

        if (error) throw error;
        alert('新增成功');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-lg flex-shrink-0">
          <h3 className="text-2xl font-bold text-gray-900">
            {caseData ? '編輯案件' : '新增案件'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {renderFormFields(caseType, formData, handleChange)}
          </div>

          <div className="flex gap-4 p-6 border-t bg-white flex-shrink-0">
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
              className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? '儲存中...' : '儲存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getInitialFormData(caseType: CaseType): CaseData {
  const base = {
    case_address: '',
    owner_name: '',
    owner_phone: '',
    monthly_rent: 0,
    notes: '',
  };

  if (caseType === 'package') {
    return {
      ...base,
      case_number: '',
      manager_name: '',
      property_type: '',
      layout: '',
      area: 0,
      contract_start_date: '',
      contract_end_date: '',
      contract_years: 3,
      deposit: 0,
      status: '洽談中',
      rental_status: '待租中',
      rental_income: 0,
    };
  }

  if (caseType === 'management') {
    return {
      ...base,
      case_number: '',
      manager_name: '',
      tenant_name: '',
      tenant_phone: '',
      property_type: '',
      layout: '',
      area: 0,
      management_fee_ratio: 10,
      management_fee: 0,
      contract_start_date: '',
      contract_end_date: '',
      deposit: 0,
      status: '執行中',
      payment_frequency: '',
      water_electricity_billing: '',
      rent_payment_date: '',
      utility_settlement_date: '',
      payment_status: '',
      commission: 0,
    };
  }

  if (caseType === 'agency') {
    return {
      ...base,
      case_number: '',
      manager_name: '',
      property_type: '',
      layout: '',
      area: 0,
      expected_rent: 0,
      status: '尋找中',
      parking_space: '',
      water_electricity_billing: '',
      commission_date: new Date().toISOString().split('T')[0],
      contract_end_date: '',
    };
  }

  return base;
}

function renderFormFields(caseType: CaseType, formData: CaseData, handleChange: (field: string, value: any) => void) {
  const inputClass = "w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent";
  const labelClass = "block text-lg font-semibold text-gray-700 mb-2";

  if (caseType === 'package') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>案件編號</label>
          <input type="text" value={formData.case_number || ''} onChange={(e) => handleChange('case_number', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>管理人</label>
          <AutocompleteInput
            value={formData.manager_name || ''}
            onChange={(value) => handleChange('manager_name', value)}
            tableName="package_rental_cases"
            fieldName="manager_name"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>案件地址 *</label>
          <input type="text" required value={formData.case_address} onChange={(e) => handleChange('case_address', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>屋主名稱 *</label>
          <input type="text" required value={formData.owner_name} onChange={(e) => handleChange('owner_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>屋主電話</label>
          <input type="tel" value={formData.owner_phone || ''} onChange={(e) => handleChange('owner_phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>物件類型</label>
          <select value={formData.property_type || ''} onChange={(e) => handleChange('property_type', e.target.value)} className={inputClass}>
            <option value="">請選擇</option>
            <option value="透天">透天</option>
            <option value="公寓">公寓</option>
            <option value="華廈">華廈</option>
            <option value="大樓">大樓</option>
            <option value="平房">平房</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>格局</label>
          <AutocompleteInput
            value={formData.layout || ''}
            onChange={(value) => handleChange('layout', value)}
            tableName="package_rental_cases"
            fieldName="layout"
            placeholder="例：2房1廳1衛"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>坪數</label>
          <input type="number" step="0.01" value={formData.area || ''} onChange={(e) => handleChange('area', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>承租金額 *</label>
          <input type="number" required step="0.01" value={formData.monthly_rent} onChange={(e) => handleChange('monthly_rent', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>出租金額</label>
          <input type="number" step="0.01" value={formData.rental_income || 0} onChange={(e) => handleChange('rental_income', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>押金</label>
          <input type="number" step="0.01" value={formData.deposit || 0} onChange={(e) => handleChange('deposit', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>合約年數</label>
          <input type="number" value={formData.contract_years || 3} onChange={(e) => handleChange('contract_years', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>合約開始日</label>
          <input type="date" value={formData.contract_start_date || ''} onChange={(e) => handleChange('contract_start_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>合約結束日</label>
          <input type="date" value={formData.contract_end_date || ''} onChange={(e) => handleChange('contract_end_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>出租情況</label>
          <select value={formData.rental_status || '待租中'} onChange={(e) => handleChange('rental_status', e.target.value)} className={inputClass}>
            <option value="待租中">待租中</option>
            <option value="出租中">出租中</option>
            <option value="已出租">已出租</option>
            <option value="已退租">已退租</option>
            <option value="整修中">整修中</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>狀態</label>
          <select value={formData.status || '洽談中'} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
            <option value="洽談中">洽談中</option>
            <option value="已簽約">已簽約</option>
            <option value="已終止">已終止</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>備註</label>
          <textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} rows={4} className={inputClass} />
        </div>
      </div>
    );
  }

  if (caseType === 'management') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>案件編號</label>
          <input type="text" value={formData.case_number || ''} onChange={(e) => handleChange('case_number', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>管理人</label>
          <input type="text" value={formData.manager_name || ''} onChange={(e) => handleChange('manager_name', e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>案件地址 *</label>
          <input type="text" required value={formData.case_address} onChange={(e) => handleChange('case_address', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>屋主名稱 *</label>
          <input type="text" required value={formData.owner_name} onChange={(e) => handleChange('owner_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>屋主電話</label>
          <input type="tel" value={formData.owner_phone || ''} onChange={(e) => handleChange('owner_phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>承租人</label>
          <input type="text" value={formData.tenant_name || ''} onChange={(e) => handleChange('tenant_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>承租人電話</label>
          <input type="tel" value={formData.tenant_phone || ''} onChange={(e) => handleChange('tenant_phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>物件類型</label>
          <select value={formData.property_type || ''} onChange={(e) => handleChange('property_type', e.target.value)} className={inputClass}>
            <option value="">請選擇</option>
            <option value="透天">透天</option>
            <option value="公寓">公寓</option>
            <option value="華廈">華廈</option>
            <option value="大樓">大樓</option>
            <option value="平房">平房</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>格局</label>
          <input type="text" value={formData.layout || ''} onChange={(e) => handleChange('layout', e.target.value)} className={inputClass} placeholder="例：2房1廳1衛" />
        </div>
        <div>
          <label className={labelClass}>坪數</label>
          <input type="number" step="0.01" value={formData.area || ''} onChange={(e) => handleChange('area', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>每月租金 *</label>
          <input type="number" required step="0.01" value={formData.monthly_rent} onChange={(e) => handleChange('monthly_rent', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>管理費比率 (%)</label>
          <input type="number" step="0.01" value={formData.management_fee_ratio || 10} onChange={(e) => handleChange('management_fee_ratio', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>管理費</label>
          <div className="w-full px-4 py-3 text-lg bg-gray-100 border border-gray-300 rounded-lg font-semibold text-teal-600">
            NT$ {Number(formData.management_fee || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <label className={labelClass}>押金</label>
          <input type="number" step="0.01" value={formData.deposit || 0} onChange={(e) => handleChange('deposit', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>繳款頻率</label>
          <input type="text" value={formData.payment_frequency || ''} onChange={(e) => handleChange('payment_frequency', e.target.value)} className={inputClass} placeholder="例如：月繳" />
        </div>
        <div>
          <label className={labelClass}>合約開始日</label>
          <input type="date" value={formData.contract_start_date || ''} onChange={(e) => handleChange('contract_start_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>合約結束日</label>
          <input type="date" value={formData.contract_end_date || ''} onChange={(e) => handleChange('contract_end_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>房租繳款日</label>
          <input type="text" value={formData.rent_payment_date || ''} onChange={(e) => handleChange('rent_payment_date', e.target.value)} className={inputClass} placeholder="例：每月5號" />
        </div>
        <div>
          <label className={labelClass}>水電結算日</label>
          <input type="text" value={formData.utility_settlement_date || ''} onChange={(e) => handleChange('utility_settlement_date', e.target.value)} className={inputClass} placeholder="例：每月10號" />
        </div>
        <div>
          <label className={labelClass}>水電計費</label>
          <input type="text" value={formData.water_electricity_billing || ''} onChange={(e) => handleChange('water_electricity_billing', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>繳款情況</label>
          <input type="text" value={formData.payment_status || ''} onChange={(e) => handleChange('payment_status', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>狀態</label>
          <select value={formData.status || '執行中'} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
            <option value="執行中">執行中</option>
            <option value="已終止">已終止</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>業務收益</label>
          <input type="number" step="0.01" value={formData.commission || 0} onChange={(e) => handleChange('commission', e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>備註</label>
          <textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} rows={4} className={inputClass} />
        </div>
      </div>
    );
  }

  if (caseType === 'agency') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>案件編號</label>
          <input type="text" value={formData.case_number || ''} onChange={(e) => handleChange('case_number', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>管理人</label>
          <input type="text" value={formData.manager_name || ''} onChange={(e) => handleChange('manager_name', e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>案件地址 *</label>
          <input type="text" required value={formData.case_address} onChange={(e) => handleChange('case_address', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>屋主名稱 *</label>
          <input type="text" required value={formData.owner_name} onChange={(e) => handleChange('owner_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>屋主電話</label>
          <input type="tel" value={formData.owner_phone || ''} onChange={(e) => handleChange('owner_phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>物件類型</label>
          <select value={formData.property_type || ''} onChange={(e) => handleChange('property_type', e.target.value)} className={inputClass}>
            <option value="">請選擇</option>
            <option value="透天">透天</option>
            <option value="公寓">公寓</option>
            <option value="華廈">華廈</option>
            <option value="大樓">大樓</option>
            <option value="平房">平房</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>格局</label>
          <input type="text" value={formData.layout || ''} onChange={(e) => handleChange('layout', e.target.value)} className={inputClass} placeholder="例：2房1廳1衛" />
        </div>
        <div>
          <label className={labelClass}>坪數</label>
          <input type="number" step="0.01" value={formData.area || ''} onChange={(e) => handleChange('area', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>預期租金 *</label>
          <input type="number" required step="0.01" value={formData.expected_rent || formData.monthly_rent} onChange={(e) => handleChange('expected_rent', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>停車位有無</label>
          <select value={formData.parking_space || ''} onChange={(e) => handleChange('parking_space', e.target.value)} className={inputClass}>
            <option value="">請選擇</option>
            <option value="有">有</option>
            <option value="無">無</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>水電計費</label>
          <input type="text" value={formData.water_electricity_billing || ''} onChange={(e) => handleChange('water_electricity_billing', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>委任日期</label>
          <input type="date" value={formData.commission_date || ''} onChange={(e) => handleChange('commission_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>期滿日期</label>
          <input type="date" value={formData.contract_end_date || ''} onChange={(e) => handleChange('contract_end_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>狀態</label>
          <select value={formData.status || '尋找中'} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
            <option value="尋找中">尋找中</option>
            <option value="已出租">已出租</option>
            <option value="已終止">已終止</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>備註</label>
          <textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} rows={4} className={inputClass} />
        </div>
      </div>
    );
  }

  return null;
}
