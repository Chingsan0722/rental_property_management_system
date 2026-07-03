import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Home, Maximize } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RentalAgencyCase {
  id: string;
  case_address: string;
  property_type: string | null;
  layout: string | null;
  area: number | null;
  monthly_rent: number;
  photos: string[];
  features: string[];
  surroundings: string;
  description: string;
  owner_name?: string | null;
  owner_phone?: string | null;
}

export default function RentalAgencyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<RentalAgencyCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCase();
    }
  }, [id]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rental_agency_cases')
        .select('*')
        .eq('id', id ?? '')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        alert('案件不存在');
        navigate(-1);
        return;
      }

      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case:', error);
      alert('載入案件失敗');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const nextPhoto = () => {
    if (caseData && caseData.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % caseData.photos.length);
    }
  };

  const prevPhoto = () => {
    if (caseData && caseData.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + caseData.photos.length) % caseData.photos.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">載入中...</div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b p-6">
          <h2 className="text-3xl font-bold text-gray-900">{caseData.case_address}</h2>
        </div>

        <div className="p-6 space-y-6">
          {caseData.photos && caseData.photos.length > 0 ? (
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <img
                src={caseData.photos[currentPhotoIndex]}
                alt={`案件照片 ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {caseData.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {currentPhotoIndex + 1} / {caseData.photos.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
              <div className="text-center text-gray-400">
                <Home className="w-20 h-20 mx-auto mb-2" />
                <p className="text-lg">暫無照片</p>
              </div>
            </div>
          )}

          {caseData.photos && caseData.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {caseData.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentPhotoIndex ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`縮圖 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-blue-900">
                NT$ {caseData.monthly_rent.toLocaleString()}
              </span>
              <span className="text-xl text-blue-700">/月</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">地址</div>
                  <div className="font-semibold">{caseData.case_address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">類型/格局</div>
                  <div className="font-semibold">{caseData.property_type} / {caseData.layout}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">坪數</div>
                  <div className="font-semibold">{caseData.area} 坪</div>
                </div>
              </div>
            </div>
          </div>

          {caseData.features && caseData.features.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">案件特色</h3>
              <div className="flex flex-wrap gap-2">
                {caseData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {caseData.surroundings && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">周邊生活機能</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.surroundings}</p>
              </div>
            </div>
          )}

          {caseData.description && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">案件說明</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
