'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-destructive/15 text-destructive px-4 py-2 flex items-center justify-center gap-2 text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>
        Sin conexión a Internet. Algunas funciones pueden no estar disponibles.
      </span>
    </div>
  );
}
