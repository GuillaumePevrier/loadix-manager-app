
import type { Metadata } from 'next';
import MapClientContent from './map-client-content'; 
import { getDealers, getLoadixUnits, getMethanisationSites } from '@/services/dealerService';
import type { AppEntity } from '@/types';

export const metadata: Metadata = {
  title: 'Carte Interactive | LOADIX Manager',
  description: 'Visualisez et interagissez avec les entités sur la carte interactive.',
};

export default async function MapPage() {
  const dealers = await getDealers();
  const loadixUnits = await getLoadixUnits();
  const methanisationSites = await getMethanisationSites();
  
  const initialEntities: AppEntity[] = [...dealers, ...loadixUnits, ...methanisationSites];

  return (
    <div className="h-full w-full"> 
      <MapClientContent initialEntities={initialEntities} />
    </div>
  );
}
