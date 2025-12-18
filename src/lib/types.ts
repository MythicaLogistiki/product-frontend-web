export interface Transaction {
  id: string;
  plaid_item_id: string;
  amount: number;
  iso_currency_code: string | null;
  name: string;
  merchant_name: string | null;
  category_primary: string | null;
  category_detailed: string | null;
  transaction_date: string;
  pending: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface PlaidItem {
  id: string;
  institution_id: string | null;
  institution_name: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  sync_frequency_hours: number;
}

export interface SyncResult {
  added: number;
  modified: number;
  removed: number;
  synced_at: string;
}
