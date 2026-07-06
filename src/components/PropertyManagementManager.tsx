import { useState, useEffect } from 'react';
import { Link as LinkIcon, FileImage, Download, Building2, DollarSign } from 'lucide-react';
import GoogleSheetsConfig from './GoogleSheetsConfig';
import MonthlyBillGenerator from './MonthlyBillGenerator';
import CaseManagement from './CaseManagement';
import RentCollection from './RentCollection';
import { GoogleSheetsService, parseGoogleSheetsUrl } from '../lib/googleSheets';
import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/currentUser';
import { useAuth } from '../lib/auth';

export default function PropertyManagementManager() {
  const { canEdit } = useAuth();
  const [activeTab, setActiveTab] = useState<'management' | 'collection' | 'billing'>('management');
  const [showConfig, setShowConfig] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkGoogleSheetsConnection();
    fetchCases();
  }, []);

  const checkGoogleSheetsConnection = () => {
    const spreadsheetUrl = localStorage.getItem('google_sheets_url');
    setGoogleSheetsConnected(!!spreadsheetUrl);
  };

  const fetchCases = async () => {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('property_management_cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const handleSaveConfig = async () => {
    checkGoogleSheetsConnection();
  };

  const handleSyncFromGoogleSheets = async () => {
    if (!canEdit) {
      alert('此帳號僅供檢視，不能同步 Google Sheet。');
      return;
    }

    const apiKey = localStorage.getItem('google_sheets_api_key');
    const spreadsheetUrl = localStorage.getItem('google_sheets_url');

    if (!spreadsheetUrl) {
      alert('請先設定 Google Sheets 連結');
      setShowConfig(true);
      return;
    }

    setSyncing(true);

    try {
      const userId = await getCurrentUserId();
      const parsed = parseGoogleSheetsUrl(spreadsheetUrl);
      if (!parsed) {
        throw new Error('無效的 Google Sheets 連結');
      }

      const sheetsService = new GoogleSheetsService({
        apiKey: apiKey || undefined,
        spreadsheetId: parsed.spreadsheetId,
        gid: parsed.gid,
      });

      const sheetData = await sheetsService.readData();

      const { data: existingCases } = await supabase
        .from('property_management_cases')
        .select('*')
        .eq('user_id', userId);

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const row of sheetData) {
        // 驗證必填欄位
        if (!row.case_number || !row.case_address) {
          failCount++;
          errors.push(`第 ${sheetData.indexOf(row) + 2} 行：缺少必填欄位（案件編號或地址）`);
          continue;
        }

        try {
          const existingCase = existingCases?.find(c => c.case_address === row.case_address);

          if (existingCase) {
            const { error } = await supabase
              .from('property_management_cases')
              .update({
                case_number: row.case_number,
                manager_name: row.manager_name || null,
                owner_name: row.owner_name || null,
                owner_phone: row.owner_phone || null,
                owner_id_number: row.owner_id_number || null,
                tenant_name: row.tenant_name || null,
                tenant_phone: row.tenant_phone || null,
                property_type: row.property_type || null,
                layout: row.layout || null,
                area: row.area || null,
                monthly_rent: row.monthly_rent || null,
                management_fee_ratio: row.management_fee_ratio || null,
                management_fee: row.management_fee || null,
                payment_frequency: row.payment_frequency || null,
                water_electricity_billing: row.water_electricity_billing || null,
                contract_start_date: row.contract_start_date || null,
                contract_end_date: row.contract_end_date || null,
                deposit: row.deposit || null,
                payment_status: row.payment_status || null,
                status: row.status || null,
                commission: row.commission || null,
                commission_notes: row.commission_notes || null,
                notes: row.notes || null,
                water_fee: row.water_fee || null,
                electricity_fee: row.electricity_fee || null,
                rent_payment_date: row.rent_payment_date || null,
                utility_settlement_date: row.utility_settlement_date || null,
                last_public_ekwh: row.last_public_ekwh || null,
                recent_public_ekwh: row.recent_public_ekwh || null,
                last_private_ekwh: row.last_private_ekwh || null,
                recent_private_ekwh: row.recent_private_ekwh || null,
                last_synced_at: new Date().toISOString(),
              })
              .eq('id', existingCase.id);

            if (error) {
              console.error('Update error:', error);
              failCount++;
              errors.push(`更新失敗 (地址: ${row.case_address}): ${error.message}`);
            } else {
              successCount++;
            }
          } else {
            const { error } = await supabase
              .from('property_management_cases')
              .insert({
                user_id: userId,
                case_number: row.case_number,
                case_address: row.case_address,
                manager_name: row.manager_name || null,
                owner_name: row.owner_name || null,
                owner_phone: row.owner_phone || null,
                owner_id_number: row.owner_id_number || null,
                tenant_name: row.tenant_name || null,
                tenant_phone: row.tenant_phone || null,
                property_type: row.property_type || null,
                layout: row.layout || null,
                area: row.area || null,
                monthly_rent: row.monthly_rent || null,
                management_fee_ratio: row.management_fee_ratio || null,
                management_fee: row.management_fee || null,
                payment_frequency: row.payment_frequency || null,
                water_electricity_billing: row.water_electricity_billing || null,
                contract_start_date: row.contract_start_date || null,
                contract_end_date: row.contract_end_date || null,
                deposit: row.deposit || null,
                payment_status: row.payment_status || null,
                status: row.status || null,
                commission: row.commission || null,
                commission_notes: row.commission_notes || null,
                notes: row.notes || null,
                water_fee: row.water_fee || null,
                electricity_fee: row.electricity_fee || null,
                rent_payment_date: row.rent_payment_date || null,
                utility_settlement_date: row.utility_settlement_date || null,
                last_public_ekwh: row.last_public_ekwh || null,
                recent_public_ekwh: row.recent_public_ekwh || null,
                last_private_ekwh: row.last_private_ekwh || null,
                recent_private_ekwh: row.recent_private_ekwh || null,
                last_synced_at: new Date().toISOString(),
              });

            if (error) {
              console.error('Insert error:', error);
              failCount++;
              errors.push(`新增失敗 (地址: ${row.case_address}): ${error.message}`);
            } else {
              successCount++;
            }
          }
        } catch (err: any) {
          failCount++;
          errors.push(`處理失敗 (地址: ${row.case_address}): ${err.message}`);
        }
      }

      await fetchCases();
      setRefreshKey(prev => prev + 1);
      setLastSyncTime(new Date().toLocaleString('zh-TW'));

      // 顯示詳細結果
      if (failCount > 0) {
        console.error('同步錯誤詳情:', errors);
        alert(
          `同步完成：\n` +
          `成功：${successCount} 筆\n` +
          `失敗：${failCount} 筆\n\n` +
          `錯誤詳情：\n${errors.slice(0, 5).join('\n')}` +
          (errors.length > 5 ? `\n...(還有 ${errors.length - 5} 個錯誤，請查看 Console)` : '')
        );
      } else if (successCount > 0) {
        alert(`成功從 Google Sheets 同步 ${successCount} 筆資料！`);
      } else {
        alert('沒有資料被同步。請確認 Google Sheets 中有有效的資料。');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      alert(`同步失敗：${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-gray-900">代管案件管理</h2>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('management')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'management'
                ? 'border-teal-600 text-teal-700 bg-teal-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>案件管理</span>
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'collection'
                ? 'border-teal-600 text-teal-700 bg-teal-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>收租情況</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'billing'
                ? 'border-teal-600 text-teal-700 bg-teal-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileImage className="w-5 h-5" />
            <span>匯出收費明細</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <LinkIcon className={`w-5 h-5 ${googleSheetsConnected ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-gray-700">
                {googleSheetsConnected ? 'Google Sheets 已連結' : '未連結 Google Sheets'}
              </span>
            </div>

            {lastSyncTime && (
              <span className="text-sm text-gray-600">
                最後同步：{lastSyncTime}
              </span>
            )}

            <div className="flex gap-2 ml-auto">
              {canEdit && (
                <button
                  onClick={() => setShowConfig(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  {googleSheetsConnected ? '重新設定' : '設定連結'}
                </button>
              )}

              {googleSheetsConnected && canEdit && (
                <button
                  onClick={handleSyncFromGoogleSheets}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400"
                >
                  <Download className="w-4 h-4" />
                  {syncing ? '同步中...' : '從 Sheet 讀取'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'management' && <CaseManagement key={refreshKey} />}
      {activeTab === 'collection' && <RentCollection key={refreshKey} />}
      {activeTab === 'billing' && <MonthlyBillGenerator cases={cases} />}

      {showConfig && (
        <GoogleSheetsConfig
          onClose={() => setShowConfig(false)}
          onSave={handleSaveConfig}
          initialApiKey={localStorage.getItem('google_sheets_api_key') || ''}
          initialSpreadsheetUrl={localStorage.getItem('google_sheets_url') || ''}
        />
      )}
    </div>
  );
}
