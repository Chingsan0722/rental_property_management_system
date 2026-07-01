import { useState } from 'react';
import { X, Printer } from 'lucide-react';

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
  other_cost?: number;
}

interface BenefitEvaluationPreviewProps {
  evaluation: BenefitEvaluation;
  onClose: () => void;
}

export default function BenefitEvaluationPreview({ evaluation, onClose }: BenefitEvaluationPreviewProps) {
  const [ownerPaidRenovation, setOwnerPaidRenovation] = useState(false);
  const [customMonthlyRent, setCustomMonthlyRent] = useState<string>(evaluation.monthly_rent_cost.toString());

  const calculatePersonnelCost = () => {
    const years = evaluation.contract_years;
    const expectedRent = evaluation.expected_rent_income;
    const vacancyMonths = evaluation.expected_vacancy_months;
    const bonus = evaluation.development_bonus;
    return (years * 12 - vacancyMonths) * expectedRent * 0.04 + bonus;
  };

  const calculatePackageRental = () => {
    const years = evaluation.contract_years;
    const renovationCost = ownerPaidRenovation ? 0 : evaluation.renovation_cost;
    const personnelCost = calculatePersonnelCost();
    const rentCost = Number(customMonthlyRent);
    const otherCost = evaluation.other_cost || 0;

    const totalCost = renovationCost + personnelCost + (rentCost * 12 * years) + otherCost;

    const expectedRent = evaluation.expected_rent_income;
    const vacancyMonths = evaluation.expected_vacancy_months;
    const income = expectedRent * (12 * years - vacancyMonths);

    const profit = income - totalCost;

    return {
      renovationCost,
      personnelCost,
      rentCost: rentCost * 12 * years,
      otherCost,
      totalCost,
      income,
      profit
    };
  };

  const calculatePropertyManagement = () => {
    const years = evaluation.contract_years;
    const expectedRent = evaluation.expected_rent_income;
    const agencyMonths = evaluation.agency_service_months;
    const managementRatio = evaluation.management_fee_ratio;
    const vacancyMonths = evaluation.expected_vacancy_months;

    const agencyFee = agencyMonths * expectedRent;
    const effectiveMonths = 12 * years - vacancyMonths;
    const managementFee = expectedRent * (managementRatio / 100) * effectiveMonths;
    const profit = agencyFee + managementFee;

    return {
      agencyFee,
      managementFee,
      profit
    };
  };

  const packageData = calculatePackageRental();
  const propertyData = calculatePropertyManagement();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg print:hidden z-10">
          <h2 className="text-2xl font-bold text-gray-900">效益評估預覽</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span>列印</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="print:hidden bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ownerPaid"
                checked={ownerPaidRenovation}
                onChange={(e) => setOwnerPaidRenovation(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="ownerPaid" className="text-lg font-semibold text-gray-900 cursor-pointer">
                屋主自費裝修（修繕成本歸零）
              </label>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                調整每月承租租金
              </label>
              <input
                type="number"
                value={customMonthlyRent}
                onChange={(e) => setCustomMonthlyRent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                原始金額：NT$ {evaluation.monthly_rent_cost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">效益評估表</h1>
            <p className="text-gray-600">貼心房屋管理顧問有限公司</p>
          </div>

          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 space-y-3">
            <h3 className="text-xl font-bold text-gray-900 mb-4">案件資訊</h3>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <span className="font-semibold text-gray-700">案件地址：</span>
                <span className="text-gray-900">{evaluation.case_address}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">物件類型：</span>
                <span className="text-gray-900">{evaluation.property_type || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">格局：</span>
                <span className="text-gray-900">{evaluation.layout || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">坪數：</span>
                <span className="text-gray-900">{evaluation.area || '-'} 坪</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">合約年數：</span>
                <span className="text-gray-900">{evaluation.contract_years} 年</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">預期出租租金：</span>
                <span className="text-gray-900">NT$ {evaluation.expected_rent_income.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">包租 {evaluation.contract_years} 年效益</h3>

              <div className="space-y-3 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">成本明細</h4>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-700">修繕成本：</span>
                      <span className="font-semibold">
                        NT$ {packageData.renovationCost.toLocaleString()}
                        {ownerPaidRenovation && <span className="text-green-600 ml-2">(屋主自費)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">人事成本：</span>
                      <span className="font-semibold">NT$ {packageData.personnelCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">承租成本：</span>
                      <span className="font-semibold">NT$ {packageData.rentCost.toLocaleString()}</span>
                    </div>
                    {packageData.otherCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">其他成本：</span>
                        <span className="font-semibold">NT$ {packageData.otherCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-bold text-gray-900">總成本：</span>
                      <span className="font-bold text-blue-700">NT$ {packageData.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">收入明細</h4>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-700">預期出租租金：</span>
                      <span className="font-semibold">NT$ {evaluation.expected_rent_income.toLocaleString()}/月</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">預期空屋月數：</span>
                      <span className="font-semibold">{evaluation.expected_vacancy_months} 個月</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-bold text-gray-900">總收入：</span>
                      <span className="font-bold text-green-700">NT$ {packageData.income.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">利潤：</span>
                  <span className={`text-2xl font-bold ${packageData.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    NT$ {packageData.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-900 mb-4">代管 {evaluation.contract_years} 年效益</h3>

              <div className="space-y-3 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">收益明細</h4>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-700">代租服務費：</span>
                      <span className="font-semibold">NT$ {propertyData.agencyFee.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-4 -mt-1">
                      ({evaluation.agency_service_months} 個月 × NT$ {evaluation.expected_rent_income.toLocaleString()})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">管理費：</span>
                      <span className="font-semibold">NT$ {propertyData.managementFee.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-4 -mt-1">
                      ({evaluation.management_fee_ratio}% × {12 * evaluation.contract_years - evaluation.expected_vacancy_months} 個月)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-900 text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">利潤：</span>
                  <span className="text-2xl font-bold text-green-300">
                    NT$ {propertyData.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600">
            <p>貼心房屋管理顧問有限公司</p>
            <p className="mt-1 text-sm">感謝您的信任，期待為您服務</p>
          </div>
        </div>
      </div>
    </div>
  );
}
