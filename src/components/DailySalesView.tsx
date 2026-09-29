import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  FileSpreadsheet, 
  ArrowDownRight, 
  Clock, 
  User as UserIcon, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DailySalesResponse, User } from '../types';
import { generateDailySalesPDF } from '../utils/pdfGenerator';
import { exportDailySalesToExcel } from '../utils/excelGenerator';
import { useTheme } from '../context/ThemeContext';

interface DailySalesViewProps {
  currentUser: User | null;
  onOpenRecordSale: () => void;
  onOpenCorrection: (saleId: string) => void;
}

export const DailySalesView: React.FC<DailySalesViewProps> = ({
  currentUser,
  onOpenRecordSale,
  onOpenCorrection,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const { isDarkGlass } = useTheme();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [data, setData] = useState<DailySalesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailySales = async (date: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/daily-sales?date=${date}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching daily sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySales(selectedDate);
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    generateDailySalesPDF({
      date: data.date,
      generatedBy: currentUser?.name || 'Administrator',
      items: data.items,
      totalSoldToday: data.total_sold_on_date,
    });
  };

  const handleExportExcel = () => {
    if (!data) return;
    exportDailySalesToExcel(data.date, data.items);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
            Daily Sales Tracking
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            Monitor real-time daily lipping sales and remaining store balances
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
              isDarkGlass
                ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
              isDarkGlass
                ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onOpenRecordSale}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
              isDarkGlass
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* Date Selector Banner */}
      <div className={`p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevDay}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDarkGlass
                ? 'border border-white/10 hover:bg-white/[0.08] text-slate-300'
                : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 border ${
            isDarkGlass
              ? 'glass-input border-white/15 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-semibold bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDarkGlass
                ? 'border border-white/10 hover:bg-white/[0.08] text-slate-300'
                : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`text-xs px-2.5 py-2 rounded-lg font-medium transition cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Daily Summary Counters */}
        <div className="flex items-center space-x-6">
          <div>
            <span className={`text-xs uppercase font-semibold ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Metres Sold
            </span>
            <div className={`text-2xl font-black ${isDarkGlass ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.3)]' : 'text-slate-900'}`}>
              {data ? data.total_sold_on_date.toLocaleString() : 0}{' '}
              <span className={`text-sm font-bold ${isDarkGlass ? 'text-amber-400' : 'text-slate-600'}`}>m</span>
            </div>
          </div>
          <div className={`border-l pl-6 ${isDarkGlass ? 'border-white/10' : 'border-slate-200'}`}>
            <span className={`text-xs uppercase font-semibold ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Transactions
            </span>
            <div className={`text-2xl font-black ${isDarkGlass ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'text-emerald-700'}`}>
              {data ? data.sales_count : 0}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center p-12 rounded-2xl ${
          isDarkGlass ? 'glass-panel' : 'bg-white border border-slate-200'
        }`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Daily Sales Table */}
          <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
            isDarkGlass
              ? 'glass-panel border-white/10'
              : 'bg-white border border-slate-200 shadow-xs'
          }`}>
            <div className={`p-3.5 border-b flex items-center justify-between ${
              isDarkGlass ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <h2 className={`text-sm font-bold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                Daily Sales by Lipping Profile ({data?.items.filter((i) => i.sold_on_date > 0).length || 0} active items)
              </h2>
              <span className={`text-xs ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Opening Stock + Stock Received - Total Sold = Balance
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y text-left text-sm">
                <thead className={`font-semibold text-xs ${
                  isDarkGlass ? 'bg-slate-950/80 text-slate-300 divide-white/10' : 'bg-slate-900 text-white'
                }`}>
                  <tr>
                    <th className="py-3 px-3 text-center w-12">#</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Lipping Name</th>
                    <th className="py-3 px-3">Brand</th>
                    <th className="py-3 px-3 text-right">Opening Stock</th>
                    <th className="py-3 px-3 text-right">Received</th>
                    <th className="py-3 px-3 text-right">Total Available</th>
                    <th className="py-3 px-3 text-right font-bold text-amber-300">Sold on {selectedDate}</th>
                    <th className="py-3 px-3 text-right">Cumulative Sold</th>
                    <th className="py-3 px-3 text-right font-bold text-emerald-400">Current Balance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-sans ${isDarkGlass ? 'divide-white/5 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
                  {data?.items.map((item, idx) => {
                    const hasSalesToday = item.sold_on_date > 0;
                    return (
                      <tr
                        key={item.id}
                        className={`transition ${
                          hasSalesToday
                            ? isDarkGlass
                              ? 'bg-amber-500/10 hover:bg-amber-500/15'
                              : 'bg-amber-50/20 font-medium hover:bg-slate-50'
                            : isDarkGlass
                            ? 'hover:bg-white/[0.04]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className={`py-2.5 px-3 text-center font-mono text-xs ${isDarkGlass ? 'text-slate-500' : 'text-slate-400'}`}>
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            isDarkGlass ? 'bg-slate-800/90 text-amber-300 border border-white/10' : 'text-slate-900 bg-slate-100'
                          }`}>
                            {item.code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">{item.name}</td>
                        <td className={`py-2.5 px-3 whitespace-nowrap text-xs ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>{item.brand}</td>
                        <td className={`py-2.5 px-3 text-right whitespace-nowrap ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                          {item.opening_stock.toFixed(1)} m
                        </td>
                        <td className={`py-2.5 px-3 text-right whitespace-nowrap ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                          {(item.stock_received || 0) > 0 ? `+${item.stock_received?.toFixed(1)} m` : '-'}
                        </td>
                        <td className={`py-2.5 px-3 text-right whitespace-nowrap font-semibold ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                          {item.total_available.toFixed(1)} m
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold">
                          {hasSalesToday ? (
                            <span className={`px-2 py-0.5 rounded ${
                              isDarkGlass ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30' : 'text-amber-700 bg-amber-100/80'
                            }`}>
                              {item.sold_on_date.toFixed(1)} m
                            </span>
                          ) : (
                            <span className={isDarkGlass ? 'text-slate-600' : 'text-slate-300'}>-</span>
                          )}
                        </td>
                        <td className={`py-2.5 px-3 text-right whitespace-nowrap ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                          {item.total_sold.toFixed(1)} m
                        </td>
                        <td className={`py-2.5 px-3 text-right font-black whitespace-nowrap ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                          {item.balance.toFixed(1)} m
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              item.status === 'OUT OF STOCK'
                                ? isDarkGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-red-100 text-red-700'
                                : item.status === 'LOW STOCK'
                                ? isDarkGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
                                : isDarkGlass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Sales Transactions on this Date */}
          <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
            isDarkGlass
              ? 'glass-panel border-white/10'
              : 'bg-white border border-slate-200 shadow-xs'
          }`}>
            <div className={`p-3.5 border-b flex items-center justify-between ${
              isDarkGlass ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`} />
                <h2 className={`text-sm font-bold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                  Sales Audit Log for {selectedDate} ({data?.transactions.length || 0} entries)
                </h2>
              </div>
            </div>

            {(!data?.transactions || data.transactions.length === 0) ? (
              <div className={`p-8 text-center text-sm ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                No individual sale receipts recorded on this date.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y text-left text-sm">
                  <thead className={`font-semibold text-xs ${
                    isDarkGlass ? 'bg-slate-950/70 text-slate-300 divide-white/10' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Invoice / Ref</th>
                      <th className="py-2.5 px-3">Lipping Code & Name</th>
                      <th className="py-2.5 px-3 text-right">Quantity Sold</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Staff</th>
                      <th className="py-2.5 px-3">Notes</th>
                      {isAdmin && <th className="py-2.5 px-3 text-center">Admin Action</th>}
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-sans ${isDarkGlass ? 'divide-white/5 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
                    {data.transactions.map((sale) => (
                      <tr key={sale.id} className={isDarkGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'}>
                        <td className={`py-2.5 px-3 text-xs whitespace-nowrap ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className={`py-2.5 px-3 font-mono text-xs whitespace-nowrap ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                          {sale.invoice_number || 'Retail'}
                        </td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                          <span className={`font-mono font-bold mr-1.5 px-1.5 py-0.5 rounded text-xs ${
                            isDarkGlass ? 'bg-slate-800 text-amber-300 border border-white/10' : 'bg-slate-100 text-slate-900'
                          }`}>
                            {sale.lipping_code}
                          </span>
                          {sale.lipping_name}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-black whitespace-nowrap ${isDarkGlass ? 'text-white' : 'text-slate-950'}`}>
                          {sale.quantity} m
                        </td>
                        <td className={`py-2.5 px-3 text-xs whitespace-nowrap ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>
                          {sale.customer || '-'}
                        </td>
                        <td className={`py-2.5 px-3 text-xs whitespace-nowrap ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>
                          {sale.user_name}
                        </td>
                        <td className={`py-2.5 px-3 text-xs truncate max-w-xs ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sale.notes || '-'}
                        </td>
                        {isAdmin && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => onOpenCorrection(sale.id)}
                              className={`text-xs px-2 py-1 rounded font-medium transition cursor-pointer ${
                                isDarkGlass
                                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              Correct Sale
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
