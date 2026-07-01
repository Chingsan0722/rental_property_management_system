/*
  # Add water and electricity fee fields to property management cases

  1. Changes
    - Add `water_fee` (numeric) - Individual water fee amount
    - Add `electricity_fee` (numeric) - Individual electricity fee amount
    
  2. Notes
    - These fields replace the combined `water_electricity_billing` text field
    - Both fields default to 0 for easier calculations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'water_fee'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN water_fee numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'electricity_fee'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN electricity_fee numeric DEFAULT 0;
  END IF;
END $$;
