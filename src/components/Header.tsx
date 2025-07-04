'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada correctamente');
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Menu</span>
            <span>Pro</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            aria-label="Inicio"
          >
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/configuracion-de-restaurantes" 
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
                aria-label="Administración"
              >
                <Settings className="h-4 w-4" />
                <span>Administración</span>
              </Link>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-red-600"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              aria-label="Iniciar sesión"
            >
              <User className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
