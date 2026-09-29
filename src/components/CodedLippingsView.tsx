import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  ArrowDownRight,
  ArrowUpRight,
  Edit3,
  SlidersHorizontal,
  Bookmark,
  Layers,
  Sparkles,
  Info,
  Check,
  X
} from 'lucide-react';
import { Lipping, User } from '../types';
import { generateCodedLippingsReportPDF, generateZhonzhiWeeklyTrackingPDF } from '../utils/pdfGenerator';
import { exportCodedLippingsToExcel } from '../utils/excelGenerator';
import { useTheme } from '../context/ThemeContext';

interface CodedLippingsViewProps {
  lippings: Lipping[];
  currentUser: User | null;
  onOpenRecordSale: (lippingId?: string) => void;
  onOpenReceiveStock: (lippingId?: string) => void;
  onOpenEditLipping: (lipping: Lipping) => void;
  onRefreshData: () => Promise<void>;
}

// 32 authentic names provided in the Mabri sheet
const PRESERVED_MABRI_NAMES = [
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

export const CodedLippingsView: React.FC<CodedLippingsViewProps> = ({
  lippings,
  currentUser,
  onOpenRecordSale,
  onOpenReceiveStock,
  onOpenEditLipping,
  onRefreshData,
}) => {
  const { isDarkGlass } = useTheme();
  const isAdmin = currentUser?.role === 'admin';

  // Navigation sub-tab: 'sheet' | 'preserved-names'
  const [activeSubTab, setActiveSubTab] = useState<'sheet' | 'names'>('sheet');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'RECORDED' | 'UNRECORDED' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Assign Name Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLippingForAssign, setSelectedLippingForAssign] = useState<Lipping | null>(null);
  const [selectedNameForAssign, setSelectedNameForAssign] = useState<string>('');
  const [customNameInput, setCustomNameInput] = useState<string>('');
  const [savingAssign, setSavingAssign] = useState(false);

  // Set Opening Stock Modal state
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedLippingForStock, setSelectedLippingForStock] = useState<Lipping | null>(null);
  const [openingStockInput, setOpeningStockInput] = useState<string>('');
  const [savingStock, setSavingStock] = useState(false);

  // The 42 coded lippings sorted by item_number (or initial catalog order)
  const codedList = useMemo(() => {
    return [...lippings].sort((a, b) => (a.item_number || 0) - (b.item_number || 0));
  }, [lippings]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return codedList.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q);

      const matchesBrand = brandFilter === 'ALL' || item.brand === brandFilter;

      let matchesStock = true;
      if (stockStatusFilter === 'RECORDED') {
        matchesStock = !item.is_unrecorded && item.opening_stock > 0;
      } else if (stockStatusFilter === 'UNRECORDED') {
        matchesStock = Boolean(item.is_unrecorded || item.opening_stock === 0);
      } else if (stockStatusFilter === 'IN_STOCK') {
        matchesStock = item.status === 'IN STOCK';
      } else if (stockStatusFilter === 'LOW_STOCK') {
        matchesStock = item.status === 'LOW STOCK';
      } else if (stockStatusFilter === 'OUT_OF_STOCK') {
        matchesStock = item.status === 'OUT OF STOCK';
      }

      return matchesSearch && matchesBrand && matchesStock;
    });
  }, [codedList, searchTerm, brandFilter, stockStatusFilter]);

  // Statistics
  const totalCoded = codedList.length;
  const recordedCount = codedList.filter(l => !l.is_unrecorded && l.opening_stock > 0).length;
  const unrecordedCount = codedList.filter(l => l.is_unrecorded || l.opening_stock === 0).length;
  const totalOpeningMetres = codedList.reduce((acc, cur) => acc + (cur.opening_stock || 0), 0);
  const totalCurrentBalance = codedList.reduce((acc, cur) => acc + (cur.current_balance || 0), 0);

  // Map which preserved name is assigned to which lipping
  const nameAssignmentMap = useMemo(() => {
    const map = new Map<string, Lipping[]>();
    PRESERVED_MABRI_NAMES.forEach(name => map.set(name, []));

    codedList.forEach(lip => {
      if (map.has(lip.name)) {
        map.get(lip.name)?.push(lip);
      }
    });
    return map;
  }, [codedList]);

  // Handle assign name submit
  const handleAssignNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLippingForAssign) return;

    const finalName = customNameInput.trim() || selectedNameForAssign;
    if (!finalName) return;

    setSavingAssign(true);
    try {
      const res = await fetch(`/api/lippings/${selectedLippingForAssign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedLippingForAssign,
          name: finalName,
        }),
      });

      if (res.ok) {
        await onRefreshData();
        setAssignModalOpen(false);
        setSelectedLippingForAssign(null);
        setSelectedNameForAssign('');
        setCustomNameInput('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update lipping name');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while assigning name');
    } finally {
      setSavingAssign(false);
    }
  };

  // Handle set opening stock submit
  const handleSetStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLippingForStock) return;

    const stockVal = parseFloat(openingStockInput);
    if (isNaN(stockVal) || stockVal < 0) {
      alert('Please enter a valid stock quantity in metres');
      return;
    }

    setSavingStock(true);
    try {
      const res = await fetch(`/api/lippings/${selectedLippingForStock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedLippingForStock,
          opening_stock: stockVal,
          is_unrecorded: false,
          notes: `Opening stock verified: ${stockVal} m`,
        }),
      });

      if (res.ok) {
        await onRefreshData();
        setStockModalOpen(false);
        setSelectedLippingForStock(null);
        setOpeningStockInput('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update opening stock');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while setting stock');
    } finally {
      setSavingStock(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = () => {
    generateCodedLippingsReportPDF({
      generatedBy: currentUser?.name || 'Administrator',
      items: filteredItems.map(l => ({
        item_number: l.item_number,
        code: l.code,
        name: l.name,
        brand: l.brand,
        opening_stock: l.opening_stock,
        stock_received: l.stock_received || 0,
        total_available: l.total_available || l.opening_stock,
        total_sold: l.total_sold || 0,
        current_balance: l.current_balance,
        status: l.status,
        is_unrecorded: l.is_unrecorded,
      })),
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    exportCodedLippingsToExcel(filteredItems);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className={`p-6 rounded-2xl transition-all duration-200 relative overflow-hidden ${
        isDarkGlass
          ? 'glass-panel text-white border border-white/10'
          : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isDarkGlass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Zhonzhi-Nicewood Inventory [Nzonzi Nice]
              </span>
              <span className="text-xs text-slate-400">• Official Coded Master List</span>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight mt-1 font-heading ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              List of Coded Lippings
            </h1>
            <p className={`text-sm mt-1 max-w-2xl ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Coded lippings catalogued directly from Mabri Limited's Zhonzhi-Nicewood inventory sheet (Codes 1.9-1 to 33.8-9), 
              complete with opening stock, brand classification, real-time balances, and Monday-to-Saturday daily sales tracking.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => generateZhonzhiWeeklyTrackingPDF({
                rows: lippings.map((l) => ({
                  code: l.code,
                  name: l.name,
                  opening_stock: l.opening_stock,
                  total_sold: l.total_sold || 0,
                  closing_balance: l.current_balance,
                })),
                isBlankTemplate: false,
              })}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
              title="Download Zhonzhi-Nicewood Weekly Daily Sales PDF"
            >
              <Download className="w-4 h-4" />
              <span>Weekly Daily Sales PDF</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>Master Sheet PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Export to Excel</span>
            </button>
          </div>
        </div>

        {/* Highlighted Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-700/20">
          <div className={`p-3 rounded-xl ${isDarkGlass ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Coded Items</span>
            <span className={`text-xl font-bold mt-0.5 block ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              {totalCoded} Items
            </span>
            <span className="text-[10px] text-slate-400">Codes #1 to #42</span>
          </div>

          <div className={`p-3 rounded-xl ${isDarkGlass ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider block">Recorded Stock</span>
            <span className={`text-xl font-bold mt-0.5 block ${isDarkGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
              {recordedCount} Items
            </span>
            <span className="text-[10px] text-slate-400">With verified stock</span>
          </div>

          <div className={`p-3 rounded-xl ${isDarkGlass ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider block">Unrecorded Stock</span>
            <span className={`text-xl font-bold mt-0.5 block ${isDarkGlass ? 'text-amber-300' : 'text-amber-700'}`}>
              {unrecordedCount} Items
            </span>
            <span className="text-[10px] text-slate-400">Blank in initial sheet</span>
          </div>

          <div className={`p-3 rounded-xl ${isDarkGlass ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
            <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider block">Initial Total Stock</span>
            <span className={`text-xl font-bold mt-0.5 block ${isDarkGlass ? 'text-blue-300' : 'text-blue-700'}`}>
              {totalOpeningMetres.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
            </span>
            <span className="text-[10px] text-slate-400">Opening metres</span>
          </div>

          <div className={`p-3 rounded-xl ${isDarkGlass ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
            <span className="text-[11px] font-medium text-purple-400 uppercase tracking-wider block">Preserved Designs</span>
            <span className={`text-xl font-bold mt-0.5 block ${isDarkGlass ? 'text-purple-300' : 'text-purple-700'}`}>
              32 Designs
            </span>
            <span className="text-[10px] text-slate-400">Mabri naming list</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: 42 Coded Table vs Preserved Names List */}
      <div className="flex border-b border-slate-700/30 space-x-2">
        <button
          onClick={() => setActiveSubTab('sheet')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition cursor-pointer ${
            activeSubTab === 'sheet'
              ? 'border-amber-500 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>42 Coded Lippings Master Table</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkGlass ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
            {codedList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('names')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition cursor-pointer ${
            activeSubTab === 'names'
              ? 'border-purple-500 text-purple-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Mabri Preserved Design Names</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkGlass ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
            {PRESERVED_MABRI_NAMES.length}
          </span>
        </button>
      </div>

      {/* TAB 1: 42 CODED LIPPINGS TABLE */}
      {activeSubTab === 'sheet' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isDarkGlass ? 'glass-card border border-white/10' : 'bg-white border border-slate-200 shadow-xs'
          }`}>
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Code (e.g. 1.9-1, 14.9-14, 36.8-6), Design Name, or Brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition ${
                  isDarkGlass
                    ? 'bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:border-amber-500'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-amber-500'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Brand Filter */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-400 font-medium">Brand:</span>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer ${
                    isDarkGlass
                      ? 'bg-slate-900 border border-white/10 text-slate-200'
                      : 'bg-slate-100 border border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="ALL">All Brands (42)</option>
                  <option value="Standard">Standard (37)</option>
                  <option value="Double Lipping">Double Lipping (1)</option>
                  <option value="Fairdeal">Fairdeal (2)</option>
                  <option value="Comply">Comply (2)</option>
                </select>
              </div>

              {/* Stock Status Filter */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-400 font-medium">Stock:</span>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer ${
                    isDarkGlass
                      ? 'bg-slate-900 border border-white/10 text-slate-200'
                      : 'bg-slate-100 border border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="ALL">All Status</option>
                  <option value="RECORDED">Recorded Opening Stock ({recordedCount})</option>
                  <option value="UNRECORDED">Not Recorded ({unrecordedCount})</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className={`rounded-xl overflow-hidden border ${
            isDarkGlass ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase font-bold tracking-wider ${
                    isDarkGlass
                      ? 'bg-slate-900/80 border-white/10 text-slate-300'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600'
                  }`}>
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">Lipping Code</th>
                    <th className="py-3 px-3">Design / Name</th>
                    <th className="py-3 px-3">Brand / Supplier</th>
                    <th className="py-3 px-3 text-right">Opening Stock</th>
                    <th className="py-3 px-3 text-right">Received</th>
                    <th className="py-3 px-3 text-right">Sold</th>
                    <th className="py-3 px-3 text-right">Balance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No coded lippings found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const itemNo = item.item_number || idx + 1;
                      const isUnrecorded = Boolean(item.is_unrecorded || item.opening_stock === 0);

                      return (
                        <tr
                          key={item.id}
                          className={`transition hover:bg-white/[0.03] ${
                            isUnrecorded && isDarkGlass ? 'bg-amber-500/[0.02]' : ''
                          }`}
                        >
                          {/* Item Number */}
                          <td className="py-3 px-3 text-center font-mono text-xs text-slate-400">
                            #{itemNo}
                          </td>

                          {/* Code */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs tracking-wide ${
                                isDarkGlass
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}>
                                {item.code}
                              </span>
                            </div>
                          </td>

                          {/* Design / Name */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                                {item.name || 'Unassigned'}
                              </span>
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    setSelectedLippingForAssign(item);
                                    setSelectedNameForAssign(item.name);
                                    setCustomNameInput('');
                                    setAssignModalOpen(true);
                                  }}
                                  title="Assign or edit design name"
                                  className={`p-1 rounded transition hover:scale-110 cursor-pointer ${
                                    isDarkGlass ? 'text-slate-400 hover:text-amber-400' : 'text-slate-400 hover:text-amber-600'
                                  }`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Brand */}
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              item.brand === 'Double Lipping'
                                ? isDarkGlass ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-800'
                                : item.brand === 'Fairdeal'
                                ? isDarkGlass ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
                                : item.brand === 'Comply'
                                ? isDarkGlass ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
                                : isDarkGlass ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.brand || 'Standard'}
                            </span>
                          </td>

                          {/* Opening Stock */}
                          <td className="py-3 px-3 text-right">
                            {isUnrecorded ? (
                              <div className="flex items-center justify-end space-x-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                                  isDarkGlass ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  Not Recorded
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setSelectedLippingForStock(item);
                                      setOpeningStockInput('');
                                      setStockModalOpen(true);
                                    }}
                                    title="Enter opening stock"
                                    className="p-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                                  >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono font-medium">
                                {item.opening_stock.toFixed(1)} m
                              </span>
                            )}
                          </td>

                          {/* Received */}
                          <td className="py-3 px-3 text-right font-mono text-emerald-400 text-xs">
                            {item.stock_received ? `+${item.stock_received.toFixed(1)} m` : '0.0 m'}
                          </td>

                          {/* Sold */}
                          <td className="py-3 px-3 text-right font-mono text-rose-400 text-xs">
                            {item.total_sold ? `-${item.total_sold.toFixed(1)} m` : '0.0 m'}
                          </td>

                          {/* Current Balance */}
                          <td className="py-3 px-3 text-right">
                            <span className={`font-mono font-bold ${
                              (item.current_balance || 0) <= 0
                                ? 'text-rose-400'
                                : (item.current_balance || 0) <= (item.minimum_stock || 20)
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}>
                              {(item.current_balance || 0).toFixed(1)} m
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.status === 'IN STOCK'
                                ? isDarkGlass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
                                : item.status === 'LOW STOCK'
                                ? isDarkGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
                                : isDarkGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-100 text-rose-800'
                            }`}>
                              <span>{item.status}</span>
                            </span>
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Record Sale button */}
                              <button
                                onClick={() => onOpenRecordSale(item.id)}
                                title="Record Sale for this item"
                                className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition active:scale-95 cursor-pointer ${
                                  isDarkGlass
                                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                <ArrowDownRight className="w-3 h-3" />
                                <span>Sale</span>
                              </button>

                              {/* Receive Stock button */}
                              <button
                                onClick={() => onOpenReceiveStock(item.id)}
                                title="Receive new stock for this item"
                                className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition active:scale-95 cursor-pointer ${
                                  isDarkGlass
                                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Stock In</span>
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
      )}

      {/* TAB 2: MABRI PRESERVED DESIGN NAMES */}
      {activeSubTab === 'names' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${isDarkGlass ? 'glass-card border border-white/10' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-base font-bold flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-purple-400" />
              <span>Preserved Mabri Design Naming List (32 Designs)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              These 32 names were supplied in the Mabri sheet naming section. You can see which lipping code is assigned to each name, 
              or reassign any name to any of the 42 lipping codes with 1 click.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PRESERVED_MABRI_NAMES.map((designName, index) => {
              const assignedLippings = nameAssignmentMap.get(designName) || [];
              const isAssigned = assignedLippings.length > 0;

              return (
                <div
                  key={designName}
                  className={`p-4 rounded-xl border transition-all ${
                    isDarkGlass
                      ? 'glass-card border-white/10 hover:border-purple-500/40'
                      : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">Design #{index + 1}</span>
                      <h3 className={`font-bold text-sm mt-0.5 ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                        {designName}
                      </h3>
                    </div>
                    {isAssigned ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/20 text-slate-400">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* Assigned Codes */}
                  <div className="mt-3 pt-2 border-t border-slate-700/20">
                    {isAssigned ? (
                      <div className="space-y-1">
                        {assignedLippings.map((lip) => (
                          <div key={lip.id} className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-amber-400">
                              Code {lip.code}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              {lip.current_balance} m in stock
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No code mapped yet</p>
                    )}
                  </div>

                  {/* Quick Assign Button */}
                  {isAdmin && (
                    <div className="mt-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedNameForAssign(designName);
                          setCustomNameInput('');
                          // default to first unassigned or first item
                          setSelectedLippingForAssign(codedList[0]);
                          setAssignModalOpen(true);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition cursor-pointer ${
                          isDarkGlass
                            ? 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Assign to a Code</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN / CHANGE DESIGN NAME */}
      {assignModalOpen && selectedLippingForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-2xl p-6 relative border shadow-2xl ${
            isDarkGlass ? 'glass-card border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Assign Design Name to Code</h3>
                <p className="text-xs text-slate-400">
                  Target Lipping Code: <strong className="text-amber-400 font-mono text-sm">{selectedLippingForAssign.code}</strong> (#{selectedLippingForAssign.item_number})
                </p>
              </div>
            </div>

            <form onSubmit={handleAssignNameSubmit} className="mt-5 space-y-4">
              {/* Select target lipping code if opened from the names list */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Target Lipping Code
                </label>
                <select
                  value={selectedLippingForAssign.id}
                  onChange={(e) => {
                    const found = codedList.find(l => l.id === e.target.value);
                    if (found) setSelectedLippingForAssign(found);
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg outline-none font-mono ${
                    isDarkGlass ? 'bg-slate-900 border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  {codedList.map((lip) => (
                    <option key={lip.id} value={lip.id}>
                      #{lip.item_number} • Code {lip.code} (Current: {lip.name || 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 32 Preserved Mabri Names Quick Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select from 32 Preserved Mabri Names:
                </label>
                <div className="max-h-48 overflow-y-auto p-2 rounded-lg border border-slate-700/40 grid grid-cols-2 gap-1.5 bg-black/20">
                  {PRESERVED_MABRI_NAMES.map((name) => {
                    const isSelected = selectedNameForAssign === name && !customNameInput;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setSelectedNameForAssign(name);
                          setCustomNameInput('');
                        }}
                        className={`text-left text-xs px-2.5 py-1.5 rounded transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow'
                            : 'bg-white/5 hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Or enter custom name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Or Custom Design Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sapele Mahogany, Double Teak..."
                  value={customNameInput}
                  onChange={(e) => {
                    setCustomNameInput(e.target.value);
                    if (e.target.value) setSelectedNameForAssign('');
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg outline-none ${
                    isDarkGlass ? 'bg-slate-900 border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-700/40 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssign || (!selectedNameForAssign && !customNameInput.trim())}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingAssign ? 'Saving...' : 'Save Design Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SET OPENING STOCK FOR UNRECORDED ITEMS */}
      {stockModalOpen && selectedLippingForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-2xl p-6 relative border shadow-2xl ${
            isDarkGlass ? 'glass-card border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setStockModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Enter Verified Opening Stock</h3>
                <p className="text-xs text-slate-400">
                  Code: <strong className="text-amber-400 font-mono text-sm">{selectedLippingForStock.code}</strong> — {selectedLippingForStock.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSetStockSubmit} className="mt-5 space-y-4">
              <div className={`p-3 rounded-xl text-xs space-y-1 ${
                isDarkGlass ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <p className="font-semibold">Original Inventory Note:</p>
                <p>This item had a blank quantity in the initial sheet. Enter the physical stock count in metres.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Opening Stock Quantity (Metres)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    autoFocus
                    placeholder="e.g. 50.0"
                    value={openingStockInput}
                    onChange={(e) => setOpeningStockInput(e.target.value)}
                    className={`w-full px-3 py-2 text-base font-mono rounded-lg outline-none ${
                      isDarkGlass ? 'bg-slate-900 border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    metres
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-700/40 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStock || !openingStockInput}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingStock ? 'Saving...' : 'Set Opening Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
