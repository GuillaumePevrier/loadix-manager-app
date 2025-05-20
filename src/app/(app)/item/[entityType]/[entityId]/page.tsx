"use client"; // This is now the Client Component

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import type { EntityType, AppEntity, Dealer, LoadixUnit, MethanisationSite } from '@/types';
import { getDealerById, getLoadixUnitById, getMethanisationSiteById } from '@/services/dealerService';
import { cn } from '@/lib/utils';
import {
  Building, User, Truck, Factory, MapPin,
  Phone, Mail, Globe, CalendarDays, Tag,
  Info, Hash, Power, ChevronsRight, Edit2,
  CircleAlert, Loader2
} from 'lucide-react';
import DeleteEntityButton from './DeleteEntityButton';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DealerTabsContent from './DealerTabsContent';
// import type { Metadata, ResolvingMetadata } from 'next'; // Commented out for client component

interface ItemPageProps {
  params: {
    entityType: EntityType;
    entityId: string;
  };
}

// Helper function used by the component
const getEntityTypeDisplayNameForClient = (type: EntityType): string => {
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
        case 'loadix-unit': return `/loadix-units/edit/${id}`;
        case 'methanisation-site': return `/methanisation-sites/edit/${id}`;
        default: return '/directory';
    }
};

const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | string[] | React.ReactNode | null;
  isLink?: boolean;
  isEmail?: boolean;
  className?: string;
}> = ({ icon: Icon, label, value, isLink, isEmail, className }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number' && !(Array.isArray(value) && value.length > 0)) return null;

  const renderValue = () => {
    if (React.isValidElement(value)) {
        return value;
    }
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
     if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic text-sm">Non spécifié</span>;
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

const getLoadixStatusBadgeVariant = (status?: LoadixUnit['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
        case 'active': return 'success' as any;
        case 'maintenance': return 'default';
        case 'inactive': return 'outline';
        case 'in_stock': return 'secondary';
        case 'sold': return 'destructive';
        default: return 'outline';
    }
};


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

/*
// generateMetadata is a server function and cannot be used in a client component.
// It needs to be handled differently, e.g., in a separate (default) page.tsx that wraps this client component.
export async function generateMetadata(
  { params }: ItemPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // This is a placeholder. Real implementation would fetch entity for title.
  // const entity = await getEntity(params.entityType, params.entityId); // Hypothetical
  const entityTypeDisplay = params.entityType.replace('-', ' ');
  const entityName = params.entityId; // Placeholder
  return {
    title: `${entityTypeDisplay}: ${entityName} | LOADIX Manager`,
    description: `Détail de ${entityName}.`,
  };
}
*/

export default function ItemDetailPage({ params }: ItemPageProps) {
  const { entityType, entityId } = params;
  const [currentEntity, setCurrentEntity] = React.useState<AppEntity | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let fetchedEntity: AppEntity | null = null;
    try {
      if (!entityType || !entityId) {
        console.warn('EntityType or EntityId is undefined in fetchData. Params:', params);
        setError('Paramètres de route invalides.');
        setIsLoading(false);
        return;
      }

      if (entityType === 'dealer') {
        fetchedEntity = await getDealerById(entityId);
      } else if (entityType === 'loadix-unit') {
        fetchedEntity = await getLoadixUnitById(entityId);
      } else if (entityType === 'methanisation-site') {
        fetchedEntity = await getMethanisationSiteById(entityId);
      } else {
        console.warn(`Unknown entity type: ${entityType}, falling back to notFound.`);
        // notFound(); // Calling notFound() here triggers full 404, show error message instead
        setError(`Type d'entité inconnu: ${entityType}`);
        setIsLoading(false);
        return;
      }

      if (!fetchedEntity) {
        // notFound(); // Avoid calling notFound() to prevent generic 404 page
        setError(`Entité ${getEntityTypeDisplayNameForClient(entityType)} avec ID ${entityId} non trouvée.`);
      }
      setCurrentEntity(fetchedEntity);
    } catch (err) {
        console.error(`Error fetching entity ${entityType}/${entityId}:`, err);
        setError(err instanceof Error ? err.message : "Échec du chargement des données de l'entité.");
    } finally {
        setIsLoading(false);
    }
  }, [entityType, entityId, params]); // Added params to dependency array

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoading) {
    return (
        <div className="container mx-auto max-w-5xl py-6 px-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Chargement des détails...</p>
        </div>
    );
  }

  if (error && !currentEntity) { // Show error if loading failed and no entity is present
    return (
        <div className="container mx-auto max-w-5xl py-6 px-4">
            <Alert variant="destructive">
                <CircleAlert className="h-5 w-5" />
                <AlertTitle>Erreur de Chargement</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
             <Button asChild variant="outline" className="mt-4">
                <Link href="/directory">
                <ChevronsRight className="h-4 w-4 mr-2 rotate-180" />
                Retour au Répertoire
                </Link>
            </Button>
        </div>
    );
  }

  if (!currentEntity) {
     // This case should ideally be handled by the error state above if fetchData completes
     // Or it might mean fetchData hasn't completed or an issue with params.
     // Fallback to a more generic not found message if no error was explicitly set but entity is still null.
    return (
        <div className="container mx-auto max-w-5xl py-6 px-4">
            <Alert variant="destructive">
                <CircleAlert className="h-5 w-5" />
                <AlertTitle>Entité Non Trouvée</AlertTitle>
                <AlertDescription>
                    L'entité que vous recherchez n'a pas pu être trouvée ou les paramètres de route sont invalides.
                </AlertDescription>
            </Alert>
             <Button asChild variant="outline" className="mt-4">
                <Link href="/directory">
                <ChevronsRight className="h-4 w-4 mr-2 rotate-180" />
                Retour au Répertoire
                </Link>
            </Button>
        </div>
    );
  }

  const entityTypeDisplay = getEntityTypeDisplayNameForClient(currentEntity.entityType);
  const editRoute = getEntityEditRoute(currentEntity.entityType, currentEntity.id);

  const renderEntitySpecificDetails = () => {
    switch (currentEntity.entityType) {
      case 'dealer':
        return <DealerTabsContent dealer={currentEntity as Dealer} onDataRefresh={fetchData} />;
      case 'loadix-unit':
        return <LoadixUnitDetailCard unit={currentEntity as LoadixUnit} />;
      case 'methanisation-site':
        return <MethanisationSiteDetailCard site={currentEntity as MethanisationSite} />;
      default:
        // This case should ideally not be reached if entityType was validated earlier
        return <p className="text-muted-foreground">Type d'entité non pris en charge pour l'affichage détaillé.</p>;
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
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg shadow-sm">
                {getEntityIcon(currentEntity.entityType, 'h-6 w-6')}
            </div>
            <h1 className="text-2xl md:text-3xl font-futura text-foreground leading-tight">{currentEntity.name}</h1>
          </div>
          <Badge variant="secondary" className="text-xs px-2.5 py-1 self-start md:self-center">{entityTypeDisplay}</Badge>
        </div>
        {(currentEntity.city || currentEntity.country) && (
            <p className="text-sm text-muted-foreground mt-1.5 ml-1 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5 inline-block opacity-70" />
                {currentEntity.city}{currentEntity.city && currentEntity.country ? ', ' : ''}{currentEntity.country}
            </p>
        )}
      </header>

      {renderEntitySpecificDetails()}

      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t border-border/20 mt-6">
          <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={editRoute}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Modifier
              </Link>
          </Button>
          <DeleteEntityButton entityType={currentEntity.entityType} entityId={currentEntity.id} />
      </CardFooter>

     <Alert variant="default" className="mt-8 bg-accent/10 border-accent/50 text-accent-foreground/90">
        <CircleAlert className="h-5 w-5 text-accent" />
        <AlertTitle className="font-bebas-neue text-lg text-accent">Note sur les Données</AlertTitle>
        <AlertDescription className="text-xs">
            Les données des concessionnaires, engins LOADIX et sites de méthanisation sont maintenant lues et écrites depuis/vers Firebase Firestore.
            La modification et suppression pour Engins/Sites sont en cours d'implémentation.
        </AlertDescription>
    </Alert>
    </div>
  );
}

    