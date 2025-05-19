
import * as React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import type { EntityType, AppEntity, Dealer, Client, LoadixUnit, MethanisationSite, DealerComment, MediaItem } from '@/types';
import { findEntityByIdAndType, allMockEntities } from '@/lib/mock-data'; // Keep for non-dealer types for now
import { getDealerById } from '@/services/dealerService'; // Import the new service
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, User, Truck, Factory, MapPin, Phone, Mail, Globe, CalendarDays, Tag, Info, Hash, Power, ChevronsRight, 
  Users2, MessageSquare, Image as ImageIcon, FileText, Link as LinkIcon, ListFilter, CircleAlert
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ItemPageProps {
  params: {
    entityType: EntityType;
    entityId: string;
  };
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
  return <IconComponent className={className || "h-6 w-6"} />;
};

export async function generateMetadata({ params }: ItemPageProps, parent: ResolvingMetadata): Promise<Metadata> {
  let entity: AppEntity | null | undefined;
  if (params.entityType === 'dealer') {
    entity = await getDealerById(params.entityId);
  } else {
    entity = findEntityByIdAndType(params.entityType, params.entityId);
  }

  if (!entity) {
    return {
      title: 'Fiche non trouvée | LOADIX Manager',
    };
  }
  const entityTypeDisplay = getEntityTypeDisplayName(entity.entityType);
  return {
    title: `${entityTypeDisplay}: ${entity.name} | LOADIX Manager`,
    description: `Fiche de détail pour ${entity.name}.`,
  };
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | string[] | null | React.ReactNode; isLink?: boolean; isEmail?: boolean; className?: string }> = ({ icon: Icon, label, value, isLink, isEmail, className }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number') return null;

  const renderValue = () => {
    if (React.isValidElement(value)) {
        return value;
    }
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>)}
        </div>
      );
    }
    if (typeof value === 'string') {
        if (isLink) {
          return <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all text-sm">{value}</a>;
        }
        if (isEmail) {
          return <a href={`mailto:${value}`} className="text-primary hover:underline break-all text-sm">{value}</a>;
        }
        return <span className="text-foreground/90 break-words text-sm">{value}</span>;
    }
    return <span className="text-foreground/90 break-words text-sm">{String(value)}</span>;
  };

  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

const getProspectionStatusBadgeVariant = (status?: 'hot' | 'warm' | 'cold' | 'none' | 'converted' | 'lost'): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'hot': return 'default'; // Primary color (often blue/green for positive)
    case 'warm': return 'secondary'; // Orange/Yellowish
    case 'cold': return 'outline';   // Grey/Neutral
    case 'converted': return 'default'; // Similar to hot or a specific success color
    case 'lost': return 'destructive'; // Red
    default: return 'outline';
  }
};

const DealerTabsContent: React.FC<{ dealer: Dealer }> = ({ dealer }) => (
  <Tabs defaultValue="details" className="w-full">
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
      <TabsTrigger value="details">Détails</TabsTrigger>
      <TabsTrigger value="tracking">Suivi</TabsTrigger>
      <TabsTrigger value="media">Médias</TabsTrigger>
      <TabsTrigger value="relations">Relations</TabsTrigger>
    </TabsList>
    <TabsContent value="details" className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Informations Générales</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <DetailItem icon={MapPin} label="Adresse" value={`${dealer.address}, ${dealer.postalCode} ${dealer.city}, ${dealer.country}`} />
           {dealer.geoLocation && (
              <div className="h-40 w-full bg-muted rounded-md overflow-hidden">
                 <Image
                  src={`https://placehold.co/600x240.png?text=Mini+Carte+pour+${dealer.name.replace(/\s/g, "+")}`}
                  alt={`Carte pour ${dealer.name}`}
                  width={600}
                  height={240}
                  className="object-cover h-full w-full"
                  data-ai-hint="map location"
                  />
              </div>
            )}
          <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} />
          <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail />
          <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink />
          <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} />
        </CardContent>
      </Card>
       <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Informations Commerciales</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dealer.prospectionStatus && (
            <DetailItem 
              icon={ListFilter} 
              label="Statut Prospection" 
              value={<Badge variant={getProspectionStatusBadgeVariant(dealer.prospectionStatus)}>{dealer.prospectionStatus.toUpperCase()}</Badge>} 
            />
          )}
          {dealer.servicesOffered && dealer.servicesOffered.length > 0 && (
            <DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />
          )}
          {dealer.tractorBrands && dealer.tractorBrands.length > 0 && (
            <DetailItem icon={Truck} label="Marques de Tracteurs" value={dealer.tractorBrands} />
          )}
          {dealer.machineTypes && dealer.machineTypes.length > 0 && (
            <DetailItem icon={Power} label="Types de Machines" value={dealer.machineTypes} />
          )}
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="tracking" className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Commentaires & Suivi</CardTitle></CardHeader>
        <CardContent>
          {dealer.comments && dealer.comments.length > 0 ? (
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-4">
                {dealer.comments.map((comment, index) => (
                  <div key={index} className="p-3 rounded-md bg-muted/50 border border-border/30 text-sm">
                    <p className="text-foreground mb-1 whitespace-pre-line">{comment.text}</p>
                    <p className="text-xs text-muted-foreground">
                      Par {comment.author} - {new Date(comment.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="media" className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Galerie d'Images</CardTitle></CardHeader>
        <CardContent>
          {dealer.galleryUris && dealer.galleryUris.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {dealer.galleryUris.map((uri, index) => (
                <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                  <Image src={uri.url || `https://placehold.co/300x300.png?text=${uri.name||'Média'}`} alt={uri.name || `Média ${index + 1}`} width={300} height={300} className="object-cover w-full h-full" data-ai-hint="dealer construction" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune image dans la galerie.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Documents</CardTitle></CardHeader>
        <CardContent>
          {dealer.documentUris && dealer.documentUris.length > 0 ? (
            <ul className="space-y-2">
              {dealer.documentUris.map((doc, index) => (
                <li key={index} className="text-sm">
                  <a href={doc.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <FileText className="h-4 w-4" /> {doc.name || `Document ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun document.</p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
     <TabsContent value="relations" className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Clients Liés</CardTitle></CardHeader>
        <CardContent>
          {dealer.relatedClientIds && dealer.relatedClientIds.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {dealer.relatedClientIds.map(id => <li key={id}><LinkIcon className="inline h-3 w-3 mr-1"/>Client ID: {id} (Détails à venir)</li>)}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Aucun client lié.</p>}
        </CardContent>
      </Card>
       <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Prospects Liés</CardTitle></CardHeader>
        <CardContent>
          {dealer.relatedProspectIds && dealer.relatedProspectIds.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {dealer.relatedProspectIds.map(id => <li key={id}><Users2 className="inline h-3 w-3 mr-1"/>Prospect ID: {id} (Détails à venir)</li>)}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Aucun prospect lié.</p>}
        </CardContent>
      </Card>
       <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Sites Liés</CardTitle></CardHeader>
        <CardContent>
          {dealer.relatedSiteIds && dealer.relatedSiteIds.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {dealer.relatedSiteIds.map(id => <li key={id}><Factory className="inline h-3 w-3 mr-1"/>Site ID: {id} (Détails à venir)</li>)}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Aucun site lié.</p>}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);


const ClientDetailCard: React.FC<{ client: Client }> = ({ client }) => (
  <Card>
    <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Détails du Client</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <DetailItem icon={MapPin} label="Adresse" value={`${client.address}, ${client.postalCode} ${client.city}, ${client.country}`} />
      <DetailItem icon={User} label="Nom du Contact" value={client.contactName} />
      <DetailItem icon={Mail} label="Email du Contact" value={client.contactEmail} isEmail />
      <DetailItem icon={Phone} label="Téléphone du Contact" value={client.contactPhone} />
      <DetailItem icon={Factory} label="Secteur d'Activité" value={client.industry} />
    </CardContent>
  </Card>
);

const LoadixUnitDetailCard: React.FC<{ unit: LoadixUnit }> = ({ unit }) => (
  <Card>
    <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Détails de l'Engin LOADIX</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <DetailItem icon={MapPin} label="Adresse" value={`${unit.address}, ${unit.postalCode} ${unit.city}, ${unit.country}`} />
      <DetailItem icon={Hash} label="Numéro de Série" value={unit.serialNumber} />
      <DetailItem icon={Truck} label="Modèle" value={unit.model} />
      <DetailItem icon={Power} label="Statut" value={unit.status ? <Badge variant={unit.status === 'active' ? 'default' : unit.status === 'maintenance' ? 'outline' : 'destructive'}>{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge> : null} />
      <DetailItem icon={CalendarDays} label="Date d'achat" value={unit.purchaseDate ? new Date(unit.purchaseDate).toLocaleDateString() : undefined} />
      <DetailItem icon={CalendarDays} label="Dernière Maintenance" value={unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate).toLocaleDateString() : undefined} />
    </CardContent>
  </Card>
);

const MethanisationSiteDetailCard: React.FC<{ site: MethanisationSite }> = ({ site }) => (
  <Card>
    <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Détails du Site de Méthanisation</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <DetailItem icon={MapPin} label="Adresse" value={`${site.address}, ${site.postalCode} ${site.city}, ${site.country}`} />
      <DetailItem icon={Info} label="Capacité" value={site.capacity} />
      <DetailItem icon={User} label="Opérateur" value={site.operator} />
      <DetailItem icon={CalendarDays} label="Date de mise en service" value={site.startDate ? new Date(site.startDate).toLocaleDateString() : undefined} />
    </CardContent>
  </Card>
);


export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { entityType, entityId } = params;
  let entity: AppEntity | null | undefined = undefined;

  if (entityType === 'dealer') {
    entity = await getDealerById(entityId);
  } else {
    // For other types, use mock data for now
    entity = findEntityByIdAndType(entityType, entityId);
  }

  if (!entity) {
    notFound();
  }

  const entityTypeDisplay = getEntityTypeDisplayName(entity.entityType);

  const renderEntitySpecificDetails = () => {
    switch (entity.entityType) {
      case 'dealer':
        return <DealerTabsContent dealer={entity as Dealer} />;
      case 'client':
        return <ClientDetailCard client={entity as Client} />;
      case 'loadix-unit':
        return <LoadixUnitDetailCard unit={entity as LoadixUnit} />;
      case 'methanisation-site':
        return <MethanisationSiteDetailCard site={entity as MethanisationSite} />;
      default:
        return <p className="text-muted-foreground">Aucun détail spécifique pour ce type d'entité.</p>;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/directory">
          <ChevronsRight className="h-4 w-4 mr-2 rotate-180" />
          Retour au Répertoire
        </Link>
      </Button>

      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 text-primary p-3 rounded-lg shadow-md">
              {getEntityIcon(entity.entityType, "h-8 w-8")}
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-futura">{entity.name}</CardTitle>
              <CardDescription className="text-md font-bebas-neue tracking-wide text-primary mt-1">
                {entityTypeDisplay}
              </CardDescription>
            </div>
          </div>
           <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <Badge variant="outline" className="py-1">ID: {entity.id}</Badge>
            <Badge variant="outline" className="py-1">Créé le: {new Date(entity.createdAt).toLocaleDateString()}</Badge>
            <Badge variant="outline" className="py-1">Mis à jour le: {new Date(entity.updatedAt).toLocaleDateString()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {renderEntitySpecificDetails()}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6 border-t border-border/20 mt-6">
            <Button variant="outline">Modifier</Button> {/* Button is now enabled */}
            <Button variant="destructive" disabled>Supprimer</Button>
        </CardFooter>
      </Card>
       <Alert variant="default" className="mt-8 bg-accent/10 border-accent/50 text-accent-foreground/90">
        <CircleAlert className="h-5 w-5 text-accent" />
        <AlertTitle className="font-bebas-neue text-lg text-accent">Note sur les Données</AlertTitle>
        <AlertDescription className="text-xs">
          Les données des concessionnaires sont désormais lues depuis Firebase Firestore. Les autres types d'entités (Clients, Engins, Sites) utilisent encore des données simulées. 
          La création, modification, et suppression ne sont pas encore connectées à Firebase.
        </AlertDescription>
      </Alert>
    </div>
  );
}

