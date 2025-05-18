
import type { Metadata } from 'next';
import MapClientContent from './map-client-content'; // Updated import
import { allMockEntities } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Carte Interactive | LOADIX Manager', // Updated title
  description: 'Visualisez et interagissez avec les entités sur la carte interactive.',
};

export default function MapPage() {
  const entities = allMockEntities;

  return (
    // Ce conteneur permet à MapClientContent de prendre toute la hauteur disponible
    <div className="h-full w-full"> 
      <MapClientContent initialEntities={entities} />
    </div>
  );
}
