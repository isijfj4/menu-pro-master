import { Timestamp } from 'firebase/firestore';

/**
 * Interfaces para el modelo de datos de restaurantes y platos
 */

// Tipos de restaurantes disponibles
export type RestaurantType = 'pollería' | 'café' | 'chifa' | 'cevichería'|'otro' | 'Nikkei' | 'Criollo'| 'pizzería';

// Categorías de platos
export type DishCategory = 'Entradas' | 'Platos a la carta' | 'Postres' | 'Bebidas' | 'Combos' | 'Especialidades';

// Interfaz para la ubicación del restaurante
export interface Location {
  lat: number;
  lng: number;
  city: string;
}

// Interfaz principal para restaurantes
export interface Restaurant {
  id?: string;           // ID opcional (se asigna automáticamente en creación)
  name: string;          // Nombre del restaurante
  description: string;   // Descripción del restaurante
  type: RestaurantType;  // Tipo de restaurante
  categories: string[];  // Categorías de platos que ofrece
  coverImg: string;      // URL de imagen de portada para la tarjeta
  images: string[];      // URLs de imágenes para la galería (máximo 15)
  location: Location;    // Ubicación geográfica
  rating: number;        // Calificación (1-5)
  createdAt: Timestamp;  // Fecha de creación
  updatedAt: Timestamp;  // Fecha de última actualización
}

// Interfaz para platos
export interface Dish {
  id?: string;                // ID opcional (se asigna automáticamente en creación)
  name: string;               // Nombre del plato
  category: DishCategory;     // Categoría a la que pertenece
  price: number;              // Precio en céntimos PEN
  description: string;        // Descripción del plato
  photos: string[];           // URLs de imágenes en Firebase Storage (máximo 5)
  allergens?: string[];       // Alérgenos (opcional)
  isFeatured?: boolean;       // Destacado en el menú (opcional)
}

// Interfaz para crear un nuevo restaurante (sin timestamps)
export interface CreateRestaurantData extends Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'> {}

// Interfaz para actualizar un restaurante (todos los campos opcionales excepto updatedAt)
export interface UpdateRestaurantData extends Partial<Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>> {}

// Interfaz para crear un nuevo plato
export interface CreateDishData extends Omit<Dish, 'id'> {}

// Interfaz para actualizar un plato (todos los campos opcionales)
export interface UpdateDishData extends Partial<Omit<Dish, 'id'>> {}
