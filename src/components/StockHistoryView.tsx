import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Search,
  X,
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  ShieldAlert, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { StockMovement, Lipping, User } from '../types';
import { generateMovementReportPDF } from '../utils/pdfGenerator';
import { exportMovementsToExcel } from '../utils/excelGenerator';
import { useTheme } from '../context/ThemeContext';

interface StockHistoryViewProps {
  lippings: Lipping[];
  currentUser: User | null;
  selectedLippingIdFilter?: string;
  onClearLippingFilter?: () => void;
  onOpenCorrection: (saleId: string) => void;
  onOpenAdjustment: () => void;
}

export const StockHistoryView: React.FC<StockHistoryViewProps> = ({
  lippings,
  currentUser,
  selectedLippingIdFilter,
  onClearLippingFilter,
  onOpenCorrection,
  onOpenAdjustment,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const { isDarkGlass } = useTheme();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'STOCK IN' | 'SALE' | 'STOCK ADJUSTMENT'>('ALL');
  const [lippingFilter, setLippingFilter] = useState<string>(selectedLippingIdFilter || 'ALL');

  useEffect(() => {
    if (selectedLippingIdFilter) {
      setLippingFilter(selectedLippingIdFilter);
    }
  }, [selectedLippingIdFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = lippingFilter !== 'ALL' ? `/api/stock-history?lipping_id=${lippingFilter}` : '/api/stock-history';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setMovements(json);
      }
    } catch (err) {
      console.error('Error fetching stock history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [lippingFilter]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = m.lipping_code.toLowerCase().includes(q);
        const matchName = m.lipping_name.toLowerCase().includes(q);
        const matchRef = m.reference ? m.reference.toLowerCase().includes(q) : false;
        const matchNotes = m.reason_or_notes ? m.reason_or_notes.toLowerCase().includes(q) : false;
        if (!matchCode && !matchName && !matchRef && !matchNotes) return false;
      }
      return true;
    });
  }, [movements, typeFilter, searchQuery]);

  const handleDownloadPDF = () => {
    generateMovementReportPDF({
      generatedBy: currentUser?.name || 'Administrator',
      movements: filteredMovements,
    });
  };

  const handleExportExcel = () => {
    exportMovementsToExcel(filteredMovements);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
            Stock Movement Audit History
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            Complete chronological record of all inbound receipts, sales, and reversals
          </p>
        </div>

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

          {isAdmin && (
            <button
              onClick={onOpenAdjustment}
              className={`flex items-center space-x-1.5 px-3 py-2 font-bold rounded-lg text-xs transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Stock Adjustment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl space-y-3 transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input for Lipping Code or Name */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit logs by Lipping Code or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-9 py-2 rounded-lg text-sm transition focus:outline-none ${
                isDarkGlass
                  ? 'glass-input placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/30'
                  : 'bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Movement Type Filter */}
            <div className={`flex items-center space-x-1 p-1 rounded-lg text-xs font-medium ${
              isDarkGlass ? 'bg-slate-950/60 border border-white/10' : 'bg-slate-100'
            }`}>
              {(['ALL', 'STOCK IN', 'SALE', 'STOCK ADJUSTMENT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    typeFilter === t
                      ? isDarkGlass
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-white text-slate-900 font-bold shadow-xs'
                      : isDarkGlass
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Lipping Dropdown Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={lippingFilter}
                onChange={(e) => setLippingFilter(e.target.value)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none ${
                  isDarkGlass
                    ? 'glass-input cursor-pointer'
                    : 'border border-slate-200 text-slate-800 bg-white'
                }`}
              >
                <option value="ALL" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>All Lipping Profiles</option>
                {lippings.map((l) => (
                  <option key={l.id} value={l.id} className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>
                    {l.code} — {l.name}
                  </option>
                ))}
              </select>

              {lippingFilter !== 'ALL' && (
                <button
                  onClick={() => {
                    setLippingFilter('ALL');
                    if (onClearLippingFilter) onClearLippingFilter();
                  }}
                  className={`text-xs font-medium cursor-pointer ${
                    isDarkGlass ? 'text-amber-400 hover:text-amber-300' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  Clear filter
                </button>
              )}
            </div>

            <button
              onClick={fetchHistory}
              className={`p-2 rounded-lg transition cursor-pointer ${
                isDarkGlass
                  ? 'border border-white/10 hover:bg-white/[0.08] text-slate-300'
                  : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Refresh History"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Search & Filter Indicators */}
        {(searchQuery || lippingFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <div className={`flex items-center flex-wrap gap-2 pt-1 border-t text-xs ${
            isDarkGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Active filters:</span>
            {searchQuery && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${
                isDarkGlass
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                Keyword: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {typeFilter !== 'ALL' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${
                isDarkGlass
                  ? 'bg-white/[0.08] text-slate-200 border-white/10'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}>
                Type: {typeFilter}
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {lippingFilter !== 'ALL' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${
                isDarkGlass
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                Profile: {lippings.find((l) => l.id === lippingFilter)?.code || lippingFilter}
                <button
                  onClick={() => {
                    setLippingFilter('ALL');
                    if (onClearLippingFilter) onClearLippingFilter();
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setLippingFilter('ALL');
                if (onClearLippingFilter) onClearLippingFilter();
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold ml-auto cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Movement Timeline Table */}
      {loading ? (
        <div className={`flex items-center justify-center p-12 rounded-2xl ${
          isDarkGlass ? 'glass-panel' : 'bg-white border border-slate-200'
        }`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
          isDarkGlass
            ? 'glass-panel border-white/10'
            : 'bg-white border border-slate-200 shadow-xs'
        }`}>
          <div className={`p-3.5 border-b flex items-center justify-between ${
            isDarkGlass ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-xs font-semibold ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing {filteredMovements.length} of {movements.length} total logged stock transactions
            </span>
            {searchQuery && (
              <span className="text-xs text-amber-400 font-medium">
                Filtered by keyword "{searchQuery}"
              </span>
            )}
          </div>

          {filteredMovements.length === 0 ? (
            <div className={`p-12 text-center text-sm space-y-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              <p className={`font-semibold ${isDarkGlass ? 'text-white' : 'text-slate-700'}`}>No stock movements found matching your criteria.</p>
              <p className="text-xs opacity-75">Try adjusting your search query or filter settings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y text-left text-xs">
                <thead className={`font-semibold ${
                  isDarkGlass ? 'bg-slate-950/80 text-slate-300 divide-white/10' : 'bg-slate-900 text-white'
                }`}>
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Code & Name</th>
                    <th className="py-3 px-3 text-right">Stock Change</th>
                    <th className="py-3 px-3">Reference / Order</th>
                    <th className="py-3 px-3">Notes & Audit Reason</th>
                    <th className="py-3 px-3">Recorded By</th>
                    {isAdmin && <th className="py-3 px-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className={`divide-y font-sans ${isDarkGlass ? 'divide-white/5 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
                  {filteredMovements.map((m) => {
                    const isStockIn = m.type === 'STOCK IN';
                    const isSale = m.type === 'SALE';
                    const isAdjustment = m.type === 'STOCK ADJUSTMENT';

                    return (
                      <tr key={m.id} className={isDarkGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'}>
                        <td className={`py-2.5 px-3 whitespace-nowrap ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>
                          {m.date}
                        </td>

                        {/* Movement Badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                              isStockIn
                                ? isDarkGlass
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isSale
                                ? isDarkGlass
                                  ? 'bg-slate-800 text-slate-300 border border-white/10'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                                : isDarkGlass
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {isStockIn && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                            {isSale && <ArrowDownRight className="w-3 h-3 text-slate-400" />}
                            {isAdjustment && <SlidersHorizontal className="w-3 h-3 text-amber-400" />}
                            {m.type}
                          </span>
                        </td>

                        {/* Code & Name */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`font-mono font-bold mr-2 px-1.5 py-0.5 rounded text-xs ${
                            isDarkGlass ? 'bg-slate-800 text-amber-300 border border-white/10' : 'text-slate-900 bg-slate-100'
                          }`}>
                            {m.lipping_code}
                          </span>
                          <span className="font-medium">{m.lipping_name}</span>
                        </td>

                        {/* Quantity Change */}
                        <td className="py-2.5 px-3 text-right font-black text-sm whitespace-nowrap">
                          <span
                            className={
                              m.quantity_change > 0
                                ? isDarkGlass ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-emerald-700'
                                : m.quantity_change < 0
                                ? isDarkGlass ? 'text-white' : 'text-slate-900'
                                : 'text-slate-500'
                            }
                          >
                            {m.quantity_change > 0 ? `+${m.quantity_change} m` : `${m.quantity_change} m`}
                          </span>
                        </td>

                        {/* Reference */}
                        <td className={`py-2.5 px-3 text-xs whitespace-nowrap ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>
                          {m.reference || '-'}
                        </td>

                        {/* Notes / Reason */}
                        <td className={`py-2.5 px-3 text-xs max-w-sm truncate ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                          {m.reason_or_notes || '-'}
                        </td>

                        {/* User */}
                        <td className={`py-2.5 px-3 text-xs whitespace-nowrap ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>
                          {m.user_name}
                        </td>

                        {/* Admin Action for Sale reversal */}
                        {isAdmin && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {isSale && (
                              <button
                                onClick={() => onOpenCorrection(m.id)}
                                title="Correct sale entry"
                                className={`text-xs px-2 py-1 rounded font-medium transition cursor-pointer ${
                                  isDarkGlass
                                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                }`}
                              >
                                Correct
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
