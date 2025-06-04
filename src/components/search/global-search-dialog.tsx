
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Users, Settings, Briefcase, Truck, Factory, Map, BarChart3, BotMessageSquare, ExternalLink, HelpCircle, Building, UserCheck, Search, UploadCloud } from 'lucide-react';

interface SearchableItem {
  id: string;
  type: 'page' | 'tool' | 'section';
  title: string;
  description?: string;
  href: string;
  icon: React.ElementType;
  keywords?: string[];
}

// Extended mock data - these should eventually come from a dynamic source or your sitemap
const MOCK_SEARCHABLE_ITEMS: SearchableItem[] = [
  { id: 'home', type: 'page', title: 'Accueil / Dashboard', description: 'Vue d\'ensemble et métriques clés.', href: '/', icon: BarChart3, keywords: ['accueil', 'dashboard', 'overview', 'metrics'] },
  { id: 'directory', type: 'page', title: 'Répertoire des Entités', description: 'Consulter et gérer concessionnaires, engins, sites.', href: '/directory', icon: Briefcase, keywords: ['répertoire', 'directory', 'entités', 'liste'] },
  { id: 'create-dealer', type: 'tool', title: 'Créer Fiche Concessionnaire', description: 'Ajouter un nouveau concessionnaire.', href: '/dealers/create', icon: Building, keywords: ['créer', 'nouveau', 'concessionnaire', 'fiche'] },
  { id: 'create-loadix', type: 'tool', title: 'Créer Fiche Engin LOADIX', description: 'Ajouter un nouvel engin LOADIX.', href: '/loadix-units/create', icon: Truck, keywords: ['créer', 'nouveau', 'engin', 'loadix', 'fiche'] },
  { id: 'create-site', type: 'tool', title: 'Créer Fiche Site Méthanisation', description: 'Ajouter un nouveau site de méthanisation.', href: '/methanisation-sites/create', icon: Factory, keywords: ['créer', 'nouveau', 'site', 'méthanisation', 'fiche'] },
  { id: 'service-records', type: 'page', title: 'Carnet de Santé', description: 'Consulter les historiques de maintenance.', href: '/service-records', icon: FileText, keywords: ['carnet', 'santé', 'maintenance', 'historique'] },
  { id: 'map', type: 'page', title: 'Carte Interactive', description: 'Visualiser les unités et sites sur une carte.', href: '/map', icon: Map, keywords: ['carte', 'map', 'localisation', 'géolocalisation'] },
  { id: 'prevention-plan', type: 'tool', title: 'Plan de Prévention', description: 'Remplir le formulaire de plan de prévention.', href: '/forms/prevention-plan', icon: FileText, keywords: ['plan', 'prévention', 'formulaire', 'sécurité'] },
  { id: 'ai-support', type: 'tool', title: 'AI Support Tool', description: 'Obtenir de l\'aide via l\'outil IA.', href: '/support', icon: BotMessageSquare, keywords: ['ai', 'support', 'aide', 'assistance', 'ia'] },
  { id: 'bulk-import', type: 'tool', title: 'Import en Masse', description: 'Importer des données depuis un fichier CSV.', href: '/tools/bulk-import', icon: UploadCloud, keywords: ['import', 'masse', 'csv', 'données', 'batch'] },
  { id: 'settings-users', type: 'page', title: 'Gestion Utilisateurs (Paramètres)', description: 'Gérer les comptes utilisateurs de l\'application.', href: '/settings/users', icon: UserCheck, keywords: ['paramètres', 'utilisateurs', 'comptes', 'administration'] },
  { id: 'documentation', type: 'section', title: 'Documentation LOADIX', description: 'Accéder à la documentation technique.', href: '/docs/loadix', icon: HelpCircle, keywords: ['documentation', 'manuel', 'guides'] },
];


interface GlobalSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function GlobalSearchDialog({ isOpen, onOpenChange }: GlobalSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setSearchQuery(''), 200);
    } else {
      const inputElement = document.getElementById('global-search-input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filteredResults = MOCK_SEARCHABLE_ITEMS.filter(item =>
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseQuery)) ||
      (item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseQuery)))
    );
    setSearchResults(filteredResults.slice(0, 10));
  }, [searchQuery]);

  const handleResultClick = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
      if (event.key === 'Enter' && searchResults.length > 0) {
        event.preventDefault();
        handleResultClick(searchResults[0].href);
      }
    },
    [searchResults, onOpenChange, router]
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg md:max-w-2xl p-0 bg-card/80 backdrop-blur-xl border-border/60 shadow-2xl"
        onKeyDown={handleKeyDown}

        // Add an accessible description for screen readers
 aria-describedby="global-search-description"
      >
        <div className="p-3 md:p-4 border-b border-border/30">
          <div className="rounded-md p-[1.5px] bg-gradient-to-r from-primary via-accent to-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card transition-all duration-300">
            <Input
              id="global-search-input"
              type="search"
              placeholder="Rechercher dans LOADIX Manager..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 md:h-12 text-base md:text-lg bg-card border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none placeholder:text-muted-foreground/70 rounded-[calc(var(--radius)-1.5px)]"
              aria-label="Champ de recherche globale"
            />
          </div>
        </div>

        {/* Visually hidden description for accessibility */}
 <VisuallyHidden id="global-search-description"><DialogDescription>Search for pages, tools, or entities within the application.</DialogDescription></VisuallyHidden>

        <div className="border-t border-border/30">
          {searchQuery.trim() !== '' && searchResults.length === 0 && (
            <div className="p-4 md:p-6 text-center text-muted-foreground">
              <p className="text-md md:text-lg">Aucun résultat trouvé pour "{searchQuery}"</p>
              <p className="text-xs md:text-sm mt-1">Essayez avec d'autres mots-clés.</p>
            </div>
          )}
          {searchResults.length > 0 && (
            <ScrollArea className="max-h-[50vh] md:max-h-[60vh] h-auto">
              <div className="p-2 md:p-3 space-y-0.5 md:space-y-1">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item.href)}
                    className="w-full text-left p-2 md:p-3 rounded-md hover:bg-primary/10 focus:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-150"
                    aria-label={`Aller à ${item.title}`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm md:text-base text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground ml-auto flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          {searchQuery.trim() === '' && (
             <div className="p-6 md:p-10 text-center text-muted-foreground/80">
                <Search className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3"/>
                <p className="text-md md:text-lg font-medium">Rechercher pages, outils, ou entités.</p>
                <p className="text-xs md:text-sm mt-1">Commencez à taper pour voir les résultats.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
