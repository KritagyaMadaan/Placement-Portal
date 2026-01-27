import React, { useState } from 'react';
import { Student } from '../types';
import { Download, X, Filter, FileText, Table as TableIcon } from 'lucide-react';
import { BRANCHES } from '../constants';

interface ExportModalProps {
    students: Student[];
    onClose: () => void;
}

interface ColumnConfig {
    key: string;
    label: string;
    category: string;
    selected: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ students, onClose }) => {
    // Column configuration
    const allColumns: ColumnConfig[] = [
        // Core Information
        { key: 'name', label: 'Name', category: 'Core', selected: true },
        { key: 'email', label: 'Email', category: 'Core', selected: true },
        { key: 'rollNo', label: 'Roll Number', category: 'Core', selected: true },
        { key: 'phone', label: 'Phone', category: 'Core', selected: false },
        { key: 'dateOfBirth', label: 'Date of Birth', category: 'Core', selected: false },
        { key: 'gender', label: 'Gender', category: 'Core', selected: false },

        // Academic
        { key: 'course', label: 'Course', category: 'Academic', selected: true },
        { key: 'branch', label: 'Branch', category: 'Academic', selected: true },
        { key: 'year', label: 'Year', category: 'Academic', selected: true },
        { key: 'cgpa', label: 'CGPA', category: 'Academic', selected: true },
        { key: 'backlogs', label: 'Backlogs', category: 'Academic', selected: true },
        { key: 'tenthMarks', label: '10th Marks', category: 'Academic', selected: false },
        { key: 'twelfthMarks', label: '12th Marks', category: 'Academic', selected: false },
        { key: 'diplomaMarks', label: 'Diploma Marks', category: 'Academic', selected: false },
        { key: 'graduationMarks', label: 'Graduation Marks', category: 'Academic', selected: false },

        // Contact
        { key: 'address', label: 'Address', category: 'Contact', selected: false },
        { key: 'city', label: 'City', category: 'Contact', selected: false },
        { key: 'state', label: 'State', category: 'Contact', selected: false },
        { key: 'pincode', label: 'Pincode', category: 'Contact', selected: false },

        // Professional
        { key: 'skills', label: 'Skills', category: 'Professional', selected: false },
        { key: 'certifications', label: 'Certifications', category: 'Professional', selected: false },
        { key: 'languages', label: 'Languages', category: 'Professional', selected: false },
        { key: 'projects', label: 'Projects', category: 'Professional', selected: false },
        { key: 'internships', label: 'Internships', category: 'Professional', selected: false },
        { key: 'achievements', label: 'Achievements', category: 'Professional', selected: false },

        // Links
        { key: 'linkedinUrl', label: 'LinkedIn URL', category: 'Links', selected: false },
        { key: 'githubUrl', label: 'GitHub URL', category: 'Links', selected: false },
        { key: 'portfolioUrl', label: 'Portfolio URL', category: 'Links', selected: false },
        { key: 'resumeUrl', label: 'Resume URL', category: 'Links', selected: false },

        // Status
        { key: 'isVerified', label: 'Verified Status', category: 'Status', selected: false },
        { key: 'placedCompanyId', label: 'Placed Company', category: 'Status', selected: false }
    ];

    const [columns, setColumns] = useState<ColumnConfig[]>(allColumns);
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('excel');

    // Filters
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [filterMinCGPA, setFilterMinCGPA] = useState<string>('0');
    const [filterMaxBacklogs, setFilterMaxBacklogs] = useState<string>('10');
    const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
    const [filterPlacedOnly, setFilterPlacedOnly] = useState(false);

    const toggleColumn = (key: string) => {
        setColumns(prev =>
            prev.map(col => col.key === key ? { ...col, selected: !col.selected } : col)
        );
    };

    const toggleCategory = (category: string) => {
        const categoryColumns = columns.filter(col => col.category === category);
        const allSelected = categoryColumns.every(col => col.selected);

        setColumns(prev =>
            prev.map(col => col.category === category ? { ...col, selected: !allSelected } : col)
        );
    };

    const selectAll = () => {
        setColumns(prev => prev.map(col => ({ ...col, selected: true })));
    };

    const deselectAll = () => {
        setColumns(prev => prev.map(col => ({ ...col, selected: false })));
    };

    // Apply filters
    const filteredStudents = students.filter(student => {
        if (filterBranch !== 'all' && student.branch !== filterBranch) return false;
        if (student.cgpa < parseFloat(filterMinCGPA)) return false;
        if (student.backlogs > parseInt(filterMaxBacklogs)) return false;
        if (filterVerifiedOnly && !student.isVerified) return false;
        if (filterPlacedOnly && !student.placedCompanyId) return false;
        return true;
    });

    const handleExport = () => {
        const selectedColumns = columns.filter(col => col.selected);

        if (selectedColumns.length === 0) {
            alert('Please select at least one column to export');
            return;
        }

        if (exportFormat === 'csv') {
            exportToCSV(filteredStudents, selectedColumns);
        } else {
            exportToExcel(filteredStudents, selectedColumns);
        }
    };

    const exportToCSV = (data: Student[], cols: ColumnConfig[]) => {
        // Create CSV header
        const header = cols.map(col => col.label).join(',');

        // Create CSV rows
        const rows = data.map(student => {
            return cols.map(col => {
                const value = student[col.key as keyof Student];

                // Handle arrays
                if (Array.isArray(value)) {
                    return `"${value.join(', ')}"`;
                }

                // Handle booleans
                if (typeof value === 'boolean') {
                    return value ? 'Yes' : 'No';
                }

                // Handle strings with commas
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }

                return value || '';
            }).join(',');
        });

        const csv = [header, ...rows].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToExcel = (data: Student[], cols: ColumnConfig[]) => {
        // Create HTML table
        const header = cols.map(col => `<th style="background: #1e293b; color: white; padding: 12px; font-weight: bold; border: 1px solid #cbd5e1;">${col.label}</th>`).join('');

        const rows = data.map(student => {
            const cells = cols.map(col => {
                const value = student[col.key as keyof Student];

                // Handle arrays
                if (Array.isArray(value)) {
                    return `<td style="padding: 8px; border: 1px solid #cbd5e1;">${value.join(', ')}</td>`;
                }

                // Handle booleans
                if (typeof value === 'boolean') {
                    return `<td style="padding: 8px; border: 1px solid #cbd5e1;">${value ? 'Yes' : 'No'}</td>`;
                }

                return `<td style="padding: 8px; border: 1px solid #cbd5e1;">${value || ''}</td>`;
            }).join('');

            return `<tr>${cells}</tr>`;
        }).join('');

        const html = `
            <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                        th, td { text-align: left; }
                    </style>
                </head>
                <body>
                    <h2>Student Database Export</h2>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <p>Total Students: ${data.length}</p>
                    <table>
                        <thead><tr>${header}</tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </body>
            </html>
        `;

        // Download as Excel
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const categories = Array.from(new Set(columns.map(col => col.category)));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Export Student Database</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Select columns and apply filters to export student data
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Filters */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter size={20} className="text-slate-600" />
                            <h3 className="font-bold text-slate-900">Filters</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Branch</label>
                                <select
                                    value={filterBranch}
                                    onChange={(e) => setFilterBranch(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="all">All Branches</option>
                                    {BRANCHES.map(branch => (
                                        <option key={branch} value={branch}>{branch}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Min CGPA</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={filterMinCGPA}
                                    onChange={(e) => setFilterMinCGPA(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Max Backlogs</label>
                                <input
                                    type="number"
                                    value={filterMaxBacklogs}
                                    onChange={(e) => setFilterMaxBacklogs(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterVerifiedOnly}
                                        onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-xs text-slate-700">Verified Only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterPlacedOnly}
                                        onChange={(e) => setFilterPlacedOnly(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-xs text-slate-700">Placed Only</span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 text-sm font-semibold text-slate-700">
                            Filtered Results: <span className="text-blue-600">{filteredStudents.length}</span> students
                        </div>
                    </div>

                    {/* Column Selection */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Select Columns to Export</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {categories.map(category => {
                                const categoryColumns = columns.filter(col => col.category === category);
                                const selectedCount = categoryColumns.filter(col => col.selected).length;

                                return (
                                    <div key={category} className="border border-slate-200 rounded-lg p-3">
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="flex items-center justify-between w-full mb-2"
                                        >
                                            <span className="font-bold text-slate-900">{category}</span>
                                            <span className="text-xs text-slate-500">
                                                {selectedCount}/{categoryColumns.length} selected
                                            </span>
                                        </button>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {categoryColumns.map(col => (
                                                <label
                                                    key={col.key}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={col.selected}
                                                        onChange={() => toggleColumn(col.key)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm text-slate-700">{col.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Export Format */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <h3 className="font-bold text-slate-900 mb-3">Export Format</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    value="excel"
                                    checked={exportFormat === 'excel'}
                                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                                    className="w-4 h-4"
                                />
                                <div className="flex items-center gap-2">
                                    <TableIcon size={20} className="text-green-600" />
                                    <span className="text-sm font-semibold text-slate-700">Excel (.xls)</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    value="csv"
                                    checked={exportFormat === 'csv'}
                                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                                    className="w-4 h-4"
                                />
                                <div className="flex items-center gap-2">
                                    <FileText size={20} className="text-blue-600" />
                                    <span className="text-sm font-semibold text-slate-700">CSV (.csv)</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Export {filteredStudents.length} Students as {exportFormat.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
