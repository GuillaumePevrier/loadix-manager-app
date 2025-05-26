
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MethanisationSiteForm from '@/components/CreateMethanisationSiteForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NewMethanisationSiteData } from '@/types';
import { createMethanisationSite } from '@/services/methanisationSiteService'; // Import the service
import methanisationSiteService from '@/services/methanisationSiteService';
export default function CreateMethanisationSitePage() {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      <Card className="shadow-none bg-transparent border-none h-full flex flex-col rounded-none">
        <CardHeader className="p-3 md:p-4 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" asChild className="h-9 w-9">
                <Link href="/methanisation-sites">
                  {/* You might want to change the back button text and link */}
                  <span className="sr-only">Retour aux sites de méthanisation</span>
                </Link>
              </Button>
              <div>
                <CardTitle className="text-xl md:text-2xl font-futura">Créer un nouveau site de méthanisation</CardTitle>
                <CardDescription className="text-xs md:text-sm font-bebas-neue tracking-wide text-muted-foreground">
                  Remplissez les informations pour ajouter un nouveau site.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <MethanisationSiteForm
              onSubmit={async (data: NewMethanisationSiteData) => {
                try {
                  // Call the service to create the site
                  await methanisationSiteService.createMethanisationSite(data);
                  // Navigate to the list page on success
                  // Replace with your actual navigation logic (e.g., using next/navigation's useRouter)
                   window.location.href = '/methanisation-sites';
                } catch (error) {
                  console.error('Error creating methanisation site:', error);
                  // Display an error message to the user
                }
              }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
