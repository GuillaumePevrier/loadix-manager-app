
'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import type { AppEntity, EntityType } from '@/types';
import dynamic from 'next/dynamic';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';

const APIProvider = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.APIProvider),
  { ssr: false }
);

const Map = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.Map),
  { ssr: false }
);

// We won't use AdvancedMarker and Pin in this simplified version yet
// const AdvancedMarker = dynamic(() => import('@vis.gl/react-google-maps').then(mod => mod.AdvancedMarker), { ssr: false });
// const Pin = dynamic(() => import('@vis.gl/react-google-maps').then(mod => mod.Pin), { ssr: false });

interface AltMapClientContentProps {
  initialEntities: AppEntity[];
}

const entityTypeTranslations: Record<EntityType, string> = {
  'dealer': 'Concessionnaire',
  'client': 'Client',
  'loadix-unit': 'Engin LOADIX',
  'methanisation-site': 'Site de Méthanisation',
};

const entityTypes: EntityType[] = ['dealer', 'client', 'loadix-unit', 'methanisation-site'];

export default function AltMapClientContent({ initialEntities }: AltMapClientContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | 'all'>('all');
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Filtering logic (can be used later if we add markers)
  const filteredEntities = useMemo(() => {
    return initialEntities.filter(entity => {
      const typeMatch = selectedEntityType === 'all' || entity.entityType === selectedEntityType;
      const searchMatch =
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.city.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [initialEntities, searchTerm, selectedEntityType]);

  if (!googleMapsApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive mb-4">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
        <h2 className="text-2xl font-semibold mb-2">Clé API Google Maps Manquante</h2>
        <p className="text-muted-foreground">
          Veuillez configurer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <div className="relative h-full w-full">
        {/* Map Container */}
        <div className="absolute inset-0 z-0">
          <Map
            defaultCenter={{ lat: 48.8566, lng: 2.3522 }} // Paris
            defaultZoom={6}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapId="loadixManagerAltMap"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Filter Bar */}
        <div className="absolute top-4 left-1/2 z-10 w-full max-w-lg -translate-x-1/2 px-4">
          <Card className="p-3 bg-card/80 backdrop-blur-xl shadow-xl border-border/50">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-background/70 border-border/60 focus:bg-background"
                />
              </div>
              <Select
                value={selectedEntityType}
                onValueChange={(value) => setSelectedEntityType(value as EntityType | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-background/70 border-border/60 focus:bg-background">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {entityTypeTranslations[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
        {/* We can add a list of filteredEntities here later if needed for debugging */}
      </div>
    </APIProvider>
  );
}
