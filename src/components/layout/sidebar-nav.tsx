
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
import { MapPin, FileText, Settings, BotMessageSquare, UserCheck, BarChart3, List, Wrench, UploadCloud } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: BarChart3, tooltip: 'Dashboard' },
  { href: '/directory', label: 'Répertoire', icon: List, tooltip: 'Répertoire des Entités' },
  {
    label: 'Gestion Technique',
    icon: Wrench,
    isGroup: true,
    subItems: [
        { href: '/service-records', label: 'Carnet de Santé', icon: FileText, tooltip: 'Carnets de Santé' },
        { href: '/map', label: 'Carte Interactive', icon: MapPin, tooltip: 'Carte Interactive' },
    ],
  },
  {
    label: 'Outils Annexes',
    icon: Settings,
    isGroup: true,
    subItems: [
        { href: '/forms/prevention-plan', label: 'Plan de Prévention', icon: FileText, tooltip: 'Formulaire Plan de Prévention' },
        { href: '/support', label: 'AI Support', icon: BotMessageSquare, tooltip: 'Outil Support AI' },
        { href: '/tools/bulk-import', label: 'Import en Masse', icon: UploadCloud, tooltip: 'Import en Masse de Données' },
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

