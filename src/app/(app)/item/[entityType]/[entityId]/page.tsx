
import * as React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import type { EntityType, AppEntity, Dealer, LoadixUnit, MethanisationSite, Comment } from '@/types';
import { findEntityByIdAndType } from '@/lib/mock-data';
import { getDealerById } from '@/services/dealerService'; // Assuming other getById functions will be added here or new services
import { cn } from '@/lib/utils';
import {
  Building, User, Truck, Factory, MapPin,
  Phone, Mail, Globe, CalendarDays, Tag,
  Info, Hash, Power, ChevronsRight, Edit2,
  MessageCircle, Briefcase, Building2, MapIcon, CircleAlert, Printer, FileText // Added FileText
} from 'lucide-react';
import DeleteEntityButton from './DeleteEntityButton';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ItemPageProps {
  params: {
    entityType: EntityType;
    entityId: string;
  };
}

const getEntityTypeDisplayName = (type: EntityType): string => {
  const names: Record<EntityType, string> = {
    dealer: 'Concessionnaire',
    'loadix-unit': 'Engin LOADIX',
    'methanisation-site': 'Site de Méthanisation',
  };
  return names[type] || 'Entité';
};

const getEntityIcon = (type: EntityType, className?: string): React.ReactNode => {
  const icons: Record<EntityType, React.ElementType> = {
    dealer: Building,
    'loadix-unit': Truck,
    'methanisation-site': Factory,
  };
  const IconComponent = icons[type] || Info;
  return <IconComponent className={className || 'h-6 w-6'} />;
};

const getEntityEditRoute = (type: EntityType, id: string): string => {
    switch (type) {
        case 'dealer': return `/dealers/edit/${id}`;
        case 'loadix-unit': return `/loadix-units/edit/${id}`; // To be created
        case 'methanisation-site': return `/methanisation-sites/edit/${id}`; // To be created
        default: return '/directory';
    }
};


export async function generateMetadata(
  { params }: ItemPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  let entity: AppEntity | null = null;
  if (params.entityType === 'dealer') {
    entity = await getDealerById(params.entityId);
  } else {
    // For other types, use mock data for now, or implement their respective getById service functions
    entity = findEntityByIdAndType(params.entityType, params.entityId) ?? null;
  }

  if (!entity) {
    return { title: 'Fiche non trouvée | LOADIX Manager' };
  }

  const display = getEntityTypeDisplayName(entity.entityType);
  return {
    title: `${display}: ${entity.name} | LOADIX Manager`,
    description: `Détail de ${entity.name}.`,
  };
}

const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | string[] | React.ReactNode | null;
  isLink?: boolean;
  isEmail?: boolean;
  className?: string;
}> = ({ icon: Icon, label, value, isLink, isEmail, className }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number') return null;

  const renderValue = () => {
    if (React.isValidElement(value)) return value;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic text-sm">Non spécifié</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">
              {v}
            </Badge>
          ))}
        </div>
      );
    }
    if (typeof value === 'string') {
      if (isLink) {
        return (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all text-sm"
          >
            {value}
          </a>
        );
      }
      if (isEmail) {
        return (
          <a
            href={`mailto:${value}`}
            className="text-primary hover:underline break-all text-sm"
          >
            {value}
          </a>
        );
      }
      return <span className="text-foreground/90 break-words text-sm">{value}</span>;
    }
    return <span className="text-foreground/90 break-words text-sm">{String(value)}</span>;
  };

  return (
    <div className={cn('flex items-start space-x-3 py-1.5', className)}>
      <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

const getProspectionStatusBadgeInfo = (
  status?: Dealer['prospectionStatus']
): { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'; label: string } => {
  switch (status) {
    case 'hot':
      return { variant: 'destructive', label: 'Chaud 🔥' };
    case 'warm':
      return { variant: 'default', label: 'Tiède 🌤️' };
    case 'cold':
      return { variant: 'secondary', label: 'Froid ❄️' };
    case 'converted':
      return { variant: 'success' as any, label: 'Converti ✅' };
    case 'lost':
      return { variant: 'outline', label: 'Perdu ❌' };
    default:
      return { variant: 'outline', label: 'Aucun statut' };
  }
};

const getLoadixStatusBadgeVariant = (status?: LoadixUnit['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
        case 'active': return 'success' as any;
        case 'maintenance': return 'default'; // Using primary for maintenance
        case 'inactive': return 'outline';
        case 'in_stock': return 'secondary';
        case 'sold': return 'destructive';
        default: return 'outline';
    }
};


const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => (
  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-md border border-border/20">
    <Avatar className="h-8 w-8">
      <AvatarImage src={`https://placehold.co/40x40.png?text=${comment.userName.substring(0,1)}`} data-ai-hint="avatar placeholder" />
      <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{comment.userName}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className="text-sm text-foreground/80 whitespace-pre-line mt-1">{comment.text}</p>
    </div>
  </div>
);

const DealerTabsContent: React.FC<{ dealer: Dealer }> = ({ dealer }) => {
    const statusInfo = getProspectionStatusBadgeInfo(dealer.prospectionStatus);
    return (
  <Tabs defaultValue="details" className="w-full">
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4 bg-muted/50 p-1 h-auto">
      <TabsTrigger value="details" className="text-xs sm:text-sm px-2 py-1.5">Détails</TabsTrigger>
      <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-1.5">Contact & Commercial</TabsTrigger>
      <TabsTrigger value="prospection" className="text-xs sm:text-sm px-2 py-1.5">Suivi Prospection</TabsTrigger>
      <TabsTrigger value="media" className="text-xs sm:text-sm px-2 py-1.5">Médias</TabsTrigger>
      <TabsTrigger value="relations" className="text-xs sm:text-sm px-2 py-1.5">Relations</TabsTrigger>
    </TabsList>

    <TabsContent value="details" className="space-y-4">
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Informations Générales</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <DetailItem icon={MapPin} label="Adresse Complète" value={`${dealer.address || ''}, ${dealer.postalCode || ''} ${dealer.city || ''}, ${dealer.country || ''}`} />
                {dealer.department && <DetailItem icon={MapIcon} label="Département" value={dealer.department} />}
                 {dealer.geoLocation && (
                    <div className="h-48 w-full bg-muted rounded-md overflow-hidden shadow-inner border border-border/30" data-ai-hint="map preview">
                        <Image
                        src={`https://placehold.co/800x300.png?text=Carte+pour+${encodeURIComponent(dealer.name)}`}
                        alt={`Carte pour ${dealer.name}`}
                        width={800}
                        height={300}
                        className="object-cover h-full w-full"
                        data-ai-hint="map location"
                        />
                    </div>
                )}
                 {!dealer.geoLocation && <p className="text-sm text-muted-foreground italic">Géolocalisation non disponible.</p>}
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="contact" className="space-y-4">
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Coordonnées</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} />
                {dealer.fax && <DetailItem icon={Printer} label="Fax" value={dealer.fax} />}
                <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail />
                <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink />
                <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Informations Commerciales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {dealer.brandSign && <DetailItem icon={Building2} label="Enseigne" value={dealer.brandSign} />}
                {dealer.branchName && <DetailItem icon={Briefcase} label="Succursale" value={dealer.branchName} />}
                <DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />
                <DetailItem icon={Truck} label="Marques de Tracteurs" value={dealer.tractorBrands} />
                <DetailItem icon={Power} label="Types de Machines" value={dealer.machineTypes} />
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="prospection" className="space-y-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-bebas-neue text-primary text-xl">Suivi de Prospection</CardTitle>
                {dealer.prospectionStatus && <Badge variant={statusInfo.variant as any} className="text-sm px-3 py-1">{statusInfo.label}</Badge>}
            </CardHeader>
            <CardContent>
                {(!dealer.comments || dealer.comments.length === 0) ? (
                    <p className="text-muted-foreground italic">Aucun commentaire de suivi pour le moment.</p>
                ) : (
                    <ScrollArea className="h-[300px] pr-3">
                        <div className="space-y-3">
                            {dealer.comments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((comment, index) => (
                                <CommentCard key={index} comment={comment} />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="media" className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Galerie d'Images</CardTitle></CardHeader>
        <CardContent>
          {(!dealer.galleryUris || dealer.galleryUris.length === 0) ? (
            <p className="text-muted-foreground italic">Aucune image dans la galerie.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {dealer.galleryUris.map((uri, index) => (
                <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden shadow-inner">
                  <Image src={uri.startsWith('http') ? uri : `https://placehold.co/200x200.png?text=Image+${index+1}`} alt={`Galerie image ${index + 1}`} width={200} height={200} className="object-cover h-full w-full" data-ai-hint="dealer photo" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Documents</CardTitle></CardHeader>
        <CardContent>
          {(!dealer.documentUris || dealer.documentUris.length === 0) ? (
            <p className="text-muted-foreground italic">Aucun document.</p>
          ) : (
            <ul className="space-y-2">
              {dealer.documentUris.map((uri, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <a href={uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Document {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="relations" className="space-y-4">
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Entités Liées</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <p className="text-muted-foreground italic">Fonctionnalité de liaison à implémenter.</p>
                {/* Example for related sites, adapt for prospects, clients (now part of sites), units */}
                {dealer.relatedSiteIds && dealer.relatedSiteIds.length > 0 && (
                    <DetailItem icon={Factory} label="Sites de Méthanisation Liés" value={dealer.relatedSiteIds.map(id => <Link key={id} href={`/item/methanisation-site/${id}`} className="text-primary hover:underline block">Site {id.substring(0,8)}...</Link>)} />
                )}
                 {/* Placeholder for related Loadix Units */}
                 {/* Placeholder for related Prospects */}
            </CardContent>
        </Card>
    </TabsContent>
  </Tabs>
)};

const LoadixUnitDetailCard: React.FC<{ unit: LoadixUnit }> = ({ unit }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="font-bebas-neue text-primary text-xl">Détails de l'Engin</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <DetailItem icon={Hash} label="Numéro de Série" value={unit.serialNumber} />
      <DetailItem icon={Truck} label="Modèle" value={unit.model} />
      <DetailItem icon={Power} label="Statut" value={unit.status ? <Badge variant={getLoadixStatusBadgeVariant(unit.status)}>{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge> : null} />
      <DetailItem icon={MapPin} label="Localisation" value={`${unit.address || 'N/A'}, ${unit.postalCode || ''} ${unit.city || ''}, ${unit.country || ''}`} />
      {unit.purchaseDate && <DetailItem icon={CalendarDays} label="Date d'achat" value={new Date(unit.purchaseDate).toLocaleDateString()} />}
      {unit.lastMaintenanceDate && <DetailItem icon={CalendarDays} label="Dernière Maintenance" value={new Date(unit.lastMaintenanceDate).toLocaleDateString()} />}
      {unit.dealerId && <DetailItem icon={Building} label="Concessionnaire Associé" value={<Link href={`/item/dealer/${unit.dealerId}`} className="text-primary hover:underline">Voir Concessionnaire</Link>} />}
      {unit.methanisationSiteId && <DetailItem icon={Factory} label="Site de Méthanisation Associé" value={<Link href={`/item/methanisation-site/${unit.methanisationSiteId}`} className="text-primary hover:underline">Voir Site</Link>} />}
       {unit.geoLocation && (
          <div className="md:col-span-2 h-48 w-full bg-muted rounded-md overflow-hidden shadow-inner border border-border/30 mt-2" data-ai-hint="map preview">
              <Image
              src={`https://placehold.co/800x300.png?text=Carte+Engin+${encodeURIComponent(unit.name)}`}
              alt={`Carte pour ${unit.name}`}
              width={800}
              height={300}
              className="object-cover h-full w-full"
              data-ai-hint="map location"
              />
          </div>
      )}
    </CardContent>
  </Card>
);

const MethanisationSiteDetailCard: React.FC<{ site: MethanisationSite }> = ({ site }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="font-bebas-neue text-primary text-xl">Détails du Site</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <DetailItem icon={MapPin} label="Adresse" value={`${site.address || 'N/A'}, ${site.postalCode || ''} ${site.city || ''}, ${site.country || ''}`} />
      {site.capacity && <DetailItem icon={Info} label="Capacité" value={site.capacity} />}
      {site.operator && <DetailItem icon={User} label="Opérateur" value={site.operator} />}
      {site.startDate && <DetailItem icon={CalendarDays} label="Date de mise en service" value={new Date(site.startDate).toLocaleDateString()} />}
      {site.siteClients && site.siteClients.length > 0 && (
        <DetailItem icon={User} label="Clients du Site" value={site.siteClients.map(client => client.name)} />
      )}
      {site.technologies && site.technologies.length > 0 && (
        <DetailItem icon={Tag} label="Technologies" value={site.technologies} />
      )}
      {site.relatedDealerIds && site.relatedDealerIds.length > 0 && (
        <DetailItem icon={Building} label="Concessionnaires Liés" value={site.relatedDealerIds.map(id => <Link key={id} href={`/item/dealer/${id}`} className="text-primary hover:underline block">Concessionnaire {id.substring(0,8)}...</Link>)} />
      )}
       {site.geoLocation && (
          <div className="md:col-span-2 h-48 w-full bg-muted rounded-md overflow-hidden shadow-inner border border-border/30 mt-2" data-ai-hint="map preview">
              <Image
              src={`https://placehold.co/800x300.png?text=Carte+Site+${encodeURIComponent(site.name)}`}
              alt={`Carte pour ${site.name}`}
              width={800}
              height={300}
              className="object-cover h-full w-full"
              data-ai-hint="map location"
              />
          </div>
      )}
    </CardContent>
  </Card>
);

export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { entityType, entityId } = params;
  let entity: AppEntity | null = null;

  // Fetch entity data based on type
  // This will be expanded with actual service calls for each type
  if (entityType === 'dealer') {
    entity = await getDealerById(entityId);
  } else if (entityType === 'loadix-unit') {
    entity = findEntityByIdAndType(entityType, entityId) as LoadixUnit || null; // Using mock for now
  } else if (entityType === 'methanisation-site') {
    entity = findEntityByIdAndType(entityType, entityId) as MethanisationSite || null; // Using mock for now
  } else {
    notFound();
  }

  if (!entity) {
    notFound();
  }

  const entityTypeDisplay = getEntityTypeDisplayName(entity.entityType);
  const editRoute = getEntityEditRoute(entity.entityType, entity.id);

  const renderEntitySpecificDetails = () => {
    switch (entity.entityType) {
      case 'dealer':
        return <DealerTabsContent dealer={entity as Dealer} />;
      case 'loadix-unit':
        return <LoadixUnitDetailCard unit={entity as LoadixUnit} />;
      case 'methanisation-site':
        return <MethanisationSiteDetailCard site={entity as MethanisationSite} />;
      default:
        // This should not happen if types are handled above
        const _exhaustiveCheck: never = entity;
        return <p className="text-muted-foreground">Type d'entité non pris en charge: {(_exhaustiveCheck as AppEntity).entityType}</p>;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-6 px-4">
      <Button asChild variant="outline" className="mb-6 group">
        <Link href="/directory">
          <ChevronsRight className="h-4 w-4 mr-2 rotate-180 transition-transform group-hover:-translate-x-1" />
          Retour au Répertoire
        </Link>
      </Button>
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                {getEntityIcon(entity.entityType, 'h-6 w-6')}
            </div>
            <h1 className="text-2xl md:text-3xl font-futura text-foreground leading-tight">{entity.name}</h1>
          </div>
          <Badge variant="secondary" className="text-xs px-2.5 py-1 self-start md:self-center">{entityTypeDisplay}</Badge>
        </div>
        {(entity.city || entity.country) && (
            <p className="text-sm text-muted-foreground mt-1.5 ml-1 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5 inline-block opacity-70" />
                {entity.city}{entity.city && entity.country ? ', ' : ''}{entity.country}
            </p>
        )}
      </header>

      {renderEntitySpecificDetails()}

       {/* Common Footer for all entity types if not handled within specific tabs/cards */}
      {entity.entityType !== 'dealer' && ( // Dealer has its own footer within tabs
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t border-border/20 mt-6">
            <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={editRoute}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Modifier
                </Link>
            </Button>
            <DeleteEntityButton entityType={entity.entityType} entityId={entity.id} />
        </CardFooter>
      )}
      {entity.entityType === 'dealer' && ( // Specific footer actions for Dealer are inside DealerTabsContent
         <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t border-border/20 mt-6">
            <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={editRoute}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Modifier
                </Link>
            </Button>
            <DeleteEntityButton entityType={entity.entityType} entityId={entity.id} />
        </CardFooter>
      )}


     <Alert variant="default" className="mt-8 bg-accent/10 border-accent/50 text-accent-foreground/90">
        <CircleAlert className="h-5 w-5 text-accent" />
        <AlertTitle className="font-bebas-neue text-lg text-accent">Note sur les Données</AlertTitle>
        <AlertDescription className="text-xs">
            Les données des concessionnaires sont lues depuis Firebase Firestore.
            Les autres types d'entités (Engins, Sites) utilisent encore des données simulées et leurs fonctions d'ajout/modification sont pour l'instant simulées.
            La création et la modification pour tous les types sont en cours d'implémentation.
        </AlertDescription>
    </Alert>
    </div>
  );
}
