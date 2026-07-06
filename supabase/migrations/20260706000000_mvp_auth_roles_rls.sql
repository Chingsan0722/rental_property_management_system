/*
  MVP Auth roles and RLS policies

  Required Supabase Auth setup:
  1. Create users in Authentication > Users.
  2. Set admin users' raw_app_meta_data to:
     {"role":"admin"}
  3. Set view-only users' raw_app_meta_data to:
     {"role":"viewer"}

  Policy model:
  - Any authenticated user can read application data.
  - Only admin users can insert, update, or delete application data.
*/

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_rental_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_management_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agency_cases ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'quotations',
        'quotation_items',
        'benefit_evaluations',
        'package_rental_cases',
        'property_management_cases',
        'rental_agency_cases'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END $$;

CREATE POLICY "mvp authenticated read quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mvp admin write quotations"
  ON quotations FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "mvp authenticated read quotation items"
  ON quotation_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mvp admin write quotation items"
  ON quotation_items FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "mvp authenticated read benefit evaluations"
  ON benefit_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mvp admin write benefit evaluations"
  ON benefit_evaluations FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "mvp authenticated read package rental cases"
  ON package_rental_cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mvp admin write package rental cases"
  ON package_rental_cases FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "mvp authenticated read property management cases"
  ON property_management_cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mvp admin write property management cases"
  ON property_management_cases FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "mvp authenticated read rental agency cases"
  ON rental_agency_cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mvp admin write rental agency cases"
  ON rental_agency_cases FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
