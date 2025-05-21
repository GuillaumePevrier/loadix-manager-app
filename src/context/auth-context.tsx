
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Keep useRouter if redirects are handled here, though (app)/layout handles it too
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, // Renamed to avoid conflict with local signOut
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { app, auth as firebaseAuthInstance, allConfigPresent as firebaseConfigured } from '@/lib/firebase'; // Ensure auth is exported from firebase.ts

interface User {
  id: string;
  email: string | null; // Firebase email can be null
  name: string | null; // Firebase displayName can be null
  avatarUrl?: string | null; // Firebase photoURL can be null
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to wait for Firebase auth check
  const router = useRouter();

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuthInstance) {
      console.warn("Firebase Auth is not configured. Authentication will not work.");
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email || 'Utilisateur', // Fallback for name
          avatarUrl: firebaseUser.photoURL,
        };
        setUser(appUser);
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // router is not needed here as redirection is handled by layouts

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    if (!firebaseConfigured || !firebaseAuthInstance) {
      console.error("Firebase Auth is not configured. Cannot log in.");
      return false;
    }
    if (!password) {
      console.error("Password is required for email/password login.");
      return false;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuthInstance, email, password);
      // onAuthStateChanged will handle setting user and isAuthenticated state
      // router.replace('/'); // Redirection can be handled by the page or (app)/layout
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Firebase Login Error:', error.code, error.message);
      setIsLoading(false);
      // Potentially set an error state here to display to the user on the login page
      return false;
    }
  }, []); // router is not needed here

  const logout = useCallback(async () => {
    if (!firebaseConfigured || !firebaseAuthInstance) {
      console.error("Firebase Auth is not configured. Cannot log out.");
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(firebaseAuthInstance);
      // onAuthStateChanged will handle clearing user and isAuthenticated state
      // router.replace('/login'); // Redirection can be handled by the page or (app)/layout
    } catch (error) {
      console.error('Firebase Logout Error:', error);
    } finally {
      setIsLoading(false); 
    }
  }, []); // router is not needed here

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
