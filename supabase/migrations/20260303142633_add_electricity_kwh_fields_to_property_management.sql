/*
  # Add Electricity kWh Fields to Property Management Cases

  1. Changes
    - Add four new columns to property_management_cases table:
      - `last_public_ekwh` (前期公電度數)
      - `recent_public_ekwh` (本期公電度數)
      - `last_private_ekwh` (前期私電度數)
      - `recent_private_ekwh` (本期私電度數)
    
  2. Notes
    - These fields store electricity meter readings for both public and private meters
    - Used to calculate electricity fees based on usage
    - All fields are optional (nullable) decimal values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'last_public_ekwh'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN last_public_ekwh decimal(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'recent_public_ekwh'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN recent_public_ekwh decimal(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'last_private_ekwh'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN last_private_ekwh decimal(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_management_cases' AND column_name = 'recent_private_ekwh'
  ) THEN
    ALTER TABLE property_management_cases ADD COLUMN recent_private_ekwh decimal(10, 2);
  END IF;
END $$;