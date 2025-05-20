'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDealerById, updateDealer } from '@/services/dealerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dealer } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, ChevronsRight } from 'lucide-react';
import Link from 'next/link';


interface EditDealerPageProps {
  params: {
    dealerId: string;
  };
}

export default function EditDealerPage({ params }: EditDealerPageProps) {
  const { dealerId } = params;
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Dealer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dealerData = await getDealerById(dealerId);
        if (dealerData) {
          setFormData(dealerData);
        } else {
          setError('Dealer not found');
          // Optionally redirect or handle the case where dealer is not found
           // router.push('/dealers'); // Example redirection
        }
      } catch (err) {
        console.error('Error fetching dealer:', err);
        setError('Failed to load dealer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDealerData();
  }, [dealerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!dealerId) {
        throw new Error("Dealer ID is missing.");
      }
      await updateDealer(dealerId, formData);
      router.push(`/item/dealer/${dealerId}`); // Redirect to the dealer detail page
    } catch (err) {
      console.error('Error updating dealer:', err);
      setError('Failed to update dealer.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto max-w-5xl py-8 px-4">Loading...</div>;
  }

  if (error) {
    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
             <Alert variant="destructive">
                <CircleAlert className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                {error}
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  // Ensure formData is not empty before rendering the form
  if (!formData || Object.keys(formData).length === 0) {
       return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
             <Alert variant="destructive">
                <CircleAlert className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                No dealer data available.
                </AlertDescription>
            </Alert>
        </div>
    );
  }


  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
         <Button asChild variant="outline" className="mb-6">
            <Link href={`/item/dealer/${dealerId}`}>
              <ChevronsRight className="h-4 w-4 mr-2 rotate-180" />
              Retour à la fiche Concessionnaire
            </Link>
        </Button>
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50">
        <CardHeader>
          <CardTitle className="font-bebas-neue text-primary text-3xl">Modifier Concessionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" name="address" value={formData.address || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="postalCode">Code Postal</Label>
              <Input id="postalCode" name="postalCode" value={formData.postalCode || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input id="country" name="country" value={formData.country || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="website">Site Web</Label>
              <Input id="website" name="website" value={formData.website || ''} onChange={handleInputChange} />
            </div>
             <div>
              <Label htmlFor="contactPerson">Personne à contacter</Label>
              <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} />
            </div>
            {/* Add more fields as needed */}
            <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}