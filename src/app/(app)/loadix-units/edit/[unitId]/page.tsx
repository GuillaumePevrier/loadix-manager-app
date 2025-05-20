
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditLoadixUnitPage() {
  const params = useParams();
  const unitId = params.unitId as string;

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <Card className="shadow-none bg-transparent border-none h-full flex flex-col rounded-none">
        <CardHeader className="p-3 md:p-4 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" asChild className="h-9 w-9">
                <Link href={unitId ? `/item/loadix-unit/${unitId}` : "/directory"}>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Retour à la fiche Engin</span>
                </Link>
              </Button>
              <div>
                <CardTitle className="text-xl md:text-2xl font-futura">Modifier Fiche Engin LOADIX</CardTitle>
                <CardDescription className="text-xs md:text-sm font-bebas-neue tracking-wide text-muted-foreground">
                  Mettez à jour les informations de l'engin LOADIX. ID: {unitId}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground">Formulaire de modification pour Engin LOADIX à implémenter.</p>
            {/* Placeholder for CreateLoadixUnitForm or a dedicated EditLoadixUnitForm */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
