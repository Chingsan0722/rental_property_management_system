/*
  # 更新 RLS 政策以支援管理員和一般使用者權限

  1. 權限設計
    - 一般使用者：只能查看、新增、修改、刪除自己的案件
    - 管理員：可以查看、修改、刪除所有案件

  2. 更新的表
    - quotations（報價單）
    - quotation_items（報價項目）
    - benefit_evaluations（效益評估）
    - package_rental_cases（包租代管案件）
    - property_management_cases（物業管理案件）
    - rental_agency_cases（租賃仲介案件）

  3. 安全性
    - 使用 auth.uid() 驗證使用者身份
    - 使用 auth.jwt() 檢查管理員權限
    - 所有政策都限制為已認證使用者
*/

-- 刪除現有的 policies
DROP POLICY IF EXISTS "Users can view own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete own quotations" ON quotations;

DROP POLICY IF EXISTS "Users can view own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can insert own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can update own quotation items" ON quotation_items;
DROP POLICY IF EXISTS "Users can delete own quotation items" ON quotation_items;

DROP POLICY IF EXISTS "Users can view own benefit evaluations" ON benefit_evaluations;
DROP POLICY IF EXISTS "Users can insert own benefit evaluations" ON benefit_evaluations;
DROP POLICY IF EXISTS "Users can update own benefit evaluations" ON benefit_evaluations;
DROP POLICY IF EXISTS "Users can delete own benefit evaluations" ON benefit_evaluations;

DROP POLICY IF EXISTS "Users can view own package rental cases" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can insert own package rental cases" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can update own package rental cases" ON package_rental_cases;
DROP POLICY IF EXISTS "Users can delete own package rental cases" ON package_rental_cases;

DROP POLICY IF EXISTS "Users can view own property management cases" ON property_management_cases;
DROP POLICY IF EXISTS "Users can insert own property management cases" ON property_management_cases;
DROP POLICY IF EXISTS "Users can update own property management cases" ON property_management_cases;
DROP POLICY IF EXISTS "Users can delete own property management cases" ON property_management_cases;

DROP POLICY IF EXISTS "Users can view own rental agency cases" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can insert own rental agency cases" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can update own rental agency cases" ON rental_agency_cases;
DROP POLICY IF EXISTS "Users can delete own rental agency cases" ON rental_agency_cases;

-- ==================== QUOTATIONS ====================

CREATE POLICY "Users can view own quotations or admins can view all"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotations or admins can update all"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own quotations or admins can delete all"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== QUOTATION ITEMS ====================

CREATE POLICY "Users can view quotation items for accessible quotations"
  ON quotation_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND (
        quotations.user_id = auth.uid()
        OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
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
      AND quotations.user_id = auth.uid()
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
        quotations.user_id = auth.uid()
        OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND (
        quotations.user_id = auth.uid()
        OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
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
        quotations.user_id = auth.uid()
        OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      )
    )
  );

-- ==================== BENEFIT EVALUATIONS ====================

CREATE POLICY "Users can view own evaluations or admins can view all"
  ON benefit_evaluations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own evaluations"
  ON benefit_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations or admins can update all"
  ON benefit_evaluations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own evaluations or admins can delete all"
  ON benefit_evaluations FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== PACKAGE RENTAL CASES ====================

CREATE POLICY "Users can view own package rental cases or admins can view all"
  ON package_rental_cases FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own package rental cases"
  ON package_rental_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own package rental cases or admins can update all"
  ON package_rental_cases FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own package rental cases or admins can delete all"
  ON package_rental_cases FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== PROPERTY MANAGEMENT CASES ====================

CREATE POLICY "Users can view own property management cases or admins can view all"
  ON property_management_cases FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own property management cases"
  ON property_management_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own property management cases or admins can update all"
  ON property_management_cases FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own property management cases or admins can delete all"
  ON property_management_cases FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- ==================== RENTAL AGENCY CASES ====================

CREATE POLICY "Users can view own rental agency cases or admins can view all"
  ON rental_agency_cases FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can insert own rental agency cases"
  ON rental_agency_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rental agency cases or admins can update all"
  ON rental_agency_cases FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Users can delete own rental agency cases or admins can delete all"
  ON rental_agency_cases FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
