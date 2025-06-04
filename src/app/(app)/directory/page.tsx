import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import Link from 'next/link';
import DirectoryClientContent from './directory-client-content';
import { getDealers } from '@/services/dealerService';
import { loadixUnitService } from '@/services/loadixUnitService';
import { getAllMethanisationSites } from '@/services/methanisationSiteService';
import type { AppEntity } from '@/types';

export const metadata: Metadata = {
  title: 'Répertoire des Entités | LOADIX Manager',
  description: 'Consultez et gérez toutes les entités: concessionnaires et sites de méthanisation.',
};

export default async function DirectoryPage() {
  const dealers = await getDealers();
  const methanisationSites = await getAllMethanisationSites();

  // Convertir les Timestamp en chaînes de caractères avant de les passer au composant client
  const processedDealers = dealers.map(dealer => {
    let createdAtString = null;
    if (dealer.createdAt) {
      if (typeof dealer.createdAt === 'string') {
        createdAtString = dealer.createdAt; // Already a string
      } else if (dealer.createdAt instanceof Date) {
        createdAtString = dealer.createdAt.toISOString(); // Native Date object
      } else if (typeof dealer.createdAt === 'object' && typeof (dealer.createdAt as any).toDate === 'function') {
        // Assuming it's a Firestore Timestamp based on the previous error context,
        // but adding a check for the function's existence
        createdAtString = (dealer.createdAt as any).toDate().toISOString();
      }
    }

    let updatedAtString = null;
    if (dealer.updatedAt) {
      if (typeof dealer.updatedAt === 'string') {
        updatedAtString = dealer.updatedAt; // Already a string
      } else if (dealer.updatedAt instanceof Date) {
        updatedAtString = dealer.updatedAt.toISOString(); // Native Date object
      } else if (typeof dealer.updatedAt === 'object' && typeof (dealer.updatedAt as any).toDate === 'function') {
        // Assuming it's a Firestore Timestamp
        updatedAtString = (dealer.updatedAt as any).toDate().toISOString();
      }
    }

    return {
      ...dealer,
      createdAt: createdAtString,
      updatedAt: updatedAtString,
    };
  });

  const processedMethanisationSites = methanisationSites.map(site => {
    // Appliquer la même logique de conversion pour les sites de méthanisation
    // Assuming similar structure for methanisation sites dates
    // Note: The actual type of site.createdAt/updatedAt might need more specific handling
    return { ...site, entityType: 'site', createdAt: (site.createdAt as any)?.toDate?.().toISOString() || null, updatedAt: (site.updatedAt as any)?.toDate?.().toISOString() || null };
 });

  const initialEntities: AppEntity[] = [...processedDealers, ...processedMethanisationSites];

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
                Visualisez, filtrez et recherchez parmi les concessionnaires et sites de méthanisation.
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