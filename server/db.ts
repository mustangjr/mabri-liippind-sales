import fs from 'fs';
import path from 'path';

export interface Lipping {
  id: string;
  item_number?: number;
  code: string;
  name: string;
  brand: string;
  category?: 'NAMED' | 'CODED';
  supplier?: string;
  measurement: string;
  opening_stock: number;
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
  quantity: number; // Positive = add back, Negative = reduce
  adjustment_type: 'REVERSAL' | 'AUDIT_CORRECTION' | 'DAMAGE' | 'OTHER';
  reason: string;
  related_sale_id?: string;
  date: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // Plain for demo/internal shop use
  role: 'admin' | 'staff';
  created_at: string;
}

export interface StockMovement {
  id: string;
  type: 'STOCK IN' | 'SALE' | 'STOCK ADJUSTMENT';
  date: string;
  lipping_id: string;
  lipping_code: string;
  lipping_name: string;
  quantity_change: number; // e.g. +200, -20, +15
  balance_after?: number;
  reference?: string;
  reason_or_notes?: string;
  user_name: string;
  created_at: string;
}

export interface DatabaseSchema {
  lippings: Lipping[];
  stock_receipts: StockReceipt[];
  sales: Sale[];
  stock_adjustments: StockAdjustment[];
  users: User[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mabri_database.json');

// Named Lippings from Khadijah / Composite
export const KHADIJAH_NAMED_LIPPINGS = [
  'White',
  'White Ko',
  'American Walnuts',
  'Baverian',
  'Blackberry',
  'Black',
  'Coimbra',
  'Cappuccino',
  'Comply',
  'Cherry',
  'Dark Walnuts',
  'Dark Grey',
  'Etimo',
  'Esparanza Oak',
  'Gloss Congo',
  'Gloss Black',
  'Gloss Light Grey',
  'Gloss White',
  'Honeybee',
  'Harvard Cherry',
  'Light Grey',
  'Monument Oak',
  'Royal Teak',
  'Natural Oak',
  'Sapele',
  'Silverbrush',
  'Salzach Beach',
  'Petrol Blue',
  'Verzasca Oak Light',
  'Verzasca Oak Dark',
  'Double Salzach Beach',
  'Double Esparanza',
];

export const PRESERVED_LIPPING_NAMES = KHADIJAH_NAMED_LIPPINGS;

// Initial 42 Mabri Lippings supplied
const INITIAL_LIPPINGS_DATA = [
  { code: '1.9-1', stock: 58.5, brand: 'Standard', name: 'White' },
  { code: '2.9-2', stock: 8.2, brand: 'Standard', name: 'White Ko' },
  { code: '3.9-3', stock: 174, brand: 'Standard', name: 'American Walnuts' },
  { code: '4.9-4', stock: 70, brand: 'Standard', name: 'Baverian' },
  { code: '5.9-5', stock: 33, brand: 'Standard', name: 'Blackberry' },
  { code: '6.9-6', stock: 14, brand: 'Standard', name: 'Black' },
  { code: '7.9-7', stock: 84, brand: 'Standard', name: 'Coimbra' },
  { code: '8.9-8', stock: 224.8, brand: 'Standard', name: 'Cappuccino' },
  { code: '9.9-9', stock: 21, brand: 'Standard', name: 'Comply' },
  { code: '10.9-10', stock: 52.1, brand: 'Standard', name: 'Cherry' },
  { code: '11.9-11', stock: 151, brand: 'Standard', name: 'Dark Walnuts' },
  { code: '12.9-12', stock: 139, brand: 'Standard', name: 'Dark Grey' },
  { code: '13.9-13', stock: 27.8, brand: 'Standard', name: 'Etimo' },
  { code: '14.9-14', stock: 484.2, brand: 'Standard', name: 'Esparanza Oak' },
  { code: '15.9-15', stock: 48, brand: 'Standard', name: 'Gloss Congo' },
  { code: '16.9-16', stock: 0, brand: 'Standard', name: 'Gloss Black', unrecorded: true },
  { code: '17.9-18', stock: 0, brand: 'Standard', name: 'Gloss Light Grey', unrecorded: true },
  { code: '18.9-19', stock: 9, brand: 'Standard', name: 'Gloss White' },
  { code: '19.9-20', stock: 245, brand: 'Standard', name: 'Honeybee' },
  { code: '20.9-21', stock: 0, brand: 'Standard', name: 'Harvard Cherry', unrecorded: true },
  { code: '21.9-22', stock: 158, brand: 'Standard', name: 'Light Grey' },
  { code: '22.9-23', stock: 87.2, brand: 'Standard', name: 'Monument Oak' },
  { code: '23.9-24', stock: 0, brand: 'Standard', name: 'Royal Teak', unrecorded: true },
  { code: '24.9-1', stock: 82, brand: 'Double Lipping', name: 'Double Salzach Beach' },
  { code: '25.9-8', stock: 20, brand: 'Fairdeal', name: 'Natural Oak' },
  { code: '26.8-1', stock: 0, brand: 'Standard', name: 'Sapele', unrecorded: true },
  { code: '27.8-2', stock: 0, brand: 'Standard', name: 'Silverbrush', unrecorded: true },
  { code: '28.8-3', stock: 0, brand: 'Standard', name: 'Salzach Beach', unrecorded: true },
  { code: '29.8-4', stock: 0, brand: 'Standard', name: 'Petrol Blue', unrecorded: true },
  { code: '30.8.5', stock: 0, brand: 'Standard', name: 'Verzasca Oak Light', unrecorded: true },
  { code: '31.8-6', stock: 40, brand: 'Standard', name: 'Verzasca Oak Dark' },
  { code: '32.8-7', stock: 196, brand: 'Standard', name: 'Double Esparanza' },
  { code: '33.8-9', stock: 19, brand: 'Standard', name: 'Coimbra Extra' },
  { code: '33.8-10', stock: 200, brand: 'Standard', name: 'Light Grey 2' },
  { code: '33.8-11', stock: 37.5, brand: 'Standard', name: 'White Edge' },
  { code: '33.8-12', stock: 0, brand: 'Standard', name: 'Cappuccino 2', unrecorded: true },
  { code: '33.8-13', stock: 57.9, brand: 'Standard', name: 'Etimo Edge' },
  { code: '33.8-14', stock: 123.3, brand: 'Standard', name: 'Natural Teak' },
  { code: '33.8-15', stock: 0, brand: 'Standard', name: 'Honeybee Edge', unrecorded: true },
  { code: '34.8-12', stock: 23.6, brand: 'Fairdeal', name: 'Fairdeal Walnut' },
  { code: '35.8-12', stock: 13, brand: 'Comply', name: 'Comply Cherry' },
  { code: '36.8-6', stock: 34.9, brand: 'Comply', name: 'Comply Oak' },
];

function getInitialDb(): DatabaseSchema {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const lippings: Lipping[] = INITIAL_LIPPINGS_DATA.map((item, index) => {
    const openingStock = item.unrecorded ? 0 : item.stock;
    const minStock = 20; // Default minimum stock level in metres
    let status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
    if (openingStock <= 0) {
      status = 'OUT OF STOCK';
    } else if (openingStock <= minStock) {
      status = 'LOW STOCK';
    }

    return {
      id: `lip-${index + 1}`,
      item_number: index + 1,
      code: item.code,
      name: item.name,
      brand: item.brand,
      category: 'CODED',
      supplier: 'Zhonzhi-Nicewood',
      measurement: '22mm x 1mm',
      opening_stock: openingStock,
      minimum_stock: minStock,
      unit: 'm',
      status,
      notes: item.unrecorded ? 'Initial stock not recorded in original sheet' : 'Opening stock from Zhonzhi-Nicewood inventory sheet',
      date_added: dateStr,
      is_unrecorded: item.unrecorded || false,
      created_at: now,
    };
  });

  const users: User[] = [
    {
      id: 'usr-1',
      name: 'Mabri Administrator',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      created_at: now,
    },
    {
      id: 'usr-2',
      name: 'Store Staff',
      username: 'staff',
      password: 'staff123',
      role: 'staff',
      created_at: now,
    },
  ];

  // Also include the Named Lippings sourced from Khadijah / Composite
  KHADIJAH_NAMED_LIPPINGS.forEach((namedLipping, idx) => {
    lippings.push({
      id: `lip-named-${idx + 1}`,
      item_number: INITIAL_LIPPINGS_DATA.length + idx + 1,
      code: `NAMED-${idx + 1}`,
      name: namedLipping,
      brand: 'Composite',
      category: 'NAMED',
      supplier: 'Khadijah/Composite',
      measurement: '22mm x 1mm',
      opening_stock: 0,
      minimum_stock: 20,
      unit: 'm',
      status: 'OUT OF STOCK',
      notes: 'Named lipping sourced from Khadijah/Composite',
      date_added: dateStr,
      is_unrecorded: true,
      created_at: now,
    });
  });

  return {
    lippings,
    stock_receipts: [],
    sales: [],
    stock_adjustments: [],
    users,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        let modified = false;
        parsed.lippings.forEach((lip, idx) => {
          if (lip.item_number === undefined) {
            lip.item_number = idx + 1;
            modified = true;
          }
          if (lip.id.startsWith('lip-named-') || lip.supplier?.includes('Khadijah')) {
            lip.category = 'NAMED';
            lip.supplier = 'Khadijah/Composite';
            modified = true;
          } else {
            if (!lip.category) {
              lip.category = 'CODED';
              modified = true;
            }
            if (!lip.supplier) {
              lip.supplier = 'Zhonzhi-Nicewood';
              modified = true;
            }
          }
        });

        // Ensure all 32 Khadijah/Composite named lippings exist in the store
        const existingNamedNames = new Set(
          parsed.lippings
            .filter((l) => l.category === 'NAMED' || l.supplier === 'Khadijah/Composite')
            .map((l) => l.name.trim().toLowerCase())
        );

        KHADIJAH_NAMED_LIPPINGS.forEach((namedLipping, idx) => {
          if (!existingNamedNames.has(namedLipping.trim().toLowerCase())) {
            parsed.lippings.push({
              id: `lip-named-${idx + 1}`,
              item_number: 100 + idx + 1,
              code: `NAMED-${idx + 1}`,
              name: namedLipping,
              brand: 'Composite',
              category: 'NAMED',
              supplier: 'Khadijah/Composite',
              measurement: '22mm x 1mm',
              opening_stock: 0,
              minimum_stock: 20,
              unit: 'm',
              status: 'OUT OF STOCK',
              notes: 'Named lipping sourced from Khadijah/Composite',
              date_added: new Date().toISOString().split('T')[0],
              is_unrecorded: true,
              created_at: new Date().toISOString(),
            });
            modified = true;
          }
        });
        if (modified) {
          this.save(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh:', err);
    }

    const initial = getInitialDb();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database atomically:', err);
    }
  }

  /**
   * IMPORTANT STOCK CALCULATION:
   * CURRENT BALANCE = OPENING STOCK + TOTAL STOCK RECEIVED - TOTAL SALES +/− ADJUSTMENTS
   * Never allow the balance to become negative.
   */
  public calculateLippingBalance(lippingId: string): {
    opening_stock: number;
    total_received: number;
    total_sold: number;
    total_adjustments: number;
    current_balance: number;
    status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  } {
    const lipping = this.data.lippings.find((l) => l.id === lippingId);
    if (!lipping) {
      throw new Error(`Lipping not found with id ${lippingId}`);
    }

    const openingStock = Number(lipping.opening_stock) || 0;

    // Total Stock Received
    const totalReceived = this.data.stock_receipts
      .filter((r) => r.lipping_id === lippingId)
      .reduce((sum, r) => sum + Number(r.quantity), 0);

    // Total Sold (active completed sales only)
    const totalSold = this.data.sales
      .filter((s) => s.lipping_id === lippingId && s.status !== 'CORRECTED')
      .reduce((sum, s) => sum + Number(s.quantity), 0);

    // Adjustments (positive adds back, negative reduces)
    const totalAdjustments = this.data.stock_adjustments
      .filter((a) => a.lipping_id === lippingId)
      .reduce((sum, a) => sum + Number(a.quantity), 0);

    const calculatedBalance = Math.round((openingStock + totalReceived - totalSold + totalAdjustments) * 100) / 100;
    const currentBalance = Math.max(0, calculatedBalance);

    let status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
    if (currentBalance <= 0) {
      status = 'OUT OF STOCK';
    } else if (currentBalance <= (lipping.minimum_stock ?? 20)) {
      status = 'LOW STOCK';
    }

    return {
      opening_stock: openingStock,
      total_received: Math.round(totalReceived * 100) / 100,
      total_sold: Math.round(totalSold * 100) / 100,
      total_adjustments: Math.round(totalAdjustments * 100) / 100,
      current_balance: currentBalance,
      status,
    };
  }

  public getLippings() {
    return this.data.lippings.map((l) => {
      const stats = this.calculateLippingBalance(l.id);
      return {
        ...l,
        opening_stock: stats.opening_stock,
        stock_received: stats.total_received,
        total_available: Math.round((stats.opening_stock + stats.total_received) * 100) / 100,
        total_sold: stats.total_sold,
        adjustments: stats.total_adjustments,
        current_balance: stats.current_balance,
        status: stats.status,
      };
    });
  }

  public getLippingById(id: string) {
    const l = this.data.lippings.find((item) => item.id === id);
    if (!l) return null;
    const stats = this.calculateLippingBalance(l.id);
    return {
      ...l,
      opening_stock: stats.opening_stock,
      stock_received: stats.total_received,
      total_available: Math.round((stats.opening_stock + stats.total_received) * 100) / 100,
      total_sold: stats.total_sold,
      adjustments: stats.total_adjustments,
      current_balance: stats.current_balance,
      status: stats.status,
    };
  }

  public addLipping(item: Omit<Lipping, 'id' | 'created_at' | 'status'>): Lipping {
    const existing = this.data.lippings.find(
      (l) => l.code.trim().toLowerCase() === item.code.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`A lipping with code "${item.code}" already exists.`);
    }

    const id = `lip-${Date.now()}`;
    const minStock = Number(item.minimum_stock) || 20;
    const openingStock = Number(item.opening_stock) || 0;
    let status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
    if (openingStock <= 0) {
      status = 'OUT OF STOCK';
    } else if (openingStock <= minStock) {
      status = 'LOW STOCK';
    }

    const newLipping: Lipping = {
      ...item,
      id,
      opening_stock: openingStock,
      minimum_stock: minStock,
      unit: item.unit || 'm',
      status,
      created_at: new Date().toISOString(),
    };

    this.data.lippings.push(newLipping);
    this.save();
    return newLipping;
  }

  public updateLipping(id: string, updates: Partial<Lipping>): Lipping {
    const index = this.data.lippings.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error(`Lipping not found with id ${id}`);
    }

    if (updates.code) {
      const existing = this.data.lippings.find(
        (l) => l.id !== id && l.code.trim().toLowerCase() === updates.code!.trim().toLowerCase()
      );
      if (existing) {
        throw new Error(`Another lipping with code "${updates.code}" already exists.`);
      }
    }

    this.data.lippings[index] = {
      ...this.data.lippings[index],
      ...updates,
      // If opening stock was updated from unrecorded
      is_unrecorded: updates.is_unrecorded !== undefined ? updates.is_unrecorded : this.data.lippings[index].is_unrecorded,
    };

    this.save();
    return this.getLippingById(id)! as any;
  }

  public deleteLipping(id: string) {
    const index = this.data.lippings.findIndex((l) => l.id === id);
    if (index === -1) throw new Error(`Lipping not found with id ${id}`);
    
    // Check if sales or receipts exist
    const hasSales = this.data.sales.some((s) => s.lipping_id === id);
    const hasReceipts = this.data.stock_receipts.some((r) => r.lipping_id === id);
    if (hasSales || hasReceipts) {
      throw new Error(`Cannot delete lipping with active transaction history.`);
    }

    this.data.lippings.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * RECORD SALE:
   * 1. Check current available stock.
   * 2. Confirm that quantity sold <= available stock.
   * 3. Throw INSUFFICIENT STOCK if sold > available.
   * 4. Save transaction.
   * 5. Balance is updated automatically.
   */
  public recordSale(saleData: {
    lipping_id: string;
    quantity: number;
    sale_date: string;
    customer?: string;
    invoice_number?: string;
    user_id: string;
    user_name: string;
    notes?: string;
  }): { sale: Sale; new_balance: number } {
    const lipping = this.data.lippings.find((l) => l.id === saleData.lipping_id);
    if (!lipping) throw new Error('Selected lipping does not exist.');

    const qty = Number(saleData.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Quantity sold must be greater than 0 metres.');
    }

    const currentStats = this.calculateLippingBalance(lipping.id);
    if (qty > currentStats.current_balance) {
      throw new Error(
        `INSUFFICIENT STOCK: Available balance is ${currentStats.current_balance} m, but ${qty} m was requested.`
      );
    }

    const sale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lipping_id: lipping.id,
      lipping_code: lipping.code,
      lipping_name: lipping.name,
      quantity: qty,
      sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
      customer: saleData.customer?.trim() || undefined,
      invoice_number: saleData.invoice_number?.trim() || undefined,
      user_id: saleData.user_id,
      user_name: saleData.user_name || 'Staff',
      notes: saleData.notes?.trim() || undefined,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };

    this.data.sales.push(sale);
    this.save();

    const updatedStats = this.calculateLippingBalance(lipping.id);
    return { sale, new_balance: updatedStats.current_balance };
  }

  /**
   * STOCK RECEIVING:
   * Record new stock delivered to store.
   */
  public receiveStock(receiptData: {
    lipping_id: string;
    quantity: number;
    date: string;
    supplier: string;
    reference_number?: string;
    user_id: string;
    user_name: string;
    notes?: string;
  }): { receipt: StockReceipt; new_balance: number } {
    const lipping = this.data.lippings.find((l) => l.id === receiptData.lipping_id);
    if (!lipping) throw new Error('Selected lipping does not exist.');

    const qty = Number(receiptData.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Quantity received must be greater than 0 metres.');
    }

    const receipt: StockReceipt = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lipping_id: lipping.id,
      lipping_code: lipping.code,
      lipping_name: lipping.name,
      quantity: qty,
      supplier: receiptData.supplier || lipping.brand,
      reference_number: receiptData.reference_number?.trim() || undefined,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      user_id: receiptData.user_id,
      user_name: receiptData.user_name || 'Admin',
      notes: receiptData.notes?.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    this.data.stock_receipts.push(receipt);
    this.save();

    const updatedStats = this.calculateLippingBalance(lipping.id);
    return { receipt, new_balance: updatedStats.current_balance };
  }

  /**
   * SALES CORRECTION:
   * "Allow an administrator to correct a wrongly entered sale.
   * Do NOT simply overwrite the original transaction.
   * Instead create an adjustment/reversal record so the stock history remains accurate.
   * Example: Original sale: 20 m -> Correction: +20 m reversal -> Correct sale: 15 m."
   */
  public correctSale(correctionData: {
    sale_id: string;
    new_quantity?: number; // if provided, records new corrected sale
    reason: string;
    user_id: string;
    user_name: string;
  }): { reversal: StockAdjustment; new_sale?: Sale; new_balance: number } {
    const originalSale = this.data.sales.find((s) => s.id === correctionData.sale_id);
    if (!originalSale) throw new Error('Original sale record not found.');
    if (originalSale.status === 'CORRECTED') {
      throw new Error('This sale has already been corrected or reversed.');
    }

    const lipping = this.data.lippings.find((l) => l.id === originalSale.lipping_id);
    if (!lipping) throw new Error('Associated lipping not found.');

    // 1. Mark original sale as CORRECTED
    originalSale.status = 'CORRECTED';

    // 2. Create Reversal Adjustment (+ original quantity)
    const reversal: StockAdjustment = {
      id: `adj-${Date.now()}-rev`,
      lipping_id: originalSale.lipping_id,
      lipping_code: originalSale.lipping_code,
      lipping_name: originalSale.lipping_name,
      quantity: originalSale.quantity, // + qty added back
      adjustment_type: 'REVERSAL',
      reason: `Sale reversal: ${correctionData.reason} (Ref Sale #${originalSale.invoice_number || originalSale.id})`,
      related_sale_id: originalSale.id,
      date: new Date().toISOString().split('T')[0],
      user_id: correctionData.user_id,
      user_name: correctionData.user_name,
      created_at: new Date().toISOString(),
    };
    this.data.stock_adjustments.push(reversal);

    let newSaleRecord: Sale | undefined = undefined;

    // 3. If a new correct quantity was specified (> 0), record the new sale
    if (correctionData.new_quantity !== undefined && Number(correctionData.new_quantity) > 0) {
      const newQty = Number(correctionData.new_quantity);
      // Validate available stock with reversal already applied
      const balanceAfterReversal = this.calculateLippingBalance(lipping.id).current_balance;
      if (newQty > balanceAfterReversal) {
        // Rollback reversal
        originalSale.status = 'COMPLETED';
        this.data.stock_adjustments.pop();
        throw new Error(`INSUFFICIENT STOCK: Available stock after reversal is ${balanceAfterReversal} m, cannot sell ${newQty} m.`);
      }

      newSaleRecord = {
        id: `sale-${Date.now()}-corr`,
        lipping_id: originalSale.lipping_id,
        lipping_code: originalSale.lipping_code,
        lipping_name: originalSale.lipping_name,
        quantity: newQty,
        sale_date: originalSale.sale_date,
        customer: originalSale.customer,
        invoice_number: originalSale.invoice_number ? `${originalSale.invoice_number}-CORR` : undefined,
        user_id: correctionData.user_id,
        user_name: correctionData.user_name,
        notes: `Corrected entry for Sale ID ${originalSale.id}. Reason: ${correctionData.reason}`,
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
      };
      this.data.sales.push(newSaleRecord);
    }

    this.save();
    const updatedStats = this.calculateLippingBalance(lipping.id);
    return { reversal, new_sale: newSaleRecord, new_balance: updatedStats.current_balance };
  }

  /**
   * STOCK ADJUSTMENT:
   * Manual audit, damage, or recount.
   */
  public adjustStock(adjustmentData: {
    lipping_id: string;
    quantity: number; // positive or negative
    adjustment_type: 'AUDIT_CORRECTION' | 'DAMAGE' | 'OTHER';
    reason: string;
    user_id: string;
    user_name: string;
    date: string;
  }): { adjustment: StockAdjustment; new_balance: number } {
    const lipping = this.data.lippings.find((l) => l.id === adjustmentData.lipping_id);
    if (!lipping) throw new Error('Lipping not found.');

    const qty = Number(adjustmentData.quantity);
    if (isNaN(qty) || qty === 0) {
      throw new Error('Adjustment quantity cannot be 0.');
    }

    const currentStats = this.calculateLippingBalance(lipping.id);
    if (qty < 0 && Math.abs(qty) > currentStats.current_balance) {
      throw new Error(
        `Negative adjustment cannot exceed current available balance of ${currentStats.current_balance} m.`
      );
    }

    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lipping_id: lipping.id,
      lipping_code: lipping.code,
      lipping_name: lipping.name,
      quantity: qty,
      adjustment_type: adjustmentData.adjustment_type,
      reason: adjustmentData.reason,
      date: adjustmentData.date || new Date().toISOString().split('T')[0],
      user_id: adjustmentData.user_id,
      user_name: adjustmentData.user_name,
      created_at: new Date().toISOString(),
    };

    this.data.stock_adjustments.push(adjustment);
    this.save();

    const updatedStats = this.calculateLippingBalance(lipping.id);
    return { adjustment, new_balance: updatedStats.current_balance };
  }

  /**
   * Complete unified stock movement history
   */
  public getStockHistory(lippingId?: string): StockMovement[] {
    const movements: StockMovement[] = [];

    // Receipts: + quantity
    this.data.stock_receipts.forEach((r) => {
      if (!lippingId || r.lipping_id === lippingId) {
        movements.push({
          id: r.id,
          type: 'STOCK IN',
          date: r.date,
          lipping_id: r.lipping_id,
          lipping_code: r.lipping_code,
          lipping_name: r.lipping_name,
          quantity_change: r.quantity,
          reference: r.reference_number || `Supplier: ${r.supplier}`,
          reason_or_notes: r.notes || `Stock received from ${r.supplier}`,
          user_name: r.user_name,
          created_at: r.created_at,
        });
      }
    });

    // Sales: - quantity (only completed or record what happened)
    this.data.sales.forEach((s) => {
      if (!lippingId || s.lipping_id === lippingId) {
        movements.push({
          id: s.id,
          type: 'SALE',
          date: s.sale_date,
          lipping_id: s.lipping_id,
          lipping_code: s.lipping_code,
          lipping_name: s.lipping_name,
          quantity_change: -s.quantity,
          reference: s.invoice_number ? `Inv #${s.invoice_number}` : (s.customer ? `Customer: ${s.customer}` : 'Retail Sale'),
          reason_or_notes: s.status === 'CORRECTED' ? `[CORRECTED / REVERSED] ${s.notes || ''}` : (s.notes || ''),
          user_name: s.user_name,
          created_at: s.created_at,
        });
      }
    });

    // Adjustments: +/- quantity
    this.data.stock_adjustments.forEach((a) => {
      if (!lippingId || a.lipping_id === lippingId) {
        movements.push({
          id: a.id,
          type: 'STOCK ADJUSTMENT',
          date: a.date,
          lipping_id: a.lipping_id,
          lipping_code: a.lipping_code,
          lipping_name: a.lipping_name,
          quantity_change: a.quantity,
          reference: a.adjustment_type,
          reason_or_notes: a.reason,
          user_name: a.user_name,
          created_at: a.created_at,
        });
      }
    });

    // Sort descending by created_at / date
    movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return movements;
  }

  public getSales() {
    return [...this.data.sales].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getStockReceipts() {
    return [...this.data.stock_receipts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getStockAdjustments() {
    return [...this.data.stock_adjustments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getUsers() {
    return this.data.users.map(({ password, ...u }) => u);
  }

  public authenticate(username: string, pass: string): User | null {
    const user = this.data.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === pass
    );
    return user || null;
  }

  public addUser(userData: Omit<User, 'id' | 'created_at'>): Omit<User, 'password'> {
    const existing = this.data.users.find(
      (u) => u.username.toLowerCase() === userData.username.trim().toLowerCase()
    );
    if (existing) throw new Error('Username already exists.');

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  public updateUser(id: string, updates: Partial<User>): Omit<User, 'password'> {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found.');

    if (updates.username) {
      const existing = this.data.users.find(
        (u) => u.id !== id && u.username.toLowerCase() === updates.username!.trim().toLowerCase()
      );
      if (existing) throw new Error('Username already in use.');
    }

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
    };
    this.save();
    const { password, ...safeUser } = this.data.users[idx];
    return safeUser;
  }

  public deleteUser(id: string) {
    if (this.data.users.length <= 1) {
      throw new Error('Cannot delete the only existing user.');
    }
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found.');
    this.data.users.splice(idx, 1);
    this.save();
    return true;
  }

  /**
   * DASHBOARD METRICS:
   * Total different lipping types
   * Total metres currently in stock
   * Total metres sold today
   * Total metres sold this week (Mon-Sun or Mon-Sat)
   * Total metres sold this month
   * Total stock received
   * Low-stock items
   * Out-of-stock items
   */
  public getDashboardMetrics() {
    const lippings = this.getLippings();
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate start of current week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const mondayStr = monday.toISOString().split('T')[0];

    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let totalStockMetres = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    lippings.forEach((l) => {
      totalStockMetres += l.current_balance;
      if (l.status === 'LOW STOCK') lowStockCount++;
      if (l.status === 'OUT OF STOCK') outOfStockCount++;
    });

    const activeSales = this.data.sales.filter((s) => s.status !== 'CORRECTED');

    const soldToday = activeSales
      .filter((s) => s.sale_date === todayStr)
      .reduce((sum, s) => sum + s.quantity, 0);

    const soldThisWeek = activeSales
      .filter((s) => s.sale_date >= mondayStr && s.sale_date <= todayStr)
      .reduce((sum, s) => sum + s.quantity, 0);

    const soldThisMonth = activeSales
      .filter((s) => s.sale_date >= startOfMonth && s.sale_date <= todayStr)
      .reduce((sum, s) => sum + s.quantity, 0);

    const totalStockReceived = this.data.stock_receipts.reduce((sum, r) => sum + r.quantity, 0);

    // Recent sales
    const recentSales = [...activeSales]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Low stock items list
    const lowStockItems = lippings
      .filter((l) => l.status === 'LOW STOCK' || l.status === 'OUT OF STOCK')
      .slice(0, 10);

    return {
      total_lippings: lippings.length,
      total_stock_metres: Math.round(totalStockMetres * 100) / 100,
      sold_today: Math.round(soldToday * 100) / 100,
      sold_this_week: Math.round(soldThisWeek * 100) / 100,
      sold_this_month: Math.round(soldThisMonth * 100) / 100,
      total_stock_received: Math.round(totalStockReceived * 100) / 100,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      recent_sales: recentSales,
      low_stock_items: lowStockItems,
    };
  }

  /**
   * WEEKLY SALES TABLE (Mon-Sat):
   * Columns: Lipping code | Lipping name | Opening stock | Stock received |
   * Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Total sold | Closing balance
   */
  public getWeeklySalesData(weekStartDate: string) {
    // Generate dates for Monday through Saturday
    const startDate = new Date(weekStartDate);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days: { name: string; dateStr: string }[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({
        name: dayNames[i],
        dateStr: d.toISOString().split('T')[0],
      });
    }

    const lippings = this.getLippings();
    const activeSales = this.data.sales.filter((s) => s.status !== 'CORRECTED');

    const rows = lippings.map((l) => {
      // Find sales for each day
      const daySales: Record<string, number> = {};
      let totalSoldInWeek = 0;

      days.forEach((day) => {
        const salesOnDay = activeSales
          .filter((s) => s.lipping_id === l.id && s.sale_date === day.dateStr)
          .reduce((sum, s) => sum + s.quantity, 0);
        daySales[day.name] = Math.round(salesOnDay * 100) / 100;
        totalSoldInWeek += salesOnDay;
      });

      // Stock received during this week
      const receivedInWeek = this.data.stock_receipts
        .filter(
          (r) =>
            r.lipping_id === l.id &&
            r.date >= days[0].dateStr &&
            r.date <= days[5].dateStr
        )
        .reduce((sum, r) => sum + r.quantity, 0);

      // Calculations:
      // Total Sold = Monday + Tuesday + Wednesday + Thursday + Friday + Saturday
      const roundedTotalSold = Math.round(totalSoldInWeek * 100) / 100;
      // Balance = Opening Stock + Stock Received - Total Sold
      const closingBalance = l.current_balance;

      return {
        id: l.id,
        code: l.code,
        name: l.name,
        brand: l.brand,
        category: l.category || (l.id.startsWith('lip-named-') || l.supplier?.includes('Khadijah') ? 'NAMED' : 'CODED'),
        supplier: l.supplier || (l.category === 'NAMED' ? 'Khadijah/Composite' : 'Zhonzhi-Nicewood'),
        opening_stock: l.opening_stock,
        stock_received: Math.round(receivedInWeek * 100) / 100,
        monday: daySales['Monday'] || 0,
        tuesday: daySales['Tuesday'] || 0,
        wednesday: daySales['Wednesday'] || 0,
        thursday: daySales['Thursday'] || 0,
        friday: daySales['Friday'] || 0,
        saturday: daySales['Saturday'] || 0,
        total_sold: roundedTotalSold,
        closing_balance: closingBalance,
        status: l.status,
      };
    });

    return {
      days,
      week_start: days[0].dateStr,
      week_end: days[5].dateStr,
      rows,
    };
  }

  /**
   * BATCH SAVE DAILY SALES (Monday - Saturday):
   * Enables direct sheet/tabular input of daily sales per lipping.
   * Auto creates or updates sales transactions for each day of the week,
   * keeping all audit logs and stock balances completely accurate.
   */
  public saveWeeklySalesBatch(batchData: {
    week_start: string;
    user_id?: string;
    user_name?: string;
    entries: Array<{
      lipping_id: string;
      monday?: number;
      tuesday?: number;
      wednesday?: number;
      thursday?: number;
      friday?: number;
      saturday?: number;
    }>;
  }) {
    const startDate = new Date(batchData.week_start);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

    const days = dayNames.map((name, idx) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + idx);
      return {
        name,
        key: dayKeys[idx],
        dateStr: d.toISOString().split('T')[0],
      };
    });

    const userId = batchData.user_id || 'usr-1';
    const userName = batchData.user_name || 'Staff';

    for (const entry of batchData.entries) {
      const lipping = this.data.lippings.find((l) => l.id === entry.lipping_id);
      if (!lipping) continue;

      for (const day of days) {
        const val = entry[day.key];
        if (val === undefined) continue;
        const inputQty = Math.max(0, Number(val) || 0);

        // Find existing non-corrected sale for this lipping on this date
        const existingSaleIndex = this.data.sales.findIndex(
          (s) => s.lipping_id === entry.lipping_id && s.sale_date === day.dateStr && s.status !== 'CORRECTED'
        );

        if (existingSaleIndex !== -1) {
          const existingSale = this.data.sales[existingSaleIndex];
          if (inputQty > 0) {
            existingSale.quantity = inputQty;
            existingSale.user_id = userId;
            existingSale.user_name = userName;
            existingSale.notes = existingSale.notes || 'Weekly daily sales sheet entry';
          } else {
            // If user cleared quantity back to 0, remove the sale
            this.data.sales.splice(existingSaleIndex, 1);
          }
        } else if (inputQty > 0) {
          // Create new sale
          this.data.sales.push({
            id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            lipping_id: lipping.id,
            lipping_code: lipping.code,
            lipping_name: lipping.name,
            quantity: inputQty,
            sale_date: day.dateStr,
            customer: 'Daily Store Sales',
            user_id: userId,
            user_name: userName,
            notes: 'Weekly daily sales sheet entry',
            status: 'COMPLETED',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    this.save();
    return this.getWeeklySalesData(batchData.week_start);
  }
}

export const db = new Database();
