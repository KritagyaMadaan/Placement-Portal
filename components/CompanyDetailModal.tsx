import React from 'react';
import { Company, PlacementDrive, Application, Student } from '../types';
import { X, Building2, Mail, User, Calendar, DollarSign, Users, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface CompanyDetailModalProps {
    company: Company;
    drives: PlacementDrive[];
    allApplications: Application[];
    students: Student[];
    onClose: () => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
    company,
    drives,
    allApplications,
    students,
    onClose
}) => {
    // Get applications for this company's drives
    const companyApplications = allApplications.filter(app =>
        drives.some(drive => drive.id === app.driveId)
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 rounded-t-2xl text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Building2 size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{company.name}</h2>
                                <p className="text-blue-200 text-sm font-medium">Company Profile</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-2">
                        {company.isApproved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                <CheckCircle size={14} /> Approved
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
                                <XCircle size={14} /> Pending Approval
                            </span>
                        )}
                    </div>

                    {/* Company Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Company Details</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Building2 size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Company Name</p>
                                        <p className="text-sm font-bold text-slate-900">{company.name}</p>
                                    </div>
                                </div>

                                {company.description && (
                                    <div className="flex items-start gap-3">
                                        <Briefcase size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Description</p>
                                            <p className="text-sm text-slate-700">{company.description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">HR Contact</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">HR Name</p>
                                        <p className="text-sm font-bold text-slate-900">{company.hrName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">HR Email</p>
                                        <p className="text-sm font-bold text-slate-900 break-all">{company.hrEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{drives.length}</p>
                            <p className="text-xs text-blue-700 font-medium mt-1">Total Drives</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{companyApplications.length}</p>
                            <p className="text-xs text-green-700 font-medium mt-1">Applications</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {companyApplications.filter(app => app.status === 'Selected').length}
                            </p>
                            <p className="text-xs text-purple-700 font-medium mt-1">Selected</p>
                        </div>
                    </div>

                    {/* Placement Drives */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Placement Drives</h3>
                        {drives.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No drives created yet</p>
                        ) : (
                            <div className="space-y-3">
                                {drives.map(drive => {
                                    const driveApplications = allApplications.filter(app => app.driveId === drive.id);
                                    return (
                                        <div key={drive.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">{drive.role}</h4>
                                                    <p className="text-sm text-slate-600 mt-1">{drive.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${drive.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {drive.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">CTC</p>
                                                        <p className="text-sm font-bold text-slate-900">{drive.ctc}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">Deadline</p>
                                                        <p className="text-sm font-bold text-slate-900">{drive.deadline}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">Applications</p>
                                                        <p className="text-sm font-bold text-slate-900">{driveApplications.length}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-slate-400" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">Min CGPA</p>
                                                        <p className="text-sm font-bold text-slate-900">{drive.minCgpa}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Eligible Branches */}
                                            <div className="mt-3">
                                                <p className="text-xs text-slate-500 mb-2">Eligible Branches:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {drive.eligibleBranches.map((branch, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700">
                                                            {branch}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Rounds */}
                                            {drive.rounds && drive.rounds.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-500 mb-2">Selection Rounds:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {drive.rounds.map((round, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-medium text-blue-700">
                                                                {round}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Applications */}
                    {companyApplications.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Applications</h3>
                            <div className="space-y-2">
                                {drives.flatMap(drive => allApplications.filter(app => app.driveId === drive.id)).slice(0, 5).map(app => {
                                    const student = students.find(s => s.id === app.studentId);
                                    const drive = drives.find(d => d.id === app.driveId);
                                    return (
                                        <div key={app.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{student?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">{drive?.role} • Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    );
                                })}
                                {companyApplications.length > 5 && (
                                    <p className="text-xs text-slate-500 text-center italic">
                                        +{companyApplications.length - 5} more applications
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
