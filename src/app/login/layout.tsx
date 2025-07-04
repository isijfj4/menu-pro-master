import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Menu Pro',
  description: 'Accede a la administración de restaurantes',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
