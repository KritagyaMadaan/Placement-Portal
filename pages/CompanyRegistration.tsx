import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { DbService } from '../services/dbService';
import { Company, PlacementDrive } from '../types';
import { BRANCHES } from '../constants';
import { Building, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { ListmonkService } from '../services/listmonkService';

export const CompanyRegistration: React.FC = () => {
  const navigate = useNavigate();

  // Flattened form state for UI simplicity, will split on save
  const [formData, setFormData] = useState({
    name: '',
    hrName: '',
    hrEmail: '',
    password: '',
    role: '',
    ctc: '',
    minCgpa: 0,
    maxBacklogs: 0,
    eligibleBranches: [] as string[],
    deadline: '',
    description: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBranchToggle = (branch: string) => {
    const current = formData.eligibleBranches || [];
    if (current.includes(branch)) {
      setFormData({ ...formData, eligibleBranches: current.filter(b => b !== branch) });
    } else {
      setFormData({ ...formData, eligibleBranches: [...current, branch] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // 1. Create Recruiter Account in Firebase Auth
      const userCredential = await AuthService.signUp(formData.hrEmail, formData.password);
      const fbUser = userCredential.user;
      const companyId = fbUser.uid;

      // 2. Create Company Profile in Firestore
      const newCompany: Company = {
        id: companyId,
        name: formData.name,
        hrName: formData.hrName,
        hrEmail: formData.hrEmail,
        password: formData.password, // Still stored for legacy UI, but Firebase Auth handles auth
        isApproved: false,
        description: formData.description
      };

      // 3. Create Initial Drive in Firestore
      const newDrive: PlacementDrive = {
        id: `d${Date.now()}`,
        companyId: companyId,
        role: formData.role,
        ctc: formData.ctc,
        minCgpa: formData.minCgpa,
        maxBacklogs: formData.maxBacklogs,
        eligibleBranches: formData.eligibleBranches,
        deadline: formData.deadline,
        description: formData.description,
        rounds: ['Aptitude', 'Technical', 'HR'],
        status: 'Open'
      };

      await DbService.saveCompany(newCompany);
      await DbService.saveDrive(newDrive);

      // 4. Automated Mailing Notification via Listmonk
      try {
        await ListmonkService.notifyEligibleStudents(newDrive, newCompany);
      } catch (err) {
        console.error("Listmonk notification failed during registration:", err);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Submitted</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for partnering with NFSU. Your company profile and initial drive have been submitted.
            Once approved by the Admin, you can login to manage multiple drives and applicants.
          </p>
          <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition font-semibold">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition">
        <ArrowLeft size={18} /> Back to Home
      </button>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-10 text-center md:text-left">
          <span className="text-rose-600 font-bold uppercase tracking-wider text-sm">For Recruiters</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Partner Registration</h1>
          <p className="text-gray-500 mt-2">Create your employer account and post your first drive.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Company Info */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b pb-2">
              <Building size={20} className="text-rose-600" />
              Company Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input required type="text" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Name</label>
                <input required type="text" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.hrName} onChange={e => setFormData({ ...formData, hrName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Email (Login ID)</label>
                <input required type="email" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.hrEmail} onChange={e => setFormData({ ...formData, hrEmail: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input required type="password" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none pl-10"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  <Lock className="absolute left-3 top-3 text-gray-400" size={14} />
                </div>
              </div>
            </div>
          </section>

          {/* Initial Drive Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b pb-2">
              <CheckCircle size={20} className="text-rose-600" />
              Initial Drive Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Offered</label>
                <input required type="text" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTC / Stipend</label>
                <input required type="text" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g. 12 LPA"
                  value={formData.ctc} onChange={e => setFormData({ ...formData, ctc: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum CGPA</label>
                <input required type="number" step="0.1" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.minCgpa} onChange={e => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Backlogs Allowed</label>
                <input required type="number" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.maxBacklogs} onChange={e => setFormData({ ...formData, maxBacklogs: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                <input required type="date" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Eligible Branches</label>
              <div className="grid md:grid-cols-2 gap-3">
                {BRANCHES.map(branch => (
                  <label key={branch} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 cursor-pointer transition">
                    <input type="checkbox"
                      checked={formData.eligibleBranches?.includes(branch)}
                      onChange={() => handleBranchToggle(branch)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-5 h-5"
                    />
                    <span className="text-sm font-medium text-gray-700">{branch}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-rose-600 text-white px-10 py-4 rounded-full font-bold hover:bg-rose-700 transition shadow-xl shadow-rose-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Submitting...' : 'Register & Post Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};