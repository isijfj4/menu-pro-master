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
  collectionGroup
} from 'firebase/firestore';
import { db } from '../firebase';
import { Dish, CreateDishData, UpdateDishData, DishCategory } from '../types';

// Constantes
const RESTAURANTS_COLLECTION = 'restaurants';
const DISHES_COLLECTION = 'dishes';

/**
 * Obtiene un plato específico de un restaurante
 * @param restaurantId ID del restaurante
 * @param dishId ID del plato
 * @returns Datos del plato o null si no existe
 */
export const getDish = async (
  restaurantId: string, 
  dishId: string
): Promise<Dish | null> => {
  try {
    const dishRef = doc(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION, dishId);
    const dishSnap = await getDoc(dishRef);
    
    if (!dishSnap.exists()) {
      return null;
    }
    
    return { id: dishSnap.id, ...dishSnap.data() } as Dish;
  } catch (error) {
    console.error('Error al obtener el plato:', error);
    throw error;
  }
};

/**
 * Obtiene todos los platos de un restaurante
 * @param restaurantId ID del restaurante
 * @param limit Límite opcional de resultados
 * @returns Lista de platos
 */
export const getAllDishes = async (
  restaurantId: string, 
  limit?: number
): Promise<Dish[]> => {
  try {
    const dishesRef = collection(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION);
    let q = query(dishesRef, orderBy('name', 'asc'));
    
    if (limit) {
      q = query(q, limitQuery(limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Dish[];
  } catch (error) {
    console.error('Error al obtener los platos:', error);
    throw error;
  }
};

/**
 * Obtiene platos filtrados por categoría
 * @param restaurantId ID del restaurante
 * @param category Categoría de platos
 * @param limit Límite opcional de resultados
 * @returns Lista de platos de la categoría especificada
 */
export const getDishesByCategory = async (
  restaurantId: string,
  category: DishCategory,
  limit?: number
): Promise<Dish[]> => {
  try {
    const dishesRef = collection(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION);
    let q = query(
      dishesRef,
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    
    if (limit) {
      q = query(q, limitQuery(limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Dish[];
  } catch (error) {
    console.error(`Error al obtener platos de categoría ${category}:`, error);
    throw error;
  }
};

/**
 * Obtiene platos destacados de un restaurante
 * @param restaurantId ID del restaurante
 * @param limit Límite opcional de resultados
 * @returns Lista de platos destacados
 */
export const getFeaturedDishes = async (
  restaurantId: string,
  limit?: number
): Promise<Dish[]> => {
  try {
    const dishesRef = collection(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION);
    let q = query(
      dishesRef,
      where('isFeatured', '==', true),
      orderBy('name', 'asc')
    );
    
    if (limit) {
      q = query(q, limitQuery(limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Dish[];
  } catch (error) {
    console.error('Error al obtener platos destacados:', error);
    throw error;
  }
};

/**
 * Busca platos en todos los restaurantes (usando collectionGroup)
 * @param category Categoría opcional para filtrar
 * @param limit Límite opcional de resultados
 * @returns Lista de platos que coinciden con los criterios
 */
export const searchDishesByCategory = async (
  category: DishCategory,
  limit?: number
): Promise<Dish[]> => {
  try {
    // Usar collectionGroup para buscar en todas las subcolecciones 'dishes'
    const dishesRef = collectionGroup(db, DISHES_COLLECTION);
    let q = query(
      dishesRef,
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    
    if (limit) {
      q = query(q, limitQuery(limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      // Extraer el ID del restaurante del path del documento
      const pathSegments = doc.ref.path.split('/');
      const restaurantId = pathSegments[1]; // El ID del restaurante está en la posición 1
      
      return { 
        id: doc.id,
        restaurantId, // Incluir el ID del restaurante para referencia
        ...doc.data() 
      } as Dish & { restaurantId: string };
    });
  } catch (error) {
    console.error(`Error al buscar platos por categoría ${category}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo plato para un restaurante
 * @param restaurantId ID del restaurante
 * @param data Datos del plato a crear
 * @returns ID del plato creado
 */
export const createDish = async (
  restaurantId: string,
  data: CreateDishData
): Promise<string> => {
  try {
    const dishesRef = collection(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION);
    const docRef = await addDoc(dishesRef, data);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear el plato:', error);
    throw error;
  }
};

/**
 * Actualiza un plato existente
 * @param restaurantId ID del restaurante
 * @param dishId ID del plato
 * @param data Datos a actualizar
 */
export const updateDish = async (
  restaurantId: string,
  dishId: string,
  data: UpdateDishData
): Promise<void> => {
  try {
    const dishRef = doc(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION, dishId);
    await updateDoc(dishRef, data);
  } catch (error) {
    console.error('Error al actualizar el plato:', error);
    throw error;
  }
};

/**
 * Elimina un plato
 * @param restaurantId ID del restaurante
 * @param dishId ID del plato a eliminar
 */
export const deleteDish = async (
  restaurantId: string,
  dishId: string
): Promise<void> => {
  try {
    const dishRef = doc(db, RESTAURANTS_COLLECTION, restaurantId, DISHES_COLLECTION, dishId);
    await deleteDoc(dishRef);
  } catch (error) {
    console.error('Error al eliminar el plato:', error);
    throw error;
  }
};
