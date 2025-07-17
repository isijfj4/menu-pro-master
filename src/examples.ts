import { Timestamp } from 'firebase/firestore';
import { 
  createRestaurant, 
  getRestaurant, 
  getAllRestaurants, 
  getRestaurantsByType, 
  updateRestaurant, 
  deleteRestaurant,
  createRestaurantWithDishes
} from './lib/db/restaurants';
import { 
  createDish, 
  getDish, 
  getAllDishes, 
  getDishesByCategory, 
  getFeaturedDishes, 
  updateDish, 
  deleteDish 
} from './lib/db/dishes';
import { 
  uploadRestaurantCoverImage, 
  uploadDishImage, 
  deleteImage 
} from './lib/storage/uploadImage';
import { 
  Restaurant, 
  Dish, 
  CreateRestaurantData, 
  CreateDishData, 
  RestaurantType, 
  DishCategory 
} from './lib/types';

/**
 * EJEMPLOS DE USO DEL MODELO DE DATOS
 * 
 * Este archivo contiene ejemplos de cómo utilizar las funciones
 * implementadas para interactuar con Firestore y Storage.
 */

// ======================================================
// EJEMPLO 1: Crear un nuevo restaurante
// ======================================================
export const ejemploCrearRestaurante = async (): Promise<string> => {
  const nuevoRestaurante: CreateRestaurantData = {
    name: 'El Pollo Sabroso',
    description: 'La mejor pollería de la ciudad, con el sabor tradicional que nos caracteriza.',
    type: 'pollería',
    categories: ['Entradas', 'Platos a la carta', 'Combos', 'Bebidas'],
    coverImg: 'https://firebasestorage.googleapis.com/v0/b/menu-pro-dev.appspot.com/o/covers%2Fpollo_sabroso.jpg?alt=media',
    images: [
      'https://firebasestorage.googleapis.com/v0/b/menu-pro-dev.appspot.com/o/gallery%2Fpollo_1.jpg?alt=media',
      'https://firebasestorage.googleapis.com/v0/b/menu-pro-dev.appspot.com/o/gallery%2Fpollo_2.jpg?alt=media',
    ],
    location: {
      lat: -12.046374,
      lng: -77.042793,
      city: 'Lima',
    },
    rating: 4.5,
  };

  // Crear el restaurante en Firestore
  const restaurantId = await createRestaurant(nuevoRestaurante);
  console.log(`Restaurante creado con ID: ${restaurantId}`);

  return restaurantId;
};

// ======================================================
// EJEMPLO 2: Subir imagen de portada para un restaurante
// ======================================================
export const ejemploSubirImagenPortada = async (
  restaurantId: string, 
  file: File
): Promise<void> => {
  // Subir la imagen a Firebase Storage
  const imageUrl = await uploadRestaurantCoverImage(restaurantId, file);
  console.log(`Imagen subida con URL: ${imageUrl}`);

  // Actualizar el documento del restaurante con la URL de la imagen
  await updateRestaurant(restaurantId, { coverImg: imageUrl });
  console.log('Restaurante actualizado con la URL de la imagen');
};

// ======================================================
// EJEMPLO 3: Crear un plato para un restaurante
// ======================================================
export const ejemploCrearPlato = async (
  restaurantId: string
): Promise<string> => {
  const nuevoPlato: CreateDishData = {
    name: 'Pollo a la Brasa 1/4',
    category: 'Platos a la carta',
    price: 2500, // 25.00 PEN en céntimos
    description: 'Delicioso cuarto de pollo a la brasa acompañado de papas fritas y ensalada',
    photos: [], // Se actualizará después de subir las imágenes
    allergens: ['gluten'],
    isFeatured: true
  };

  // Crear el plato en Firestore
  const dishId = await createDish(restaurantId, nuevoPlato);
  console.log(`Plato creado con ID: ${dishId}`);

  return dishId;
};

// ======================================================
// EJEMPLO 4: Subir imagen para un plato
// ======================================================
export const ejemploSubirImagenPlato = async (
  restaurantId: string,
  dishId: string,
  file: File
): Promise<void> => {
  // Subir la imagen a Firebase Storage
  const imageUrl = await uploadDishImage(restaurantId, dishId, file);
  console.log(`Imagen subida con URL: ${imageUrl}`);

  // Obtener el plato actual
  const plato = await getDish(restaurantId, dishId);
  
  if (plato) {
    // Añadir la URL a la lista de fotos (máximo 5)
    const photos = [...plato.photos || []];
    if (photos.length < 5) {
      photos.push(imageUrl);
      
      // Actualizar el documento del plato con la nueva lista de fotos
      await updateDish(restaurantId, dishId, { photos });
      console.log('Plato actualizado con la nueva imagen');
    } else {
      console.warn('El plato ya tiene 5 imágenes, no se puede añadir más');
    }
  }
};

// ======================================================
// EJEMPLO 5: Consultar restaurantes por tipo
// ======================================================
export const ejemploConsultarRestaurantesPorTipo = async (
  tipo: RestaurantType,
  limite?: number
): Promise<Restaurant[]> => {
  const restaurantes = await getRestaurantsByType(tipo, limite);
  console.log(`Se encontraron ${restaurantes.length} restaurantes de tipo ${tipo}`);
  
  // Mostrar los restaurantes encontrados
  restaurantes.forEach(restaurante => {
    console.log(`- ${restaurante.name} (Rating: ${restaurante.rating})`);
  });
  
  return restaurantes;
};

// ======================================================
// EJEMPLO 6: Consultar platos por categoría
// ======================================================
export const ejemploConsultarPlatosPorCategoria = async (
  restaurantId: string,
  categoria: DishCategory,
  limite?: number
): Promise<Dish[]> => {
  const platos = await getDishesByCategory(restaurantId, categoria, limite);
  console.log(`Se encontraron ${platos.length} platos en la categoría ${categoria}`);
  
  // Mostrar los platos encontrados
  platos.forEach(plato => {
    console.log(`- ${plato.name} (Precio: ${plato.price / 100} PEN)`);
  });
  
  return platos;
};

// ======================================================
// EJEMPLO 7: Crear restaurante con platos en una operación
// ======================================================
export const ejemploCrearRestauranteConPlatos = async (): Promise<string> => {
  // Datos del restaurante
  const restauranteData: CreateRestaurantData = {
    name: 'Café Delicioso',
    description: 'Un acogedor café para disfrutar de buenos momentos.',
    type: 'café',
    categories: ['Desayunos', 'Postres', 'Bebidas'],
    coverImg: 'https://ejemplo.com/imagen-temporal.jpg', // URL temporal
    images: ['https://ejemplo.com/gallery1.jpg', 'https://ejemplo.com/gallery2.jpg'],
    location: {
      lat: -12.111111,
      lng: -77.222222,
      city: 'Lima'
    },
    rating: 4.2
  };
  
  // Datos de platos iniciales
  const platosIniciales = [
    {
      name: 'Café Americano',
      category: 'Bebidas' as DishCategory,
      price: 800, // 8.00 PEN
      description: 'Café negro recién hecho',
      photos: [],
      isFeatured: true
    },
    {
      name: 'Sandwich de Pollo',
      category: 'Desayunos' as DishCategory,
      price: 1500, // 15.00 PEN
      description: 'Sandwich con pollo deshilachado, lechuga y tomate',
      photos: [],
      allergens: ['gluten']
    },
    {
      name: 'Cheesecake',
      category: 'Postres' as DishCategory,
      price: 1200, // 12.00 PEN
      description: 'Delicioso cheesecake con salsa de frutos rojos',
      photos: [],
      allergens: ['lácteos']
    }
  ];
  
  // Crear restaurante con platos en una sola operación
  const restaurantId = await createRestaurantWithDishes(restauranteData, platosIniciales);
  console.log(`Restaurante con platos creado con ID: ${restaurantId}`);
  
  return restaurantId;
};

// ======================================================
// EJEMPLO 8: Flujo completo de creación y consulta
// ======================================================
export const ejemploFlujoCompleto = async (): Promise<void> => {
  try {
    console.log('Iniciando flujo completo de ejemplo...');
    
    // 1. Crear un restaurante con platos
    console.log('\n1. Creando restaurante con platos...');
    const restaurantId = await ejemploCrearRestauranteConPlatos();
    
    // 2. Consultar el restaurante creado
    console.log('\n2. Consultando restaurante creado...');
    const restaurante = await getRestaurant(restaurantId);
    console.log('Restaurante:', restaurante);
    
    // 3. Consultar los platos del restaurante
    console.log('\n3. Consultando platos del restaurante...');
    const platos = await getAllDishes(restaurantId);
    console.log(`El restaurante tiene ${platos.length} platos:`);
    platos.forEach(plato => {
      console.log(`- ${plato.name} (${plato.category}): ${plato.price / 100} PEN`);
    });
    
    // 4. Consultar platos destacados
    console.log('\n4. Consultando platos destacados...');
    const platosDestacados = await getFeaturedDishes(restaurantId);
    console.log(`Platos destacados: ${platosDestacados.length}`);
    
    // 5. Consultar restaurantes por tipo
    console.log('\n5. Consultando restaurantes por tipo...');
    const cafeTerias = await getRestaurantsByType('café');
    console.log(`Cafeterías encontradas: ${cafeTerias.length}`);
    
    console.log('\nFlujo completo finalizado con éxito.');
  } catch (error) {
    console.error('Error en el flujo completo:', error);
  }
};

// Exportar todas las funciones de ejemplo
export default {
  ejemploCrearRestaurante,
  ejemploSubirImagenPortada,
  ejemploCrearPlato,
  ejemploSubirImagenPlato,
  ejemploConsultarRestaurantesPorTipo,
  ejemploConsultarPlatosPorCategoria,
  ejemploCrearRestauranteConPlatos,
  ejemploFlujoCompleto
};
