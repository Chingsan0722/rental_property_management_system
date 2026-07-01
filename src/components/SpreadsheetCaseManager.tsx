import { useState, useEffect } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type CaseType = 'package' | 'management' | 'agency';

interface BaseCase {
  id?: string;
  case_number: string;
  case_address: string;
  manager_name: string;
  owner_name: string;
  owner_phone?: string;
  monthly_rent: number;
  notes?: string;
  commission?: number;
  commission_notes?: string;
  [key: string]: any;
}

interface SpreadsheetCaseManagerProps {
  caseType: CaseType;
  title: string;
}

export default function SpreadsheetCaseManager({ caseType, title }: SpreadsheetCaseManagerProps) {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [cases, setCases] = useState<BaseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tableNames = {
    package: 'package_rental_cases',
    management: 'property_management_cases',
    agency: 'rental_agency_cases',
  };

  const columns = getColumnsForType(caseType);

  useEffect(() => {
    fetchCases();
  }, [caseType]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableNames[caseType])
        .select('*')
        .eq('user_id', userId)
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

  const handleCellChange = (id: string | undefined, field: string, value: any) => {
    setCases(prevCases =>
      prevCases.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
    setIsDirty(true);
  };

  const generateCaseNumber = () => {
    const prefix = caseType === 'package' ? 'P' : caseType === 'management' ? 'M' : 'A';
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

    const todayCases = cases.filter(c => c.case_number?.startsWith(`${prefix}-${today}`));
    const nextNumber = (todayCases.length + 1).toString().padStart(3, '0');

    return `${prefix}-${today}-${nextNumber}`;
  };

  const handleAddRow = () => {
    const newCase: BaseCase = {
      id: `temp-${Date.now()}`,
      case_number: generateCaseNumber(),
      case_address: '',
      manager_name: '',
      owner_name: '',
      monthly_rent: 0,
      ...getDefaultValuesForType(caseType)
    };
    setCases([...cases, newCase]);
    setIsDirty(true);
  };

  const handleDeleteRow = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('確定要刪除這筆案件嗎？')) return;

    try {
      if (id.startsWith('temp-')) {
        setCases(cases.filter(c => c.id !== id));
      } else {
        const { error } = await supabase
          .from(tableNames[caseType])
          .delete()
          .eq('id', id);

        if (error) throw error;
        setCases(cases.filter(c => c.id !== id));
        alert('刪除成功');
      }
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('刪除失敗');
    }
  };

  const handleToggleSelect = (id: string | undefined) => {
    if (!id) return;
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === cases.length && cases.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cases.map(c => c.id).filter(id => id) as string[]));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      alert('請先選擇要刪除的案件');
      return;
    }

    if (!confirm(`確定要刪除選中的 ${selectedIds.size} 筆案件嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const idsToDelete = Array.from(selectedIds);
      const dbIds = idsToDelete.filter(id => !id.startsWith('temp-'));

      if (dbIds.length > 0) {
        const { error } = await supabase
          .from(tableNames[caseType])
          .delete()
          .in('id', dbIds);

        if (error) throw error;
      }

      setCases(cases.filter(c => !selectedIds.has(c.id as string)));
      setSelectedIds(new Set());
      alert(`成功刪除 ${selectedIds.size} 筆案件`);
    } catch (error) {
      console.error('Error batch deleting cases:', error);
      alert('批量刪除失敗');
    }
  };

  const handleDeleteAll = async () => {
    if (cases.length === 0) {
      alert('目前沒有案件可刪除');
      return;
    }

    if (!confirm(`確定要刪除全部 ${cases.length} 筆案件嗎？此操作無法復原。`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(tableNames[caseType])
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setCases([]);
      setSelectedIds(new Set());
      alert('成功刪除所有案件');
    } catch (error) {
      console.error('Error deleting all cases:', error);
      alert('刪除失敗');
    }
  };

  const handleSaveAll = async () => {
    try {
      const tableName = tableNames[caseType];
      const newCases = [];
      const updateCases = [];

      for (const caseData of cases) {
        if (!caseData.case_address) {
          alert('請填寫必填欄位：案件地址');
          return;
        }

        const dataToSave = { ...caseData };
        delete dataToSave.id;
        delete dataToSave.created_at;
        delete dataToSave.updated_at;

        if (caseData.id?.startsWith('temp-')) {
          newCases.push({ ...dataToSave, user_id: userId });
        } else if (caseData.id) {
          updateCases.push({ id: caseData.id, data: dataToSave });
        }
      }

      if (newCases.length > 0) {
        console.log('Inserting cases:', newCases.length, 'with user_id:', user.id);
        const { error, data } = await supabase
          .from(tableName)
          .insert(newCases)
          .select();
        if (error) {
          console.error('Batch insert error:', error);
          throw error;
        }
        console.log('Insert successful:', data);
      }

      for (const { id, data } of updateCases) {
        const { error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', id);
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      }

      alert(`成功儲存 ${newCases.length + updateCases.length} 筆資料`);
      setIsDirty(false);
      fetchCases();
    } catch (error: any) {
      console.error('Error saving cases:', error);
      const errorMsg = error?.message || '儲存失敗';
      alert(`儲存失敗：${errorMsg}`);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>新增列</span>
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>刪除選中 ({selectedIds.size})</span>
            </button>
          )}
          {cases.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>刪除全部</span>
            </button>
          )}
          {isDirty && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors animate-pulse"
            >
              <Save className="w-5 h-5" />
              <span>儲存變更</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-auto divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.size === cases.length && cases.length > 0}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                操作
              </th>
              {columns.map(col => (
                <th
                  key={col.field}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                  {col.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((caseData, index) => (
              <tr key={caseData.id || index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(caseData.id as string)}
                    onChange={() => handleToggleSelect(caseData.id)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteRow(caseData.id)}
                    className="text-red-600 hover:text-red-800"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
                {columns.map(col => (
                  <td key={col.field} className="px-4 py-2 whitespace-nowrap">
                    {col.type === 'select' ? (
                      <select
                        value={caseData[col.field] || ''}
                        onChange={(e) => handleCellChange(caseData.id, col.field, e.target.value)}
                        className="min-w-[120px] px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">請選擇</option>
                        {col.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : col.type === 'number' ? (
                      <input
                        type="number"
                        value={caseData[col.field] || 0}
                        onChange={(e) => handleCellChange(caseData.id, col.field, Number(e.target.value))}
                        className="min-w-[100px] px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : col.type === 'date' ? (
                      <input
                        type="date"
                        value={caseData[col.field] || ''}
                        onChange={(e) => handleCellChange(caseData.id, col.field, e.target.value)}
                        className="min-w-[140px] px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={caseData[col.field] || ''}
                        onChange={(e) => handleCellChange(caseData.id, col.field, e.target.value)}
                        className="min-w-[150px] px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={col.placeholder}
                        style={{ width: `${Math.max(150, (caseData[col.field]?.toString().length || 0) * 8 + 30)}px` }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cases.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">目前沒有案件資料</p>
          <p className="text-sm mt-2">點擊「新增列」開始新增案件，或使用「從 Sheet 讀取」匯入資料</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-semibold mb-2">💡 使用提示：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>直接在表格中編輯資料，修改後點擊「儲存變更」</li>
          <li>勾選左側勾選框可批量刪除案件</li>
          <li>使用「刪除全部」可清空所有案件資料</li>
        </ul>
      </div>
    </div>
  );
}

function getColumnsForType(type: CaseType) {
  const baseColumns = [
    { field: 'case_number', label: '案件編號', type: 'text' },
    { field: 'case_address', label: '地址', type: 'text', required: true },
    { field: 'manager_name', label: '管理人', type: 'text' },
    { field: 'owner_name', label: '出租人', type: 'text' },
    { field: 'owner_phone', label: '出租人電話', type: 'text' },
  ];

  if (type === 'package') {
    return [
      ...baseColumns,
      { field: 'property_type', label: '物件類型', type: 'select', options: ['透天', '公寓', '華廈', '大樓', '平房', '其他'] },
      { field: 'layout', label: '格局', type: 'text' },
      { field: 'area', label: '坪數', type: 'number' },
      { field: 'monthly_rent', label: '承租金額', type: 'number' },
      { field: 'rental_income', label: '出租金額', type: 'number' },
      { field: 'deposit', label: '押金', type: 'number' },
      { field: 'contract_years', label: '合約年數', type: 'number' },
      { field: 'contract_start_date', label: '合約開始日', type: 'date' },
      { field: 'contract_end_date', label: '合約結束日', type: 'date' },
      { field: 'rental_status', label: '出租情況', type: 'select', options: ['待租中', '出租中', '已出租', '已退租', '整修中'] },
      { field: 'status', label: '狀態', type: 'select', options: ['洽談中', '已簽約', '已終止'] },
      { field: 'notes', label: '備註', type: 'text' },
    ];
  }

  if (type === 'management') {
    return [
      { field: 'case_number', label: '案件編號', type: 'text' },
      { field: 'case_address', label: '地址', type: 'text', required: true },
      { field: 'tenant_name', label: '承租人', type: 'text' },
      { field: 'tenant_phone', label: '承租人電話', type: 'text' },
      { field: 'owner_name', label: '出租人', type: 'text' },
      { field: 'manager_name', label: '管理人', type: 'text' },
      { field: 'monthly_rent', label: '租金金額', type: 'number' },
      { field: 'payment_frequency', label: '繳款頻率', type: 'text' },
      { field: 'water_fee', label: '水費', type: 'number' },
      { field: 'electricity_fee', label: '電費', type: 'number' },
      { field: 'management_fee', label: '管理費', type: 'number' },
      { field: 'contract_start_date', label: '承租日期', type: 'date' },
      { field: 'contract_end_date', label: '期滿日期', type: 'date' },
      { field: 'rent_payment_date', label: '房租繳款日', type: 'date' },
      { field: 'utility_settlement_date', label: '水電結算日', type: 'date' },
      { field: 'payment_status', label: '繳款情況', type: 'text' },
      { field: 'notes', label: '備註', type: 'text' },
      { field: 'management_fee_ratio', label: '管理費比率(%)', type: 'number' },
      { field: 'deposit', label: '押金', type: 'number' },
      { field: 'status', label: '狀態', type: 'select', options: ['執行中', '已終止'] },
    ];
  }

  if (type === 'agency') {
    return [
      ...baseColumns,
      { field: 'property_type', label: '物件類型', type: 'select', options: ['透天', '公寓', '華廈', '大樓', '平房', '其他'] },
      { field: 'layout', label: '格局', type: 'text' },
      { field: 'area', label: '坪數', type: 'number' },
      { field: 'expected_rent', label: '預期租金', type: 'number' },
      { field: 'parking_space', label: '停車位有無', type: 'select', options: ['有', '無'] },
      { field: 'water_electricity_billing', label: '水/電計費', type: 'text' },
      { field: 'commission_date', label: '委任日期', type: 'date' },
      { field: 'contract_end_date', label: '期滿日期', type: 'date' },
      { field: 'status', label: '狀態', type: 'select', options: ['尋找中', '已出租', '已終止'] },
      { field: 'notes', label: '備註', type: 'text' },
    ];
  }

  return baseColumns;
}

function getDefaultValuesForType(type: CaseType) {
  const base = {
    owner_phone: '',
    notes: '',
  };

  if (type === 'package') {
    return {
      ...base,
      property_type: '',
      layout: '',
      area: 0,
      rental_income: 0,
      deposit: 0,
      contract_years: 3,
      rental_status: '待租中',
      status: '洽談中',
    };
  }

  if (type === 'management') {
    return {
      ...base,
      tenant_name: '',
      tenant_phone: '',
      management_fee_ratio: 10,
      management_fee: 0,
      deposit: 0,
      payment_frequency: '月繳',
      water_fee: 0,
      electricity_fee: 0,
      rent_payment_date: '',
      utility_settlement_date: '',
      payment_status: '',
      status: '執行中',
    };
  }

  if (type === 'agency') {
    return {
      ...base,
      property_type: '',
      layout: '',
      area: 0,
      expected_rent: 0,
      parking_space: '',
      water_electricity_billing: '',
      commission_date: new Date().toISOString().split('T')[0],
      status: '尋找中',
    };
  }

  return base;
}

