
import type { Metadata } from 'next';
import MapClientContent from './map-client-content';
import { allMockEntities } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Carte Interactive | LOADIX Manager',
  description: 'Visualisez les entités sur la carte interactive.',
};

export default function MapPage() {
  const entities = allMockEntities;

  return (
    // Ce conteneur permet à MapClientContent de prendre toute la hauteur disponible
    // au sein de la zone de contenu principale (définie par MainLayout).
    <div className="h-full w-full"> 
      <MapClientContent initialEntities={entities} />
    </div>
  );
}
