/*
  # 為所有案件表增加詳細欄位以支援 CSV 匯入和試算表編輯

  1. 變更
    - 為 `package_rental_cases` 新增：案件編號、管理人、水電費計費方式、專約截止日、出租情況等
    - 為 `property_management_cases` 新增：案件編號、管理人、繳款頻率、水電計費方式、繳款日期等
    - 為 `rental_agency_cases` 新增：案件編號、管理人、承租人、次承租人、繳款頻率等
    - 新增業務收益欄位到所有案件表

  2. 說明
    - 支援從 CSV 檔案匯入所有欄位資料
    - 方便試算表格式的批量編輯
    - 記錄業務人員個別案件收益
*/

-- 包租案件表新增欄位
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS case_number TEXT;
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS water_fee_method TEXT;
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS electricity_fee_method TEXT;
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS contract_deadline DATE;
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS rental_status TEXT DEFAULT '待租中';
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS commission NUMERIC DEFAULT 0;
ALTER TABLE package_rental_cases ADD COLUMN IF NOT EXISTS commission_notes TEXT;

-- 代管案件表新增欄位
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS case_number TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS payment_frequency TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS water_electricity_billing TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS rent_payment_date TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS utility_settlement_date TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS commission NUMERIC DEFAULT 0;
ALTER TABLE property_management_cases ADD COLUMN IF NOT EXISTS commission_notes TEXT;

-- 代租案件表新增欄位
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS case_number TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS tenant_name TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS tenant_phone TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS sub_tenant_name TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS sub_tenant_phone TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS payment_frequency TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS water_electricity_billing TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS next_payment_date DATE;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS next_utility_settlement_date DATE;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS commission NUMERIC DEFAULT 0;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS commission_notes TEXT;
ALTER TABLE rental_agency_cases ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC DEFAULT 0;

-- 為案件編號欄位建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_package_rental_case_number ON package_rental_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_property_management_case_number ON property_management_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_rental_agency_case_number ON rental_agency_cases(case_number);

-- 為管理人欄位建立索引
CREATE INDEX IF NOT EXISTS idx_package_rental_manager ON package_rental_cases(manager_name);
CREATE INDEX IF NOT EXISTS idx_property_management_manager ON property_management_cases(manager_name);
CREATE INDEX IF NOT EXISTS idx_rental_agency_manager ON rental_agency_cases(manager_name);
