
import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google'; // Assuming you want consistent fonts

// If you have specific font variables like in RootLayout, replicate them or ensure they are globally available
// For simplicity, using them directly here.
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
    // Applying font variables to ensure login page has access if needed
    // globals.css should still provide base styling
    <div className={`${inter.variable} ${bebasNeue.variable} font-sans`}>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 antialiased">
        {children}
      </main>
    </div>
  );
}
