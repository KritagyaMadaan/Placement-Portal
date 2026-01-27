import React, { useState } from 'react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';
import { Upload, X, ArrowRight, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { PasswordGenerator } from '../utils/passwordGenerator';

interface CSVImportWizardProps {
    onClose: () => void;
    onImportComplete: () => void;
}

interface ColumnMapping {
    csvColumn: string;
    studentField: string;
}

interface ParsedRow {
    [key: string]: string;
}

export const CSVImportWizard: React.FC<CSVImportWizardProps> = ({ onClose, onImportComplete }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<ParsedRow[]>([]);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [autoGeneratePasswords, setAutoGeneratePasswords] = useState(true);
    const [markAsVerified, setMarkAsVerified] = useState(false);
    const [importing, setImporting] = useState(false);

    // Available student fields for mapping
    const studentFields = [
        { value: 'name', label: 'Name *' },
        { value: 'email', label: 'Email *' },
        { value: 'rollNo', label: 'Roll Number *' },
        { value: 'course', label: 'Course *' },
        { value: 'branch', label: 'Branch *' },
        { value: 'year', label: 'Year *' },
        { value: 'cgpa', label: 'CGPA *' },
        { value: 'backlogs', label: 'Backlogs' },
        { value: 'phone', label: 'Phone' },
        { value: 'dateOfBirth', label: 'Date of Birth' },
        { value: 'gender', label: 'Gender' },
        { value: 'address', label: 'Address' },
        { value: 'city', label: 'City' },
        { value: 'state', label: 'State' },
        { value: 'pincode', label: 'Pincode' },
        { value: 'tenthMarks', label: '10th Marks' },
        { value: 'twelfthMarks', label: '12th Marks' },
        { value: 'diplomaMarks', label: 'Diploma Marks' },
        { value: 'graduationMarks', label: 'Graduation Marks' },
        { value: 'skills', label: 'Skills (comma-separated)' },
        { value: 'certifications', label: 'Certifications (comma-separated)' },
        { value: 'languages', label: 'Languages (comma-separated)' },
        { value: 'projects', label: 'Projects (comma-separated)' },
        { value: 'internships', label: 'Internships (comma-separated)' },
        { value: 'achievements', label: 'Achievements (comma-separated)' },
        { value: 'linkedinUrl', label: 'LinkedIn URL' },
        { value: 'githubUrl', label: 'GitHub URL' },
        { value: 'portfolioUrl', label: 'Portfolio URL' },
        { value: 'ignore', label: '-- Ignore this column --' },
        { value: 'custom', label: '-- Store as Custom Field --' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;
            parseCSV(text);
        };

        reader.readAsText(file);
    };

    const parseCSV = (text: string) => {
        // Clean UTF-8 BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');

        // More robust CSV splitter that handles empty fields and quoted values
        const splitCSVLine = (line: string) => {
            const result = [];
            let cell = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(cell.trim());
                    cell = '';
                } else {
                    cell += char;
                }
            }
            result.push(cell.trim());
            // Double clean quotes from the final result
            return result.map(v => v.replace(/^"|"$/g, '').trim());
        };

        const lines = cleanText.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) return;

        // Parse headers
        const headers = splitCSVLine(lines[0]);
        setCsvHeaders(headers);

        // Parse data rows
        const data: ParsedRow[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = splitCSVLine(lines[i]);
            if (values.length === 0) continue;

            const row: ParsedRow = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Only add rows that have at least some data
            if (Object.values(row).some(v => v.trim() !== '')) {
                data.push(row);
            }
        }
        setCsvData(data);

        // Auto-suggest mappings
        const autoMappings: ColumnMapping[] = headers.map(header => {
            const lowerHeader = header.toLowerCase();
            let suggestedField = 'ignore';

            // Smart matching
            if (lowerHeader.includes('name') && !lowerHeader.includes('company')) suggestedField = 'name';
            else if (lowerHeader.includes('email')) suggestedField = 'email';
            else if (lowerHeader.includes('roll')) suggestedField = 'rollNo';
            else if (lowerHeader.includes('course')) suggestedField = 'course';
            else if (lowerHeader.includes('branch') || lowerHeader.includes('department')) suggestedField = 'branch';
            else if (lowerHeader.includes('year')) suggestedField = 'year';
            else if (lowerHeader.includes('cgpa') || lowerHeader.includes('gpa')) suggestedField = 'cgpa';
            else if (lowerHeader.includes('backlog')) suggestedField = 'backlogs';
            else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) suggestedField = 'phone';
            else if (lowerHeader.includes('dob') || lowerHeader.includes('birth')) suggestedField = 'dateOfBirth';
            else if (lowerHeader.includes('gender') || lowerHeader.includes('sex')) suggestedField = 'gender';
            else if (lowerHeader.includes('address')) suggestedField = 'address';
            else if (lowerHeader.includes('city')) suggestedField = 'city';
            else if (lowerHeader.includes('state')) suggestedField = 'state';
            else if (lowerHeader.includes('pin')) suggestedField = 'pincode';
            else if (lowerHeader.includes('10th') || lowerHeader.includes('tenth')) suggestedField = 'tenthMarks';
            else if (lowerHeader.includes('12th') || lowerHeader.includes('twelfth')) suggestedField = 'twelfthMarks';
            else if (lowerHeader.includes('skill')) suggestedField = 'skills';
            else if (lowerHeader.includes('certif')) suggestedField = 'certifications';
            else if (lowerHeader.includes('language')) suggestedField = 'languages';
            else if (lowerHeader.includes('project')) suggestedField = 'projects';
            else if (lowerHeader.includes('intern')) suggestedField = 'internships';
            else if (lowerHeader.includes('achieve')) suggestedField = 'achievements';
            else if (lowerHeader.includes('linkedin')) suggestedField = 'linkedinUrl';
            else if (lowerHeader.includes('github')) suggestedField = 'githubUrl';
            else if (lowerHeader.includes('portfolio')) suggestedField = 'portfolioUrl';
            else suggestedField = 'custom';

            return { csvColumn: header, studentField: suggestedField };
        });

        setColumnMappings(autoMappings);
        setStep(2);
    };

    const updateMapping = (csvColumn: string, studentField: string) => {
        setColumnMappings(prev =>
            prev.map(m => m.csvColumn === csvColumn ? { ...m, studentField } : m)
        );
    };

    const handleImport = () => {
        setImporting(true);

        try {
            const processedStudents: Student[] = [];
            const skippedRows: number[] = [];

            csvData.forEach((row, index) => {
                const student: any = {
                    id: `s${Date.now()}_${index}`,
                    password: autoGeneratePasswords ? PasswordGenerator.generate() : 'nfsu_123',
                    isVerified: markAsVerified,
                    isBlacklisted: false,
                    skills: [],
                    certifications: [],
                    customFields: {},
                    // Default values if missing
                    course: '',
                    year: new Date().getFullYear(),
                    backlogs: 0
                };

                columnMappings.forEach(mapping => {
                    const value = row[mapping.csvColumn]?.toString().trim();
                    if (!value || mapping.studentField === 'ignore') return;

                    if (mapping.studentField === 'custom') {
                        student.customFields[mapping.csvColumn] = value;
                    } else if (['skills', 'certifications', 'languages', 'projects', 'internships', 'achievements'].includes(mapping.studentField)) {
                        student[mapping.studentField] = value.split(/[;,]/).map(v => v.trim()).filter(v => v);
                    } else if (['year', 'backlogs', 'tenthMarks', 'twelfthMarks', 'diplomaMarks', 'graduationMarks'].includes(mapping.studentField)) {
                        student[mapping.studentField] = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
                    } else if (mapping.studentField === 'cgpa') {
                        student[mapping.studentField] = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
                    } else {
                        student[mapping.studentField] = value;
                    }
                });

                // Check if critical data exists
                if (student.name && student.email && student.rollNo) {
                    if (!student.branch) student.branch = 'General';
                    if (!student.course) student.course = 'M.Sc'; // Default ONLY if still empty
                    processedStudents.push(student as Student);
                } else {
                    // Only count as skipped if it's not a completely empty row (already filtered in parseCSV but good to be safe)
                    const hasAnyData = Object.values(row).some(v => v && v.toString().trim() !== '');
                    if (hasAnyData) {
                        skippedRows.push(index + 1);
                    }
                }
            });

            if (processedStudents.length === 0) {
                alert('No valid students found. Please verify that Name, Email, and Roll Number columns are correctly mapped and contain data.');
                setImporting(false);
                return;
            }

            if (skippedRows.length > 0) {
                const proceed = window.confirm(
                    `${skippedRows.length} row(s) were skipped because they missed critical information (Name, Email, or Roll Number). \n\n` +
                    `Import the remaining ${processedStudents.length} student(s)?`
                );
                if (!proceed) {
                    setImporting(false);
                    return;
                }
            }

            StorageService.bulkAddStudents(processedStudents);
            setImporting(false);
            setStep(3);
        } catch (error) {
            console.error('Import error:', error);
            alert('Error during import process. Please check your data format.');
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Smart CSV Import Wizard</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Step {step} of 3: {step === 1 ? 'Upload File' : step === 2 ? 'Map Columns' : 'Complete'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center py-12">
                                <Upload className="mx-auto text-slate-300 mb-4" size={64} />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload CSV or Excel File</h3>
                                <p className="text-sm text-slate-600 mb-6">
                                    Import student data from any CSV file, including Google Forms exports
                                </p>
                                <label className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    Choose CSV File
                                </label>
                                {csvFile && (
                                    <div className="mt-4 text-sm text-green-600 font-semibold">
                                        ✓ {csvFile.name} ({csvData.length} rows detected)
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    CSV Format Tips
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                                    <li>First row should contain column headers</li>
                                    <li><strong>Required fields:</strong> Name, Email, Roll Number (only these 3!)</li>
                                    <li>Optional fields will use defaults: Course (M.Sc), Year (current), CGPA (0), Branch (General)</li>
                                    <li>Use comma-separated values for skills, certifications, etc.</li>
                                    <li>Extra columns will be stored automatically in custom fields</li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h4 className="font-bold text-slate-900 mb-2">Sample CSV Format:</h4>
                                <pre className="text-xs text-slate-600 overflow-x-auto">
                                    {`Name,Email,Roll No,Course,Branch,Year,CGPA,Phone,Skills
Rajesh Kumar,rajesh@nfsu.ac.in,NFSU201,M.Sc,Forensic Science,2,8.5,9876543210,"Python,Java,React"
Anita Desai,anita@nfsu.ac.in,NFSU202,B.Tech,Cyber Security,3,9.0,9876543211,"JavaScript,SQL,AWS"`}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Map Columns */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h3 className="font-bold text-slate-900 mb-2">Map Your Columns</h3>
                                <p className="text-sm text-slate-600">
                                    We've auto-detected {csvHeaders.length} columns and suggested mappings. Review and adjust as needed.
                                </p>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {columnMappings.map((mapping, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4">
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900">{mapping.csvColumn}</div>
                                            <div className="text-xs text-slate-500">
                                                Sample: {csvData[0]?.[mapping.csvColumn] || 'N/A'}
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-slate-400" />
                                        <div className="flex-1">
                                            <select
                                                value={mapping.studentField}
                                                onChange={(e) => updateMapping(mapping.csvColumn, e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg p-2 text-sm font-semibold"
                                            >
                                                {studentFields.map(field => (
                                                    <option key={field.value} value={field.value}>
                                                        {field.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <h4 className="font-bold text-slate-900">Import Options</h4>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoGeneratePasswords}
                                        onChange={(e) => setAutoGeneratePasswords(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-700">Auto-generate secure passwords</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={markAsVerified}
                                        onChange={(e) => setMarkAsVerified(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-700">Mark all students as verified</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
                                >
                                    {importing ? 'Importing...' : `Import ${csvData.length} Students`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center py-12">
                            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Import Successful!</h3>
                            <p className="text-slate-600 mb-6">
                                {csvData.length} students have been imported successfully
                            </p>
                            <button
                                onClick={() => {
                                    onImportComplete();
                                    onClose();
                                }}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
