import { Student, Company, Application, Role, User, Admin, PlacementDrive, Notice, Event } from '../types';
import { DbService } from './dbService';

const KEYS = {
  USER: 'nfsu_user_session'
};

export const StorageService = {
  // --- ASYNC READS (Firebase) ---
  getStudents: async (): Promise<Student[]> => await DbService.getAllStudents(),
  getCompanies: async (): Promise<Company[]> => await DbService.getAllCompanies(),
  getDrives: async (): Promise<PlacementDrive[]> => await DbService.getAllDrives(),
  getApplications: async (): Promise<Application[]> => await DbService.getAllApplications(),

  getStudent: async (studentId: string): Promise<Student | undefined> => {
    const s = await DbService.getStudent(studentId);
    return s || undefined;
  },

  getCompany: async (companyId: string): Promise<Company | undefined> => {
    const c = await DbService.getCompany(companyId);
    return c || undefined;
  },

  // --- ELIGIBILITY ---
  getDrive: async (driveId: string): Promise<PlacementDrive | undefined> => {
    const drives = await DbService.getAllDrives();
    return drives.find(d => d.id === driveId);
  },

  getEligibleStudentsForDrive: async (drive: PlacementDrive): Promise<Student[]> => {
    const students = await StorageService.getStudents();
    return students.filter(s =>
      s.isVerified &&
      !s.isBlacklisted &&
      s.cgpa >= drive.minCgpa &&
      s.backlogs <= drive.maxBacklogs &&
      drive.eligibleBranches.includes(s.branch)
    );
  },

  // --- WRITES (Firebase) ---

  saveStudent: async (student: Student) => {
    await DbService.saveStudent(student);
  },

  registerStudent: async (student: Student): Promise<boolean> => {
    // Note: Use AuthService.signUp for actual registration
    await DbService.saveStudent(student);
    return true;
  },

  deleteStudent: async (studentId: string) => {
    await DbService.deleteStudent(studentId);
  },

  bulkDeleteStudents: async (studentIds: string[]) => {
    for (const id of studentIds) {
      await DbService.deleteStudent(id);
    }
  },

  verifyStudent: async (studentId: string) => {
    const student = await DbService.getStudent(studentId);
    if (student) {
      student.isVerified = true;
      await DbService.saveStudent(student);
    }
  },

  bulkVerifyStudents: async (studentIds: string[]) => {
    for (const id of studentIds) {
      await StorageService.verifyStudent(id);
    }
  },

  bulkBlacklistStudents: async (studentIds: string[], status: boolean) => {
    for (const id of studentIds) {
      const student = await DbService.getStudent(id);
      if (student) {
        student.isBlacklisted = status;
        await DbService.saveStudent(student);
      }
    }
  },

  importStudents: async (newStudents: Student[]) => {
    for (const s of newStudents) {
      await DbService.saveStudent(s);
    }
  },

  saveCompany: async (company: Company) => {
    await DbService.saveCompany(company);
  },

  saveDrive: async (drive: PlacementDrive) => {
    await DbService.saveDrive(drive);
  },

  approveCompany: async (companyId: string) => {
    const company = await DbService.getCompany(companyId);
    if (company) {
      company.isApproved = true;
      await DbService.saveCompany(company);
    }
  },

  saveApplication: async (app: Application) => {
    await DbService.saveApplication(app);
  },

  updateApplicationStatus: async (appId: string, status: any) => {
    const apps = await DbService.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (app) {
      app.status = status;
      await DbService.saveApplication(app);
    }
  },

  // --- AUTHENTICATION (Mixed) ---
  // Note: Prefer AuthService for real authentication
  getCurrentUser: (): User | null => {
    const u = sessionStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  logout: () => {
    sessionStorage.removeItem(KEYS.USER);
  },

  // --- NOTICES & EVENTS ---
  getNotices: async (): Promise<Notice[]> => await DbService.getAllNotices(),

  getActiveNotices: async (): Promise<Notice[]> => {
    const notices = await DbService.getAllNotices();
    return notices.filter((n: Notice) => n.isActive);
  },

  saveNotice: async (notice: Notice) => {
    await DbService.saveNotice(notice);
  },

  deleteNotice: async (noticeId: string) => {
    // Implement delete if needed in DbService
  },

  getEvents: async (): Promise<Event[]> => await DbService.getAllEvents(),

  getActiveEvents: async (): Promise<Event[]> => {
    const events = await DbService.getAllEvents();
    return events.filter((e: Event) => e.isActive);
  },

  saveEvent: async (event: Event) => {
    await DbService.saveEvent(event);
  }
};