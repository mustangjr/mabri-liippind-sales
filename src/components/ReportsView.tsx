import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Package, 
  History, 
  Printer, 
  TrendingDown, 
  CheckCircle2 
} from 'lucide-react';
import { Lipping, User } from '../types';
import { 
  generateDailySalesPDF, 
  generateWeeklySalesPDF, 
  generateStockReportPDF, 
  generateMovementReportPDF,
  generateZhonzhiWeeklyTrackingPDF,
  generateZhonzhiWeeklyTrackingSplitPDF,
  generateNamedWeeklyTrackingPDF
} from '../utils/pdfGenerator';
import { 
  exportInventoryToExcel, 
  exportDailySalesToExcel, 
  exportWeeklySalesToExcel, 
  exportMovementsToExcel 
} from '../utils/excelGenerator';
import { useTheme } from '../context/ThemeContext';

interface ReportsViewProps {
  lippings: Lipping[];
  currentUser: User | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ lippings, currentUser }) => {
  const { isDarkGlass } = useTheme();
  const [reportType, setReportType] = useState<
    'DAILY' | 'WEEKLY' | 'ZHONZHI_WEEKLY' | 'NAMED_WEEKLY' | 'MONTHLY' | 'STOCK' | 'MOVEMENT'
  >('NAMED_WEEKLY');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  // Initial week starting Monday
  const getInitialMonday = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    return monday.toISOString().split('T')[0];
  };

  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getInitialMonday());
  const [selectedMonth, setSelectedMonth] = useState<string>(todayStr.substring(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(false);

  // Handle Download PDF for any report
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const generatedBy = currentUser?.name || 'Administrator';

      if (reportType === 'STOCK') {
        generateStockReportPDF({
          generatedBy,
          items: lippings.map((l) => ({
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
      } else if (reportType === 'DAILY') {
        const res = await fetch(`/api/daily-sales?date=${selectedDate}`);
        const data = await res.json();
        generateDailySalesPDF({
          date: data.date,
          generatedBy,
          items: data.items,
          totalSoldToday: data.total_sold_on_date,
        });
      } else if (reportType === 'WEEKLY') {
        const res = await fetch(`/api/weekly-sales?week_start=${selectedWeekStart}`);
        const data = await res.json();
        generateWeeklySalesPDF({
          weekStart: data.week_start,
          weekEnd: data.week_end,
          generatedBy,
          days: data.days,
          rows: data.rows,
        });
      } else if (reportType === 'ZHONZHI_WEEKLY') {
        const res = await fetch(`/api/weekly-sales?week_start=${selectedWeekStart}`);
        const data = await res.json();
        generateZhonzhiWeeklyTrackingPDF({
          weekStart: data.week_start,
          weekEnd: data.week_end,
          generatedBy,
          rows: data.rows,
        });
      } else if (reportType === 'NAMED_WEEKLY') {
        const res = await fetch(`/api/weekly-sales?week_start=${selectedWeekStart}`);
        const data = await res.json();
        generateNamedWeeklyTrackingPDF({
          weekStart: data.week_start,
          weekEnd: data.week_end,
          generatedBy,
          rows: data.rows.filter((r: any) => r.category === 'NAMED' || r.supplier?.includes('Khadijah') || r.id.startsWith('lip-named-')),
        });
      } else if (reportType === 'MOVEMENT') {
        const res = await fetch('/api/stock-history');
        const movements = await res.json();
        generateMovementReportPDF({
          generatedBy,
          movements,
        });
      } else if (reportType === 'MONTHLY') {
        generateStockReportPDF({
          generatedBy: `${generatedBy} (Month: ${selectedMonth})`,
          items: lippings.map((l) => ({
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
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Export Excel for any report
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      if (reportType === 'STOCK' || reportType === 'MONTHLY') {
        exportInventoryToExcel(lippings);
      } else if (reportType === 'DAILY') {
        const res = await fetch(`/api/daily-sales?date=${selectedDate}`);
        const data = await res.json();
        exportDailySalesToExcel(data.date, data.items);
      } else if (reportType === 'WEEKLY' || reportType === 'ZHONZHI_WEEKLY' || reportType === 'NAMED_WEEKLY') {
        const res = await fetch(`/api/weekly-sales?week_start=${selectedWeekStart}`);
        const data = await res.json();
        exportWeeklySalesToExcel(data.week_start, data.week_end, data.rows);
      } else if (reportType === 'MOVEMENT') {
        const res = await fetch('/api/stock-history');
        const movements = await res.json();
        exportMovementsToExcel(movements);
      }
    } catch (err) {
      console.error('Failed to export Excel:', err);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      id: 'NAMED_WEEKLY' as const,
      title: 'Named Lippings Weekly Sales (Khadijah/Composite)',
      description: 'Official Monday-Saturday daily tracking matrix for named lippings sourced from Khadijah/Composite.',
      icon: TrendingDown,
      badge: 'Khadijah/Composite',
    },
    {
      id: 'ZHONZHI_WEEKLY' as const,
      title: 'Coded Lippings Weekly Sales (Nzonzi Nice Wood)',
      description: 'Official Monday-Saturday tracking matrix matching the scanned store sheet with the 33 coded lippings from Nzonzi Nice Wood.',
      icon: TrendingDown,
      badge: 'Nzonzi Nice Wood',
    },
    {
      id: 'STOCK' as const,
      title: 'Current Stock Report',
      description: 'Master inventory statement with opening stock, receipts, sales, and current balances.',
      icon: Package,
      badge: 'All Items',
    },
    {
      id: 'DAILY' as const,
      title: 'Daily Sales Report',
      description: 'Single-day sales breakdown by lipping design, invoice records, and closing balance.',
      icon: Calendar,
      badge: 'Daily Audit',
    },
    {
      id: 'WEEKLY' as const,
      title: 'Weekly Sales Matrix Report',
      description: 'Full Monday through Saturday sales columns, opening stock, receipts, and closing balance.',
      icon: TrendingDown,
      badge: 'Mon-Sat Tracking',
    },
    {
      id: 'MONTHLY' as const,
      title: 'Monthly Summary Report',
      description: 'Monthly inventory valuation showing opening stock, new arrivals, sales, and closing stock.',
      icon: FileText,
      badge: 'Calendar Month',
    },
    {
      id: 'MOVEMENT' as const,
      title: 'Stock Movement Audit Report',
      description: 'Complete audit log of all stock inbound deliveries, retail sales, and administrative adjustments.',
      icon: History,
      badge: 'Full Audit Trail',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className={`p-6 rounded-2xl transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <h1 className={`text-2xl font-bold tracking-tight ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
          Mabri Limited Reports & Records Export Center
        </h1>
        <p className={`text-sm mt-1 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
          Generate official printable A4 PDF documents and Excel (.xlsx) spreadsheets for store filing and management audits.
        </p>
      </div>

      {/* Select Report Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = reportType === rc.id;

          return (
            <div
              key={rc.id}
              onClick={() => setReportType(rc.id)}
              className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? isDarkGlass
                    ? 'glass-card border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
                    : 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20 shadow-sm border'
                  : isDarkGlass
                  ? 'glass-card hover:border-white/20 text-slate-300'
                  : 'border border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                        : isDarkGlass
                        ? 'bg-white/[0.06] text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    isDarkGlass ? 'bg-slate-800 text-slate-400 border border-white/5' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rc.badge}
                  </span>
                </div>
                <h3 className={`font-bold text-sm ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>{rc.title}</h3>
                <p className={`text-xs mt-1 line-clamp-3 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>{rc.description}</p>
              </div>

              {isSelected && (
                <div className="mt-3 flex items-center space-x-1 text-xs font-bold text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selected</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configuration & Export Panel */}
      <div className={`p-6 rounded-2xl space-y-6 transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel text-white'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className={`border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDarkGlass ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-lg font-bold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>
              Configure {reportCards.find((r) => r.id === reportType)?.title}
            </h2>
            <p className={`text-xs mt-0.5 ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Specify the time period or options before downloading the report.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                isDarkGlass
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-white/15 shadow-[0_0_15px_rgba(0,0,0,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
              }`}
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>DOWNLOAD PDF (A4)</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                isDarkGlass
                  ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>EXPORT EXCEL (.XLSX)</span>
            </button>
          </div>
        </div>

        {/* Date / Parameter Selectors based on report type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportType === 'DAILY' && (
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Select Report Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>
          )}

          {(reportType === 'WEEKLY' || reportType === 'ZHONZHI_WEEKLY' || reportType === 'NAMED_WEEKLY') && (
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Select Week Starting (Monday)
              </label>
              <input
                type="date"
                value={selectedWeekStart}
                onChange={(e) => setSelectedWeekStart(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>
          )}

          {reportType === 'MONTHLY' && (
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-200 bg-slate-50 text-slate-800'
                }`}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Document Layout
            </label>
            <div className={`p-2.5 rounded-lg text-sm font-medium border ${
              isDarkGlass ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              {reportType === 'WEEKLY' ? 'A4 Landscape (13 Columns)' : 'A4 Portrait (Print-Ready)'}
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Header & Issuer
            </label>
            <div className={`p-2.5 rounded-lg text-sm font-medium border ${
              isDarkGlass ? 'bg-slate-950/60 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              Mabri Limited • {currentUser?.name || 'Administrator'}
            </div>
          </div>
        </div>

        {/* Report Preview Notice */}
        <div className={`rounded-xl p-4 flex items-start space-x-3 border ${
          isDarkGlass ? 'bg-slate-950/50 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <Printer className={`w-5 h-5 shrink-0 mt-0.5 ${isDarkGlass ? 'text-amber-400' : 'text-slate-600'}`} />
          <div className={`text-xs space-y-1 ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
            <p className={`font-bold ${isDarkGlass ? 'text-white' : 'text-slate-800'}`}>Professional Printing Guarantee</p>
            <p className="opacity-80">
              PDF reports are styled with Mabri Limited official headers, auto-calculated column totals, closing balance calculations, page numbers, and audit sign-off lines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
