/*
  # 為效益評估表新增其他成本欄位

  1. 變更
    - 在 `benefit_evaluations` 表中新增 `other_cost` 欄位
    - 欄位為數值型態，預設值為 0
    - 用於記錄雜費、維修費等其他成本支出

  2. 說明
    - 此欄位用於計算包租案件的總成本
    - 包含雜費、維修費等無法歸類到其他成本項目的支出
    - 預設值設為 0，避免計算錯誤
*/

-- 新增 other_cost 欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'benefit_evaluations' AND column_name = 'other_cost'
  ) THEN
    ALTER TABLE benefit_evaluations 
    ADD COLUMN other_cost NUMERIC DEFAULT 0 NOT NULL;
  END IF;
END $$;
