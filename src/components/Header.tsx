'use client';

import Link from 'next/link';
import { Home, Settings } from 'lucide-react';

export default function Header() {
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
          <Link 
            href="/configuracion-de-restaurantes" 
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            aria-label="Administración"
          >
            <Settings className="h-4 w-4" />
            <span>Administración</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
