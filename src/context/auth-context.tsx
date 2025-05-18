
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>; // Password optional for now
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to check localStorage
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs once on mount to check persisted auth state
    try {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedUser = localStorage.getItem('user');
      if (storedAuth === 'true' && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, any login is successful
    const dummyUser: User = {
      id: 'simulated-user-id',
      email: email,
      name: 'Admin ManuRob', // Placeholder name
      avatarUrl: 'https://placehold.co/100x100.png',
    };
    setUser(dummyUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(dummyUser));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to clear user from localStorage", error);
    }
    // No need to await router.push if we set isLoading to false after
    // router.push('/login'); // Redirection will be handled by the component calling logout or by the AuthenticatedAppLayout
    setIsLoading(false);
  }, []);

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
