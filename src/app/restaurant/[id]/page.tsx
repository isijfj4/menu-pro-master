'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Restaurant, Dish } from '@/lib/types';
import { getRestaurant } from '@/lib/db/restaurants';
import { getAllDishes } from '@/lib/db/dishes';
import CategoryTabs from '@/components/CategoryTabs';
import DishesModal from '@/components/DishesModal';
import { RestaurantCardSkeleton } from '@/components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function RestaurantPage() {
  const { id } = useParams() as { id: string };
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);

  // Function to fetch dishes data
  const fetchDishes = useCallback(async () => {
    if (!id) return;
    
    try {
      const dishesData = await getAllDishes(id);
      console.log('Fetched dishes:', dishesData);
      setDishes(dishesData);
    } catch (error) {
      console.error('Error fetching dishes data:', error);
      toast.error('Error al cargar los platos');
    }
  }, [id]);

  // Fetch restaurant and dishes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch restaurant data
        const restaurantData = await getRestaurant(id);
        if (!restaurantData) {
          toast.error('Restaurante no encontrado');
          return;
        }
        
        console.log('Fetched restaurant:', restaurantData);
        console.log('Restaurant categories:', restaurantData.categories);
        
        setRestaurant(restaurantData);
        
        // Fetch dishes data
        await fetchDishes();
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Error al cargar los datos del restaurante');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, fetchDishes]);

  // Handle dish click
  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  // Generate stars based on rating
   const renderStars = (rating: number | any) => {
    const numericRating = typeof rating === 'number' ? rating : 0;
    return Array(5).fill(0).map((_, i) => {
      const fillPercent = Math.max(Math.min(numericRating - i, 1), 0) * 100;
      return (
        <span key={i} className="relative inline-block">
          <Star className="h-5 w-5 text-muted-foreground" />
          {fillPercent > 0 && (
            <Star
              className="h-5 w-5 text-yellow-500 fill-yellow-500 absolute left-0 top-0"
              style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
            />
          )}
        </span>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <RestaurantCardSkeleton />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Restaurante no encontrado.</p>
        <Link 
          href="/"
          className="mt-4 inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista de restaurantes
        </Link>
      </div>
    );
  }

  // Function to open dishes modal
  const handleOpenDishesModal = () => {
    if (restaurant) {
      setIsDishesModalOpen(true);
    }
  };

  // Function to close dishes modal
  const handleCloseDishesModal = () => {
    setIsDishesModalOpen(false);
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista de restaurantes
        </Link>
      </div>
      
      {/* Restaurant hero section */}
      <div className="rounded-2xl overflow-hidden bg-card border shadow-lg mb-8">
        <div className="relative h-64 w-full">
          {restaurant.coverImg ? (
            <Image
              src={restaurant.coverImg}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <p className="text-muted-foreground mt-1">
                {restaurant.location.city}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              {renderStars(restaurant.rating)}
              <span className="ml-2 text-muted-foreground">
                ({typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : '0.0'})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dish categories and items */}
      {restaurant.categories && restaurant.categories.length > 0 ? (
        <>
          <CategoryTabs
            categories={restaurant.categories}
            dishes={dishes}
            restaurantId={id}
            isLoading={isLoading}
            onDishClick={handleDishClick}
            onDishesUpdated={fetchDishes}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Este restaurante aún no tiene categorías de platos.</p>
        </div>
      )}
      
      {/* Dish detail modal */}
      {selectedDish && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="relative h-64 w-full">
              {selectedDish.photos && selectedDish.photos.length > 0 ? (
                <Image
                  src={selectedDish.photos[0]}
                  alt={selectedDish.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Sin imagen</span>
                </div>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                aria-label="Cerrar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{selectedDish.name}</h3>
              
              <p className="text-lg font-semibold text-primary mb-4">
                {new Intl.NumberFormat('es-PE', {
                  style: 'currency',
                  currency: 'PEN',
                  minimumFractionDigits: 2
                }).format(selectedDish.price / 100)}
              </p>
              
              <p className="text-muted-foreground mb-4">
                {selectedDish.description}
              </p>
              
              {selectedDish.allergens && selectedDish.allergens.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Alérgenos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDish.allergens.map(allergen => (
                      <span 
                        key={allergen}
                        className="bg-muted px-2 py-1 rounded-full text-xs"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Dishes management modal */}
      {isDishesModalOpen && restaurant && (
        <DishesModal
          restaurant={restaurant}
          isOpen={isDishesModalOpen}
          onClose={handleCloseDishesModal}
          onDishesUpdated={fetchDishes}
        />
      )}
    </div>
  );
}
