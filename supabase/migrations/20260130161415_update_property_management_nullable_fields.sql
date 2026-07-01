/*
  # 更新代管案件欄位設定

  ## 變更內容
  
  1. **必填欄位（NOT NULL）**
     - `case_number`（案件編號）
     - `case_address`（地址）
     - `user_id`（系統欄位）
  
  2. **數字欄位（numeric, 可為 NULL）**
     - `monthly_rent`（租金金額）
     - `water_fee`（水費）
     - `electricity_fee`（電費）
     - `management_fee`（管理費）
     - 移除所有默認值，允許空值
  
  3. **日期欄位（date, 可為 NULL）**
     - `contract_start_date`（承租日期）
     - `contract_end_date`（期滿日期）
     - `rent_payment_date`（房租繳款日）
     - `utility_settlement_date`（水電結算日）
  
  4. **文字欄位（text, 可為 NULL）**
     - 所有其他欄位均為文字形式儲存
  
  ## 注意事項
  - 除了案件編號、地址、user_id 外，所有欄位都可以接受空值
  - 移除不必要的默認值，確保數據輸入的靈活性
*/

-- 移除 management_fee_ratio 的默認值
ALTER TABLE property_management_cases 
  ALTER COLUMN management_fee_ratio DROP DEFAULT;

-- 移除 water_fee 的默認值（如果有）
ALTER TABLE property_management_cases 
  ALTER COLUMN water_fee DROP DEFAULT;

-- 移除 electricity_fee 的默認值（如果有）
ALTER TABLE property_management_cases 
  ALTER COLUMN electricity_fee DROP DEFAULT;

-- 移除 commission 的默認值
ALTER TABLE property_management_cases 
  ALTER COLUMN commission DROP DEFAULT;

-- 移除 google_sheet_sync_enabled 的默認值
ALTER TABLE property_management_cases 
  ALTER COLUMN google_sheet_sync_enabled DROP DEFAULT;

-- 移除 status 的默認值
ALTER TABLE property_management_cases 
  ALTER COLUMN status DROP DEFAULT;

-- 確保所有欄位都可以為 NULL（除了必填欄位）
-- case_number, case_address, user_id 保持 NOT NULL
-- 其他欄位已經是 NULL，這裡只是確認
