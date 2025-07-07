/**
 * Utilidades de diagnóstico para problemas de imágenes en producción
 */

/**
 * Información del entorno de ejecución
 */
export const getEnvironmentInfo = () => {
  const info = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Server',
    language: typeof navigator !== 'undefined' ? navigator.language : 'Unknown',
    cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
    onLine: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connection: typeof navigator !== 'undefined' && 'connection' in navigator 
      ? (navigator as any).connection 
      : null,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: typeof window !== 'undefined' ? window.location.href : 'Server',
    referrer: typeof document !== 'undefined' ? document.referrer : 'Unknown'
  };

  console.log('🌐 [DIAGNOSTICS] Información del entorno:', info);
  return info;
};

/**
 * Prueba la conectividad a Firebase Storage
 */
export const testFirebaseStorageConnectivity = async () => {
  console.log('🔍 [DIAGNOSTICS] Iniciando prueba de conectividad a Firebase Storage...');
  
  const startTime = Date.now();
  const results = {
    canReachFirebase: false,
    canReachStorage: false,
    responseTime: 0,
    error: null as string | null,
    timestamp: new Date().toISOString()
  };

  try {
    // Intentar hacer una petición a Firebase Storage
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o`;
    
    console.log('🔗 [DIAGNOSTICS] Probando conectividad a:', storageUrl);
    
    const response = await fetch(storageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    results.responseTime = Date.now() - startTime;
    results.canReachFirebase = true;
    results.canReachStorage = response.status < 500; // Cualquier respuesta que no sea error del servidor

    console.log('✅ [DIAGNOSTICS] Respuesta de Firebase Storage:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      responseTime: results.responseTime
    });

  } catch (error) {
    results.responseTime = Date.now() - startTime;
    results.error = error instanceof Error ? error.message : 'Error desconocido';
    
    console.error('❌ [DIAGNOSTICS] Error de conectividad:', {
      error: results.error,
      responseTime: results.responseTime
    });
  }

  console.log('📊 [DIAGNOSTICS] Resultados de conectividad:', results);
  return results;
};

/**
 * Valida una URL de imagen
 */
export const validateImageUrl = async (url: string) => {
  console.log('🖼️ [DIAGNOSTICS] Validando URL de imagen:', url);
  
  const startTime = Date.now();
  const results = {
    isValid: false,
    isReachable: false,
    contentType: null as string | null,
    contentLength: null as number | null,
    responseTime: 0,
    error: null as string | null,
    timestamp: new Date().toISOString()
  };

  try {
    // Validar formato de URL
    const urlObj = new URL(url);
    results.isValid = true;
    
    console.log('✅ [DIAGNOSTICS] URL válida:', {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname
    });

    // Intentar hacer HEAD request para verificar si la imagen existe
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Accept': 'image/*',
      }
    });

    results.responseTime = Date.now() - startTime;
    results.isReachable = response.ok;
    results.contentType = response.headers.get('content-type');
    results.contentLength = parseInt(response.headers.get('content-length') || '0');

    console.log('📡 [DIAGNOSTICS] Respuesta HEAD de imagen:', {
      status: response.status,
      statusText: response.statusText,
      contentType: results.contentType,
      contentLength: results.contentLength,
      responseTime: results.responseTime
    });

  } catch (error) {
    results.responseTime = Date.now() - startTime;
    results.error = error instanceof Error ? error.message : 'Error desconocido';
    
    console.error('❌ [DIAGNOSTICS] Error al validar imagen:', {
      url,
      error: results.error,
      responseTime: results.responseTime
    });
  }

  console.log('📊 [DIAGNOSTICS] Resultados de validación de imagen:', results);
  return results;
};

/**
 * Ejecuta un diagnóstico completo del sistema de imágenes
 */
export const runImageSystemDiagnostics = async () => {
  console.log('🚀 [DIAGNOSTICS] Iniciando diagnóstico completo del sistema de imágenes...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: getEnvironmentInfo(),
    connectivity: await testFirebaseStorageConnectivity(),
    firebaseConfig: {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }
  };

  console.log('📋 [DIAGNOSTICS] Diagnóstico completo:', diagnostics);
  return diagnostics;
};

/**
 * Hook para ejecutar diagnósticos automáticamente en desarrollo
 */
export const useImageDiagnostics = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Solo ejecutar en el cliente y en desarrollo
    setTimeout(() => {
      runImageSystemDiagnostics();
    }, 2000); // Esperar 2 segundos después de la carga
  }
};
