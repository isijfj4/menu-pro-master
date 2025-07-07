# Guía de Diagnóstico de Problemas con Imágenes

Este documento explica cómo usar los logs implementados para diagnosticar problemas con la subida y visualización de imágenes en producción.

## 🔍 Logs Implementados

### 1. Firebase Service (`src/lib/firebase.ts`)
- **Prefijo**: `[FIREBASE]`
- **Qué registra**: Inicialización de Firebase, configuración de Storage, errores de conexión
- **Buscar por**: Problemas de configuración de variables de entorno

### 2. Subida de Imágenes (`src/lib/storage/uploadImage.ts`)
- **Prefijo**: `[UPLOAD]`
- **Qué registra**: Todo el proceso de subida, validación, errores de Firebase Storage
- **Buscar por**: Errores de subida, problemas de permisos, fallos de conectividad

### 3. Componente ImageUploader (`src/components/ImageUploader.tsx`)
- **Prefijo**: `[IMAGE_UPLOADER]`
- **Qué registra**: Selección de archivos, validación, preview, errores de UI
- **Buscar por**: Problemas de validación de archivos, errores de interfaz

### 4. Formulario de Restaurante (`src/components/AdminRestaurantForm.tsx`)
- **Prefijo**: `[RESTAURANT_FORM]`
- **Qué registra**: Flujo completo de guardado, procesamiento de imágenes temporales
- **Buscar por**: Errores en el flujo de guardado, problemas con blobs

### 5. Visualización de Imágenes (`src/components/RestaurantCard.tsx`)
- **Prefijo**: `[RESTAURANT_CARD]`
- **Qué registra**: Renderizado de tarjetas, carga de imágenes, errores de visualización
- **Buscar por**: Problemas de carga de imágenes, URLs inválidas

### 6. Diagnósticos Automáticos (`src/lib/diagnostics.ts`)
- **Prefijo**: `[DIAGNOSTICS]`
- **Qué registra**: Información del entorno, conectividad, validación de URLs
- **Buscar por**: Problemas de conectividad, configuración del entorno

## 🚨 Problemas Comunes y Cómo Diagnosticarlos

### Problema: Las imágenes no se suben
**Logs a revisar:**
1. `[FIREBASE]` - Verificar que Firebase Storage esté inicializado
2. `[UPLOAD]` - Buscar errores específicos de subida
3. `[IMAGE_UPLOADER]` - Verificar validación de archivos

**Posibles causas:**
- Variables de entorno mal configuradas
- Problemas de permisos en Firebase Storage
- Archivos que no cumplen validaciones (tamaño, tipo)
- Problemas de conectividad

### Problema: Las imágenes no se visualizan
**Logs a revisar:**
1. `[RESTAURANT_CARD]` - Verificar URLs de imágenes
2. `[DIAGNOSTICS]` - Validar conectividad a Firebase Storage

**Posibles causas:**
- URLs de imágenes inválidas o corruptas
- Problemas de permisos de lectura en Storage
- Reglas de seguridad muy restrictivas
- Problemas de CORS

### Problema: Errores intermitentes
**Logs a revisar:**
1. `[DIAGNOSTICS]` - Información del entorno y conectividad
2. Todos los logs con timestamps para identificar patrones

**Posibles causas:**
- Problemas de red intermitentes
- Límites de cuota de Firebase
- Problemas de rendimiento del servidor

## 📊 Cómo Leer los Logs

### Estructura de los Logs
```
🔄 [PREFIJO] Descripción: {
  dato1: valor1,
  dato2: valor2,
  timestamp: "2025-01-07T22:30:00.000Z"
}
```

### Iconos y su Significado
- 🔄 - Proceso iniciado
- ✅ - Operación exitosa
- ❌ - Error ocurrido
- 🔍 - Validación o verificación
- ⬆️ - Subida de archivo
- 🖼️ - Procesamiento de imagen
- 📁 - Operación de archivo
- 🌐 - Información de red/entorno
- 💥 - Error crítico
- 🎉 - Proceso completado exitosamente

## 🛠️ Pasos para Diagnosticar

### 1. Reproducir el Problema
- Abrir las herramientas de desarrollador (F12)
- Ir a la pestaña "Console"
- Intentar subir o visualizar una imagen

### 2. Filtrar Logs Relevantes
- Usar el filtro de la consola para buscar por prefijos específicos
- Ejemplo: filtrar por `[UPLOAD]` para problemas de subida

### 3. Analizar la Secuencia
- Los logs incluyen timestamps para seguir la secuencia de eventos
- Buscar dónde se interrumpe el flujo normal

### 4. Identificar Errores
- Buscar logs con ❌ o 💥
- Revisar los detalles del error en el objeto de datos

### 5. Verificar Configuración
- Revisar logs de `[FIREBASE]` para confirmar configuración
- Usar `[DIAGNOSTICS]` para verificar conectividad

## 🔧 Configuración de Producción

### Variables de Entorno Requeridas
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Reglas de Firebase Storage
- Archivo: `storage.rules`
- Permite lectura pública de imágenes
- Requiere autenticación de admin para escritura

### Reglas de Firestore
- Archivo: `firestore.rules`
- Permite lectura pública de restaurantes
- Requiere autenticación de admin para escritura

## 📝 Reporte de Problemas

Cuando reportes un problema, incluye:

1. **Logs completos** de la consola del navegador
2. **Pasos para reproducir** el problema
3. **Entorno** (desarrollo/producción)
4. **Navegador y versión**
5. **Información de red** (si es relevante)

### Ejemplo de Reporte
```
Problema: Las imágenes no se suben en producción

Logs:
[FIREBASE] ✅ Firebase Service inicializado correctamente
[IMAGE_UPLOADER] 📁 Archivo seleccionado: { name: "test.jpg", size: 1024000 }
[UPLOAD] ❌ Error al subir imagen: { error: "Permission denied" }

Pasos:
1. Ir a configuración de restaurantes
2. Crear nuevo restaurante
3. Subir imagen de portada
4. Error al guardar

Entorno: Producción
Navegador: Chrome 120.0.0.0
```

## 🎯 Diagnósticos Automáticos

En modo desarrollo, los diagnósticos se ejecutan automáticamente y muestran:
- Información del entorno
- Estado de conectividad a Firebase
- Configuración de variables de entorno

Para ejecutar diagnósticos manualmente:
```javascript
import { runImageSystemDiagnostics } from '@/lib/diagnostics';
runImageSystemDiagnostics();
