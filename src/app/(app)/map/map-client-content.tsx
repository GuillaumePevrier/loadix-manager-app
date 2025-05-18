
'use client';

import * as React from 'react';
import type { AppEntity, Dealer, Client, LoadixUnit, MethanisationSite, EntityType } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building, User, Truck, Factory, MapPin as LocationIcon, Phone, Mail, Globe, CalendarDays, Tag, Info, Hash, Power, ChevronsRight, X } from 'lucide-react';
import Link from 'next/link';

interface MapClientContentProps {
  initialEntities: AppEntity[];
}

// Helper function to get entity type display name
const getEntityTypeDisplayName = (type: EntityType): string => {
  const names: Record<EntityType, string> = {
    'dealer': 'Concessionnaire',
    'client': 'Client',
    'loadix-unit': 'Engin LOADIX',
    'methanisation-site': 'Site de Méthanisation',
  };
  return names[type] || 'Entité';
};

// Helper function to get entity icon
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
  if (!value && typeof value !== 'boolean' && typeof value !== 'number') return null; // Allow boolean/number 0/false

  const renderValue = () => {
    if (React.isValidElement(value)) {
        return value;
    }
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((v, i) => <Badge key={i} variant="secondary">{v}</Badge>)}
        </div>
      );
    }
    if (typeof value === 'string') {
        if (isLink) {
          return <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{value}</a>;
        }
        if (isEmail) {
          return <a href={`mailto:${value}`} className="text-primary hover:underline break-all">{value}</a>;
        }
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

const DealerDetailContent: React.FC<{ dealer: Dealer }> = ({ dealer }) => (
  <>
    <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} />
    <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail />
    <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink />
    <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} />
    {dealer.servicesOffered && dealer.servicesOffered.length > 0 && (
      <DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />
    )}
  </>
);

const ClientDetailContent: React.FC<{ client: Client }> = ({ client }) => (
  <>
    <DetailItem icon={User} label="Nom du Contact" value={client.contactName} />
    <DetailItem icon={Mail} label="Email du Contact" value={client.contactEmail} isEmail />
    <DetailItem icon={Phone} label="Téléphone du Contact" value={client.contactPhone} />
    <DetailItem icon={Factory} label="Secteur d'Activité" value={client.industry} />
  </>
);

const LoadixUnitDetailContent: React.FC<{ unit: LoadixUnit }> = ({ unit }) => (
  <>
    <DetailItem icon={Hash} label="Numéro de Série" value={unit.serialNumber} />
    <DetailItem icon={Truck} label="Modèle" value={unit.model} />
    <DetailItem icon={Power} label="Statut" value={unit.status ? <Badge variant={unit.status === 'active' ? 'default' : unit.status === 'maintenance' ? 'outline' : 'destructive'}>{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge> : null} />
    <DetailItem icon={CalendarDays} label="Date d'achat" value={unit.purchaseDate ? new Date(unit.purchaseDate).toLocaleDateString() : undefined} />
    <DetailItem icon={CalendarDays} label="Dernière Maintenance" value={unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate).toLocaleDateString() : undefined} />
  </>
);

const MethanisationSiteDetailContent: React.FC<{ site: MethanisationSite }> = ({ site }) => (
  <>
    <DetailItem icon={Info} label="Capacité" value={site.capacity} />
    <DetailItem icon={User} label="Opérateur" value={site.operator} />
    <DetailItem icon={CalendarDays} label="Date de mise en service" value={site.startDate ? new Date(site.startDate).toLocaleDateString() : undefined} />
  </>
);

export default function MapClientContent({ initialEntities }: MapClientContentProps) {
  const [selectedEntity, setSelectedEntity] = React.useState<AppEntity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleEntityClick = (entity: AppEntity) => {
    setSelectedEntity(entity);
    setIsSheetOpen(true);
  };

  const renderEntitySpecificDetails = (entity: AppEntity) => {
    switch (entity.entityType) {
      case 'dealer':
        return <DealerDetailContent dealer={entity as Dealer} />;
      case 'client':
        return <ClientDetailContent client={entity as Client} />;
      case 'loadix-unit':
        return <LoadixUnitDetailContent unit={entity as LoadixUnit} />;
      case 'methanisation-site':
        return <MethanisationSiteDetailContent site={entity as MethanisationSite} />;
      default:
        return <p className="text-muted-foreground">Aucun détail spécifique pour ce type d'entité.</p>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Map Placeholder */}
      <div className="md:w-2/3 h-[300px] md:h-full bg-muted rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner">
        <Image
          src="https://placehold.co/1200x800.png?text=Carte+Interactive+Placeholder"
          alt="Carte interactive placeholder"
          layout="fill"
          objectFit="cover"
          data-ai-hint="world map"
          className="opacity-70"
        />
        <p className="z-10 text-xl font-semibold text-foreground/70 bg-black/30 p-4 rounded-md">
          Intégration de la carte dynamique à venir
        </p>
      </div>

      {/* Entity List (Simulating Markers) */}
      <div className="md:w-1/3 h-full flex flex-col">
        <h3 className="text-xl font-bebas-neue text-primary mb-3">Points d'Intérêt</h3>
        <ScrollArea className="flex-grow border rounded-lg bg-card/50 p-3 shadow-sm">
          {initialEntities.length > 0 ? (
            <ul className="space-y-2">
              {initialEntities.map((entity) => (
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
                        <p className="text-xs text-muted-foreground">{getEntityTypeDisplayName(entity.entityType)} - {entity.city}</p>
                      </div>
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Aucune entité à afficher.</p>
          )}
        </ScrollArea>
      </div>

      {/* Entity Detail Sheet */}
      {selectedEntity && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent 
            side="bottom" 
            className="h-[75vh] flex flex-col rounded-t-xl bg-card/90 backdrop-blur-lg border-t-border/50 shadow-2xl"
            onInteractOutside={(e) => {
              // Prevent closing on clicking map or other elements if needed in future
            }}
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
                      {getEntityTypeDisplayName(selectedEntity.entityType)}
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
                
                {selectedEntity.geoLocation && (
                  <Card className="bg-background/50 border-border/40">
                    <CardHeader>
                        <CardTitle className="text-lg font-bebas-neue text-primary">Localisation (Mini-carte)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-40 w-full bg-muted rounded-md flex items-center justify-center">
                        <Image
                            src={`https://placehold.co/600x240.png?text=Carte+pour+${selectedEntity.name.replace(/\s/g, "+")}`}
                            alt={`Carte pour ${selectedEntity.name}`}
                            width={600}
                            height={240}
                            className="object-cover rounded-md h-full w-full"
                            data-ai-hint="map location"
                        />
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
  );
}
