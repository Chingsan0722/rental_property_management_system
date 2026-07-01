import { useState, useMemo } from 'react';
import { Download, FileImage, Users } from 'lucide-react';
import JSZip from 'jszip';

interface BillData {
  case_address: string;
  tenant_name: string;
  monthly_rent: number;
  water_fee: number;
  electricity_fee: number;
  management_fee: number;
  overdue_fee: number;
  notes: string;
  year: number;
  month: number;
  payment_period_start: string;
  payment_period_end: string;
  payment_deadline: string;
  previous_electricity_kwh?: number;
  current_electricity_kwh?: number;
  next_utility_settlement_date?: string;
}

interface MonthlyBillGeneratorProps {
  cases: any[];
  onClose?: () => void;
}

export default function MonthlyBillGenerator({ cases, onClose }: MonthlyBillGeneratorProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [exportMode, setExportMode] = useState<'month' | 'owner'>('month');
  const [selectedOwner, setSelectedOwner] = useState<string>('');

  const shouldSettleUtilitiesThisMonth = (utilitySettlementDate: string | null) => {
    if (!utilitySettlementDate) return false;

    const settlementDate = new Date(utilitySettlementDate);
    const settlementYear = settlementDate.getFullYear();
    const settlementMonth = settlementDate.getMonth();

    const monthsDiff = (selectedYear - settlementYear) * 12 + (selectedMonth - 1 - settlementMonth);

    return monthsDiff >= 0 && monthsDiff % 3 === 0;
  };

  const calculateWaterFeeForCase = (caseItem: any) => {
    if (!shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date)) return 0;
    return (caseItem.water_fee || 100) * 3;
  };

  const calculateElectricityFeeForCase = (caseItem: any) => {
    if (!shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date)) return 0;
    const publicUsage = (caseItem.recent_public_ekwh || 0) - (caseItem.last_public_ekwh || 0);
    const privateUsage = (caseItem.recent_private_ekwh || 0) - (caseItem.last_private_ekwh || 0);
    const totalUsage = publicUsage + privateUsage;
    const ratePerKwh = caseItem.electricity_fee || 5;
    return totalUsage * ratePerKwh;
  };

  const [waterFees, setWaterFees] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    cases.forEach(c => {
      initial[c.id] = calculateWaterFeeForCase(c);
    });
    return initial;
  });

  const [electricityFees, setElectricityFees] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    cases.forEach(c => {
      initial[c.id] = calculateElectricityFeeForCase(c);
    });
    return initial;
  });

  const [managementFees, setManagementFees] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    cases.forEach(c => {
      initial[c.id] = c.management_fee || 0;
    });
    return initial;
  });
  const [overdueFees, setOverdueFees] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const ownersList = useMemo(() => {
    const owners = new Set<string>();
    cases.forEach(caseItem => {
      if (caseItem.owner_name) {
        owners.add(caseItem.owner_name);
      }
    });
    return Array.from(owners).sort();
  }, [cases]);

  const getFilteredCases = () => {
    return cases.filter(caseItem => {
      if (exportMode === 'month') {
        if (!caseItem.rent_payment_date) return false;
        const paymentDate = new Date(caseItem.rent_payment_date);
        const paymentMonth = paymentDate.getMonth() + 1;
        return paymentMonth === selectedMonth;
      } else {
        if (!selectedOwner) return false;
        if (!caseItem.rent_payment_date) return false;
        const paymentDate = new Date(caseItem.rent_payment_date);
        const paymentMonth = paymentDate.getMonth() + 1;
        return paymentMonth === selectedMonth && caseItem.owner_name === selectedOwner;
      }
    });
  };

  const getPaymentDeadlineDay = (caseItem: any) => {
    if (caseItem.rent_payment_date) {
      const paymentDate = new Date(caseItem.rent_payment_date);
      return paymentDate.getDate();
    }
    return 10;
  };

  const calculatePaymentPeriod = (contractStartDate: string, year: number, month: number) => {
    if (!contractStartDate) {
      return {
        start: `${year}/${month}/1`,
        end: `${year}/${month}/28`
      };
    }

    const startDate = new Date(contractStartDate);
    const startDay = startDate.getDate();

    const periodStartDate = new Date(year, month - 1, startDay);
    const periodEndDate = new Date(year, month - 1, startDay);
    periodEndDate.setMonth(periodEndDate.getMonth() + 1);
    periodEndDate.setDate(periodEndDate.getDate() - 1);

    return {
      start: `${periodStartDate.getFullYear()}/${periodStartDate.getMonth() + 1}/${periodStartDate.getDate()}`,
      end: `${periodEndDate.getFullYear()}/${periodEndDate.getMonth() + 1}/${periodEndDate.getDate()}`
    };
  };

  const formatPaymentDeadline = (deadlineDay: number) => {
    return `本月${deadlineDay}日前繳納`;
  };

  const generateBillImage = async (billData: BillData): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1300;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('租金收費明細表', canvas.width / 2, 75);

    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';

    let y = 180;
    const leftMargin = 60;
    const lineHeight = 45;

    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${billData.year} 年 ${billData.month} 月份`, leftMargin, y);
    y += lineHeight * 1.2;

    ctx.font = '22px Arial';
    ctx.fillStyle = '#444444';
    ctx.fillText(`繳費期間：${billData.payment_period_start} - ${billData.payment_period_end}`, leftMargin, y);
    y += lineHeight;

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`繳費期限：${billData.payment_deadline}`, leftMargin, y);
    y += lineHeight * 1.3;

    if (billData.next_utility_settlement_date) {
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(`下次水電結算日：${billData.next_utility_settlement_date}`, leftMargin, y);
      y += lineHeight * 1.3;
    }

    ctx.font = '24px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`房屋地址：${billData.case_address}`, leftMargin, y);
    y += lineHeight;

    if (billData.tenant_name) {
      ctx.fillText(`房客姓名：${billData.tenant_name}`, leftMargin, y);
      y += lineHeight;
    }

    y += 30;
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(canvas.width - leftMargin, y);
    ctx.stroke();
    y += 50;

    ctx.font = 'bold 26px Arial';
    ctx.fillText('費用明細', leftMargin, y);
    y += 50;

    const items = [
      { label: '月租金', amount: billData.monthly_rent },
      { label: '水費', amount: billData.water_fee },
      { label: '電費', amount: billData.electricity_fee, showKwh: true },
      { label: '管理費', amount: billData.management_fee },
    ];

    if (billData.overdue_fee > 0) {
      items.push({ label: '前期欠繳費用', amount: billData.overdue_fee });
    }

    ctx.font = '24px Arial';
    items.forEach(item => {
      ctx.fillText(item.label, leftMargin + 40, y);
      ctx.textAlign = 'right';
      ctx.fillText(`NT$ ${item.amount.toLocaleString()}`, canvas.width - leftMargin, y);
      ctx.textAlign = 'left';
      y += lineHeight;

      if (item.showKwh && billData.electricity_fee > 0 && billData.previous_electricity_kwh !== undefined && billData.current_electricity_kwh !== undefined) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(`   上期電度：${billData.previous_electricity_kwh} 度`, leftMargin + 60, y);
        y += 35;
        ctx.fillText(`   本期電度：${billData.current_electricity_kwh} 度`, leftMargin + 60, y);
        y += 35;
        ctx.fillStyle = '#000000';
        ctx.font = '24px Arial';
      }
    });

    y += 30;
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(canvas.width - leftMargin, y);
    ctx.stroke();
    y += 50;

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    ctx.font = 'bold 32px Arial';
    ctx.fillText('總計', leftMargin + 40, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(`NT$ ${total.toLocaleString()}`, canvas.width - leftMargin, y);
    ctx.textAlign = 'left';
    y += 80;

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('轉帳資訊', leftMargin, y);
    y += 45;

    ctx.font = '22px Arial';
    ctx.fillText('銀行：土地銀行 蘇澳分行 005', leftMargin + 20, y);
    y += lineHeight;
    ctx.fillText('戶名：貼心房屋管理顧問股份有限公司', leftMargin + 20, y);
    y += lineHeight;
    ctx.fillText('帳號：053001118818', leftMargin + 20, y);
    y += 60;

    if (billData.notes) {
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('備註：', leftMargin, y);
      y += 35;
      ctx.font = '20px Arial';
      const noteLines = billData.notes.split('\n');
      noteLines.forEach(line => {
        ctx.fillText(line, leftMargin + 20, y);
        y += 35;
      });
    }

    ctx.fillStyle = '#666666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `列印日期：${new Date().toLocaleDateString('zh-TW')}`,
      canvas.width / 2,
      canvas.height - 40
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const handleGenerateAll = async () => {
    const filteredCases = getFilteredCases();

    if (filteredCases.length === 0) {
      if (exportMode === 'owner') {
        alert('該業主當月沒有需要繳費的案件！');
      } else {
        alert('當月沒有需要繳費的案件！');
      }
      return;
    }

    const zip = new JSZip();
    const folderName = exportMode === 'owner'
      ? `${selectedYear}年${selectedMonth}月_${selectedOwner}_收費明細`
      : `${selectedYear}年${selectedMonth}月_收費明細`;
    const folder = zip.folder(folderName);

    for (const caseItem of filteredCases) {
      const waterFee = waterFees[caseItem.id] || 0;
      const electricityFee = electricityFees[caseItem.id] || 0;
      const managementFee = managementFees[caseItem.id] || 0;
      const overdueFee = overdueFees[caseItem.id] || 0;
      const note = notes[caseItem.id] || '';
      const deadlineDay = getPaymentDeadlineDay(caseItem);

      const period = calculatePaymentPeriod(caseItem.contract_start_date, selectedYear, selectedMonth);
      const deadline = formatPaymentDeadline(deadlineDay);

      const shouldSettleUtilities = shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date);
      let nextUtilityDate = null;

      if (caseItem.utility_settlement_date) {
        const hasWaterOrElectricity = waterFee > 0 || electricityFee > 0;

        if (hasWaterOrElectricity) {
          const settlementDate = new Date(caseItem.utility_settlement_date);

          if (shouldSettleUtilities) {
            const nextSettlement = new Date(settlementDate);
            nextSettlement.setMonth(nextSettlement.getMonth() + 3);
            nextUtilityDate = nextSettlement;
          } else {
            const currentDate = new Date(selectedYear, selectedMonth - 1);
            const settlementYear = settlementDate.getFullYear();
            const settlementMonth = settlementDate.getMonth();

            const monthsDiff = (currentDate.getFullYear() - settlementYear) * 12 + (currentDate.getMonth() - settlementMonth);
            const nextSettlementMonths = Math.ceil((monthsDiff + 1) / 3) * 3;

            const nextSettlement = new Date(settlementDate);
            nextSettlement.setMonth(nextSettlement.getMonth() + nextSettlementMonths);
            nextUtilityDate = nextSettlement;
          }
        }
      }

      const previousKwh = caseItem.last_public_ekwh ?? caseItem.last_private_ekwh;
      const currentKwh = caseItem.recent_public_ekwh ?? caseItem.recent_private_ekwh;

      const billData: BillData = {
        case_address: caseItem.case_address,
        tenant_name: caseItem.tenant_name || '',
        monthly_rent: caseItem.monthly_rent || 0,
        water_fee: waterFee,
        electricity_fee: electricityFee,
        management_fee: managementFee,
        overdue_fee: overdueFee,
        notes: note,
        year: selectedYear,
        month: selectedMonth,
        payment_period_start: period.start,
        payment_period_end: period.end,
        payment_deadline: deadline,
        previous_electricity_kwh: previousKwh,
        current_electricity_kwh: currentKwh,
        next_utility_settlement_date: nextUtilityDate ? `${nextUtilityDate.getFullYear()}/${nextUtilityDate.getMonth() + 1}/${nextUtilityDate.getDate()}` : undefined,
      };

      const blob = await generateBillImage(billData);
      const fileName = `${caseItem.case_address.replace(/\//g, '_')}_收費明細.png`;
      folder?.file(fileName, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${folderName}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    alert(`已匯出 ${filteredCases.length} 份收費明細表並打包下載！`);
  };

  const handleGenerateSingle = async (caseItem: any) => {
    const waterFee = waterFees[caseItem.id] || 0;
    const electricityFee = electricityFees[caseItem.id] || 0;
    const managementFee = managementFees[caseItem.id] || 0;
    const overdueFee = overdueFees[caseItem.id] || 0;
    const note = notes[caseItem.id] || '';
    const deadlineDay = getPaymentDeadlineDay(caseItem);

    const period = calculatePaymentPeriod(caseItem.contract_start_date, selectedYear, selectedMonth);
    const deadline = formatPaymentDeadline(deadlineDay);

    const shouldSettleUtilities = shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date);
    let nextUtilityDate = null;

    if (caseItem.utility_settlement_date) {
      const hasWaterOrElectricity = waterFee > 0 || electricityFee > 0;

      if (hasWaterOrElectricity) {
        const settlementDate = new Date(caseItem.utility_settlement_date);

        if (shouldSettleUtilities) {
          const nextSettlement = new Date(settlementDate);
          nextSettlement.setMonth(nextSettlement.getMonth() + 3);
          nextUtilityDate = nextSettlement;
        } else {
          const currentDate = new Date(selectedYear, selectedMonth - 1);
          const settlementYear = settlementDate.getFullYear();
          const settlementMonth = settlementDate.getMonth();

          const monthsDiff = (currentDate.getFullYear() - settlementYear) * 12 + (currentDate.getMonth() - settlementMonth);
          const nextSettlementMonths = Math.ceil((monthsDiff + 1) / 3) * 3;

          const nextSettlement = new Date(settlementDate);
          nextSettlement.setMonth(nextSettlement.getMonth() + nextSettlementMonths);
          nextUtilityDate = nextSettlement;
        }
      }
    }

    const previousKwh = caseItem.last_public_ekwh ?? caseItem.last_private_ekwh;
    const currentKwh = caseItem.recent_public_ekwh ?? caseItem.recent_private_ekwh;

    const billData: BillData = {
      case_address: caseItem.case_address,
      tenant_name: caseItem.tenant_name || '',
      monthly_rent: caseItem.monthly_rent || 0,
      water_fee: waterFee,
      electricity_fee: electricityFee,
      management_fee: managementFee,
      overdue_fee: overdueFee,
      notes: note,
      year: selectedYear,
      month: selectedMonth,
      payment_period_start: period.start,
      payment_period_end: period.end,
      payment_deadline: deadline,
      previous_electricity_kwh: previousKwh,
      current_electricity_kwh: currentKwh,
      next_utility_settlement_date: nextUtilityDate ? `${nextUtilityDate.getFullYear()}/${nextUtilityDate.getMonth() + 1}/${nextUtilityDate.getDate()}` : undefined,
    };

    const blob = await generateBillImage(billData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedYear}年${selectedMonth}月_${caseItem.case_address.replace(/\//g, '_')}_收費明細.png`;
    link.click();
    URL.revokeObjectURL(url);

    alert('收費明細表已匯出！');
  };

  const content = (
    <div className="bg-white rounded-lg shadow-xl w-full">
      <div className="bg-white border-b p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileImage className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">匯出月度收費明細表</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">年份</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">月份</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month} 月</option>
                  ))}
                </select>
              </div>
              <div className="flex-1" />
            </div>

            <div className="border-t border-orange-300 pt-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">匯出模式</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setExportMode('month')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        exportMode === 'month'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FileImage className="w-4 h-4" />
                      該月份全部案件
                    </button>
                    <button
                      onClick={() => setExportMode('owner')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        exportMode === 'owner'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      按業主匯出
                    </button>
                  </div>
                </div>

                {exportMode === 'owner' && (
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">選擇業主</label>
                    <select
                      value={selectedOwner}
                      onChange={(e) => setSelectedOwner(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">請選擇業主</option>
                      {ownersList.map(owner => (
                        <option key={owner} value={owner}>{owner}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={exportMode === 'owner' ? 'flex items-end' : 'flex-1 flex justify-end'}>
                  <button
                    onClick={handleGenerateAll}
                    disabled={exportMode === 'owner' && !selectedOwner}
                    className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    整批匯出（打包下載）
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">轉帳資訊</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>銀行：土地銀行 蘇澳分行 005</p>
              <p>戶名：貼心房屋管理顧問股份有限公司</p>
              <p>帳號：053001118818</p>
            </div>
          </div>

          <div className="space-y-4">
            {getFilteredCases().map((caseItem) => {
              const period = calculatePaymentPeriod(caseItem.contract_start_date, selectedYear, selectedMonth);
              const deadlineDay = getPaymentDeadlineDay(caseItem);
              const deadline = formatPaymentDeadline(deadlineDay);
              const totalAmount = (caseItem.monthly_rent || 0) +
                                 (waterFees[caseItem.id] || 0) +
                                 (electricityFees[caseItem.id] || 0) +
                                 (managementFees[caseItem.id] || 0) +
                                 (overdueFees[caseItem.id] || 0);

              const shouldSettleUtilities = shouldSettleUtilitiesThisMonth(caseItem.utility_settlement_date);
              let nextUtilityDate = null;
              let showNextUtilityDate = false;

              if (caseItem.utility_settlement_date && caseItem.water_fee && caseItem.electricity_fee) {
                const hasWaterOrElectricity = Number(caseItem.water_fee) > 0 || Number(caseItem.electricity_fee) > 0;

                if (hasWaterOrElectricity) {
                  showNextUtilityDate = true;
                  const settlementDate = new Date(caseItem.utility_settlement_date);

                  if (shouldSettleUtilities) {
                    const nextSettlement = new Date(settlementDate);
                    nextSettlement.setMonth(nextSettlement.getMonth() + 3);
                    nextUtilityDate = nextSettlement;
                  } else {
                    nextUtilityDate = settlementDate;
                  }
                }
              }

              return (
                <div key={caseItem.id} className="border border-blue-300 rounded-lg p-5 hover:border-orange-400 transition-colors bg-blue-50">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="font-bold text-gray-900 text-lg mb-2">{caseItem.case_address}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="text-gray-600">
                          繳費期間：<span className="font-medium text-gray-900">{period.start} - {period.end}</span>
                        </div>
                        <div className="text-gray-600">
                          租金：<span className="font-medium text-gray-900">NT$ {caseItem.monthly_rent?.toLocaleString()}</span>
                        </div>
                        {caseItem.tenant_name && (
                          <div className="text-gray-600">房客：<span className="font-medium text-gray-900">{caseItem.tenant_name}</span></div>
                        )}
                        <div className="text-red-600 font-medium">
                          總應收費用：NT$ {totalAmount.toLocaleString()}
                        </div>
                        <div className="text-gray-600">
                          繳費期限：<span className="font-medium text-gray-900">{deadline}</span>
                        </div>
                        {showNextUtilityDate && nextUtilityDate && (
                          <div className="text-blue-600 font-medium">
                            下次水電結算日：{nextUtilityDate.getFullYear()}/{nextUtilityDate.getMonth() + 1}/{nextUtilityDate.getDate()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">水費</label>
                        <input
                          type="number"
                          value={waterFees[caseItem.id] || ''}
                          onChange={(e) => setWaterFees({ ...waterFees, [caseItem.id]: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">電費</label>
                        <input
                          type="number"
                          value={electricityFees[caseItem.id] || ''}
                          onChange={(e) => setElectricityFees({ ...electricityFees, [caseItem.id]: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">管理費</label>
                        <input
                          type="number"
                          value={managementFees[caseItem.id] || ''}
                          onChange={(e) => setManagementFees({ ...managementFees, [caseItem.id]: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">前期欠繳</label>
                        <input
                          type="number"
                          value={overdueFees[caseItem.id] || ''}
                          onChange={(e) => setOverdueFees({ ...overdueFees, [caseItem.id]: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => handleGenerateSingle(caseItem)}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <FileImage className="w-4 h-4" />
                          匯出
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                      <textarea
                        value={notes[caseItem.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [caseItem.id]: e.target.value })}
                        placeholder="輸入備註內容..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {getFilteredCases().length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {exportMode === 'owner' && !selectedOwner ? (
                <>
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">請選擇業主</p>
                  <p className="text-sm mt-2">從上方下拉選單選擇要匯出的業主</p>
                </>
              ) : (
                <>
                  <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">
                    {exportMode === 'owner' ? '該業主當月沒有需要繳費的案件' : '當月沒有需要繳費的案件'}
                  </p>
                  <p className="text-sm mt-2">請檢查房租繳款日設定是否正確</p>
                </>
              )}
            </div>
          )}
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
