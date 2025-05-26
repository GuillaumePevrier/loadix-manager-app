'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { addMethanisationSite } from '@/services/dealerService';
import type { NewMethanisationSiteData, GeoLocation } from '@/types';

// Initial data
const initialData: NewMethanisationSiteData = {
  name: '',
  siretSiren: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  geoLocation: undefined,
  capacity: '',
  operator: '',
  energyPrimary: '',        // MWh
  valorizationType: '',     // ex: Cogénération, Injection
  installedElectricalPower: '', // kWe
  installedThermalPower: '',    // kWth
  maxBiomethaneFlow: '',    // m3 CH4/h
  commissioningYear: '',     // Année de mise en service
  prospectionStatus: 'none',
  comments: ''
};

export default function MethanisationSiteForm() {
  const [data, setData] = useState(initialData);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addrValid, setAddrValid] = useState<boolean|null>(null);
  const [error, setError] = useState<string|null>(null);
  const router = useRouter();
  const total = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (['address','city','postalCode','country'].includes(name)) {
      setAddrValid(null);
      setData(prev => ({ ...prev, geoLocation: undefined }));
    }
  };

  const geocode = async () => {
    if (!data.address || !data.city || !data.postalCode || !data.country) return;
    setIsGeocoding(true);
    setError(null);
    setAddrValid(null);
    try {
      const loc: GeoLocation = await (async () => {
        await new Promise(r => setTimeout(r, 1000));
        return { lat: 48.8 + (Math.random()-0.5)*0.1, lng: 2.3 + (Math.random()-0.5)*0.1 };
      })();
      setData(prev => ({ ...prev, geoLocation: loc }));
      setAddrValid(true);
    } catch {
      setAddrValid(false);
      setError('Erreur lors du géocodage');
    } finally {
      setIsGeocoding(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 0: return data.name && data.siretSiren;
      case 1: return data.address && data.city && data.postalCode && data.geoLocation;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const next = () => validateStep() && setStep(s => Math.min(s + 1, total - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await addMethanisationSite(data);
      router.push(`/item/methanisation-site/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-white dark:bg-gray-600";

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Étape 1: Identification */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1/4 Identification</h2>
          <div>
            <Label htmlFor="name">Nom du site *</Label>
            <Input name="name" value={data.name} onChange={handleChange} size="lg" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="siretSiren">SIRET / SIREN *</Label>
            <Input name="siretSiren" value={data.siretSiren} onChange={handleChange} size="lg" className={inputClass} />
          </div>
        </div>
      )}

      {/* Étape 2: Localisation */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2/4 Localisation</h2>
          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input name="address" value={data.address} onChange={handleChange} size="lg" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="postalCode">Code Postal *</Label>
              <Input name="postalCode" value={data.postalCode} onChange={handleChange} size="lg" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input name="city" value={data.city} onChange={handleChange} size="lg" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="country">Pays *</Label>
              <Input name="country" value={data.country} onChange={handleChange} size="lg" className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={geocode} disabled={isGeocoding} size="sm">
              {isGeocoding ? <Loader2 className="animate-spin" /> : <MapPin />} Géocoder
            </Button>
            {addrValid === true && <CheckCircle className="text-green-500" />} 
            {addrValid === false && <XCircle className="text-red-500" />}
          </div>
          {data.geoLocation && (
            <p className="text-sm">Lat {data.geoLocation.lat.toFixed(4)}, Lng {data.geoLocation.lng.toFixed(4)}</p>
          )}
        </div>
      )}

      {/* Étape 3: Détails Techniques */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3/4 Détails</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operator">Opérateur</Label>
              <Input name="operator" value={data.operator} onChange={handleChange} size="lg" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="capacity">Capacité</Label>
              <Input name="capacity" value={data.capacity} onChange={handleChange} size="lg" className={inputClass} />
            </div>
          </div>
          <div>
            <Label htmlFor="commissioningYear">Année de mise en service</Label>
            <Input type="number" name="commissioningYear" value={data.commissioningYear} onChange={handleChange} size="lg" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="energyPrimary">Énergie primaire (MWh)</Label>
            <Input name="energyPrimary" value={data.energyPrimary} onChange={handleChange} size="lg" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="valorizationType">Valorisation</Label>
            <Input name="valorizationType" value={data.valorizationType} onChange={handleChange} size="lg" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="installedElectricalPower">Puiss. électrique (kWe)</Label>
              <Input name="installedElectricalPower" value={data.installedElectricalPower} onChange={handleChange} size="lg" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="installedThermalPower">Puiss. thermique (kWth)</Label>
              <Input name="installedThermalPower" value={data.installedThermalPower} onChange={handleChange} size="lg" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="maxBiomethaneFlow">Débit biométhane (m³/h)</Label>
              <Input name="maxBiomethaneFlow" value={data.maxBiomethaneFlow} onChange={handleChange} size="lg" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Étape 4: Prospection */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4/4 Prospection</h2>
          <div>
            <Label>Statut prospection</Label>
            <Select onValueChange={(v) => setData(d => ({ ...d, prospectionStatus: v }))} value={data.prospectionStatus}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Statut" /></SelectTrigger>
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
            <Label>Commentaires</Label>
            <Textarea name="comments" value={data.comments} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        {step > 0 && <Button variant="outline" onClick={prev}>Précédent</Button>}
        <div className="flex-1"></div>
        {step < total - 1 ? (
          <Button onClick={next}>Suivant</Button>
        ) : (
          <Button type="submit" disabled={isLoading || isGeocoding}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}Créer le site
          </Button>
        )}
      </div>
    </form>
  );
}