
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { addLoadixUnit } from '@/services/dealerService'; 
import type { NewLoadixUnitData, LoadixUnit, GeoLocation } from '@/types';
import { Loader2, MapPin, CheckCircle, XCircle, AlertTriangle, MapPinOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { geocodeAddress } from '@/services/geocodingService';

const initialFormData: NewLoadixUnitData = {
  name: '',
  serialNumber: '',
  model: '',
  status: 'in_stock',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  geoLocation: undefined,
  purchaseDate: undefined,
  lastMaintenanceDate: undefined,
  dealerId: undefined,
  methanisationSiteId: undefined,
};

const loadixModelOptions = [
  { value: 'LOADIX Pro v1', label: 'LOADIX Pro v1' },
  { value: 'LOADIX Pro v2', label: 'LOADIX Pro v2' },
  { value: 'LOADIX Compact', label: 'LOADIX Compact' },
  { value: 'LOADIX HD', label: 'LOADIX HD' },
];

const loadixStatusOptions: { value: LoadixUnit['status']; label: string }[] = [
  { value: 'active', label: 'Actif' },
  { value: 'maintenance', label: 'En Maintenance' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'in_stock', label: 'En Stock (Neuf)' },
  { value: 'sold', label: 'Vendu (Occasion)' },
];


export default function CreateLoadixUnitForm() {
  const [formData, setFormData] = useState<NewLoadixUnitData>(initialFormData);
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

  const handleSelectChange = (name: keyof NewLoadixUnitData, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value as any }));
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      setSubmissionError("Veuillez remplir tous les champs d'adresse pour la géolocalisation.");
      return;
    }
    setIsGeocoding(true);
    setAddressValidated(null);
    setSubmissionError(null);

    try {
        const result = await geocodeAddress(`${formData.address}, ${formData.postalCode}, ${formData.city}, ${formData.country}`);
        if (result && result.lat && result.lng) {
            setFormData((prev) => ({ ...prev, geoLocation: { lat: result.lat, lng: result.lng } }));
            setAddressValidated(true);
        } else {
            setAddressValidated(false);
            setSubmissionError('Géocodage échoué. L\'adresse n\'a pas pu être trouvée.');
        }
    } catch (error) {
        setAddressValidated(true);
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
      const newUnit = await addLoadixUnit(formData); 
      if (newUnit && newUnit.id) {
         router.push(`/item/loadix-unit/${newUnit.id}`);
      } else {
        setSubmissionError("Échec de la création de l'engin. L'ID n'a pas été retourné ou une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire d'engin LOADIX :", error);
      setSubmissionError(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3 md:mb-4">Informations de l'Engin LOADIX</h3>
      <div>
        <Label htmlFor="name">Nom de l'engin (ou Identifiant) *</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: LOADIX #003 - Chantier A" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <Label htmlFor="serialNumber">Numéro de Série *</Label>
          <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required placeholder="Ex: LDX-2024-003" />
        </div>
        <div>
          <Label htmlFor="model">Modèle *</Label>
          <Select name="model" onValueChange={(value) => handleSelectChange('model', value)} value={formData.model || ''} required>
            <SelectTrigger><SelectValue placeholder="Sélectionner un modèle" /></SelectTrigger>
            <SelectContent>
              {loadixModelOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="status">Statut *</Label>
        <Select name="status" onValueChange={(value) => handleSelectChange('status', value)} value={formData.status} required>
          <SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
          <SelectContent>
            {loadixStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <h3 className="text-lg font-semibold text-primary border-b pb-2 my-3 md:my-4 pt-1 md:pt-2">Localisation</h3>
       <div>
          <Label htmlFor="address">Adresse de Localisation *</Label>
          <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ex: 123 Rue Principale" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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

        {/* Geocoding Validation and Info - Adjusted Layout */}
        <div className="md:col-span-3 flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex items-center gap-2 md:w-auto">
                <Button type="button" onClick={handleGeocodeAddress} disabled={isGeocoding || !formData.address || !formData.city || !formData.postalCode || !formData.country} variant="outline" size="sm">
                    {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Valider l'Adresse
                </Button>
                {addressValidated === true && <CheckCircle className="h-5 w-5 text-green-500" title="Adresse validée"/>}
                {addressValidated === false && formData.address && <XCircle className="h-5 w-5 text-red-500" title="Validation échouée"/>}
            </div>
            <div className="text-sm text-muted-foreground flex-grow">
                <Alert variant="default"> {/* Using default variant for info */}
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        La validation de l'adresse utilise l'API Google Geocoding. Assurez-vous que votre clé API est configurée et dispose des autorisations nécessaires.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
      </div>
      {formData.geoLocation && addressValidated === true && (
          <p className="text-xs text-green-600 dark:text-green-400">Coordonnées : Lat {formData.geoLocation.lat.toFixed(5)}, Lng {formData.geoLocation.lng.toFixed(5)}</p>
      )}

      <h3 className="text-lg font-semibold text-primary border-b pb-2 my-3 md:my-4 pt-1 md:pt-2">Informations Complémentaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
                <Label htmlFor="purchaseDate">Date d'achat</Label>
                <Input id="purchaseDate" name="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="lastMaintenanceDate">Dernière Maintenance</Label>
                <Input id="lastMaintenanceDate" name="lastMaintenanceDate" type="date" value={formData.lastMaintenanceDate || ''} onChange={handleChange} />
            </div>
        </div>
        <div>
            <Label htmlFor="dealerId">Concessionnaire (Vendeur/Maintenance)</Label>
            <Input id="dealerId" name="dealerId" value={formData.dealerId || ''} onChange={handleChange} placeholder="ID Concessionnaire - Sera un Select" />
        </div>
        <div>
            <Label htmlFor="methanisationSiteId">Site de Méthanisation (Opérateur)</Label>
            <Input id="methanisationSiteId" name="methanisationSiteId" value={formData.methanisationSiteId || ''} onChange={handleChange} placeholder="ID Site - Sera un Select" />
        </div>


      {submissionError && (
        <Alert variant="destructive" className="mt-3 md:mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-end items-center pt-4 md:pt-5 mt-4 md:mt-5 border-t border-border/30 gap-2">
        <Button type="submit" disabled={isSubmitting || isGeocoding} size="lg" className="w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {isSubmitting ? 'Création...' : 'Créer l\'Engin LOADIX'}
        </Button>
      </div>
    </form>
  );
}
