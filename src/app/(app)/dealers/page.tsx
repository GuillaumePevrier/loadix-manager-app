
// This page is now a placeholder or can be removed if /directory handles dealers.
// For now, let's make it a simple page that suggests going to the main directory.
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ListChecks } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Concessionnaires | LOADIX Manager',
  description: 'Gestion des concessionnaires LOADIX.',
};

export default function DealersPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
            <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mr-3">
            <Building size={28}/>
          </div>
          <CardTitle className="text-3xl font-futura">Gestion des Concessionnaires</CardTitle>
            </div>
            <Link href="/dealers/create" className={buttonVariants({ variant: "default" })}>
              Créer un nouveau concessionnaire
            </Link>
          </div>
          <CardDescription className="font-bebas-neue text-lg">Liste des concessionnaires enregistrés.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for the dealer list table/component */}
          <p className="text-center text-muted-foreground">La liste des concessionnaires sera affichée ici.</p>
        </CardContent>
      </Card>
    </div>
  );
}
