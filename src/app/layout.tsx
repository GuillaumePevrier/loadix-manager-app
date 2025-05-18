import type {Metadata} from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from '@/components/layout/main-layout';
import { ThemeProvider } from '@/components/theme-provider';

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
    <html lang="en" suppressHydrationWarning> {/* Modified to allow next-themes to control the class */}
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased`}> {/* font-sans will use Inter due to Tailwind config */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Defaulting to dark as per previous setup
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={true}>
            <MainLayout>
              {children}
            </MainLayout>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
