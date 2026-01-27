import React from 'react';
import { Student, Application, PlacementDrive, Company } from '../types';
import { X, Mail, Phone, Award, BookOpen, FileText, Download, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface StudentDetailModalProps {
    student: Student;
    applications: Application[];
    drives: PlacementDrive[];
    companies: Company[];
    onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    student,
    applications,
    drives,
    companies,
    onClose
}) => {

    const handleResumeView = () => {
        if (student.resumeUrl) {
            window.open(student.resumeUrl, '_blank');
        }
    };

    const handleResumeDownload = () => {
        if (student.resumeUrl) {
            const link = document.createElement('a');
            link.href = student.resumeUrl;
            link.download = student.resumeFileName || `${student.name}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-6 rounded-t-2xl text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                            <p className="text-slate-300 text-sm font-medium">{student.rollNo}</p>
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
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                        {student.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                <CheckCircle size={14} /> Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
                                <XCircle size={14} /> Pending Verification
                            </span>
                        )}
                        {student.isBlacklisted && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                <XCircle size={14} /> Blacklisted
                            </span>
                        )}
                        {student.placedCompanyId && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                <CheckCircle size={14} /> Placed
                            </span>
                        )}
                    </div>

                    {/* Academic Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Academic Details</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <BookOpen size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Course & Branch</p>
                                        <p className="text-sm font-bold text-slate-900">{student.course} - {student.branch}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Year</p>
                                        <p className="text-sm font-bold text-slate-900">{student.year}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Award size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">CGPA</p>
                                        <p className="text-sm font-bold text-slate-900">{(student.cgpa || 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <XCircle size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Backlogs</p>
                                        <p className="text-sm font-bold text-slate-900">{student.backlogs || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Contact Information</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Mail size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Email</p>
                                        <p className="text-sm font-bold text-slate-900 break-all">{student.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {student.skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {student.certifications && student.certifications.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Certifications</h3>
                            <div className="space-y-2">
                                {student.certifications.map((cert, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                        <Award size={14} className="text-slate-400" />
                                        <span>{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resume Section */}
                    {student.resumeUrl && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Resume</h3>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                                            <FileText size={24} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{student.resumeFileName || 'Resume.pdf'}</p>
                                            {student.resumeUploadedAt && (
                                                <p className="text-xs text-slate-500">Uploaded: {new Date(student.resumeUploadedAt).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleResumeView}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                                        >
                                            <ExternalLink size={14} /> View
                                        </button>
                                        <button
                                            onClick={handleResumeDownload}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                                        >
                                            <Download size={14} /> Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Application History</h3>
                        {applications.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No applications yet</p>
                        ) : (
                            <div className="space-y-2">
                                {applications.map(app => {
                                    const drive = drives.find(d => d.id === app.driveId);
                                    const company = companies.find(c => c.id === drive?.companyId);
                                    return (
                                        <div key={app.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-900">{company?.name || 'Unknown Company'}</p>
                                                    <p className="text-sm text-slate-600">{drive?.role || 'N/A'}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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
