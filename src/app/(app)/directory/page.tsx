
import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import Link from 'next/link';
import DirectoryClientContent from './directory-client-content';
import { getDealers } from '@/services/dealerService'; 
import { getLoadixUnits } from '@/services/dealerService';
import { getMethanisationSites } from '@/services/dealerService';
import type { AppEntity } from '@/types';

export const metadata: Metadata = {
  title: 'Répertoire des Entités | LOADIX Manager',
  description: 'Consultez et gérez toutes les entités: concessionnaires, clients, engins, et sites.',
};

export default async function DirectoryPage() {
  const dealers = await getDealers();
  const loadixUnits = await getLoadixUnits();
  const methanisationSites = await getMethanisationSites();
  
  const initialEntities: AppEntity[] = [...dealers, ...loadixUnits, ...methanisationSites];

  return (
    <div className="w-full h-full"> 
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50 h-full flex flex-col"> 
        <CardHeader className="text-center md:text-left p-2 md:p-3"> 
          <div className="md:flex md:items-center md:gap-4">
            <div className="mx-auto md:mx-0 bg-primary/10 text-primary p-3 rounded-full w-fit mb-2 md:mb-0 shadow-md">
              <ListChecks size={28} strokeWidth={1.5}/>
            </div>
            <div>
              <CardTitle className="text-4xl font-futura">Répertoire des Entités</CardTitle>
              <CardDescription className="text-lg font-bebas-neue tracking-wide text-muted-foreground mt-1">
                Visualisez, filtrez et recherchez parmi les concessionnaires, engins et sites.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-4"> 
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow"> 
          <DirectoryClientContent initialEntities={initialEntities} />
        </CardContent>
      </Card>
    </div>
  );
}
