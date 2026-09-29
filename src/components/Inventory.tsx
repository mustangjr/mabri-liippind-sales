import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Tag,
  Filter, 
  Download, 
  FileSpreadsheet, 
  PlusCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Edit3, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Lipping, User } from '../types';
import { generateStockReportPDF } from '../utils/pdfGenerator';
import { exportInventoryToExcel } from '../utils/excelGenerator';
import { useTheme } from '../context/ThemeContext';

interface InventoryProps {
  lippings: Lipping[];
  currentUser: User | null;
  onOpenRecordSale: (lippingId?: string) => void;
  onOpenReceiveStock: (lippingId?: string) => void;
  onOpenAddLipping: () => void;
  onOpenEditLipping: (lipping: Lipping) => void;
  onFilterHistoryByLipping: (lippingId: string) => void;
  onNavigateToCodedLippings?: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  lippings,
  currentUser,
  onOpenRecordSale,
  onOpenReceiveStock,
  onOpenAddLipping,
  onOpenEditLipping,
  onFilterHistoryByLipping,
  onNavigateToCodedLippings,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const { isDarkGlass } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' | 'UNRECORDED'>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(lippings.map((l) => l.brand || 'Standard'))).filter(Boolean);
    return ['ALL', ...list];
  }, [lippings]);

  // Filtered and searched data
  const filteredLippings = useMemo(() => {
    return lippings.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'UNRECORDED') {
        matchesStatus = Boolean(item.is_unrecorded || item.opening_stock === 0);
      } else if (statusFilter !== 'ALL') {
        matchesStatus = item.status === statusFilter;
      }

      const matchesBrand = brandFilter === 'ALL' || item.brand === brandFilter;

      return matchesSearch && matchesStatus && matchesBrand;
    });
  }, [lippings, searchTerm, statusFilter, brandFilter]);

  const handleDownloadPDF = () => {
    generateStockReportPDF({
      generatedBy: currentUser?.name || 'Administrator',
      items: filteredLippings.map((l) => ({
        code: l.code,
        name: l.name,
        brand: l.brand,
        opening_stock: l.opening_stock,
        stock_received: l.stock_received || 0,
        total_available: l.total_available || l.opening_stock,
        total_sold: l.total_sold || 0,
        current_balance: l.current_balance,
        status: l.status,
      })),
    });
  };

  const handleExportExcel = () => {
    exportInventoryToExcel(filteredLippings);
  };

  return (
    <div className="space-y-4">
      {/* Page Header with Action Buttons */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white p-4 rounded-xl border border-slate-200 shadow-xs'
      }`}>
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
            Lipping Store Inventory
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing {filteredLippings.length} of {lippings.length} total lippings catalogued
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF */}
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

          {/* Export Excel */}
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

          {/* Jump to 42 Coded Lippings Sheet */}
          {onNavigateToCodedLippings && (
            <button
              onClick={onNavigateToCodedLippings}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>42 Coded Sheet</span>
            </button>
          )}

          {/* Add Lipping (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenAddLipping}
              className={`flex items-center space-x-1.5 px-3 py-2 font-bold rounded-lg text-xs transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Lipping</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className={`p-4 rounded-2xl space-y-3 transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by code, design name, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm transition focus:outline-none ${
                isDarkGlass
                  ? 'glass-input placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/30'
                  : 'border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Filter by Status */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`w-full py-2 px-3 rounded-lg text-sm focus:outline-none ${
                isDarkGlass
                  ? 'glass-input cursor-pointer'
                  : 'border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white'
              }`}
            >
              <option value="ALL" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>All Stock Statuses</option>
              <option value="IN STOCK" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>In Stock Only</option>
              <option value="LOW STOCK" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Low Stock (≤ 20m)</option>
              <option value="OUT OF STOCK" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Out of Stock (0m)</option>
              <option value="UNRECORDED" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Not Recorded / Initial 0m</option>
            </select>
          </div>

          {/* Filter by Brand */}
          <div>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className={`w-full py-2 px-3 rounded-lg text-sm focus:outline-none ${
                isDarkGlass
                  ? 'glass-input cursor-pointer'
                  : 'border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white'
              }`}
            >
              {brands.map((b) => (
                <option key={b} value={b} className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>
                  {b === 'ALL' ? 'All Brands & Suppliers' : `Brand: ${b}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel border-white/10'
          : 'bg-white rounded-xl border border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-left text-sm">
            <thead className={`font-semibold text-xs ${
              isDarkGlass ? 'bg-slate-950/80 text-slate-300 divide-white/10' : 'bg-slate-900 text-white'
            }`}>
              <tr>
                <th className="py-3 px-3 text-center w-12">No.</th>
                <th className="py-3 px-3">Lipping Code</th>
                <th className="py-3 px-3">Lipping Name</th>
                <th className="py-3 px-3">Brand / Supplier</th>
                <th className="py-3 px-3 text-right">Opening Stock</th>
                <th className="py-3 px-3 text-right">Stock Received</th>
                <th className="py-3 px-3 text-right">Total Available</th>
                <th className="py-3 px-3 text-right">Total Sold</th>
                <th className="py-3 px-3 text-right font-bold text-amber-300">Current Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${isDarkGlass ? 'divide-white/5 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
              {filteredLippings.length === 0 ? (
                <tr>
                  <td colSpan={11} className={`py-12 text-center text-sm ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                    No lippings found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredLippings.map((item, index) => {
                  const isOutOfStock = item.status === 'OUT OF STOCK';
                  const isLowStock = item.status === 'LOW STOCK';

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isDarkGlass
                          ? isOutOfStock
                            ? 'bg-rose-500/10 hover:bg-rose-500/15'
                            : isLowStock
                            ? 'bg-amber-500/10 hover:bg-amber-500/15'
                            : 'hover:bg-white/[0.04]'
                          : isOutOfStock
                          ? 'bg-red-50/30 hover:bg-slate-50'
                          : isLowStock
                          ? 'bg-amber-50/20 hover:bg-slate-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className={`py-3 px-3 text-center font-mono text-xs ${isDarkGlass ? 'text-slate-500' : 'text-slate-400'}`}>
                        {index + 1}
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded border text-xs ${
                          isDarkGlass
                            ? 'bg-slate-800/80 text-amber-300 border-white/10'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {item.code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className={`py-3 px-3 font-semibold whitespace-nowrap ${isDarkGlass ? 'text-slate-100' : 'text-slate-800'}`}>
                        {item.name}
                        {item.measurement && (
                          <span className={`block text-[11px] font-normal ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>
                            {item.measurement}
                          </span>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs border ${
                          isDarkGlass
                            ? 'bg-white/[0.04] text-slate-300 border-white/10'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {item.brand}
                        </span>
                      </td>

                      {/* Opening Stock */}
                      <td className="py-3 px-3 text-right font-medium whitespace-nowrap">
                        {item.is_unrecorded || (item.opening_stock === 0 && !item.stock_received) ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border font-medium ${
                            isDarkGlass
                              ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}>
                            <HelpCircle className="w-3 h-3" />
                            Not Recorded
                          </span>
                        ) : (
                          <span className={isDarkGlass ? 'text-slate-300' : 'text-slate-600'}>
                            {item.opening_stock.toFixed(1)} m
                          </span>
                        )}
                      </td>

                      {/* Stock Received */}
                      <td className="py-3 px-3 text-right font-medium whitespace-nowrap">
                        {(item.stock_received || 0) > 0 ? (
                          <span className={`font-semibold ${isDarkGlass ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-emerald-700'}`}>
                            +{(item.stock_received || 0).toFixed(1)} m
                          </span>
                        ) : (
                          <span className={isDarkGlass ? 'text-slate-500' : 'text-slate-400'}>-</span>
                        )}
                      </td>

                      {/* Total Available (Opening + Received) */}
                      <td className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                        {(item.total_available || item.opening_stock).toFixed(1)} m
                      </td>

                      {/* Total Sold */}
                      <td className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${isDarkGlass ? 'text-slate-200' : 'text-slate-900'}`}>
                        {(item.total_sold || 0) > 0 ? (
                          <span>{(item.total_sold || 0).toFixed(1)} m</span>
                        ) : (
                          <span className={isDarkGlass ? 'text-slate-500' : 'text-slate-400'}>0 m</span>
                        )}
                      </td>

                      {/* Current Balance */}
                      <td className="py-3 px-3 text-right font-black whitespace-nowrap text-base">
                        <span
                          className={
                            isOutOfStock
                              ? isDarkGlass ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-red-600'
                              : isLowStock
                              ? isDarkGlass ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'text-amber-600'
                              : isDarkGlass ? 'text-white font-bold' : 'text-slate-950 font-bold'
                          }
                        >
                          {item.current_balance.toFixed(1)} m
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            isOutOfStock
                              ? isDarkGlass
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-red-100 text-red-700 border border-red-200'
                              : isLowStock
                              ? isDarkGlass
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isDarkGlass
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isOutOfStock ? (
                            <XCircle className="w-3 h-3" />
                          ) : isLowStock ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Quick Sell Button */}
                          <button
                            onClick={() => onOpenRecordSale(item.id)}
                            disabled={isOutOfStock}
                            title="Record Sale"
                            className={`p-1.5 rounded-lg transition ${
                              isOutOfStock
                                ? 'opacity-30 cursor-not-allowed text-slate-500'
                                : isDarkGlass
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                            }`}
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>

                          {/* Receive Stock Button */}
                          <button
                            onClick={() => onOpenReceiveStock(item.id)}
                            title="Receive Inbound Stock"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDarkGlass
                                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Edit Lipping (Admin only) */}
                          {isAdmin && (
                            <button
                              onClick={() => onOpenEditLipping(item)}
                              title="Edit Lipping details & stock"
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isDarkGlass
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* History for this lipping */}
                          <button
                            onClick={() => onFilterHistoryByLipping(item.id)}
                            title="View Stock Movement History"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDarkGlass
                                ? 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                                : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
