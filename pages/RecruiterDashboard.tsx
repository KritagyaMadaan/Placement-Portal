import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { ListmonkService } from '../services/listmonkService';
import { ApplicationStatus, PlacementDrive, Company, Application, Student } from '../types';
import { Users, FileText, Download, Filter, Plus, Briefcase, Calendar, DollarSign, X } from 'lucide-react';
import { BRANCHES } from '../constants';

export const RecruiterDashboard: React.FC = () => {
    const user = StorageService.getCurrentUser();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [allDrives, setAllDrives] = useState<PlacementDrive[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [myCompany, setMyCompany] = useState<Company | undefined>(undefined);
    const [myDrives, setMyDrives] = useState<PlacementDrive[]>([]);

    const [activeTab, setActiveTab] = useState<'drives' | 'applicants'>('drives');
    const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const [c, d, a, s] = await Promise.all([
                StorageService.getCompanies(),
                StorageService.getDrives(),
                StorageService.getApplications(),
                StorageService.getStudents()
            ]);

            setCompanies(c);
            setAllDrives(d);
            setApplications(a);
            setStudents(s);

            const comp = c.find(item => item.id === user.id);
            setMyCompany(comp);
            if (comp) {
                setMyDrives(d.filter(drive => drive.companyId === comp.id));
            }
        };
        fetchData();
    }, [user]);

    // New Drive State
    const [newDrive, setNewDrive] = useState<Partial<PlacementDrive>>({
        role: '', ctc: '', minCgpa: 0, maxBacklogs: 0, eligibleBranches: [], deadline: '', status: 'Open'
    });

    // Filtering
    const [filterStatus, setFilterStatus] = useState('');

    const getApplicantsForDrive = (driveId: string) => applications.filter(a => a.driveId === driveId);

    // Derived List for Applicants Table
    const selectedDriveApplications = selectedDriveId
        ? getApplicantsForDrive(selectedDriveId).filter(app => !filterStatus || app.status === filterStatus)
        : [];

    const handleCreateDrive = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!myCompany) return;

        const drive: PlacementDrive = {
            ...newDrive as PlacementDrive,
            id: `d${Date.now()}`,
            companyId: myCompany.id,
            rounds: ['Aptitude', 'Technical', 'HR'],
            description: `Drive for ${newDrive.role}`
        };
        await StorageService.saveDrive(drive);

        // Send email notifications to eligible students via Listmonk
        const result = await ListmonkService.notifyEligibleStudents(drive, myCompany);

        alert(`Drive published successfully!\n${result.count} eligible students have been notified via Listmonk.`);

        setIsCreateModalOpen(false);
        setNewDrive({ role: '', ctc: '', minCgpa: 0, maxBacklogs: 0, eligibleBranches: [], deadline: '', status: 'Open' });

        // Refresh data
        window.location.reload();
    };

    const handleBranchToggle = (branch: string) => {
        const current = newDrive.eligibleBranches || [];
        if (current.includes(branch)) {
            setNewDrive({ ...newDrive, eligibleBranches: current.filter(b => b !== branch) });
        } else {
            setNewDrive({ ...newDrive, eligibleBranches: [...current, branch] });
        }
    };

    const exportData = () => {
        const rows = selectedDriveApplications.map(app => {
            const student = students.find(s => s.id === app.studentId);
            return [student?.name, student?.email, student?.branch, student?.cgpa, app.status].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8,Name,Email,Branch,CGPA,Status\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "applicants.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!myCompany) return <div className="p-10 text-center text-slate-500">Access Denied Or Loading...</div>;

    return (
        <div className="space-y-8 font-sans text-slate-900 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">{myCompany.name} • HR Portal</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> New Drive
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => { setActiveTab('drives'); setSelectedDriveId(null); }}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'drives' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    My Drives <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{myDrives.length}</span>
                    {activeTab === 'drives' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
                </button>
                <button
                    onClick={() => setActiveTab('applicants')}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'applicants' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    View Applicants
                    {activeTab === 'applicants' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
                </button>
            </div>

            {/* Drives List */}
            {activeTab === 'drives' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    {myDrives.map(drive => (
                        <div key={drive.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition shadow-sm hover:shadow-md group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Briefcase size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${drive.status === 'Open' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {drive.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{drive.role}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 mb-6">
                                <span className="flex items-center gap-1"><DollarSign size={14} /> {drive.ctc}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {drive.deadline}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-400 uppercase">{getApplicantsForDrive(drive.id).length} Applicants</span>
                                <button
                                    onClick={() => { setSelectedDriveId(drive.id); setActiveTab('applicants'); }}
                                    className="text-sm font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 transition"
                                >
                                    View Candidates <FileText size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {myDrives.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No drives posted yet. Click "New Drive" to start.
                        </div>
                    )}
                </div>
            )}

            {/* Applicants View */}
            {activeTab === 'applicants' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <select
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none w-full md:w-64"
                                value={selectedDriveId || ''}
                                onChange={(e) => setSelectedDriveId(e.target.value)}
                            >
                                <option value="" disabled>Select a Drive</option>
                                {myDrives.map(d => <option key={d.id} value={d.id}>{d.role} ({getApplicantsForDrive(d.id).length})</option>)}
                            </select>

                            <div className="relative w-full md:w-auto">
                                <select
                                    className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer hover:bg-slate-50 transition w-full"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>

                        {selectedDriveId && (
                            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm w-full md:w-auto justify-center">
                                <Download size={14} /> Export CSV
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        {!selectedDriveId ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Filter size={48} className="mb-4 opacity-20" />
                                <p>Select a drive to view applicants</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5">Candidate Name</th>
                                        <th className="p-5">Academic Profile</th>
                                        <th className="p-5">Applied At</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Resume</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedDriveApplications.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-medium">No candidates matching filters.</td></tr>
                                    ) : (
                                        selectedDriveApplications.map(app => {
                                            const student = students.find(s => s.id === app.studentId);
                                            return (
                                                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-5">
                                                        <div className="font-bold text-slate-900">{student?.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5 font-medium">{student?.email}</div>
                                                    </td>
                                                    <td className="p-5 text-sm">
                                                        <div className="text-slate-700 font-medium">{student?.branch}</div>
                                                        <div className="text-slate-400 text-xs mt-1">CGPA: <span className="font-mono text-slate-600 font-bold">{student?.cgpa}</span></div>
                                                    </td>
                                                    <td className="p-5 text-sm font-mono text-slate-500">{app.appliedAt}</td>
                                                    <td className="p-5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${app.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-700 border-green-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        {student?.resumeUrl ? (
                                                            <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold">View PDF</a>
                                                        ) : <span className="text-slate-400 text-xs">No Resume</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Create Drive Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Post New Drive</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateDrive} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
                                    <input required className="w-full border p-2.5 rounded-lg bg-slate-50" value={newDrive.role} onChange={e => setNewDrive({ ...newDrive, role: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTC / Stipend</label>
                                    <input required className="w-full border p-2.5 rounded-lg bg-slate-50" value={newDrive.ctc} onChange={e => setNewDrive({ ...newDrive, ctc: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA</label>
                                    <input required type="number" step="0.1" className="w-full border p-2.5 rounded-lg bg-slate-50" value={newDrive.minCgpa} onChange={e => setNewDrive({ ...newDrive, minCgpa: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Backlogs</label>
                                    <input required type="number" className="w-full border p-2.5 rounded-lg bg-slate-50" value={newDrive.maxBacklogs} onChange={e => setNewDrive({ ...newDrive, maxBacklogs: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input required type="date" className="w-full border p-2.5 rounded-lg bg-slate-50" value={newDrive.deadline} onChange={e => setNewDrive({ ...newDrive, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Eligible Branches</label>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {BRANCHES.map(branch => (
                                        <label key={branch} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input type="checkbox" checked={newDrive.eligibleBranches?.includes(branch)} onChange={() => handleBranchToggle(branch)} className="w-4 h-4 text-slate-900" />
                                            <span className="text-sm font-medium text-gray-700">{branch}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition">Publish Drive</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};