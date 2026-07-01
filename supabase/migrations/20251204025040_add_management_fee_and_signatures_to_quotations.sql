-- # 新增施工期間管理費及簽名欄位到報價單
--
-- 1. 新增欄位
--    - management_fee_type (text) - 管理費類型：percentage 百分比或 fixed 固定金額
--    - management_fee_value (numeric) - 管理費數值（百分比或固定金額）
--    - management_fee_amount (numeric) - 計算後的管理費金額
--    - client_signature_name (text) - 委託人簽名欄位
--    - handler_signature_name (text) - 經手人簽名欄位
-- 
-- 2. 說明
--    - 管理費用於自費裝修代租代管案件
--    - 可選擇以總工程款的百分比或特定固定金額計算
--    - 簽名欄位用於委託人及經手人簽署

-- 新增管理費類型欄位（百分比或固定金額）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'management_fee_type'
  ) THEN
    ALTER TABLE quotations ADD COLUMN management_fee_type text DEFAULT NULL;
  END IF;
END $$;

-- 新增管理費數值欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'management_fee_value'
  ) THEN
    ALTER TABLE quotations ADD COLUMN management_fee_value numeric DEFAULT 0;
  END IF;
END $$;

-- 新增計算後的管理費金額欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'management_fee_amount'
  ) THEN
    ALTER TABLE quotations ADD COLUMN management_fee_amount numeric DEFAULT 0;
  END IF;
END $$;

-- 新增委託人簽名欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'client_signature_name'
  ) THEN
    ALTER TABLE quotations ADD COLUMN client_signature_name text DEFAULT NULL;
  END IF;
END $$;

-- 新增經手人簽名欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'handler_signature_name'
  ) THEN
    ALTER TABLE quotations ADD COLUMN handler_signature_name text DEFAULT NULL;
  END IF;
END $$;
