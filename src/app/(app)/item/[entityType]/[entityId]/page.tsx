// Temporary comment to test writing
// This is a client component
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { EntityType, AppEntity, Dealer, LoadixUnit } from '@/types';
import { getDealerById, getLoadixUnitById } from '@/services/dealerService';
import { cn } from '@/lib/utils';
import { getMethanisationSiteById } from '@/services/methanisationSiteService';
import {
  Building, Info, Truck, MapPin,
  ChevronsRight, Loader2, CircleAlert
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DealerTabsContent from './DealerTabsContent';
import DeleteButton from '@/components/item/delete-button';
import MethanisationSiteFormContent from '@/components/methanisation-sites/MethanisationSiteFormContent';

interface ItemPageProps {
  params: Promise<{ entityType: EntityType; entityId: string }>;
}

const getEntityTypeDisplayName = (type: EntityType | undefined): string => {
  const names: Record<string, string> = {
    dealer: 'Concessionnaire',
    'loadix-unit': 'Engin LOADIX',
    'methanisation-site': 'Site de Méthanisation',
  };
  return names[type] || 'Entité';
};

const getEntityIcon = (type: EntityType | undefined, className?: string): React.ReactNode => {
  const icons: Partial<Record<EntityType, React.ElementType>> = {
    dealer: Building,
    'loadix-unit': Truck,
  };
  const IconComponent = icons[type] || Info;
  return <IconComponent className={className || 'h-6 w-6'} />;
};

export default function ItemDetailPage({ params }: ItemPageProps) {
  // Unwrap the params promise as per Next.js recommendation
  const resolvedParams = React.use(params);
  const { entityType, entityId } = resolvedParams;

  const [currentEntity, setCurrentEntity] = React.useState<AppEntity | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let fetched: AppEntity | null = null;
      if (entityType === 'dealer') {
        fetched = await getDealerById(entityId);
      } else if (entityType === 'loadix-unit') {
        fetched = await getLoadixUnitById(entityId);
      } else if (entityType === 'methanisation-site') {
        fetched = await getMethanisationSiteById(entityId);
      }
      if (!fetched) {
        setError(`Entité ${getEntityTypeDisplayName(entityType)} avec ID ${entityId} non trouvée.`);
      }
      // Convert Timestamp objects to ISO strings before passing to client component
 if (fetched) {
        if (fetched.createdAt && typeof fetched.createdAt !== 'string' && typeof fetched.createdAt !== 'number' && 'toDate' in fetched.createdAt) {
 fetched.createdAt = (fetched.createdAt as any).toDate().toISOString();
        }
        if (fetched.updatedAt && typeof fetched.updatedAt !== 'string' && typeof fetched.updatedAt !== 'number' && 'toDate' in fetched.updatedAt) {
 fetched.updatedAt = (fetched.updatedAt as any).toDate().toISOString();
        }
 setCurrentEntity(fetched);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !currentEntity) {
    return (
      <div className="container mx-auto max-w-5xl py-6">
        <Alert variant="destructive">
          <CircleAlert className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/directory">
            <ChevronsRight className="h-4 w-4 mr-2 rotate-180" /> Retour
          </Link>
        </Button>
      </div>
    );
  }

  const entityDisplay = getEntityTypeDisplayName(currentEntity.entityType);
  const editRoute =
    entityType === 'dealer'
      ? `/dealers/edit/${entityId}`
      : entityType === 'methanisation-site' // Add condition for methanisation-site
      ? `/methanisation-sites/edit/${entityId}`
      : `/loadix-units/edit/${entityId}`;

  const renderDetails = () => {
    if (currentEntity.entityType === 'dealer') {
      return <DealerTabsContent dealer={currentEntity as Dealer} onDataRefresh={fetchData} />;
    }
    if (currentEntity.entityType === 'loadix-unit') {
      return (
        <Card className="shadow-lg">
          {/* TODO: Replace with LoadixUnitTabsContent */}
          {/* This is a placeholder structure */}

          <CardHeader>
            <CardTitle className="font-bebas-neue text-primary text-xl">Détails de l'Engin</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Détails du LoadixUnit */}
          </CardContent>
        </Card>
      );
    }
    if (currentEntity.entityType === 'methanisation-site') {
      return <MethanisationSiteFormContent site={currentEntity as any} isEditing={false} />;
    }
    return <p className="text-muted-foreground">Type d'entité non pris en charge.</p>;
  };

  return (
    <div className="container mx-auto max-w-5xl py-4 px-3 md:px-4">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/directory">
          <ChevronsRight className="h-4 w-4 mr-1.5 rotate-180" /> Retour
        </Link>
      </Button>

      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {getEntityIcon(currentEntity.entityType, 'h-5 w-5')}
          </div>
          <h1 className="text-2xl font-bold">{currentEntity.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{entityDisplay}</Badge>
        </div>
      </header>

      {renderDetails()}

      <div className="mt-6 flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={editRoute}>Modifier</Link>
        </Button>
        <DeleteButton entityType={currentEntity.entityType} entityId={currentEntity.id} />
      </div>
    </div>
  );
}