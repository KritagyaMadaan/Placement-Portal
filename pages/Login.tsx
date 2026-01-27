import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { DbService } from '../services/dbService';
import { Role, User } from '../types';
import { ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const user = StorageService.getCurrentUser();
        if (user && user.role === Role.STUDENT) {
            navigate('/student');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Authenticate with Firebase
            const userCredential = await AuthService.signIn(email, password);
            const fbUser = userCredential.user;

            // 2. Fetch user details from Firestore (assuming ID matches)
            // Note: In a real app, you might store different roles in different collections
            // For now, we search in students collection as this is a student login
            const studentData = await DbService.getStudent(fbUser.uid);

            if (studentData) {
                const user: User = {
                    id: studentData.id,
                    name: studentData.name,
                    email: studentData.email,
                    role: Role.STUDENT
                };
                sessionStorage.setItem('nfsu_user_session', JSON.stringify(user));
                navigate('/student');
            } else {
                // If it's a new firebase user but no profile yet, or login fails
                setError('Profile not found. Please contact admin.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Invalid credentials or connection error.');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">

            {/* LEFT SIDE: Form Section */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 lg:p-20 relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 transition flex items-center gap-2 text-sm font-semibold"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="max-w-md w-full mx-auto">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-8 text-2xl">
                        🎓
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome back</h1>
                    <p className="text-slate-500 mb-10 text-lg">Please enter your student details.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">University Email</label>
                            <input
                                type="email"
                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition font-medium text-slate-900 placeholder-slate-400"
                                placeholder="student@nfsu.ac.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-bold text-slate-700">Password</label>
                                <span className="text-xs font-bold text-rose-600 cursor-pointer hover:text-rose-700">Forgot password?</span>
                            </div>
                            <input
                                type="password"
                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition font-medium text-slate-900 placeholder-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-rose-600 bg-rose-50 px-4 py-3 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-xl shadow-slate-200 active:scale-[0.99] duration-200"
                        >
                            Continue
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Don't have an account? <span onClick={() => navigate('/signup')} className="text-slate-900 font-bold cursor-pointer hover:underline">Sign up</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Visual/Illustration (Hidden on Mobile) */}
            <div className="hidden lg:flex w-[55%] bg-slate-50 relative overflow-hidden items-center justify-center">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter"></div>

                <div className="relative z-10 p-10 text-center">
                    <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png"
                        alt="Secure Login"
                        className="max-w-lg w-full object-contain drop-shadow-2xl mb-8 transform hover:scale-105 transition duration-700"
                    />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Secure Placement Portal</h2>
                    <p className="text-slate-500">Access your placement dashboard safely.</p>
                </div>
            </div>

        </div>
    );
};