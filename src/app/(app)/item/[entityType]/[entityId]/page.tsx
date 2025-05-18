
import * as React from 'react'; // Ajout de cette ligne
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import type { EntityType, AppEntity, Dealer, Client, LoadixUnit, MethanisationSite } from '@/types';
import { findEntityByIdAndType } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, Truck, Factory, MapPin, Phone, Mail, Globe, CalendarDays, Tag, Info, Hash, Power, ChevronsRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  const entity = findEntityByIdAndType(params.entityType, params.entityId);
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

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | string[] | null | React.ReactNode; isLink?: boolean; isEmail?: boolean }> = ({ icon: Icon, label, value, isLink, isEmail }) => {
  if (!value) return null;

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
        return <span className="text-foreground/90 break-words">{value}</span>;
    }
    return <span className="text-foreground/90 break-words">{String(value)}</span>;
  };

  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};


const DealerDetailCard: React.FC<{ dealer: Dealer }> = ({ dealer }) => (
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

const ClientDetailCard: React.FC<{ client: Client }> = ({ client }) => (
  <>
    <DetailItem icon={User} label="Nom du Contact" value={client.contactName} />
    <DetailItem icon={Mail} label="Email du Contact" value={client.contactEmail} isEmail />
    <DetailItem icon={Phone} label="Téléphone du Contact" value={client.contactPhone} />
    <DetailItem icon={Factory} label="Secteur d'Activité" value={client.industry} />
  </>
);

const LoadixUnitDetailCard: React.FC<{ unit: LoadixUnit }> = ({ unit }) => (
  <>
    <DetailItem icon={Hash} label="Numéro de Série" value={unit.serialNumber} />
    <DetailItem icon={Truck} label="Modèle" value={unit.model} />
    <DetailItem icon={Power} label="Statut" value={unit.status ? <Badge variant={unit.status === 'active' ? 'default' : unit.status === 'maintenance' ? 'outline' : 'destructive'}>{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</Badge> : null} />
    <DetailItem icon={CalendarDays} label="Date d'achat" value={unit.purchaseDate ? new Date(unit.purchaseDate).toLocaleDateString() : undefined} />
    <DetailItem icon={CalendarDays} label="Dernière Maintenance" value={unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate).toLocaleDateString() : undefined} />
  </>
);

const MethanisationSiteDetailCard: React.FC<{ site: MethanisationSite }> = ({ site }) => (
  <>
    <DetailItem icon={Info} label="Capacité" value={site.capacity} />
    <DetailItem icon={User} label="Opérateur" value={site.operator} />
    <DetailItem icon={CalendarDays} label="Date de mise en service" value={site.startDate ? new Date(site.startDate).toLocaleDateString() : undefined} />
  </>
);


export default function ItemDetailPage({ params }: ItemPageProps) {
  const { entityType, entityId } = params;
  const entity = findEntityByIdAndType(entityType, entityId);

  if (!entity) {
    notFound();
  }

  const entityTypeDisplay = getEntityTypeDisplayName(entity.entityType);

  const renderEntitySpecificDetails = () => {
    switch (entity.entityType) {
      case 'dealer':
        return <DealerDetailCard dealer={entity as Dealer} />;
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
    <div className="container mx-auto max-w-4xl py-8 px-4">
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
           <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline">ID: {entity.id}</Badge>
            <Badge variant="outline">Créé le: {new Date(entity.createdAt).toLocaleDateString()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bebas-neue text-primary">Informations Générales</h3>
              <DetailItem icon={MapPin} label="Adresse" value={`${entity.address}, ${entity.postalCode} ${entity.city}, ${entity.country}`} />
              {entity.geoLocation && (
                <div className="h-48 w-full bg-muted rounded-md flex items-center justify-center">
                   <Image
                    src={`https://placehold.co/600x300.png?text=Mini+Carte+pour+${entity.name.replace(/\s/g, "+")}`}
                    alt={`Carte pour ${entity.name}`}
                    width={600}
                    height={300}
                    className="object-cover rounded-md h-full w-full"
                    data-ai-hint="map location"
                    />
                </div>
              )}
            </div>
            <div className="space-y-4">
               <h3 className="text-xl font-bebas-neue text-primary">Détails Spécifiques</h3>
              {renderEntitySpecificDetails()}
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-xl font-bebas-neue text-primary mb-3">Activité Récente (Placeholder)</h3>
            <p className="text-muted-foreground text-sm">
                Aucune activité récente à afficher pour le moment. Cette section pourra contenir des journaux d'événements, des notes, ou des interactions liées à cette entité.
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
            <Button variant="outline">Modifier</Button> {/* Button is now enabled */}
            <Button variant="destructive" disabled>Supprimer</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
