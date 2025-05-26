
// This is a client component
"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getDealerById, updateDealer, addCommentToDealer } from '@/services/dealerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Dealer, UpdateDealerData, Comment, GeoLocation } from '@/types';
import { TRACTOR_BRAND_OPTIONS, MACHINE_TYPE_OPTIONS } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    CircleAlert, ChevronLeft, Loader2, MapPin, Info, Image as ImageIconLucide,
    FileText as FileTextLucide, PlusCircle, Trash2, Send, CheckCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multi-select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { geocodeAddress } from '@/services/geocodingService'; 
import { Badge, type BadgeProps } from '@/components/ui/badge'; // Added Badge and BadgeProps import

interface EditDealerPageProps {
  params: Promise<{ 
    dealerId: string;
  }>;
}

export default function EditDealerPage({ params: paramsPromise }: EditDealerPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const resolvedParams = React.use(paramsPromise); 
  const { dealerId } = resolvedParams;

  const [formData, setFormData] = useState<Partial<UpdateDealerData>>({
    tractorBrands: [],
    machineTypes: [],
    servicesOffered: [],
    galleryUris: [], 
    documentUris: [], 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [currentDealerData, setCurrentDealerData] = useState<Dealer | null>(null);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressValidated, setAddressValidated] = useState<boolean | null>(null);


  const fetchDealerData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!dealerId) {
          setError('ID de concessionnaire non valide ou manquant après résolution.');
          setLoading(false);
          return;
      }

      const dealerData = await getDealerById(dealerId);
      if (dealerData) {
        setCurrentDealerData(dealerData);
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
          geoLocation: dealerData.geoLocation, 
          servicesOffered: dealerData.servicesOffered || [],
        };
        setFormData(initialFormState);
        if (dealerData.geoLocation) {
          setAddressValidated(true); 
        }
 if (!dealerData.geoLocation && dealerData.address && dealerData.city && dealerData.postalCode && dealerData.country) {
 setAddressValidated(false);
        }


      } else {
        setError('Concessionnaire non trouvé.');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du concessionnaire :', err);
      setError('Échec du chargement des données du concessionnaire.');
    } finally {
      setLoading(false);
    }
  }, [dealerId]); 

  useEffect(() => {
    if (dealerId) {
      fetchDealerData();
    } else {
      setError("ID de concessionnaire manquant ou non résolu.");
      setLoading(false);
    }
  }, [dealerId, fetchDealerData]); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (['address', 'city', 'postalCode', 'country'].includes(name)) {
        setAddressValidated(null); 
    }
  };

  const handleSelectChange = (name: keyof UpdateDealerData, value: string | string[]) => {
    setFormData(prevData => ({ ...prevData, [name]: value as any }));
  };


  const handleRealGeocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      setError("Veuillez remplir tous les champs d'adresse pour la validation.");
      toast({
        variant: "destructive",
        title: "Champs d'adresse incomplets",
        description: "L'adresse, le code postal, la ville et le pays sont requis.",
      });
      return;
    }
    setIsGeocoding(true);
    setAddressValidated(null);
    setError(null);
    setFormData(prev => ({ ...prev, geoLocation: undefined })); 

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
        description: `Coordonnées: Lat ${result.location.lat.toFixed(5)}, Lng ${result.location.lng.toFixed(5)}. ${result.formattedAddress || ''}`,
      });
    } else {
      setAddressValidated(false);
      const errorMessage = result.error || 'Échec du géocodage. Vérifiez l\'adresse et la configuration de la clé API.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Échec du Géocodage",
        description: errorMessage,
      });
    }
    setIsGeocoding(false);
  };


  const handleAddNewComment = async () => {
    if (!newCommentText.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le texte du commentaire ne peut pas être vide.",
      });
      return;
    }
    setIsAddingComment(true);
    try {
      const userName = user?.name || "Utilisateur Anonyme";
      const currentProspectionStatus = formData.prospectionStatus || currentDealerData?.prospectionStatus || 'none';
      
      await addCommentToDealer(dealerId, userName, newCommentText, currentProspectionStatus);
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès. Le statut du concessionnaire a été mis à jour.",
      });
      setNewCommentText('');
      await fetchDealerData(); 
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de l'ajout du commentaire.",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const addressFieldsChanged = formData.address !== currentDealerData?.address ||
                               formData.city !== currentDealerData?.city ||
                               formData.postalCode !== currentDealerData?.postalCode ||
                               formData.country !== currentDealerData?.country;

    if (addressFieldsChanged && addressValidated !== true && (formData.address || formData.city || formData.postalCode || formData.country)) {
         setError("L'adresse a été modifiée. Veuillez la valider à nouveau ou assurez-vous que la validation a réussi.");
         setIsSubmitting(false);
         toast({
            variant: "destructive",
            title: "Validation d'adresse requise",
            description: "Si vous avez modifié l'adresse, veuillez la (re)valider.",
         });
         return;
    }


    try {
      if (!dealerId) {
        throw new Error("L'ID du concessionnaire est manquant.");
      }

      const dataToUpdate: UpdateDealerData = {
        ...formData,
        machineTypes: Array.isArray(formData.machineTypes) ? formData.machineTypes : [],
        tractorBrands: Array.isArray(formData.tractorBrands) ? formData.tractorBrands : [],
        servicesOffered: Array.isArray(formData.servicesOffered) ? formData.servicesOffered : [],
      };
      
      if (addressFieldsChanged && addressValidated === true) {
        dataToUpdate.geoLocation = formData.geoLocation; 
      } else if (!addressFieldsChanged) {
        dataToUpdate.geoLocation = currentDealerData?.geoLocation; 
      } else {
        dataToUpdate.geoLocation = formData.geoLocation; 
      }


      await updateDealer(dealerId, dataToUpdate);
      toast({
        title: "Succès",
        description: "Concessionnaire mis à jour avec succès.",
      });
      router.push(`/item/dealer/${dealerId}`);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du concessionnaire :', err);
      const errorMessage = err instanceof Error ? err.message : 'Échec de la mise à jour du concessionnaire.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de Mise à Jour",
        description: errorMessage,
      });
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

  if (error && !currentDealerData) {
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

  if (!currentDealerData || Object.keys(formData).length === 0) {
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

  const currentCommentsForDisplay = currentDealerData?.comments || [];


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
        <CardContent className="p-2 md:p-3 flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <CircleAlert className="h-5 w-5" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-3 md:mb-4 bg-muted/50 p-1 h-auto">
                <TabsTrigger value="details" className="text-xs sm:text-sm px-2 py-1.5">Détails</TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-1.5">Contact & Commercial</TabsTrigger>
                <TabsTrigger value="prospection" className="text-xs sm:text-sm px-2 py-1.5">Suivi Prospection</TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm px-2 py-1.5">Médias</TabsTrigger>
                <TabsTrigger value="relations" className="text-xs sm:text-sm px-2 py-1.5">Relations</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-3 md:space-y-4 p-1">
                <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-md shadow-sm bg-card">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Informations Générales</h3>
                  <div>
                    <Label htmlFor="name">Nom du concessionnaire *</Label>
                    <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" name="address" value={formData.address || ''} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
                  <div className="flex items-center gap-2 mt-1">
                      <Button type="button" onClick={handleRealGeocodeAddress} disabled={isGeocoding || !formData.address || !formData.city || !formData.postalCode || !formData.country} variant="outline" size="sm">
                          {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                          Valider l'Adresse
                      </Button>
                      {addressValidated === true && <CheckCircle className="h-5 w-5 text-green-500" title="Adresse validée"/>}
                      {addressValidated === false && <XCircle className="h-5 w-5 text-red-500" title="Validation échouée"/>}
                      {addressValidated === null && currentDealerData?.geoLocation && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-5 w-5 text-blue-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Adresse initialement géocodée. Validez à nouveau si modifiée.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                  </div>
                  {formData.geoLocation && (
                    <div className="mt-1">
                        <p className="text-xs text-muted-foreground">Coordonnées (si validées) : Lat {formData.geoLocation.lat.toFixed(5)}, Lng {formData.geoLocation.lng.toFixed(5)}</p>
                    </div>
                  )}
                   <Alert variant="default" className="mt-2 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                       <Info className="h-4 w-4 text-accent" />
                       <AlertDescription>La validation d'adresse utilise l'API Google Geocoding. Assurez-vous que votre clé API est correctement configurée et autorisée.</AlertDescription>
                   </Alert>

                  <div>
                      <Label htmlFor="department">Département</Label>
                      <Input id="department" name="department" value={formData.department || ''} onChange={handleInputChange} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-3 md:space-y-4 p-1">
                <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-md shadow-sm bg-card">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Contact et Informations Commerciales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="fax">Fax</Label>
                      <Input id="fax" name="fax" value={formData.fax || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                    <Label htmlFor="tractorBrands">Marques d'engins distribuées</Label>
                    <MultiSelect
                        options={TRACTOR_BRAND_OPTIONS}
                        selected={formData.tractorBrands || []}
                        onChange={(selected) => handleSelectChange('tractorBrands', selected)}
                        placeholder="Sélectionner marques..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="machineTypes">Types de machines gérées</Label>
                     <MultiSelect
                        options={MACHINE_TYPE_OPTIONS}
                        selected={formData.machineTypes || []}
                        onChange={(selected) => handleSelectChange('machineTypes', selected)}
                        placeholder="Sélectionner types..."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prospection" className="space-y-3 md:space-y-4 p-1">
                 <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-md shadow-sm bg-card">
                    <h3 className="text-lg font-semibold text-primary border-b pb-2">Suivi de Prospection</h3>
                    <div>
                        <Label htmlFor="prospectionStatus">Statut de prospection du concessionnaire</Label>
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
                    <div className="mt-3 md:mt-4">
                        <h4 className="text-md font-semibold text-foreground/90 mb-2">Commentaires Existants</h4>
                        {(!currentCommentsForDisplay || currentCommentsForDisplay.length === 0) ? (
                            <p className="text-sm text-muted-foreground italic mt-1">Aucun commentaire.</p>
                        ) : (
                            <ScrollArea className="h-[150px] md:h-[200px] mt-1 p-2 md:p-3 border rounded-md bg-muted/20 space-y-2 md:space-y-3">
                                {currentCommentsForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((comment, index) => (
                                    <div key={index} className="text-xs p-1.5 md:p-2 rounded bg-background/50 border">
                                        <p className="font-medium text-foreground/90">{comment.userName} - <span className="text-muted-foreground">{new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                                        <p className="text-foreground/80 whitespace-pre-line mt-0.5">{comment.text}</p>
                                        {comment.imageUrl && <Image src={comment.imageUrl} alt="Image commentaire" width={80} height={80} className="mt-1 rounded-md object-cover" data-ai-hint="comment image" />}
                                        {comment.fileUrl && <a href={comment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs mt-1 inline-block">{comment.fileName || 'Fichier attaché'}</a>}
                                        {comment.prospectionStatusAtEvent && <Badge variant={getProspectionStatusBadgeInfo(comment.prospectionStatusAtEvent).variant} className="text-xs mt-1">Statut: {getProspectionStatusBadgeInfo(comment.prospectionStatusAtEvent).label}</Badge>}
                                    </div>
                                ))}
                            </ScrollArea>
                        )}
                    </div>

                    <div className="mt-4 md:mt-6 space-y-2 md:space-y-3 p-3 md:p-4 border rounded-md shadow-sm bg-card/50">
                        <h4 className="text-md font-semibold text-foreground/90">Ajouter un nouveau suivi</h4>
                        <p className="text-xs text-muted-foreground">Le statut de prospection du concessionnaire (sélectionné ci-dessus) sera enregistré avec ce commentaire.</p>
                        <div>
                            <Label htmlFor="newCommentText">Nouveau commentaire</Label>
                            <Textarea
                                id="newCommentText"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Votre commentaire..."
                                rows={3}
                                className="bg-input/70 focus:bg-input text-sm"
                            />
                        </div>
                        <Button type="button" onClick={handleAddNewComment} disabled={isAddingComment || !newCommentText.trim()} size="sm">
                            {isAddingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isAddingComment ? 'Ajout...' : 'Ajouter Suivi'}
                        </Button>
                    </div>
                 </div>
              </TabsContent>

               <TabsContent value="media" className="space-y-3 md:space-y-4 p-1">
                 <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-md shadow-sm bg-card">
                    <h3 className="text-lg font-semibold text-primary border-b pb-2">Médias</h3>
                    <Alert variant="default" className="mt-1 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                        <ImageIconLucide className="h-4 w-4 text-accent" />
                        <AlertDescription>La gestion de la galerie d'images et des documents (téléversement/suppression) sera implémentée ultérieurement.</AlertDescription>
                    </Alert>
                 </div>
              </TabsContent>

              <TabsContent value="relations" className="space-y-3 md:space-y-4 p-1">
                 <div className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-md shadow-sm bg-card">
                    <h3 className="text-lg font-semibold text-primary border-b pb-2">Relations</h3>
                     <Alert variant="default" className="mt-1 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                        <Info className="h-4 w-4 text-accent" />
                        <AlertDescription>La gestion des entités liées (sélection/liaison) sera implémentée ultérieurement.</AlertDescription>
                    </Alert>
                 </div>
              </TabsContent>

            </Tabs>

            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 md:pt-6 mt-3 md:mt-4 border-t">
              <Button type="submit" disabled={isSubmitting || loading || isAddingComment || isGeocoding} size="lg" className="w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


// Helper function to get badge info, can be co-located or imported if used elsewhere
const getProspectionStatusBadgeInfo = (
  status?: Dealer['prospectionStatus']
): { variant: BadgeProps['variant']; label: string } => {
  switch (status) {
    case 'hot': return { variant: 'destructive', label: 'Chaud 🔥' };
    case 'warm': return { variant: 'default', label: 'Tiède 🌤️' };
    case 'cold': return { variant: 'secondary', label: 'Froid ❄️' };
    case 'converted': return { variant: 'success' as any, label: 'Converti ✅' }; // success is not a standard BadgeProps variant, cast to any or define custom variant
    case 'lost': return { variant: 'outline', label: 'Perdu ❌' };
    default: return { variant: 'outline', label: 'Aucun statut' };
  }
};

