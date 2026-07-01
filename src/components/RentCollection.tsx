import { useState, useEffect } from 'react';
import { Calendar, DollarSign, AlertCircle, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PropertyCase {
  id: string;
  case_number: string;
  case_address: string;
  tenant_name: string | null;
  monthly_rent: number | null;
  management_fee: number | null;
  water_fee: number | null;
  electricity_fee: number | null;
  rent_payment_date: string | null;
  contract_start_date: string | null;
  status: string | null;
  utility_settlement_date: string | null;
  last_public_ekwh: number | null;
  recent_public_ekwh: number | null;
  last_private_ekwh: number | null;
  recent_private_ekwh: number | null;
}

type PaymentStatus = 'need_payment' | 'no_payment_needed' | 'overdue';

export default function RentCollection() {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [cases, setCases] = useState<PropertyCase[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('property_management_cases')
        .select('*')
        .eq('user_id', userId)
        .not('tenant_name', 'is', null)
        .order('case_address', { ascending: true });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = (rentPaymentDate: string | null): PaymentStatus => {
    if (!rentPaymentDate) return 'no_payment_needed';

    const paymentDate = new Date(rentPaymentDate);
    const paymentMonth = paymentDate.getMonth() + 1;
    const paymentYear = paymentDate.getFullYear();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (paymentMonth !== selectedMonth) {
      if (paymentYear < selectedYear || (paymentYear === selectedYear && paymentMonth < selectedMonth)) {
        return 'overdue';
      }
      return 'no_payment_needed';
    }

    const paymentDay = paymentDate.getDate();
    const currentDay = today.getDate();

    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
      return 'overdue';
    }

    if (selectedYear === currentYear && selectedMonth === currentMonth && currentDay > paymentDay) {
      return 'overdue';
    }

    return 'need_payment';
  };

  const getFilteredCases = () => {
    return cases.filter(caseItem => {
      const status = checkPaymentStatus(caseItem.rent_payment_date);
      if (filterStatus === 'all') return true;
      return status === filterStatus;
    });
  };

  const getCaseCounts = () => {
    const counts = {
      need_payment: 0,
      no_payment_needed: 0,
      overdue: 0,
      total: cases.length,
    };

    cases.forEach(caseItem => {
      const status = checkPaymentStatus(caseItem.rent_payment_date);
      counts[status]++;
    });

    return counts;
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'need_payment':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Calendar className="w-4 h-4" />
            需繳費
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            已逾期
          </span>
        );
      case 'no_payment_needed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            本月已繳費
          </span>
        );
    }
  };

  const shouldSettleUtilitiesThisMonth = (utilitySettlementDate: string | null) => {
    if (!utilitySettlementDate) return false;

    const settlementDate = new Date(utilitySettlementDate);
    const settlementMonth = settlementDate.getMonth() + 1;

    return settlementMonth === selectedMonth;
  };

  const calculateWaterFee = (caseItem: PropertyCase) => {
    if (!shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date)) {
      return 0;
    }

    return (caseItem.water_fee || 100) * 3;
  };

  const calculateElectricityFee = (caseItem: PropertyCase) => {
    if (!shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date)) {
      return 0;
    }

    const publicUsage = (caseItem.recent_public_ekwh || 0) - (caseItem.last_public_ekwh || 0);
    const privateUsage = (caseItem.recent_private_ekwh || 0) - (caseItem.last_private_ekwh || 0);
    const totalUsage = publicUsage + privateUsage;

    const ratePerKwh = 5;
    return totalUsage * ratePerKwh;
  };

  const calculateTotalAmount = (caseItem: PropertyCase) => {
    const waterFee = calculateWaterFee(caseItem);
    const electricityFee = calculateElectricityFee(caseItem);

    return (
      (caseItem.monthly_rent || 0) +
      waterFee +
      electricityFee +
      (caseItem.management_fee || 0)
    );
  };

  const getNextUtilitySettlementDate = (utilitySettlementDate: string | null) => {
    if (!utilitySettlementDate) return null;

    const settlementDate = new Date(utilitySettlementDate);
    const nextSettlement = new Date(settlementDate);
    nextSettlement.setMonth(nextSettlement.getMonth() + 3);

    return nextSettlement;
  };

  const getNextPaymentDate = (rentPaymentDate: string | null) => {
    if (!rentPaymentDate) return null;

    const paymentDate = new Date(rentPaymentDate);
    const paymentDay = paymentDate.getDate();
    const today = new Date();

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let nextPaymentDate = new Date(currentYear, currentMonth, paymentDay);

    if (currentDay >= paymentDay) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    return nextPaymentDate;
  };

  const filteredCases = getFilteredCases();
  const counts = getCaseCounts();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">選擇期間：</label>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month} 月</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | PaymentStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">全部顯示 ({counts.total})</option>
              <option value="need_payment">需繳費 ({counts.need_payment})</option>
              <option value="overdue">已逾期 ({counts.overdue})</option>
              <option value="no_payment_needed">本月已繳費 ({counts.no_payment_needed})</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterStatus(filterStatus === 'need_payment' ? 'all' : 'need_payment')}
          className={`bg-gradient-to-br from-blue-50 to-blue-100 border rounded-lg p-4 text-left transition-all hover:shadow-lg ${
            filterStatus === 'need_payment' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">需繳費案件</p>
              <p className="text-3xl font-bold text-blue-900">{counts.need_payment}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'overdue' ? 'all' : 'overdue')}
          className={`bg-gradient-to-br from-red-50 to-red-100 border rounded-lg p-4 text-left transition-all hover:shadow-lg ${
            filterStatus === 'overdue' ? 'border-red-500 ring-2 ring-red-300' : 'border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">已逾期案件</p>
              <p className="text-3xl font-bold text-red-900">{counts.overdue}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-50" />
          </div>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'no_payment_needed' ? 'all' : 'no_payment_needed')}
          className={`bg-gradient-to-br from-gray-50 to-gray-100 border rounded-lg p-4 text-left transition-all hover:shadow-lg ${
            filterStatus === 'no_payment_needed' ? 'border-gray-500 ring-2 ring-gray-300' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">本月已繳費案件</p>
              <p className="text-3xl font-bold text-gray-900">{counts.no_payment_needed}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-gray-600 opacity-50" />
          </div>
        </button>
      </div>

      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">沒有符合條件的案件</p>
          </div>
        ) : (
          filteredCases.map((caseItem) => {
            const status = checkPaymentStatus(caseItem.rent_payment_date);
            const totalAmount = calculateTotalAmount(caseItem);
            const paymentDate = caseItem.rent_payment_date ? new Date(caseItem.rent_payment_date) : null;
            const nextPaymentDate = getNextPaymentDate(caseItem.rent_payment_date);
            const waterFee = calculateWaterFee(caseItem);
            const electricityFee = calculateElectricityFee(caseItem);
            const shouldSettleUtilities = shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date);
            const nextUtilityDate = getNextUtilitySettlementDate(caseItem.utility_settlement_date);

            return (
              <div
                key={caseItem.id}
                className={`border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow ${
                  status === 'overdue'
                    ? 'border-red-300'
                    : status === 'need_payment'
                    ? 'border-blue-300'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{caseItem.case_address}</h3>
                      <span className="text-sm text-gray-500">({caseItem.case_number})</span>
                    </div>
                    {caseItem.tenant_name && (
                      <p className="text-sm text-gray-600">
                        房客：{caseItem.tenant_name}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-50 rounded-lg p-4">
                  {caseItem.monthly_rent && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">月租金</p>
                      <p className="text-sm font-medium text-gray-900">NT$ {caseItem.monthly_rent.toLocaleString()}</p>
                    </div>
                  )}
                  {caseItem.management_fee && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">管理費</p>
                      <p className="text-sm font-medium text-gray-900">NT$ {caseItem.management_fee.toLocaleString()}</p>
                    </div>
                  )}
                  {caseItem.payment_frequency && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">繳款頻率</p>
                      <p className="text-sm font-medium text-gray-900">{caseItem.payment_frequency}</p>
                    </div>
                  )}
                  {paymentDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">繳款日期</p>
                      <p className="text-sm font-medium text-gray-900">
                        每月 {paymentDate.getDate()} 日
                      </p>
                    </div>
                  )}
                  {nextPaymentDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">下個繳款日</p>
                      <p className="text-sm font-medium text-gray-900">
                        {nextPaymentDate.getMonth() + 1}/{nextPaymentDate.getDate()}
                      </p>
                    </div>
                  )}
                  {shouldSettleUtilities && waterFee > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">水費</p>
                      <p className="text-sm font-medium text-gray-900">NT$ {waterFee.toLocaleString()}</p>
                    </div>
                  )}
                  {shouldSettleUtilities && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">電費</p>
                      <p className="text-sm font-medium text-gray-900">NT$ {electricityFee.toLocaleString()}</p>
                    </div>
                  )}
                  {shouldSettleUtilities && nextUtilityDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">下次水電結算日</p>
                      <p className="text-sm font-medium text-blue-600">
                        {nextUtilityDate.getFullYear()}/{nextUtilityDate.getMonth() + 1}/{nextUtilityDate.getDate()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">應收總額</p>
                    <p className="text-sm font-bold text-teal-700">NT$ {totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {shouldSettleUtilities && (caseItem.last_public_ekwh !== null || caseItem.last_private_ekwh !== null) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">電費明細：</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                      {caseItem.last_public_ekwh !== null && (
                        <>
                          <div>
                            <span className="text-gray-500">前期公電：</span>
                            <span className="font-medium">{caseItem.last_public_ekwh} 度</span>
                          </div>
                          <div>
                            <span className="text-gray-500">本期公電：</span>
                            <span className="font-medium">{caseItem.recent_public_ekwh || 0} 度</span>
                          </div>
                        </>
                      )}
                      {caseItem.last_private_ekwh !== null && (
                        <>
                          <div>
                            <span className="text-gray-500">前期私電：</span>
                            <span className="font-medium">{caseItem.last_private_ekwh} 度</span>
                          </div>
                          <div>
                            <span className="text-gray-500">本期私電：</span>
                            <span className="font-medium">{caseItem.recent_private_ekwh || 0} 度</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
