/*
  # Add Google Sheets Integration Configuration

  1. Changes
    - Add `google_sheet_id` column to `property_management_cases` table
    - Add `google_sheet_sync_enabled` column to enable/disable sync
    - Add `last_synced_at` column to track last sync time
    
  2. Purpose
    - Allow users to link Google Sheets to property management cases
    - Enable bidirectional sync between system and Google Sheets
    - Track sync status and timing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'google_sheet_id'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN google_sheet_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'google_sheet_sync_enabled'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN google_sheet_sync_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;