import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Lipping } from '../types';
import { useTheme } from '../context/ThemeContext';

interface EditLippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lipping: Lipping | null;
  onSuccess: () => void;
}

export const EditLippingModal: React.FC<EditLippingModalProps> = ({
  isOpen,
  onClose,
  lipping,
  onSuccess,
}) => {
  const { isDarkGlass } = useTheme();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [openingStock, setOpeningStock] = useState('0');
  const [minStock, setMinStock] = useState('20');
  const [notes, setNotes] = useState('');
  const [isUnrecorded, setIsUnrecorded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lipping) {
      setCode(lipping.code);
      setName(lipping.name);
      setBrand(lipping.brand);
      setMeasurement(lipping.measurement || '22mm x 1mm');
      setOpeningStock(String(lipping.opening_stock));
      setMinStock(String(lipping.minimum_stock));
      setNotes(lipping.notes || '');
      setIsUnrecorded(Boolean(lipping.is_unrecorded));
    }
  }, [lipping]);

  if (!isOpen || !lipping) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const res = await fetch(`/api/lippings/${lipping.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          brand: brand.trim(),
          measurement: measurement.trim(),
          opening_stock: parseFloat(openingStock) || 0,
          minimum_stock: parseFloat(minStock) || 20,
          notes: notes.trim(),
          is_unrecorded: isUnrecorded && parseFloat(openingStock) === 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update lipping');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating lipping');
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
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-amber-400 border border-slate-700'
            }`}>
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Lipping Profile</h2>
              <p className="text-xs text-slate-400">Update code, name, opening stock or minimum threshold</p>
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

          {/* Code & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Lipping Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm font-mono font-bold focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Size / Measurement</label>
              <input
                type="text"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Lipping Name */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Lipping Name / Design</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Brand / Supplier</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-sm focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>

          {/* Opening Stock & Min Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Opening Stock (Metres)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={openingStock}
                  onChange={(e) => {
                    setOpeningStock(e.target.value);
                    if (parseFloat(e.target.value) > 0) setIsUnrecorded(false);
                  }}
                  className={`w-full p-2.5 pr-8 rounded-lg text-base font-bold focus:outline-none ${
                    isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                  }`}
                  required
                />
                <span className={`absolute right-3 top-3 text-xs font-bold ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>m</span>
              </div>
              {isUnrecorded && (
                <span className={`text-[11px] ${isDarkGlass ? 'text-amber-400' : 'text-amber-700'}`}>
                  Marked as not recorded in initial inventory sheet.
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Min Stock Threshold</label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className={`w-full p-2.5 pr-8 rounded-lg text-base font-bold focus:outline-none ${
                    isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                  }`}
                  required
                />
                <span className={`absolute right-3 top-3 text-xs font-bold ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>m</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full p-2 rounded-lg text-xs focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800'
              }`}
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
              <span>{submitting ? 'Updating...' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
