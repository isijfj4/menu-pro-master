import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Tipos de archivos permitidos para subir
 */
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Tamaño máximo de archivo en bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Valida un archivo antes de subirlo
 * @param file Archivo a validar
 * @returns Objeto con resultado de validación
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Validar tipo de archivo
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  // Validar tamaño de archivo
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
};

/**
 * Sube una imagen a Firebase Storage
 * @param file Archivo a subir
 * @param path Ruta donde se guardará la imagen (sin el nombre del archivo)
 * @returns URL de la imagen subida
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExtension}`;
    const fullPath = `${path}/${fileName}`;

    // Crear referencia al archivo en Storage
    const fileRef = storageRef(storage, fullPath);

    // Subir archivo
    const snapshot = await uploadBytes(fileRef, file);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

/**
 * Sube una imagen de portada para un restaurante
 * @param restaurantId ID del restaurante
 * @param file Archivo a subir
 * @returns URL de la imagen subida
 */
export const uploadRestaurantCoverImage = async (
  restaurantId: string, 
  file: File
): Promise<string> => {
  const path = `restaurants/${restaurantId}/cover`;
  return uploadImage(file, path);
};

/**
 * Sube una imagen para un plato
 * @param restaurantId ID del restaurante
 * @param dishId ID del plato
 * @param file Archivo a subir
 * @returns URL de la imagen subida
 */
export const uploadDishImage = async (
  restaurantId: string, 
  dishId: string, 
  file: File
): Promise<string> => {
  const path = `restaurants/${restaurantId}/dishes/${dishId}`;
  return uploadImage(file, path);
};

/**
 * Elimina una imagen de Firebase Storage
 * @param url URL de la imagen a eliminar
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extraer la ruta del archivo de la URL
    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    const filePath = decodedUrl.substring(startIndex, endIndex);

    // Crear referencia al archivo
    const fileRef = storageRef(storage, filePath);

    // Eliminar archivo
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw error;
  }
};
