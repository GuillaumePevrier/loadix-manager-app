
import type { Metadata } from 'next';
import AltMapClientContent from './alt-map-client-content';
import { allMockEntities } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Alternative Carte Interactive | LOADIX Manager',
  description: 'Test d\'affichage de la carte interactive avec une configuration alternative.',
};

export default function AltMapPage() {
  const entities = allMockEntities; // We'll use these for potential filtering examples later

  return (
    <div className="h-full w-full">
      <AltMapClientContent initialEntities={entities} />
    </div>
  );
}
