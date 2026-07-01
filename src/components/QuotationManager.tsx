import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, FileText, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import QuotationForm from './QuotationForm';
import QuotationPreview from './QuotationPreview';

interface Quotation {
  id: string;
  business_name: string;
  business_phone: string | null;
  quote_date: string;
  case_address: string;
  owner_name: string;
  owner_phone: string | null;
  case_type: string | null;
  total_amount: number;
  created_at: string;
}

export default function QuotationManager() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewData, setPreviewData] = useState<{ quotation: any; items: any[] } | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      let query = supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此報價單嗎？')) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert('刪除失敗');
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    fetchQuotations();
  };

  const handlePreview = async (id: string) => {
    try {
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (quotationError) throw quotationError;

      const { data: items, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .order('sort_order');

      if (itemsError) throw itemsError;

      setPreviewData({ quotation, items: items || [] });
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('載入預覽失敗');
    }
  };

  const filteredQuotations = quotations.filter(q =>
    q.case_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return <QuotationForm quotationId={editingId} onClose={handleFormClose} />;
  }

  if (previewData) {
    return (
      <QuotationPreview
        quotation={previewData.quotation}
        items={previewData.items}
        onClose={() => setPreviewData(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">工程/裝修報價單</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>新增報價單</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜尋案件地址或屋主名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-xl">載入中...</div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xl">
          {searchTerm ? '找不到符合的報價單' : '尚無報價單資料'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredQuotations.map((quotation) => (
            <div key={quotation.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">{quotation.case_address}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                      <div className="text-lg">
                        <span className="font-semibold">業務：</span>{quotation.business_name}
                      </div>
                      <div className="text-lg">
                        <span className="font-semibold">屋主：</span>{quotation.owner_name}
                      </div>
                      <div className="text-lg">
                        <span className="font-semibold">報價日期：</span>{quotation.quote_date}
                      </div>
                      <div className="text-lg">
                        <span className="font-semibold">案件類型：</span>{quotation.case_type || '-'}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      總金額：NT$ {quotation.total_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => handlePreview(quotation.id)}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      title="預覽/匯出"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="hidden sm:inline">預覽</span>
                    </button>
                    <button
                      onClick={() => handleEdit(quotation.id)}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      title="編輯"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span className="hidden sm:inline">編輯</span>
                    </button>
                    <button
                      onClick={() => handleDelete(quotation.id)}
                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="hidden sm:inline">刪除</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
