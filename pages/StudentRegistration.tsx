import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { DbService } from '../services/dbService';
import { Student } from '../types';
import { BRANCHES } from '../constants';
import { ListmonkService } from '../services/listmonkService';
import { Link2, UserPlus, ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';

export const StudentRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        email: '',
        password: '',
        rollNo: '',
        course: 'M.Sc',
        branch: BRANCHES[0],
        year: 2025,
        cgpa: 0,
        backlogs: 0,
        skills: [],
        certifications: []
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [skillsInput, setSkillsInput] = useState('');
    const [certsInput, setCertsInput] = useState('');
    const [resumeLink, setResumeLink] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsProcessing(false);
            return;
        }

        if (!formData.email?.toLowerCase().endsWith('@nfsu.ac.in')) {
            setError('Student registration is only allowed with official @nfsu.ac.in email address.');
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Create User in Firebase Auth
            const userCredential = await AuthService.signUp(formData.email!, formData.password!);
            const fbUser = userCredential.user;

            // 2. Prepare Student Profile with Firebase UID
            const newStudent: Student = {
                ...formData as Student,
                id: fbUser.uid, // Use Firebase UID as the document ID
                skills: skillsInput.split(',').map(s => s.trim()).filter(s => s),
                certifications: certsInput.split(',').map(s => s.trim()).filter(s => s),
                resumeUrl: resumeLink || undefined,
                resumeFileName: resumeLink ? 'Google Drive Resume' : undefined,
                resumeUploadedAt: resumeLink ? new Date().toISOString() : undefined,
                isVerified: false,
                isBlacklisted: false
            };

            // 4. Save to Firestore
            await DbService.saveStudent(newStudent);

            // 5. Send welcome email via Listmonk
            await ListmonkService.sendStudentWelcomeEmail(newStudent);

            alert('Registration Successful! A welcome email has been sent to your registered address.');
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Account with this email already exists.');
            } else {
                setError(err.message || "Failed to save registration data.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition">
                <ArrowLeft size={18} /> Back to Home
            </button>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 text-white p-8">
                    <div className="w-12 h-12 bg-rose-600 rounded-lg flex items-center justify-center mb-4 text-white">
                        <UserPlus size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">Student Registration</h1>
                    <p className="text-gray-400 mt-1">Create your official placement profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Account Info */}
                    <div>
                        <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Account Credentials</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required type="text" className="w-full border-gray-200 border p-2.5 rounded focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Official Email ID</label>
                                <input required type="email" className="w-full border-gray-200 border p-2.5 rounded focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input required type="password" className="w-full border-gray-200 border p-2.5 rounded focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input required type="password" className="w-full border-gray-200 border p-2.5 rounded focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div>
                        <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Academic Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                <input required type="text" className="w-full border-gray-200 border p-2.5 rounded focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                                    value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                <select className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}>
                                    <option>M.Sc</option>
                                    <option>B.Tech</option>
                                    <option>MBA</option>
                                    <option>M.Tech</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                <select className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year</label>
                                <input required type="number" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA (Current)</label>
                                <input required type="number" step="0.01" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Active Backlogs</label>
                                <input required type="number" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={formData.backlogs} onChange={e => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                    </div>

                    {/* Skills & Resume */}
                    <div>
                        <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Professional Profile</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                                <input type="text" placeholder="Python, Java, Forensics, Networking" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={skillsInput} onChange={e => setSkillsInput(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (Comma separated)</label>
                                <input type="text" placeholder="CEH, CISSP, CCNA" className="w-full border-gray-200 border p-2.5 rounded bg-gray-50"
                                    value={certsInput} onChange={e => setCertsInput(e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resume link (Google Drive)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-2.5 text-gray-400">
                                        <Link2 size={18} />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://drive.google.com/..."
                                        className="w-full border-gray-200 border p-2.5 pl-10 rounded focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                                        value={resumeLink}
                                        onChange={e => setResumeLink(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 italic">Make sure the link is set to "Anyone with the link can view"</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded text-sm font-medium border border-red-100">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-rose-600 text-white py-4 rounded-lg font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-200 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Saving Profile...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
