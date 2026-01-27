import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { ListmonkService } from '../services/listmonkService';
import { Company, Application, ApplicationStatus, Student, PlacementDrive, RoundStatus } from '../types';
import { CheckCircle, Clock, AlertTriangle, Lock, Briefcase, FileText, Check, AlertCircle, Building2, Upload, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApplicationTracker } from '../components/ApplicationTracker';

export const StudentDashboard: React.FC = () => {
    const user = StorageService.getCurrentUser();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | undefined>(undefined);
    const [eligibleDrives, setEligibleDrives] = useState<(PlacementDrive & { companyName: string })[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<'drives' | 'applications'>('drives');
    const [viewingApplication, setViewingApplication] = useState<Application | null>(null);

    // Lookup Maps for async data
    const [driveMap, setDriveMap] = useState<Record<string, PlacementDrive>>({});
    const [companyMap, setCompanyMap] = useState<Record<string, Company>>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const [allStudents, allCompanies, allDrives, allApps] = await Promise.all([
                StorageService.getStudents(),
                StorageService.getCompanies(),
                StorageService.getDrives(),
                StorageService.getApplications()
            ]);

            const currentStudent = allStudents.find(s => s.id === user.id);
            setStudent(currentStudent);

            if (currentStudent) {
                // Build maps
                const dMap: Record<string, PlacementDrive> = {};
                allDrives.forEach(d => dMap[d.id] = d);
                setDriveMap(dMap);

                const cMap: Record<string, Company> = {};
                allCompanies.forEach(c => cMap[c.id] = c);
                setCompanyMap(cMap);

                // Filter eligible drives
                const eligible = allDrives
                    .map(drive => {
                        const company = allCompanies.find(c => c.id === drive.companyId);
                        return company ? { ...drive, companyName: company.name, isCompanyApproved: company.isApproved } : null;
                    })
                    .filter((item): item is (PlacementDrive & { companyName: string; isCompanyApproved: boolean }) => item !== null)
                    .filter(d => {
                        return (
                            d.isCompanyApproved &&
                            d.status === 'Open' &&
                            currentStudent.cgpa >= d.minCgpa &&
                            currentStudent.backlogs <= d.maxBacklogs &&
                            d.eligibleBranches.includes(currentStudent.branch) &&
                            new Date(d.deadline) >= new Date()
                        );
                    });

                setEligibleDrives(eligible);
                setMyApplications(allApps.filter(a => a.studentId === currentStudent.id));
            }
        };

        fetchData();
    }, [user]);

    const handleApply = async (drive: PlacementDrive & { companyName: string }) => {
        if (!student) return;

        // Initialize round statuses based on drive rounds
        const roundStatuses: RoundStatus[] = drive.rounds.map((roundName, index) => ({
            roundNumber: index,
            roundName,
            status: 'Pending',
            updatedAt: new Date().toISOString()
        }));

        const newApp: Application = {
            id: `a${Date.now()}`,
            studentId: student.id,
            driveId: drive.id,
            status: ApplicationStatus.APPLIED,
            currentRound: 0,
            roundStatuses,
            appliedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            verified: true
        };
        await StorageService.saveApplication(newApp);
        setMyApplications([...myApplications, newApp]);
        alert(`Successfully applied to ${drive.role} at ${drive.companyName}!`);
    };

    const hasApplied = (driveId: string) => myApplications.some(a => a.driveId === driveId);

    if (!student) return <div className="p-10 text-center text-slate-500">Loading student profile from database...</div>;

    return (
        <div className="space-y-10 font-sans text-slate-900 pb-10">

            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Student Dashboard</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your placement journey and track applications.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
                    <button
                        onClick={() => navigate('/student/profile')}
                        className="text-right hover:opacity-70 transition-opacity"
                    >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resume Status</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                            {student.resumeUrl ? (
                                <span className="flex items-center gap-1.5 font-bold text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                    <FileText size={14} /> Uploaded
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 font-bold text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    <AlertCircle size={14} /> Pending
                                </span>
                            )}
                        </div>
                    </button>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <button
                        onClick={() => navigate('/student/profile')}
                        className="text-right hover:opacity-70 transition-opacity"
                    >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CGPA</p>
                        <span className="font-bold text-slate-900 text-lg">{student.cgpa}</span>
                    </button>
                </div>
            </div>

            {/* Verification Warning */}
            {!student.isVerified && (
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-4 text-amber-900 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Verification Pending</h3>
                        <p className="text-xs mt-1 leading-relaxed opacity-90">
                            Your academic profile is under review by the Placement Cell.
                            You can view eligible drives, but you <strong>cannot apply</strong> until verification is complete.
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('drives')}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'drives' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Open Opportunities <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{eligibleDrives.length}</span>
                    {activeTab === 'drives' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'applications' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    My Applications <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{myApplications.length}</span>
                    {activeTab === 'applications' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
                </button>
            </div>

            {/* Drives Grid */}
            {activeTab === 'drives' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {eligibleDrives.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium">No eligible drives found matching your profile.</p>
                        </div>
                    ) : (
                        eligibleDrives.map(drive => (
                            <div key={drive.id} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative flex flex-col h-full">
                                {!student.isVerified && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Lock size={12} /> Verification Required
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 shadow-inner shrink-0">
                                            {drive.companyName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">{drive.role}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{drive.companyName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 flex-grow">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">{drive.ctc}</span>
                                        <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100">Min CGPA: {drive.minCgpa}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
                                    <span>Deadline</span>
                                    <span>{drive.deadline}</span>
                                </div>

                                {hasApplied(drive.id) ? (
                                    <button disabled className="w-full bg-green-50 text-green-600 border border-green-100 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                                        <Check size={16} /> Applied
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleApply(drive)}
                                        disabled={!student.isVerified}
                                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Applications List */}
            {activeTab === 'applications' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Role & Company</th>
                                <th className="p-5">Applied Date</th>
                                <th className="p-5">Current Status</th>
                                <th className="p-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myApplications.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No applications found.</td></tr>
                            ) : (
                                myApplications.map(app => {
                                    const drive = driveMap[app.driveId];
                                    const company = drive ? companyMap[drive.companyId] : undefined;

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5">
                                                <div className="font-bold text-slate-900">{drive?.role || 'Unknown Role'}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                                    <Building2 size={12} /> {company?.name || 'Unknown Company'}
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm text-slate-500 font-medium">{app.appliedAt}</td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${app.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-700 border-green-200' :
                                                    app.status === ApplicationStatus.REJECTED ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => setViewingApplication(app)}
                                                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition ml-auto"
                                                >
                                                    <Eye size={14} /> View Progress
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Application Progress Modal */}
            {viewingApplication && (() => {
                const drive = driveMap[viewingApplication.driveId];
                const company = drive ? companyMap[drive.companyId] : undefined;

                if (!drive || !company) return null;

                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Application Progress</h2>
                                <button
                                    onClick={() => setViewingApplication(null)}
                                    className="text-slate-400 hover:text-slate-700 transition"
                                >
                                    ✕
                                </button>
                            </div>
                            <ApplicationTracker
                                application={viewingApplication}
                                drive={drive}
                                company={company}
                            />
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};