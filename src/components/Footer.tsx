'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu Pro</h3>
            <p className="text-sm text-muted-foreground">
              Plataforma de gestión de menús digitales para restaurantes en Perú.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/configuracion-de-restaurantes" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Administración
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p className="text-sm text-muted-foreground">
              ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@menupro.pe" className="text-primary hover:underline">soporte@menupro.pe</a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Menu Pro. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
