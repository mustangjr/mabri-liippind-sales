export interface Lipping {
  id: string;
  item_number?: number; // 1 to 42 from initial sheet
  code: string;
  name: string;
  brand: string;
  category?: 'NAMED' | 'CODED';
  supplier?: string;
  measurement: string;
  opening_stock: number;
  stock_received?: number;
  total_available?: number;
  total_sold?: number;
  adjustments?: number;
  current_balance: number;
  minimum_stock: number;
  unit: string;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  notes?: string;
  date_added: string;
  is_unrecorded?: boolean;
  created_at: string;
}

export interface StockReceipt {
  id: string;
  lipping_id: string;
  lipping_code: string;
  lipping_name: string;
  quantity: number;
  supplier: string;
  reference_number?: string;
  date: string;
  user_id: string;
  user_name: string;
  notes?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  lipping_id: string;
  lipping_code: string;
  lipping_name: string;
  quantity: number;
  sale_date: string;
  customer?: string;
  invoice_number?: string;
  user_id: string;
  user_name: string;
  notes?: string;
  status: 'COMPLETED' | 'CORRECTED';
  created_at: string;
}

export interface StockAdjustment {
  id: string;
  lipping_id: string;
  lipping_code: string;
  lipping_name: string;
  quantity: number;
  adjustment_type: 'REVERSAL' | 'AUDIT_CORRECTION' | 'DAMAGE' | 'OTHER';
  reason: string;
  related_sale_id?: string;
  date: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  type: 'STOCK IN' | 'SALE' | 'STOCK ADJUSTMENT';
  date: string;
  lipping_id: string;
  lipping_code: string;
  lipping_name: string;
  quantity_change: number;
  reference?: string;
  reason_or_notes?: string;
  user_name: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface DashboardStats {
  total_lippings: number;
  total_stock_metres: number;
  sold_today: number;
  sold_this_week: number;
  sold_this_month: number;
  total_stock_received: number;
  low_stock_count: number;
  out_of_stock_count: number;
  recent_sales: Sale[];
  low_stock_items: Lipping[];
}

export interface WeeklySalesRow {
  id: string;
  code: string;
  name: string;
  brand: string;
  category?: 'NAMED' | 'CODED';
  supplier?: string;
  opening_stock: number;
  stock_received: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  total_sold: number;
  closing_balance: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
}

export interface WeeklySalesResponse {
  days: { name: string; dateStr: string }[];
  week_start: string;
  week_end: string;
  rows: WeeklySalesRow[];
}

export interface DailySalesItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  opening_stock: number;
  stock_received: number;
  total_available: number;
  sold_on_date: number;
  total_sold: number;
  balance: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
}

export interface DailySalesResponse {
  date: string;
  total_sold_on_date: number;
  sales_count: number;
  items: DailySalesItem[];
  transactions: Sale[];
}
