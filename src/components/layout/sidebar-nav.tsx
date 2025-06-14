'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { MapPin, FileText, Settings, BotMessageSquare, UserCheck, BarChart3, List, Wrench, UploadCloud, Factory, Building } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: BarChart3, tooltip: 'Dashboard' },
  {
    label: 'Gestion Technique',
    icon: Wrench,
    isGroup: true,
    subItems: [
      { href: '/directory', label: 'Toutes Entités', icon: List, tooltip: 'Répertoire de toutes les Entités' },
      { href: '/map', label: 'Carte Interactive', icon: MapPin, tooltip: 'Carte Interactive' },
    ],
  },
  {
    label: 'Outils Annexes',
    icon: Settings, // Changed to a more generic 'Settings' or 'Tool' icon
    isGroup: true,
    subItems: [
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
  },
];


export default function SidebarNav() {
  const pathname = usePathname();
  const { setOpen, isMobile } = useSidebar();

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
                    onClick={() => isMobile && setOpen(false)}

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
                onClick={() => isMobile && setOpen(false)}
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
