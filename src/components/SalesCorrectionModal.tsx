import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Sale, User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SalesCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  currentUser: User | null;
  onSuccess: () => void;
}

export const SalesCorrectionModal: React.FC<SalesCorrectionModalProps> = ({
  isOpen,
  onClose,
  saleId,
  currentUser,
  onSuccess,
}) => {
  const { isDarkGlass } = useTheme();
  const [sale, setSale] = useState<Sale | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (saleId && isOpen) {
      setLoading(true);
      fetch('/api/sales')
        .then((res) => res.json())
        .then((sales: Sale[]) => {
          const found = sales.find((s) => s.id === saleId);
          if (found) {
            setSale(found);
            setNewQuantity(String(found.quantity));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [saleId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please provide an official audit reason for correcting this sale.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/sales/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: saleId,
          new_quantity: newQuantity ? parseFloat(newQuantity) : undefined,
          reason: reason.trim(),
          user_id: currentUser?.id || 'usr-1',
          user_name: currentUser?.name || 'Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to correct sale');
      }

      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing correction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`rounded-2xl max-w-lg w-full overflow-hidden transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel bg-slate-900/90 border border-white/20 text-white shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
          : 'bg-white rounded-2xl shadow-2xl border border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDarkGlass ? 'bg-slate-950/70 border-white/10 text-white' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              isDarkGlass
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Sales Correction</h2>
              <p className="text-xs text-slate-400">Non-destructive audit reversal & re-entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDarkGlass ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
          </div>
        ) : !sale ? (
          <div className={`p-6 text-center text-sm ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Sale record not found.</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg flex items-start space-x-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="font-semibold">{error}</div>
              </div>
            )}

            {/* Original Sale Summary */}
            <div className={`rounded-xl p-4 text-xs space-y-2 border ${
              isDarkGlass ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span className={isDarkGlass ? 'text-white' : 'text-slate-800'}>Original Transaction:</span>
                <span className={`font-mono px-1.5 py-0.5 rounded text-[11px] ${
                  isDarkGlass ? 'bg-slate-800 text-amber-300 border border-white/10' : 'bg-slate-200 text-slate-800'
                }`}>
                  Ref #{sale.invoice_number || sale.id}
                </span>
              </div>
              <div className={`grid grid-cols-2 gap-2 ${isDarkGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                <div>Lipping: <strong className={isDarkGlass ? 'text-white' : 'text-slate-800'}>{sale.lipping_code} ({sale.lipping_name})</strong></div>
                <div>Date: <strong className={isDarkGlass ? 'text-white' : 'text-slate-800'}>{sale.sale_date}</strong></div>
                <div>Recorded Sale: <strong className={isDarkGlass ? 'text-rose-400' : 'text-red-700'}>{sale.quantity} metres</strong></div>
                <div>Sold By: <strong className={isDarkGlass ? 'text-white' : 'text-slate-800'}>{sale.user_name}</strong></div>
              </div>
            </div>

            {/* Audit explanation */}
            <div className={`p-3 rounded-lg text-xs space-y-1 border ${
              isDarkGlass
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-amber-50 border-amber-200/80 text-amber-800'
            }`}>
              <span className="font-bold block">Audit Rules:</span>
              <p>
                1. System creates an automatic <strong>+{sale.quantity} m</strong> reversal record.
              </p>
              <p>
                2. If a new quantity is entered below, a corrected sale will be recorded. If set to 0 or left blank, the sale is completely voided/cancelled.
              </p>
            </div>

            {/* New Quantity */}
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Correct Quantity in Metres (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0 to fully void this sale"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className={`w-full p-2.5 pr-8 rounded-lg text-lg font-bold focus:outline-none ${
                    isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                  }`}
                />
                <span className={`absolute right-3 top-3 text-xs font-bold ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>m</span>
              </div>
              <span className={`text-[11px] ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter 0 or leave blank to cancel/void the sale without creating a replacement sale.
              </span>
            </div>

            {/* Audit Reason */}
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Correction Reason <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Typo in metres entered; customer returned 5m; wrongly selected profile"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className={`pt-3 flex items-center justify-end space-x-3 border-t ${
              isDarkGlass ? 'border-white/10' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  isDarkGlass ? 'text-slate-300 hover:bg-white/[0.08]' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition active:scale-95 cursor-pointer ${
                  isDarkGlass
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-400/30'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
                <span>{submitting ? 'Processing...' : 'EXECUTE CORRECTION'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
