/*
  # Update rental agency cases table for public listing

  1. Changes
    - Add `photos` column (array of image URLs, max 10)
    - Add `features` column (array of feature tags)
    - Add `surroundings` column (周邊生活機能 description)
    - Add `description` column (案件內容敘述)
    - Add `is_public` column (是否公開顯示)
    - Update existing columns for better structure

  2. Security
    - Update RLS policies to allow public read access for public listings
    - Maintain existing policies for authenticated users
*/

-- Add new columns to rental_agency_cases
DO $$
BEGIN
  -- Photos array (max 10 images)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'photos'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN photos text[] DEFAULT '{}';
  END IF;

  -- Features/tags array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'features'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN features text[] DEFAULT '{}';
  END IF;

  -- Surroundings description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'surroundings'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN surroundings text DEFAULT '';
  END IF;

  -- Description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'description'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN description text DEFAULT '';
  END IF;

  -- Is public flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_agency_cases' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE rental_agency_cases ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Add constraint to limit photos to max 10
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rental_agency_cases_photos_max_10'
  ) THEN
    ALTER TABLE rental_agency_cases
    ADD CONSTRAINT rental_agency_cases_photos_max_10
    CHECK (array_length(photos, 1) IS NULL OR array_length(photos, 1) <= 10);
  END IF;
END $$;

-- Add policy for public read access to public listings
DROP POLICY IF EXISTS "Public can view public rental agency cases" ON rental_agency_cases;

CREATE POLICY "Public can view public rental agency cases"
  ON rental_agency_cases
  FOR SELECT
  TO public
  USING (is_public = true);

-- Keep existing authenticated policies
DROP POLICY IF EXISTS "Users can view own rental agency cases" ON rental_agency_cases;

CREATE POLICY "Users can view own rental agency cases"
  ON rental_agency_cases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own rental agency cases" ON rental_agency_cases;

CREATE POLICY "Users can insert own rental agency cases"
  ON rental_agency_cases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rental agency cases" ON rental_agency_cases;

CREATE POLICY "Users can update own rental agency cases"
  ON rental_agency_cases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rental agency cases" ON rental_agency_cases;

CREATE POLICY "Users can delete own rental agency cases"
  ON rental_agency_cases
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
