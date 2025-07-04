# Configuración de Autenticación - Menu Pro

Este documento explica cómo configurar la autenticación Firebase para el sistema de administración de restaurantes.

## Configuración de Firebase Auth

### 1. Habilitar Authentication en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en "Authentication"
4. Ve a la pestaña "Sign-in method"
5. Habilita "Email/Password" como proveedor de autenticación

### 2. Crear el primer usuario administrador

Tienes varias opciones para crear el primer usuario:

#### Opción A: Desde Firebase Console (Recomendado)
1. En Firebase Console, ve a Authentication > Users
2. Haz clic en "Add user"
3. Ingresa el email y contraseña del administrador
4. Haz clic en "Add user"

#### Opción B: Crear página de registro temporal
Puedes crear temporalmente una página de registro para crear el primer usuario y luego eliminarla.

#### Opción C: Usar Firebase Admin SDK
Si tienes acceso al backend, puedes usar el Admin SDK para crear usuarios.

### 3. Variables de entorno requeridas

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## Funcionalidades implementadas

### Sistema de Login
- **Ruta**: `/login`
- **Funcionalidades**:
  - Formulario de login con email y contraseña
  - Validación de campos
  - Manejo de errores específicos de Firebase
  - Redirección automática si ya está autenticado
  - Diseño responsive y accesible

### Protección de rutas
- **Componente**: `ProtectedRoute`
- **Funcionalidad**: Protege automáticamente las rutas que requieren autenticación
- **Comportamiento**: Redirige a `/login` si el usuario no está autenticado

### Header dinámico
- **Funcionalidades**:
  - Muestra "Iniciar Sesión" si no está autenticado
  - Muestra email del usuario y botón "Salir" si está autenticado
  - Solo muestra el enlace "Administración" a usuarios autenticados

### Contexto de autenticación
- **Componente**: `AuthProvider`
- **Funcionalidad**: Maneja el estado global de autenticación
- **Características**:
  - Escucha cambios en el estado de autenticación
  - Proporciona información del usuario a toda la aplicación
  - Maneja estados de carga

## Rutas del sistema

### Rutas públicas
- `/` - Página principal
- `/login` - Página de login
- `/restaurant/[id]` - Vista de restaurante individual

### Rutas protegidas
- `/configuracion-de-restaurantes` - Panel de administración (requiere autenticación)

## Uso del sistema

### Para usuarios no autenticados
1. Pueden navegar por la página principal
2. Pueden ver restaurantes individuales
3. Al intentar acceder a administración, son redirigidos al login

### Para usuarios autenticados
1. Acceso completo al panel de administración
2. Pueden gestionar restaurantes y platos
3. Pueden cerrar sesión desde el header

## Seguridad

### Reglas de Firestore
Asegúrate de configurar las reglas de Firestore para proteger los datos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Mejores prácticas implementadas
- Validación de entrada en el frontend
- Manejo seguro de errores sin exponer información sensible
- Redirecciones automáticas para prevenir acceso no autorizado
- Limpieza automática del estado al cerrar sesión

## Troubleshooting

### Error: "Firebase configuration not found"
- Verifica que todas las variables de entorno estén configuradas correctamente
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

### Error: "Auth domain not authorized"
- Ve a Firebase Console > Authentication > Settings
- Agrega tu dominio a la lista de dominios autorizados

### Error: "User not found" al intentar login
- Verifica que el usuario existe en Firebase Console > Authentication > Users
- Asegúrate de que el email esté escrito correctamente

### La página se queda cargando infinitamente
- Verifica la conexión a internet
- Revisa la consola del navegador para errores de Firebase
- Asegúrate de que Firebase esté correctamente inicializado
