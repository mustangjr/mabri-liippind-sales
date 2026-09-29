import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  Receipt, 
  User as UserIcon, 
  Calendar,
  Layers
} from 'lucide-react';
import { Lipping, User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lippings: Lipping[];
  preselectedLippingId?: string;
  currentUser: User | null;
  onSaleSuccess: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  lippings,
  preselectedLippingId,
  currentUser,
  onSaleSuccess,
}) => {
  const { isDarkGlass } = useTheme();
  const [selectedLippingId, setSelectedLippingId] = useState<string>(preselectedLippingId || '');
  const [quantity, setQuantity] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customer, setCustomer] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedLippingId) {
      setSelectedLippingId(preselectedLippingId);
    } else if (lippings.length > 0 && !selectedLippingId) {
      setSelectedLippingId(lippings[0].id);
    }
  }, [preselectedLippingId, lippings]);

  if (!isOpen) return null;

  const currentLipping = lippings.find((l) => l.id === selectedLippingId);
  const currentBalance = currentLipping?.current_balance ?? 0;
  const numQuantity = parseFloat(quantity) || 0;
  const isInsufficientStock = numQuantity > currentBalance;
  const newBalance = Math.max(0, currentBalance - numQuantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLippingId) {
      setError('Please select a lipping design.');
      return;
    }

    if (numQuantity <= 0) {
      setError('Please enter a valid quantity in metres.');
      return;
    }

    if (isInsufficientStock) {
      setError(`INSUFFICIENT STOCK: Available balance is only ${currentBalance} m. You cannot sell ${numQuantity} m.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lipping_id: selectedLippingId,
          quantity: numQuantity,
          sale_date: saleDate,
          customer: customer.trim() || undefined,
          invoice_number: invoiceNumber.trim() || undefined,
          user_id: currentUser?.id || 'usr-1',
          user_name: currentUser?.name || 'Staff',
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record sale');
      }

      // Success
      setQuantity('');
      setCustomer('');
      setInvoiceNumber('');
      setNotes('');
      onSaleSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording sale');
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
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Daily Sale</h2>
              <p className="text-xs text-slate-400">Sold quantity is deducted immediately from store stock</p>
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
            <label className={`text-xs font-bold uppercase tracking-wide ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Select Lipping Code / Name <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedLippingId}
              onChange={(e) => setSelectedLippingId(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900 bg-white'
              }`}
            >
              {lippings.map((l) => (
                <option key={l.id} value={l.id} className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>
                  {l.code} — {l.name} ({l.brand}) | Available: {l.current_balance} m
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Balance Calculation Display */}
          {currentLipping && (
            <div className={`rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center border ${
              isDarkGlass
                ? 'bg-slate-950/60 border-white/10 text-white'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className={`text-[11px] font-semibold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Current Stock</span>
                <div className="text-lg font-bold">{currentBalance} m</div>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Sale Qty</span>
                <div className={`text-lg font-bold ${isDarkGlass ? 'text-amber-400' : 'text-amber-600'}`}>
                  {numQuantity > 0 ? `-${numQuantity} m` : '0 m'}
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-semibold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>New Balance</span>
                <div
                  className={`text-lg font-black ${
                    isInsufficientStock 
                      ? 'text-rose-400 animate-pulse' 
                      : isDarkGlass ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-emerald-700'
                  }`}
                >
                  {isInsufficientStock ? 'INSUFFICIENT' : `${newBalance.toFixed(1)} m`}
                </div>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold uppercase tracking-wide ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Quantity Sold in Metres (m) <span className="text-rose-400">*</span>
              </label>
              {isInsufficientStock && (
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider animate-pulse">
                  INSUFFICIENT STOCK
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 15.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full p-2.5 pr-10 rounded-lg text-lg font-black focus:outline-none ${
                  isInsufficientStock
                    ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-300'
                    : isDarkGlass
                    ? 'glass-input'
                    : 'border border-slate-300 text-slate-900'
                }`}
                required
              />
              <span className={`absolute right-3 top-3 text-sm font-bold ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>m</span>
            </div>
          </div>

          {/* Sale Date & Invoice Number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Sale Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs font-semibold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800 bg-white'
                }`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Invoice / Receipt # <span className="opacity-60 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="INV-00123"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs font-mono focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Customer Name <span className="opacity-60 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ken Furniture Works"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className={`w-full p-2 rounded-lg text-xs focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800'
              }`}
            />
          </div>

          {/* Staff & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Staff User</label>
              <input
                type="text"
                value={currentUser?.name || 'Staff User'}
                disabled
                className={`w-full p-2 rounded-lg text-xs ${
                  isDarkGlass ? 'bg-slate-950/40 border border-white/5 text-slate-400' : 'border border-slate-200 bg-slate-100 text-slate-600'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Notes <span className="opacity-60 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Walk-in, cash sale"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800'
                }`}
              />
            </div>
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
              disabled={submitting || isInsufficientStock || numQuantity <= 0}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition cursor-pointer ${
                submitting || isInsufficientStock || numQuantity <= 0
                  ? 'bg-slate-600/50 cursor-not-allowed opacity-50'
                  : isDarkGlass
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'SAVE SALE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
