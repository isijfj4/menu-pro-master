import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery,
  writeBatch
} from 'firebase/firestore';
import { db, Timestamp } from '../firebase';
import { 
  Restaurant, 
  CreateRestaurantData, 
  UpdateRestaurantData,
  RestaurantType
} from '../types';

// Constantes
const RESTAURANTS_COLLECTION = 'restaurants';

/**
 * Obtiene un restaurante por su ID
 * @param id ID del restaurante
 * @returns Datos del restaurante o null si no existe
 */
export const getRestaurant = async (id: string): Promise<Restaurant | null> => {
  try {
    const restaurantRef = doc(db, RESTAURANTS_COLLECTION, id);
    const restaurantSnap = await getDoc(restaurantRef);
    
    if (!restaurantSnap.exists()) {
      return null;
    }
    
    return { id: restaurantSnap.id, ...restaurantSnap.data() } as Restaurant;
  } catch (error) {
    console.error('Error al obtener el restaurante:', error);
    throw error;
  }
};

/**
 * Obtiene todos los restaurantes
 * @param limit Límite opcional de resultados
 * @returns Lista de restaurantes
 */
export const getAllRestaurants = async (limit?: number): Promise<Restaurant[]> => {
  try {
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    let q = query(restaurantsRef, orderBy('name', 'asc'));
    
    if (limit) {
      q = query(q, limitQuery(limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Restaurant[];
  } catch (error) {
    console.error('Error al obtener los restaurantes:', error);
    throw error;
  }
};

/**
 * Obtiene restaurantes filtrados por tipo
 * @param type Tipo de restaurante
 * @param limit Límite opcional de resultados
 * @returns Lista de restaurantes del tipo especificado
 */
export const getRestaurantsByType = async (
  type: RestaurantType, 
  limit?: number
): Promise<Restaurant[]> => {
  try {
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    let q = query(
      restaurantsRef,
      where('type', '==', type),
      orderBy('name', 'asc')
    );
    
    if (limit) {
      q = query(q, limitQuery(limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Restaurant[];
  } catch (error) {
    console.error(`Error al obtener restaurantes de tipo ${type}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo restaurante
 * @param data Datos del restaurante a crear
 * @returns ID del restaurante creado
 */
export const createRestaurant = async (data: CreateRestaurantData): Promise<string> => {
  try {
    const now = Timestamp.now();
    const restaurantData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    const docRef = await addDoc(restaurantsRef, restaurantData);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear el restaurante:', error);
    throw error;
  }
};

/**
 * Actualiza un restaurante existente
 * @param id ID del restaurante
 * @param data Datos a actualizar
 */
export const updateRestaurant = async (
  id: string,
  data: UpdateRestaurantData
): Promise<void> => {
  try {
    const restaurantRef = doc(db, RESTAURANTS_COLLECTION, id);

    // Remove undefined values to avoid Firestore errors
    const filteredData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        // @ts-ignore - dynamic keys
        filteredData[key] = value;
      }
    }

    const updateData = {
      ...filteredData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(restaurantRef, updateData);
  } catch (error) {
    console.error('Error al actualizar el restaurante:', error);
    throw error;
  }
};

/**
 * Elimina un restaurante
 * @param id ID del restaurante a eliminar
 */
export const deleteRestaurant = async (id: string): Promise<void> => {
  try {
    const restaurantRef = doc(db, RESTAURANTS_COLLECTION, id);
    await deleteDoc(restaurantRef);
  } catch (error) {
    console.error('Error al eliminar el restaurante:', error);
    throw error;
  }
};

/**
 * Crea un restaurante con sus platos iniciales en una sola operación atómica
 * @param restaurantData Datos del restaurante
 * @param initialDishes Platos iniciales (opcional)
 * @returns ID del restaurante creado
 */
export const createRestaurantWithDishes = async (
  restaurantData: CreateRestaurantData,
  initialDishes: any[] = []
): Promise<string> => {
  try {
    // Crear una referencia para el nuevo documento (sin crearlo aún)
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    const newRestaurantRef = doc(restaurantsRef);
    const restaurantId = newRestaurantRef.id;
    
    // Iniciar batch write
    const batch = writeBatch(db);
    
    // Preparar datos del restaurante con timestamps
    const now = Timestamp.now();
    const restaurant = {
      ...restaurantData,
      createdAt: now,
      updatedAt: now
    };
    
    // Añadir restaurante al batch
    batch.set(newRestaurantRef, restaurant);
    
    // Si hay platos iniciales, añadirlos al batch
    if (initialDishes.length > 0) {
      initialDishes.forEach(dish => {
        const dishRef = doc(collection(db, RESTAURANTS_COLLECTION, restaurantId, 'dishes'));
        batch.set(dishRef, dish);
      });
    }
    
    // Ejecutar todas las operaciones de forma atómica
    await batch.commit();
    
    return restaurantId;
  } catch (error) {
    console.error('Error al crear restaurante con platos:', error);
    throw error;
  }
};
