/*
  # 修復安全性和效能問題

  1. 效能優化
    - 為所有 user_id 外鍵欄位新增索引
    - 這些索引可以大幅提升查詢效能，特別是在過濾使用者資料時
    
  2. 新增的索引
    - benefit_evaluations(user_id)
    - package_rental_cases(user_id)
    - property_management_cases(user_id)
    - quotations(user_id)
    - rental_agency_cases(user_id)
    
  3. 安全性修復
    - 修復 update_updated_at_column 函數的 search_path 問題
    - 設定 search_path 為 'public'，避免注入攻擊
*/

-- 為 benefit_evaluations 的 user_id 新增索引
CREATE INDEX IF NOT EXISTS idx_benefit_evaluations_user_id 
  ON benefit_evaluations(user_id);

-- 為 package_rental_cases 的 user_id 新增索引
CREATE INDEX IF NOT EXISTS idx_package_rental_cases_user_id 
  ON package_rental_cases(user_id);

-- 為 property_management_cases 的 user_id 新增索引
CREATE INDEX IF NOT EXISTS idx_property_management_cases_user_id 
  ON property_management_cases(user_id);

-- 為 quotations 的 user_id 新增索引
CREATE INDEX IF NOT EXISTS idx_quotations_user_id 
  ON quotations(user_id);

-- 為 rental_agency_cases 的 user_id 新增索引
CREATE INDEX IF NOT EXISTS idx_rental_agency_cases_user_id 
  ON rental_agency_cases(user_id);

-- 修復 update_updated_at_column 函數的 search_path 安全性問題
-- 先刪除舊函數
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 重新建立函數，並設定固定的 search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 重新建立所有使用此函數的觸發器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefit_evaluations_updated_at
  BEFORE UPDATE ON benefit_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_rental_cases_updated_at
  BEFORE UPDATE ON package_rental_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_management_cases_updated_at
  BEFORE UPDATE ON property_management_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_agency_cases_updated_at
  BEFORE UPDATE ON rental_agency_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
