import { useState } from 'react';
import { Table2, FileText } from 'lucide-react';
import SpreadsheetCaseManager from './SpreadsheetCaseManager';
import CaseCardView from './CaseCardView';

export default function PackageRentalManager() {
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'form'>('spreadsheet');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">包租案件管理</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('spreadsheet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'spreadsheet'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Table2 className="w-5 h-5" />
            <span>試算表模式</span>
          </button>
          <button
            onClick={() => setViewMode('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'form'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>表單模式</span>
          </button>
        </div>
      </div>

      {viewMode === 'spreadsheet' ? (
        <SpreadsheetCaseManager caseType="package" title="包租案件" />
      ) : (
        <CaseCardView caseType="package" title="包租案件" />
      )}
    </div>
  );
}
