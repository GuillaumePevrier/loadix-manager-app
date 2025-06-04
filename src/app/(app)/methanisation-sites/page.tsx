'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next'; // Keep Metadata import but it won't be exported from here
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Import the service function to get all methanisation sites
import { getAllMethanisationSites, MethanisationSite } from '@/services/methanisationSiteService';

// Metadata export is not allowed in Client Components, keep it commented or define in a layout
/*
export const metadata: Metadata = {
  title: 'Sites de Méthanisation | LOADIX Manager',
  description: 'Gestion des sites de méthanisation.',
};
*/

export default function MethanisationSitesPage() {
  const [sites, setSites] = useState<MethanisationSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSites = async () => {
      setIsLoading(true);
      try {
        const fetchedSites = await getAllMethanisationSites();
        setSites(fetchedSites);
      } catch (error) {
        console.error("Error fetching methanisation sites:", error);
        // Optionally, display an error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleRowClick = (siteId: string) => {
    router.push(`/item/methanisation-site/${siteId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Factory className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Liste des Sites de Méthanisation</h1>
        </div>
        <Link href="/methanisation-sites/create" className={buttonVariants({ variant: "default" })}>
          Créer un nouveau site
        </Link>
      </div>
      <p className="text-lg text-muted-foreground mb-8">Gérez l'ensemble des sites de méthanisation enregistrés dans le système.</p>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Chargement des sites...</span>
        </div>
      ) : sites.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucun site de méthanisation trouvé. Créez-en un nouveau.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] min-w-[180px]">Nom du Site</TableHead>
                <TableHead className="min-w-[200px]">Adresse</TableHead>
                <TableHead className="min-w-[120px] hidden sm:table-cell">Ville</TableHead>
                <TableHead className="min-w-[100px] hidden md:table-cell">Pays</TableHead>
                <TableHead className="min-w-[150px] hidden lg:table-cell">Email Contact</TableHead>
                {/* Add more TableHeads for other relevant fields */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow
                  key={site.id}
                  onClick={() => handleRowClick(site.id)}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>{site.address}</TableCell>
                  <TableCell className="hidden sm:table-cell">{site.city}</TableCell>
                  <TableCell className="hidden md:table-cell">{site.country}</TableCell>
                  <TableCell className="hidden lg:table-cell">{site.contactEmail || 'N/A'}</TableCell>
                  {/* Add more TableCells */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
