// This is a client component
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDealer } from '@/services/dealerService';
import type { NewDealerData, Comment, Dealer, GeoLocation } from '@/types';
import { TRACTOR_BRAND_OPTIONS, MACHINE_TYPE_OPTIONS } from '@/types';
import { Loader2, MapPin, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { geocodeAddress } from '@/services/geocodingService'; // Import real geocoding service

interface DealerFormData extends Omit<NewDealerData, 'tractorBrands' | 'machineTypes'> {
  tractorBrands: string[];
  machineTypes: string[];
}

const initialFormData: DealerFormData = {
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  department: '',
  phone: '',
  fax: '',
  email: '',
  website: '',
  contactPerson: '',
  brandSign: '',
  branchName: '',
  machineTypes: [],
  tractorBrands: [],
  prospectionStatus: 'none',
  initialCommentText: '',
  geoLocation: undefined,
  servicesOffered: [],
  galleryUris: [],
  documentUris: [],
  relatedProspectIds: [],
  relatedSiteIds: [],
  comments: [],
};

const CreateDealerForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DealerFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressValidated, setAddressValidated] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
     if (['address', 'city', 'postalCode', 'country'].includes(name)) {
        setAddressValidated(null);
        setFormData(prev => ({ ...prev, geoLocation: undefined }));
    }
  };

  const handleSelectChange = (name: keyof DealerFormData, value: string | string[]) => {
    setFormData(prevData => ({ ...prevData, [name]: value as any }));
  };

  const handleRealGeocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      setSubmissionError("Veuillez remplir tous les champs d'adresse pour la géolocalisation.");
      toast({
        variant: "destructive",
        title: "Champs d'adresse incomplets",
        description: "L'adresse, le code postal, la ville et le pays sont requis.",
      });
      return;
    }
    setIsGeocoding(true);
    setAddressValidated(null);
    setSubmissionError(null);
    setFormData(prev => ({ ...prev, geoLocation: undefined })); // Clear previous geo on new attempt

    const result = await geocodeAddress({
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
    });

    if (result.success && result.location) {
      setFormData((prev) => ({ ...prev, geoLocation: result.location }));
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
    setIsSubmitting(true);
    setSubmissionError(null);

    if (formData.address && formData.city && formData.postalCode && formData.country && !addressValidated) {
      setSubmissionError("Veuillez valider l'adresse avant de créer le concessionnaire.");
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Validation d'adresse requise",
        description: "Cliquez sur 'Valider l'Adresse'.",
      });
      return;
    }
    
    if (formData.address && formData.city && formData.postalCode && formData.country && addressValidated === false) {
      setSubmissionError("L'adresse n'a pas pu être validée. Veuillez vérifier les informations ou réessayer.");
      setIsSubmitting(false);
       toast({
        variant: "destructive",
        title: "Adresse Non Validée",
        description: "La validation de l'adresse a échoué. Veuillez corriger ou réessayer.",
      });
      return;
    }


    const commentsArray: Comment[] = [];
    if (formData.initialCommentText && formData.initialCommentText.trim() !== '') {
      commentsArray.push({
        userName: 'Admin ManuRob', // TODO: Replace with actual user name from auth context
        date: new Date().toISOString(), // Firestore will convert this to Timestamp via serverTimestamp in addDealer
        text: formData.initialCommentText.trim(),
        prospectionStatusAtEvent: formData.prospectionStatus,
      });
    }

    const dealerToSave: NewDealerData = {
      ...formData,
      comments: commentsArray,
      // geoLocation is already set in formData if validation was successful
    };

    try {
      const newDealer = await addDealer(dealerToSave);
      if (newDealer && newDealer.id) {
        toast({
          title: "Succès",
          description: `Concessionnaire "${newDealer.name}" créé.`,
        });
        router.push(`/item/dealer/${newDealer.id}`);
      } else {
        setSubmissionError("Échec de la création du concessionnaire. L'identifiant n'a pas été retourné ou une erreur serveur s'est produite.");
        toast({
          variant: "destructive",
          title: "Erreur de création",
          description: "L'identifiant n'a pas été retourné ou une erreur s'est produite.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire concessionnaire :", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la création.";
      setSubmissionError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3 md:mb-4">Informations Générales et Localisation</h3>
            <div>
              <Label htmlFor="name">Nom du concessionnaire *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: AgriServices Nord" className="bg-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-end">
                <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ex: 123 Rue Principale" required className="bg-white" />
                </div>
                <div>
                    <Label htmlFor="postalCode">Code Postal *</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Ex: 75001" required className="bg-white" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-end">
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ex: Paris" required className="bg-white" />
              </div>
              <div>
                <Label htmlFor="country">Pays *</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Ex: France" required/>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Button type="button" onClick={handleRealGeocodeAddress} disabled={isGeocoding || !formData.address || !formData.city || !formData.postalCode || !formData.country} variant="outline" size="sm">
                    {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Valider l'Adresse
                </Button>
                {addressValidated === true && <CheckCircle className="h-5 w-5 text-green-500" title="Adresse validée"/>}
                {addressValidated === false && formData.address && <XCircle className="h-5 w-5 text-red-500" title="Validation échouée"/>}
            </div>
            {formData.geoLocation && addressValidated === true && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Coordonnées : Lat {formData.geoLocation.lat.toFixed(5)}, Lng {formData.geoLocation.lng.toFixed(5)}</p>
            )}
            <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                <Info className="h-4 w-4 text-accent" />
                <AlertDescription>La validation de l'adresse utilise l'API Google Geocoding. Assurez-vous que votre clé API est configurée et dispose des autorisations nécessaires.</AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                    <Label htmlFor="department">Département</Label>
                    <Input id="department" name="department" value={formData.department || ''} onChange={handleChange} placeholder="Ex: 75 - Paris ou Nord" />
                </div>
                 <div>
                  <Label htmlFor="machineTypes">Types de machines gérées</Label>
                   <MultiSelect
                    options={MACHINE_TYPE_OPTIONS}
                    selected={formData.machineTypes}
                    onChange={(selected) => handleSelectChange('machineTypes', selected)}
                    placeholder="Sélectionner types..."
                    className="bg-white"
                  />
                </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3 md:mb-4">Contact et Informations Commerciales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} placeholder="Ex: +33 1 23 45 67 89" className="bg-white" />
                </div>
                <div>
                    <Label htmlFor="fax">Fax</Label>
                    <Input id="fax" name="fax" type="tel" value={formData.fax || ''} onChange={handleChange} placeholder="Ex: +33 1 98 76 54 32" className="bg-white" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Ex: contact@example.com" className="bg-white" />
                </div>
                <div>
                    <Label htmlFor="website">Site Web</Label>
                    <Input id="website" name="website" type="url" value={formData.website || ''} onChange={handleChange} placeholder="Ex: https://www.example.com" />
                </div>
            </div>
             <div>
                <Label htmlFor="contactPerson">Personne à contacter</Label>
                <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder="Ex: Jean Dupont" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="tractorBrands">Marques d'engins distribuées</Label>
                  <MultiSelect
                    options={TRACTOR_BRAND_OPTIONS}
                    selected={formData.tractorBrands}
                    onChange={(selected) => handleSelectChange('tractorBrands', selected)}
                    placeholder="Sélectionner marques..."
                  />
                </div>
                <div>
                    <Label htmlFor="brandSign">Enseigne</Label>
                    <Input id="brandSign" name="brandSign" value={formData.brandSign || ''} onChange={handleChange} placeholder="Ex: Groupe AgriPro" className="bg-white" />
                </div>
            </div>
             <div>
                <Label htmlFor="branchName">Nom de la succursale (si applicable)</Label>
                <Input id="branchName" name="branchName" value={formData.branchName || ''} onChange={handleChange} placeholder="Ex: Agence de Lille" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3 md:mb-4">Prospection et Commentaires</h3>
            <div>
              <Label htmlFor="prospectionStatus">Statut de prospection</Label>
              <Select name="prospectionStatus" onValueChange={(value) => handleSelectChange('prospectionStatus', value as Dealer['prospectionStatus'])} value={formData.prospectionStatus || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="cold">Froid</SelectItem>
                  <SelectItem value="warm">Tiède</SelectItem>
                  <SelectItem value="hot">Chaud</SelectItem>
                  <SelectItem value="converted">Converti</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="initialCommentText">Commentaire initial</Label>
                <Textarea id="initialCommentText" name="initialCommentText" value={formData.initialCommentText || ''} onChange={handleChange} rows={4} placeholder="Ajoutez un premier commentaire..." />
                 <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription>L'ajout de pièces jointes sera possible depuis la fiche détaillée après création.</AlertDescription>
                 </Alert>
            </div>
            <Alert variant="default" className="mt-4 bg-muted/50 border-border/50 text-muted-foreground">
              <AlertTriangle className="h-5 w-5 text-muted-foreground/80" />
              <AlertTitle className="font-semibold">Fonctionnalités à venir</AlertTitle>
              <AlertDescription className="text-xs">
                La galerie d'images, la gestion des documents et la liaison avec d'autres entités (clients, sites) seront ajoutées ultérieurement.
              </AlertDescription>
            </Alert>
          </div>
        );
      default:
        return null;
    }
  };

  const progressValue = Math.max(5, ((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="space-y-4 md:space-y-6">
      <Progress value={progressValue} className="w-full h-1.5 md:h-2" />

      <div className="min-h-[250px] md:min-h-[300px]">{renderStepContent()}</div>

      {submissionError && (
        <Alert variant="destructive" className="mt-3 md:mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 md:pt-5 mt-4 md:mt-5 border-t border-border/30 gap-2">
        <Button onClick={handleBack} disabled={currentStep === 0 || isSubmitting || isGeocoding} variant="outline" size="lg" className="w-full sm:w-auto">
          Précédent
        </Button>
        <p className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">Étape {currentStep + 1} sur {totalSteps}</p>
        {currentStep < totalSteps - 1 ? (
          <Button onClick={handleNext} disabled={isSubmitting || isGeocoding} size="lg" className="w-full sm:w-auto">
            Suivant
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || isGeocoding} size="lg" className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? 'Création...' : 'Créer le concessionnaire'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateDealerForm;
