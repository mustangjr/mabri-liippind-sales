import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Lipping, User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lippings: Lipping[];
  currentUser: User | null;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  lippings,
  currentUser,
  onSuccess,
}) => {
  const { isDarkGlass } = useTheme();
  const [selectedLippingId, setSelectedLippingId] = useState(lippings[0]?.id || '');
  const [direction, setDirection] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<'AUDIT_CORRECTION' | 'DAMAGE' | 'OTHER'>('AUDIT_CORRECTION');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentLipping = lippings.find((l) => l.id === selectedLippingId);
  const currentBalance = currentLipping?.current_balance ?? 0;
  const numQty = parseFloat(quantity) || 0;
  const delta = direction === 'ADD' ? numQty : -numQty;
  const newBalance = Math.max(0, currentBalance + delta);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLippingId) {
      setError('Please select a lipping profile.');
      return;
    }

    if (numQty <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    if (direction === 'DEDUCT' && numQty > currentBalance) {
      setError(`Cannot deduct ${numQty} m. Available stock is only ${currentBalance} m.`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide an official audit reason.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lipping_id: selectedLippingId,
          quantity: delta,
          adjustment_type: type,
          reason: reason.trim(),
          date,
          user_id: currentUser?.id || 'usr-1',
          user_name: currentUser?.name || 'Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      setQuantity('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing adjustment');
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
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Stock Adjustment & Audit</h2>
              <p className="text-xs text-slate-400">Record recount variances, damaged rolls, or audit reconciliation</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg flex items-start space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          {/* Lipping Selection */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Select Lipping Profile</label>
            <select
              value={selectedLippingId}
              onChange={(e) => setSelectedLippingId(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900 bg-white'
              }`}
            >
              {lippings.map((l) => (
                <option key={l.id} value={l.id} className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>
                  {l.code} — {l.name} | Available: {l.current_balance} m
                </option>
              ))}
            </select>
          </div>

          {/* Balance Preview */}
          {currentLipping && (
            <div className={`rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs border ${
              isDarkGlass ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className={`uppercase font-semibold ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Current</span>
                <div className="text-base font-bold">{currentBalance} m</div>
              </div>
              <div>
                <span className={`uppercase font-semibold ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Change</span>
                <div className={`text-base font-bold ${
                  direction === 'ADD' 
                    ? isDarkGlass ? 'text-emerald-400' : 'text-emerald-600' 
                    : isDarkGlass ? 'text-rose-400' : 'text-red-600'
                }`}>
                  {numQty > 0 ? `${direction === 'ADD' ? '+' : '-'}${numQty} m` : '0 m'}
                </div>
              </div>
              <div>
                <span className={`uppercase font-semibold ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>New Balance</span>
                <div className="text-base font-black">{newBalance.toFixed(1)} m</div>
              </div>
            </div>
          )}

          {/* Direction (Add vs Deduct) */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Adjustment Direction</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDirection('ADD')}
                className={`py-2 rounded-lg border transition cursor-pointer ${
                  direction === 'ADD'
                    ? isDarkGlass
                      ? 'bg-emerald-600/80 text-white border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : isDarkGlass
                    ? 'border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                + Increase Stock (Stock Found)
              </button>
              <button
                type="button"
                onClick={() => setDirection('DEDUCT')}
                className={`py-2 rounded-lg border transition cursor-pointer ${
                  direction === 'DEDUCT'
                    ? isDarkGlass
                      ? 'bg-rose-600/80 text-white border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-red-600 text-white border-red-700 shadow-xs'
                    : isDarkGlass
                    ? 'border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                - Reduce Stock (Damage / Shortage)
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase tracking-wide ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Adjustment Quantity in Metres (m) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full p-2.5 pr-8 rounded-lg text-lg font-bold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                }`}
                required
              />
              <span className={`absolute right-3 top-3 text-xs font-bold ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>m</span>
            </div>
          </div>

          {/* Adjustment Reason Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Reason Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className={`w-full p-2 rounded-lg text-xs font-semibold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800 bg-white'
                }`}
              >
                <option value="AUDIT_CORRECTION" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Audit Count Variance</option>
                <option value="DAMAGE" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Damaged / Scratched Roll</option>
                <option value="OTHER" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Other Reason</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs font-semibold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800 bg-white'
                }`}
                required
              />
            </div>
          </div>

          {/* Reason notes */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Audit Explanation / Notes <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Physical stock count showed 85m instead of 90m; roll end damaged"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-xs focus:outline-none ${
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
              className={`flex items-center space-x-2 px-5 py-2.5 font-bold rounded-lg text-sm shadow-sm transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'RECORD ADJUSTMENT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
