import React, { useState } from 'react';
import { Application, RoundStatus, Student, PlacementDrive, Company, ApplicationStatus } from '../types';
import { StorageService } from '../services/storageService';
import { Calendar, MessageSquare, Save, X, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ApplicationManagerProps {
    application: Application;
    student: Student;
    drive: PlacementDrive;
    company: Company;
    onUpdate: () => void;
    onClose: () => void;
}

export const ApplicationManager: React.FC<ApplicationManagerProps> = ({
    application,
    student,
    drive,
    company,
    onUpdate,
    onClose
}) => {
    const [selectedRound, setSelectedRound] = useState(application.currentRound);
    const [roundStatus, setRoundStatus] = useState<RoundStatus['status']>(
        application.roundStatuses[selectedRound]?.status || 'Pending'
    );
    const [scheduledDate, setScheduledDate] = useState(
        application.roundStatuses[selectedRound]?.scheduledDate || ''
    );
    const [feedback, setFeedback] = useState(
        application.roundStatuses[selectedRound]?.feedback || ''
    );
    const [overallFeedback, setOverallFeedback] = useState(application.feedback || '');

    const handleUpdateRound = async () => {
        const updatedRoundStatuses = [...application.roundStatuses];
        const currentRoundData = updatedRoundStatuses[selectedRound];

        updatedRoundStatuses[selectedRound] = {
            ...currentRoundData,
            status: roundStatus,
            scheduledDate: scheduledDate || undefined,
            completedDate: roundStatus === 'Cleared' || roundStatus === 'Rejected'
                ? new Date().toISOString()
                : undefined,
            feedback: feedback || undefined,
            updatedBy: 'Admin', // TODO: Get from current user
            updatedAt: new Date().toISOString()
        };

        // Determine overall application status
        let overallStatus = application.status;
        let newCurrentRound = application.currentRound;

        if (roundStatus === 'Cleared') {
            // Move to next round if available
            if (selectedRound < application.roundStatuses.length - 1) {
                newCurrentRound = selectedRound + 1;
                overallStatus = ApplicationStatus.SHORTLISTED;
            } else {
                // Last round cleared = Selected
                overallStatus = ApplicationStatus.SELECTED;
            }
        } else if (roundStatus === 'Rejected') {
            overallStatus = ApplicationStatus.REJECTED;
        }

        const updatedApplication: Application = {
            ...application,
            roundStatuses: updatedRoundStatuses,
            currentRound: newCurrentRound,
            status: overallStatus,
            lastUpdated: new Date().toISOString(),
            feedback: overallFeedback || undefined
        };

        await StorageService.saveApplication(updatedApplication);
        onUpdate();
        alert('Application status updated successfully!');
    };

    const currentRoundData = application.roundStatuses[selectedRound];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Manage Application</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {student.name} ({student.rollNo}) - {drive.role} at {company.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Student Quick Info */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">CGPA:</span>
                            <span className="ml-2 font-bold text-slate-900">{student.cgpa}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Branch:</span>
                            <span className="ml-2 font-bold text-slate-900">{student.branch}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Applied:</span>
                            <span className="ml-2 font-bold text-slate-900">
                                {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Round Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Select Round to Update
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {application.roundStatuses.map((round, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedRound(index);
                                        setRoundStatus(round.status);
                                        setScheduledDate(round.scheduledDate || '');
                                        setFeedback(round.feedback || '');
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRound === index
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-900">
                                            {index + 1}. {round.roundName}
                                        </span>
                                        {round.status === 'Cleared' && <CheckCircle size={16} className="text-green-500" />}
                                        {round.status === 'Rejected' && <XCircle size={16} className="text-red-500" />}
                                        {round.status === 'Scheduled' && <Calendar size={16} className="text-blue-500" />}
                                        {round.status === 'Pending' && <Clock size={16} className="text-slate-400" />}
                                    </div>
                                    <span className={`text-xs font-semibold ${round.status === 'Cleared' ? 'text-green-600' :
                                        round.status === 'Rejected' ? 'text-red-600' :
                                            round.status === 'Scheduled' ? 'text-blue-600' :
                                                'text-slate-500'
                                        }`}>
                                        {round.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Round Details */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <h3 className="font-bold text-slate-900 mb-3">
                            Updating: {currentRoundData.roundName}
                        </h3>

                        {/* Status Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Round Status
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['Pending', 'Scheduled', 'Cleared', 'Rejected'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setRoundStatus(status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${roundStatus === status
                                            ? status === 'Cleared' ? 'bg-green-500 text-white' :
                                                status === 'Rejected' ? 'bg-red-500 text-white' :
                                                    status === 'Scheduled' ? 'bg-blue-500 text-white' :
                                                        'bg-slate-700 text-white'
                                            : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schedule Date */}
                        {(roundStatus === 'Scheduled' || roundStatus === 'Pending') && (
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <Calendar size={16} className="inline mr-2" />
                                    Schedule Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledDate ? new Date(scheduledDate).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                                    className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}

                        {/* Feedback */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                <MessageSquare size={16} className="inline mr-2" />
                                Feedback for this Round
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Add feedback for the candidate..."
                                className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            />
                        </div>
                    </div>

                    {/* Overall Feedback */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Overall Application Feedback
                        </label>
                        <textarea
                            value={overallFeedback}
                            onChange={(e) => setOverallFeedback(e.target.value)}
                            placeholder="Add overall feedback for the entire application..."
                            className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            onClick={handleUpdateRound}
                            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Update Application Status
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
