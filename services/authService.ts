import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { User, Role } from "../types";

export const AuthService = {
    signUp: async (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    },

    signIn: async (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    logout: async () => {
        // Also clear session storage for local compatibility
        sessionStorage.removeItem('nfsu_user_session');
        return signOut(auth);
    },

    onAuthChange: (callback: (user: FirebaseUser | null) => void) => {
        return onAuthStateChanged(auth, callback);
    },

    // Helper to map Firebase user to our Application User type
    getCurrentUser: (): User | null => {
        const u = sessionStorage.getItem('nfsu_user_session');
        return u ? JSON.parse(u) : null;
    }
};
