import { useState } from 'react';
import { X, Printer, Edit } from 'lucide-react';

interface QuotationPreviewProps {
  quotation: any;
  items: any[];
  onClose: () => void;
}

export default function QuotationPreview({ quotation, items, onClose }: QuotationPreviewProps) {
  const [editableContent, setEditableContent] = useState(quotation.client_content || '');
  const [isEditing, setIsEditing] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('請允許彈出視窗以進行列印');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>報價單 - ${quotation.case_address}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Microsoft JhengHei', Arial, sans-serif;
              padding: 2cm;
              background: white;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              border-bottom: 3px solid #0d9488;
              padding-bottom: 1.5rem;
              margin-bottom: 2rem;
            }

            .header-left {
              display: flex;
              align-items: center;
              gap: 1rem;
            }

            .logo {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }

            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #111827;
            }

            .company-subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-top: 0.25rem;
            }

            .header-right {
              text-align: right;
            }

            .title {
              font-size: 24px;
              font-weight: bold;
              color: #0d9488;
            }

            .subtitle {
              font-size: 12px;
              color: #9ca3af;
              margin-top: 0.25rem;
            }

            .info-section {
              background: #f9fafb;
              padding: 1rem;
              margin-bottom: 1.5rem;
              border-radius: 8px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.5rem 1rem;
            }

            .info-item {
              margin-bottom: 0.25rem;
            }

            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #6b7280;
              display: block;
              margin-bottom: 0.25rem;
            }

            .info-value {
              font-size: 14px;
              color: #111827;
            }

            .info-value.large {
              font-size: 16px;
              font-weight: 600;
            }

            .full-width {
              grid-column: 1 / -1;
            }

            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #111827;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #d1d5db;
              margin-bottom: 1rem;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
              border: 1px solid #d1d5db;
            }

            thead {
              background: #0d9488;
              color: white;
            }

            th {
              padding: 0.75rem 1rem;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              border: 1px solid #0d9488;
            }

            th.center {
              text-align: center;
            }

            th.right {
              text-align: right;
            }

            tbody tr:nth-child(even) {
              background: #f9fafb;
            }

            tbody tr:nth-child(odd) {
              background: white;
            }

            td {
              padding: 0.75rem 1rem;
              border: 1px solid #d1d5db;
              font-size: 14px;
              color: #374151;
            }

            td.center {
              text-align: center;
            }

            td.right {
              text-align: right;
            }

            td.notes {
              font-size: 12px;
              color: #6b7280;
            }

            tfoot {
              background: #ecfdf5;
              font-weight: bold;
            }

            tfoot td {
              padding: 1rem;
              font-size: 16px;
            }

            tfoot .total-label {
              text-align: right;
            }

            tfoot .total-value {
              font-size: 20px;
              color: #0d9488;
            }

            .notes-section {
              background: #eff6ff;
              border: 2px solid #bfdbfe;
              border-radius: 8px;
              padding: 1.5rem;
              margin-bottom: 2rem;
            }

            .notes-title {
              font-size: 16px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 0.75rem;
            }

            .notes-content {
              color: #374151;
              line-height: 1.6;
              white-space: pre-wrap;
            }

            .footer {
              text-align: center;
              padding-top: 2rem;
              border-top: 2px solid #d1d5db;
              color: #6b7280;
              font-size: 12px;
            }

            .footer p {
              margin-bottom: 0.5rem;
            }

            @page {
              size: A4;
              margin: 1cm;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <img src="${window.location.origin}/LOGO.png" alt="貼心房屋管理顧問" class="logo">
              <div>
                <div class="company-name">貼心房屋管理顧問</div>
                <div class="company-subtitle">宜蘭專業包租代管 | 代租代管</div>
              </div>
            </div>
            <div class="header-right">
              <div class="title">工程/裝修報價單</div>
              <div class="subtitle">Quotation</div>
            </div>
          </div>

          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">業務名稱</span>
                <div class="info-value">${quotation.business_name}</div>
              </div>
              <div class="info-item">
                <span class="info-label">業務電話</span>
                <div class="info-value">${quotation.business_phone || '-'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">報價日期</span>
                <div class="info-value">${quotation.quote_date}</div>
              </div>
              <div class="info-item">
                <span class="info-label">案件類型</span>
                <div class="info-value">${quotation.case_type || '-'}</div>
              </div>
              <div class="info-item full-width">
                <span class="info-label">案件地址</span>
                <div class="info-value large">${quotation.case_address}</div>
              </div>
              <div class="info-item">
                <span class="info-label">屋主名稱</span>
                <div class="info-value">${quotation.owner_name}</div>
              </div>
              <div class="info-item">
                <span class="info-label">屋主電話</span>
                <div class="info-value">${quotation.owner_phone || '-'}</div>
              </div>
            </div>
          </div>

          <div class="section-title">報價項目明細</div>

          <table>
            <thead>
              <tr>
                <th>項目名稱</th>
                <th class="center" style="width: 80px;">數量</th>
                <th class="right" style="width: 120px;">單價</th>
                <th class="right" style="width: 120px;">小計</th>
                <th style="width: 150px;">備註</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td class="center">${item.quantity}</td>
                  <td class="right">NT$ ${item.unit_price.toLocaleString()}</td>
                  <td class="right">NT$ ${item.subtotal.toLocaleString()}</td>
                  <td class="notes">${item.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 2rem; background: #f9fafb; border: 2px solid #d1d5db; border-radius: 8px; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-size: 18px; font-weight: 600; color: #374151;">總工程款：</span>
              <span style="font-size: 20px; font-weight: bold; color: #0d9488;">NT$ ${quotation.total_amount.toLocaleString()}</span>
            </div>

            ${quotation.management_fee_type ? `
              <div style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 16px; font-weight: 600; color: #374151;">施工期間管理費</span>
                    <span style="font-size: 13px; color: #6b7280; margin-left: 0.5rem;">
                      (${quotation.management_fee_type === 'percentage' ? `${quotation.management_fee_value}%` : '固定金額'})
                    </span>
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 0.25rem;">*自費裝修代租代管才需此費用</div>
                  </div>
                  <span style="font-size: 18px; font-weight: 600; color: #d97706;">NT$ ${quotation.management_fee_amount.toLocaleString()}</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; background: #ecfdf5; margin: 0 -1.5rem; padding-left: 1.5rem; padding-right: 1.5rem; border-radius: 0 0 6px 6px;">
                <span style="font-size: 20px; font-weight: bold; color: #111827;">合計總額：</span>
                <span style="font-size: 24px; font-weight: bold; color: #0d9488;">NT$ ${(quotation.total_amount + quotation.management_fee_amount).toLocaleString()}</span>
              </div>
            ` : ''}
          </div>

          ${editableContent ? `
            <div class="notes-section">
              <div class="notes-title">說明事項</div>
              <div class="notes-content">${editableContent}</div>
            </div>
          ` : ''}

          <div style="margin: 3rem 0 2rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
              <div style="text-align: center;">
                <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 0.5rem;">委託人</div>
                <div style="border-bottom: 2px solid #374151; padding: 3rem 1rem 0.5rem; min-height: 4rem;"></div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 0.5rem;">經手人</div>
                <div style="border-bottom: 2px solid #374151; padding: 3rem 1rem 0.5rem; min-height: 4rem;"></div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>感謝您的信任，期待為您服務</p>
            <p>貼心房屋管理顧問有限公司</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 250);
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>

      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
            <h3 className="text-2xl font-bold text-gray-900">報價單預覽</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                title="列印/下載PDF"
              >
                <Printer className="w-5 h-5" />
                <span>列印</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start border-b-2 border-teal-600 pb-6">
              <div className="flex items-center gap-4">
                <img
                  src="/LOGO.png"
                  alt="貼心房屋管理顧問"
                  className="h-20 w-20 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">貼心房屋管理顧問</h1>
                  <p className="text-gray-600 mt-1">宜蘭專業包租代管 | 代租代管</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">工程/裝修報價單</div>
                <div className="text-sm text-gray-500 mt-1">Quotation</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm font-semibold text-gray-600">業務名稱</span>
                <div className="text-base text-gray-900 mt-1">{quotation.business_name}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">業務電話</span>
                <div className="text-base text-gray-900 mt-1">{quotation.business_phone || '-'}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">報價日期</span>
                <div className="text-base text-gray-900 mt-1">{quotation.quote_date}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">案件類型</span>
                <div className="text-base text-gray-900 mt-1">{quotation.case_type || '-'}</div>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-gray-600">案件地址</span>
                <div className="text-lg font-semibold text-gray-900 mt-1">{quotation.case_address}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">屋主名稱</span>
                <div className="text-base text-gray-900 mt-1">{quotation.owner_name}</div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">屋主電話</span>
                <div className="text-base text-gray-900 mt-1">{quotation.owner_phone || '-'}</div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">報價項目明細</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="border border-teal-700 px-4 py-3 text-left">項目名稱</th>
                    <th className="border border-teal-700 px-4 py-3 text-center w-24">數量</th>
                    <th className="border border-teal-700 px-4 py-3 text-right w-32">單價</th>
                    <th className="border border-teal-700 px-4 py-3 text-right w-32">小計</th>
                    <th className="border border-teal-700 px-4 py-3 text-left w-48">備註</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3">{item.item_name}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        NT$ {item.unit_price.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                        NT$ {item.subtotal.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-300">
                  <span className="text-lg font-semibold text-gray-700">總工程款：</span>
                  <span className="text-xl font-bold text-teal-700">NT$ {quotation.total_amount.toLocaleString()}</span>
                </div>

                {quotation.management_fee_type && (
                  <>
                    <div className="py-3 border-b border-gray-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-base font-semibold text-gray-700">施工期間管理費</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({quotation.management_fee_type === 'percentage' ? `${quotation.management_fee_value}%` : '固定金額'})
                          </span>
                          <div className="text-xs text-gray-500 mt-1">*自費裝修代租代管才需此費用</div>
                        </div>
                        <span className="text-lg font-semibold text-yellow-700">NT$ {quotation.management_fee_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 bg-teal-50 -mx-6 px-6 -mb-6 rounded-b-lg">
                      <span className="text-xl font-bold text-gray-900">合計總額：</span>
                      <span className="text-2xl font-bold text-teal-700">NT$ {(quotation.total_amount + quotation.management_fee_amount).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {(editableContent || isEditing) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">說明事項</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{isEditing ? '完成編輯' : '編輯'}</span>
                  </button>
                </div>
                {isEditing ? (
                  <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 text-base border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入給客戶的說明，例如：付款方式、施工說明、注意事項等"
                  />
                ) : (
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {editableContent}
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 mb-8">
              <div className="grid grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-600 mb-2">經手人</div>
                  <div className="border-b-2 border-gray-800 pt-12 pb-2 min-h-[5rem]"></div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-600 mb-2">委託人</div>
                  <div className="border-b-2 border-gray-800 pt-12 pb-2 min-h-[5rem]"></div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-6 text-center text-sm text-gray-600">
              <p>感謝您的信任，期待為您服務</p>
              <p className="mt-2">貼心房屋管理顧問有限公司</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
