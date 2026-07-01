interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
  range?: string;
}

interface PropertyManagementRow {
  case_number: string;
  case_address: string;
  manager_name?: string;
  owner_name: string;
  owner_phone: string;
  owner_id_number: string;
  tenant_name: string;
  tenant_phone: string;
  property_type: string;
  layout: string;
  area: number;
  monthly_rent: number;
  management_fee_ratio: number;
  management_fee: number;
  payment_frequency?: string;
  water_electricity_billing?: string;
  contract_start_date: string;
  contract_end_date: string;
  deposit: number;
  payment_status?: string;
  status: string;
  commission?: number;
  commission_notes?: string;
  notes: string;
  water_fee?: number;
  electricity_fee?: number;
  rent_payment_date?: string;
  utility_settlement_date?: string;
  last_public_ekwh?: number;
  recent_public_ekwh?: number;
  last_private_ekwh?: number;
  recent_private_ekwh?: number;
}

const SHEET_COLUMNS = [
  'case_number',
  'case_address',
  'manager_name',
  'owner_name',
  'owner_phone',
  'owner_id_number',
  'tenant_name',
  'tenant_phone',
  'property_type',
  'layout',
  'area',
  'monthly_rent',
  'management_fee_ratio',
  'management_fee',
  'payment_frequency',
  'water_electricity_billing',
  'contract_start_date',
  'contract_end_date',
  'deposit',
  'payment_status',
  'status',
  'commission',
  'commission_notes',
  'notes',
  'water_fee',
  'electricity_fee',
  'rent_payment_date',
  'utility_settlement_date',
  'last_public_ekwh',
  'recent_public_ekwh',
  'last_private_ekwh',
  'recent_private_ekwh'
];

export class GoogleSheetsService {
  private apiKey: string;
  private spreadsheetId: string;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(config: GoogleSheetsConfig) {
    this.apiKey = config.apiKey;
    this.spreadsheetId = config.spreadsheetId;
  }

  async readData(range: string = '代管案件!A1:Z1000'): Promise<PropertyManagementRow[]> {
    try {
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to read from Google Sheets: ${response.statusText}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      if (rows.length < 3) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows.slice(2);

      return dataRows.map((row: string[]) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          const value = row[index] || '';

          if (['area', 'monthly_rent', 'management_fee_ratio', 'management_fee', 'deposit', 'water_fee', 'electricity_fee', 'commission', 'last_public_ekwh', 'recent_public_ekwh', 'last_private_ekwh', 'recent_private_ekwh'].includes(header)) {
            obj[header] = value ? parseFloat(value) : null;
          } else {
            obj[header] = value || null;
          }
        });
        return obj as PropertyManagementRow;
      });
    } catch (error) {
      console.error('Error reading from Google Sheets:', error);
      throw error;
    }
  }

  async writeData(data: PropertyManagementRow[], range: string = 'A1'): Promise<void> {
    try {
      const headers = SHEET_COLUMNS;

      const rows = data.map(item =>
        headers.map(key => {
          const value = item[key as keyof PropertyManagementRow];
          return value !== null && value !== undefined ? String(value) : '';
        })
      );

      const values = [headers, ...rows];

      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          values,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to write to Google Sheets: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error writing to Google Sheets:', error);
      throw error;
    }
  }

  async appendData(data: PropertyManagementRow[], range: string = 'A1'): Promise<void> {
    try {
      const headers = SHEET_COLUMNS;

      const rows = data.map(item =>
        headers.map(key => {
          const value = item[key as keyof PropertyManagementRow];
          return value !== null && value !== undefined ? String(value) : '';
        })
      );

      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          values: rows,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to append to Google Sheets: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error appending to Google Sheets:', error);
      throw error;
    }
  }

  async updateRow(rowIndex: number, data: PropertyManagementRow, range: string = 'A'): Promise<void> {
    try {
      const headers = SHEET_COLUMNS;

      const row = headers.map(key => {
        const value = data[key as keyof PropertyManagementRow];
        return value !== null && value !== undefined ? String(value) : '';
      });

      const cellRange = `${range}${rowIndex + 1}:Z${rowIndex + 1}`;
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${cellRange}?valueInputOption=RAW&key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: cellRange,
          values: [row],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update Google Sheets row: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating Google Sheets row:', error);
      throw error;
    }
  }

  static extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}

export function parseGoogleSheetsUrl(url: string): { spreadsheetId: string; sheetName?: string } | null {
  try {
    const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(url);
    if (!spreadsheetId) {
      return null;
    }

    const sheetMatch = url.match(/[#&]gid=(\d+)/);
    const sheetName = sheetMatch ? `Sheet${sheetMatch[1]}` : undefined;

    return { spreadsheetId, sheetName };
  } catch {
    return null;
  }
}
