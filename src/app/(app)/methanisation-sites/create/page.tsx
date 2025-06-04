'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CreateMethanisationSiteForm from '@/components/CreateMethanisationSiteForm';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreateMethanisationSitePage() {
  return (
    <div className="h-full w-full flex flex-col bg-background"> {/* Ensure full height and background color */}
      <Card className="shadow-none bg-transparent border-none h-full flex flex-col rounded-none"> {/* No shadow, transparent, no border, full height, flex column, no rounded corners */}
        <CardHeader className="p-3 md:p-4 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" asChild className="h-9 w-9">
                <Link href="/methanisation-sites">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Retour à la Liste des Sites de Méthanisation</span>
                </Link>
              </Button>
              <div>
                <CardTitle className="text-xl md:text-2xl font-futura">Créer Fiche Site Méthanisation</CardTitle>
                <CardDescription className="text-xs md:text-sm font-bebas-neue tracking-wide text-muted-foreground">
                  Remplissez les étapes pour ajouter un nouveau site de méthanisation.
                </CardDescription>
              </div>
            </div>
            {/* Placeholder for future actions */}
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto"> {/* Added overflow-y-auto for scrollability */}
          <div className="max-w-3xl mx-auto"> {/* Max width for form content within the page */}
            <CreateMethanisationSiteForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}