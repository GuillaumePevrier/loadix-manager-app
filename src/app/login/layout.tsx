
import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'Connexion | LOADIX Manager',
  description: 'Page de connexion pour LOADIX Manager.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${bebasNeue.variable} font-sans`}>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4 antialiased overflow-hidden bg-background">
        {/* Animated Aurora Background */}
        <div aria-hidden="true" className="fixed inset-0 -z-10 login-aurora-bg"></div>
        
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggleButton />
        </div>
        {children}
      </main>
    </div>
  );
}
