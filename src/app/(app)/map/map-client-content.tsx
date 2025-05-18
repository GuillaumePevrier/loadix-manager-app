
'use client';

import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { AppEntity, EntityType, Dealer, Client, LoadixUnit, MethanisationSite } from '@/types';
// Removed direct import of APIProvider and Map as they will be dynamic
// import { APIProvider, Map } from '@vis.gl/react-google-maps'; 
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, User, Truck, Factory, MapPin as LocationIcon, Phone, Mail, Globe, 
  CalendarDays, Tag, Info, Hash, Power, ChevronsRight, X, Search, Filter, 
  Briefcase, Maximize, Minimize 
} from 'lucide-react';
import Link from 'next/link';
// Image import is no longer needed for the main map
// import Image from 'next/image';

// Dynamically import Google Maps components individually
const APIProvider = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.APIProvider),
  { ssr: false }
);

const Map = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.Map),
  { ssr: false }
);

const AdvancedMarker = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.AdvancedMarker),
  { ssr: false }
);

const Pin = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.Pin),
  { ssr: false }
);


interface MapClientContentProps {
  initialEntities: AppEntity[];
}

const entityTypeTranslations: Record<EntityType, string> = {
  'dealer': 'Concessionnaire',
  'client': 'Client',
  'loadix-unit': 'Engin LOADIX',
  'methanisation-site': 'Site de Méthanisation',
};

const getEntityIcon = (type: EntityType, className?: string): React.ReactNode => {
  const icons: Record<EntityType, React.ElementType> = {
    'dealer': Building,
    'client': User,
    'loadix-unit': Truck,
    'methanisation-site': Factory,
  };
  const IconComponent = icons[type] || Info;
  return <IconComponent className={className || "h-5 w-5"} />;
};

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | string[] | null | React.ReactNode; isLink?: boolean; isEmail?: boolean }> = ({ icon: Icon, label, value, isLink, isEmail }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number') return null;

  const renderValue = () => {
    if (React.isValidElement(value)) return value;
    if (Array.isArray(value)) return <div className="flex flex-wrap gap-2">{value.map((v, i) => <Badge key={i} variant="secondary">{v}</Badge>)}</div>;
    if (typeof value === 'string') {
      if (isLink) return <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{value}</a>;
      if (isEmail) return <a href={`mailto:${value}`} className="text-primary hover:underline break-all">{value}</a>;
    }
    return <span className="text-foreground/90 break-words">{String(value)}</span>;
  };

  return (
    <div className="flex items-start space-x-3 py-1.5">
      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

const DealerDetailContent: React.FC<{ dealer: Dealer }> = ({ dealer }) => ( <> <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} /> <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail /> <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink /> <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} /> {dealer.servicesOffered && dealer.servicesOffered.length > 0 && (<DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />)} </> );
const ClientDetailContent: React.FC<{ client: Client }> = ({ client }) => ( <> <DetailItem icon={User} label="Nom du Contact" value={client.contactName} /> <DetailItem icon={Mail} label="Email du Contact" value={client.contactEmail} isEmail /> <DetailItem icon={Phone} label="Téléphone du Contact" value={client.contactPhone} /> <DetailItem icon={Factory} label="Secteur d'Activité" value={client.industry} /> </>);
const LoadixUnitDetailContent: React.FC<{ unit: LoadixUnit }> = ({ unit }) => ( <> <DetailItem icon={Hash} label="Numéro de Série" value={unit.serialNumber} /> <DetailItem icon={Truck} label="Modèle" value={unit.model} /> <DetailItem icon={Power} label="Statut" value={unit.status ? <Badge variant={unit.status === 'active' ? 'default' : unit.status === 'maintenance' ? 'outline' : 'destructive'}>{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge> : null} /> <DetailItem icon={CalendarDays} label="Date d'achat" value={unit.purchaseDate ? new Date(unit.purchaseDate).toLocaleDateString() : undefined} /> <DetailItem icon={CalendarDays} label="Dernière Maintenance" value={unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate).toLocaleDateString() : undefined} /> </>);
const MethanisationSiteDetailContent: React.FC<{ site: MethanisationSite }> = ({ site }) => ( <> <DetailItem icon={Info} label="Capacité" value={site.capacity} /> <DetailItem icon={User} label="Opérateur" value={site.operator} /> <DetailItem icon={CalendarDays} label="Date de mise en service" value={site.startDate ? new Date(site.startDate).toLocaleDateString() : undefined} /> </>);


export default function MapClientContent({ initialEntities }: MapClientContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = React.useState<AppEntity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const filteredEntities = useMemo(() => {
    if (searchTerm.trim() === '' && selectedEntityType === 'all' && !isSearchFocused) {
        return []; 
    }
    return initialEntities.filter(entity => {
      const typeMatch = selectedEntityType === 'all' || entity.entityType === selectedEntityType;
      const searchMatch = searchTerm.trim() === '' ||
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entityTypeTranslations[entity.entityType] || '').toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [initialEntities, searchTerm, selectedEntityType, isSearchFocused]);

  const handleEntityClick = (entity: AppEntity) => {
    setSelectedEntity(entity);
    setIsSheetOpen(true);
    setIsSearchFocused(false); 
    setSearchTerm(''); 
  };
  
  const entityTypes: EntityType[] = ['dealer', 'client', 'loadix-unit', 'methanisation-site'];

  const renderEntitySpecificDetails = (entity: AppEntity) => {
    switch (entity.entityType) {
      case 'dealer': return <DealerDetailContent dealer={entity as Dealer} />;
      case 'client': return <ClientDetailContent client={entity as Client} />;
      case 'loadix-unit': return <LoadixUnitDetailContent unit={entity as LoadixUnit} />;
      case 'methanisation-site': return <MethanisationSiteDetailContent site={entity as MethanisationSite} />;
      default: return <p className="text-muted-foreground">Aucun détail spécifique pour ce type d'entité.</p>;
    }
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch((err) => {
        alert(`Erreur lors de la tentative d'activation du mode plein écran: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <TriangleAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Clé API Google Maps manquante</h2>
        <p className="text-muted-foreground">
          Veuillez configurer la variable d'environnement <code className="bg-muted px-1 py-0.5 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> pour afficher la carte.
        </p>
      </div>
    );
  }
  
  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <div className="relative h-full w-full overflow-hidden" ref={mapContainerRef}>
        <Map
          defaultCenter={{ lat: 48.8566, lng: 2.3522 }} // Paris
          defaultZoom={5}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapId="loadixManagerMap"
          style={{ width: '100%', height: '100%' }}
          className="opacity-90"
        >
          {/* Markers will be added here in a future step */}
        </Map>

        <div className="absolute top-4 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-4">
          <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-card/80 backdrop-blur-xl rounded-xl shadow-2xl border border-border/50">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une entité, une ville, un ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-11 w-full h-12 text-base bg-background/70 border-border/60 focus:bg-background"
              />
            </div>
            <Select
              value={selectedEntityType}
              onValueChange={(value) => setSelectedEntityType(value as EntityType | 'all')}
            >
              <SelectTrigger className="w-full md:w-[220px] h-12 bg-background/70 border-border/60 focus:bg-background text-base">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
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
        </div>

        {(isSearchFocused || searchTerm) && filteredEntities.length > 0 && (
          <div className="absolute top-20 left-1/2 z-10 w-full max-w-3xl -translate-x-1/2 px-4 mt-1">
            <Card className="max-h-[calc(50vh-3rem)] overflow-y-auto bg-card/90 backdrop-blur-lg border-border/50 shadow-xl">
              <CardContent className="p-2">
                <ul className="space-y-1">
                  {filteredEntities.slice(0, 10).map((entity) => (
                    <li key={entity.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-primary/10"
                        onClick={() => handleEntityClick(entity)}
                      >
                        <div className="flex items-center gap-3">
                          {getEntityIcon(entity.entityType, "h-5 w-5 text-primary/80")}
                          <div>
                            <p className="font-medium text-sm text-foreground">{entity.name}</p>
                            <p className="text-xs text-muted-foreground">{entityTypeTranslations[entity.entityType]} - {entity.city}</p>
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
        {(isSearchFocused || searchTerm) && filteredEntities.length === 0 && searchTerm.length > 0 && (
          <div className="absolute top-20 left-1/2 z-10 w-full max-w-3xl -translate-x-1/2 px-4 mt-1">
            <Card className="bg-card/90 backdrop-blur-lg border-border/50 shadow-xl">
              <CardContent className="p-4 text-center text-muted-foreground">
                Aucun résultat pour "{searchTerm}" avec le filtre "{selectedEntityType === 'all' ? 'Tous les types' : entityTypeTranslations[selectedEntityType] }".
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-card/80 backdrop-blur-md border-border/50 hover:bg-card text-foreground"
            title={isFullscreen ? "Quitter le mode plein écran" : "Passer en mode plein écran"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>

        {selectedEntity && (
          <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) setSelectedEntity(null); }}>
            <SheetContent 
              side="bottom" 
              className="h-[75vh] md:h-[60vh] flex flex-col rounded-t-xl bg-card/95 backdrop-blur-2xl border-t-border/50 shadow-2xl"
            >
              <SheetHeader className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2.5 rounded-lg shadow-sm">
                      {getEntityIcon(selectedEntity.entityType, "h-6 w-6")}
                    </div>
                    <div>
                      <SheetTitle className="text-2xl font-futura">{selectedEntity.name}</SheetTitle>
                      <SheetDescription className="text-sm font-bebas-neue tracking-wide text-primary/90">
                        {entityTypeTranslations[selectedEntity.entityType]}
                      </SheetDescription>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  <Card className="bg-background/50 border-border/40">
                    <CardHeader>
                      <CardTitle className="text-lg font-bebas-neue text-primary">Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <DetailItem icon={LocationIcon} label="Adresse" value={`${selectedEntity.address}, ${selectedEntity.postalCode} ${selectedEntity.city}, ${selectedEntity.country}`} />
                      <Badge variant="outline" className="text-xs">ID: {selectedEntity.id}</Badge>
                      <Badge variant="outline" className="ml-2 text-xs">Créé le: {new Date(selectedEntity.createdAt).toLocaleDateString()}</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/40">
                    <CardHeader>
                      <CardTitle className="text-lg font-bebas-neue text-primary">Détails Spécifiques</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      {renderEntitySpecificDetails(selectedEntity)}
                    </CardContent>
                  </Card>
                  
                  {selectedEntity.geoLocation && selectedEntity.geoLocation.latitude && selectedEntity.geoLocation.longitude && (
                    <Card className="bg-background/50 border-border/40">
                      <CardHeader>
                          <CardTitle className="text-lg font-bebas-neue text-primary">Localisation (Mini-carte)</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="h-40 w-full rounded-md overflow-hidden">
                            <Map
                                center={{ lat: selectedEntity.geoLocation.latitude, lng: selectedEntity.geoLocation.longitude }}
                                zoom={14}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                                mapId="miniMapLoadix"
                                style={{ width: '100%', height: '100%' }}
                            >
                                <AdvancedMarker position={{ lat: selectedEntity.geoLocation.latitude, lng: selectedEntity.geoLocation.longitude }}>
                                    <Pin />
                                </AdvancedMarker>
                            </Map>
                          </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
              <SheetFooter className="p-4 border-t border-border/30">
                  <Button variant="outline" asChild>
                      <Link href={`/item/${selectedEntity.entityType}/${selectedEntity.id}`}>
                          Voir la fiche complète <ChevronsRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
                  <SheetClose asChild>
                      <Button variant="default">Fermer</Button>
                  </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </APIProvider>
  );
}

// Helper icon for missing API key message
const TriangleAlert = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

