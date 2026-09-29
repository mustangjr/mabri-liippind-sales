import React from 'react';
import { 
  Package, 
  Layers, 
  Tag,
  TrendingDown, 
  AlertTriangle, 
  XCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileText, 
  CheckCircle2, 
  CalendarDays,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { DashboardStats, User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  stats: DashboardStats | null;
  currentUser: User | null;
  onOpenRecordSale: () => void;
  onOpenReceiveStock: (lippingId?: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenCorrection: (saleId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  currentUser,
  onOpenRecordSale,
  onOpenReceiveStock,
  onNavigateTab,
  onOpenCorrection,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const { isDarkGlass } = useTheme();

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero for Store Clerks */}
      <div className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
        isDarkGlass
          ? 'glass-panel border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-sm text-white'
      }`}>
        {isDarkGlass && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        )}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-white/95 p-2 rounded-xl shadow-md border border-slate-200 flex-shrink-0 hidden sm:block">
              <img src="/mabri-logo.svg" alt="Mabri Logo" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                isDarkGlass
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zhonzhi-Nicewood Coded Stock System Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
                Mabri Lippings Inventory & Daily Sales
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                Sales automatically deduct metres from available inventory. Track daily sales from Monday to Saturday with real-time balance calculations.
              </p>
            </div>
          </div>

          {/* Large Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('weekly-sales')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm transition transform active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>WEEKLY SHEET</span>
            </button>

            <button
              onClick={onOpenRecordSale}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition transform active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-emerald-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
              }`}
            >
              <ArrowDownRight className="w-5 h-5" />
              <span>RECORD SALE</span>
            </button>

            <button
              onClick={() => onOpenReceiveStock()}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-blue-600/80 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>RECEIVE STOCK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (8 Core Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Lippings */}
        <div className={`p-4 rounded-xl transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Lippings
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600'}`}>
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              {stats.total_lippings}
            </span>
            <span className={`text-xs ml-1.5 font-medium ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>designs</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Catalogued profiles</p>
        </div>

        {/* Total Stock in Metres */}
        <div className={`p-4 rounded-xl transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white border-l-4 border-l-emerald-500'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Stock
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600'}`}>
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkGlass ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'text-emerald-700'}`}>
              {stats.total_stock_metres.toLocaleString()}
            </span>
            <span className={`text-xs font-bold ml-1 ${isDarkGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>M</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Available in store</p>
        </div>

        {/* Sold Today */}
        <div className={`p-4 rounded-xl border-l-4 border-l-amber-500 transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Sold Today
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600'}`}>
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkGlass ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.3)]' : 'text-slate-900'}`}>
              {stats.sold_today.toLocaleString()}
            </span>
            <span className={`text-xs font-bold ml-1 ${isDarkGlass ? 'text-amber-400' : 'text-amber-600'}`}>M</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Current daily sales</p>
        </div>

        {/* Low Stock Items */}
        <div className={`p-4 rounded-xl transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Low Stock
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${
              stats.low_stock_count > 0 
                ? isDarkGlass ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'text-amber-600'
                : isDarkGlass ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.low_stock_count}
            </span>
            <span className={`text-xs ml-1.5 font-medium ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>items</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>≤ 20 metres balance</p>
        </div>

        {/* Sold This Week */}
        <div className={`p-4 rounded-xl transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Sold This Week
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600'}`}>
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              {stats.sold_this_week.toLocaleString()}
            </span>
            <span className={`text-xs font-bold ml-1 ${isDarkGlass ? 'text-indigo-400' : 'text-indigo-600'}`}>M</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Mon — Sat sales</p>
        </div>

        {/* Sold This Month */}
        <div className={`p-4 rounded-xl transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Sold This Month
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              {stats.sold_this_month.toLocaleString()}
            </span>
            <span className={`text-xs font-bold ml-1 ${isDarkGlass ? 'text-purple-400' : 'text-purple-600'}`}>M</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Current calendar month</p>
        </div>

        {/* Total Received */}
        <div className={`p-4 rounded-xl transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Received
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700'}`}>
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              {stats.total_stock_received.toLocaleString()}
            </span>
            <span className={`text-xs font-bold ml-1 ${isDarkGlass ? 'text-cyan-400' : 'text-cyan-600'}`}>M</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Total inbound deliveries</p>
        </div>

        {/* Out of Stock */}
        <div className={`p-4 rounded-xl border-l-4 border-l-rose-500 transition-all duration-200 ${
          isDarkGlass
            ? 'glass-card text-white'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Out of Stock
            </span>
            <div className={`p-2 rounded-lg ${isDarkGlass ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-red-50 text-red-600'}`}>
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black ${
              stats.out_of_stock_count > 0 
                ? isDarkGlass ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'text-red-600'
                : isDarkGlass ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.out_of_stock_count}
            </span>
            <span className={`text-xs ml-1.5 font-medium ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>items</span>
          </div>
          <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Zero balance</p>
        </div>
      </div>

      {/* Coded Lippings Master Quick Access Card */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkGlass 
          ? 'glass-card border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/50 to-blue-500/10' 
          : 'bg-gradient-to-r from-amber-50 via-white to-blue-50 border-amber-200 shadow-xs'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl ${isDarkGlass ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-500 text-white'}`}>
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`font-bold text-base ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                Official 42 Coded Lippings Master Sheet
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isDarkGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
              }`}>
                42 Items • 32 Preserved Designs
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-2xl ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Browse the complete catalogued coded items (Codes 1.9-1 through 36.8-6) from the Mabri Limited stock inventory sheet, assign design names, and audit opening stock levels.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('coded-lippings')}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 shrink-0 cursor-pointer ${
            isDarkGlass
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
          }`}
        >
          <span>View Coded Lippings Sheet</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Low Stock Alert & Recent Sales Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low & Out of Stock Alerts */}
        <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
          isDarkGlass
            ? 'glass-panel border-white/10'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isDarkGlass ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className={`font-bold text-sm sm:text-base ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                Stock Replenishment Alerts ({stats.low_stock_items.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className={`text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                isDarkGlass ? 'text-amber-400 hover:text-amber-300' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <span>View All Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.low_stock_items.length === 0 ? (
            <div className={`p-8 text-center text-sm ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              All lipping stocks are well above minimum thresholds.
            </div>
          ) : (
            <div className={`divide-y max-h-[360px] overflow-y-auto ${
              isDarkGlass ? 'divide-white/5' : 'divide-slate-100'
            }`}>
              {stats.low_stock_items.map((item) => (
                <div key={item.id} className={`p-3.5 flex items-center justify-between transition ${
                  isDarkGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                }`}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                        isDarkGlass 
                          ? 'bg-slate-800/80 text-amber-300 border border-white/10' 
                          : 'text-slate-900 bg-slate-100'
                      }`}>
                        {item.code}
                      </span>
                      <span className={`text-sm font-semibold ${isDarkGlass ? 'text-slate-100' : 'text-slate-800'}`}>
                        {item.name}
                      </span>
                      <span className={`text-xs ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>({item.brand})</span>
                    </div>
                    <div className={`text-xs mt-1 flex items-center space-x-3 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Available: <strong className={isDarkGlass ? 'text-white' : 'text-slate-800'}>{item.current_balance} m</strong></span>
                      <span>Min: {item.minimum_stock} m</span>
                      {item.is_unrecorded && (
                        <span className={`px-1.5 py-0.2 rounded font-medium ${
                          isDarkGlass ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30' : 'text-amber-700 bg-amber-50'
                        }`}>
                          Opening Not Recorded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        item.status === 'OUT OF STOCK'
                          ? isDarkGlass
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-red-100 text-red-700 border border-red-200'
                          : isDarkGlass
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      onClick={() => onOpenReceiveStock(item.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        isDarkGlass
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      + Receive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Transactions */}
        <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
          isDarkGlass
            ? 'glass-panel border-white/10'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isDarkGlass ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`} />
              <h2 className={`font-bold text-sm sm:text-base ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                Recent Sales Transactions
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('daily-sales')}
              className={`text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                isDarkGlass ? 'text-amber-400 hover:text-amber-300' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <span>Daily Sales View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.recent_sales.length === 0 ? (
            <div className={`p-8 text-center text-sm ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              No sales recorded yet today. Click <strong>Record Sale</strong> to begin.
            </div>
          ) : (
            <div className={`divide-y max-h-[360px] overflow-y-auto ${
              isDarkGlass ? 'divide-white/5' : 'divide-slate-100'
            }`}>
              {stats.recent_sales.map((sale) => (
                <div key={sale.id} className={`p-3.5 flex items-center justify-between transition ${
                  isDarkGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                }`}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                        isDarkGlass ? 'bg-slate-800 text-amber-300 border border-white/10' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {sale.lipping_code}
                      </span>
                      <span className={`text-sm font-semibold ${isDarkGlass ? 'text-slate-100' : 'text-slate-900'}`}>
                        {sale.lipping_name}
                      </span>
                      {sale.invoice_number && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          isDarkGlass ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-500'
                        }`}>
                          Inv #{sale.invoice_number}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-1 flex items-center space-x-2 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Date: {sale.sale_date}</span>
                      {sale.customer && <span>• Customer: {sale.customer}</span>}
                      <span>• Staff: {sale.user_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-base font-black ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                      -{sale.quantity} m
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => onOpenCorrection(sale.id)}
                        title="Correct wrongly entered sale"
                        className={`text-xs p-1.5 rounded transition cursor-pointer ${
                          isDarkGlass ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
