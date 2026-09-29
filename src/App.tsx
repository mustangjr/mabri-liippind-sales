/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CodedLippingsView } from './components/CodedLippingsView';
import { Inventory } from './components/Inventory';
import { DailySalesView } from './components/DailySalesView';
import { WeeklySalesView } from './components/WeeklySalesView';
import { StockHistoryView } from './components/StockHistoryView';
import { ReportsView } from './components/ReportsView';
import { RecordSaleModal } from './components/RecordSaleModal';
import { ReceiveStockModal } from './components/ReceiveStockModal';
import { AddLippingModal } from './components/AddLippingModal';
import { EditLippingModal } from './components/EditLippingModal';
import { SalesCorrectionModal } from './components/SalesCorrectionModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { UserManagementModal } from './components/UserManagementModal';
import { LoginModal } from './components/LoginModal';
import { Lipping, DashboardStats, User } from './types';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { isDarkGlass } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lippings, setLippings] = useState<Lipping[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Authenticated user (default admin session initialized for seamless immediate use)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-1',
    name: 'Mabri Administrator',
    username: 'admin',
    role: 'admin',
    created_at: new Date().toISOString(),
  });

  // Modal visibility states
  const [recordSaleOpen, setRecordSaleOpen] = useState(false);
  const [receiveStockOpen, setReceiveStockOpen] = useState(false);
  const [addLippingOpen, setAddLippingOpen] = useState(false);
  const [editLippingOpen, setEditLippingOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Targeted items for modals
  const [targetLippingId, setTargetLippingId] = useState<string | undefined>(undefined);
  const [editingLipping, setEditingLipping] = useState<Lipping | null>(null);
  const [targetSaleId, setTargetSaleId] = useState<string | null>(null);
  const [historyLippingFilter, setHistoryLippingFilter] = useState<string | undefined>(undefined);

  // Success toast/alert notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [lippingsRes, statsRes] = await Promise.all([
        fetch('/api/lippings'),
        fetch('/api/dashboard'),
      ]);

      if (lippingsRes.ok) {
        const lipData = await lippingsRes.json();
        setLippings(lipData);
      }
      if (statsRes.ok) {
        const statData = await statsRes.json();
        setDashboardStats(statData);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for modal opening
  const handleOpenRecordSale = (lippingId?: string) => {
    setTargetLippingId(lippingId);
    setRecordSaleOpen(true);
  };

  const handleOpenReceiveStock = (lippingId?: string) => {
    setTargetLippingId(lippingId);
    setReceiveStockOpen(true);
  };

  const handleOpenEditLipping = (lipping: Lipping) => {
    setEditingLipping(lipping);
    setEditLippingOpen(true);
  };

  const handleOpenCorrection = (saleId: string) => {
    setTargetSaleId(saleId);
    setCorrectionOpen(true);
  };

  const handleFilterHistoryByLipping = (lippingId: string) => {
    setHistoryLippingFilter(lippingId);
    setActiveTab('stock-history');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative ${
      isDarkGlass
        ? 'bg-[#0B0F19] text-slate-100'
        : 'bg-slate-100/70 text-slate-900'
    }`}>
      {/* Dark Glass Ambient Lighting Elements */}
      {isDarkGlass && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]"></div>
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]"></div>
          <div className="absolute -bottom-32 left-1/3 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenRecordSale={() => handleOpenRecordSale()}
        onOpenReceiveStock={() => handleOpenReceiveStock()}
        onOpenAddLipping={() => setAddLippingOpen(true)}
        onOpenUserManagement={() => setUserManagementOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setLoginOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200 ${
          isDarkGlass
            ? 'glass-card border-white/20 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            : 'bg-slate-900 text-white shadow-xl border border-slate-700'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Loading Mabri Lippings Database...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={dashboardStats}
                currentUser={currentUser}
                onOpenRecordSale={() => handleOpenRecordSale()}
                onOpenReceiveStock={handleOpenReceiveStock}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCorrection={handleOpenCorrection}
              />
            )}

            {activeTab === 'coded-lippings' && (
              <CodedLippingsView
                lippings={lippings}
                currentUser={currentUser}
                onOpenRecordSale={handleOpenRecordSale}
                onOpenReceiveStock={handleOpenReceiveStock}
                onOpenEditLipping={handleOpenEditLipping}
                onRefreshData={loadData}
              />
            )}

            {activeTab === 'inventory' && (
              <Inventory
                lippings={lippings}
                currentUser={currentUser}
                onOpenRecordSale={handleOpenRecordSale}
                onOpenReceiveStock={handleOpenReceiveStock}
                onOpenAddLipping={() => setAddLippingOpen(true)}
                onOpenEditLipping={handleOpenEditLipping}
                onFilterHistoryByLipping={handleFilterHistoryByLipping}
                onNavigateToCodedLippings={() => setActiveTab('coded-lippings')}
              />
            )}

            {activeTab === 'daily-sales' && (
              <DailySalesView
                currentUser={currentUser}
                onOpenRecordSale={() => handleOpenRecordSale()}
                onOpenCorrection={handleOpenCorrection}
              />
            )}

            {activeTab === 'weekly-sales' && (
              <WeeklySalesView currentUser={currentUser} />
            )}

            {activeTab === 'stock-history' && (
              <StockHistoryView
                lippings={lippings}
                currentUser={currentUser}
                selectedLippingIdFilter={historyLippingFilter}
                onClearLippingFilter={() => setHistoryLippingFilter(undefined)}
                onOpenCorrection={handleOpenCorrection}
                onOpenAdjustment={() => setAdjustmentOpen(true)}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView lippings={lippings} currentUser={currentUser} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-4 text-center text-xs transition-colors duration-300 relative z-10 ${
        isDarkGlass
          ? 'glass-panel border-t border-white/10 text-slate-400'
          : 'bg-white border-t border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className={isDarkGlass ? 'text-slate-200' : 'text-slate-700'}>Mabri Limited</strong> • Lipping Sales & Stock Management System
          </div>
          <div className="text-[11px] opacity-70">
            Stock Calculation: Opening + Received - Total Sales ± Adjustments
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RecordSaleModal
        isOpen={recordSaleOpen}
        onClose={() => setRecordSaleOpen(false)}
        lippings={lippings}
        preselectedLippingId={targetLippingId}
        currentUser={currentUser}
        onSaleSuccess={() => {
          loadData();
          showToast('Sale recorded successfully. Stock balance deducted.');
        }}
      />

      <ReceiveStockModal
        isOpen={receiveStockOpen}
        onClose={() => setReceiveStockOpen(false)}
        lippings={lippings}
        preselectedLippingId={targetLippingId}
        currentUser={currentUser}
        onReceiveSuccess={() => {
          loadData();
          showToast('Stock received successfully. Balance updated.');
        }}
      />

      <AddLippingModal
        isOpen={addLippingOpen}
        onClose={() => setAddLippingOpen(false)}
        onSuccess={() => {
          loadData();
          showToast('New lipping profile added to inventory.');
        }}
      />

      <EditLippingModal
        isOpen={editLippingOpen}
        onClose={() => {
          setEditLippingOpen(false);
          setEditingLipping(null);
        }}
        lipping={editingLipping}
        onSuccess={() => {
          loadData();
          showToast('Lipping profile updated successfully.');
        }}
      />

      <SalesCorrectionModal
        isOpen={correctionOpen}
        onClose={() => {
          setCorrectionOpen(false);
          setTargetSaleId(null);
        }}
        saleId={targetSaleId}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
          showToast('Sale corrected and reversal audit record generated.');
        }}
      />

      <StockAdjustmentModal
        isOpen={adjustmentOpen}
        onClose={() => setAdjustmentOpen(false)}
        lippings={lippings}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
          showToast('Stock adjustment successfully logged.');
        }}
      />

      <UserManagementModal
        isOpen={userManagementOpen}
        onClose={() => setUserManagementOpen(false)}
        currentUser={currentUser}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`);
        }}
      />
    </div>
  );
}
