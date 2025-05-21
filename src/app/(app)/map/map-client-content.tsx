
'use client';

import * as React from 'react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { AppEntity, EntityType, Dealer, LoadixUnit, MethanisationSite, GeoLocation } from '@/types';
import { TRACTOR_BRAND_OPTIONS, MACHINE_TYPE_OPTIONS, LOADIX_STATUS_OPTIONS, LOADIX_MODEL_OPTIONS } from '@/types';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import {
  Building, User, Truck, Factory, MapPin as LocationIcon, Phone, Mail, Globe,
  CalendarDays, Tag, Info, Hash, Power, ChevronsRight, X, Search as SearchIcon, Filter,
  Maximize, Minimize, ListChecks, LocateFixed, SlidersHorizontal, ExternalLink as ExternalLinkIcon, Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
// import { useMap } from '@vis.gl/react-google-maps'; // Removed useMap from here
import { useToast } from '@/hooks/use-toast';


// Dynamically import Google Maps components
const APIProvider = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.APIProvider),
  { ssr: false }
);

const MapComponent = dynamic(() => 
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

const InfoWindow = dynamic(() =>
    import('@vis.gl/react-google-maps').then((mod) => mod.InfoWindow),
    { ssr: false }
);


interface MapClientContentProps {
  initialEntities: AppEntity[];
}

const entityTypeTranslations: Record<EntityType, string> = {
  'dealer': 'Concessionnaire',
  'loadix-unit': 'Engin LOADIX',
  'methanisation-site': 'Site de Méthanisation',
};

const entityPinColors: Record<EntityType, { background: string; glyphColor: string; borderColor?: string }> = {
    'dealer': { background: "hsl(var(--primary))", glyphColor: "hsl(var(--primary-foreground))", borderColor: "hsl(var(--primary-foreground))" },
    'loadix-unit': { background: "hsl(var(--destructive))", glyphColor: "hsl(var(--destructive-foreground))", borderColor: "hsl(var(--destructive-foreground))" },
    'methanisation-site': { background: "hsl(var(--accent))", glyphColor: "hsl(var(--accent-foreground))", borderColor: "hsl(var(--accent-foreground))" },
};


const getEntityIcon = (type: EntityType, className?: string): React.ReactNode => {
  const icons: Record<EntityType, React.ElementType> = {
    'dealer': Building,
    'loadix-unit': Truck,
    'methanisation-site': Factory,
  };
  const IconComponent = icons[type] || ListChecks;
  return <IconComponent className={className || "h-5 w-5"} />;
};

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | string[] | null | React.ReactNode; isLink?: boolean; isEmail?: boolean }> = ({ icon: Icon, label, value, isLink, isEmail }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number' && !(Array.isArray(value) && value.length > 0)) return null;

  const renderValue = () => {
    if (React.isValidElement(value)) return value;
    if (Array.isArray(value)) return <div className="flex flex-wrap gap-1">{value.map((v, i) => <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>)}</div>;
    if (typeof value === 'string') {
      if (isLink) return <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all text-sm">{value}</a>;
      if (isEmail) return <a href={`mailto:${value}`} className="text-primary hover:underline break-all text-sm">{value}</a>;
    }
    return <span className="text-foreground/90 break-words text-sm">{String(value)}</span>;
  };

  return (
    <div className="flex items-start space-x-2 py-1">
      <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

const DealerDetailContent: React.FC<{ dealer: Dealer }> = ({ dealer }) => ( <> <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} /> <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail /> <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink /> <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} /> {dealer.servicesOffered && dealer.servicesOffered.length > 0 && (<DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />)} </> );
const LoadixUnitDetailContent: React.FC<{ unit: LoadixUnit }> = ({ unit }) => ( <> <DetailItem icon={Hash} label="Numéro de Série" value={unit.serialNumber} /> <DetailItem icon={Truck} label="Modèle" value={unit.model} /> <DetailItem icon={Power} label="Statut" value={unit.status ? <Badge variant={unit.status === 'active' ? 'success' as any : unit.status === 'maintenance' ? 'default' : unit.status === 'in_stock' ? 'secondary' : 'destructive'} className="text-xs">{LOADIX_STATUS_OPTIONS.find(opt => opt.value === unit.status)?.label || unit.status}</Badge> : null} /> <DetailItem icon={CalendarDays} label="Date d'achat" value={unit.purchaseDate ? new Date(unit.purchaseDate).toLocaleDateString() : undefined} /> <DetailItem icon={CalendarDays} label="Dernière Maintenance" value={unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate).toLocaleDateString() : undefined} /> </>);
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
  const { toast } = useToast();

  const isMobile = useIsMobile();
  
  // State for map center and zoom, to control the map declaratively
  const [mapCenter, setMapCenter] = useState<GeoLocation>({ lat: 46.2276, lng: 2.2137 }); // Default: France
  const [mapZoom, setMapZoom] = useState(6); // Default zoom for overview

  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Advanced filter states
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState(''); // Placeholder, as region data isn't structured yet
  const [tractorBrandsFilter, setTractorBrandsFilter] = useState<string[]>([]);
  const [machineTypesFilter, setMachineTypesFilter] = useState<string[]>([]);
  const [brandSignFilter, setBrandSignFilter] = useState('');
  const [branchNameFilter, setBranchNameFilter] = useState('');
  const [loadixStatusFilter, setLoadixStatusFilter] = useState<LoadixUnit['status'] | ''>('');
  const [loadixModelFilter, setLoadixModelFilter] = useState('');
  const [siteCapacityFilter, setSiteCapacityFilter] = useState('');
  const [siteOperatorFilter, setSiteOperatorFilter] = useState('');

  const [selectedMarkerForInfoWindow, setSelectedMarkerForInfoWindow] = useState<AppEntity | null>(null);


  const entitiesForMarkers = useMemo(() => {
    return initialEntities.filter(entity => {
      const typeMatch = selectedEntityType === 'all' || entity.entityType === selectedEntityType;
      
      const mainSearchMatch = searchTerm.trim() === '' ||
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.city && entity.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entityTypeTranslations[entity.entityType] || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!typeMatch || !mainSearchMatch || !entity.geoLocation) return false;

      // Advanced Filters Logic
      if (showAdvancedFilters) {
        if (entity.entityType === 'dealer') {
          const dealer = entity as Dealer;
          if (departmentFilter && !dealer.department?.toLowerCase().includes(departmentFilter.toLowerCase())) return false;
          if (brandSignFilter && !dealer.brandSign?.toLowerCase().includes(brandSignFilter.toLowerCase())) return false;
          if (branchNameFilter && !dealer.branchName?.toLowerCase().includes(branchNameFilter.toLowerCase())) return false;
          if (tractorBrandsFilter.length > 0 && !tractorBrandsFilter.some(brand => dealer.tractorBrands?.includes(brand))) return false;
          if (machineTypesFilter.length > 0 && !machineTypesFilter.some(type => dealer.machineTypes?.includes(type))) return false;
        } else if (entity.entityType === 'loadix-unit') {
          const unit = entity as LoadixUnit;
          if (loadixStatusFilter && unit.status !== loadixStatusFilter) return false;
          if (loadixModelFilter && !unit.model.toLowerCase().includes(loadixModelFilter.toLowerCase())) return false;
        } else if (entity.entityType === 'methanisation-site') {
          const site = entity as MethanisationSite;
          if (siteCapacityFilter && !site.capacity?.toLowerCase().includes(siteCapacityFilter.toLowerCase())) return false;
          if (siteOperatorFilter && !site.operator?.toLowerCase().includes(siteOperatorFilter.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [
    initialEntities, searchTerm, selectedEntityType, showAdvancedFilters,
    departmentFilter, regionFilter, tractorBrandsFilter, machineTypesFilter, brandSignFilter, branchNameFilter,
    loadixStatusFilter, loadixModelFilter, siteCapacityFilter, siteOperatorFilter
  ]);

  const searchResultsEntities = useMemo(() => {
    if (searchTerm.trim() === '' && selectedEntityType === 'all' && !isSearchFocused && !showAdvancedFilters) { 
        return [];
    }
    return entitiesForMarkers;
  }, [entitiesForMarkers, searchTerm, selectedEntityType, isSearchFocused, showAdvancedFilters]);


  const handleEntityClick = (entity: AppEntity) => {
    setIsSearchFocused(false); 
    if (isMobile) {
      setSelectedEntity(entity);
      setIsSheetOpen(true);
    } else {
      setSelectedMarkerForInfoWindow(entity);
      if (entity.geoLocation) {
        setMapCenter(entity.geoLocation); // Center map on selected marker for InfoWindow
        setMapZoom(15); // Zoom in
      }
    }
  };

  const entityTypes: EntityType[] = ['dealer', 'loadix-unit', 'methanisation-site'];

  const renderEntitySpecificDetails = (entity: AppEntity) => {
    switch (entity.entityType) {
      case 'dealer': return <DealerDetailContent dealer={entity as Dealer} />;
      case 'loadix-unit': return <LoadixUnitDetailContent unit={entity as LoadixUnit} />;
      case 'methanisation-site': return <MethanisationSiteDetailContent site={entity as MethanisationSite} />;
      default: return <p className="text-muted-foreground">Aucun détail spécifique pour ce type d'entité.</p>;
    }
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch((err) => {
        toast({ title: "Erreur Plein Écran", description: err.message, variant: "destructive"});
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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast({ title: "Géolocalisation non supportée", description: "Votre navigateur ne supporte pas la géolocalisation.", variant: "destructive"});
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        setMapCenter(newLocation); // Update map center state
        setMapZoom(15); // Update map zoom state
        setLocatingUser(false);
        toast({ title: "Position trouvée", description: "Carte centrée sur votre position."});
      },
      (error) => {
        console.error("Error getting user location:", error);
        toast({ title: "Erreur de géolocalisation", description: error.message, variant: "destructive"});
        setLocatingUser(false);
      }
    );
  };


  if (!googleMapsApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8 bg-background">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive mb-3">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
        <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Clé API Google Maps Manquante</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Veuillez configurer <code className="bg-muted px-1 py-0.5 rounded-sm text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> dans vos variables d'environnement.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <div className="relative h-full w-full" ref={mapContainerRef}>
        <div className="absolute inset-0 z-0">
          <MapComponent
            center={mapCenter}
            zoom={mapZoom}
            onCenterChanged={(ev) => setMapCenter(ev.detail.center)} // Keep state in sync if user pans
            onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}   // Keep state in sync if user zooms
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            mapId="loadixManagerMainMapV2"
            className="w-full h-full"
          >
            {entitiesForMarkers.map((entity) => {
              if (entity.geoLocation && typeof entity.geoLocation.lat === 'number' && typeof entity.geoLocation.lng === 'number') {
                const pinStyle = entityPinColors[entity.entityType] || entityPinColors['dealer'];
                return (
                  <AdvancedMarker
                    key={entity.id}
                    position={{ lat: entity.geoLocation.lat, lng: entity.geoLocation.lng }}
                    onClick={() => handleEntityClick(entity)}
                    title={entity.name}
                  >
                    <Pin
                      background={pinStyle.background}
                      borderColor={pinStyle.borderColor || pinStyle.background}
                      glyphColor={pinStyle.glyphColor}
                    />
                  </AdvancedMarker>
                );
              }
              return null;
            })}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Votre Position">
                <Pin background={"#4285F4"} glyphColor={"#FFFFFF"} borderColor={"#FFFFFF"} />
              </AdvancedMarker>
            )}
             {selectedMarkerForInfoWindow && !isMobile && selectedMarkerForInfoWindow.geoLocation && (
              <InfoWindow
                position={selectedMarkerForInfoWindow.geoLocation}
                onCloseClick={() => setSelectedMarkerForInfoWindow(null)}
                pixelOffset={[0,-35]} 
              >
                <Card className="w-64 shadow-lg border-border/50 bg-card/90 backdrop-blur-md">
                  <CardHeader className="p-3">
                    <div className="flex items-start gap-2">
                       {getEntityIcon(selectedMarkerForInfoWindow.entityType, "h-5 w-5 text-primary")}
                        <div>
                            <CardTitle className="text-base font-semibold leading-tight">{selectedMarkerForInfoWindow.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{entityTypeTranslations[selectedMarkerForInfoWindow.entityType]}</p>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-xs">
                    <p className="text-muted-foreground line-clamp-2">
                      {selectedMarkerForInfoWindow.address}, {selectedMarkerForInfoWindow.city}
                    </p>
                     <Button variant="link" asChild className="p-0 h-auto text-xs mt-1.5">
                        <Link href={`/item/${selectedMarkerForInfoWindow.entityType}/${selectedMarkerForInfoWindow.id}`}>
                            Voir la fiche complète <ExternalLinkIcon className="ml-1 h-3 w-3"/>
                        </Link>
                     </Button>
                  </CardContent>
                </Card>
              </InfoWindow>
            )}
          </MapComponent>
        </div>

        <div className="absolute top-2 md:top-3 left-1/2 z-20 w-[calc(100%-1rem)] sm:w-full max-w-lg md:max-w-xl -translate-x-1/2 px-2 md:px-0">
          <Card className="p-2 md:p-3 bg-card/80 backdrop-blur-xl rounded-lg md:rounded-xl shadow-xl border border-border/50">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-grow w-full animated-gradient-border-wrapper">
                <div className="relative flex items-center">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par nom, ville, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    // onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} // Delay blur to allow click on results
                    className="pl-9 w-full h-10 text-sm md:h-11 md:text-base bg-card border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none rounded-[calc(var(--radius)-1.5px)] placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
              <div className="flex items-center w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                <Select
                    value={selectedEntityType}
                    onValueChange={(value) => setSelectedEntityType(value as EntityType | 'all')}
                >
                    <SelectTrigger className="w-full sm:w-[150px] md:w-[180px] h-10 text-sm md:h-11 md:text-base bg-background/70 border-border/60 focus:bg-background flex-shrink-0">
                    <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground hidden sm:inline-block" />
                    <SelectValue placeholder="Filtrer type" />
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
                <Button variant="outline" size="icon" onClick={() => setShowAdvancedFilters(prev => !prev)} className="h-10 w-10 md:h-11 md:w-11 bg-background/70 border-border/60 hover:bg-accent text-foreground flex-shrink-0">
                    <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5"/>
                    <span className="sr-only">Plus de filtres</span>
                </Button>
              </div>
            </div>
             {showAdvancedFilters && (
                <div className="mt-2 p-3 bg-background/50 rounded-md border border-border/30 space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b border-border/50 pb-1.5 mb-2">Filtres Avancés ({entityTypeTranslations[selectedEntityType as EntityType] || 'Tous'})</h4>
                    
                    {selectedEntityType === 'all' && <p className="text-xs text-muted-foreground italic text-center">Sélectionnez un type d'entité pour voir les filtres spécifiques.</p>}

                    {selectedEntityType === 'dealer' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="deptFilter" className="text-xs">Département</Label>
                                    <Input id="deptFilter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} placeholder="Ex: 75" className="h-8 text-xs mt-0.5"/>
                                </div>
                                <div>
                                    <Label htmlFor="regionFilter" className="text-xs">Région (Texte)</Label>
                                    <Input id="regionFilter" value={regionFilter} onChange={e => setRegionFilter(e.target.value)} placeholder="Ex: Île-de-France" className="h-8 text-xs mt-0.5"/>
                                </div>
                            </div>
                             <div>
                                <Label className="text-xs">Marques de Tracteurs</Label>
                                <MultiSelect options={TRACTOR_BRAND_OPTIONS} selected={tractorBrandsFilter} onChange={setTractorBrandsFilter} placeholder="Toutes les marques" triggerClassName="h-8 text-xs mt-0.5"/>
                            </div>
                            <div>
                                <Label className="text-xs">Types de Machines</Label>
                                <MultiSelect options={MACHINE_TYPE_OPTIONS} selected={machineTypesFilter} onChange={setMachineTypesFilter} placeholder="Tous les types" triggerClassName="h-8 text-xs mt-0.5"/>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="brandSignFilter" className="text-xs">Enseigne</Label>
                                    <Input id="brandSignFilter" value={brandSignFilter} onChange={e => setBrandSignFilter(e.target.value)} placeholder="Nom enseigne..." className="h-8 text-xs mt-0.5"/>
                                </div>
                                <div>
                                    <Label htmlFor="branchNameFilter" className="text-xs">Succursale</Label>
                                    <Input id="branchNameFilter" value={branchNameFilter} onChange={e => setBranchNameFilter(e.target.value)} placeholder="Nom succursale..." className="h-8 text-xs mt-0.5"/>
                                </div>
                            </div>
                        </>
                    )}
                    {selectedEntityType === 'loadix-unit' && (
                         <>
                            <div>
                                <Label htmlFor="loadixStatusFilter" className="text-xs">Statut Engin</Label>
                                <Select value={loadixStatusFilter} onValueChange={value => setLoadixStatusFilter(value as LoadixUnit['status'] | '')}>
                                    <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue placeholder="Tous statuts"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tous statuts</SelectItem>
                                        {LOADIX_STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="loadixModelFilter" className="text-xs">Modèle Engin</Label>
                                <Input id="loadixModelFilter" value={loadixModelFilter} onChange={e => setLoadixModelFilter(e.target.value)} placeholder="Ex: LOADIX Pro v2" className="h-8 text-xs mt-0.5"/>
                            </div>
                        </>
                    )}
                     {selectedEntityType === 'methanisation-site' && (
                         <>
                            <div>
                                <Label htmlFor="siteCapacityFilter" className="text-xs">Capacité</Label>
                                <Input id="siteCapacityFilter" value={siteCapacityFilter} onChange={e => setSiteCapacityFilter(e.target.value)} placeholder="Ex: 5000 t/an" className="h-8 text-xs mt-0.5"/>
                            </div>
                            <div>
                                <Label htmlFor="siteOperatorFilter" className="text-xs">Opérateur</Label>
                                <Input id="siteOperatorFilter" value={siteOperatorFilter} onChange={e => setSiteOperatorFilter(e.target.value)} placeholder="Nom opérateur..." className="h-8 text-xs mt-0.5"/>
                            </div>
                        </>
                    )}
                </div>
            )}
          </Card>
        </div>

        {(isSearchFocused || searchTerm || (showAdvancedFilters && (departmentFilter || regionFilter || tractorBrandsFilter.length > 0 || machineTypesFilter.length > 0 || brandSignFilter || branchNameFilter || loadixStatusFilter || loadixModelFilter || siteCapacityFilter || siteOperatorFilter ))) && searchResultsEntities.length > 0 && (
          <div className="absolute top-16 md:top-20 left-1/2 z-10 w-[calc(100%-1rem)] sm:w-full max-w-lg md:max-w-xl -translate-x-1/2 px-2 md:px-0 mt-1 md:mt-2">
            <Card className="max-h-[30vh] md:max-h-[40vh] overflow-y-auto bg-card/90 backdrop-blur-lg border-border/50 shadow-xl">
              <CardContent className="p-1.5 md:p-2">
                <ul className="space-y-0.5 md:space-y-1">
                  {searchResultsEntities.slice(0, 10).map((entity) => (
                    <li key={entity.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2 px-2.5 md:py-2.5 md:px-3 hover:bg-primary/10"
                        onClick={() => handleEntityClick(entity)}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          {getEntityIcon(entity.entityType, "h-4 w-4 md:h-5 md:h-5 text-primary/80")}
                          <div>
                            <p className="font-medium text-xs md:text-sm text-foreground">{entity.name}</p>
                            <p className="text-xs text-muted-foreground">{entityTypeTranslations[entity.entityType]} - {entity.city}</p>
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
                 {searchResultsEntities.length > 10 && <p className="text-xs text-muted-foreground text-center p-1.5">Et {searchResultsEntities.length - 10} autres résultats...</p>}
              </CardContent>
            </Card>
          </div>
        )}
        {(isSearchFocused || searchTerm || showAdvancedFilters) && searchResultsEntities.length === 0 && (searchTerm.length > 0 || departmentFilter || regionFilter || tractorBrandsFilter.length > 0 || machineTypesFilter.length > 0 || brandSignFilter || branchNameFilter || loadixStatusFilter || loadixModelFilter || siteCapacityFilter || siteOperatorFilter) && (
          <div className="absolute top-16 md:top-20 left-1/2 z-10 w-[calc(100%-1rem)] sm:w-full max-w-lg md:max-w-xl -translate-x-1/2 px-2 md:px-0 mt-1 md:mt-2">
            <Card className="bg-card/90 backdrop-blur-lg border-border/50 shadow-xl">
              <CardContent className="p-3 md:p-4 text-center text-sm text-muted-foreground">
                Aucun résultat pour les critères actuels.
              </CardContent>
            </Card>
          </div>
        )}

        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-30 flex flex-col gap-2">
           <Button
            variant="outline"
            size="icon"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="bg-card/80 backdrop-blur-md border-border/50 hover:bg-card text-foreground h-9 w-9 md:h-10 md:w-10"
            title="Me géolocaliser"
          >
            {locatingUser ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin"/> : <LocateFixed className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-card/80 backdrop-blur-md border-border/50 hover:bg-card text-foreground h-9 w-9 md:h-10 md:w-10"
            title={isFullscreen ? "Quitter le mode plein écran" : "Passer en mode plein écran"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize className="h-4 w-4 md:h-5 md:h-5" />}
          </Button>
        </div>

        {selectedEntity && isMobile && ( 
          <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) setSelectedEntity(null); }}>
            <SheetContent
              side="bottom"
              className="h-[70vh] md:h-[60vh] flex flex-col rounded-t-lg md:rounded-t-xl bg-card/95 backdrop-blur-2xl border-t-border/50 shadow-2xl p-0"
            >
              <SheetHeader className="p-3 md:p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-primary/10 text-primary p-2 md:p-2.5 rounded-md md:rounded-lg shadow-sm">
                      {getEntityIcon(selectedEntity.entityType, "h-5 w-5 md:h-6 md:w-6")}
                    </div>
                    <div>
                      <SheetTitle className="text-lg md:text-xl font-futura">{selectedEntity.name}</SheetTitle>
                      <SheetDescription className="text-xs md:text-sm font-bebas-neue tracking-wide text-primary/90">
                        {entityTypeTranslations[selectedEntity.entityType]}
                      </SheetDescription>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9">
                      <X className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-grow p-3 md:p-4">
                <div className="space-y-3 md:space-y-4">
                  <Card className="bg-background/50 border-border/40">
                    <CardHeader className="p-3"><CardTitle className="text-md md:text-lg font-bebas-neue text-primary">Informations Générales</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1 p-3 pt-0">
                      <DetailItem icon={LocationIcon} label="Adresse" value={`${selectedEntity.address || 'N/A'}, ${selectedEntity.postalCode || ''} ${selectedEntity.city || ''}, ${selectedEntity.country || ''}`} />
                      {selectedEntity.createdAt && <Badge variant="outline" className="text-xs">Créé le: {new Date(selectedEntity.createdAt).toLocaleDateString()}</Badge>}
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/40">
                    <CardHeader className="p-3"><CardTitle className="text-md md:text-lg font-bebas-neue text-primary">Détails Spécifiques</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1 p-3 pt-0">
                      {renderEntitySpecificDetails(selectedEntity)}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
              <SheetFooter className="p-3 md:p-4 border-t border-border/30 flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" asChild className="w-full sm:w-auto text-sm">
                      <Link href={`/item/${selectedEntity.entityType}/${selectedEntity.id}`}>
                          Voir la fiche complète <ChevronsRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
                  <SheetClose asChild>
                      <Button variant="default" className="w-full sm:w-auto text-sm">Fermer</Button>
                  </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </APIProvider>
  );
}
