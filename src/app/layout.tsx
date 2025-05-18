import type {Metadata} from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from '@/components/layout/main-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS variable for Inter
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'], // Bebas Neue typically comes in one main weight for display
  variable: '--font-bebas-neue', // CSS variable for Bebas Neue
  display: 'swap',
});

// Futura is not available via next/font/google.
// It will be referenced via the CSS variable --font-futura defined in globals.css.

export const metadata: Metadata = {
  title: 'LOADIX Manager',
  description: 'Application de Gestion ManuRob pour les engins LOADIX',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Force dark theme as per user request */}
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased`}> {/* font-sans will use Inter due to Tailwind config */}
        <SidebarProvider defaultOpen={true}>
          <MainLayout>
            {children}
          </MainLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
