import { useState } from 'react';
import { AlertCircle, Link, Save } from 'lucide-react';

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

    if (!spreadsheetUrl.trim()) {
      alert('請輸入 Google Sheets 連結');
      return;
    }

    setSaving(true);
    try {
      const trimmedApiKey = apiKey.trim();
      const trimmedSpreadsheetUrl = spreadsheetUrl.trim();

      if (trimmedApiKey) {
        localStorage.setItem('google_sheets_api_key', trimmedApiKey);
      } else {
        localStorage.removeItem('google_sheets_api_key');
      }
      localStorage.setItem('google_sheets_url', trimmedSpreadsheetUrl);

      onSave(trimmedApiKey, trimmedSpreadsheetUrl);
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
            type="button"
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-2">讀取公開 Google Sheet 前請確認：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Google Sheet 已設為知道連結的使用者可檢視</li>
                <li>連結保留 gid，例如 edit?gid=0#gid=0</li>
                <li>第一列是系統欄位名稱，第二列可放中文欄位說明</li>
                <li>API Key 可留空；只有需要寫回 Google Sheets 時才需要設定</li>
              </ol>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Google Sheets API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy...（可留空）"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-600">
              從公開試算表讀取時可留空。
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
              請貼上完整 Google Sheets 網址。
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
