import React, { useState, useEffect } from 'react';
import { X, PlusCircle, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { Lipping } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AddLippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddLippingModal: React.FC<AddLippingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isDarkGlass } = useTheme();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customName, setCustomName] = useState('');
  const [brand, setBrand] = useState('Standard');
  const [customBrand, setCustomBrand] = useState('');
  const [measurement, setMeasurement] = useState('22mm x 1mm');
  const [openingStock, setOpeningStock] = useState('0');
  const [unit, setUnit] = useState('m');
  const [minStock, setMinStock] = useState('20');
  const [dateAdded, setDateAdded] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [preservedNames, setPreservedNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/preserved-names')
      .then((res) => res.json())
      .then((data) => {
        if (data.names) {
          setPreservedNames(data.names);
          if (data.names.length > 0 && !name) {
            setName(data.names[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalName = name === 'CUSTOM' ? customName.trim() : name.trim();
    const finalBrand = brand === 'CUSTOM' ? customBrand.trim() : brand.trim();

    if (!code.trim()) {
      setError('Please provide a Lipping Code.');
      return;
    }

    if (!finalName) {
      setError('Please provide or select a Lipping Name / Design.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/lippings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: finalName,
          brand: finalBrand || 'Standard',
          measurement: measurement.trim() || '22mm x 1mm',
          opening_stock: parseFloat(openingStock) || 0,
          minimum_stock: parseFloat(minStock) || 20,
          unit: unit || 'm',
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add lipping');
      }

      // Reset
      setCode('');
      setOpeningStock('0');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating lipping');
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
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add New Lipping Profile</h2>
              <p className="text-xs text-slate-400">Catalogue a new design into Mabri inventory</p>
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

          {/* Lipping Code & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Lipping Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 37.8-15"
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
                placeholder="22mm x 1mm"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Lipping Name / Design */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Lipping Name / Design <span className="text-rose-400">*</span>
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:outline-none ${
                isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-800 bg-white'
              }`}
            >
              {preservedNames.map((n) => (
                <option key={n} value={n} className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>
                  {n}
                </option>
              ))}
              <option value="CUSTOM" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>+ Enter Custom Name...</option>
            </select>

            {name === 'CUSTOM' && (
              <input
                type="text"
                placeholder="Enter custom design name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className={`w-full mt-2 p-2 rounded-lg text-sm focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                }`}
                required
              />
            )}
          </div>

          {/* Brand / Supplier */}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Brand / Supplier</label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {['Standard', 'Fairdeal', 'Comply', 'Double Lipping'].map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`py-1.5 px-2 rounded-lg border font-semibold transition cursor-pointer ${
                    brand === b
                      ? isDarkGlass
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : isDarkGlass
                      ? 'border-white/10 text-slate-300 hover:bg-white/[0.06]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {brand === 'CUSTOM' ? (
              <input
                type="text"
                placeholder="Custom Supplier"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                className={`w-full mt-2 p-2 rounded-lg text-xs ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300'
                }`}
              />
            ) : (
              <button
                type="button"
                onClick={() => setBrand('CUSTOM')}
                className={`text-[11px] mt-1 font-medium cursor-pointer ${
                  isDarkGlass ? 'text-amber-400 hover:underline' : 'text-blue-600 hover:underline'
                }`}
              >
                + Other supplier
              </button>
            )}
          </div>

          {/* Opening Stock & Min Stock Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Opening Stock (Metres)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(e.target.value)}
                  className={`w-full p-2.5 pr-8 rounded-lg text-base font-bold focus:outline-none ${
                    isDarkGlass ? 'glass-input' : 'border border-slate-300 text-slate-900'
                  }`}
                  required
                />
                <span className={`absolute right-3 top-3 text-xs font-bold ${isDarkGlass ? 'text-slate-400' : 'text-slate-400'}`}>m</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Min Stock Alert Level</label>
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
            <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Notes <span className="opacity-60 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Thickness, grain texture, rack position"
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
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Adding...' : 'ADD LIPPING'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
