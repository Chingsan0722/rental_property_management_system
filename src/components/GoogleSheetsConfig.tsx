import { useState, useEffect } from 'react';
import { Link, RefreshCw, Save, AlertCircle } from 'lucide-react';

interface GoogleSheetsConfigProps {
  onClose: () => void;
  onSave: (apiKey: string, spreadsheetUrl: string) => void;
  initialApiKey?: string;
  initialSpreadsheetUrl?: string;
}

export default function GoogleSheetsConfig({
  onClose,
  onSave,
  initialApiKey = '',
  initialSpreadsheetUrl = '',
}: GoogleSheetsConfigProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(initialSpreadsheetUrl);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      alert('請輸入 Google Sheets API Key');
      return;
    }

    if (!spreadsheetUrl.trim()) {
      alert('請輸入 Google Sheets 連結');
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem('google_sheets_api_key', apiKey);
      localStorage.setItem('google_sheets_url', spreadsheetUrl);

      onSave(apiKey, spreadsheetUrl);
      alert('Google Sheets 設定已儲存！');
      onClose();
    } catch (error) {
      console.error('Error saving config:', error);
      alert('儲存設定失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Google Sheets 連結設定</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-2">設定前請先完成 Google Sheets API 設定：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>前往 Google Cloud Console 建立專案</li>
                <li>啟用 Google Sheets API</li>
                <li>建立 API 金鑰（API Key）</li>
                <li>將您的 Google Sheet 設為「知道連結的使用者」可檢視</li>
              </ol>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Google Sheets API Key *
            </label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-600">
              從 Google Cloud Console 取得的 API 金鑰
            </p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Google Sheets 連結 *
            </label>
            <input
              type="url"
              required
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-600">
              您的 Google Sheets 完整網址
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t">
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
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? '儲存中...' : '儲存設定'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
