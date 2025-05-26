
'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import MethanisationSiteForm from '@/components/MethanisationSiteForm';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { methanisationSiteService } from '@/services/methanisationSiteService'; // Import the service
import { MethanisationSite, UpdateMethanisationSiteData } from '@/types'; // Import types
import { useToast } from '@/hooks/use-toast';

export default function EditMethanisationSitePage() {
  const params = useParams();
  const siteId = params.siteId as string;

  return (
    <div className="h-full w-full flex flex-col bg-background">
  const router = useRouter();
  const { toast } = useToast();

  const [siteData, setSiteData] = useState<MethanisationSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return;
      try {
        setLoading(true);
        const site = await methanisationSiteService.getMethanisationSiteById(siteId);
        setSiteData(site);
      } catch (err) {
        console.error("Failed to fetch methanisation site:", err);
        setError("Failed to load site data.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du site.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [siteId, toast]);

      <Card className="shadow-none bg-transparent border-none h-full flex flex-col rounded-none">
        <CardHeader className="p-3 md:p-4 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" asChild className="h-9 w-9">
                <Link href={siteId ? `/item/methanisation-site/${siteId}` : "/directory"}>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Retour à la fiche Site</span>
                </Link>
              </Button>
              <div>
                <CardTitle className="text-xl md:text-2xl font-futura">Modifier Fiche Site de Méthanisation</CardTitle>
                <CardDescription className="text-xs md:text-sm font-bebas-neue tracking-wide text-muted-foreground">
                  Mettez à jour les informations du site. ID: {siteId}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto">
  const handleSubmit = async (data: UpdateMethanisationSiteData) => {
    try {
      await methanisationSiteService.updateMethanisationSite(siteId, data);
      toast({
        title: "Succès",
        description: "Site de méthanisation mis à jour avec succès.",
      });
      router.push(`/item/methanisation-site/${siteId}`); // Navigate to detail page
    } catch (err) {
      console.error("Failed to update methanisation site:", err);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du site de méthanisation.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto text-center">Chargement...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto text-center text-destructive">{error}</div>;
  }

 <div className="max-w-3xl mx-auto">
            {siteData && <MethanisationSiteForm initialData={siteData} onSubmit={handleSubmit} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
