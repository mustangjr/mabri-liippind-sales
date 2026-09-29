import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, PRESERVED_LIPPING_NAMES } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes

// Preserved Names list
app.get('/api/preserved-names', (_req: Request, res: Response) => {
  res.json({ names: PRESERVED_LIPPING_NAMES });
});

// Dashboard stats
app.get('/api/dashboard', (_req: Request, res: Response) => {
  try {
    const data = db.getDashboardMetrics();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch dashboard metrics' });
  }
});

// Lippings CRUD
app.get('/api/lippings', (_req: Request, res: Response) => {
  try {
    const lippings = db.getLippings();
    res.json(lippings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lippings/:id', (req: Request, res: Response) => {
  try {
    const lipping = db.getLippingById(req.params.id);
    if (!lipping) return res.status(404).json({ error: 'Lipping not found' });
    res.json(lipping);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lippings', (req: Request, res: Response) => {
  try {
    const { code, name, brand, measurement, opening_stock, minimum_stock, unit, notes, is_unrecorded } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Lipping code and name are required.' });
    }

    const created = db.addLipping({
      code: code.trim(),
      name: name.trim(),
      brand: (brand || 'Standard').trim(),
      supplier: (req.body.supplier || 'Zhonzhi-Nicewood').trim(),
      measurement: (measurement || '22mm x 1mm').trim(),
      opening_stock: Number(opening_stock) || 0,
      minimum_stock: Number(minimum_stock) || 20,
      unit: unit || 'm',
      notes: notes?.trim(),
      date_added: new Date().toISOString().split('T')[0],
      is_unrecorded: Boolean(is_unrecorded),
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/lippings/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateLipping(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/lippings/:id', (req: Request, res: Response) => {
  try {
    db.deleteLipping(req.params.id);
    res.json({ success: true, message: 'Lipping deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Sales
app.get('/api/sales', (_req: Request, res: Response) => {
  try {
    const sales = db.getSales();
    res.json(sales);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', (req: Request, res: Response) => {
  try {
    const { lipping_id, quantity, sale_date, customer, invoice_number, user_id, user_name, notes } = req.body;
    if (!lipping_id) return res.status(400).json({ error: 'Please select a lipping.' });
    if (!quantity || Number(quantity) <= 0) return res.status(400).json({ error: 'Valid quantity sold is required.' });

    const result = db.recordSale({
      lipping_id,
      quantity: Number(quantity),
      sale_date: sale_date || new Date().toISOString().split('T')[0],
      customer,
      invoice_number,
      user_id: user_id || 'usr-1',
      user_name: user_name || 'Staff',
      notes,
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/sales/correct', (req: Request, res: Response) => {
  try {
    const { sale_id, new_quantity, reason, user_id, user_name } = req.body;
    if (!sale_id) return res.status(400).json({ error: 'Sale ID is required.' });
    if (!reason) return res.status(400).json({ error: 'Reason for correction is required for audit logs.' });

    const result = db.correctSale({
      sale_id,
      new_quantity: new_quantity !== undefined && new_quantity !== '' ? Number(new_quantity) : undefined,
      reason,
      user_id: user_id || 'usr-1',
      user_name: user_name || 'Admin',
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stock Receipts (Stock Receiving)
app.get('/api/stock-receipts', (_req: Request, res: Response) => {
  try {
    const receipts = db.getStockReceipts();
    res.json(receipts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stock-receipts', (req: Request, res: Response) => {
  try {
    const { lipping_id, quantity, date, supplier, reference_number, user_id, user_name, notes } = req.body;
    if (!lipping_id) return res.status(400).json({ error: 'Please select a lipping.' });
    if (!quantity || Number(quantity) <= 0) return res.status(400).json({ error: 'Quantity received must be greater than 0.' });

    const result = db.receiveStock({
      lipping_id,
      quantity: Number(quantity),
      date: date || new Date().toISOString().split('T')[0],
      supplier: supplier || 'Mabri Supplier',
      reference_number,
      user_id: user_id || 'usr-1',
      user_name: user_name || 'Admin',
      notes,
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stock Adjustments
app.get('/api/stock-adjustments', (_req: Request, res: Response) => {
  try {
    const adjustments = db.getStockAdjustments();
    res.json(adjustments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stock-adjustments', (req: Request, res: Response) => {
  try {
    const { lipping_id, quantity, adjustment_type, reason, date, user_id, user_name } = req.body;
    if (!lipping_id) return res.status(400).json({ error: 'Please select a lipping.' });
    if (!quantity || Number(quantity) === 0) return res.status(400).json({ error: 'Quantity cannot be zero.' });
    if (!reason) return res.status(400).json({ error: 'Reason is required for audit trail.' });

    const result = db.adjustStock({
      lipping_id,
      quantity: Number(quantity),
      adjustment_type: adjustment_type || 'AUDIT_CORRECTION',
      reason,
      date: date || new Date().toISOString().split('T')[0],
      user_id: user_id || 'usr-1',
      user_name: user_name || 'Admin',
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Unified Stock Movement History
app.get('/api/stock-history', (req: Request, res: Response) => {
  try {
    const lippingId = req.query.lipping_id as string | undefined;
    const history = db.getStockHistory(lippingId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Weekly Sales Matrix (Mon - Sat)
app.get('/api/weekly-sales', (req: Request, res: Response) => {
  try {
    let weekStart = req.query.week_start as string;
    if (!weekStart) {
      // Find current Monday
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      weekStart = monday.toISOString().split('T')[0];
    }

    const data = db.getWeeklySalesData(weekStart);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/weekly-sales/batch-save', (req: Request, res: Response) => {
  try {
    const { week_start, entries, user_id, user_name } = req.body;
    if (!week_start || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Valid week_start and entries array are required.' });
    }

    const updated = db.saveWeeklySalesBatch({
      week_start,
      entries,
      user_id: user_id || 'usr-1',
      user_name: user_name || 'Staff',
    });

    res.json({
      success: true,
      message: 'Weekly sales sheet updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Daily Sales view for a given date
app.get('/api/daily-sales', (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const lippings = db.getLippings();
    const sales = db.getSales().filter((s) => s.sale_date === date && s.status !== 'CORRECTED');

    const items = lippings.map((lip) => {
      const soldToday = sales
        .filter((s) => s.lipping_id === lip.id)
        .reduce((sum, s) => sum + s.quantity, 0);

      return {
        id: lip.id,
        code: lip.code,
        name: lip.name,
        brand: lip.brand,
        opening_stock: lip.opening_stock,
        stock_received: lip.stock_received,
        total_available: lip.total_available,
        sold_on_date: Math.round(soldToday * 100) / 100,
        total_sold: lip.total_sold,
        balance: lip.current_balance,
        status: lip.status,
      };
    });

    const totalSoldOnDate = sales.reduce((sum, s) => sum + s.quantity, 0);

    res.json({
      date,
      total_sold_on_date: Math.round(totalSoldOnDate * 100) / 100,
      sales_count: sales.length,
      items,
      transactions: sales,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Users & Auth
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' });
  }
  const user = db.authenticate(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.get('/api/users', (_req: Request, res: Response) => {
  try {
    const users = db.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req: Request, res: Response) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const created = db.addUser({
      name,
      username,
      password,
      role: role === 'admin' ? 'admin' : 'staff',
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  try {
    db.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mabri Lippings Server running on port ${PORT}`);
  });
}

startServer();
