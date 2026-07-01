/*
  # Add Internal Notes and Client Content to Quotations

  1. Changes
    - Add `internal_notes` (text) - 內部備註，僅編輯者可見
    - Add `client_content` (text) - 給客戶的說明，會出現在匯出文件

  2. Notes
    - Both fields are optional (nullable) text fields
    - Default value is empty string
    - Uses IF NOT EXISTS to ensure safe execution
*/

DO $$
BEGIN
  -- 內部備註
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'internal_notes'
  ) THEN
    ALTER TABLE quotations ADD COLUMN internal_notes text DEFAULT '';
  END IF;

  -- 給客戶的說明
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'client_content'
  ) THEN
    ALTER TABLE quotations ADD COLUMN client_content text DEFAULT '';
  END IF;
END $$;
