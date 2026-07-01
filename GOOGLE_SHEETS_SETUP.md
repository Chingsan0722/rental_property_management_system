# Google Sheets API 設定指南

本指南將協助您設定 Google Sheets API，讓您的代管案件管理系統能夠與 Google Sheets 雙向同步。

## 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊上方的專案選擇器
3. 點擊「新增專案」
4. 輸入專案名稱（例如：「代管案件管理系統」）
5. 點擊「建立」

## 步驟 2：啟用 Google Sheets API

1. 在 Google Cloud Console 中，確保您已選擇剛建立的專案
2. 在左側選單中，點擊「API 和服務」→「程式庫」
3. 在搜尋欄中輸入「Google Sheets API」
4. 點擊 "Google Sheets API"
5. 點擊「啟用」按鈕

## 步驟 3：建立 API 金鑰

1. 在左側選單中，點擊「API 和服務」→「憑證」
2. 點擊上方的「+ 建立憑證」
3. 選擇「API 金鑰」
4. API 金鑰建立後會顯示在彈出視窗中
5. **重要：請複製並安全保存此 API 金鑰**
6. 建議點擊「限制金鑰」來設定安全限制：
   - 在「API 限制」下選擇「限制金鑰」
   - 勾選「Google Sheets API」
   - 點擊「儲存」

您的 API 金鑰格式類似：`AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 步驟 4：準備您的 Google Sheets

1. 開啟您要連結的 Google Sheets（或建立新的）
2. 點擊右上角的「共用」按鈕
3. 在「一般存取權」下，選擇「知道連結的使用者」
4. 權限設定為「檢視者」或「編輯者」（建議「編輯者」以支援雙向同步）
5. 點擊「完成」
6. 複製 Google Sheets 的網址（例如：`https://docs.google.com/spreadsheets/d/1abc...xyz/edit`）

### Google Sheets 欄位格式

您的 Google Sheets 第一列（標題列）應包含以下欄位（順序可以不同）：

| 欄位名稱 | 說明 | 必填 |
|---------|------|-----|
| case_address | 案件地址 | ✓ |
| owner_name | 屋主名稱 | ✓ |
| owner_phone | 屋主電話 | |
| owner_id_number | 屋主身分證字號 | |
| tenant_name | 房客名稱 | |
| tenant_phone | 房客電話 | |
| property_type | 物件類型 | |
| layout | 格局 | |
| area | 坪數 | |
| monthly_rent | 每月租金 | |
| management_fee_ratio | 代管費比率 | |
| management_fee | 代管費 | |
| contract_start_date | 合約開始日 | |
| contract_end_date | 合約結束日 | |
| deposit | 押金 | |
| status | 狀態 | |
| notes | 備註 | |
| water_fee | 水費 | |
| electricity_fee | 電費 | |

範例：

```
case_address | owner_name | owner_phone | monthly_rent | status
台北市大安區XX路1號 | 王小明 | 0912345678 | 25000 | 執行中
新北市板橋區YY街2號 | 李大華 | 0987654321 | 18000 | 執行中
```

## 步驟 5：在系統中設定連結

1. 登入您的代管案件管理系統
2. 前往「代管案件管理」頁面
3. 點擊「設定連結」按鈕
4. 輸入您在步驟 3 取得的 API 金鑰
5. 輸入您在步驟 4 取得的 Google Sheets 網址
6. 點擊「儲存設定」

## 步驟 6：開始同步資料

設定完成後，您可以：

### 從 Google Sheets 讀取資料
- 點擊「從 Sheet 讀取」按鈕
- 系統會從您的 Google Sheets 讀取所有資料
- 相同地址的案件會被更新，新地址會被新增

### 寫入資料到 Google Sheets
- 點擊「寫入 Sheet」按鈕
- 系統會將所有代管案件資料寫入 Google Sheets
- **注意：這會覆蓋 Google Sheets 中的現有資料**

### 生成收費明細表
- 點擊「生成收費明細」按鈕
- 選擇年份和月份
- 為每個房間輸入當月的水費和電費
- 可以單筆生成或批次生成全部
- 收費明細表會以 PNG 圖片格式下載

## 常見問題

### Q: 為什麼無法讀取 Google Sheets？
A: 請確認：
1. API 金鑰正確無誤
2. Google Sheets API 已啟用
3. Google Sheets 的共享設定為「知道連結的使用者」可檢視
4. 網址格式正確

### Q: 可以同時使用多個 Google Sheets 嗎？
A: 目前系統只支援連結單一 Google Sheets。如果需要切換，請重新設定連結。

### Q: 同步會刪除資料嗎？
A:
- 「從 Sheet 讀取」不會刪除系統中的資料，只會新增或更新
- 「寫入 Sheet」會完全覆蓋 Google Sheets 中的資料

### Q: API 金鑰安全嗎？
A: API 金鑰儲存在瀏覽器的 localStorage 中。建議：
1. 在 Google Cloud Console 中限制 API 金鑰只能使用 Google Sheets API
2. 不要在公共電腦上使用此功能
3. 定期更換 API 金鑰

### Q: 收費明細表可以自訂格式嗎？
A: 目前使用固定格式。如需客製化，請聯繫開發團隊。

## 進階設定

### API 金鑰限制建議

為了安全性，建議在 Google Cloud Console 中設定以下限制：

1. **應用程式限制**：
   - HTTP 引用來源（網站）
   - 新增您的網站網址

2. **API 限制**：
   - 限制金鑰
   - 僅選擇「Google Sheets API」

3. **配額管理**：
   - Google Sheets API 免費配額：每天 500 次讀取請求
   - 如需更多配額，請在 Google Cloud Console 中申請

## 支援

如果您在設定過程中遇到問題，請聯繫技術支援團隊。

---

設定完成後，您就可以輕鬆地在系統和 Google Sheets 之間同步代管案件資料了！
