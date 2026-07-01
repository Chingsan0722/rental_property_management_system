/*
  # 修復 RLS 安全性和效能問題
  
  ## 重大安全性修復
  1. **user_metadata 安全漏洞**: 
     - 將所有 RLS 政策從 user_metadata 改為 raw_app_meta_data
     - user_metadata 可由使用者編輯，不應用於安全檢查
     - raw_app_meta_data 只能由系統管理，適合權限控制
  
  2. **效能優化**:
     - 將所有 auth.uid() 和 auth.jwt() 包裝在 SELECT 子查詢中
     - 避免每行重複評估函數，大幅提升大規模查詢效能
  
  3. **修復重複政策**:
     - rental_agency_cases 有兩個衝突的 SELECT 政策
     - 移除舊的 "Users can view own rental agency cases" 政策
     - 保留整合的 admin 權限政策
  
  4. **清理未使用的索引**:
     - 移除從未使用的索引以減少寫入負擔
  
  ## 受影響的表
  - quotations
  - quotation_items
  - benefit_evaluations
  - package_rental_cases
  - property_management_cases
  - rental_agency_cases
*/

-- ==================== 移除重複和舊的政策 ====================

-- rental_agency_cases: 移除衝突的政策
DROP POLICY IF EXISTS "Users can view own rental agency cases" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can update own rental agency cases" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can delete own rental agency cases" ON rental_agency_cases;

-- 移除所有現有的 admin 權限政策（將重新建立修復後的版本）
DROP POLICY IF EXISTS "Users can view own quotations or admins can view all" ON quotations;
DROP POLICY IF EXISTS "Users can insert own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update own quotations or admins can update all" ON quotations;
DROP POLICY IF EXISTS "Users can delete own quotations or admins can delete all" ON quotations;

DROP POLICY IF EXISTS "Users can view quotation items for accessible quotations" ON quotation_items;
DROP POLICY IF EXISTS "Users can insert quotation items for own quotations" ON quotation_items;
DROP POLICY IF EXISTS "Users can update quotation items for accessible quotations" ON quotation_items;
DROP POLICY IF EXISTS "Users can delete quotation items for accessible quotations" ON quotation_items;

DROP POLICY IF EXISTS "Users can view own evaluations or admins can view all" ON benefit_evaluations;
DROP POLICY IF EXISTS "Users can insert own evaluations" ON benefit_evaluations;
DROP POLICY IF EXISTS "Users can update own evaluations or admins can update all" ON benefit_evaluations;
DROP POLICY IF EXISTS "Users can delete own evaluations or admins can delete all" ON benefit_evaluations;

DROP POLICY IF EXISTS "Users can view own package rental cases or admins can view all" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can insert own package rental cases" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can update own package rental cases or admins can update all" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can update own package rental cases or admins can update " ON package_rental_cases;
DROP POLICY IF EXISTS "Users can delete own package rental cases or admins can delete all" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can delete own package rental cases or admins can delete " ON package_rental_cases;

DROP POLICY IF EXISTS "Users can view own property management cases or admins can view all" ON property_management_cases;
DROP POLICY IF EXISTS "Users can view own property management cases or admins can view" ON property_management_cases;
DROP POLICY IF EXISTS "Users can insert own property management cases" ON property_management_cases;
DROP POLICY IF EXISTS "Users can update own property management cases or admins can update all" ON property_management_cases;
DROP POLICY IF EXISTS "Users can update own property management cases or admins can up" ON property_management_cases;
DROP POLICY IF EXISTS "Users can delete own property management cases or admins can delete all" ON property_management_cases;
DROP POLICY IF EXISTS "Users can delete own property management cases or admins can de" ON property_management_cases;

DROP POLICY IF EXISTS "Users can view own rental agency cases or admins can view all" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can insert own rental agency cases" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can update own rental agency cases or admins can update all" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can update own rental agency cases or admins can update a" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can delete own rental agency cases or admins can delete all" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can delete own rental agency cases or admins can delete a" ON rental_agency_cases;

-- ==================== QUOTATIONS - 修復後的政策 ====================

CREATE POLICY "Users can view own quotations or admins can view all"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own quotations or admins can update all"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own quotations or admins can delete all"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== QUOTATION ITEMS - 修復後的政策 ====================

CREATE POLICY "Users can view quotation items for accessible quotations"
  ON quotation_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND (
        quotations.user_id = (SELECT auth.uid())
        OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
      )
    )
  );

CREATE POLICY "Users can insert quotation items for own quotations"
  ON quotation_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update quotation items for accessible quotations"
  ON quotation_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND (
        quotations.user_id = (SELECT auth.uid())
        OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND (
        quotations.user_id = (SELECT auth.uid())
        OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
      )
    )
  );

CREATE POLICY "Users can delete quotation items for accessible quotations"
  ON quotation_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND (
        quotations.user_id = (SELECT auth.uid())
        OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
      )
    )
  );

-- ==================== BENEFIT EVALUATIONS - 修復後的政策 ====================

CREATE POLICY "Users can view own evaluations or admins can view all"
  ON benefit_evaluations FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own evaluations"
  ON benefit_evaluations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own evaluations or admins can update all"
  ON benefit_evaluations FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own evaluations or admins can delete all"
  ON benefit_evaluations FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== PACKAGE RENTAL CASES - 修復後的政策 ====================

CREATE POLICY "Users can view own package rental cases or admins can view all"
  ON package_rental_cases FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own package rental cases"
  ON package_rental_cases FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own package rental cases or admins can update all"
  ON package_rental_cases FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own package rental cases or admins can delete all"
  ON package_rental_cases FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== PROPERTY MANAGEMENT CASES - 修復後的政策 ====================

CREATE POLICY "Users can view own property management cases or admins can view all"
  ON property_management_cases FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own property management cases"
  ON property_management_cases FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own property management cases or admins can update all"
  ON property_management_cases FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own property management cases or admins can delete all"
  ON property_management_cases FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== RENTAL AGENCY CASES - 修復後的政策 ====================

CREATE POLICY "Users can view own rental agency cases or admins can view all"
  ON rental_agency_cases FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own rental agency cases"
  ON rental_agency_cases FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own rental agency cases or admins can update all"
  ON rental_agency_cases FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own rental agency cases or admins can delete all"
  ON rental_agency_cases FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== 清理未使用的索引 ====================

DROP INDEX IF EXISTS idx_quotations_created_at;
DROP INDEX IF EXISTS idx_quotation_items_quotation_id;
DROP INDEX IF EXISTS idx_package_rental_cases_status;
DROP INDEX IF EXISTS idx_package_rental_cases_created_at;
DROP INDEX IF EXISTS idx_property_management_cases_status;
DROP INDEX IF EXISTS idx_property_management_cases_created_at;
DROP INDEX IF EXISTS idx_rental_agency_cases_status;
DROP INDEX IF EXISTS idx_rental_agency_cases_created_at;
