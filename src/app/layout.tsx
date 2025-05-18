
import type {Metadata} from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// Removed SidebarProvider and MainLayout from here
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider

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
  title: 'LOADIX Manager',
  description: 'Application de Gestion ManuRob pour les engins LOADIX',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased`}>
        <AuthProvider> {/* AuthProvider wraps ThemeProvider and children */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children} {/* Children will be (app)/layout.tsx or login/layout.tsx's content */}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
