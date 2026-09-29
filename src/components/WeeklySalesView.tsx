import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Search, 
  FileText,
  Tag,
  BookmarkCheck,
  Building2,
  Package
} from 'lucide-react';
import { WeeklySalesResponse, User, WeeklySalesRow } from '../types';
import { 
  generateWeeklySalesPDF, 
  generateZhonzhiWeeklyTrackingPDF, 
  generateZhonzhiWeeklyTrackingSplitPDF,
  generateNamedWeeklyTrackingPDF,
  ZHONZHI_NICEWOOD_CODES,
  KHADIJAH_NAMED_LIPPINGS_LIST
} from '../utils/pdfGenerator';
import { exportWeeklySalesToExcel } from '../utils/excelGenerator';
import { useTheme } from '../context/ThemeContext';

interface WeeklySalesViewProps {
  currentUser: User | null;
}

interface EditableDaySales {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
}

export const WeeklySalesView: React.FC<WeeklySalesViewProps> = ({ currentUser }) => {
  const { isDarkGlass } = useTheme();

  // Find current Monday
  const getInitialMonday = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    return monday.toISOString().split('T')[0];
  };

  const [weekStart, setWeekStart] = useState<string>(getInitialMonday());
  const [data, setData] = useState<WeeklySalesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Category View: 'NAMED' (Khadijah/Composite) | 'CODED' (Zhonzhi-Nicewood) | 'ALL'
  // Starts with 'NAMED' as requested: "start with named lippings add spaced for inpu sales from monay-saturday then do the same with coded"
  const [activeCategory, setActiveCategory] = useState<'NAMED' | 'CODED' | 'ALL'>('NAMED');

  // Local state for interactive editing of Monday-Saturday sales
  const [editedSales, setEditedSales] = useState<Record<string, EditableDaySales>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch weekly sales data from server
  const fetchWeeklySales = async (start: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weekly-sales?week_start=${start}`);
      if (res.ok) {
        const json: WeeklySalesResponse = await res.json();
        setData(json);
        
        // Initialize local editable state from server rows
        const initialEdits: Record<string, EditableDaySales> = {};
        json.rows.forEach((r) => {
          initialEdits[r.id] = {
            monday: r.monday || 0,
            tuesday: r.tuesday || 0,
            wednesday: r.wednesday || 0,
            thursday: r.thursday || 0,
            friday: r.friday || 0,
            saturday: r.saturday || 0,
          };
        });
        setEditedSales(initialEdits);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error fetching weekly sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySales(weekStart);
  }, [weekStart]);

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  // Handle inline day sale change
  const handleDayChange = (
    rowId: string, 
    day: keyof EditableDaySales, 
    valStr: string
  ) => {
    const num = Math.max(0, parseFloat(valStr) || 0);
    setEditedSales((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0 }),
        [day]: num,
      },
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Save all changes back to database
  const handleSaveAll = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const entries = Object.entries(editedSales).map(([lipping_id, days]) => ({
        lipping_id,
        ...days,
      }));

      const res = await fetch('/api/weekly-sales/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_start: data.week_start,
          user_id: currentUser?.id || 'usr-1',
          user_name: currentUser?.name || 'Administrator',
          entries,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save weekly sales sheet:', err);
    } finally {
      setSaving(false);
    }
  };

  // Revert changes back to server state
  const handleReset = () => {
    if (!data) return;
    const initialEdits: Record<string, EditableDaySales> = {};
    data.rows.forEach((r) => {
      initialEdits[r.id] = {
        monday: r.monday || 0,
        tuesday: r.tuesday || 0,
        wednesday: r.wednesday || 0,
        thursday: r.thursday || 0,
        friday: r.friday || 0,
        saturday: r.saturday || 0,
      };
    });
    setEditedSales(initialEdits);
    setHasChanges(false);
  };

  // Fill sample sales data for demonstration
  const handleFillSample = () => {
    if (!data) return;
    const sampleEdits: Record<string, EditableDaySales> = { ...editedSales };
    const sampleValues = [12.5, 6.0, 18.0, 24.5, 9.0, 15.0, 8.5, 20.0, 5.0, 14.0];
    
    filteredRows.forEach((r, idx) => {
      sampleEdits[r.id] = {
        monday: sampleValues[(idx * 2) % sampleValues.length] || 5,
        tuesday: sampleValues[(idx * 3) % sampleValues.length] || 0,
        wednesday: sampleValues[(idx * 5) % sampleValues.length] || 4,
        thursday: sampleValues[(idx * 7) % sampleValues.length] || 0,
        friday: sampleValues[(idx * 11) % sampleValues.length] || 6.5,
        saturday: sampleValues[(idx * 13) % sampleValues.length] || 2,
      };
    });

    setEditedSales(sampleEdits);
    setHasChanges(true);
  };

  // Live computed rows merging server and local edits
  const computedRows = useMemo(() => {
    if (!data?.rows) return [];

    return data.rows.map((row) => {
      const edit = editedSales[row.id] || {
        monday: row.monday || 0,
        tuesday: row.tuesday || 0,
        wednesday: row.wednesday || 0,
        thursday: row.thursday || 0,
        friday: row.friday || 0,
        saturday: row.saturday || 0,
      };

      const totalSold = edit.monday + edit.tuesday + edit.wednesday + edit.thursday + edit.friday + edit.saturday;
      const closingBalance = Math.round((row.opening_stock + row.stock_received - totalSold) * 10) / 10;

      let status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
      if (closingBalance <= 0) {
        status = 'OUT OF STOCK';
      } else if (closingBalance <= 20) {
        status = 'LOW STOCK';
      }

      // Determine classification:
      // NAMED = supplier Khadijah/Composite or id starts with lip-named-
      // CODED = supplier Zhonzhi-Nicewood
      const isNamed = row.category === 'NAMED' || row.id.startsWith('lip-named-') || row.supplier?.includes('Khadijah');
      const category: 'NAMED' | 'CODED' = isNamed ? 'NAMED' : 'CODED';
      const supplier = isNamed ? 'Khadijah/Composite' : 'Zhonzhi-Nicewood';

      return {
        ...row,
        category,
        supplier,
        monday: edit.monday,
        tuesday: edit.tuesday,
        wednesday: edit.wednesday,
        thursday: edit.thursday,
        friday: edit.friday,
        saturday: edit.saturday,
        total_sold: Math.round(totalSold * 10) / 10,
        closing_balance: closingBalance,
        status,
      };
    });
  }, [data, editedSales]);

  // Separate lists for count badges
  const namedRows = useMemo(() => computedRows.filter((r) => r.category === 'NAMED'), [computedRows]);
  const codedRows = useMemo(() => computedRows.filter((r) => r.category === 'CODED'), [computedRows]);

  // Filtered rows for currently active category
  const filteredRows = useMemo(() => {
    return computedRows.filter((r) => {
      if (activeCategory === 'NAMED' && r.category !== 'NAMED') return false;
      if (activeCategory === 'CODED' && r.category !== 'CODED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
      }

      return true;
    });
  }, [computedRows, activeCategory, searchQuery]);

  // Column totals for active category table
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => ({
        opening_stock: acc.opening_stock + r.opening_stock,
        stock_received: acc.stock_received + r.stock_received,
        monday: acc.monday + r.monday,
        tuesday: acc.tuesday + r.tuesday,
        wednesday: acc.wednesday + r.wednesday,
        thursday: acc.thursday + r.thursday,
        friday: acc.friday + r.friday,
        saturday: acc.saturday + r.saturday,
        total_sold: acc.total_sold + r.total_sold,
        closing_balance: acc.closing_balance + r.closing_balance,
      }),
      {
        opening_stock: 0,
        stock_received: 0,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        total_sold: 0,
        closing_balance: 0,
      }
    );
  }, [filteredRows]);

  // PDF Export Handlers
  const handleDownloadPDF = () => {
    if (!data) return;
    if (activeCategory === 'NAMED') {
      generateNamedWeeklyTrackingPDF({
        weekStart: data.week_start,
        weekEnd: data.week_end,
        generatedBy: currentUser?.name || 'Administrator',
        rows: namedRows,
        isBlankTemplate: false,
      });
    } else {
      generateZhonzhiWeeklyTrackingPDF({
        weekStart: data.week_start,
        weekEnd: data.week_end,
        generatedBy: currentUser?.name || 'Administrator',
        rows: codedRows,
        isBlankTemplate: false,
      });
    }
  };

  const handleDownloadBlankPDF = () => {
    if (activeCategory === 'NAMED') {
      generateNamedWeeklyTrackingPDF({
        isBlankTemplate: true,
      });
    } else {
      generateZhonzhiWeeklyTrackingPDF({
        isBlankTemplate: true,
      });
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    exportWeeklySalesToExcel(data.week_start, data.week_end, filteredRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Supplier Context & Mabri Logo */}
      <div className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200 flex-shrink-0">
              <img src="/mabri-logo.svg" alt="Mabri Logo" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight font-heading ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
                  Mabri Lippings Daily Sales Input (Monday — Saturday)
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold tracking-wide shadow-xs ${
                  activeCategory === 'NAMED'
                    ? 'bg-blue-600 text-white'
                    : activeCategory === 'CODED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                }`}>
                  {activeCategory === 'NAMED' 
                    ? '[SUPPLIER: KHADIJAH / COMPOSITE]' 
                    : activeCategory === 'CODED'
                      ? '[SUPPLIER: NZONZI NICE WOOD]'
                      : '[ALL SUPPLIERS]'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                {activeCategory === 'NAMED'
                  ? 'Named Lippings recorded separately from Khadijah/Composite • Input daily sales per lipping from Monday to Saturday'
                  : 'Coded Lippings recorded separately from Nzonzi Nice Wood (Zhonzhi-Nicewood) • Input daily sales per code from Monday to Saturday'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 animate-pulse"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Daily Sales'}</span>
              </button>
            )}

            {saveSuccess && (
              <div className="flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved to database!</span>
              </div>
            )}

            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
                title="Discard changes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
            )}

            <button
              onClick={handleFillSample}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
              title="Populate sample sales across Monday-Saturday for demo"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Sample Sales</span>
            </button>

            {/* Download PDF for Active Section */}
            <button
              onClick={handleDownloadPDF}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-white/10 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
              title={`Download PDF tracking report for ${activeCategory === 'NAMED' ? 'Named Lippings (Khadijah/Composite)' : 'Coded Lippings (Nzonzi Nice Wood)'}`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF ({activeCategory === 'NAMED' ? 'Named' : 'Coded'})</span>
            </button>

            {activeCategory === 'CODED' && (
              <button
                onClick={() => {
                  if (data) {
                    generateZhonzhiWeeklyTrackingSplitPDF({
                      weekStart: data.week_start,
                      weekEnd: data.week_end,
                      rows: codedRows,
                      isBlankTemplate: false,
                    });
                  }
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isDarkGlass
                    ? 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title="Download 2-Page Print Layout matching original scan"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>2-Page Scan PDF</span>
              </button>
            )}

            <button
              onClick={handleDownloadBlankPDF}
              className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                isDarkGlass
                  ? 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
              title="Download blank audit sheet for manual physical recording"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Blank Sheet</span>
            </button>

            <button
              onClick={handleExportExcel}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/30'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEPARATE RECORDING TABS: 1) NAMED LIPPINGS (KHADIJAH / COMPOSITE) vs 2) CODED LIPPINGS (NZONZI NICE WOOD) */}
      <div className={`p-2 rounded-2xl border transition-all ${
        isDarkGlass ? 'bg-slate-900/60 border-white/10' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* 1. NAMED LIPPINGS TAB (KHADIJAH/COMPOSITE) */}
            <button
              onClick={() => setActiveCategory('NAMED')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'NAMED'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 ring-2 ring-blue-400/30'
                  : isDarkGlass
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>1. Named Lippings (Khadijah / Composite)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeCategory === 'NAMED' ? 'bg-blue-700 text-white' : 'bg-slate-700/40 text-slate-300'
              }`}>
                {namedRows.length}
              </span>
            </button>

            {/* 2. CODED LIPPINGS TAB (NZONZI NICE WOOD) */}
            <button
              onClick={() => setActiveCategory('CODED')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'CODED'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400/30'
                  : isDarkGlass
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>2. Coded Lippings (Nzonzi Nice Wood)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeCategory === 'CODED' ? 'bg-emerald-700 text-white' : 'bg-slate-700/40 text-slate-300'
              }`}>
                {codedRows.length}
              </span>
            </button>

            {/* ALL LIPPINGS TAB */}
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : isDarkGlass
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>All Combined</span>
            </button>
          </div>

          {/* Supplier Badge Info */}
          <div className="flex items-center space-x-2 text-xs">
            <Building2 className={`w-3.5 h-3.5 ${activeCategory === 'NAMED' ? 'text-blue-400' : 'text-emerald-400'}`} />
            <span className="text-slate-400">Supplier:</span>
            <span className={`font-semibold ${activeCategory === 'NAMED' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {activeCategory === 'NAMED' ? 'Khadijah / Composite' : activeCategory === 'CODED' ? 'Nzonzi Nice Wood' : 'Multiple'}
            </span>
          </div>
        </div>
      </div>

      {/* Week Selector & Search Bar */}
      <div className={`p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDarkGlass
                ? 'border border-white/10 hover:bg-white/[0.08] text-slate-300'
                : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 border ${
            isDarkGlass
              ? 'glass-input border-white/15 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Calendar className={`w-4 h-4 ${activeCategory === 'NAMED' ? 'text-blue-400' : 'text-emerald-400'}`} />
            <span className={`text-xs font-semibold ${isDarkGlass ? 'text-slate-300' : 'text-slate-500'}`}>Week:</span>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="text-sm font-semibold bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextWeek}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDarkGlass
                ? 'border border-white/10 hover:bg-white/[0.08] text-slate-300'
                : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setWeekStart(getInitialMonday())}
            className={`text-xs px-2.5 py-2 rounded-lg font-medium transition cursor-pointer ${
              isDarkGlass
                ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Current Week
          </button>
        </div>

        {/* Search box */}
        <div className={`relative flex items-center rounded-lg border px-2.5 py-1.5 w-full md:w-auto ${
          isDarkGlass ? 'glass-input border-white/15 text-white' : 'bg-white border-slate-200'
        }`}>
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <input
            type="text"
            placeholder={activeCategory === 'NAMED' ? 'Search named lipping...' : 'Search code or name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-transparent focus:outline-none w-full sm:w-56"
          />
        </div>
      </div>

      {/* Changes Alert Banner */}
      {hasChanges && (
        <div className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
          isDarkGlass 
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>You have unsaved daily sales entries. Click "Save Daily Sales" to commit changes to the store database.</span>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-xs transition cursor-pointer shadow-xs ml-2"
          >
            {saving ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      )}

      {/* Main Interactive Table with Spaces for Input Sales from Monday to Saturday */}
      {loading ? (
        <div className={`flex items-center justify-center p-12 rounded-2xl ${
          isDarkGlass ? 'glass-panel' : 'bg-white border border-slate-200'
        }`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden transition-all duration-200 ${
          isDarkGlass
            ? 'glass-panel border-white/10'
            : 'bg-white rounded-xl border border-slate-200 shadow-xs'
        }`}>
          {/* Section Subheader Banner */}
          <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
            activeCategory === 'NAMED'
              ? isDarkGlass ? 'bg-blue-950/40 border-blue-800/30' : 'bg-blue-50/80 border-blue-200'
              : isDarkGlass ? 'bg-emerald-950/40 border-emerald-800/30' : 'bg-emerald-50/80 border-emerald-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${activeCategory === 'NAMED' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
              <span className={`font-bold text-xs ${activeCategory === 'NAMED' ? 'text-blue-300' : 'text-emerald-300'}`}>
                {activeCategory === 'NAMED'
                  ? 'SECTION 1: NAMED LIPPINGS (KHADIJAH / COMPOSITE)'
                  : 'SECTION 2: CODED LIPPINGS (NZONZI NICE WOOD)'}
              </span>
              <span className="text-[11px] text-slate-400">
                — {filteredRows.length} items catalogued
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Columns: Mon to Sat Daily Sales • Real-time Auto-Calculations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-xs">
              <thead className={`font-semibold ${
                isDarkGlass ? 'bg-slate-950/80 text-slate-300 divide-white/10' : 'bg-slate-900 text-white'
              }`}>
                <tr>
                  <th className="py-3 px-3">
                    {activeCategory === 'NAMED' ? 'Named Lipping (Design)' : 'Lipping Code & Design'}
                  </th>
                  <th className="py-3 px-3 text-right">Opening Total (mtrs)</th>
                  <th className={`py-3 px-2 text-center border-l ${
                    activeCategory === 'NAMED' 
                      ? 'bg-blue-950/40 border-blue-800/30 text-blue-200' 
                      : 'bg-emerald-950/40 border-emerald-800/30 text-emerald-200'
                  }`}>Monday</th>
                  <th className={`py-3 px-2 text-center ${
                    activeCategory === 'NAMED' ? 'bg-blue-950/40 text-blue-200' : 'bg-emerald-950/40 text-emerald-200'
                  }`}>Tuesday</th>
                  <th className={`py-3 px-2 text-center ${
                    activeCategory === 'NAMED' ? 'bg-blue-950/40 text-blue-200' : 'bg-emerald-950/40 text-emerald-200'
                  }`}>Wednesday</th>
                  <th className={`py-3 px-2 text-center ${
                    activeCategory === 'NAMED' ? 'bg-blue-950/40 text-blue-200' : 'bg-emerald-950/40 text-emerald-200'
                  }`}>Thursday</th>
                  <th className={`py-3 px-2 text-center ${
                    activeCategory === 'NAMED' ? 'bg-blue-950/40 text-blue-200' : 'bg-emerald-950/40 text-emerald-200'
                  }`}>Friday</th>
                  <th className={`py-3 px-2 text-center border-r ${
                    activeCategory === 'NAMED' 
                      ? 'bg-blue-950/40 border-blue-800/30 text-blue-200' 
                      : 'bg-emerald-950/40 border-emerald-800/30 text-emerald-200'
                  }`}>Saturday</th>
                  <th className="py-3 px-3 text-right font-bold text-amber-300">Total Sold</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-400">Balance</th>
                  <th className="py-3 px-2 text-center">Status</th>
                </tr>
              </thead>

              <tbody className={`divide-y ${
                isDarkGlass ? 'divide-white/5 text-slate-200' : 'divide-slate-200 text-slate-800'
              }`}>
                {filteredRows.map((row, idx) => {
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-150 ${
                        isDarkGlass 
                          ? idx % 2 === 0 ? 'bg-transparent hover:bg-white/[0.04]' : 'bg-white/[0.02] hover:bg-white/[0.05]'
                          : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/70'
                      }`}
                    >
                      {/* Name / Code Column */}
                      <td className="py-2.5 px-3">
                        {activeCategory === 'NAMED' ? (
                          <div>
                            <span className="font-bold text-sm tracking-tight text-blue-400 font-heading">
                              {row.name}
                            </span>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">Supplier: Khadijah / Composite</span>
                              {row.brand && row.brand !== 'Standard' && (
                                <span className="bg-blue-500/15 text-blue-300 text-[10px] px-1.5 py-0.2 rounded border border-blue-500/20">
                                  {row.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm tracking-tight text-emerald-400 font-mono">
                                {row.code}
                              </span>
                              {row.code === '24.9-1' && (
                                <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-blue-500/30">
                                  Double Lipping
                                </span>
                              )}
                              {row.code === '25.9-8' && (
                                <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-purple-500/30">
                                  Fairdeal
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] truncate max-w-[160px] ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                              {row.name}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Opening Total (mtrs) */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {row.opening_stock > 0 ? (
                          <span>{row.opening_stock.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-500">0.0</span>
                        )}
                      </td>

                      {/* Daily Sales Spaces (Monday - Saturday) */}
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const).map((dayKey) => {
                        const val = row[dayKey];
                        const isFocusedNamed = activeCategory === 'NAMED';

                        return (
                          <td key={dayKey} className="py-1.5 px-1.5 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={val > 0 ? val : ''}
                              placeholder="-"
                              onChange={(e) => handleDayChange(row.id, dayKey, e.target.value)}
                              className={`w-16 sm:w-20 px-2 py-1 text-right text-xs font-mono font-medium rounded-md border transition focus:outline-none ${
                                isFocusedNamed ? 'focus:ring-1 focus:ring-blue-400' : 'focus:ring-1 focus:ring-emerald-400'
                              } ${
                                val > 0
                                  ? isDarkGlass
                                    ? isFocusedNamed
                                      ? 'bg-blue-950/60 border-blue-500/40 text-blue-300 font-bold'
                                      : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold'
                                    : isFocusedNamed
                                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : isDarkGlass
                                    ? 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/20'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Total Sold (Dynamically Computed) */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                        {row.total_sold > 0 ? (
                          `${row.total_sold.toFixed(1)} m`
                        ) : (
                          <span className="text-slate-500">0.0 m</span>
                        )}
                      </td>

                      {/* Closing Balance (Dynamically Computed) */}
                      <td className={`py-2.5 px-3 text-right font-mono font-bold text-sm ${
                        row.closing_balance <= 0
                          ? 'text-red-400'
                          : row.closing_balance <= 20
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}>
                        {row.closing_balance.toFixed(1)} m
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          row.status === 'IN STOCK'
                            ? isDarkGlass
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-800'
                            : row.status === 'LOW STOCK'
                              ? isDarkGlass
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-100 text-amber-800'
                              : isDarkGlass
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-red-100 text-red-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Summary Totals Row */}
              <tfoot className={`font-bold border-t-2 ${
                isDarkGlass
                  ? 'bg-slate-950 text-white border-white/20'
                  : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}>
                <tr>
                  <td className="py-3 px-3 uppercase text-xs tracking-wider">
                    Total ({filteredRows.length} {activeCategory === 'NAMED' ? 'Named Lippings' : 'Coded Lippings'})
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {totals.opening_stock.toFixed(1)} m
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    {totals.monday > 0 ? `${totals.monday.toFixed(1)}` : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    {totals.tuesday > 0 ? `${totals.tuesday.toFixed(1)}` : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    {totals.wednesday > 0 ? `${totals.wednesday.toFixed(1)}` : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    {totals.thursday > 0 ? `${totals.thursday.toFixed(1)}` : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    {totals.friday > 0 ? `${totals.friday.toFixed(1)}` : '-'}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-400">
                    {totals.saturday > 0 ? `${totals.saturday.toFixed(1)}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-400">
                    {totals.total_sold.toFixed(1)} m
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {totals.closing_balance.toFixed(1)} m
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
