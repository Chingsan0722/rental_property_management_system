/*
  # 重建所有案件資料表

  1. 刪除現有表格
    - 刪除 package_rental_cases（包租案件）
    - 刪除 property_management_cases（代管案件）
    - 刪除 rental_agency_cases（代租案件）
  
  2. 重新建立包租案件表格
    - 只有 id, user_id, case_address 為必填
    - 其他所有欄位皆可為空值
    - 包含基本資訊、合約資訊、費用資訊
    
  3. 重新建立代管案件表格
    - 只有 id, user_id, case_address 為必填
    - 其他所有欄位皆可為空值
    - 包含出租人、承租人、租金管理資訊
    
  4. 重新建立代租案件表格
    - 只有 id, user_id, case_address 為必填
    - 其他所有欄位皆可為空值
    - 包含承租人、次承租人、預期租金、服務費資訊
    
  5. 安全性設定
    - 為所有表格啟用 RLS
    - 為每個表格建立完整的 CRUD 政策
*/

-- 刪除現有表格（如果存在）
DROP TABLE IF EXISTS package_rental_cases CASCADE;
DROP TABLE IF EXISTS property_management_cases CASCADE;
DROP TABLE IF EXISTS rental_agency_cases CASCADE;

-- 建立包租案件表格
CREATE TABLE IF NOT EXISTS package_rental_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  case_number text,
  case_address text NOT NULL,
  manager_name text,
  owner_name text,
  owner_phone text,
  owner_id_number text,
  property_type text,
  layout text,
  area numeric,
  monthly_rent numeric DEFAULT 0,
  water_fee_method text,
  electricity_fee_method text,
  contract_start_date date,
  contract_end_date date,
  contract_years integer DEFAULT 3,
  contract_deadline date,
  deposit numeric DEFAULT 0,
  rental_status text DEFAULT '待租中',
  status text DEFAULT '洽談中',
  commission numeric DEFAULT 0,
  commission_notes text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 建立代管案件表格
CREATE TABLE IF NOT EXISTS property_management_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  case_number text,
  case_address text NOT NULL,
  manager_name text,
  owner_name text,
  owner_phone text,
  owner_id_number text,
  tenant_name text,
  tenant_phone text,
  property_type text,
  layout text,
  area numeric,
  monthly_rent numeric DEFAULT 0,
  management_fee_ratio numeric DEFAULT 10,
  management_fee numeric DEFAULT 0,
  payment_frequency text,
  water_electricity_billing text,
  contract_start_date date,
  contract_end_date date,
  rent_payment_date text,
  utility_settlement_date text,
  deposit numeric DEFAULT 0,
  payment_status text,
  status text DEFAULT '執行中',
  commission numeric DEFAULT 0,
  commission_notes text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 建立代租案件表格
CREATE TABLE IF NOT EXISTS rental_agency_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  case_number text,
  case_address text NOT NULL,
  manager_name text,
  owner_name text,
  owner_phone text,
  owner_id_number text,
  tenant_name text,
  tenant_phone text,
  sub_tenant_name text,
  sub_tenant_phone text,
  property_type text,
  layout text,
  area numeric,
  expected_rent numeric DEFAULT 0,
  monthly_rent numeric DEFAULT 0,
  service_fee_months integer DEFAULT 1,
  service_fee numeric DEFAULT 0,
  payment_frequency text,
  water_electricity_billing text,
  contract_start_date date,
  contract_end_date date,
  next_payment_date date,
  next_utility_settlement_date date,
  listing_date date DEFAULT CURRENT_DATE,
  rented_date date,
  payment_status text,
  status text DEFAULT '尋找中',
  commission numeric DEFAULT 0,
  commission_notes text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE package_rental_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_management_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agency_cases ENABLE ROW LEVEL SECURITY;

-- 包租案件的 RLS 政策
CREATE POLICY "Users can view own package rental cases"
  ON package_rental_cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own package rental cases"
  ON package_rental_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own package rental cases"
  ON package_rental_cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own package rental cases"
  ON package_rental_cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 代管案件的 RLS 政策
CREATE POLICY "Users can view own property management cases"
  ON property_management_cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own property management cases"
  ON property_management_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own property management cases"
  ON property_management_cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own property management cases"
  ON property_management_cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 代租案件的 RLS 政策
CREATE POLICY "Users can view own rental agency cases"
  ON rental_agency_cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rental agency cases"
  ON rental_agency_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rental agency cases"
  ON rental_agency_cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rental agency cases"
  ON rental_agency_cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 建立更新時間觸發器函數（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為所有表格添加更新時間觸發器
DROP TRIGGER IF EXISTS update_package_rental_cases_updated_at ON package_rental_cases;
CREATE TRIGGER update_package_rental_cases_updated_at
  BEFORE UPDATE ON package_rental_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_management_cases_updated_at ON property_management_cases;
CREATE TRIGGER update_property_management_cases_updated_at
  BEFORE UPDATE ON property_management_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rental_agency_cases_updated_at ON rental_agency_cases;
CREATE TRIGGER update_rental_agency_cases_updated_at
  BEFORE UPDATE ON rental_agency_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
