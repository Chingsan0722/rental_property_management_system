import { ArrowLeft, Printer } from 'lucide-react';

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

interface BenefitEvaluationViewProps {
  evaluation: BenefitEvaluation;
  onClose: () => void;
}

export default function BenefitEvaluationView({ evaluation, onClose }: BenefitEvaluationViewProps) {
  const calculatePersonnelCost = () => {
    const years = evaluation.contract_years;
    const expectedRent = evaluation.expected_rent_income;
    const vacancyMonths = evaluation.expected_vacancy_months;
    const bonus = evaluation.development_bonus;
    return (years * 12 - vacancyMonths) * expectedRent * 0.04 + bonus;
  };

  const calculatePackageRental = () => {
    const years = evaluation.contract_years;
    const renovationCost = evaluation.renovation_cost;
    const personnelCost = calculatePersonnelCost();
    const rentCost = evaluation.monthly_rent_cost;

    const totalCost = renovationCost + personnelCost + (rentCost * 12 * years);

    const expectedRent = evaluation.expected_rent_income;
    const vacancyMonths = evaluation.expected_vacancy_months;
    const income = expectedRent * (12 * years - vacancyMonths);

    const profit = income - totalCost;

    return {
      renovationCost,
      personnelCost,
      rentCost: rentCost * 12 * years,
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
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-semibold">返回列表</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>列印</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 print:py-2 print:px-2">
        <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:p-4">
          <div className="text-center mb-4 pb-3 border-b-2 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">效益評估表</h1>
            <p className="text-base text-gray-600">貼心房屋管理顧問有限公司</p>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">案件資訊</h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
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
                <span className="font-semibold text-gray-700">預期租金：</span>
                <span className="text-gray-900">NT$ {evaluation.expected_rent_income.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-3">
              <h3 className="text-lg font-bold text-blue-900 mb-3">包租 {evaluation.contract_years} 年效益</h3>

              <div className="bg-white rounded p-2 mb-2">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">成本明細</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>修繕成本：</span>
                    <span className="font-semibold">NT$ {packageData.renovationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>人事成本：</span>
                    <span className="font-semibold">NT$ {packageData.personnelCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>承租成本：</span>
                    <span className="font-semibold">NT$ {packageData.rentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 mt-1 border-t border-gray-300">
                    <span className="font-bold text-gray-900">總成本：</span>
                    <span className="font-bold text-blue-700">NT$ {packageData.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-2 mb-2">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">收入明細</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>預期出租租金：</span>
                    <span className="font-semibold">NT$ {evaluation.expected_rent_income.toLocaleString()}/月</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>預期空屋月數：</span>
                    <span className="font-semibold">{evaluation.expected_vacancy_months} 個月</span>
                  </div>
                  <div className="flex justify-between pt-1 mt-1 border-t border-gray-300">
                    <span className="font-bold text-gray-900">總收入：</span>
                    <span className="font-bold text-green-700">NT$ {packageData.income.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 text-white rounded p-2.5 flex justify-between items-center">
                <span className="text-base font-bold">利潤：</span>
                <span className={`text-lg font-bold ${packageData.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  NT$ {packageData.profit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-3">
              <h3 className="text-lg font-bold text-green-900 mb-3">代管 {evaluation.contract_years} 年效益</h3>

              <div className="bg-white rounded p-2 mb-2">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">收益明細</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>代租服務費：</span>
                    <span className="font-semibold">NT$ {propertyData.agencyFee.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-2 -mt-0.5">
                    ({evaluation.agency_service_months} 個月 × NT$ {evaluation.expected_rent_income.toLocaleString()})
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>管理費：</span>
                    <span className="font-semibold">NT$ {propertyData.managementFee.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-2 -mt-0.5">
                    ({evaluation.management_fee_ratio}% × {12 * evaluation.contract_years - evaluation.expected_vacancy_months} 個月)
                  </div>
                </div>
              </div>

              <div className="bg-green-900 text-white rounded p-2.5 flex justify-between items-center mt-auto">
                <span className="text-base font-bold">利潤：</span>
                <span className="text-lg font-bold text-green-300">
                  NT$ {propertyData.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-gray-200 text-gray-600 text-sm">
            <p className="font-semibold">貼心房屋管理顧問有限公司</p>
            <p className="text-xs">感謝您的信任，期待為您服務</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .print\\:px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
