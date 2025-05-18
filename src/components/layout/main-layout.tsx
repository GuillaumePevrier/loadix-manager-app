import type { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import Logo from '@/components/icons/logo';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r-border/50">
        <SidebarHeader className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <Logo className="w-8 h-8 text-primary flex-shrink-0" />
            <h1 className="text-xl font-futura font-semibold group-data-[collapsible=icon]:hidden">LOADIX</h1>
          </Link>
          <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-2 flex-1">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>LM</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@manurob.com</p>
            </div>
            <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background/80 backdrop-blur-md">
          <div className="md:hidden"> {/* Mobile trigger */}
            <SidebarTrigger />
          </div>
          <div className="flex-1 text-center md:text-left">
            {/* Breadcrumbs or dynamic page title can go here */}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
