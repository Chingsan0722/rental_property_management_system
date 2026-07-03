import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadPhoto, deletePhoto, checkBucketExists } from '../lib/photoUpload';

interface RentalAgencyFormProps {
  caseId: string | null;
  onClose: () => void;
}

export default function RentalAgencyForm({ caseId, onClose }: RentalAgencyFormProps) {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [formData, setFormData] = useState({
    case_address: '',
    property_type: '',
    layout: '',
    area: '',
    monthly_rent: '0',
    owner_name: '',
    owner_phone: '',
    is_public: false,
    surroundings: '',
    description: '',
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bucketReady, setBucketReady] = useState(false);
  const [bucketError, setBucketError] = useState(false);

  useEffect(() => {
    const checkBucket = async () => {
      const exists = await checkBucketExists();
      setBucketReady(exists);
      if (!exists) {
        setBucketError(true);
      }
    };
    checkBucket();

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const fetchCase = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_agency_cases')
        .select('*')
        .eq('id', caseId ?? '')
        .single();

      if (error) throw error;

      setFormData({
        case_address: data.case_address,
        property_type: data.property_type || '',
        layout: data.layout || '',
        area: data.area?.toString() || '',
        monthly_rent: data.monthly_rent?.toString() || '0',
        owner_name: data.owner_name || '',
        owner_phone: data.owner_phone || '',
        is_public: data.is_public || false,
        surroundings: data.surroundings || '',
        description: data.description || '',
      });

      setPhotos(data.photos || []);
      setFeatures(data.features || []);
    } catch (error) {
      console.error('Error fetching case:', error);
      alert('載入案件失敗');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!bucketReady) {
      alert('照片儲存空間尚未設置，請聯繫系統管理員設置 Supabase Storage\n\n請參考 STORAGE_SETUP.md 檔案進行設置');
      event.target.value = '';
      return;
    }

    if (photos.length + files.length > 10) {
      alert('最多只能上傳10張照片');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(file => uploadPhoto(file, userId));
      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter(r => r.success && r.url).map(r => r.url!);

      if (successfulUploads.length > 0) {
        setPhotos([...photos, ...successfulUploads]);
      }

      const failedCount = results.length - successfulUploads.length;
      if (failedCount > 0) {
        alert(`${failedCount} 張照片上傳失敗`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('照片上傳失敗');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];
    const confirmDelete = confirm('確定要刪除此照片？');

    if (!confirmDelete) return;

    await deletePhoto(photoUrl);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        case_address: formData.case_address,
        property_type: formData.property_type || null,
        layout: formData.layout || null,
        area: formData.area ? Number(formData.area) : null,
        monthly_rent: Number(formData.monthly_rent),
        owner_name: formData.owner_name || null,
        owner_phone: formData.owner_phone || null,
        photos: photos,
        features: features,
        is_public: formData.is_public,
        surroundings: formData.surroundings || null,
        description: formData.description || null,
        updated_at: new Date().toISOString(),
      };

      if (caseId) {
        const { error } = await supabase
          .from('rental_agency_cases')
          .update(dataToSave)
          .eq('id', caseId);

        if (error) throw error;
        alert('案件已更新');
      } else {
        const { error } = await supabase
          .from('rental_agency_cases')
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
          {caseId ? '編輯代租案件' : '新增代租案件'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">案件地址 *</label>
              <input
                type="text"
                required
                value={formData.case_address}
                onChange={(e) => handleInputChange('case_address', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">物件類型</label>
              <input
                type="text"
                value={formData.property_type}
                onChange={(e) => handleInputChange('property_type', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="例：公寓、電梯大樓"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">格局</label>
              <input
                type="text"
                value={formData.layout}
                onChange={(e) => handleInputChange('layout', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="例：2房1廳1衛"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">坪數</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">每月租金 *</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.monthly_rent}
                onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">屋主姓名</label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">屋主電話</label>
              <input
                type="tel"
                value={formData.owner_phone}
                onChange={(e) => handleInputChange('owner_phone', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => handleInputChange('is_public', e.target.checked)}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="is_public" className="text-base font-semibold text-gray-900">
              公開顯示此案件
            </label>
          </div>
          <p className="text-sm text-gray-600 ml-8">
            勾選後，此案件將在訪客模式中公開顯示
          </p>
        </div>

        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            案件照片 ({photos.length}/10)
          </label>

          {bucketError && (
            <div className="mb-3 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600 font-semibold">⚠️ 照片儲存空間尚未設置</div>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                請管理員參考 STORAGE_SETUP.md 檔案設置 Supabase Storage
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                disabled={photos.length >= 10 || uploading || !bucketReady}
              />
              <label
                htmlFor="photo-upload"
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                  photos.length >= 10 || uploading || !bucketReady
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-teal-500 bg-teal-50 hover:bg-teal-100 cursor-pointer'
                }`}
              >
                <Upload className={`w-5 h-5 ${bucketReady ? 'text-teal-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${bucketReady ? 'text-teal-700' : 'text-gray-500'}`}>
                  {uploading ? '上傳中...' : !bucketReady ? '照片上傳功能未就緒' : '選擇照片上傳'}
                </span>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              支援 JPG、PNG、WEBP 格式，單張最大 5MB，最多 10 張
            </p>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {photos.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">尚未新增照片</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            案件特色標籤
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="輸入特色標籤 (例如：近捷運、有電梯)"
                className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>新增</span>
              </button>
            </div>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            周邊生活機能
          </label>
          <textarea
            value={formData.surroundings}
            onChange={(e) => handleInputChange('surroundings', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="描述周邊的交通、商店、學校等生活機能"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-gray-900 mb-2">
            案件說明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="詳細描述案件的特點、設備、裝潢等資訊"
          />
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
            className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? '儲存中...' : '儲存'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
