
// src/app/(app)/support/support-form.tsx
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSupportSuggestions, type SupportToolInput, type SupportToolOutput } from '@/ai/flows/support-tool';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, AlertTriangle, Lightbulb, Wrench, Info } from 'lucide-react';

const supportFormSchema = z.object({
  loadixSerialNumber: z.string().min(5, { message: 'Serial number must be at least 5 characters.' }).max(50),
  issueDescription: z.string().min(10, { message: 'Issue description must be at least 10 characters.' }).max(1000),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export default function SupportForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SupportToolOutput | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
  });

  const onSubmitHandler: SubmitHandler<SupportFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await getSupportSuggestions(data as SupportToolInput);
      setSuggestions(result);
      // reset(); // Optional: reset form after successful submission
    } catch (e) {
      console.error('Error getting support suggestions:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.';
      setError(`Failed to get suggestions: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        <div>
          <Label htmlFor="loadixSerialNumber" className="text-sm font-medium text-foreground/80">
            LOADIX Serial Number
          </Label>
          <Input
            id="loadixSerialNumber"
            type="text"
            {...register('loadixSerialNumber')}
            className={`mt-1 bg-input/50 border-border/70 focus:bg-input ${errors.loadixSerialNumber ? 'border-destructive ring-destructive' : 'focus:ring-primary'}`}
            placeholder="e.g., LDX-2024-001"
          />
          {errors.loadixSerialNumber && (
            <p className="mt-1 text-sm text-destructive">{errors.loadixSerialNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="issueDescription" className="text-sm font-medium text-foreground/80">
            Issue Description
          </Label>
          <Textarea
            id="issueDescription"
            {...register('issueDescription')}
            rows={5}
            className={`mt-1 bg-input/50 border-border/70 focus:bg-input resize-none ${errors.issueDescription ? 'border-destructive ring-destructive' : 'focus:ring-primary'}`}
            placeholder="Describe the problem you are experiencing with the LOADIX unit..."
          />
          {errors.issueDescription && (
            <p className="mt-1 text-sm text-destructive">{errors.issueDescription.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full py-3 text-base" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Issue...
            </>
          ) : (
            'Get AI Suggestions'
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-6 bg-destructive/10 border-destructive/50 text-destructive-foreground">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle className="font-bebas-neue text-lg">Error Occurred</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <Card className="mt-8 bg-card/70 backdrop-blur-lg border-border/30 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="h-8 w-8 text-primary flex-shrink-0" />
              <CardTitle className="text-3xl font-futura">AI Support Suggestions</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Based on the provided information, here are some suggestions:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div>
              <h3 className="text-xl font-bebas-neue text-primary mb-2 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Suggested Documentation
              </h3>
              <div className="p-4 rounded-md bg-black/20 border border-border/20">
                <p className="text-foreground/90 whitespace-pre-line" style={{lineHeight: 1.6}}>
                  {suggestions.suggestedDocumentation || 'No specific documentation was identified by the AI.'}
                </p>
              </div>
            </div>
            
            <hr className="border-border/20" />
            
            <div>
              <h3 className="text-xl font-bebas-neue text-primary mb-2 flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Troubleshooting Steps
              </h3>
              <div className="p-4 rounded-md bg-black/20 border border-border/20">
                <p className="text-foreground/90 whitespace-pre-line" style={{lineHeight: 1.6}}>
                  {suggestions.troubleshootingSteps || 'No specific troubleshooting steps were identified by the AI.'}
                </p>
              </div>
            </div>

            <Alert className="mt-6 bg-accent/10 border-accent/50 text-accent-foreground/90">
              <Info className="h-5 w-5 text-accent" />
              <AlertTitle className="font-bebas-neue text-lg text-accent">Important Note</AlertTitle>
              <AlertDescription>
                These suggestions are AI-generated and should be used as a preliminary guide. Always refer to official ManuRob service protocols and consult with a certified technician for complex issues.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
