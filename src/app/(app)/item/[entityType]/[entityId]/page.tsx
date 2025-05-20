
// This file is now a Server Component wrapper

import type { Metadata, ResolvingMetadata } from 'next';
import type { EntityType, AppEntity, Dealer, LoadixUnit, MethanisationSite } from '@/types';
import { getDealerById, getLoadixUnitById, getMethanisationSiteById } from '@/services/dealerService';
import ItemDetailClient from './item-detail-client'; // Import the new client component

interface ItemPageProps {
  params: {
    entityType: EntityType;
    entityId: string;
  };
}

// Helper function used by generateMetadata
const getEntityTypeDisplayName = (type: EntityType): string => {
  const names: Record<EntityType, string> = {
    dealer: 'Concessionnaire',
    'loadix-unit': 'Engin LOADIX',
    'methanisation-site': 'Site de Méthanisation',
  };
  return names[type] || 'Entité';
};

export async function generateMetadata(
  { params }: ItemPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  let entity: AppEntity | null = null;
  if (params.entityType === 'dealer') {
    entity = await getDealerById(params.entityId);
  } else if (params.entityType === 'loadix-unit') {
    entity = await getLoadixUnitById(params.entityId);
  } else if (params.entityType === 'methanisation-site') {
    entity = await getMethanisationSiteById(params.entityId);
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

// This is the Server Component page
export default async function ItemPageWrapper({ params }: ItemPageProps) {
  // The Server Component passes params to the Client Component.
  // The Client Component will handle its own data fetching and state.
  return <ItemDetailClient params={params} />;
}

