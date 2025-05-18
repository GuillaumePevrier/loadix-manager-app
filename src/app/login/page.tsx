
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
    if (isAuthenticated) {
      router.replace('/'); // Redirect to dashboard if already logged in
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("L'email et le mot de passe sont requis.");
      return;
    }
    const success = await login(email, password);
    if (success) {
      router.replace('/'); // Redirect to dashboard or intended page
    } else {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
    }
  };

  if (authIsLoading || isAuthenticated) { // Show loader or nothing if redirecting
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-lg border-border/50">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4 group">
          <Logo className="w-12 h-12 text-primary transition-transform group-hover:scale-110" />
          <h1 className="text-3xl font-futura font-semibold">LOADIX</h1>
        </Link>
        <CardTitle className="text-3xl font-futura">Connexion</CardTitle>
        <CardDescription className="text-md font-bebas-neue tracking-wide text-muted-foreground">
          Accédez à votre interface de gestion LOADIX.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@manurob.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input/50 border-border/70 focus:bg-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input/50 border-border/70 focus:bg-input"
            />
          </div>
          {error && (
            <div className="flex items-center text-sm text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full py-3 text-base" disabled={authIsLoading}>
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
      <CardFooter className="text-center text-xs text-muted-foreground justify-center">
        <p>&copy; {new Date().getFullYear()} ManuRob. Tous droits réservés.</p>
      </CardFooter>
    </Card>
  );
}
