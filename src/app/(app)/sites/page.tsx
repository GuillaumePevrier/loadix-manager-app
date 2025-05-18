
// This page is now a placeholder or can be removed if /directory handles sites.
// For now, let's make it a simple page that suggests going to the main directory.
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, ListChecks } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sites de Méthanisation | LOADIX Manager',
  description: 'Gestion des sites de méthanisation.',
};

export default function SitesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-3">
            <Factory size={28}/>
          </div>
          <CardTitle className="text-3xl font-futura">Gestion des Sites de Méthanisation</CardTitle>
          <CardDescription className="font-bebas-neue text-lg">
            Cette section est en cours d'intégration dans le nouveau module "Répertoire".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Pour visualiser et gérer les sites de méthanisation, ainsi que d'autres entités comme les concessionnaires, les clients et les engins LOADIX, veuillez utiliser la nouvelle page Répertoire.
          </p>
          <Button asChild size="lg">
            <Link href="/directory">
              <ListChecks className="mr-2 h-5 w-5" />
              Accéder au Répertoire
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
