import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Eye, MapPin, Home, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RentalAgencyForm from './RentalAgencyForm';

interface RentalAgencyCase {
  id: string;
  case_address: string;
  property_type: string;
  layout: string;
  area: number;
  monthly_rent: number;
  photos: string[];
  features: string[];
  surroundings: string;
  description: string;
  is_public: boolean;
  owner_name?: string;
  owner_phone?: string;
  created_at: string;
}

interface RentalAgencyManagerProps {
  isGuest?: boolean;
}

export default function RentalAgencyManager({ isGuest = false }: RentalAgencyManagerProps) {
  const userId = '00000000-0000-0000-0000-000000000000';
  const navigate = useNavigate();
  const [cases, setCases] = useState<RentalAgencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, [isGuest]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('rental_agency_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (isGuest) {
        query = query.eq('is_public', true);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      alert('載入案件失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此案件？')) return;

    try {
      const { error } = await supabase
        .from('rental_agency_cases')
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
    setEditingId(null);
    fetchCases();
  };

  const handleViewDetail = (id: string) => {
    const path = isGuest ? `/visitor/rental-agency/${id}` : `/admin/rental-agency/${id}`;
    navigate(path);
  };

  const filteredCases = cases.filter(c =>
    c.case_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.property_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.layout?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return <RentalAgencyForm caseId={editingId} onClose={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">
          {isGuest ? '租屋物件' : '代租案件管理'}
        </h2>
        {!isGuest && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors text-lg shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>新增案件</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜尋地址、類型、格局..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-xl">載入中...</div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xl">
          {searchTerm ? '找不到符合的案件' : isGuest ? '暫無公開案件' : '尚無案件資料'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseData) => (
            <div
              key={caseData.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
              onClick={() => handleViewDetail(caseData.id)}
            >
              <div className="relative h-56 bg-gray-200 overflow-hidden">
                {caseData.photos && caseData.photos.length > 0 ? (
                  <img
                    src={caseData.photos[0]}
                    alt={caseData.case_address}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-lg">
                  NT$ {caseData.monthly_rent.toLocaleString()}/月
                </div>

                {caseData.photos && caseData.photos.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    {caseData.photos.length} 張照片
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                  {caseData.case_address}
                </h3>

                {caseData.features && caseData.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {caseData.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold"
                      >
                        {feature}
                      </span>
                    ))}
                    {caseData.features.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{caseData.features.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 pt-2 border-t">
                  <div className="flex flex-col items-center">
                    <Home className="w-4 h-4 text-teal-600 mb-1" />
                    <span className="font-semibold text-gray-900">{caseData.property_type}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MapPin className="w-4 h-4 text-teal-600 mb-1" />
                    <span className="font-semibold text-gray-900">{caseData.layout}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Maximize className="w-4 h-4 text-teal-600 mb-1" />
                    <span className="font-semibold text-gray-900">{caseData.area}坪</span>
                  </div>
                </div>

                {!isGuest && (
                  <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleViewDetail(caseData.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看</span>
                    </button>
                    <button
                      onClick={() => handleEdit(caseData.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>編輯</span>
                    </button>
                    <button
                      onClick={() => handleDelete(caseData.id)}
                      className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
