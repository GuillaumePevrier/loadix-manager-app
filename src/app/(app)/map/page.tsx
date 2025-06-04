
import type { Metadata } from 'next';
import MapClientContent from './map-client-content'; 
import { getDealers, getLoadixUnits } from '@/services/dealerService';
import type { AppEntity } from '@/types';
import { getAllMethanisationSites } from '@/services/methanisationSiteService';

export const metadata: Metadata = {
  title: 'Carte Interactive | LOADIX Manager',
  description: 'Visualisez et interagissez avec les entités sur la carte interactive.',
};

export default async function MapPage() {
  const dealers = await getDealers();
  const loadixUnits = await getLoadixUnits();
  const methanisationSites = await getAllMethanisationSites();
  
  const initialEntities: AppEntity[] = [...dealers, ...loadixUnits, ...methanisationSites].map(entity => {
    // Convert Timestamp objects to ISO strings before passing to client component
    const serializedEntity: AppEntity = { ...entity };
    if (serializedEntity.createdAt && typeof serializedEntity.createdAt !== 'string') {
 serializedEntity.createdAt = (serializedEntity.createdAt as any).toDate().toISOString();
    }
    if (serializedEntity.updatedAt && typeof serializedEntity.updatedAt !== 'string') {
 serializedEntity.updatedAt = (serializedEntity.updatedAt as any).toDate().toISOString();
    }
    return serializedEntity;
  });

  return (
    <div className="h-full w-full"> 
      <MapClientContent initialEntities={initialEntities} />
    </div>
  );
}
