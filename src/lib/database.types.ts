export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableMutation<Row> = Partial<{ [Key in keyof Row]: Row[Key] | null }>;

type TableDefinition<Row, Insert = TableMutation<Row>, Update = TableMutation<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type TimestampFields = {
  created_at: string;
  updated_at: string;
};

type CaseCommon = TimestampFields & {
  id: string;
  case_number: string;
  case_address: string;
  manager_name: string;
  owner_name: string;
  owner_phone: string | null;
  owner_id_number: string | null;
  property_type: string | null;
  layout: string | null;
  area: number | null;
  monthly_rent: number;
  status: string;
  notes: string | null;
  user_id: string | null;
  commission: number | null;
  commission_notes: string | null;
};

type Insertable<T extends { id: string } & Partial<TimestampFields>> =
  TableMutation<Omit<T, 'id' | 'created_at' | 'updated_at'>> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  };

export interface Database {
  public: {
    Tables: {
      users: TableDefinition<
        TimestampFields & {
          id: string;
          username: string;
          password_hash: string;
          display_name: string;
          is_admin: boolean;
          font_size_preference: string;
          must_change_password: boolean;
        },
        Insertable<
          TimestampFields & {
            id: string;
            username: string;
            password_hash: string;
            display_name: string;
            is_admin: boolean;
            font_size_preference: string;
            must_change_password: boolean;
          }
        >
      >;
      quotations: TableDefinition<
        TimestampFields & {
          id: string;
          business_name: string;
          business_phone: string | null;
          quote_date: string;
          case_address: string;
          owner_name: string;
          owner_phone: string | null;
          case_type: string | null;
          monthly_rent: number | null;
          total_amount: number;
          tax_included_amount: number;
          management_fee_type: string | null;
          management_fee_value: number;
          management_fee_amount: number;
          client_signature_name: string | null;
          handler_signature_name: string | null;
          internal_notes: string | null;
          client_content: string | null;
          user_id: string | null;
        },
        Insertable<
          TimestampFields & {
            id: string;
            business_name: string;
            business_phone: string | null;
            quote_date: string;
            case_address: string;
            owner_name: string;
            owner_phone: string | null;
            case_type: string | null;
            monthly_rent: number | null;
            total_amount: number;
            tax_included_amount: number;
            management_fee_type: string | null;
            management_fee_value: number;
            management_fee_amount: number;
            client_signature_name: string | null;
            handler_signature_name: string | null;
            internal_notes: string | null;
            client_content: string | null;
            user_id: string | null;
          }
        >
      >;
      quotation_items: TableDefinition<
        {
          id: string;
          quotation_id: string;
          item_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes: string | null;
          sort_order: number;
        },
        Partial<{
          quotation_id: string;
          item_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes: string | null;
          sort_order: number;
        }> & {
          id?: string;
        }
      >;
      benefit_evaluations: TableDefinition<
        TimestampFields & {
          id: string;
          case_address: string;
          property_type: string | null;
          layout: string | null;
          area: number | null;
          renovation_cost: number;
          personnel_cost: number;
          development_bonus: number;
          monthly_rent_cost: number;
          other_cost: number;
          expected_rent_income: number;
          contract_years: number;
          expected_vacancy_months: number;
          agency_service_months: number;
          management_fee_ratio: number;
          user_id: string | null;
        },
        Insertable<
          TimestampFields & {
            id: string;
            case_address: string;
            property_type: string | null;
            layout: string | null;
            area: number | null;
            renovation_cost: number;
            personnel_cost: number;
            development_bonus: number;
            monthly_rent_cost: number;
            other_cost: number;
            expected_rent_income: number;
            contract_years: number;
            expected_vacancy_months: number;
            agency_service_months: number;
            management_fee_ratio: number;
            user_id: string | null;
          }
        >
      >;
      package_rental_cases: TableDefinition<
        CaseCommon & {
          water_fee_method: string | null;
          electricity_fee_method: string | null;
          contract_start_date: string | null;
          contract_end_date: string | null;
          contract_years: number;
          deposit: number;
        },
        Insertable<
          CaseCommon & {
            water_fee_method: string | null;
            electricity_fee_method: string | null;
            contract_start_date: string | null;
            contract_end_date: string | null;
            contract_years: number;
            deposit: number;
          }
        >
      >;
      property_management_cases: TableDefinition<
        CaseCommon & {
          tenant_name: string | null;
          tenant_phone: string | null;
          management_fee_ratio: number;
          management_fee: number;
          contract_start_date: string | null;
          contract_end_date: string | null;
          deposit: number;
          payment_frequency: string | null;
          water_electricity_billing: string | null;
          rent_payment_date: string | null;
          utility_settlement_date: string | null;
          next_utility_settlement_date: string | null;
          payment_status: string | null;
          water_fee: number | null;
          electricity_fee: number | null;
          last_synced_at: string | null;
          last_public_ekwh: number | null;
          recent_public_ekwh: number | null;
          last_private_ekwh: number | null;
          recent_private_ekwh: number | null;
        },
        Insertable<
          CaseCommon & {
            tenant_name: string | null;
            tenant_phone: string | null;
            management_fee_ratio: number;
            management_fee: number;
            contract_start_date: string | null;
            contract_end_date: string | null;
            deposit: number;
            payment_frequency: string | null;
            water_electricity_billing: string | null;
            rent_payment_date: string | null;
            utility_settlement_date: string | null;
            next_utility_settlement_date: string | null;
            payment_status: string | null;
            water_fee: number | null;
            electricity_fee: number | null;
            last_synced_at: string | null;
            last_public_ekwh: number | null;
            recent_public_ekwh: number | null;
            last_private_ekwh: number | null;
            recent_private_ekwh: number | null;
          }
        >
      >;
      rental_agency_cases: TableDefinition<
        CaseCommon & {
          expected_rent: number | null;
          service_fee_months: number | null;
          service_fee: number | null;
          listing_date: string | null;
          commission_date: string | null;
          rented_date: string | null;
          next_utility_settlement_date: string | null;
          payment_status: string | null;
          photos: string[];
          features: string[];
          surroundings: string;
          description: string;
          is_public: boolean;
        },
        Insertable<
          CaseCommon & {
            expected_rent: number | null;
            service_fee_months: number | null;
            service_fee: number | null;
            listing_date: string | null;
            commission_date: string | null;
            rented_date: string | null;
            next_utility_settlement_date: string | null;
            payment_status: string | null;
            photos: string[];
            features: string[];
            surroundings: string;
            description: string;
            is_public: boolean;
          }
        >
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
