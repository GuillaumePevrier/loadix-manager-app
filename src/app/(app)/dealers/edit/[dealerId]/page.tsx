
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDealerById, updateDealer } from '@/services/dealerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Dealer, UpdateDealerData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, ChevronLeft, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditDealerPageProps {
  params: {
    dealerId: string;
  };
}

export default function EditDealerPage({ params }: EditDealerPageProps) {
  const { dealerId } = params;
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<UpdateDealerData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add state for simulated geocoding if needed, though geocoding on edit is complex
  // const [isGeocoding, setIsGeocoding] = useState(false);
  // const [addressValidated, setAddressValidated] = useState<boolean | null>(null);


  useEffect(() => {
    const fetchDealerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dealerData = await getDealerById(dealerId);
        if (dealerData) {
          // Ensure all fields are present for the form, even if undefined
          const initialFormState: Partial<UpdateDealerData> = {
            name: dealerData.name || '',
            address: dealerData.address || '',
            city: dealerData.city || '',
            postalCode: dealerData.postalCode || '',
            country: dealerData.country || '',
            department: dealerData.department || '',
            phone: dealerData.phone || '',
            fax: dealerData.fax || '',
            email: dealerData.email || '',
            website: dealerData.website || '',
            contactPerson: dealerData.contactPerson || '',
            brandSign: dealerData.brandSign || '',
            branchName: dealerData.branchName || '',
            machineTypes: dealerData.machineTypes || [],
            tractorBrands: dealerData.tractorBrands || [],
            prospectionStatus: dealerData.prospectionStatus || 'none',
            // Comments are complex, usually handled separately or via a sub-component.
            // For simplicity, we might not edit comments directly in this form.
            // initialCommentText: '', // This field is for creation, not typically for edit form.
            geoLocation: dealerData.geoLocation, // Keep existing geoLocation
          };
          setFormData(initialFormState);
        } else {
          setError('Concessionnaire non trouvé.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du concessionnaire :', err);
        setError('Échec du chargement des données du concessionnaire.');
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      fetchDealerData();
    } else {
      setError("ID de concessionnaire manquant.");
      setLoading(false);
    }
  }, [dealerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // If address fields change, you might want to reset or re-validate geoLocation
    // if (['address', 'city', 'postalCode', 'country'].includes(name)) {
    //   setAddressValidated(null);
    //   setFormData(prev => ({ ...prev, geoLocation: undefined }));
    // }
  };

  const handleSelectChange = (name: keyof UpdateDealerData, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value as any }));
  };
  
  const handleMultiSelectChange = (name: 'machineTypes' | 'tractorBrands', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (!dealerId) {
        throw new Error("L'ID du concessionnaire est manquant.");
      }
      // Prepare data for update, removing any fields not meant for direct update here
      const dataToUpdate: UpdateDealerData = { ...formData };
      
      // Geocoding on edit if address changed would go here
      // For now, we assume geoLocation is either kept as is or cleared if address changes without new geocoding

      await updateDealer(dealerId, dataToUpdate);
      router.push(`/item/dealer/${dealerId}`); // Redirect to the dealer detail page
    } catch (err) {
      console.error('Erreur lors de la mise à jour du concessionnaire :', err);
      setError(err instanceof Error ? err.message : 'Échec de la mise à jour du concessionnaire.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <Alert variant="destructive">
          <CircleAlert className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/directory">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour au Répertoire
          </Link>
        </Button>
      </div>
    );
  }

  if (!formData || Object.keys(formData).length === 0) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <Alert>
          <CircleAlert className="h-5 w-5" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Aucune donnée de concessionnaire à afficher pour la modification.</AlertDescription>
        </Alert>
         <Button asChild variant="outline" className="mt-4">
          <Link href="/directory">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour au Répertoire
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <Card className="shadow-none bg-transparent border-none h-full flex flex-col rounded-none">
        <CardHeader className="p-3 md:p-4 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" asChild className="h-9 w-9">
                <Link href={`/item/dealer/${dealerId}`}>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Retour à la fiche</span>
                </Link>
              </Button>
              <div>
                <CardTitle className="text-xl md:text-2xl font-futura">Modifier Fiche Concessionnaire</CardTitle>
                <CardDescription className="text-xs md:text-sm font-bebas-neue tracking-wide text-muted-foreground">
                  Mettez à jour les informations de "{formData.name || 'Concessionnaire'}".
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
            {/* Section Informations Générales */}
            <div className="space-y-4 p-4 border rounded-md shadow-sm bg-card">
              <h3 className="text-lg font-semibold text-primary border-b pb-2">Informations Générales</h3>
              <div>
                <Label htmlFor="name">Nom du concessionnaire *</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" name="address" value={formData.address || ''} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code Postal</Label>
                  <Input id="postalCode" name="postalCode" value={formData.postalCode || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" name="country" value={formData.country || ''} onChange={handleInputChange} />
                </div>
              </div>
               <div>
                  <Label htmlFor="department">Département</Label>
                  <Input id="department" name="department" value={formData.department || ''} onChange={handleInputChange} />
              </div>
            </div>

            {/* Section Contact & Commercial */}
            <div className="space-y-4 p-4 border rounded-md shadow-sm bg-card">
              <h3 className="text-lg font-semibold text-primary border-b pb-2">Contact et Informations Commerciales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input id="fax" name="fax" value={formData.fax || ''} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="website">Site Web</Label>
                  <Input id="website" name="website" value={formData.website || ''} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPerson">Personne à contacter</Label>
                <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="brandSign">Enseigne</Label>
                <Input id="brandSign" name="brandSign" value={formData.brandSign || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="branchName">Succursale</Label>
                <Input id="branchName" name="branchName" value={formData.branchName || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="tractorBrands">Marques d'engins (séparées par virgule)</Label>
                <Input id="tractorBrands" name="tractorBrands" value={(formData.tractorBrands || []).join(', ')} onChange={(e) => handleMultiSelectChange('tractorBrands', e.target.value)} />
                 <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription>Un composant de sélection multiple sera ajouté ultérieurement.</AlertDescription>
                 </Alert>
              </div>
              <div>
                <Label htmlFor="machineTypes">Types de machines (séparées par virgule)</Label>
                <Input id="machineTypes" name="machineTypes" value={(formData.machineTypes || []).join(', ')} onChange={(e) => handleMultiSelectChange('machineTypes', e.target.value)} />
                <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription>Un composant de sélection multiple sera ajouté ultérieurement.</AlertDescription>
                 </Alert>
              </div>
            </div>
            
            {/* Section Prospection */}
            <div className="space-y-4 p-4 border rounded-md shadow-sm bg-card">
              <h3 className="text-lg font-semibold text-primary border-b pb-2">Prospection</h3>
               <div>
                <Label htmlFor="prospectionStatus">Statut de prospection</Label>
                <Select name="prospectionStatus" onValueChange={(value) => handleSelectChange('prospectionStatus', value)} value={formData.prospectionStatus || 'none'}>
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
              {/* Note: Comment editing is usually a more complex feature, potentially a list of comments with add/edit/delete.
                  For this form, we're focusing on top-level dealer fields. The existing comments are preserved.
                  Adding new comments would typically be on the detail page. */}
            </div>


            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || loading} size="lg">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
