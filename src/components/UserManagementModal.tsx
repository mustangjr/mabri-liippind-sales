import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Trash2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { isDarkGlass } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !username || !password) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setName('');
      setUsername('');
      setPassword('');
      setShowAddForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own active account.');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">User & Staff Management</h2>
              <p className="text-xs text-slate-400">Configure Admin and Store Staff access permissions</p>
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

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wide ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Active Store Accounts ({users.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                isDarkGlass
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : '+ New User'}</span>
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <form onSubmit={handleAddUser} className={`rounded-xl p-4 space-y-3 border ${
              isDarkGlass ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-bold">Add New System User</div>
              {error && (
                <div className="text-xs text-rose-300 bg-rose-500/15 p-2 rounded border border-rose-500/30">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[11px] font-bold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-2 rounded text-xs focus:outline-none ${
                      isDarkGlass ? 'glass-input' : 'border border-slate-300 bg-white'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>Username</label>
                  <input
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full p-2 rounded text-xs focus:outline-none ${
                      isDarkGlass ? 'glass-input' : 'border border-slate-300 bg-white'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[11px] font-bold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2 rounded text-xs focus:outline-none ${
                      isDarkGlass ? 'glass-input' : 'border border-slate-300 bg-white'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase ${isDarkGlass ? 'text-slate-400' : 'text-slate-600'}`}>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full p-2 rounded text-xs focus:outline-none font-semibold ${
                      isDarkGlass ? 'glass-input' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    <option value="staff" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Staff (Sales & View)</option>
                    <option value="admin" className={isDarkGlass ? 'bg-slate-900 text-white' : ''}>Admin (Full Control)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isDarkGlass
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Create User
                </button>
              </div>
            </form>
          )}

          {/* User List */}
          <div className={`divide-y max-h-64 overflow-y-auto ${
            isDarkGlass ? 'divide-white/5' : 'divide-slate-100'
          }`}>
            {users.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      u.role === 'admin'
                        ? isDarkGlass ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                        : isDarkGlass ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {u.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>{u.name}</div>
                    <div className={`text-[11px] font-mono ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>@{u.username}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      u.role === 'admin'
                        ? isDarkGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
                        : isDarkGlass ? 'bg-slate-800 text-slate-300 border border-white/10' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {u.role}
                  </span>

                  {users.length > 1 && u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className={`p-1 transition cursor-pointer ${
                        isDarkGlass ? 'text-slate-400 hover:text-rose-400' : 'text-slate-400 hover:text-red-600'
                      }`}
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={`pt-3 border-t flex justify-end ${isDarkGlass ? 'border-white/10' : 'border-slate-200'}`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                isDarkGlass
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
