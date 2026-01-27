import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Student } from '../types';
import { User, BookOpen, FileText, Upload, Check, AlertCircle, ArrowLeft, Mail, AlertOctagon, Download, Eye, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentProfile: React.FC = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [dataError, setDataError] = useState(false);

    // Editable Form States
    const [name, setName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [course, setCourse] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState(2025);
    const [cgpa, setCgpa] = useState(0);
    const [backlogs, setBacklogs] = useState(0);
    const [skills, setSkills] = useState('');
    const [certifications, setCertifications] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const currentUser = StorageService.getCurrentUser();

            if (!currentUser) {
                navigate('/login');
                return;
            }

            const currentStudent = await StorageService.getStudent(currentUser.id);

            if (currentStudent) {
                setStudent(currentStudent);
                setName(currentStudent.name || '');
                setRollNo(currentStudent.rollNo || '');
                setCourse(currentStudent.course || '');
                setBranch(currentStudent.branch || '');
                setYear(currentStudent.year || 2025);
                setCgpa(currentStudent.cgpa || 0);
                setBacklogs(currentStudent.backlogs || 0);
                setSkills(currentStudent.skills?.join(', ') || '');
                setCertifications(currentStudent.certifications?.join(', ') || '');
                setLoading(false);
                setDataError(false);
            } else {
                // If ID exists in session but not in DB, something is out of sync
                console.warn(`User ID ${currentUser.id} not found in students list.`);
                setDataError(true);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                setErrorMsg("File too large. Max 2MB.");
                return;
            }
            if (file.type !== 'application/pdf') {
                setErrorMsg("Only PDF files are allowed.");
                return;
            }
            setResumeFile(file);
            setErrorMsg('');
        }
    };

    const handleSave = async () => {
        if (!student) return;
        setIsSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const updatedStudent: Student = {
                ...student,
                name,
                rollNo,
                course,
                branch,
                year,
                cgpa,
                backlogs,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
                certifications: certifications.split(',').map(s => s.trim()).filter(Boolean),
                lastUpdated: new Date().toISOString()
            };

            if (resumeFile) {
                updatedStudent.resumeUrl = 'uploaded';
                updatedStudent.resumeFileName = resumeFile.name;
                updatedStudent.resumeUploadedAt = new Date().toISOString();
            }

            await StorageService.saveStudent(updatedStudent);
            setStudent(updatedStudent);
            setResumeFile(null);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setErrorMsg("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-slate-500 font-medium">Loading profile...</div></div>;

    if (dataError || !student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold mt-4">Go Home</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2">
            <button onClick={() => navigate('/student')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-4 font-bold">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Profile Section</h1>
                        <p className="text-slate-500">Official academic and professional record.</p>
                    </div>
                    {student.isVerified ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200">
                            <Check size={16} /> Verified
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold border border-amber-200">
                            <AlertCircle size={16} /> Pending Verification
                        </div>
                    )}
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={16} className="text-slate-900" /> Identity
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name (Editable)</label>
                                    <input
                                        type="text"
                                        className="w-full font-bold text-slate-900 text-lg bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Official Email (Read-only)</label>
                                    <div className="font-medium text-slate-400 flex items-center gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100 italic">
                                        <Mail size={14} /> {student.email}
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1">Email cannot be changed for security reasons.</p>
                                </div>
                            </div>
                        </div>

                        {/* Academic Specs */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <BookOpen size={16} className="text-slate-900" /> Academic Specs
                            </h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Roll Number</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm font-bold font-mono bg-white p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                                            value={rollNo}
                                            onChange={(e) => setRollNo(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Course</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm font-bold bg-white p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                                            value={course}
                                            onChange={(e) => setCourse(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Branch</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm font-bold bg-white p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Passing Year</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm font-bold bg-white p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CGPA</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full text-lg font-black text-rose-600 bg-white p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                                            value={cgpa}
                                            onChange={(e) => setCgpa(parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Backlogs</label>
                                        <input
                                            type="number"
                                            className={`w-full text-sm font-bold bg-white p-2.5 rounded-xl border border-slate-200 focus:ring-2 ${backlogs > 0 ? 'focus:ring-red-500 text-red-600' : 'focus:ring-green-500 text-green-600'}`}
                                            value={backlogs}
                                            onChange={(e) => setBacklogs(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Technical Skills</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="Python, Java, Forensic Tools..."
                                />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Comma separated items</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Certifications</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
                                    value={certifications}
                                    onChange={(e) => setCertifications(e.target.value)}
                                    placeholder="CEH, AWS, CISSP..."
                                />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Comma separated items</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Resume Section */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                                <FileText size={18} /> Professional Resume
                            </h3>

                            <div className="relative z-10">
                                {student.resumeUrl ? (
                                    <div className="mb-8 p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl border border-green-500/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <FileText size={20} className="text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Resume Uploaded</p>
                                                <p className="text-sm font-bold text-white mt-0.5">{student.resumeFileName || 'resume.pdf'}</p>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            Uploaded on {student.resumeUploadedAt || 'N/A'}
                                        </div>
                                        <div className="mt-3 text-xs text-slate-400 italic">
                                            Note: File stored securely. Download feature available in production.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-center text-slate-400">
                                        No resume attached to profile yet.
                                    </div>
                                )}

                                <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition cursor-pointer group">
                                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload size={24} className="text-slate-400 group-hover:text-white transition group-hover:scale-110 duration-300" />
                                        <span className="font-bold text-sm text-slate-300">Click to {student.resumeUrl ? 'Update' : 'Upload'} PDF</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Max size 2MB</span>
                                    </div>
                                    {resumeFile && (
                                        <div className="mt-4 text-xs font-bold text-green-400 bg-green-400/10 py-1 px-3 rounded-full inline-block">
                                            Selected: {resumeFile.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decorative background */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* Save Actions */}
                        <div className="pt-4">
                            {successMsg && <div className="text-green-600 text-sm font-bold mb-4 flex items-center gap-2 animate-in slide-in-from-left-2"><Check size={18} /> {successMsg}</div>}
                            {errorMsg && <div className="text-rose-600 text-sm font-bold mb-4 flex items-center gap-2"><AlertCircle size={18} /> {errorMsg}</div>}

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-200 hover:bg-slate-800 transition transform active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSaving ? 'Processing Update...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};