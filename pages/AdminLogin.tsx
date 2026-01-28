import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { Role, User } from '../types';
import { ShieldCheck, Key, ArrowRight, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // For Admin, we use a fixed email for the "Master Key"
      const email = 'admin@nfsu.ac.in';
      await AuthService.signIn(email, password);

      const adminUser: User = {
        id: 'master_admin',
        name: 'Placement Officer',
        email: email,
        role: Role.ADMIN
      };
      sessionStorage.setItem('nfsu_user_session', JSON.stringify(adminUser));
      navigate('/admin/students');
    } catch (err: any) {
      setError('Access Denied: Incorrect Master Key or Connection Error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 transition rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-900">
          <ShieldCheck size={40} />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Master Access</h2>
        <p className="text-slate-500 text-sm mb-8">Restricted to Placement Cell Officers only.</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Master Key</label>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition font-medium text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            Authenticate <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
