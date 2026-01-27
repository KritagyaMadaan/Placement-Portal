import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bell, Building2, Calendar, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Notice, Event } from '../types';

export const LandingPage: React.FC = () => {
    const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // Load latest notice
            const notices = await StorageService.getActiveNotices();
            if (notices.length > 0) {
                setLatestNotice(notices[0]); // Most recent
            }

            // Load upcoming events (max 2)
            const events = await StorageService.getActiveEvents();
            setUpcomingEvents(events.slice(0, 2));
        };
        fetchData();
    }, []);

    return (
        <div className="flex flex-col min-h-[85vh] font-sans text-slate-900">
            {/* Hero Section - TimesJobs Aesthetic */}
            <section className="bg-white pt-20 pb-28 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 text-left animate-in slide-in-from-left-10 duration-700">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold tracking-widest uppercase mb-8">
                            Official Placement Portal
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-8 text-slate-900">
                            Launch Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600">Forensic Career</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-lg leading-relaxed mb-10 font-medium">
                            Connecting NFSU Dharwad's elite talent with global security agencies, forensic labs, and top-tier recruiters.
                        </p>

                        {/* Trust Badges - Pill Style */}
                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                            <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <ShieldCheck size={18} className="text-green-500" /> Admin Verified
                            </span>
                            <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Building2 size={18} className="text-blue-500" /> Top Recruiters
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 relative animate-in slide-in-from-right-10 duration-700 delay-100">
                        {/* 3D Illustration */}
                        <div className="relative z-10">
                            <img
                                src="https://cdni.iconscout.com/illustration/premium/thumb/job-search-2537380-2146476.png"
                                alt="Placement Illustration"
                                className="w-full max-w-xl object-contain drop-shadow-2xl"
                            />
                        </div>
                        {/* Decorative Background Blur */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Content Cards - Dribbble "IndiUni" Style */}
            <section className="bg-slate-50 py-24 px-6 relative">
                {/* Decorative curve at top */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent"></div>

                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Placement Updates</h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Latest Notice Card */}
                        <div className="group bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 flex flex-col">
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                                <Bell size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Latest Notice</h3>
                            {latestNotice ? (
                                <>
                                    <p className="text-slate-500 leading-relaxed mb-8 text-sm flex-grow">
                                        <strong>{latestNotice.title}</strong><br />
                                        {latestNotice.description}
                                    </p>
                                    <div className="border-t border-slate-50 pt-4 flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                        <Calendar size={14} /> {new Date(latestNotice.postedAt).toLocaleDateString()}
                                    </div>
                                </>
                            ) : (
                                <p className="text-slate-400 leading-relaxed mb-8 text-sm flex-grow italic">
                                    No notices posted yet. Check back later for updates!
                                </p>
                            )}
                        </div>

                        {/* Schedule Card */}
                        <div className="group bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 flex flex-col">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Calendar size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Events</h3>

                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-6 flex-grow">
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="flex items-center gap-4">
                                            <div className="bg-slate-50 rounded-lg p-2 min-w-[50px] text-center border border-slate-100">
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase">{event.month}</span>
                                                <span className="block text-lg font-bold text-slate-900">{event.day}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                                                <p className="text-xs text-slate-500">{event.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm italic flex-grow">
                                    No upcoming events scheduled. Stay tuned!
                                </p>
                            )}
                        </div>

                        {/* Instructions Card (Dark) */}
                        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden flex flex-col">
                            <div className="relative z-10 flex-grow">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                                    <AlertCircle size={26} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-6">Critical Instructions</h3>
                                <ul className="space-y-4 text-slate-300 text-sm leading-relaxed">
                                    <li className="flex gap-3 items-start">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0"></span>
                                        <span>Register using official <strong>NFSU email ID</strong> only.</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0"></span>
                                        <span>Upload resume in <strong>PDF format</strong> (Max 2MB).</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0"></span>
                                        <span>Wait for admin <strong>verification</strong> before applying.</span>
                                    </li>
                                </ul>
                            </div>
                            {/* Abstract Decorative Blur */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-600 rounded-full blur-3xl opacity-20"></div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};