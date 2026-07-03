import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuotationItem {
  id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string;
  sort_order: number;
}

interface QuotationFormProps {
  quotationId: string | null;
  onClose: () => void;
}

export default function QuotationForm({ quotationId, onClose }: QuotationFormProps) {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [formData, setFormData] = useState({
    business_name: '',
    business_phone: '',
    quote_date: new Date().toISOString().split('T')[0],
    case_address: '',
    owner_name: '',
    owner_phone: '',
    case_type: '',
    total_amount: 0,
    management_fee_type: null as string | null,
    management_fee_value: 0,
    management_fee_amount: 0,
    internal_notes: '',
    client_content: '',
  });

  const [items, setItems] = useState<QuotationItem[]>([
    { item_name: '', quantity: 1, unit_price: 0, subtotal: 0, notes: '', sort_order: 0 }
  ]);

  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotationId ?? '')
        .single();

      if (quotationError) throw quotationError;

      setFormData({
        business_name: quotation.business_name,
        business_phone: quotation.business_phone || '',
        quote_date: quotation.quote_date,
        case_address: quotation.case_address,
        owner_name: quotation.owner_name || '',
        owner_phone: quotation.owner_phone || '',
        case_type: quotation.case_type || '',
        total_amount: quotation.total_amount,
        management_fee_type: quotation.management_fee_type,
        management_fee_value: quotation.management_fee_value || 0,
        management_fee_amount: quotation.management_fee_amount || 0,
        internal_notes: quotation.internal_notes || '',
        client_content: quotation.client_content || '',
      });

      const { data: itemsData, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotationId ?? '')
        .order('sort_order');

      if (itemsError) throw itemsError;

      if (itemsData && itemsData.length > 0) {
        setItems(itemsData.map(item => ({
          id: item.id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          notes: item.notes || '',
          sort_order: item.sort_order,
        })));
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      alert('載入報價單失敗');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'management_fee_type' || field === 'management_fee_value') {
        const feeType = field === 'management_fee_type' ? value : prev.management_fee_type;
        const feeValue = field === 'management_fee_value' ? Number(value) : prev.management_fee_value;

        if (feeType === 'percentage') {
          updated.management_fee_amount = (prev.total_amount * feeValue) / 100;
        } else if (feeType === 'fixed') {
          updated.management_fee_amount = feeValue;
        } else {
          updated.management_fee_amount = 0;
        }
      }

      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unit_price' ? Number(value) : newItems[index].unit_price;
      newItems[index].subtotal = quantity * unitPrice;
    }

    setItems(newItems);
    calculateTotals(newItems);
  };

  const calculateTotals = (itemsList: QuotationItem[]) => {
    const total = itemsList.reduce((sum, item) => sum + item.subtotal, 0);
    setFormData(prev => {
      let managementFeeAmount = prev.management_fee_amount;

      if (prev.management_fee_type === 'percentage') {
        managementFeeAmount = (total * prev.management_fee_value) / 100;
      } else if (prev.management_fee_type === 'fixed') {
        managementFeeAmount = prev.management_fee_value;
      }

      return {
        ...prev,
        total_amount: total,
        management_fee_amount: managementFeeAmount,
      };
    });
  };

  const addItem = () => {
    setItems([...items, {
      item_name: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
      notes: '',
      sort_order: items.length,
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    newItems.forEach((item, idx) => {
      item.sort_order = idx;
    });

    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let savedQuotationId = quotationId;

      if (quotationId) {
        const { error: updateError } = await supabase
          .from('quotations')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', quotationId);

        if (updateError) throw updateError;

        const { error: deleteError } = await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quotationId);

        if (deleteError) throw deleteError;
      } else {
        const { data, error: insertError } = await supabase
          .from('quotations')
          .insert([{
            ...formData,
            user_id: userId,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        savedQuotationId = data.id;
      }

      const itemsToInsert = items.map((item, index) => ({
        quotation_id: savedQuotationId,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        notes: item.notes,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      alert(quotationId ? '報價單已更新' : '報價單已新增');
      onClose();
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
        <h3 className="text-2xl font-bold text-gray-900">
          {quotationId ? '編輯報價單' : '新增報價單'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-base font-bold text-gray-700 mb-3">基本資料</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">業務名稱 *</label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">業務電話</label>
              <input
                type="tel"
                value={formData.business_phone}
                onChange={(e) => handleInputChange('business_phone', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">報價日期 *</label>
              <input
                type="date"
                required
                value={formData.quote_date}
                onChange={(e) => handleInputChange('quote_date', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">案件類型</label>
              <input
                type="text"
                value={formData.case_type}
                onChange={(e) => handleInputChange('case_type', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例：裝修、維修等"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">案件地址 * (作為案件標題)</label>
              <input
                type="text"
                required
                value={formData.case_address}
                onChange={(e) => handleInputChange('case_address', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">屋主名稱 *</label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">屋主電話</label>
              <input
                type="tel"
                value={formData.owner_phone}
                onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold text-gray-900">報價項目</h4>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新增項目</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700 border w-12"></th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">項目名稱 *</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border w-24">數量 *</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border w-32">單價 *</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">備註</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border w-32">小計</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700 border w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`hover:bg-gray-50 transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <td className="px-3 py-2 border text-center cursor-move">
                      <GripVertical className="w-5 h-5 text-gray-400 inline-block" />
                    </td>
                    <td className="px-3 py-2 border">
                      <input
                        type="text"
                        required
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        className="w-full px-2 py-1 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full px-2 py-1 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="w-full px-2 py-1 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 border">
                      <div className="px-2 py-1 text-base bg-gray-100 rounded font-semibold text-right">
                        NT$ {item.subtotal.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 border text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={addItem}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新增項目</span>
            </button>
          </div>
        </div>

        <div className="border-t pt-6 space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex justify-between items-center text-2xl">
              <span className="font-bold text-gray-900">總工程款：</span>
              <span className="font-bold text-blue-600">NT$ {formData.total_amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-xl font-bold text-gray-900">施工期間管理費</h4>
              <span className="text-sm text-gray-600 italic">*自費裝修代租代管才需此費用</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">計費方式</label>
                <select
                  value={formData.management_fee_type || ''}
                  onChange={(e) => handleInputChange('management_fee_type', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">不收取管理費</option>
                  <option value="percentage">總工程款百分比</option>
                  <option value="fixed">固定金額</option>
                </select>
              </div>

              {formData.management_fee_type && (
                <>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      {formData.management_fee_type === 'percentage' ? '百分比 (%)' : '固定金額 (NT$)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.management_fee_type === 'percentage' ? '0.1' : '1'}
                      value={formData.management_fee_value}
                      onChange={(e) => handleInputChange('management_fee_value', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">計算後管理費</label>
                    <div className="w-full px-4 py-3 text-base bg-gray-100 border border-gray-300 rounded-lg font-bold text-yellow-700">
                      NT$ {formData.management_fee_amount.toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">內部備註（僅編輯者可見）</label>
              <textarea
                value={formData.internal_notes}
                onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="此欄位只有內部人員看得到，可記錄注意事項、成本分析等"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">給客戶的說明（會出現在匯出文件）</label>
              <textarea
                value={formData.client_content}
                onChange={(e) => handleInputChange('client_content', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="此欄位會顯示在給客戶的報價單上，可填寫付款方式、施工說明等"
              />
            </div>
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
