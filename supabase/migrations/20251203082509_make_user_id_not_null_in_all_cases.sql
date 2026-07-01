/*
  # 將所有案件表格的 user_id 設為必填

  1. 修改欄位
    - 將 package_rental_cases 的 user_id 改為 NOT NULL
    - 將 property_management_cases 的 user_id 改為 NOT NULL
    - 將 rental_agency_cases 的 user_id 改為 NOT NULL
    
  2. 說明
    - user_id 必須存在才能正確執行 RLS 政策
    - 避免出現 "new row violates row-level security policy" 錯誤
*/

-- 將所有表格的 user_id 改為 NOT NULL
ALTER TABLE package_rental_cases 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE property_management_cases 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE rental_agency_cases 
  ALTER COLUMN user_id SET NOT NULL;
