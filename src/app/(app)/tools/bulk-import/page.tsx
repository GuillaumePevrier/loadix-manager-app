
import type { Metadata } from 'next';
import BulkImportClient from './bulk-import-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Import en Masse | LOADIX Manager',
  description: 'Importer des données en masse via des fichiers CSV.',
};

export default function BulkImportPage() {
  return (
    <div className="w-full h-full flex flex-col p-2 md:p-3">
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50 flex-grow flex flex-col">
        <CardHeader className="text-center md:text-left">
          <div className="md:flex md:items-center md:gap-4">
            <div className="mx-auto md:mx-0 bg-primary/10 text-primary p-3 rounded-full w-fit mb-2 md:mb-0 shadow-md">
              <UploadCloud size={28} strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-futura">Importation en Masse</CardTitle>
              <CardDescription className="text-md md:text-lg font-bebas-neue tracking-wide text-muted-foreground mt-1">
                Chargez des données depuis des fichiers CSV pour les concessionnaires, engins LOADIX, ou sites de méthanisation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-2 pb-6 px-4 md:px-6">
          <BulkImportClient />
        </CardContent>
      </Card>
    </div>
  );
}
