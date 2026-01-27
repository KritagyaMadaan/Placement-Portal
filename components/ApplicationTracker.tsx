import React from 'react';
import { Application, PlacementDrive, Company, RoundStatus } from '../types';
import { CheckCircle, Clock, XCircle, Calendar, MessageSquare } from 'lucide-react';

interface ApplicationTrackerProps {
    application: Application;
    drive: PlacementDrive;
    company: Company;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ application, drive, company }) => {
    const getStatusIcon = (status: RoundStatus['status']) => {
        switch (status) {
            case 'Cleared':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'Rejected':
                return <XCircle size={20} className="text-red-500" />;
            case 'Scheduled':
                return <Calendar size={20} className="text-blue-500" />;
            case 'Pending':
            default:
                return <Clock size={20} className="text-slate-400" />;
        }
    };

    const getStatusColor = (status: RoundStatus['status']) => {
        switch (status) {
            case 'Cleared':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Scheduled':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending':
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const currentRoundStatus = application.roundStatuses[application.currentRound];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{drive.role}</h3>
                        <p className="text-sm text-slate-600">{company.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(currentRoundStatus?.status || 'Pending')}`}>
                        {application.status}
                    </span>
                </div>
                <p className="text-xs text-slate-400">Applied: {new Date(application.appliedAt).toLocaleDateString()}</p>
            </div>

            {/* Progress Timeline */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    {application.roundStatuses.map((round, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${round.status === 'Cleared'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : round.status === 'Rejected'
                                            ? 'bg-red-500 border-red-500 text-white'
                                            : round.status === 'Scheduled'
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : index === application.currentRound
                                                    ? 'bg-white border-blue-500 text-blue-500'
                                                    : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                    {round.status === 'Cleared' ? (
                                        <CheckCircle size={20} />
                                    ) : round.status === 'Rejected' ? (
                                        <XCircle size={20} />
                                    ) : (
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    )}
                                </div>
                                <p className={`text-[10px] font-medium mt-2 text-center max-w-[80px] ${index === application.currentRound ? 'text-blue-600' : 'text-slate-500'
                                    }`}>
                                    {round.roundName}
                                </p>
                            </div>
                            {index < application.roundStatuses.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 ${round.status === 'Cleared' ? 'bg-green-500' : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Current Round Info */}
            {currentRoundStatus && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(currentRoundStatus.status)}
                        <h4 className="font-bold text-slate-900">Current Round: {currentRoundStatus.roundName}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="text-slate-600">
                            <span className="font-semibold">Status:</span> {currentRoundStatus.status}
                        </p>
                        {currentRoundStatus.scheduledDate && (
                            <p className="text-slate-600">
                                <span className="font-semibold">Scheduled:</span> {new Date(currentRoundStatus.scheduledDate).toLocaleString()}
                            </p>
                        )}
                        {currentRoundStatus.feedback && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                                <p className="text-slate-600 flex items-start gap-2">
                                    <MessageSquare size={16} className="mt-0.5 text-slate-400" />
                                    <span className="italic">{currentRoundStatus.feedback}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Round History */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Round History</h4>
                <div className="space-y-2">
                    {application.roundStatuses.map((round, index) => (
                        <div
                            key={index}
                            className={`border rounded-lg p-3 ${index === application.currentRound
                                    ? 'border-blue-200 bg-blue-50'
                                    : 'border-slate-200 bg-white'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(round.status)}
                                    <span className="font-semibold text-sm text-slate-900">
                                        {index + 1}. {round.roundName}
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(round.status)}`}>
                                    {round.status}
                                </span>
                            </div>
                            {round.completedDate && (
                                <p className="text-xs text-slate-500 ml-7">
                                    Completed: {new Date(round.completedDate).toLocaleDateString()}
                                </p>
                            )}
                            {round.scheduledDate && !round.completedDate && (
                                <p className="text-xs text-blue-600 ml-7">
                                    Scheduled: {new Date(round.scheduledDate).toLocaleString()}
                                </p>
                            )}
                            {round.feedback && (
                                <p className="text-xs text-slate-600 ml-7 mt-1 italic">
                                    "{round.feedback}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Overall Feedback */}
            {application.feedback && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Overall Feedback</h4>
                    <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg">
                        "{application.feedback}"
                    </p>
                </div>
            )}
        </div>
    );
};
