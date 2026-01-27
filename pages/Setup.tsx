import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Admin } from '../types';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const newAdmin: Admin = {
      id: `admin_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    StorageService.saveAdmin(newAdmin);
    alert("System Initialized. You can now login as Admin.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">System Setup</h1>
          <p className="text-gray-500 text-sm mt-2">Initialize the NFSU Placement Portal by creating the Master Admin account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <input 
              required type="email" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Master Password</label>
            <input 
              required type="password" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              required type="password" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
            Create Admin & Launch <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};