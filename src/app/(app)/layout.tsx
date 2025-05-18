
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import MainLayoutComponent from '@/components/layout/main-layout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // This ideally should not be reached if the useEffect redirect works quickly.
    // It serves as a fallback or content shield while redirecting.
    // Returning null or a minimal loader avoids rendering the app layout for unauthenticated users.
    return (
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ); 
  }

  // User is authenticated and not loading, render the main app layout
  return (
    <SidebarProvider defaultOpen={true}>
      <MainLayoutComponent>
        {children}
      </MainLayoutComponent>
    </SidebarProvider>
  );
}
