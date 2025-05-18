
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Users, Settings, Briefcase, Truck, Factory, Map, BarChart3, BotMessageSquare, ExternalLink, HelpCircle, Building, UserCheck, Search } from 'lucide-react';

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
  { id: 'dealers', type: 'page', title: 'Gestion Concessionnaires', description: 'Gérer les informations des concessionnaires.', href: '/dealers', icon: Building, keywords: ['concessionnaires', 'dealers', 'partenaires'] },
  { id: 'clients', type: 'page', title: 'Gestion Clients ManuRob', description: 'Gérer les clients directs de ManuRob.', href: '/clients', icon: Users, keywords: ['clients', 'customers', 'utilisateurs'] },
  { id: 'loadix-units', type: 'page', title: 'Gestion Engins LOADIX', description: 'Suivi et gestion des unités LOADIX.', href: '/loadix-units', icon: Truck, keywords: ['engins', 'loadix', 'machines', 'unités'] },
  { id: 'sites', type: 'page', title: 'Gestion Sites Méthanisation', description: 'Gérer les sites de méthanisation.', href: '/sites', icon: Factory, keywords: ['sites', 'méthanisation', 'installations'] },
  { id: 'service-records', type: 'page', title: 'Carnet de Santé', description: 'Consulter les historiques de maintenance.', href: '/service-records', icon: FileText, keywords: ['carnet', 'santé', 'maintenance', 'historique'] },
  { id: 'map', type: 'page', title: 'Carte Interactive', description: 'Visualiser les unités et sites sur une carte.', href: '/map', icon: Map, keywords: ['carte', 'map', 'localisation', 'géolocalisation'] },
  { id: 'prevention-plan', type: 'tool', title: 'Plan de Prévention', description: 'Remplir le formulaire de plan de prévention.', href: '/forms/prevention-plan', icon: FileText, keywords: ['plan', 'prévention', 'formulaire', 'sécurité'] },
  { id: 'ai-support', type: 'tool', title: 'AI Support Tool', description: 'Obtenir de l\'aide via l\'outil IA.', href: '/support', icon: BotMessageSquare, keywords: ['ai', 'support', 'aide', 'assistance', 'ia'] },
  { id: 'settings-users', type: 'page', title: 'Gestion Utilisateurs (Paramètres)', description: 'Gérer les comptes utilisateurs de l\'application.', href: '/settings/users', icon: UserCheck, keywords: ['paramètres', 'utilisateurs', 'comptes', 'administration'] },
  { id: 'documentation', type: 'section', title: 'Documentation LOADIX', description: 'Accéder à la documentation technique.', href: '/docs/loadix', icon: HelpCircle, keywords: ['documentation', 'manuel', 'guides'] },
  { id: 'profile', type: 'page', title: 'Mon Profil', description: 'Modifier vos informations personnelles.', href: '/profile', icon: Users, keywords: ['profil', 'compte', 'personnel'] },
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
      // Reset search query when dialog closes, after a small delay for animation
      setTimeout(() => setSearchQuery(''), 200);
    } else {
      // Focus input when dialog opens
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
    setSearchResults(filteredResults.slice(0, 10)); // Limit results for display
  }, [searchQuery]);

  const handleResultClick = (href: string) => {
    router.push(href);
    onOpenChange(false); // Close dialog on navigation
  };
  
  // Add keyboard navigation (Enter to select first result, Arrow keys)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
      // Basic Enter key handling for selecting the first result
      if (event.key === 'Enter' && searchResults.length > 0) {
        event.preventDefault(); // Prevent form submission if any
        handleResultClick(searchResults[0].href);
      }
    },
    [searchResults, onOpenChange, router] // router and handleResultClick (and its deps) need to be stable or included
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl p-0 bg-card/80 backdrop-blur-xl border-border/60 shadow-2xl"
        onKeyDown={handleKeyDown} // Add keydown listener to DialogContent
      >
        <DialogHeader className="p-6 pb-2">
          <Input
            id="global-search-input"
            type="search"
            placeholder="Rechercher dans LOADIX Manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none placeholder:text-muted-foreground/70"
            aria-label="Champ de recherche globale"
          />
        </DialogHeader>
        <div className="border-t border-border/30">
          {searchQuery.trim() !== '' && searchResults.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <p className="text-lg">Aucun résultat trouvé pour "{searchQuery}"</p>
              <p className="text-sm mt-1">Essayez avec d'autres mots-clés.</p>
            </div>
          )}
          {searchResults.length > 0 && (
            <ScrollArea className="max-h-[60vh] h-auto">
              <div className="p-3 space-y-1">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item.href)}
                    className="w-full text-left p-3 rounded-md hover:bg-primary/10 focus:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-150"
                    aria-label={`Aller à ${item.title}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          {searchQuery.trim() === '' && (
             <div className="p-10 text-center text-muted-foreground/80">
                <Search className="w-12 h-12 mx-auto mb-3"/>
                <p className="text-lg font-medium">Rechercher des pages, outils, ou paramètres.</p>
                <p className="text-sm mt-1">Commencez à taper pour voir les résultats apparaître ici.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

