/*
  # 更新包租案件表欄位

  1. 變更
    - 新增 `rental_income` 欄位（出租金額）到 package_rental_cases 表
    - 將 monthly_rent 改名為更清楚的承租金額概念（保持欄位名稱，但在應用層面改變標籤）
    - 移除不再使用的欄位：
      - contract_deadline（專約截止日）
      - water_fee_method（水費計費方式）
      - electricity_fee_method（電費計費方式）
      - commission（業務收益）

  2. 資料完整性
    - 設定 rental_income 預設值為 0
    - 使用 IF EXISTS 確保安全執行
*/

-- 新增出租金額欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'package_rental_cases' AND column_name = 'rental_income'
  ) THEN
    ALTER TABLE package_rental_cases ADD COLUMN rental_income numeric DEFAULT 0;
  END IF;
END $$;

-- 移除不再使用的欄位
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'package_rental_cases' AND column_name = 'contract_deadline'
  ) THEN
    ALTER TABLE package_rental_cases DROP COLUMN contract_deadline;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'package_rental_cases' AND column_name = 'water_fee_method'
  ) THEN
    ALTER TABLE package_rental_cases DROP COLUMN water_fee_method;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'package_rental_cases' AND column_name = 'electricity_fee_method'
  ) THEN
    ALTER TABLE package_rental_cases DROP COLUMN electricity_fee_method;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'package_rental_cases' AND column_name = 'commission'
  ) THEN
    ALTER TABLE package_rental_cases DROP COLUMN commission;
  END IF;
END $$;
