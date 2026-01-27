import { Student, PlacementDrive, Company } from '../types';
import { StorageService } from './storageService';

/**
 * MailService based on Listmonk (Recommended for NFSU Project).
 * Listmonk is a high-performance, self-hosted newsletter and mailing list manager.
 * It provides a simple HTTP API for transactional and bulk emails.
 */
export const MailService = {
    /**
     * Sends an automated notification to all eligible students when a new drive is posted.
     */
    sendAutomatedDriveNotification: async (drive: PlacementDrive, company: Company) => {
        const eligibleStudents = StorageService.getEligibleStudentsForDrive(drive);

        if (eligibleStudents.length === 0) {
            console.warn("No eligible students found for this drive. Skipping email.");
            return;
        }

        const subject = `New Opportunity: ${drive.role} at ${company.name}`;
        const content = `
            Dear Student,
            
            A new placement drive has been posted by ${company.name} for the role of ${drive.role}.
            
            Details:
            - CTC: ${drive.ctc}
            - Eligibility: Min ${drive.minCgpa} CGPA, Max ${drive.maxBacklogs} Backlogs
            - Branches: ${drive.eligibleBranches.join(', ')}
            - Deadline: ${drive.deadline}
            
            Log in to the NFSU Placement Portal to apply now.
            
            Best Regards,
            Placement Cell, NFSU Dharwad
        `;

        // Simulate Listmonk API call
        return MailService.mockSend(eligibleStudents.map(s => s.email), subject, content);
    },

    /**
     * Sends a custom notification (used by the Mail Bot).
     */
    sendCustomNotification: async (recipients: string[], subject: string, body: string) => {
        if (recipients.length === 0) return;

        // In a real Listmonk setup, you would use:
        // fetch(`${LISTMONK_URL}/api/tx`, {
        //   method: 'POST',
        //   headers: { 'Authorization': `token ${API_KEY}` },
        //   body: JSON.stringify({ email: recipients, subject, body, content_type: 'html' })
        // })

        return MailService.mockSend(recipients, subject, body);
    },

    /**
     * Mock sender for demonstration in the local environment.
     */
    mockSend: async (emails: string[], subject: string, body: string) => {
        console.log(`[MailService] Sending email to ${emails.length} recipients...`);
        console.log(`[Subject]: ${subject}`);
        console.log(`[Body Preview]: ${body.substring(0, 100)}...`);

        // Artificial delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            recipientCount: emails.length,
            timestamp: new Date().toISOString()
        };
    }
};
