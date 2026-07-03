import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BenefitEvaluationFormProps {
  evaluationId: string | null;
  onClose: () => void;
}

export default function BenefitEvaluationForm({ evaluationId, onClose }: BenefitEvaluationFormProps) {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [formData, setFormData] = useState({
    case_address: '',
    property_type: '',
    layout: '',
    area: '',
    renovation_cost: '0',
    development_bonus: '0',
    monthly_rent_cost: '0',
    other_cost: '0',
    expected_rent_income: '0',
    contract_years: '3',
    expected_vacancy_months: '0',
    agency_service_months: '1',
    management_fee_ratio: '10',
  });

  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (evaluationId) {
      fetchEvaluation();
    }
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    try {
      const { data, error } = await supabase
        .from('benefit_evaluations')
        .select('*')
        .eq('id', evaluationId ?? '')
        .single();

      if (error) throw error;

      setFormData({
        case_address: data.case_address,
        property_type: data.property_type || '',
        layout: data.layout || '',
        area: data.area?.toString() || '',
        renovation_cost: data.renovation_cost.toString(),
        development_bonus: data.development_bonus.toString(),
        monthly_rent_cost: data.monthly_rent_cost.toString(),
        other_cost: data.other_cost?.toString() || '0',
        expected_rent_income: data.expected_rent_income.toString(),
        contract_years: data.contract_years.toString(),
        expected_vacancy_months: data.expected_vacancy_months.toString(),
        agency_service_months: data.agency_service_months.toString(),
        management_fee_ratio: data.management_fee_ratio.toString(),
      });
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      alert('載入評估表失敗');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePersonnelCost = () => {
    const years = Number(formData.contract_years);
    const expectedRent = Number(formData.expected_rent_income);
    const vacancyMonths = Number(formData.expected_vacancy_months);
    const bonus = Number(formData.development_bonus);
    return (years * 12 - vacancyMonths) * expectedRent * 0.04 + bonus;
  };

  const calculatePackageRental = () => {
    const years = Number(formData.contract_years);
    const renovationCost = Number(formData.renovation_cost);
    const personnelCost = calculatePersonnelCost();
    const rentCost = Number(formData.monthly_rent_cost);
    const otherCost = Number(formData.other_cost);

    const totalCost = renovationCost + personnelCost + (rentCost * 12 * years) + otherCost;

    const expectedRent = Number(formData.expected_rent_income);
    const vacancyMonths = Number(formData.expected_vacancy_months);
    const income = expectedRent * (12 * years - vacancyMonths);

    const profit = income - totalCost;

    return {
      renovationCost,
      personnelCost,
      rentCost,
      otherCost,
      totalCost,
      expectedRent,
      vacancyMonths,
      totalMonths: 12 * years,
      effectiveMonths: 12 * years - vacancyMonths,
      income,
      profit
    };
  };

  const calculatePropertyManagement = () => {
    const years = Number(formData.contract_years);
    const expectedRent = Number(formData.expected_rent_income);
    const agencyMonths = Number(formData.agency_service_months);
    const managementRatio = Number(formData.management_fee_ratio);
    const vacancyMonths = Number(formData.expected_vacancy_months);

    const agencyFee = agencyMonths * expectedRent;
    const effectiveMonths = 12 * years - vacancyMonths;
    const managementFee = expectedRent * (managementRatio / 100) * effectiveMonths;
    const profit = agencyFee + managementFee;

    return {
      expectedRent,
      agencyMonths,
      agencyFee,
      managementRatio,
      effectiveMonths,
      managementFee,
      profit
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const personnelCost = calculatePersonnelCost();

      const dataToSave = {
        case_address: formData.case_address,
        property_type: formData.property_type || null,
        layout: formData.layout || null,
        area: formData.area ? Number(formData.area) : null,
        renovation_cost: Number(formData.renovation_cost),
        personnel_cost: personnelCost,
        development_bonus: Number(formData.development_bonus),
        monthly_rent_cost: Number(formData.monthly_rent_cost),
        other_cost: Number(formData.other_cost),
        expected_rent_income: Number(formData.expected_rent_income),
        contract_years: Number(formData.contract_years),
        expected_vacancy_months: Number(formData.expected_vacancy_months),
        agency_service_months: Number(formData.agency_service_months),
        management_fee_ratio: Number(formData.management_fee_ratio),
      };

      if (evaluationId) {
        const { error } = await supabase
          .from('benefit_evaluations')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', evaluationId);

        if (error) throw error;
        alert('評估表已更新');
      } else {
        const { error } = await supabase
          .from('benefit_evaluations')
          .insert([{
            ...dataToSave,
            user_id: userId,
          }]);

        if (error) throw error;
        alert('評估表已新增');
      }

      onClose();
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const packageRental = calculatePackageRental();
  const propertyMgmt = calculatePropertyManagement();

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
        <h3 className="text-2xl font-bold text-gray-900">
          {evaluationId ? '編輯效益評估表' : '新增效益評估表'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          <h4 className="text-xl font-bold text-gray-900">基本資料</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-gray-700 mb-2">案件地址 *</label>
              <input
                type="text"
                required
                value={formData.case_address}
                onChange={(e) => handleInputChange('case_address', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">類型</label>
              <input
                type="text"
                value={formData.property_type}
                onChange={(e) => handleInputChange('property_type', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例：公寓、華廈、大樓"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">格局</label>
              <input
                type="text"
                value={formData.layout}
                onChange={(e) => handleInputChange('layout', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例：2房1廳1衛"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">坪數</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">包租代管年數 *</label>
              <input
                type="number"
                required
                step="1"
                min="1"
                value={formData.contract_years}
                onChange={(e) => handleInputChange('contract_years', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">預期空屋月數</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.expected_vacancy_months}
                onChange={(e) => handleInputChange('expected_vacancy_months', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">在合約期間內，房屋可能閒置的月數</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">預期出租租金 *</label>
              <input
                type="number"
                required
                step="1"
                min="0"
                value={formData.expected_rent_income}
                onChange={(e) => handleInputChange('expected_rent_income', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">每月租金收入</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg space-y-6">
          <h4 className="text-xl font-bold text-gray-900">成本項目（公司方）</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">修繕成本</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.renovation_cost}
                onChange={(e) => handleInputChange('renovation_cost', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">房屋裝修、整理費用</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">開發獎金</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.development_bonus}
                onChange={(e) => handleInputChange('development_bonus', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">開發人員獎勵金</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">每月承租租金</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.monthly_rent_cost}
                onChange={(e) => handleInputChange('monthly_rent_cost', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">公司向屋主承租的月租金</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">其他成本</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.other_cost}
                onChange={(e) => handleInputChange('other_cost', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">雜費、維修費等其他支出</p>
            </div>

            <div className="md:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="block text-lg font-semibold text-gray-700 mb-2">人事成本（自動計算）</label>
              <div className="text-2xl font-bold text-gray-900">
                NT$ {calculatePersonnelCost().toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                計算公式：(包租代管年數 × 12 - 預期空屋月數) × 預期出租租金 × 0.04 + 開發獎金
              </p>
              <p className="text-xs text-gray-500 mt-1">
                = ({formData.contract_years} × 12 - {formData.expected_vacancy_months}) × {Number(formData.expected_rent_income).toLocaleString()} × 0.04 + {Number(formData.development_bonus).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg space-y-6">
          <h4 className="text-xl font-bold text-gray-900">代管收入項目（公司方）</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">代租服務費收取月數</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.agency_service_months}
                onChange={(e) => handleInputChange('agency_service_months', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">代租服務費收取幾個月租金</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">管理費比率 (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.management_fee_ratio}
                onChange={(e) => handleInputChange('management_fee_ratio', e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">每月收取租金的百分比</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-end z-40">
          <div className="flex gap-3 max-w-[620px]">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg space-y-3 shadow-2xl border-2 border-blue-300 w-72">
              <h4 className="text-lg font-bold text-blue-900">包租 {formData.contract_years} 年效益</h4>

              <div className="space-y-2">
                <div className="bg-white bg-opacity-60 p-2 rounded border border-blue-400 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-900 font-semibold">預期出租租金：</span>
                    <span className="font-bold text-blue-900">NT$ {Number(formData.expected_rent_income).toLocaleString()}/月</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-900 font-semibold">每月承租租金：</span>
                    <span className="font-bold text-blue-900">NT$ {Number(formData.monthly_rent_cost).toLocaleString()}/月</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-900">成本：</span>
                  <span className="font-bold">NT$ {packageRental.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-900">收入：</span>
                  <span className="font-bold">NT$ {packageRental.income.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t-2 border-blue-300">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-blue-900">利潤：</span>
                    <span className={`text-lg font-bold ${packageRental.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      NT$ {packageRental.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 p-2 rounded border border-blue-400 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-900">平均年報酬率：</span>
                      <span className="text-[10px] text-blue-700" title="(利潤÷成本÷年數)×100%">ⓘ</span>
                    </div>
                    <span className={`font-bold text-sm ${
                      packageRental.totalCost > 0 && Number(formData.contract_years) > 0
                        ? (packageRental.profit / packageRental.totalCost / Number(formData.contract_years) * 100) >= 0
                          ? 'text-green-700'
                          : 'text-red-700'
                        : 'text-gray-500'
                    }`}>
                      {packageRental.totalCost > 0 && Number(formData.contract_years) > 0
                        ? `${(packageRental.profit / packageRental.totalCost / Number(formData.contract_years) * 100).toFixed(2)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg space-y-3 shadow-2xl border-2 border-green-300 w-72">
              <h4 className="text-lg font-bold text-green-900">代管 {formData.contract_years} 年效益</h4>

              <div className="space-y-2">
                <div className="bg-white bg-opacity-60 p-2 rounded border border-green-400 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-900 font-semibold">預期出租租金：</span>
                    <span className="font-bold text-green-900">NT$ {Number(formData.expected_rent_income).toLocaleString()}/月</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-900 font-semibold">每月承租租金：</span>
                    <span className="font-bold text-green-900">NT$ {Number(formData.monthly_rent_cost).toLocaleString()}/月</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-900">代租服務費：</span>
                  <span className="font-bold">NT$ {propertyMgmt.agencyFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-900">管理費：</span>
                  <span className="font-bold">NT$ {propertyMgmt.managementFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t-2 border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-green-900">利潤：</span>
                    <span className="text-lg font-bold text-green-700">
                      NT$ {propertyMgmt.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-400 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-green-900">平均年利潤：</span>
                      <span className="text-[10px] text-green-700" title="總利潤÷年數">ⓘ</span>
                    </div>
                    <span className="font-bold text-sm text-green-700">
                      {Number(formData.contract_years) > 0
                        ? `NT$ ${(propertyMgmt.profit / Number(formData.contract_years)).toLocaleString()}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
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
