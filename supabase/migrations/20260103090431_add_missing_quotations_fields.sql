/*
  # 添加報價表缺少的欄位

  1. 新增欄位
    - `property_type` - 物件類型
    - `layout` - 格局
    - `area` - 坪數
    - `monthly_rent` - 月租金
    - `management_fee` - 管理費
    - `agent_signature` - 經辦人簽名
    - `owner_signature` - 業主簽名
    - `notes` - 備註

  2. 資料完整性
    - 所有新欄位都允許為空值
    - 使用 IF NOT EXISTS 確保安全執行
*/

DO $$
BEGIN
  -- 物件類型
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'property_type'
  ) THEN
    ALTER TABLE quotations ADD COLUMN property_type text DEFAULT '';
  END IF;

  -- 格局
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'layout'
  ) THEN
    ALTER TABLE quotations ADD COLUMN layout text DEFAULT '';
  END IF;

  -- 坪數
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'area'
  ) THEN
    ALTER TABLE quotations ADD COLUMN area numeric DEFAULT 0;
  END IF;

  -- 月租金
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'monthly_rent'
  ) THEN
    ALTER TABLE quotations ADD COLUMN monthly_rent numeric DEFAULT 0;
  END IF;

  -- 管理費
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'management_fee'
  ) THEN
    ALTER TABLE quotations ADD COLUMN management_fee numeric DEFAULT 0;
  END IF;

  -- 經辦人簽名
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'agent_signature'
  ) THEN
    ALTER TABLE quotations ADD COLUMN agent_signature text DEFAULT '';
  END IF;

  -- 業主簽名
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'owner_signature'
  ) THEN
    ALTER TABLE quotations ADD COLUMN owner_signature text DEFAULT '';
  END IF;

  -- 備註
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'notes'
  ) THEN
    ALTER TABLE quotations ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;