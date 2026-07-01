export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          display_name: string;
          is_admin: boolean;
          font_size_preference: string;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      quotations: {
        Row: {
          id: string;
          business_name: string;
          business_phone: string | null;
          quote_date: string;
          case_address: string;
          owner_name: string;
          owner_phone: string | null;
          case_type: string | null;
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
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quotations']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quotations']['Insert']>;
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          item_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes: string | null;
          sort_order: number;
        };
        Insert: Omit<Database['public']['Tables']['quotation_items']['Row'], 'id'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['quotation_items']['Insert']>;
      };
      benefit_evaluations: {
        Row: {
          id: string;
          case_address: string;
          property_type: string | null;
          layout: string | null;
          area: number | null;
          renovation_cost: number;
          personnel_cost: number;
          development_bonus: number;
          monthly_rent_cost: number;
          expected_rent_income: number;
          contract_years: number;
          expected_vacancy_months: number;
          agency_service_months: number;
          management_fee_ratio: number;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['benefit_evaluations']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['benefit_evaluations']['Insert']>;
      };
      package_rental_cases: {
        Row: {
          id: string;
          case_address: string;
          owner_name: string;
          owner_phone: string | null;
          owner_id_number: string | null;
          property_type: string | null;
          layout: string | null;
          area: number | null;
          monthly_rent: number;
          contract_start_date: string | null;
          contract_end_date: string | null;
          contract_years: number;
          deposit: number;
          status: string;
          notes: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['package_rental_cases']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['package_rental_cases']['Insert']>;
      };
      property_management_cases: {
        Row: {
          id: string;
          case_address: string;
          owner_name: string;
          owner_phone: string | null;
          owner_id_number: string | null;
          tenant_name: string | null;
          tenant_phone: string | null;
          property_type: string | null;
          layout: string | null;
          area: number | null;
          monthly_rent: number;
          management_fee_ratio: number;
          management_fee: number;
          contract_start_date: string | null;
          contract_end_date: string | null;
          deposit: number;
          status: string;
          notes: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['property_management_cases']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['property_management_cases']['Insert']>;
      };
      rental_agency_cases: {
        Row: {
          id: string;
          case_address: string;
          owner_name: string;
          owner_phone: string | null;
          owner_id_number: string | null;
          property_type: string | null;
          layout: string | null;
          area: number | null;
          expected_rent: number;
          service_fee_months: number;
          service_fee: number;
          listing_date: string;
          status: string;
          rented_date: string | null;
          notes: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rental_agency_cases']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['rental_agency_cases']['Insert']>;
      };
    };
  };
}
