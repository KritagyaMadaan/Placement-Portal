import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { DbService } from '../services/dbService';
import { Role, User } from '../types';
import { Lock, Mail, ArrowLeft, Building2 } from 'lucide-react';

export const RecruiterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await AuthService.signIn(email, password);
      const fbUser = userCredential.user;

      // Fetch company data from Firestore
      const companyData = await DbService.getCompany(fbUser.uid);

      if (companyData) {
        if (!companyData.isApproved) {
          setError('Company registration is pending approval.');
          return;
        }

        const user: User = {
          id: companyData.id,
          name: companyData.name,
          email: companyData.hrEmail,
          role: Role.RECRUITER
        };
        sessionStorage.setItem('nfsu_user_session', JSON.stringify(user));
        navigate('/recruiter');
      } else {
        setError('Company profile not found.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials or connection error.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full border border-gray-100 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 transition rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="pt-12 pb-8 px-8 text-center border-b border-gray-100 bg-gray-50">
          <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-rose-600">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Employer Login</h2>
          <p className="text-gray-500 text-sm mt-2">Manage drives & view applicants</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none transition font-medium"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none transition font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{error}</div>}

          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-200 mt-2"
          >
            Login to Dashboard
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Not registered? <span onClick={() => navigate('/register-company')} className="text-rose-600 font-bold cursor-pointer hover:underline">Sign up here</span>
          </p>
        </form>
      </div>
    </div>
  );
};