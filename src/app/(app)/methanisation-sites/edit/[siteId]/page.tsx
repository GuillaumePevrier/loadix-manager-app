"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { MethanisationSite } from '@/types';
import { getMethanisationSiteById, updateMethanisationSite } from '@/services/methanisationSiteService';
import { ChevronLeft, Loader2, CircleAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MethanisationSiteFormContent from '@/components/methanisation-sites/MethanisationSiteFormContent';
import { Textarea } from '@/components/ui/textarea';

interface EditMethanisationSitePageProps {
  params: { siteId: string };
}

export default function EditMethanisationSitePage({ params }: EditMethanisationSitePageProps) {
  const { siteId } = params;
  const [site, setSite] = React.useState<MethanisationSite | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const router = useRouter();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSite = await getMethanisationSiteById(siteId);
      if (!fetchedSite) {
        setError(`Site de Méthanisation avec ID ${siteId} non trouvé.`);
      }
      // Convert any Timestamp objects to strings before setting state
      if (fetchedSite) {
        if (fetchedSite.createdAt && typeof fetchedSite.createdAt !== 'string' && typeof (fetchedSite.createdAt as any).toDate === 'function') {
          fetchedSite.createdAt = (fetchedSite.createdAt as any).toDate().toISOString();
        }
        if (fetchedSite.updatedAt && typeof fetchedSite.updatedAt !== 'string' && typeof (fetchedSite.updatedAt as any).toDate === 'function') {
          fetchedSite.updatedAt = (fetchedSite.updatedAt as any).toDate().toISOString();
        }
      }
      setSite(fetchedSite);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des données du site.');
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSite(prevSite => {
      if (!prevSite) return null;

      // Handle specific input types that might require type conversion
      let processedValue: any = value;
      if (e.target.type === 'number') {
        processedValue = parseFloat(value) || 0; // Convert to number, default to 0 if invalid
      } else if (e.target.type === 'checkbox') {
         processedValue = (e.target as HTMLInputElement).checked; // Handle checkbox boolean value
      }


      return { ...prevSite, [name]: processedValue };
    });
  };

   const handleRelatedDealerIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Split the comma-separated string into an array of strings, trimming whitespace
    const dealerIdsArray = value.split(',').map(id => id.trim()).filter(id => id !== '');
     setSite(prevSite => {
      if (!prevSite) return null;
      return { ...prevSite, relatedDealerIds: dealerIdsArray };
    });
  };


  const handleSave = async () => {
    if (!site) return;

    setIsSaving(true);
    setError(null);
    try {
      // Prepare the data to save. Convert string representations of dates back if necessary
      // depending on what your update service expects.
      const siteToSave = { ...site };

      await updateMethanisationSite(siteToSave);
      // Optionally show a success message
      router.push(`/item/methanisation-site/${siteId}`); // Redirect back to detail page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'enregistrement des modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-muted-foreground">Chargement du site...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="container mx-auto max-w-5xl py-6">
        <Alert variant="destructive">
          <CircleAlert className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/directory">
            <ChevronLeft className="h-4 w-4 mr-2" /> Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-4 px-3 md:px-4">
      <Button asChild variant="outline" className="mb-6">
        <Link href={`/item/methanisation-site/${siteId}`}>
          <ChevronLeft className="h-4 w-4 mr-1.5" /> Retour aux détails
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold">Modifier Site de Méthanisation</h1>
      </header>

      <MethanisationSiteFormContent
        site={site}
        isEditing={true}
        handleInputChange={handleInputChange}
      />


      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(`/item/methanisation-site/${siteId}`)} disabled={isSaving}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}