import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { ApplicationStatus, Company, PlacementDrive, Application, Student } from '../types';
import { Users, Filter, Briefcase, Building2 } from 'lucide-react';

export const AdminDrives: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [c, d, a, s] = await Promise.all([
      StorageService.getCompanies(),
      StorageService.getDrives(),
      StorageService.getApplications(),
      StorageService.getStudents()
    ]);
    setCompanies(c);
    setDrives(d);
    setApplications(a);
    setStudents(s);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedDrive = drives.find(d => d.id === selectedDriveId);
  const selectedDriveCompany = selectedDrive ? companies.find(c => c.id === selectedDrive.companyId) : null;
  const driveApps = applications.filter(a => a.driveId === selectedDriveId);

  const updateStatus = async (appId: string, status: ApplicationStatus) => {
    await StorageService.updateApplicationStatus(appId, status);
    await fetchData(); // Refresh data
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading drives...</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Drives List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700">Active Placement Drives</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {drives.map(drive => {
            const company = companies.find(c => c.id === drive.companyId);
            const appCount = applications.filter(a => a.driveId === drive.id).length;
            return (
              <button
                key={drive.id}
                onClick={() => setSelectedDriveId(drive.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedDriveId === drive.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-300'}`}
              >
                <div className="font-semibold text-gray-800 line-clamp-1">{drive.role}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Building2 size={10} /> {company?.name}
                </div>
                <div className="text-xs text-gray-500 flex justify-between mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${drive.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>{drive.status}</span>
                  <span className="flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded-full text-gray-700 font-bold">
                    <Users size={10} /> {appCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applicants List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {selectedDrive ? (
          <>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-bold text-xl text-gray-800">{selectedDrive.role}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  {selectedDriveCompany?.name}
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {selectedDrive.ctc}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Total Applicants: <span className="font-bold">{driveApps.length}</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="p-4">Student Details</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {driveApps.map(app => {
                    const student = students.find(s => s.id === app.studentId);
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{student?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{student?.rollNo} | {student?.branch}</div>
                          <div className="text-xs text-blue-600 font-mono mt-0.5">CGPA: {student?.cgpa}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${app.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-700 border-green-200' :
                              app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {[ApplicationStatus.SHORTLISTED, ApplicationStatus.TECHNICAL, ApplicationStatus.HR, ApplicationStatus.SELECTED].map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(app.id, s)}
                                disabled={app.status === s}
                                className={`px-2 py-1 text-[10px] uppercase font-bold rounded border transition ${app.status === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                  }`}
                              >
                                {s.replace(' Round', '')}
                              </button>
                            ))}
                            <button
                              onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}
                              className="px-2 py-1 text-[10px] uppercase font-bold rounded border bg-white text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {driveApps.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-400">No applications received yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p>Select a drive from the left to manage applications</p>
          </div>
        )}
      </div>
    </div>
  );
};