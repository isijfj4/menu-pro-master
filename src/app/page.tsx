'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Restaurant, RestaurantType } from '@/lib/types';
import { getAllRestaurants, getRestaurantsByType } from '@/lib/db/restaurants';
import FiltersBar from '@/components/FiltersBar';
import RestaurantCard from '@/components/RestaurantCard';
import { RestaurantGridSkeleton } from '@/components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<RestaurantType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  // Fetch restaurants based on selected type
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        let fetchedRestaurants: Restaurant[];
        
        if (selectedType) {
          fetchedRestaurants = await getRestaurantsByType(selectedType, 12);
        } else {
          fetchedRestaurants = await getAllRestaurants(12);
        }
        
        setRestaurants(fetchedRestaurants);
        setFilteredRestaurants(fetchedRestaurants);
        setHasMore(fetchedRestaurants.length === 12);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast.error('Error al cargar los restaurantes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedType]);

  // Filter restaurants by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRestaurants(restaurants);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchTermLower) ||
      restaurant.type.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredRestaurants(filtered);
  }, [searchTerm, restaurants]);

  // Handle type filter change
  const handleTypeChange = (type: RestaurantType | null) => {
    setSelectedType(type);
  };

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  // Load more restaurants
  const handleLoadMore = async () => {
    try {
      setIsLoading(true);
      let moreRestaurants: Restaurant[];
      
      // Need to implement pagination in the backend functions
      if (selectedType) {
        moreRestaurants = await getRestaurantsByType(selectedType, 6);
      } else {
        moreRestaurants = await getAllRestaurants(6);
      }
      
      if (moreRestaurants.length < 6) {
        setHasMore(false);
      }
      
      setRestaurants(prev => [...prev, ...moreRestaurants]);
    } catch (error) {
      console.error('Error loading more restaurants:', error);
      toast.error('Error al cargar más restaurantes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Restaurantes</h1>
      
      <FiltersBar 
        onTypeChange={handleTypeChange}
        onSearchChange={handleSearchChange}
        selectedType={selectedType}
      />
      
      {isLoading && restaurants.length === 0 ? (
        <RestaurantGridSkeleton />
      ) : filteredRestaurants.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                index={index}
              />
            ))}
          </div>
          
          {hasMore && !isLoading && searchTerm === '' && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Cargar más
              </button>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-8">
              <RestaurantGridSkeleton count={3} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron restaurantes.</p>
        </div>
      )}
    </div>
  );
}
