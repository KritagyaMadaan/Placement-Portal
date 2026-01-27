import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { DbService } from '../services/dbService';
import { Student } from '../types';
import { BRANCHES } from '../constants';
import { UserPlus, ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import { ListmonkService } from '../services/listmonkService';

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
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit for LocalStorage safety
                setError("File size too large. Max 2MB allowed for local storage.");
                return;
            }
            setResumeFile(file);
            setError('');
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match.');
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
                resumeUrl: resumeFile ? 'uploaded' : undefined,
                resumeFileName: resumeFile ? resumeFile.name : undefined,
                resumeUploadedAt: resumeFile ? new Date().toLocaleDateString() : undefined,
                isVerified: false,
                isBlacklisted: false
            };

            // 3. Save to Firestore
            await DbService.saveStudent(newStudent);

            // 4. Send welcome email via Listmonk
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative group bg-gray-50">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-gray-700 transition">
                                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition">
                                            <Upload size={20} />
                                        </div>
                                        <span className="font-medium text-gray-900 text-sm">
                                            {resumeFile ? resumeFile.name : "Click to upload resume"}
                                        </span>
                                        <span className="text-xs">PDF only (Max 2MB)</span>
                                    </div>
                                </div>
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