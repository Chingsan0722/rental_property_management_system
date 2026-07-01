/*
  # 更新代租案件表欄位

  1. Changes
    - 移除 `payment_frequency` 欄位（繳款頻率）
    - 新增 `parking_space` 欄位（停車位有無）
    - 新增 `commission_date` 欄位（委任日期）
  
  2. Details
    - `parking_space`: 停車位有無 (text型別，可選值：'有'、'無')
    - `commission_date`: 委任日期 (date型別)
*/

-- 移除 payment_frequency 欄位
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'payment_frequency'
  ) THEN
    ALTER TABLE rental_agency_cases DROP COLUMN payment_frequency;
  END IF;
END $$;

-- 新增 parking_space 欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'parking_space'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN parking_space text;
  END IF;
END $$;

-- 新增 commission_date 欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'commission_date'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN commission_date date;
  END IF;
END $$;
