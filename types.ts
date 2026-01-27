export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  RECRUITER = 'RECRUITER',
  GUEST = 'GUEST'
}

export enum ApplicationStatus {
  APPLIED = 'Applied',
  SHORTLISTED = 'Shortlisted',
  TECHNICAL = 'Technical Round',
  HR = 'HR Round',
  SELECTED = 'Selected',
  REJECTED = 'Rejected'
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Student {
  // Core Identity
  id: string;
  name: string;
  email: string;
  password: string;
  rollNo: string;

  // Academic Info
  course: string;
  branch: string;
  year: number;
  cgpa: number;
  backlogs: number;

  // Additional Academic Details
  tenthMarks?: number;
  twelfthMarks?: number;
  diplomaMarks?: number;
  graduationMarks?: number;

  // Contact Information
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Professional Info
  skills: string[];
  certifications: string[];
  languages?: string[];
  projects?: string[];
  internships?: string[];
  achievements?: string[];

  // Social Links
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;

  // Resume
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;

  // Status
  isVerified: boolean;
  isBlacklisted: boolean;
  placedCompanyId?: string;
  lastUpdated?: string;

  // Flexible metadata for custom fields from imports
  customFields?: Record<string, any>;
}

export interface Company {
  id: string;
  name: string;
  hrName: string;
  hrEmail: string;
  password: string;
  isApproved: boolean; // Needs admin approval to login
  description?: string;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  role: string;
  ctc: string;
  minCgpa: number;
  eligibleBranches: string[];
  maxBacklogs: number;
  deadline: string;
  description: string;
  rounds: string[];
  status: 'Open' | 'Closed';
}

export interface Application {
  id: string;
  studentId: string;
  driveId: string; // Links to specific drive, not just company
  status: ApplicationStatus;
  currentRound: number; // Current round number (0-indexed)
  roundStatuses: RoundStatus[]; // Detailed history of each round
  appliedAt: string;
  lastUpdated: string;
  verified: boolean;
  feedback?: string; // Overall feedback
}

export interface RoundStatus {
  roundNumber: number; // 0-indexed
  roundName: string; // e.g., "Aptitude Test", "Technical Interview", "HR Round"
  status: 'Pending' | 'Scheduled' | 'Cleared' | 'Rejected';
  scheduledDate?: string;
  completedDate?: string;
  feedback?: string;
  updatedBy?: string; // Admin/Recruiter who updated
  updatedAt?: string;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  postedAt: string;
  postedBy: string; // Admin name
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // Event date
  month: string; // e.g., "Oct", "Nov"
  day: string; // e.g., "15", "01"
  postedAt: string;
  postedBy: string; // Admin name
  isActive: boolean;
}