'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File) => Promise<string>;
  currentImageUrl?: string;
  onImageRemove?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'video';
  maxSizeMB?: number;
}

export default function ImageUploader({
  onImageUpload,
  currentImageUrl,
  onImageRemove,
  className,
  aspectRatio = 'video',
  maxSizeMB = 5
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = aspectRatio === 'square' 
    ? 'aspect-square' 
    : 'aspect-video';

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('📁 [IMAGE_UPLOADER] No se seleccionó ningún archivo');
      return;
    }

    console.log('📁 [IMAGE_UPLOADER] Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      timestamp: new Date().toISOString()
    });

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = `Tipo de archivo no válido. Tipos permitidos: ${validTypes.join(', ')}`;
      console.error('❌ [IMAGE_UPLOADER] Validación de tipo falló:', {
        fileType: file.type,
        validTypes,
        error: errorMsg
      });
      setError(errorMsg);
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      const errorMsg = `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
      console.error('❌ [IMAGE_UPLOADER] Validación de tamaño falló:', {
        fileSize: file.size,
        maxSize,
        fileSizeMB: Math.round(file.size / (1024 * 1024) * 100) / 100,
        maxSizeMB,
        error: errorMsg
      });
      setError(errorMsg);
      return;
    }

    console.log('✅ [IMAGE_UPLOADER] Archivo validado correctamente');

    // Clear previous errors
    setError(null);

    // Create preview
    console.log('🖼️ [IMAGE_UPLOADER] Creando preview del archivo...');
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    console.log('✅ [IMAGE_UPLOADER] Preview creado:', objectUrl);

    // Upload file
    try {
      setIsUploading(true);
      console.log('⬆️ [IMAGE_UPLOADER] Iniciando subida de archivo...');
      
      const startTime = Date.now();
      const imageUrl = await onImageUpload(file);
      const uploadTime = Date.now() - startTime;
      
      console.log('🎉 [IMAGE_UPLOADER] Subida completada exitosamente:', {
        imageUrl,
        uploadTimeMs: uploadTime,
        originalPreview: objectUrl
      });
      
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error('💥 [IMAGE_UPLOADER] Error durante la subida:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorStack: error instanceof Error ? error.stack : undefined,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      
      setError('Error al subir la imagen. Inténtalo de nuevo.');
      setPreviewUrl(null);
      
      // Limpiar el objeto URL para evitar memory leaks
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  return (
    <div className={cn('w-full', className)}>
      <div 
        className={cn(
          'relative rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/20',
          aspectRatioClass,
          'flex flex-col items-center justify-center overflow-hidden',
          'hover:border-primary/50 transition-colors cursor-pointer',
          { 'opacity-70': isUploading }
        )}
        onClick={!previewUrl ? triggerFileInput : undefined}
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
                aria-label="Cambiar imagen"
              >
                <Upload className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90"
                aria-label="Eliminar imagen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isUploading ? 'Subiendo...' : 'Haz clic para subir una imagen'}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG o WEBP (máx. {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
