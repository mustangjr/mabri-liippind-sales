import React from 'react';
import { 
  Layers, 
  LayoutDashboard, 
  Package, 
  Tag,
  Calendar, 
  BarChart3, 
  History, 
  FileText, 
  PlusCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Users, 
  LogOut, 
  ShieldCheck, 
  UserCheck,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenRecordSale: () => void;
  onOpenReceiveStock: () => void;
  onOpenAddLipping: () => void;
  onOpenUserManagement: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenRecordSale,
  onOpenReceiveStock,
  onOpenAddLipping,
  onOpenUserManagement,
  onOpenLogin,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const { theme, toggleTheme, isDarkGlass } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coded-lippings', label: 'Coded Lippings', icon: Tag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'daily-sales', label: 'Daily Sales', icon: Calendar },
    { id: 'weekly-sales', label: 'Weekly Daily Sales', icon: BarChart3 },
    { id: 'stock-history', label: 'Stock History', icon: History },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${
      isDarkGlass
        ? 'backdrop-blur-xl bg-slate-950/70 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]'
        : 'bg-slate-900 border-b border-slate-800 text-white shadow-md'
    }`}>
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-white/95 dark:bg-white/95 p-1.5 rounded-xl shadow-md border border-slate-200/50 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="/mabri-logo.svg" alt="Mabri Logo" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-heading">MABRI LIMITED</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono font-medium border border-emerald-500/30">
                  LIPPINGS STORE
                </span>
              </div>
              <p className="text-xs text-slate-400">Sales & Stock Management System • Zhonzhi-Nicewood</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Record Sale - Primary Action */}
            <button
              onClick={onOpenRecordSale}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/40'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Record Sale</span>
            </button>

            {/* Receive Stock */}
            <button
              onClick={onOpenReceiveStock}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium text-sm transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-blue-600/80 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="hidden sm:inline">Receive Stock</span>
              <span className="sm:hidden">Receive</span>
            </button>

            {/* Add Lipping (Admin only) */}
            {isAdmin && (
              <button
                onClick={onOpenAddLipping}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium text-sm transition active:scale-95 cursor-pointer ${
                  isDarkGlass
                    ? 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-white/10'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Add Lipping</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDarkGlass ? 'Classic Light' : 'Dark Glassmorphic'} theme`}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isDarkGlass ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Dark Glass</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>

            {/* User Profile / Auth */}
            <div className={`flex items-center border-l pl-3 ml-1 space-x-2 ${
              isDarkGlass ? 'border-white/10' : 'border-slate-800'
            }`}>
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md border ${
                    isDarkGlass
                      ? 'bg-slate-900/60 text-slate-200 border-white/10'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700'
                  }`}>
                    {isAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-[130px]">
                      {currentUser.name}
                    </span>
                    <span className="uppercase text-[10px] px-1 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                      {currentUser.role}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={onOpenUserManagement}
                      title="Manage Users"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded transition cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={onLogout}
                    title="Switch / Log out"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/70 rounded transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-700 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t ${
          isDarkGlass ? 'border-white/10' : 'border-slate-800/80'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? isDarkGlass
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : isDarkGlass
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
