
import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import MapClientContent from './map-client-content';
import { allMockEntities } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Carte Interactive | LOADIX Manager',
  description: 'Visualisez les entités sur la carte interactive.',
};

export default function MapPage() {
  const entities = allMockEntities;

  return (
    <div className="container mx-auto py-8 px-4 h-full flex flex-col">
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50 flex-grow flex flex-col">
        <CardHeader className="text-center md:text-left">
          <div className="md:flex md:items-center md:gap-4">
            <div className="mx-auto md:mx-0 bg-primary/10 text-primary p-3 rounded-full w-fit mb-4 md:mb-0 shadow-md">
              <MapPin size={28} strokeWidth={1.5}/>
            </div>
            <div>
              <CardTitle className="text-4xl font-futura">Carte Interactive</CardTitle>
              <CardDescription className="text-lg font-bebas-neue tracking-wide text-muted-foreground mt-1">
                Explorez les emplacements des concessionnaires, clients, engins et sites.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-2 md:px-6 flex-grow flex flex-col">
          <MapClientContent initialEntities={entities} />
        </CardContent>
      </Card>
    </div>
  );
}
