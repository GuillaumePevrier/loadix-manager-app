// src/components/CreateMethanisationSiteForm.tsx
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming you have a button component
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addMethanisationSite } from '@/services/methanisationSiteService'; // Import the new service function
import { geocodeAddress } from '@/services/geocodingService'; // Import real geocoding service
import type { GeoLocation } from '@/types'; // Assuming GeoLocation type exists
import { Loader2, MapPin, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface MethanisationSiteFormData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation: GeoLocation | undefined;
  // Add other fields relevant to a methanisation site here later
  contactEmail: string;
  // ... other fields
}

const initialFormData: MethanisationSiteFormData = {
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France', // Default country
  geoLocation: undefined,
  contactEmail: '',
  // Initialize other fields here
};

const CreateMethanisationSiteForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MethanisationSiteFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressValidated, setAddressValidated] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 3; // Placeholder, adjust as needed

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

  // Placeholder for select change if needed later
  const handleSelectChange = (name: keyof MethanisationSiteFormData, value: string | string[]) => {
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

    // --- Address validation checks ---
    if (formData.address && formData.city && formData.postalCode && formData.country && addressValidated === null) {
      // Address fields filled, but validation not attempted
      setSubmissionError("Veuillez valider l'adresse avant de créer le site de méthanisation.");
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Validation d'adresse requise",
        description: "Cliquez sur 'Valider l'Adresse'.",
      });
      return;
    }
    
    if (formData.address && formData.city && formData.postalCode && formData.country && addressValidated === false) {
      // Address fields filled, validation attempted but failed
      setSubmissionError("L'adresse n'a pas pu être validée. Veuillez vérifier les informations ou réessayer.");
      setIsSubmitting(false);
       toast({
        variant: "destructive",
        title: "Adresse Non Validée",
        description: "La validation de l'adresse a échoué. Veuillez corriger ou réessayer.",
      });
      return;
    }
    // --- End of address validation checks ---
    
    // Call the backend service to add the methanisation site
    try {
      const newSite = await addMethanisationSite(formData);
      if (newSite && newSite.id) {
        toast({
          title: "Succès",
          description: `Site de méthanisation "${formData.name}" créé.`,
        });
        router.push(`/item/methanisation-site/${newSite.id}`);
      } else {
        setSubmissionError("Échec de la création du site. L'identifiant n'a pas été retourné ou une erreur serveur s'est produite.");
        toast({
          variant: "destructive",
          title: "Erreur de création",
          description: "L'identifiant n'a pas été retourné ou une erreur s'est produite.",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la soumission du formulaire site de méthanisation :", error);
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
                    {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}\n'
                    Valider l'Adresse
                </Button>
                {addressValidated === true && <CheckCircle className="h-5 w-5 text-green-500" title="Adresse validée"/>}
                {addressValidated === false && formData.address && formData.city && formData.postalCode && formData.country && <XCircle className="h-5 w-5 text-red-500" title="Validation échouée"/>}
            </div>
            {formData.geoLocation && addressValidated === true && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Coordonnées : Lat {formData.geoLocation.lat.toFixed(5)}, Lng {formData.geoLocation.lng.toFixed(5)}</p>
            )}
            <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                <Info className="h-4 w-4 text-accent" />
                <AlertDescription>La validation de l'adresse utilise l'API Google Geocoding. Assurez-vous que votre clé API est configurée et dispose des autorisations nécessaires.</AlertDescription>
            </Alert>

            <div>
                <Label htmlFor="contactEmail">Email de contact principal</Label>
                <Input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail || ''} onChange={handleChange} placeholder="Ex: contact@site-biogaz.com" className="bg-white" />
            </div>
            {/* Add more fields for step 0 as needed */}
          </div>
        );
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3 md:mb-4">Informations Techniques et de Production</h3>
            <p>Contenu de l'étape 2...</p>
            {/* Add technical fields here */}
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-3 md:mb-4">Documents et Liens</h3>
            <p>Contenu de l'étape 3...</p>
            {/* Add document/link fields here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <Progress value={Math.max(5, ((currentStep + 1) / totalSteps) * 100)} className="w-full h-1.5 md:h-2" />

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
              {isSubmitting ? 'Création...' : 'Créer le site de méthanisation'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateMethanisationSiteForm;