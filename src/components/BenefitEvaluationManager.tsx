import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Eye, Search, ArrowUpDown, GitCompare, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BenefitEvaluationForm from './BenefitEvaluationForm';
import BenefitEvaluationView from './BenefitEvaluationView';

interface BenefitEvaluation {
  id: string;
  case_address: string;
  property_type: string | null;
  layout: string | null;
  area: number | null;
  renovation_cost: number;
  personnel_cost: number;
  development_bonus: number;
  monthly_rent_cost: number;
  expected_rent_income: number;
  contract_years: number;
  expected_vacancy_months: number;
  agency_service_months: number;
  management_fee_ratio: number;
  created_at: string;
}

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

export default function BenefitEvaluationManager() {
  const [evaluations, setEvaluations] = useState<BenefitEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const { data, error } = await supabase
        .from('benefit_evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvaluations(data || []);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此評估表嗎？')) return;

    try {
      const { error } = await supabase
        .from('benefit_evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchEvaluations();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
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
    fetchEvaluations();
  };

  const handleView = (id: string) => {
    setViewingId(id);
  };


  const handleCopy = async (id: string) => {
    if (!confirm('確定要複製此評估表嗎？')) return;

    try {
      const { data: evaluation, error: evaluationError } = await supabase
        .from('benefit_evaluations')
        .select('*')
        .eq('id', id)
        .single();

      if (evaluationError) throw evaluationError;

      const { error: insertError } = await supabase
        .from('benefit_evaluations')
        .insert([{
          case_address: `${evaluation.case_address} (複製)`,
          property_type: evaluation.property_type,
          layout: evaluation.layout,
          area: evaluation.area,
          renovation_cost: evaluation.renovation_cost,
          personnel_cost: evaluation.personnel_cost,
          development_bonus: evaluation.development_bonus,
          monthly_rent_cost: evaluation.monthly_rent_cost,
          other_cost: evaluation.other_cost,
          expected_rent_income: evaluation.expected_rent_income,
          contract_years: evaluation.contract_years,
          expected_vacancy_months: evaluation.expected_vacancy_months,
          agency_service_months: evaluation.agency_service_months,
          management_fee_ratio: evaluation.management_fee_ratio,
        }]);

      if (insertError) throw insertError;

      alert('評估表已複製');
      await fetchEvaluations();
    } catch (error) {
      console.error('Error copying evaluation:', error);
      alert('複製失敗');
    }
  };

  const calculatePersonnelCost = (evaluation: BenefitEvaluation) => {
    const years = evaluation.contract_years;
    const expectedRent = evaluation.expected_rent_income;
    const vacancyMonths = evaluation.expected_vacancy_months;
    const bonus = evaluation.development_bonus;
    return (years * 12 - vacancyMonths) * expectedRent * 0.04 + bonus;
  };

  const calculatePackageRental = (evaluation: BenefitEvaluation) => {
    const personnelCost = calculatePersonnelCost(evaluation);
    const cost = evaluation.renovation_cost + personnelCost +
                 (evaluation.monthly_rent_cost * 12 * evaluation.contract_years);
    const income = evaluation.expected_rent_income * (12 * evaluation.contract_years - evaluation.expected_vacancy_months);
    const profit = income - cost;
    return { cost, income, profit };
  };

  const calculatePropertyManagement = (evaluation: BenefitEvaluation) => {
    const agencyFee = evaluation.agency_service_months * evaluation.expected_rent_income;
    const managementFee = evaluation.expected_rent_income * (evaluation.management_fee_ratio / 100) *
                          (12 * evaluation.contract_years - evaluation.expected_vacancy_months);
    const profit = agencyFee + managementFee;
    return { agencyFee, managementFee, profit };
  };

  const handleCompareToggle = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(evalId => evalId !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      const eval1 = evaluations.find(e => e.id === selectedForCompare[0]);
      const eval2 = evaluations.find(e => e.id === selectedForCompare[1]);
      if (eval1 && eval2) {
        showComparisonView(eval1, eval2);
      }
    }
  };

  const showComparisonView = (eval1: BenefitEvaluation, eval2: BenefitEvaluation) => {
    const package1 = calculatePackageRental(eval1);
    const package2 = calculatePackageRental(eval2);
    const mgmt1 = calculatePropertyManagement(eval1);
    const mgmt2 = calculatePropertyManagement(eval2);
    const personnelCost1 = calculatePersonnelCost(eval1);
    const personnelCost2 = calculatePersonnelCost(eval2);

    const comparisonHTML = `
      <div style="font-family: sans-serif; padding: 2rem;">
        <h2 style="text-align: center; margin-bottom: 2rem;">效益評估比較表</h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 1.5rem;">
            <h3 style="color: #1e40af; margin-bottom: 1rem;">${eval1.case_address}</h3>
            <div style="margin-bottom: 1rem;">
              <div><strong>類型：</strong>${eval1.property_type || '-'}</div>
              <div><strong>格局：</strong>${eval1.layout || '-'}</div>
              <div><strong>坪數：</strong>${eval1.area || '-'} 坪</div>
            </div>
            <div style="background: #dbeafe; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
              <h4 style="margin-bottom: 0.5rem;">包租 ${eval1.contract_years} 年</h4>
              <div>修繕成本：NT$ ${eval1.renovation_cost.toLocaleString()}</div>
              <div>人事成本：NT$ ${personnelCost1.toLocaleString()}</div>
              <div>開發獎金：NT$ ${eval1.development_bonus.toLocaleString()}</div>
              <div>承租成本：NT$ ${(eval1.monthly_rent_cost * 12 * eval1.contract_years).toLocaleString()}</div>
              <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #93c5fd;">
                <strong>總成本：NT$ ${package1.cost.toLocaleString()}</strong>
              </div>
              <div style="margin-top: 0.5rem;">
                <strong>總收入：NT$ ${package1.income.toLocaleString()}</strong>
              </div>
              <div style="margin-top: 0.5rem; font-size: 1.1rem;">
                <strong style="color: ${package1.profit >= 0 ? '#16a34a' : '#dc2626'};">
                  利潤：NT$ ${package1.profit.toLocaleString()}
                </strong>
              </div>
            </div>
            <div style="background: #d1fae5; padding: 1rem; border-radius: 6px;">
              <h4 style="margin-bottom: 0.5rem;">代管 ${eval1.contract_years} 年</h4>
              <div>代租服務費：NT$ ${mgmt1.agencyFee.toLocaleString()}</div>
              <div>管理費：NT$ ${mgmt1.managementFee.toLocaleString()}</div>
              <div style="margin-top: 0.5rem; font-size: 1.1rem;">
                <strong style="color: #16a34a;">利潤：NT$ ${mgmt1.profit.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1.5rem;">
            <h3 style="color: #047857; margin-bottom: 1rem;">${eval2.case_address}</h3>
            <div style="margin-bottom: 1rem;">
              <div><strong>類型：</strong>${eval2.property_type || '-'}</div>
              <div><strong>格局：</strong>${eval2.layout || '-'}</div>
              <div><strong>坪數：</strong>${eval2.area || '-'} 坪</div>
            </div>
            <div style="background: #dbeafe; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
              <h4 style="margin-bottom: 0.5rem;">包租 ${eval2.contract_years} 年</h4>
              <div>修繕成本：NT$ ${eval2.renovation_cost.toLocaleString()}</div>
              <div>人事成本：NT$ ${personnelCost2.toLocaleString()}</div>
              <div>開發獎金：NT$ ${eval2.development_bonus.toLocaleString()}</div>
              <div>承租成本：NT$ ${(eval2.monthly_rent_cost * 12 * eval2.contract_years).toLocaleString()}</div>
              <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #93c5fd;">
                <strong>總成本：NT$ ${package2.cost.toLocaleString()}</strong>
              </div>
              <div style="margin-top: 0.5rem;">
                <strong>總收入：NT$ ${package2.income.toLocaleString()}</strong>
              </div>
              <div style="margin-top: 0.5rem; font-size: 1.1rem;">
                <strong style="color: ${package2.profit >= 0 ? '#16a34a' : '#dc2626'};">
                  利潤：NT$ ${package2.profit.toLocaleString()}
                </strong>
              </div>
            </div>
            <div style="background: #d1fae5; padding: 1rem; border-radius: 6px;">
              <h4 style="margin-bottom: 0.5rem;">代管 ${eval2.contract_years} 年</h4>
              <div>代租服務費：NT$ ${mgmt2.agencyFee.toLocaleString()}</div>
              <div>管理費：NT$ ${mgmt2.managementFee.toLocaleString()}</div>
              <div style="margin-top: 0.5rem; font-size: 1.1rem;">
                <strong style="color: #16a34a;">利潤：NT$ ${mgmt2.profit.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 2rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
          <h4 style="margin-bottom: 0.5rem;">差異比較</h4>
          <div>包租利潤差：NT$ ${(package1.profit - package2.profit).toLocaleString()}</div>
          <div>代管利潤差：NT$ ${(mgmt1.profit - mgmt2.profit).toLocaleString()}</div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(comparisonHTML);
      printWindow.document.close();
    }
  };

  const sortEvaluations = (evals: BenefitEvaluation[]) => {
    const sorted = [...evals];
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'name_asc':
        return sorted.sort((a, b) => a.case_address.localeCompare(b.case_address));
      case 'name_desc':
        return sorted.sort((a, b) => b.case_address.localeCompare(a.case_address));
      default:
        return sorted;
    }
  };

  const filteredEvaluations = sortEvaluations(
    evaluations.filter(e =>
      e.case_address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (showForm) {
    return <BenefitEvaluationForm evaluationId={editingId} onClose={handleFormClose} />;
  }

  if (viewingId) {
    const evaluation = evaluations.find(e => e.id === viewingId);
    if (evaluation) {
      return <BenefitEvaluationView evaluation={evaluation} onClose={() => setViewingId(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">效益評估表</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedForCompare([]);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors text-lg shadow-md ${
              compareMode ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <GitCompare className="w-5 h-5" />
            <span>{compareMode ? '取消比較' : '比較模式'}</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>新增評估表</span>
          </button>
        </div>
      </div>

      {compareMode && selectedForCompare.length === 2 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-orange-900">已選擇 2 個評估表進行比較</span>
            <button
              onClick={handleCompare}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              開始比較
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜尋案件地址..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white cursor-pointer"
            >
              <option value="newest">由新到舊</option>
              <option value="oldest">由舊到新</option>
              <option value="name_asc">名稱 A-Z</option>
              <option value="name_desc">名稱 Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-xl">載入中...</div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xl">
          {searchTerm ? '找不到符合的評估表' : '尚無評估表資料'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredEvaluations.map((evaluation) => {
            const packageRental = calculatePackageRental(evaluation);
            const propertyMgmt = calculatePropertyManagement(evaluation);

            return (
              <div key={evaluation.id} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                compareMode && selectedForCompare.includes(evaluation.id) ? 'ring-4 ring-orange-400' : ''
              }`}>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        {compareMode && (
                          <input
                            type="checkbox"
                            checked={selectedForCompare.includes(evaluation.id)}
                            onChange={() => handleCompareToggle(evaluation.id)}
                            disabled={!selectedForCompare.includes(evaluation.id) && selectedForCompare.length >= 2}
                            className="w-6 h-6 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                          />
                        )}
                        <h3 className="text-2xl font-bold text-gray-900">{evaluation.case_address}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-700">
                        <div className="text-lg">
                          <span className="font-semibold">類型：</span>{evaluation.property_type || '-'}
                        </div>
                        <div className="text-lg">
                          <span className="font-semibold">格局：</span>{evaluation.layout || '-'}
                        </div>
                        <div className="text-lg">
                          <span className="font-semibold">坪數：</span>{evaluation.area || '-'} 坪
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                          <h4 className="text-lg font-bold text-blue-900 mb-3">包租 {evaluation.contract_years} 年</h4>
                          <div className="space-y-2 text-base">
                            <div className="bg-white bg-opacity-60 p-2 rounded border border-blue-300 space-y-1 mb-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-900 font-semibold">預期出租租金：</span>
                                <span className="font-bold text-blue-900">NT$ {evaluation.expected_rent_income.toLocaleString()}/月</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-900 font-semibold">每月承租租金：</span>
                                <span className="font-bold text-blue-900">NT$ {evaluation.monthly_rent_cost.toLocaleString()}/月</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>成本：</span>
                              <span className="font-semibold">NT$ {packageRental.cost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>收入：</span>
                              <span className="font-semibold">NT$ {packageRental.income.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-blue-200">
                              <span className="font-bold">利潤：</span>
                              <span className={`font-bold ${packageRental.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                NT$ {packageRental.profit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-300 mt-2">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-blue-900">平均年報酬率：</span>
                                <span className="text-xs text-blue-700" title="計算公式：(利潤 ÷ 成本 ÷ 年數) × 100%">ⓘ</span>
                              </div>
                              <span className={`font-bold text-lg ${
                                packageRental.cost > 0 && evaluation.contract_years > 0
                                  ? (packageRental.profit / packageRental.cost / evaluation.contract_years * 100) >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                  : 'text-gray-500'
                              }`}>
                                {packageRental.cost > 0 && evaluation.contract_years > 0
                                  ? `${(packageRental.profit / packageRental.cost / evaluation.contract_years * 100).toFixed(2)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                          <h4 className="text-lg font-bold text-green-900 mb-3">代管 {evaluation.contract_years} 年</h4>
                          <div className="space-y-2 text-base">
                            <div className="bg-white bg-opacity-60 p-2 rounded border border-green-300 space-y-1 mb-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-green-900 font-semibold">預期出租租金：</span>
                                <span className="font-bold text-green-900">NT$ {evaluation.expected_rent_income.toLocaleString()}/月</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-green-900 font-semibold">每月承租租金：</span>
                                <span className="font-bold text-green-900">NT$ {evaluation.monthly_rent_cost.toLocaleString()}/月</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>代租服務費：</span>
                              <span className="font-semibold">NT$ {propertyMgmt.agencyFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>管理費：</span>
                              <span className="font-semibold">NT$ {propertyMgmt.managementFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-200">
                              <span className="font-bold">利潤：</span>
                              <span className="font-bold text-green-600">
                                NT$ {propertyMgmt.profit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-300 mt-2">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-green-900">平均年利潤：</span>
                                <span className="text-xs text-green-700" title="計算公式：總利潤 ÷ 年數">ⓘ</span>
                              </div>
                              <span className="font-bold text-lg text-green-600">
                                {evaluation.contract_years > 0
                                  ? `NT$ ${(propertyMgmt.profit / evaluation.contract_years).toLocaleString()}`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleView(evaluation.id)}
                        className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        title="檢視"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="hidden sm:inline">檢視</span>
                      </button>
                      <button
                        onClick={() => handleCopy(evaluation.id)}
                        className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        title="複製"
                      >
                        <Copy className="w-5 h-5" />
                        <span className="hidden sm:inline">複製</span>
                      </button>
                      <button
                        onClick={() => handleEdit(evaluation.id)}
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="編輯"
                      >
                        <Edit2 className="w-5 h-5" />
                        <span className="hidden sm:inline">編輯</span>
                      </button>
                      <button
                        onClick={() => handleDelete(evaluation.id)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
