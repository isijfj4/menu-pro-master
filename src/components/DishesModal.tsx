'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Star, Camera, Plus, Edit, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
import { Restaurant, Dish } from '@/lib/types';
import { getAllDishes, deleteDish } from '@/lib/db/dishes';
import { Button } from '@/components/ui/button';
import AdminDishForm from '@/components/AdminDishForm';
import toast from 'react-hot-toast';

interface DishesModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onDishesUpdated?: () => Promise<void>;
}

export default function DishesModal({ restaurant, isOpen, onClose, onDishesUpdated }: DishesModalProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && restaurant.id) {
      console.log('DishesModal - Restaurant categories:', restaurant.categories);
      fetchDishes();
    }
  }, [isOpen, restaurant.id]);

  const fetchDishes = async () => {
    if (!restaurant.id) return;
    
    try {
      setIsLoading(true);
      const data = await getAllDishes(restaurant.id);
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Error al cargar los platos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dish actions
  const handleAddDish = () => {
    setSelectedDish(null);
    setIsDishFormOpen(true);
  };

  const handleEditDish = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishFormOpen(true);
  };

  const handleDeleteDish = async (dish: Dish) => {
    if (!restaurant.id) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este plato?')) {
      try {
        await deleteDish(restaurant.id, dish.id!);
        toast.success('Plato eliminado con éxito');
        await fetchDishes();
        
        // Notify parent component that dishes have been updated
        if (onDishesUpdated) {
          await onDishesUpdated();
        }
      } catch (error) {
        console.error('Error deleting dish:', error);
        toast.error('Error al eliminar el plato');
      }
    }
  };

  const handleDishFormSuccess = async () => {
    setIsSubmitting(false);
    setIsDishFormOpen(false);
    setSelectedDish(null);
    await fetchDishes();
    
    // Notify parent component that dishes have been updated
    if (onDishesUpdated) {
      await onDishesUpdated();
    }
  };

  const handleDishFormCancel = () => {
    setIsDishFormOpen(false);
    setSelectedDish(null);
  };
  
  const handleFormSubmit = () => {
    setIsSubmitting(true);
    if (formContainerRef.current) {
      // Trigger form submission
      const form = formContainerRef.current.querySelector('form');
      if (form) {
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }
    }
  };

  const filteredDishes = selectedCategory === 'all' 
    ? dishes 
    : dishes.filter(dish => dish.category.toLowerCase() === selectedCategory.toLowerCase());

  // Use restaurant categories instead of deriving from dishes
  // This ensures all categories are shown even if there are no dishes in some categories
  const categories = ['all', ...restaurant.categories];
  
  console.log('Restaurant categories in modal:', restaurant.categories);
  console.log('Categories used in filter:', categories);
  console.log('Selected category:', selectedCategory);
  console.log('Filtered dishes:', filteredDishes);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black text-white border-neutral-600 border-1 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] 
      flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-600 flex items-center justify-between">
          <div className="flex items-center">
            {isDishFormOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDishFormCancel}
                className="mr-2 h-8 w-8 p-0"
                aria-label="Volver"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {isDishFormOpen 
                  ? (selectedDish ? 'Editar Plato' : 'Nuevo Plato') 
                  : `Platos de ${restaurant.name}`}
              </h2>
              {!isDishFormOpen && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                    {restaurant.type}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : '0.0'}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{restaurant.location.city}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDishFormOpen && (
              <Button
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-600"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Guardando...' : selectedDish ? 'Actualizar' : 'Crear'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isDishFormOpen && (
          <>
            {/* Category Filter and Add Button */}
            <div className="p-4 border-b border-neutral-600 justify-center items-center">
              <div className="flex items-center justify-between ">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory.toLowerCase() === category.toLowerCase()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'Todos' : category}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleAddDish}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Añadir Plato
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredDishes.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCategory === 'all' ? 'No hay platos disponibles' : `No hay platos en la categoría "${selectedCategory}"`}
                  </h3>
                  <p className="text-gray-600">
                    {selectedCategory === 'all' 
                      ? 'Este restaurante aún no ha agregado platos a su menú.'
                      : 'Prueba seleccionando otra categoría.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDishes.map((dish) => (
                    <div key={dish.id} className="border border-neutral-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Dish Image */}
                      {dish.photos && dish.photos.length > 0 ? (
                        <div className="h-48 bg-gray-100 relative">
                          <Image
                            src={dish.photos[0]}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            layout="fill"
                            unoptimized
                          />
                          {dish.isFeatured && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Destacado
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                          <Camera className="h-12 w-12 text-gray-400" />
                          {dish.isFeatured && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Destacado
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Dish Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white text-lg">
                            {dish.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-lg  font-bold text-green-600">
                              {new Intl.NumberFormat('es-PE', {
                                style: 'currency',
                                currency: 'PEN',
                                minimumFractionDigits: 2
                              }).format(dish.price / 100)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDish(dish)}
                                className="h-8 w-8 p-0 bg-neutral-800 border-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDish(dish)}
                                className="h-8 w-8 p-0 bg-neutral-800 border-1  text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {dish.category}
                          </span>
                        </div>
                        
                        {dish.description && (
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {dish.description}
                          </p>
                        )}
                        
                        {dish.allergens && dish.allergens.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Alérgenos:</p>
                            <div className="flex flex-wrap gap-1">
                              {dish.allergens.map((allergen, index) => (
                                <span
                                  key={index}
                                  className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
                                >
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {isDishFormOpen && (
          <div className="flex-1 overflow-y-auto p-6" ref={formContainerRef}>
            <AdminDishForm
              restaurantId={restaurant.id!}
              dish={selectedDish || undefined}
              categories={restaurant.categories || []}
              onSuccess={handleDishFormSuccess}
              onCancel={handleDishFormCancel}
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-neutral-600 bg-neutral-800">
          <div className="flex items-center justify-between text-sm text-gray-300">
            {!isDishFormOpen ? (
              <span>
                {filteredDishes.length} {filteredDishes.length === 1 ? 'plato' : 'platos'} 
                {selectedCategory !== 'all' && ` en ${selectedCategory}`}
              </span>
            ) : (
              <span></span>
            )}
            <Button onClick={onClose} variant="outline" size="sm">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
