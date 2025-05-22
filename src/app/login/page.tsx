
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/icons/logo';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading: authIsLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("L'email et le mot de passe sont requis.");
      return;
    }
    const success = await login(email, password);
    if (success) {
      router.replace('/');
    } else {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants ou réessayez.');
    }
  };

  if (authIsLoading || (!authIsLoading && isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-xl border-border/20 rounded-xl animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader className="text-center pt-8 pb-6">
        <Link href="/" className="flex flex-col items-center justify-center mb-3 group">
          <Logo className="w-28 h-28 text-primary transition-transform group-hover:scale-110 duration-300" alt="ManuRob Logo" />
        </Link>
        <CardTitle className="text-3xl font-futura text-primary">ManuRob</CardTitle>
        <CardDescription className="text-md font-bebas-neue tracking-wider text-primary/90 mt-1">
          Accédez à votre interface de gestion ManuRob.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
            <div className="relative rounded-md p-[1.5px] bg-gradient-to-r from-primary via-accent to-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card transition-all duration-300 animated-gradient-border-wrapper">
              <Input
                id="email"
                type="email"
                placeholder="admin@manurob.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[calc(var(--radius)-1.5px)] w-full placeholder:text-muted-foreground/60 py-3 px-4 text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Mot de passe</Label>
            <div className="relative rounded-md p-[1.5px] bg-gradient-to-r from-primary via-accent to-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card transition-all duration-300 animated-gradient-border-wrapper">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[calc(var(--radius)-1.5px)] w-full placeholder:text-muted-foreground/60 py-3 px-4 text-base"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full py-3 text-base font-semibold tracking-wide mt-2" disabled={authIsLoading} size="lg">
            {authIsLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground/70 justify-center pb-8 pt-4">
        <p>&copy; {new Date().getFullYear()} ManuRob. Tous droits réservés.</p>
      </CardFooter>
    </Card>
  );
}
