'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Define the structure of your form data
interface PreventionPlanFormData {
  step1: {
    party1Name: string;
    party1Role: string;
    party2Name: string;
    party2Role: string;
    // Add other party identification fields as needed
  };
  step2: {
    risk1Description: string;
    risk1Assessment: string; // e.g., High, Medium, Low
    // Add other risk identification fields as needed
  };
  step3: {
    comments: string;
  };
}

export default function PreventionPlanForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PreventionPlanFormData>({
    step1: { party1Name: '', party1Role: '', party2Name: '', party2Role: '' },
    step2: { risk1Description: '', risk1Assessment: '' },
    step3: { comments: '' },
  });

  const handleInputChange = (step: keyof PreventionPlanFormData, field: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [step]: {
        ...prevData[step],
        [field]: value,
      },
    }));
  };

  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/generate-prevention-plan-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

 if (response.ok) { // Check if the response status is in the 2xx range
        // If OK, treat as PDF blob
 const blob = await response.blob();
 const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plan-de-prevention.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert('PDF généré et téléchargé avec succès !');

      } else { // If not OK, assume it's an error response (potentially JSON)
 let errorMessage = 'Erreur lors de la génération du PDF.';
 try {
 const errorData = await response.json(); // Try to parse as JSON
 if (errorData.message) {
 errorMessage = 'Erreur lors de la génération du PDF : ' + errorData.message;
          } else if (errorData.error) {
 errorMessage = 'Erreur lors de la génération du PDF : ' + errorData.error;
          }
 } catch (jsonError) {
          // If parsing as JSON fails, the response might be HTML or plain text
 errorMessage = `Erreur lors de la génération du PDF. Statut: ${response.status}. Impossible de lire le message d'erreur détaillé.`;
 console.error('Failed to parse error response as JSON:', jsonError);
 }
 console.error('Error response from API:', response.status, response.statusText);
 alert(errorMessage);
      }

 } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la soumission du formulaire : ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="party1Name">Nom de la partie 1</Label>
              <Input
                id="party1Name"
                value={formData.step1.party1Name}
                onChange={(e) => handleInputChange('step1', 'party1Name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="party1Role">Rôle de la partie 1</Label>
              <Input
                id="party1Role"
                value={formData.step1.party1Role}
                onChange={(e) => handleInputChange('step1', 'party1Role', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="party2Name">Nom de la partie 2</Label>
              <Input
                id="party2Name"
                value={formData.step1.party2Name}
                onChange={(e) => handleInputChange('step1', 'party2Name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="party2Role">Rôle de la partie 2</Label>
              <Input
                id="party2Role"
                value={formData.step1.party2Role}
                onChange={(e) => handleInputChange('step1', 'party2Role', e.target.value)}
              />
            </div>
            {/* Add more fields for step 1 */}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="risk1Description">Description du risque 1</Label>
              <Textarea
                id="risk1Description"
                value={formData.step2.risk1Description}
                onChange={(e) => handleInputChange('step2', 'risk1Description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="risk1Assessment">Évaluation du risque 1</Label>
              <Input
                id="risk1Assessment"
                value={formData.step2.risk1Assessment}
                onChange={(e) => handleInputChange('step2', 'risk1Assessment', e.target.value)}
              />
            </div>
            {/* Add more fields for step 2 */}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="comments">Commentaires généraux</Label>
              <Textarea
                id="comments"
                value={formData.step3.comments}
                onChange={(e) => handleInputChange('step3', 'comments', e.target.value)}
              />
            </div>
            {/* Add more fields for step 3, e.g., signature */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-futura text-center">Plan de Prévention - Étape {currentStep}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Précédent
            </Button>
          )}
          {currentStep < 3 ? (
            <Button onClick={nextStep} className="ml-auto">
              Suivant
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="ml-auto" disabled={isSubmitting}>
              Soumettre
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}