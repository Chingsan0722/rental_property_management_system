-- Property Management System Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  business_phone text,
  quote_date date NOT NULL DEFAULT CURRENT_DATE,
  case_address text NOT NULL,
  owner_name text NOT NULL,
  owner_phone text,
  case_type text,
  total_amount decimal(12,2) DEFAULT 0,
  tax_included_amount decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotation items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  unit_price decimal(12,2) DEFAULT 0,
  subtotal decimal(12,2) DEFAULT 0,
  notes text,
  sort_order integer DEFAULT 0
);

-- Create benefit evaluations table
CREATE TABLE IF NOT EXISTS benefit_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_address text NOT NULL,
  property_type text,
  layout text,
  area decimal(10,2),
  renovation_cost decimal(12,2) DEFAULT 0,
  personnel_cost decimal(12,2) DEFAULT 0,
  development_bonus decimal(12,2) DEFAULT 0,
  monthly_rent_cost decimal(12,2) DEFAULT 0,
  expected_rent_income decimal(12,2) DEFAULT 0,
  contract_years integer DEFAULT 3,
  expected_vacancy_months integer DEFAULT 0,
  agency_service_months integer DEFAULT 1,
  management_fee_ratio decimal(5,2) DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create package rental cases table
CREATE TABLE IF NOT EXISTS package_rental_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_address text NOT NULL,
  owner_name text NOT NULL,
  owner_phone text,
  owner_id_number text,
  property_type text,
  layout text,
  area decimal(10,2),
  monthly_rent decimal(12,2) DEFAULT 0,
  contract_start_date date,
  contract_end_date date,
  contract_years integer DEFAULT 3,
  deposit decimal(12,2) DEFAULT 0,
  status text DEFAULT '洽談中',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create property management cases table
CREATE TABLE IF NOT EXISTS property_management_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_address text NOT NULL,
  owner_name text NOT NULL,
  owner_phone text,
  owner_id_number text,
  tenant_name text,
  tenant_phone text,
  property_type text,
  layout text,
  area decimal(10,2),
  monthly_rent decimal(12,2) DEFAULT 0,
  management_fee_ratio decimal(5,2) DEFAULT 10,
  management_fee decimal(12,2) DEFAULT 0,
  contract_start_date date,
  contract_end_date date,
  deposit decimal(12,2) DEFAULT 0,
  status text DEFAULT '執行中',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rental agency cases table
CREATE TABLE IF NOT EXISTS rental_agency_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_address text NOT NULL,
  owner_name text NOT NULL,
  owner_phone text,
  owner_id_number text,
  property_type text,
  layout text,
  area decimal(10,2),
  expected_rent decimal(12,2) DEFAULT 0,
  service_fee_months integer DEFAULT 1,
  service_fee decimal(12,2) DEFAULT 0,
  listing_date date DEFAULT CURRENT_DATE,
  status text DEFAULT '尋找中',
  rented_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_rental_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_management_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agency_cases ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your auth requirements)
CREATE POLICY "Enable all for all users" ON quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON quotation_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON benefit_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON package_rental_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON property_management_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON rental_agency_cases FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_benefit_evaluations_created_at ON benefit_evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_package_rental_cases_status ON package_rental_cases(status);
CREATE INDEX IF NOT EXISTS idx_property_management_cases_status ON property_management_cases(status);
CREATE INDEX IF NOT EXISTS idx_rental_agency_cases_status ON rental_agency_cases(status);
