'use client';

import { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import { Restaurant, Dish } from '@/lib/types';
import { getAllRestaurants, deleteRestaurant } from '@/lib/db/restaurants';
import { getAllDishes, deleteDish } from '@/lib/db/dishes';
import DataTable from '@/components/DataTable';
import AdminRestaurantForm from '@/components/AdminRestaurantForm';
import AdminDishForm from '@/components/AdminDishForm';
import DishesModal from '@/components/DishesModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantForEdit, setRestaurantForEdit] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestaurantFormOpen, setIsRestaurantFormOpen] = useState(false);
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);
  const [restaurantForModal, setRestaurantForModal] = useState<Restaurant | null>(null);

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch dishes when a restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      fetchDishes(selectedRestaurant.id!);
    } else {
      setDishes([]);
    }
  }, [selectedRestaurant]);

  // Fetch all restaurants
  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Error al cargar los restaurantes');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dishes for a restaurant
  const fetchDishes = async (restaurantId: string) => {
    try {
      setIsLoading(true);
      const data = await getAllDishes(restaurantId);
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Error al cargar los platos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restaurant actions
  const handleAddRestaurant = () => {
    setRestaurantForEdit(null);
    setIsRestaurantFormOpen(true);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setRestaurantForEdit(restaurant);
    setIsRestaurantFormOpen(true);
  };

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    try {
      await deleteRestaurant(restaurant.id!);
      toast.success('Restaurante eliminado con éxito');
      fetchRestaurants();
      if (selectedRestaurant?.id === restaurant.id) {
        setSelectedRestaurant(null);
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Error al eliminar el restaurante');
    }
  };

  const handleRestaurantFormSuccess = () => {
    setIsRestaurantFormOpen(false);
    fetchRestaurants();
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
    if (!selectedRestaurant) return;
    
    try {
      await deleteDish(selectedRestaurant.id!, dish.id!);
      toast.success('Plato eliminado con éxito');
      fetchDishes(selectedRestaurant.id!);
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Error al eliminar el plato');
    }
  };

  const handleDishFormSuccess = () => {
    setIsDishFormOpen(false);
    if (selectedRestaurant) {
      fetchDishes(selectedRestaurant.id!);
    }
  };

  // Handle restaurant row click to show dishes modal
  const handleRestaurantRowClick = (restaurant: Restaurant) => {
    setRestaurantForModal(restaurant);
    setIsDishesModalOpen(true);
  };

  const handleCloseDishesModal = () => {
    setIsDishesModalOpen(false);
    setRestaurantForModal(null);
  };

  // Restaurant columns for DataTable
  const restaurantColumns = [
    {
      header: 'Nombre',
      accessorKey: 'name' as keyof Restaurant,
    },
    {
      header: 'Tipo',
      accessorKey: 'type' as keyof Restaurant,
    },
    {
      header: 'Ciudad',
      accessorKey: 'location' as keyof Restaurant,
      cell: (restaurant: Restaurant) => restaurant.location.city,
    },
    {
      header: 'Calificación',
      accessorKey: 'rating' as keyof Restaurant,
      cell: (restaurant: Restaurant) => (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          <span>{typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : restaurant.rating}</span>
        </div>
      ),
    },
  ];

  // Dish columns for DataTable
  const dishColumns = [
    {
      header: 'Nombre',
      accessorKey: 'name' as keyof Dish,
    },
    {
      header: 'Categoría',
      accessorKey: 'category' as keyof Dish,
    },
    {
      header: 'Precio',
      accessorKey: 'price' as keyof Dish,
      cell: (dish: Dish) => (
        <span>
          {new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
          }).format(dish.price / 100)}
        </span>
      ),
    },
    {
      header: 'Destacado',
      accessorKey: 'isFeatured' as keyof Dish,
      cell: (dish: Dish) => (
        <span>{dish.isFeatured ? 'Sí' : 'No'}</span>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">Administración de Restaurantes</h1>
        
        {/* Restaurants Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Restaurantes</h2>
            <p className="text-sm text-muted-foreground">
              💡 Haz click en una fila para ver los platos del restaurante
            </p>
          </div>
          <DataTable
            data={restaurants}
            columns={restaurantColumns}
            onAdd={handleAddRestaurant}
            onEdit={handleEditRestaurant}
            onDelete={handleDeleteRestaurant}
            onRowClick={handleRestaurantRowClick}
            addButtonLabel="Añadir Restaurante"
            isLoading={isLoading}
          />
        </div>
        
        {/* Dishes Table (only shown when a restaurant is selected) */}
        {selectedRestaurant && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Platos de {selectedRestaurant.name}
              </h2>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Volver a todos los restaurantes
              </button>
            </div>
            
            <DataTable
              data={dishes}
              columns={dishColumns}
              onAdd={handleAddDish}
              onEdit={handleEditDish}
              onDelete={handleDeleteDish}
              addButtonLabel="Añadir Plato"
              isLoading={isLoading}
            />
          </div>
        )}
        
        {/* Restaurant Form Modal */}
        {isRestaurantFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold mb-4">
                {restaurantForEdit ? 'Editar Restaurante' : 'Nuevo Restaurante'}
              </h2>
              <AdminRestaurantForm
                restaurant={restaurantForEdit || undefined}
                onSuccess={handleRestaurantFormSuccess}
                onCancel={() => setIsRestaurantFormOpen(false)}
              />
            </div>
          </div>
        )}
        
        {/* Dish Form Modal */}
        {isDishFormOpen && selectedRestaurant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold mb-4">
                {selectedDish ? 'Editar Plato' : 'Nuevo Plato'}
              </h2>
              <AdminDishForm
                restaurantId={selectedRestaurant.id!}
                dish={selectedDish || undefined}
                categories={selectedRestaurant.categories}
                onSuccess={handleDishFormSuccess}
                onCancel={() => setIsDishFormOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Dishes Modal */}
        {isDishesModalOpen && restaurantForModal && (
          <DishesModal
            restaurant={restaurantForModal}
            isOpen={isDishesModalOpen}
            onClose={handleCloseDishesModal}
            onDishesUpdated={async () => {
              if (selectedRestaurant && selectedRestaurant.id && selectedRestaurant.id === restaurantForModal.id) {
                await fetchDishes(selectedRestaurant.id);
              }
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
