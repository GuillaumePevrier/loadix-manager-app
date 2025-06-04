// src/components/EditMethanisationSiteForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { geocodeAddress } from '@/services/geocodingService'; // Import real geocoding service
import { getMethanisationSiteById, updateMethanisationSite } from '@/services/methanisationSiteService'; // Import site service
import type { GeoLocation } from '@/types'; // Assuming GeoLocation type exists
import { Loader2, MapPin, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface EditMethanisationSiteFormProps {
  siteId: string;
  onSuccessfulSave?: () => void; // Optional callback after save
}

interface MethanisationSiteFormData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation: GeoLocation | undefined;
  contactEmail: string;
  // Add other fields relevant to a methanisation site here later
  // ... other fields
}

const EditMethanisationSiteForm: React.FC<EditMethanisationSiteFormProps> = ({ siteId, onSuccessfulSave }) => {
  const [formData, setFormData] = useState<MethanisationSiteFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressValidated, setAddressValidated] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch existing site data
  useEffect(() => {
    const fetchSiteData = async () => {
      setIsLoading(true);
      try {
        const siteData = await getMethanisationSiteById(siteId);
        if (siteData) {
          setFormData(siteData);
          // If site already has geolocation, assume address is validated initially
          if (siteData.geoLocation) {
            setAddressValidated(true);
          } else {
            setAddressValidated(null); // Needs validation if no geo data
          }
        } else {
          setSubmissionError(`Site with ID ${siteId} not found.`);
        }
      } catch (error) {
        console.error("Error fetching site data:", error);
        setSubmissionError("Failed to load site data for editing.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSiteData();
  }, [siteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      if (!prevData) return null;
      const newData = { ...prevData, [name]: value };
      // Reset validation status if address fields change
      if (['address', 'city', 'postalCode', 'country'].includes(name)) {
        setAddressValidated(null);
        newData.geoLocation = undefined;
      }
      return newData;
    });
  };

  // Placeholder for select change if needed later
  const handleSelectChange = (name: keyof MethanisationSiteFormData, value: string | string[]) => {
     setFormData(prevData => {
      if (!prevData) return null;
      return { ...prevData, [name]: value as any };
     });
  };


   const handleRealGeocodeAddress = async () => {
    if (!formData || !formData.address || !formData.city || !formData.postalCode || !formData.country) {
      setSubmissionError("Veuillez remplir tous les champs d\'adresse pour la géolocalisation.");
      toast({
        variant: "destructive",
        title: "Champs d\'adresse incomplets",
        description: "L\'adresse, le code postal, la ville et le pays sont requis.",
      });
      return;
    }
    setIsGeocoding(true);
    setAddressValidated(null);
    setSubmissionError(null);
     setFormData(prev => { // Clear previous geo on new attempt
        if (!prev) return null;
        return { ...prev, geoLocation: undefined };
    });


    const result = await geocodeAddress({
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
    });

    if (result.success && result.location) {
      setFormData((prev) => {
         if (!prev) return null;
         return { ...prev, geoLocation: result.location };
      });
      setAddressValidated(true);
      toast({
        title: "Adresse Géocodée avec Succès",
        description: `Coordonnées trouvées: Lat ${result.location.lat.toFixed(5)}, Lng ${result.location.lng.toFixed(5)}. Adresse formatée: ${result.formattedAddress || 'N/A'}`,
      });
    } else {
      setAddressValidated(false);
      const errorMessage = result.error || 'Échec du géocodage. Vérifiez l\'adresse et votre clé API Google.';
      setSubmissionError(errorMessage);
      toast({
        variant: "destructive",
        title: "Échec du Géocodage",
        description: errorMessage,
      });
    }
    setIsGeocoding(false);
  };


  const handleSubmit = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    // --- Address validation checks (similar to create form) ---
     if (formData.address && formData.city && formData.postalCode && formData.country && addressValidated === null) {
      setSubmissionError("Veuillez valider l\'adresse avant de mettre à jour le site de méthanisation.");
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Validation d\'adresse requise",
        description: "Cliquez sur \'Valider l\'Adresse\'.",
      });
      return;
    }

    if (formData.address && formData.city && formData.postalCode && formData.country && addressValidated === false) {
      setSubmissionError("L\'adresse n\'a pas pu être validée. Veuillez vérifier les informations ou réessayer.");
      setIsSubmitting(false);
       toast({
        variant: "destructive",
        title: "Adresse Non Validée",
        description: "La validation de l\'adresse a échoué. Veuillez corriger ou réessayer.",
      });
      return;
    }
    // --- End of address validation checks ---


    try {
      // Call the update service
      await updateMethanisationSite(siteId, formData);
      toast({
        title: "Succès",
        description: `Site \"${formData.name}\" mis à jour.`,
      });
      if (onSuccessfulSave) {
        onSuccessfulSave(); // Trigger data refresh in parent
      }
       router.push(`/item/methanisation-site/${siteId}`); // Redirect to detail view
    } catch (error) {
      console.error("Error updating site:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la mise à jour.";
      setSubmissionError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
     return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Chargement des données du site...</p>
      </div>
     );
  }

   if (submissionError && !formData) { // Show error if initial load failed
     return (
       <Alert variant="destructive" className="mt-4">
         <AlertTriangle className="h-4 w-4" />
         <AlertTitle>Erreur de chargement</AlertTitle>
         <AlertDescription>{submissionError}</AlertDescription>
       </Alert>
     );
   }


   if (!formData) { // Should not happen if error is handled, but as a safeguard
       return <p className="text-center text-muted-foreground">Impossible de charger les données du site.</p>;
   }


  // This form doesn't need multi-steps for now, just a single form for editing
  return (
    <div className="space-y-6 p-4"> {/* Added padding */}
      <h2 className="text-xl font-semibold mb-4">Modifier Fiche Site de Méthanisation</h2>
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du Site *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Biogaz Ferme Duval" className="bg-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-end">
            <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ex: 123 Chemin des Champs" required className="bg-white" />
            </div>
            <div>
                <Label htmlFor="postalCode">Code Postal *</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Ex: 35000" required className="bg-white" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-end">
          <div>
            <Label htmlFor="city">Ville *</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ex: Rennes" required className="bg-white" />
          </div>
          <div>
            <Label htmlFor="country">Pays *</Label>
            <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Ex: France" required/>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
            <Button type="button" onClick={handleRealGeocodeAddress} disabled={isGeocoding || !formData.address || !formData.city || !formData.postalCode || !formData.country} variant="outline" size="sm">
                {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                Valider l\'Adresse
            </Button>
            {addressValidated === true && <CheckCircle className="h-5 w-5 text-green-500" title="Adresse validée"/>}
            {addressValidated === false && formData.address && formData.city && formData.postalCode && formData.country && <XCircle className="h-5 w-5 text-red-500" title="Validation échouée"/>}
        </div>
        {formData.geoLocation && addressValidated === true && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Coordonnées : Lat {formData.geoLocation.lat.toFixed(5)}, Lng {formData.geoLocation.lng.toFixed(5)}</p>
        )}
        <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription>La validation de l\'adresse utilise l\'API Google Geocoding. Assurez-vous que votre clé API est configurée et dispose des autorisations nécessaires.</AlertDescription>
        </Alert>

        {/* Additional basic fields */}
         <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de contact principal</Label>
            <Input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail || ''} onChange={handleChange} placeholder="Ex: contact@site-biogaz.com" className="bg-white" />
        </div>

        {/* Add more fields for editing here later */}

        {submissionError && (
          <Alert variant="destructive" className="mt-3 md:mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}


        <div className="flex justify-end"> {/* Align button to the right */}
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isGeocoding} size="lg">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMethanisationSiteForm;