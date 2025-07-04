import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OfflineBanner from '@/components/OfflineBanner';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Menu Pro - Plataforma de menús digitales',
  description: 'Gestiona tus restaurantes y menús digitales de forma sencilla',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <OfflineBanner />
            <Header />
            <main className="flex-1">
              <div className="mx-auto max-w-6xl p-4">
                {children}
              </div>
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
