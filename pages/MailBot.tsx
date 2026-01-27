import React, { useState } from 'react';
import { generateEmailDraft } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { ListmonkService } from '../services/listmonkService';
import { Sparkles, Copy, Send, Check } from 'lucide-react';

export const MailBot: React.FC = () => {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [rawText, setRawText] = useState('');
    const [generatedDraft, setGeneratedDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const draft = await generateEmailDraft(company, role, rawText);
            setGeneratedDraft(draft);
        } catch (e) {
            setGeneratedDraft("Error: Ensure Gemini API Key is set and valid.");
        }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!generatedDraft) return;
        setSending(true);

        // Get all student emails
        const studentsData = await StorageService.getStudents();
        const studentEmails = studentsData.map(s => s.email);

        // Extract subject from generated draft (assuming first line is subject)
        const lines = generatedDraft.split('\n');
        let subject = `Placement Update: ${company} - ${role}`;
        if (lines[0].toLowerCase().includes('subject:')) {
            subject = lines[0].replace(/subject:/i, '').trim();
        }

        // Send via real Listmonk API
        const result = await ListmonkService.sendBulkNotification(studentEmails, subject, generatedDraft);

        setSending(false);
        if (result.success) {
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        } else {
            alert('Failed to send emails via Listmonk. Please check VITE_LISTMONK_URL and credentials in .env.local');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-purple-600" />
                    AI Mail Bot (Listmonk)
                </h1>
                <p className="text-gray-500">Generate professional notifications from raw text and send them instantly via your self-hosted Listmonk.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input className="w-full border p-2 rounded mb-3" value={company} onChange={e => setCompany(e.target.value)} />

                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input className="w-full border p-2 rounded mb-3" value={role} onChange={e => setRole(e.target.value)} />

                        <label className="block text-sm font-medium text-gray-700 mb-1">Raw Email Content</label>
                        <textarea
                            className="w-full border p-2 rounded h-40 text-sm"
                            placeholder="Paste the unstructured email text received from the company here..."
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                        ></textarea>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition flex justify-center items-center gap-2"
                        >
                            {loading ? 'Drafting...' : <><Sparkles size={16} /> Generate Official Draft</>}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                    <h3 className="font-semibold text-slate-700 mb-2">Preview</h3>
                    <div className="flex-1 bg-white p-4 rounded border border-gray-200 whitespace-pre-wrap text-sm text-gray-700 overflow-y-auto font-mono">
                        {generatedDraft || <span className="text-gray-400 italic">Draft will appear here...</span>}
                    </div>
                    {generatedDraft && (
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedDraft);
                                    alert('Copied to clipboard!');
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded text-sm hover:bg-gray-50"
                            >
                                <Copy size={16} /> Copy
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || !generatedDraft}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm transition ${sent ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {sending ? 'Sending...' : sent ? <><Check size={16} /> Notification Sent</> : <><Send size={16} /> Send Notification</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};