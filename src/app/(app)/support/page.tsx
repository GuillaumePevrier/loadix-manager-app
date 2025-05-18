
import type { Metadata } from 'next';
import SupportForm from './support-form'; // Adjusted path if support-form is moved
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BotMessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Powered Support | LOADIX Manager',
  description: 'Get AI-powered support for your LOADIX units.',
};

export default function SupportPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="shadow-xl bg-card/80 backdrop-blur-lg border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 shadow-md">
            <BotMessageSquare size={36} strokeWidth={1.5}/>
          </div>
          <CardTitle className="text-4xl font-futura">AI-Powered Support</CardTitle>
          <CardDescription className="text-lg font-bebas-neue tracking-wide text-muted-foreground mt-1">
            Describe your LOADIX unit issue for AI-driven troubleshooting and documentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-6 md:px-8">
          <SupportForm />
        </CardContent>
      </Card>
    </div>
  );
}
