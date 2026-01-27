import { Student, PlacementDrive, Company } from '../types';
import { StorageService } from './storageService';

/**
 * Listmonk Email Service
 * Listmonk is a free, open-source self-hosted mailing service.
 * API Documentation: https://listmonk.app/docs/api/
 */

const LISTMONK_CONFIG = {
    url: import.meta.env.VITE_LISTMONK_URL || 'http://localhost:9000',
    username: import.meta.env.VITE_LISTMONK_USERNAME || 'admin',
    password: import.meta.env.VITE_LISTMONK_PASSWORD || 'listmonk',
};

// Base64 encode credentials for Basic Auth
const AUTH_HEADER = `Basic ${btoa(`${LISTMONK_CONFIG.username}:${LISTMONK_CONFIG.password}`)}`;

export const ListmonkService = {
    /**
     * Sends a transactional email using Listmonk's /api/tx endpoint.
     */
    sendTransactionalEmail: async (email: string, subject: string, body: string, templateId?: number) => {
        try {
            console.log(`[Listmonk] Sending transactional email to ${email}`);

            const response = await fetch(`${LISTMONK_CONFIG.url}/api/tx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_HEADER
                },
                body: JSON.stringify({
                    subscriber_email: email,
                    subject: subject,
                    body: body,
                    template_id: templateId || undefined,
                    content_type: 'html'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to send transactional email');
            }

            return { success: true };
        } catch (error) {
            console.error('[Listmonk Error]:', error);
            return { success: false, error };
        }
    },

    /**
     * Send welcome email to a new student.
     */
    sendStudentWelcomeEmail: async (student: Student) => {
        const subject = "🎓 Welcome to NFSU Placement Portal - Your Account is Ready!";
        const body = `
            <h2>Welcome to NFSU Dharwad</h2>
            <p>Dear ${student.name},</p>
            <p>Your account has been created. Use the following credentials to login:</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px;">
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Password:</strong> ${student.password}</p>
                <p><strong>Roll No:</strong> ${student.rollNo}</p>
            </div>
            <p><a href="${window.location.origin}/login">Login Here</a></p>
        `;
        return ListmonkService.sendTransactionalEmail(student.email, subject, body);
    },

    /**
     * Send bulk welcome emails.
     */
    sendBulkStudentWelcomeEmails: async (students: Student[]) => {
        let count = 0;
        for (const student of students) {
            const result = await ListmonkService.sendStudentWelcomeEmail(student);
            if (result.success) count++;
        }
        return count;
    },

    /**
     * Send company approval notification.
     */
    sendCompanyApprovalEmail: async (company: Company) => {
        const subject = "✅ Company Approved - NFSU Dharwad";
        const body = `
            <h2>Registration Successful</h2>
            <p>Dear ${company.hrName},</p>
            <p>Your company <strong>${company.name}</strong> has been approved. You can now login and manage recruitment drives.</p>
            <p><a href="${window.location.origin}/recruiter-login">Recruiter Login</a></p>
        `;
        return ListmonkService.sendTransactionalEmail(company.hrEmail, subject, body);
    },

    /**
     * Send drive notification to all eligible students.
     */
    notifyEligibleStudents: async (drive: PlacementDrive, company: Company) => {
        const eligibleStudents = await StorageService.getEligibleStudentsForDrive(drive);

        const subject = `🚀 Placement Drive: ${drive.role} at ${company.name}`;
        const body = `
            <h2>New Placement Opportunity</h2>
            <p>Dear Student,</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
                <p><strong>Company:</strong> ${company.name}</p>
                <p><strong>Role:</strong> ${drive.role}</p>
                <p><strong>CTC:</strong> ${drive.ctc}</p>
                <p><strong>Deadline:</strong> ${drive.deadline}</p>
            </div>
            <p><a href="${window.location.origin}/login">Click here to apply</a></p>
        `;

        let count = 0;
        for (const student of eligibleStudents) {
            const result = await ListmonkService.sendTransactionalEmail(student.email, subject, body);
            if (result.success) count++;
        }
        return { success: true, count };
    },

    /**
     * For AI Mail Bot bulk sends.
     */
    sendBulkNotification: async (recipients: string[], subject: string, body: string) => {
        const htmlBody = `<div style="white-space: pre-wrap; font-family: monospace;">${body}</div>`;
        let count = 0;
        for (const email of recipients) {
            const result = await ListmonkService.sendTransactionalEmail(email, subject, htmlBody);
            if (result.success) count++;
        }
        return { success: count > 0, count };
    }
};
