
import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import DirectoryClientContent from './directory-client-content';
import { allMockEntities } from '@/lib/mock-data'; // Import mock data

export const metadata: Metadata = {
  title: 'Répertoire des Entités | LOADIX Manager',
  description: 'Consultez et gérez toutes les entités: concessionnaires, clients, engins, et sites.',
};

export default function DirectoryPage() {
  // For now, we pass all entities. The client component will handle filtering.
  // In a real app, this would likely involve server-side pagination and filtering.
  const entities = allMockEntities;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50">
        <CardHeader className="text-center md:text-left">
          <div className="md:flex md:items-center md:gap-4">
            <div className="mx-auto md:mx-0 bg-primary/10 text-primary p-3 rounded-full w-fit mb-4 md:mb-0 shadow-md">
              <ListChecks size={28} strokeWidth={1.5}/>
            </div>
            <div>
              <CardTitle className="text-4xl font-futura">Répertoire des Entités</CardTitle>
              <CardDescription className="text-lg font-bebas-neue tracking-wide text-muted-foreground mt-1">
                Visualisez, filtrez et recherchez parmi les concessionnaires, clients, engins et sites.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-2 md:px-6">
          <DirectoryClientContent initialEntities={entities} />
        </CardContent>
      </Card>
    </div>
  );
}
