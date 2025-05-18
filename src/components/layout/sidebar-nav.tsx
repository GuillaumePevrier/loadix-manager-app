// src/components/layout/sidebar-nav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Users, Wrench, Map, FileText, Settings, BotMessageSquare, Truck, Factory, Building, UserCheck, Briefcase, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: BarChart3, tooltip: 'Dashboard' }, // Changed Home to BarChart3 for Dashboard
  {
    label: 'Gestion Commerciale',
    icon: Briefcase, 
    isGroup: true,
    subItems: [
      { href: '/dealers', label: 'Concessionnaires', icon: Building, tooltip: 'Gestion Concessionnaires' },
      { href: '/clients', label: 'Clients ManuRob', icon: Users, tooltip: 'Gestion Clients' },
    ],
  },
  {
    label: 'Gestion Technique',
    icon: Wrench,
    isGroup: true,
    subItems: [
        { href: '/loadix-units', label: 'Engins LOADIX', icon: Truck, tooltip: 'Gestion Engins LOADIX' },
        { href: '/sites', label: 'Sites Méthanisation', icon: Factory, tooltip: 'Gestion Sites' },
        { href: '/service-records', label: 'Carnet de Santé', icon: FileText, tooltip: 'Carnets de Santé' },
    ],
  },
  { href: '/map', label: 'Carte Interactive', icon: Map, tooltip: 'Carte Interactive' },
  {
    label: 'Outils Annexes',
    icon: Settings, // Using Settings as a generic tool icon, could be Puzzle piece or other
    isGroup: true,
    subItems: [
        { href: '/forms/prevention-plan', label: 'Plan de Prévention', icon: FileText, tooltip: 'Formulaire Plan de Prévention' },
        { href: '/support', label: 'AI Support', icon: BotMessageSquare, tooltip: 'Outil Support AI' },
    ],
  },
  {
    label: 'Paramètres',
    icon: Settings,
    isGroup: true,
    subItems: [
        { href: '/settings/users', label: 'Utilisateurs', icon: UserCheck, tooltip: 'Gestion Utilisateurs' },
    ],
  }
];


export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <React.Fragment key={item.label || item.href}>
          {item.isGroup ? (
            <SidebarMenuItem className="mt-2 first:mt-0">
              <div className="px-2 pt-2 pb-1 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-bebas-neue tracking-wider text-sidebar-foreground/60">
                  {item.label.toUpperCase()}
                </span>
              </div>
              {item.subItems?.map((subItem) => (
                <SidebarMenuButton
                    key={subItem.href}
                    asChild
                    isActive={pathname === subItem.href || (pathname.startsWith(subItem.href + '/') && subItem.href !== '/')}
                    tooltip={subItem.tooltip}
                    variant="default" 
                    size="default"
                >
                    <Link href={subItem.href}>
                        <subItem.icon />
                        <span className="group-data-[collapsible=icon]:hidden">{subItem.label}</span>
                    </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.tooltip}
                variant="default"
                size="default"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </React.Fragment>
      ))}
    </SidebarMenu>
  );
}
