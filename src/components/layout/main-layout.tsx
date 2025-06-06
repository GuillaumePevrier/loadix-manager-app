
'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Loader2, Search } from 'lucide-react';
import Logo from '@/components/icons/logo';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import GlobalSearchDialog from '@/components/search/global-search-dialog';

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const noPaddingRoutes = [
    '/map',
    '/directory',
    '/dealers/create',
    '/loadix-units/create',
    '/methanisation-sites/create',
    '/tools/bulk-import'
  ];
  
  const editPageRegex = /^\/(dealers|loadix-units|methanisation-sites)\/edit\/[^/]+$/;
  const applyNoPadding = noPaddingRoutes.includes(pathname) || editPageRegex.test(pathname);


  return (
    <>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r-border/50">
        <SidebarHeader className="flex items-center p-4 h-16 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <Logo className="w-8 h-8 text-primary flex-shrink-0" alt="LOADIX App Logo" />
            <h1 className="text-xl font-futura font-semibold group-data-[collapsible=icon]:hidden text-primary">LOADIX</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-1">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          {authIsLoading ? (
            <div className="flex items-center justify-center p-2 h-[60px] group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <div className="flex items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
              <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 flex-shrink-0">
                {/* Removed AvatarImage, relying on placeholder or future user.avatarUrl if you implement it */}
                <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium truncate">{user.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email || 'admin@manurob.com'}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="group-data-[collapsible=icon]:hidden text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
                aria-label="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
             <div className="p-2 h-[60px] group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">{/* Placeholder */}</div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 md:px-6 border-b bg-background/80 backdrop-blur-md">
          <div className="flex items-center">
            <SidebarTrigger />
          </div>
          <div className="flex-1 text-center md:text-left">
            {/* Breadcrumbs or dynamic page title can go here */}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
              <span className="sr-only">Rechercher</span>
            </Button>
            <ThemeToggleButton />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
              <span className="sr-only">Paramètres</span>
            </Button>
          </div>
        </header>
        <main className={`flex-1 overflow-y-auto ${applyNoPadding ? '' : 'p-2 md:p-4 lg:p-6'}`}>
          {children}
        </main>
      </SidebarInset>
      <GlobalSearchDialog isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
