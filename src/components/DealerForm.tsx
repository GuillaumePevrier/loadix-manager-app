// This is a client component
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from './ui/multi-select'; // Assuming you have a multi-select component
import { CheckCircle, XCircle, MapPin } from 'lucide-react'; // Icons for validation and geocoding
import { addDealer } from '@/services/dealerService'; // Assuming you have addDealer
import { useRouter } from 'next/navigation'; // For redirection

// Define the structure for dealer form data
interface DealerFormData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  servicesOffered: string[];
  tractorBrands: string[];
  machineTypes: string[];
  prospectionStatus: 'hot' | 'warm' | 'cold' | 'none';
  comments: string;
  // Placeholders for more complex fields
  // galleryUris: string[];
  // documentUris: string[];
  // relatedClientIds: string[];
  // relatedProspectIds: string[];
  // relatedSiteIds: string[];
  geoLocation?: { lat: number; lng: number };
}

const initialFormData: DealerFormData = {
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  contactPerson: '',
  servicesOffered: [],
  tractorBrands: [],
  machineTypes: [],
  prospectionStatus: 'none',
  comments: '',
};

// Dummy data for MultiSelect options (replace with actual data fetching if needed)
const serviceOptions = [
  { value: 'entretien', label: 'Entretien' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'vente', label: 'Vente' },
  { value: 'location', label: 'Location' },
];

const tractorBrandOptions = [
  { value: 'john_deere', label: 'John Deere' },
  { value: 'case_ih', label: 'Case IH' },
  { value: 'new_holland', label: 'New Holland' },
  { value: 'fendt', label: 'Fendt' },
  { value: 'massey_ferguson', label: 'Massey Ferguson' },
];

const machineTypeOptions = [
  { value: 'tracteur', label: 'Tracteur' },
  { value: 'moissonneuse', label: 'Moissonneuse-batteuse' },
  { value: 'ensileuse', label: 'Ensileuse' },
  { value: 'semoir', label: 'Semoir' },
];


const DealerForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DealerFormData>(initialFormData);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressValidated, setAddressValidated] = useState<boolean | null>(null);
  const router = useRouter();

  const totalSteps = 4; // Update this as more steps are added

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Reset address validation when address fields change
    if (['address', 'city', 'postalCode', 'country'].includes(id)) {
        setAddressValidated(null);
        setFormData((prev) => ({ ...prev, geoLocation: undefined })); // Clear previous geo data
    }
  };

  const handleSelectChange = (id: keyof DealerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleMultiSelectChange = (id: keyof DealerFormData, values: string[]) => {
     setFormData((prev) => ({ ...prev, [id]: values }));
  };

  const validateStep = (): boolean => {
    // Basic validation for required fields in the current step
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== '' &&
               formData.address.trim() !== '' &&
               formData.city.trim() !== '' &&
               formData.postalCode.trim() !== '' &&
               formData.country.trim() !== '' &&
               addressValidated === true; // Require address validation
      case 1:
        return formData.phone.trim() !== '' &&
               formData.email.trim() !== ''; // Add more validation as needed (email format, etc.)
      case 2:
        return true; // No mandatory fields for services/types in this example
      case 3:
        return true; // No mandatory fields for comments/media in this example
      default:
        return true;
    }
  };


  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // TODO: Show a user-friendly error message
      console.warn("Please fill in all required fields and validate the address before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleGeocodeAddress = async () => {
    const fullAddress = `${formData.address}, ${formData.postalCode} ${formData.city}, ${formData.country}`;
    console.log('Attempting to geocode address:', fullAddress);
    setIsGeocoding(true);
    setAddressValidated(null); // Reset validation status

    try {
        // TODO: Replace with actual API call to a geocoding service
        // Example using a placeholder:
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay

        // Simulate a successful geocoding result
        const mockGeoLocation = { lat: 48.1173 + Math.random() * 0.1, lng: -1.6778 + Math.random() * 0.1 }; // Mock coordinates near Rennes

        if (mockGeoLocation) { // Check if geocoding was successful
            setFormData((prev) => ({ ...prev, geoLocation: mockGeoLocation }));
            setAddressValidated(true);
            console.log('Geocoding successful:', mockGeoLocation);
        } else {
            setAddressValidated(false);
            console.warn('Geocoding failed for address:', fullAddress);
            // TODO: Show error message to user
        }

    } catch (error) {
        console.error('Error during geocoding:', error);
        setAddressValidated(false);
        // TODO: Show error message to user
    } finally {
        setIsGeocoding(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
         console.warn("Form validation failed on submission step.");
         // TODO: Show error message to user
         return;
    }

    console.log('Submitting form with data:', formData);
     // Ensure geoLocation is present if address was validated
    if (!formData.geoLocation && addressValidated === true) {
         console.error("Geocoding was marked as successful but geoLocation is missing.");
         // TODO: Handle this unexpected state
         return;
    }


    try {
        // Call the addDealer service function
        const newDealer = await addDealer(formData); // Assuming addDealer takes DealerFormData

        if (newDealer) {
            console.log('Dealer created successfully:', newDealer);
            // Redirect to the new dealer's detail page or a success page
            router.push(`/item/dealer/${newDealer.id}`); // Redirect to the detail page
        } else {
             console.error('Failed to create dealer: addDealer returned null.');
             // TODO: Show a user-friendly error message
        }

    } catch (error) {
        console.error('Error submitting form and creating dealer:', error);
        // TODO: Show a user-friendly error message
    }
  };

  // Render content based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bebas-neue text-primary">Informations Générales ({currentStep + 1}/{totalSteps})</h2>
            {/* Basic Info Inputs */}
            <div>
              <Label htmlFor="name">Nom du Concessionnaire</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            {/* Address Fields - will add geocoding later */}
             <div>
              <Label htmlFor="address">Adresse</Label>
              <div className="flex space-x-2">
                 <Input id="address" value={formData.address} onChange={handleInputChange} required />
                  {/* Geocoding Button/Icon */}
                  <Button type="button" onClick={handleGeocodeAddress} disabled={isGeocoding || formData.address.trim() === '' || formData.city.trim() === '' || formData.postalCode.trim() === '' || formData.country.trim() === ''}>
                    {isGeocoding ? 'Génération...' : <MapPin className="h-4 w-4" />}
                  </Button>
                  {/* Validation Icon */}
                  {addressValidated === true && <CheckCircle className="h-6 w-6 text-green-500 self-center" />}
                  {addressValidated === false && <XCircle className="h-6 w-6 text-red-500 self-center" />}
              </div>
            </div>
             <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={formData.city} onChange={handleInputChange} required />
            </div>
             <div>
              <Label htmlFor="postalCode">Code Postal</Label>
              <Input id="postalCode" value={formData.postalCode} onChange={handleInputChange} required />
            </div>
             <div>
              <Label htmlFor="country">Pays</Label>
              <Input id="country" value={formData.country} onChange={handleInputChange} required />
            </div>
             {formData.geoLocation && addressValidated === true && (
                <div className="text-sm text-muted-foreground">
                    Localisation générée : Lat {formData.geoLocation.lat.toFixed(4)}, Lng {formData.geoLocation.lng.toFixed(4)}
                </div>
             )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bebas-neue text-primary">Contact et Commercial ({currentStep + 1}/{totalSteps})</h2>
            {/* Contact Info Inputs */}
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="website">Site Web</Label>
              <Input id="website" value={formData.website} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="contactPerson">Personne à contacter</Label>
              <Input id="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
            </div>
            {/* Prospection Status - using a simple Select for now */}
             <div>
              <Label htmlFor="prospectionStatus">Statut Prospection</Label>
               <Select onValueChange={(value) => handleSelectChange('prospectionStatus', value)} value={formData.prospectionStatus}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="cold">Froid</SelectItem>
                  <SelectItem value="warm">Tiède</SelectItem>
                  <SelectItem value="hot">Chaud</SelectItem>
                 {/* Add converted/lost if needed in creation form */}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
         return (
          <div className="space-y-4">
            <h2 className="text-xl font-bebas-neue text-primary">Services et Types ({currentStep + 1}/{totalSteps})</h2>
            {/* Multi-selects - Assuming MultiSelect component exists */}
            <div>
              <Label htmlFor="servicesOffered">Services Proposés</Label>
              {/* Replace with actual MultiSelect component usage */}
               {/* Assuming MultiSelect takes options and a value prop for selected items */}
               {/* <MultiSelect
                 options={serviceOptions}
                 value={formData.servicesOffered}
                 onChange={(values) => handleMultiSelectChange('servicesOffered', values)}
               /> */}
               <p className="text-muted-foreground text-sm">Placeholder pour MultiSelect - Services Proposés</p> {/* Placeholder for now */}
            </div>
             <div>
              <Label htmlFor="tractorBrands">Marques de Tracteurs</Label>
              {/* Replace with actual MultiSelect component usage */}
                {/* <MultiSelect
                 options={tractorBrandOptions}
                 value={formData.tractorBrands}
                 onChange={(values) => handleMultiSelectChange('tractorBrands', values)}
               /> */}
               <p className="text-muted-foreground text-sm">Placeholder pour MultiSelect - Marques de Tracteurs</p> {/* Placeholder for now */}
            </div>
             <div>
              <Label htmlFor="machineTypes">Types de Machines</Label>
              {/* Replace with actual MultiSelect component usage */}
               {/* <MultiSelect
                 options={machineTypeOptions}
                 value={formData.machineTypes}
                 onChange={(values) => handleMultiSelectChange('machineTypes', values)}
               /> */}
                <p className="text-muted-foreground text-sm">Placeholder pour MultiSelect - Types de Machines</p> {/* Placeholder for now */}
            </div>
          </div>
        );
      case 3:
         return (
          <div className="space-y-4">
            <h2 className="text-xl font-bebas-neue text-primary">Commentaires et Médias ({currentStep + 1}/{totalSteps})</h2>
            {/* Comments */}
             <div>
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea id="comments" value={formData.comments} onChange={handleInputChange} />
            </div>
            {/* Placeholders for Gallery and Documents */}
             <div>
              <Label>Galerie</Label>
               <p className="text-muted-foreground text-sm">Placeholder pour Upload de Fichiers / Gestion de Galerie</p>
            </div>
             <div>
              <Label>Documents</Label>
               <p className="text-muted-foreground text-sm">Placeholder pour Upload de Fichiers / Gestion de Documents</p>
            </div>
             {/* TODO: Add related entities pickers */}
              <div>
              <Label>Entités Liées</Label>
               <p className="text-muted-foreground text-sm">Placeholder pour sélection d'entités liées (Clients, Prospects, Sites)</p>
            </div>
          </div>
        );
      // Add more cases for other steps (e.g., Related Entities)
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderStepContent()}

      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <Button type="button" variant="outline" onClick={prevStep}>
            Précédent
          </Button>
        )}
        <div className="flex-grow"></div> {/* Spacer */}
        {currentStep < totalSteps - 1 ? (
          <Button type="button" onClick={nextStep} disabled={isGeocoding}>
            Suivant
          </Button>
        ) : (
          <Button type="submit" disabled={isGeocoding}>
            Créer Concessionnaire
          </Button>
        )}
      </div>
    </form>
  );
};

export default DealerForm;