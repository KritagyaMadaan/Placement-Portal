import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { ListmonkService } from '../services/listmonkService';
import { Application, Student, Company, Notice, Event, PlacementDrive } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Search, AlertOctagon, Edit, Filter, Plus, Upload, X, Check, CheckCircle, Building2, User, MoreHorizontal, Trash2, Eye, Bell, Calendar } from 'lucide-react';
import { BRANCHES } from '../constants';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { CompanyDetailModal } from '../components/CompanyDetailModal';
import { NoticesEventsTab } from '../components/NoticesEventsTab';
import { ApplicationManager } from '../components/ApplicationManager';
import { CSVImportWizard } from '../components/CSVImportWizard';
import { ExportModal } from '../components/ExportModal';
import { PasswordGenerator } from '../utils/passwordGenerator';

export const AdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [drives, setDrives] = useState<PlacementDrive[]>([]);

    // Maps for quick lookup
    const [studentMap, setStudentMap] = useState<Record<string, Student>>({});
    const [driveMap, setDriveMap] = useState<Record<string, PlacementDrive>>({});
    const [companyMap, setCompanyMap] = useState<Record<string, Company>>({});

    // Dashboard Tab State
    const [activeTab, setActiveTab] = useState<'students' | 'companies' | 'verification' | 'approvals' | 'notices' | 'applications'>('students');

    // Application Management State
    const [managingApplication, setManagingApplication] = useState<Application | null>(null);

    // Notices & Events State
    const [notices, setNotices] = useState<Notice[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // State for Add Student Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState<Partial<Student>>({
        name: '', email: '', password: 'password123', rollNo: '', course: 'M.Sc', branch: BRANCHES[0], year: 2024, cgpa: 0, backlogs: 0
    });

    // State for CSV Import
    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);

    // Filter State
    const [filter, setFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');

    // Detail Modal States
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    // Import/Export Modal States
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Bulk Selection State
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

    const fetchData = async () => {
        const [s, c, a, d, n, e] = await Promise.all([
            StorageService.getStudents(),
            StorageService.getCompanies(),
            StorageService.getApplications(),
            StorageService.getDrives(),
            StorageService.getNotices(),
            StorageService.getEvents()
        ]);
        setStudents(s);
        setCompanies(c);
        setApplications(a);
        setDrives(d);
        setNotices(n);
        setEvents(e);

        console.log('Fetched Admin Data:', {
            students: s.length,
            companies: c.length,
            pendingCompanies: c.filter(item => !item.isApproved).length,
            applications: a.length,
            drives: d.length
        });

        // Build maps
        const sMap: Record<string, Student> = {};
        s.forEach(item => sMap[item.id] = item);
        setStudentMap(sMap);

        const dMap: Record<string, PlacementDrive> = {};
        d.forEach(item => dMap[item.id] = item);
        setDriveMap(dMap);

        const cMap: Record<string, Company> = {};
        c.forEach(item => cMap[item.id] = item);
        setCompanyMap(cMap);
    };

    useEffect(() => {
        fetchData();
        // Clear selection when changing tabs
        setSelectedStudentIds(new Set());
    }, [activeTab]);

    const pendingStudents = students.filter(s => !s.isVerified);
    const pendingCompanies = companies.filter(c => !c.isApproved);

    const toggleStudentSelection = (studentId: string) => {
        const newSelected = new Set(selectedStudentIds);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudentIds(newSelected);
    };

    const toggleSelectAll = (studentList: Student[]) => {
        if (selectedStudentIds.size === studentList.length) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(studentList.map(s => s.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to permanently delete ${selectedStudentIds.size} selected students?`)) {
            await StorageService.bulkDeleteStudents(Array.from(selectedStudentIds));
            await fetchData();
            setSelectedStudentIds(new Set());
        }
    };

    const handleBulkBlacklist = async (status: boolean) => {
        if (window.confirm(`Are you sure you want to ${status ? 'blacklist' : 'unblock'} ${selectedStudentIds.size} selected students?`)) {
            await StorageService.bulkBlacklistStudents(Array.from(selectedStudentIds), status);
            await fetchData();
            setSelectedStudentIds(new Set());
        }
    };

    const handleBulkVerify = async () => {
        if (window.confirm(`Are you sure you want to verify ${selectedStudentIds.size} selected students?`)) {
            await StorageService.bulkVerifyStudents(Array.from(selectedStudentIds));
            await fetchData();
            setSelectedStudentIds(new Set());
        }
    };

    const handleDeleteStudent = async (studentId: string, studentName: string) => {
        if (window.confirm(`Are you absolutely sure you want to completely remove ${studentName} from the database? This will also delete all their applications and cannot be undone.`)) {
            await StorageService.deleteStudent(studentId);
            await fetchData();
        }
    };

    // Analytics
    const branchData = students.reduce((acc: any, curr) => {
        acc[curr.branch] = (acc[curr.branch] || 0) + 1;
        return acc;
    }, {});
    const chartData = Object.keys(branchData).map(key => ({ name: key.split(' ').pop(), value: branchData[key] }));

    const statusData = applications.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.keys(statusData).map(key => ({ name: key, value: statusData[key] }));
    const COLORS = ['#0f172a', '#e11d48', '#3b82f6', '#f59e0b', '#64748b'];

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(filter.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(companyFilter.toLowerCase()) ||
        c.hrName.toLowerCase().includes(companyFilter.toLowerCase())
    );

    const exportCSV = () => {
        // Simple export for MVP
        const rows = filteredStudents.map(s => [s.name, s.rollNo, s.email, s.cgpa, s.branch, s.isBlacklisted ? 'Blacklisted' : 'Active'].join(','));
        const csvContent = "data:text/csv;charset=utf-8,Name,RollNo,Email,CGPA,Branch,Status\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "nfsu_students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleBlacklist = async (id: string) => {
        const student = students.find(s => s.id === id);
        if (student) {
            student.isBlacklisted = !student.isBlacklisted;
            await StorageService.saveStudent(student);
            await fetchData();
        }
    }

    const verifyStudent = async (id: string) => {
        await StorageService.verifyStudent(id);
        await fetchData();
    }

    const approveCompany = async (id: string) => {
        await StorageService.approveCompany(id);
        setCompanies(await StorageService.getCompanies());

        // Send approval email
        const company = companies.find(c => c.id === id);
        if (company) {
            await ListmonkService.sendCompanyApprovalEmail(company);
        }

        alert("Company Approved! Automated emails sent to eligible students.");
    }

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStudent.email?.toLowerCase().endsWith('@nfsu.ac.in')) {
            alert('Error: Student email must be of domain @nfsu.ac.in');
            return;
        }

        const student: Student = {
            ...newStudent as Student,
            id: `s${Date.now()}`,
            skills: [],
            certifications: [],
            isVerified: true,
            isBlacklisted: false
        };
        await StorageService.saveStudent(student);

        // Send welcome email via Listmonk
        await ListmonkService.sendStudentWelcomeEmail(student);

        await fetchData();
        setIsModalOpen(false);
        setNewStudent({ name: '', email: '', password: 'password123', rollNo: '', course: 'M.Sc', branch: BRANCHES[0], year: 2024, cgpa: 0, backlogs: 0 });
        alert(`Student added successfully! Welcome email sent to ${student.email}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setImportText(text); // Populate the textarea with file content
            };
            reader.readAsText(file);
        }
    };

    const handleBulkImport = async () => {
        const lines = importText.split('\n');
        const imported: Student[] = [];
        const passwords = PasswordGenerator.generateBatch(lines.length);

        lines.forEach((line, idx) => {
            if (!line.trim()) return;
            const [name, email, rollNo, cgpa, branch] = line.split(',');
            if (name && email && rollNo) {
                if (!email.trim().toLowerCase().endsWith('@nfsu.ac.in')) return;

                const password = passwords[idx] || PasswordGenerator.generate();
                imported.push({
                    id: `s_imp_${Date.now()}_${idx}`,
                    name: name.trim(),
                    email: email.trim(),
                    rollNo: rollNo.trim(),
                    cgpa: parseFloat(cgpa || '0'),
                    password: password,
                    course: 'M.Sc',
                    branch: branch?.trim() || BRANCHES[0],
                    year: 2024,
                    backlogs: 0,
                    skills: [],
                    certifications: [],
                    isVerified: true,
                    isBlacklisted: false
                });
            }
        });

        await StorageService.importStudents(imported);

        // Send welcome emails to all imported students via Listmonk
        const emailsSent = await ListmonkService.sendBulkStudentWelcomeEmails(imported);

        setStudents(await StorageService.getStudents());
        setShowImport(false);
        setImportText('');

        alert(`Successfully imported ${imported.length} students!\nWelcome emails sent: ${emailsSent}/${imported.length}`);
    };

    return (
        <div className="space-y-10 pb-10 font-sans text-slate-900">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 font-medium">Placement Management System</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
                    {[
                        { id: 'students', label: 'Students' },
                        { id: 'companies', label: 'Companies', count: pendingCompanies.length },
                        { id: 'approvals', label: 'Approvals', count: pendingCompanies.length },
                        { id: 'applications', label: 'Applications', count: applications.length },
                        { id: 'notices', label: 'Notices & Events' },
                        { id: 'verification', label: 'Verifications', count: pendingStudents.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                            {tab.count && tab.count > 0 ? (
                                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.count}</span>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'students' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

                    {/* Database Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by name or roll no..."
                                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-slate-900 outline-none transition"
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm">
                                    <Plus size={14} /> Add Student
                                </button>
                                <button
                                    onClick={() => setShowImportWizard(true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                    <Upload size={14} /> Smart Import
                                </button>
                                <button
                                    onClick={() => setShowExportModal(true)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                    <Download size={14} /> Export
                                </button>
                            </div>
                        </div>

                        {selectedStudentIds.size > 0 && (
                            <div className="mx-5 mb-4 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-sm bg-white/20 px-3 py-1 rounded-full">
                                        {selectedStudentIds.size} Selected
                                    </span>
                                    <div className="h-6 w-px bg-white/20" />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleBulkBlacklist(true)}
                                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg text-xs font-bold transition flex items-center gap-2"
                                        >
                                            <AlertOctagon size={14} /> Bulk Blacklist
                                        </button>
                                        <button
                                            onClick={() => handleBulkBlacklist(false)}
                                            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-200 rounded-lg text-xs font-bold transition flex items-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Bulk Unblock
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedStudentIds(new Set())}
                                        className="px-3 py-1.5 text-white/60 hover:text-white transition text-xs font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5 w-10">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                checked={selectedStudentIds.size > 0 && selectedStudentIds.size === filteredStudents.length}
                                                onChange={() => toggleSelectAll(filteredStudents)}
                                            />
                                        </th>
                                        <th className="p-5">Student Identity</th>
                                        <th className="p-5">Academic Info</th>
                                        <th className="p-5">Performance</th>
                                        <th className="p-5">Login Password</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-medium">No records found.</td></tr>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <tr
                                                key={student.id}
                                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedStudentIds.has(student.id) ? 'bg-slate-50' : ''}`}
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                        checked={selectedStudentIds.has(student.id)}
                                                        onChange={() => toggleStudentSelection(student.id)}
                                                    />
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium mt-0.5">{student.rollNo}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-sm font-medium text-slate-700">{student.branch}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{student.course} • {student.year}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-700">{student.cgpa}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <code className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-bold border border-blue-200">
                                                            {student.password}
                                                        </code>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(student.password || '');
                                                                alert('Password copied to clipboard!');
                                                            }}
                                                            className="p-1.5 hover:bg-slate-100 rounded transition text-slate-400 hover:text-slate-700"
                                                            title="Copy password"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    {student.isBlacklisted ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                            <AlertOctagon size={12} /> Blacklisted
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                                            <CheckCircle size={12} /> Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedStudent(student);
                                                            }}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                            title="View Profile"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBlacklist(student.id);
                                                            }}
                                                            className={`p-2 rounded-lg transition ${student.isBlacklisted ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                            title={student.isBlacklisted ? "Unblock Student" : "Blacklist Student"}
                                                        >
                                                            {student.isBlacklisted ? <CheckCircle size={16} /> : <AlertOctagon size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteStudent(student.id, student.name);
                                                            }}
                                                            className="p-2 bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white rounded-lg transition"
                                                            title="Permanently Remove Student"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
            }

            {activeTab === 'companies' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* Company Database Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-slate-900 outline-none transition"
                                    value={companyFilter}
                                    onChange={e => setCompanyFilter(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5">Company</th>
                                        <th className="p-5">HR Contact</th>
                                        <th className="p-5">Drives</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCompanies.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-medium">No companies found.</td></tr>
                                    ) : (
                                        filteredCompanies.map(company => {
                                            const companyDrives = drives.filter(d => d.companyId === company.id);
                                            return (
                                                <tr
                                                    key={company.id}
                                                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedCompany(company)}
                                                >
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                                <Building2 size={20} className="text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{company.name}</div>
                                                                {company.description && (
                                                                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{company.description}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-medium text-slate-700">{company.hrName}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{company.hrEmail}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-sm font-bold text-slate-700">
                                                            {companyDrives.length} {companyDrives.length === 1 ? 'Drive' : 'Drives'}
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        {company.isApproved ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                                                <CheckCircle size={12} /> Approved
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
                                                                <AlertOctagon size={12} /> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {!company.isApproved && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        approveCompany(company.id);
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm"
                                                                    title="Approve Company"
                                                                >
                                                                    <Check size={14} /> Approve
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCompany(company);
                                                                }}
                                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {
                activeTab === 'verification' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-lg text-slate-900">Pending Verifications</h2>
                                <p className="text-sm text-slate-500">Validate student data against hard copies.</p>
                            </div>
                        </div>
                        {selectedStudentIds.size > 0 && (
                            <div className="mx-5 mb-4 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-sm bg-white/20 px-3 py-1 rounded-full">
                                        {selectedStudentIds.size} Selected
                                    </span>
                                    <div className="h-6 w-px bg-white/20" />
                                    <button
                                        onClick={handleBulkVerify}
                                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-200 rounded-lg text-xs font-bold transition flex items-center gap-2"
                                    >
                                        <CheckCircle size={14} /> Bulk Verify
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedStudentIds(new Set())}
                                        className="px-3 py-1.5 text-white/60 hover:text-white transition text-xs font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5 w-10">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                checked={selectedStudentIds.size > 0 && selectedStudentIds.size === pendingStudents.length}
                                                onChange={() => toggleSelectAll(pendingStudents)}
                                            />
                                        </th>
                                        <th className="p-5">Student</th>
                                        <th className="p-5">Submitted Data</th>
                                        <th className="p-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pendingStudents.length === 0 ? (
                                        <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">All profiles verified.</td></tr>
                                    ) : (
                                        pendingStudents.map(student => (
                                            <tr
                                                key={student.id}
                                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedStudentIds.has(student.id) ? 'bg-slate-50' : ''}`}
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                        checked={selectedStudentIds.has(student.id)}
                                                        onChange={() => toggleStudentSelection(student.id)}
                                                    />
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium mt-0.5">{student.email}</div>
                                                </td>
                                                <td className="p-5 text-sm">
                                                    <div className="font-medium text-slate-700">{student.course} - {student.branch}</div>
                                                    <div className="text-slate-500 mt-1">Roll: <span className="font-mono text-slate-700">{student.rollNo}</span> | CGPA: <span className="font-mono text-slate-700">{(student.cgpa || 0).toFixed(2)}</span></div>
                                                </td>
                                                <td className="p-5 text-right space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedStudent(student);
                                                        }}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            verifyStudent(student.id);
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition shadow-sm"
                                                    >
                                                        <CheckCircle size={14} /> Verify
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteStudent(student.id, student.name);
                                                        }}
                                                        className="p-2 bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition"
                                                        title="Delete Registration"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'approvals' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-lg text-slate-900">Company Approvals</h2>
                            <p className="text-sm text-slate-500">Approve new registration requests from recruiters.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5">Company</th>
                                        <th className="p-5">Drive Details</th>
                                        <th className="p-5">HR Contact</th>
                                        <th className="p-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pendingCompanies.length === 0 ? (
                                        <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No pending approvals.</td></tr>
                                    ) : (
                                        pendingCompanies.map(company => {
                                            const drive = drives.find(d => d.companyId === company.id);
                                            return (
                                                <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-5">
                                                        <div className="font-bold text-slate-900 text-lg">{company.name}</div>
                                                        <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Deadline: {drive?.deadline || 'N/A'}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-bold text-blue-600">{drive?.role || 'N/A'}</div>
                                                        <div className="text-sm text-slate-500 mt-1 font-medium">{drive?.ctc || 'N/A'} <span className="text-slate-300 mx-1">|</span> Min CGPA: {drive?.minCgpa || 'N/A'}</div>
                                                    </td>
                                                    <td className="p-5 text-sm">
                                                        <div className="font-medium text-slate-900">{company.hrName}</div>
                                                        <div className="text-slate-500">{company.hrEmail}</div>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button
                                                            onClick={() => approveCompany(company.id)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* Modals remain mostly functional/styled simply as before but with consistent rounded corners */}
            {
                showImport && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Import Student Database</h3>
                                <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
                            </div>

                            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Upload CSV File</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-bold
                                file:bg-slate-200 file:text-slate-700
                                hover:file:bg-slate-300
                                cursor-pointer
                            "
                                />
                            </div>

                            <div className="relative mb-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                                    <span className="px-2 bg-white text-slate-400">Or paste raw data</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mb-2 font-medium">Format: Name, Email, RollNo, CGPA, Branch (one per line)</p>
                            <p className="text-xs text-green-600 mb-2 font-medium">✨ Passwords will be auto-generated and welcome emails sent automatically!</p>
                            <textarea
                                className="w-full border border-slate-200 bg-slate-50 p-4 rounded-xl h-40 font-mono text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="John Doe, john@nfsu.ac.in, NFSU001, 9.5, M.Sc Cyber Security&#10;Jane Smith, jane@nfsu.ac.in, NFSU002, 8.8, M.Sc Digital Forensics"
                                value={importText}
                                onChange={e => setImportText(e.target.value)}
                            ></textarea>
                            <button onClick={handleBulkImport} className="w-full mt-6 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                                Process Database Import
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Notices & Events Tab */}
            {activeTab === 'notices' && (
                <NoticesEventsTab
                    notices={notices}
                    events={events}
                    onUpdate={fetchData}
                />
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">All Applications</h2>
                            <p className="text-sm text-slate-600 mt-1">Manage placement drive applications and update round statuses</p>
                        </div>

                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-5">Student</th>
                                    <th className="p-5">Drive & Company</th>
                                    <th className="p-5">Applied Date</th>
                                    <th className="p-5">Current Round</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                                            No applications found.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map(app => {
                                        const student = studentMap[app.studentId];
                                        const drive = driveMap[app.driveId];
                                        const company = drive ? companyMap[drive.companyId] : undefined;
                                        const currentRound = app.roundStatuses?.[app.currentRound];

                                        return (
                                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-900">{student?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{student?.rollNo}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-900">{drive?.role || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{company?.name || 'Unknown'}</div>
                                                </td>
                                                <td className="p-5 text-sm text-slate-600">
                                                    {new Date(app.appliedAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-5">
                                                    {currentRound ? (
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-900">{currentRound.roundName}</div>
                                                            <div className={`text-xs ${currentRound.status === 'Cleared' ? 'text-green-600' :
                                                                currentRound.status === 'Rejected' ? 'text-red-600' :
                                                                    currentRound.status === 'Scheduled' ? 'text-blue-600' :
                                                                        'text-slate-500'
                                                                }`}>
                                                                {currentRound.status}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">No rounds</span>
                                                    )}
                                                </td>
                                                <td className="p-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${app.status === 'Selected' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        app.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <button
                                                        onClick={() => setManagingApplication(app)}
                                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Add Student</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddStudent} className="space-y-4">
                                <input required placeholder="Full Name" className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                                <input required placeholder="Roll No" className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition" value={newStudent.rollNo} onChange={e => setNewStudent({ ...newStudent, rollNo: e.target.value })} />
                                <input required placeholder="Email" type="email" className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="CGPA" type="number" step="0.1" className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition" value={newStudent.cgpa} onChange={e => setNewStudent({ ...newStudent, cgpa: parseFloat(e.target.value) })} />
                                    <select className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none transition" value={newStudent.branch} onChange={e => setNewStudent({ ...newStudent, branch: e.target.value })}>
                                        {BRANCHES.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 mt-2">Create Record</button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Detail Modals */}
            {selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    applications={applications.filter(a => a.studentId === selectedStudent.id)}
                    drives={drives}
                    companies={companies}
                    onClose={() => setSelectedStudent(null)}
                />
            )}

            {selectedCompany && (
                <CompanyDetailModal
                    company={selectedCompany}
                    drives={drives.filter(d => d.companyId === selectedCompany.id)}
                    allApplications={applications}
                    students={students}
                    onClose={() => setSelectedCompany(null)}
                />
            )}

            {/* Application Manager Modal */}
            {managingApplication && (() => {
                const student = studentMap[managingApplication.studentId];
                const drive = driveMap[managingApplication.driveId];
                const company = drive ? companyMap[drive.companyId] : undefined;

                if (!student || !drive || !company) return null;

                return (
                    <ApplicationManager
                        application={managingApplication}
                        student={student}
                        drive={drive}
                        company={company}
                        onUpdate={() => {
                            setManagingApplication(null);
                            fetchData();
                        }}
                        onClose={() => setManagingApplication(null)}
                    />
                );
            })()}

            {/* CSV Import Wizard */}
            {showImportWizard && (
                <CSVImportWizard
                    onClose={() => setShowImportWizard(false)}
                    onImportComplete={() => {
                        fetchData();
                        setShowImportWizard(false);
                    }}
                />
            )}

            {/* Export Modal */}
            {showExportModal && (
                <ExportModal
                    students={students}
                    onClose={() => setShowExportModal(false)}
                />
            )}
        </div >
    );
};
