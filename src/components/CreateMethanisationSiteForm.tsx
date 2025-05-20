
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // If needed for detailed descriptions
import { useRouter } from 'next/navigation';
import { addMethanisationSite } from '@/services/dealerService'; // Using dealerService for now
import type { NewMethanisationSiteData, GeoLocation } from '@/types';
import { Loader2, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialFormData: NewMethanisationSiteData = {
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  geoLocation: undefined,
  capacity: '',
  operator: '',
  startDate: undefined,
};

export default function CreateMethanisationSiteForm() {
  const [formData, setFormData] = useState<NewMethanisationSiteData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressValidated, setAddressValidated] = useState<boolean | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
     if (['address', 'city', 'postalCode', 'country'].includes(name)) {
        setAddressValidated(null);
        setFormData(prev => ({ ...prev, geoLocation: undefined }));
    }
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      setSubmissionError("Veuillez remplir tous les champs d'adresse pour la géolocalisation.");
      return;
    }
    setIsGeocoding(true);
    setAddressValidated(null);
    setSubmissionError(null);
    // Simulate Geocoding
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockSuccess = Math.random() > 0.2; // Simulate 80% success
    if (mockSuccess) {
        const mockLocation = { lat: 48.8566 + (Math.random() - 0.5) * 0.2, lng: 2.3522 + (Math.random() - 0.5) * 0.2 };
        setFormData((prev) => ({ ...prev, geoLocation: mockLocation }));
        setAddressValidated(true);
    } else {
        setAddressValidated(false);
        setSubmissionError('Géocodage simulé échoué. Vérifiez l\'adresse.');
    }
    setIsGeocoding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    if (formData.address && !formData.geoLocation && addressValidated !== true) {
      setSubmissionError("Veuillez valider l'adresse pour la géolocalisation.");
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Replace with actual addMethanisationSite service call to Firestore
      console.log("Submitting Methanisation Site Data:", formData);
      const newSite = await addMethanisationSite(formData); // This is a mock for now
      if (newSite && newSite.id) {
        router.push(`/item/methanisation-site/${newSite.id}`);
      } else {
        setSubmissionError("Échec de la création du site. L'ID n'a pas été retourné.");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire de site :", error);
      setSubmissionError(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Informations du Site de Méthanisation</h3>
      <div>
        <Label htmlFor="name">Nom du Site *</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: BioEnergie Ouest" />
      </div>
      
      <h3 className="text-lg font-semibold text-primary border-b pb-2 my-4 pt-2">Localisation</h3>
      <div>
          <Label htmlFor="address">Adresse *</Label>
          <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ex: 123 Rue Principale" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <Label htmlFor="postalCode">Code Postal *</Label>
            <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Ex: 75001" required />
        </div>
        <div>
            <Label htmlFor="city">Ville *</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ex: Paris" required />
        </div>
        <div>
            <Label htmlFor="country">Pays *</Label>
            <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Ex: France" required/>
        </div>
      </div>
      <div className="flex items-center gap-2">
          <Button type="button" onClick={handleGeocodeAddress} disabled={isGeocoding || !formData.address || !formData.city || !formData.postalCode || !formData.country} variant="outline" size="sm">
              {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
              Valider l'Adresse
          </Button>
          {addressValidated === true && <CheckCircle className="h-5 w-5 text-green-500" title="Adresse validée"/>}
          {addressValidated === false && formData.address && <XCircle className="h-5 w-5 text-red-500" title="Validation échouée"/>}
      </div>
       {formData.geoLocation && addressValidated === true && (
          <p className="text-xs text-green-600 dark:text-green-400">Coordonnées géographiques : Lat {formData.geoLocation.lat.toFixed(5)}, Lng {formData.geoLocation.lng.toFixed(5)}</p>
      )}

      <h3 className="text-lg font-semibold text-primary border-b pb-2 my-4 pt-2">Détails Opérationnels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="operator">Opérateur</Label>
          <Input id="operator" name="operator" value={formData.operator || ''} onChange={handleChange} placeholder="Ex: Valorem SAS" />
        </div>
        <div>
          <Label htmlFor="capacity">Capacité</Label>
          <Input id="capacity" name="capacity" value={formData.capacity || ''} onChange={handleChange} placeholder="Ex: 5000 t/an ou 250 kW" />
        </div>
      </div>
      <div>
        <Label htmlFor="startDate">Date de mise en service</Label>
        <Input id="startDate" name="startDate" type="date" value={formData.startDate || ''} onChange={handleChange} />
      </div>
      
      {/* Placeholders for more complex fields like siteClients, technologies, relatedDealerIds */}
      <Alert variant="default" className="mt-6 bg-accent/10 border-accent/50 text-accent-foreground/90">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <AlertTitle className="font-semibold text-accent">Fonctionnalités à venir</AlertTitle>
          <AlertDescription className="text-xs">
            La gestion des clients du site, des technologies utilisées et des concessionnaires liés sera ajoutée ultérieurement.
          </AlertDescription>
      </Alert>

      {submissionError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end items-center pt-5 mt-5 border-t border-border/30">
        <Button type="submit" disabled={isSubmitting || isGeocoding} size="lg">
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {isSubmitting ? 'Création...' : 'Créer le Site'}
        </Button>
      </div>
    </form>
  );
}
