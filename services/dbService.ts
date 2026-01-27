import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { Student, Company, PlacementDrive, Application, Notice, Event } from "../types";

export const DbService = {
    // --- STUDENTS ---
    saveStudent: async (student: Student) => {
        await setDoc(doc(db, "students", student.id), student);
    },
    getStudent: async (id: string): Promise<Student | null> => {
        const snap = await getDoc(doc(db, "students", id));
        return snap.exists() ? snap.data() as Student : null;
    },
    getAllStudents: async (): Promise<Student[]> => {
        const snap = await getDocs(collection(db, "students"));
        return snap.docs.map(doc => doc.data() as Student);
    },
    deleteStudent: async (id: string) => {
        await deleteDoc(doc(db, "students", id));
    },

    // --- COMPANIES ---
    saveCompany: async (company: Company) => {
        await setDoc(doc(db, "companies", company.id), company);
    },
    getCompany: async (id: string): Promise<Company | null> => {
        const snap = await getDoc(doc(db, "companies", id));
        return snap.exists() ? snap.data() as Company : null;
    },
    getAllCompanies: async (): Promise<Company[]> => {
        const snap = await getDocs(collection(db, "companies"));
        return snap.docs.map(doc => doc.data() as Company);
    },

    // --- PLACEMENT DRIVES ---
    saveDrive: async (drive: PlacementDrive) => {
        await setDoc(doc(db, "drives", drive.id), drive);
    },
    getAllDrives: async (): Promise<PlacementDrive[]> => {
        const snap = await getDocs(collection(db, "drives"));
        return snap.docs.map(doc => doc.data() as PlacementDrive);
    },

    // --- APPLICATIONS ---
    saveApplication: async (app: Application) => {
        await setDoc(doc(db, "applications", app.id), app);
    },
    getAllApplications: async (): Promise<Application[]> => {
        const snap = await getDocs(collection(db, "applications"));
        return snap.docs.map(doc => doc.data() as Application);
    },

    // --- NOTICES ---
    saveNotice: async (notice: Notice) => {
        await setDoc(doc(db, "notices", notice.id), notice);
    },
    getAllNotices: async (): Promise<Notice[]> => {
        const q = query(collection(db, "notices"), orderBy("postedAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => doc.data() as Notice);
    },

    // --- EVENTS ---
    saveEvent: async (event: Event) => {
        await setDoc(doc(db, "events", event.id), event);
    },
    getAllEvents: async (): Promise<Event[]> => {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => doc.data() as Event);
    }
};
