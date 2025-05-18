// src/ai/flows/support-tool.ts
'use server';
/**
 * @fileOverview A GenAI-powered support tool that suggests relevant documentation and troubleshooting steps.
 *
 * - getSupportSuggestions - A function that handles the support process.
 * - SupportToolInput - The input type for the getSupportSuggestions function.
 * - SupportToolOutput - The return type for the getSupportSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupportToolInputSchema = z.object({
  loadixSerialNumber: z.string().describe('The serial number of the LOADIX unit.'),
  issueDescription: z.string().describe('A description of the issue experienced with the LOADIX unit.'),
});
export type SupportToolInput = z.infer<typeof SupportToolInputSchema>;

const SupportToolOutputSchema = z.object({
  suggestedDocumentation: z.string().describe('Suggested documentation for the issue.'),
  troubleshootingSteps: z.string().describe('Troubleshooting steps for the issue.'),
});
export type SupportToolOutput = z.infer<typeof SupportToolOutputSchema>;

export async function getSupportSuggestions(input: SupportToolInput): Promise<SupportToolOutput> {
  return supportToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supportToolPrompt',
  input: {schema: SupportToolInputSchema},
  output: {schema: SupportToolOutputSchema},
  prompt: `You are an expert technician specializing in LOADIX units.

  You will use the provided information about the LOADIX unit and the issue description to suggest relevant documentation and troubleshooting steps.

  LOADIX Serial Number: {{{loadixSerialNumber}}}
  Issue Description: {{{issueDescription}}}

  Suggested Documentation: 
  Troubleshooting Steps: `,
});

const supportToolFlow = ai.defineFlow(
  {
    name: 'supportToolFlow',
    inputSchema: SupportToolInputSchema,
    outputSchema: SupportToolOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
