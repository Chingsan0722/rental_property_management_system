export const exportQuotationToPDF = async (quotation: any, items: any[]) => {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>工程/裝修報價單</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { text-align: center; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    .info-section { margin: 30px 0; }
    .info-row { display: flex; margin: 10px 0; }
    .info-label { font-weight: bold; width: 150px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #3b82f6; color: white; }
    .total-section { margin-top: 30px; text-align: right; }
    .total-row { margin: 10px 0; font-size: 18px; }
    .tax-included { font-size: 24px; font-weight: bold; color: #1e40af; }
  </style>
</head>
<body>
  <h1>工程/裝修報價單</h1>

  <div class="info-section">
    <div class="info-row"><span class="info-label">業務名稱：</span><span>${quotation.business_name}</span></div>
    <div class="info-row"><span class="info-label">業務電話：</span><span>${quotation.business_phone || '-'}</span></div>
    <div class="info-row"><span class="info-label">報價日期：</span><span>${quotation.quote_date}</span></div>
    <div class="info-row"><span class="info-label">案件地址：</span><span>${quotation.case_address}</span></div>
    <div class="info-row"><span class="info-label">屋主名稱：</span><span>${quotation.owner_name}</span></div>
    <div class="info-row"><span class="info-label">屋主電話：</span><span>${quotation.owner_phone || '-'}</span></div>
    <div class="info-row"><span class="info-label">案件類型：</span><span>${quotation.case_type || '-'}</span></div>
  </div>

  <h2>報價項目</h2>
  <table>
    <thead>
      <tr>
        <th>項目名稱</th>
        <th>數量</th>
        <th>單價</th>
        <th>小計</th>
        <th>備註</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.item_name}</td>
          <td>${item.quantity}</td>
          <td>NT$ ${item.unit_price.toLocaleString()}</td>
          <td>NT$ ${item.subtotal.toLocaleString()}</td>
          <td>${item.notes || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">總金額：NT$ ${quotation.total_amount.toLocaleString()}</div>
    <div class="total-row tax-included">含稅總金額：NT$ ${quotation.tax_included_amount.toLocaleString()}</div>
  </div>
</body>
</html>
  `;

  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `報價單_${quotation.case_address}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportBenefitEvaluationToPDF = async (evaluation: any) => {
  const packageRentalCost = evaluation.renovation_cost + evaluation.personnel_cost +
                           evaluation.development_bonus + (evaluation.monthly_rent_cost * 12 * evaluation.contract_years);
  const packageRentalIncome = evaluation.expected_rent_income *
                              (12 * evaluation.contract_years - evaluation.expected_vacancy_months);
  const packageRentalProfit = packageRentalIncome - packageRentalCost;

  const agencyFee = evaluation.agency_service_months * evaluation.expected_rent_income;
  const managementFee = evaluation.expected_rent_income * (evaluation.management_fee_ratio / 100) *
                        (12 * evaluation.contract_years - evaluation.expected_vacancy_months);
  const propertyMgmtProfit = agencyFee + managementFee;

  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>效益評估表</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { text-align: center; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    .info-section { margin: 30px 0; }
    .info-row { display: flex; margin: 10px 0; }
    .info-label { font-weight: bold; width: 200px; }
    .comparison { display: flex; gap: 20px; margin: 30px 0; }
    .comparison-box { flex: 1; border: 2px solid #ddd; border-radius: 10px; padding: 20px; }
    .package-rental { background-color: #dbeafe; border-color: #3b82f6; }
    .property-mgmt { background-color: #d1fae5; border-color: #10b981; }
    .comparison-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
    .comparison-item { margin: 15px 0; font-size: 16px; }
    .comparison-label { font-weight: bold; }
    .profit { font-size: 20px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
  </style>
</head>
<body>
  <h1>效益評估表</h1>

  <div class="info-section">
    <div class="info-row"><span class="info-label">案件地址：</span><span>${evaluation.case_address}</span></div>
    <div class="info-row"><span class="info-label">類型：</span><span>${evaluation.property_type || '-'}</span></div>
    <div class="info-row"><span class="info-label">格局：</span><span>${evaluation.layout || '-'}</span></div>
    <div class="info-row"><span class="info-label">坪數：</span><span>${evaluation.area || '-'} 坪</span></div>
    <div class="info-row"><span class="info-label">修繕成本：</span><span>NT$ ${evaluation.renovation_cost.toLocaleString()}</span></div>
    <div class="info-row"><span class="info-label">人事成本：</span><span>NT$ ${evaluation.personnel_cost.toLocaleString()}</span></div>
    <div class="info-row"><span class="info-label">開發獎金：</span><span>NT$ ${evaluation.development_bonus.toLocaleString()}</span></div>
    <div class="info-row"><span class="info-label">每月承租租金：</span><span>NT$ ${evaluation.monthly_rent_cost.toLocaleString()}</span></div>
    <div class="info-row"><span class="info-label">預期出租租金：</span><span>NT$ ${evaluation.expected_rent_income.toLocaleString()}</span></div>
    <div class="info-row"><span class="info-label">包租代管年數：</span><span>${evaluation.contract_years} 年</span></div>
    <div class="info-row"><span class="info-label">預期空屋月數：</span><span>${evaluation.expected_vacancy_months} 個月</span></div>
  </div>

  <div class="comparison">
    <div class="comparison-box package-rental">
      <div class="comparison-title">包租 ${evaluation.contract_years} 年效益</div>
      <div class="comparison-item">
        <span class="comparison-label">包租 ${evaluation.contract_years} 年成本：</span>
        NT$ ${packageRentalCost.toLocaleString()}
      </div>
      <div class="comparison-item">
        <span class="comparison-label">包租 ${evaluation.contract_years} 年收入：</span>
        NT$ ${packageRentalIncome.toLocaleString()}
      </div>
      <div class="profit">
        包租 ${evaluation.contract_years} 年利潤：NT$ ${packageRentalProfit.toLocaleString()}
      </div>
    </div>

    <div class="comparison-box property-mgmt">
      <div class="comparison-title">代管 ${evaluation.contract_years} 年效益</div>
      <div class="comparison-item">
        <span class="comparison-label">代租服務費：</span>
        NT$ ${agencyFee.toLocaleString()}
      </div>
      <div class="comparison-item">
        <span class="comparison-label">管理費：</span>
        NT$ ${managementFee.toLocaleString()}
      </div>
      <div class="profit">
        代管 ${evaluation.contract_years} 年利潤：NT$ ${propertyMgmtProfit.toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `效益評估_${evaluation.case_address}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
