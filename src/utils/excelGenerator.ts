import * as XLSX from 'xlsx';

export function exportToExcel(
  filename: string,
  sheets: { sheetName: string; data: Record<string, any>[] }[]
) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportInventoryToExcel(
  items: Array<{
    code: string;
    name: string;
    brand: string;
    measurement: string;
    opening_stock: number;
    stock_received?: number;
    total_available?: number;
    total_sold?: number;
    current_balance: number;
    minimum_stock: number;
    status: string;
    notes?: string;
  }>
) {
  const data = items.map((item, idx) => ({
    'No.': idx + 1,
    'Lipping Code': item.code,
    'Lipping Name': item.name,
    'Brand / Supplier': item.brand,
    'Size / Measurement': item.measurement,
    'Opening Stock (m)': item.opening_stock,
    'Stock Received (m)': item.stock_received || 0,
    'Total Available (m)': item.total_available || item.opening_stock,
    'Total Sold (m)': item.total_sold || 0,
    'Current Balance (m)': item.current_balance,
    'Min Stock Level (m)': item.minimum_stock,
    'Status': item.status,
    'Notes': item.notes || '',
  }));

  exportToExcel(`Mabri_Lipping_Inventory_${new Date().toISOString().split('T')[0]}`, [
    { sheetName: 'Lipping Inventory', data },
  ]);
}

export function exportCodedLippingsToExcel(
  items: Array<{
    item_number?: number;
    code: string;
    name: string;
    brand: string;
    opening_stock: number;
    stock_received?: number;
    total_available?: number;
    total_sold?: number;
    current_balance: number;
    status: string;
    is_unrecorded?: boolean;
    notes?: string;
  }>
) {
  const data = items.map((item, idx) => ({
    'Sheet Item No.': item.item_number || idx + 1,
    'Lipping Code': item.code,
    'Design / Name': item.name,
    'Brand / Supplier': item.brand,
    'Initial Opening Stock (m)': item.is_unrecorded ? 'Not Recorded' : item.opening_stock,
    'Stock Received (m)': item.stock_received || 0,
    'Total Sold (m)': item.total_sold || 0,
    'Current Balance (m)': item.current_balance,
    'Stock Status': item.status,
    'Notes / Remarks': item.notes || (item.is_unrecorded ? 'Initial stock not recorded in original sheet' : 'Original inventory item'),
  }));

  exportToExcel(`Mabri_42_Coded_Lippings_Sheet_${new Date().toISOString().split('T')[0]}`, [
    { sheetName: '42 Coded Lippings', data },
  ]);
}


export function exportWeeklySalesToExcel(
  weekStart: string,
  weekEnd: string,
  rows: Array<{
    code: string;
    name: string;
    brand: string;
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
  }>
) {
  const data = rows.map((r, idx) => ({
    'No.': idx + 1,
    'Code': r.code,
    'Lipping Name': r.name,
    'Brand': r.brand,
    'Opening Stock (m)': r.opening_stock,
    'Stock Received (m)': r.stock_received,
    'Monday (m)': r.monday,
    'Tuesday (m)': r.tuesday,
    'Wednesday (m)': r.wednesday,
    'Thursday (m)': r.thursday,
    'Friday (m)': r.friday,
    'Saturday (m)': r.saturday,
    'Total Sold (m)': r.total_sold,
    'Closing Balance (m)': r.closing_balance,
  }));

  exportToExcel(`Mabri_Weekly_Sales_${weekStart}_to_${weekEnd}`, [
    { sheetName: 'Weekly Sales', data },
  ]);
}

export function exportDailySalesToExcel(
  date: string,
  items: Array<{
    code: string;
    name: string;
    brand: string;
    opening_stock: number;
    stock_received?: number;
    sold_on_date: number;
    total_sold: number;
    balance: number;
    status: string;
  }>
) {
  const data = items.map((i, idx) => ({
    'No.': idx + 1,
    'Code': i.code,
    'Lipping Name': i.name,
    'Brand': i.brand,
    'Opening Stock (m)': i.opening_stock,
    'Sold On Date (m)': i.sold_on_date,
    'Total Cumulative Sold (m)': i.total_sold,
    'Current Balance (m)': i.balance,
    'Status': i.status,
  }));

  exportToExcel(`Mabri_Daily_Sales_${date}`, [
    { sheetName: 'Daily Sales', data },
  ]);
}

export function exportMovementsToExcel(
  movements: Array<{
    date: string;
    type: string;
    lipping_code: string;
    lipping_name: string;
    quantity_change: number;
    reference?: string;
    reason_or_notes?: string;
    user_name: string;
    created_at: string;
  }>
) {
  const data = movements.map((m, idx) => ({
    'No.': idx + 1,
    'Date': m.date,
    'Movement Type': m.type,
    'Lipping Code': m.lipping_code,
    'Lipping Name': m.lipping_name,
    'Quantity Change (m)': m.quantity_change,
    'Reference / Invoice': m.reference || '',
    'Reason / Notes': m.reason_or_notes || '',
    'Recorded By': m.user_name,
    'Timestamp': m.created_at,
  }));

  exportToExcel(`Mabri_Stock_Movements_${new Date().toISOString().split('T')[0]}`, [
    { sheetName: 'Stock Movements', data },
  ]);
}
