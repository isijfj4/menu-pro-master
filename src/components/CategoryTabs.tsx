'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dish } from '@/lib/types';
import DishCard from './DishCard';
import { DishGridSkeleton } from './LoadingSkeleton';

interface CategoryTabsProps {
  categories: string[];
  dishes: Dish[];
  restaurantId: string;
  isLoading: boolean;
  onDishClick: (dish: Dish) => void;
  onDishesUpdated?: () => Promise<void>;
}

export default function CategoryTabs({
  categories,
  dishes,
  restaurantId,
  isLoading,
  onDishClick,
  onDishesUpdated
}: CategoryTabsProps) {
  // Add "Todos" as a special category to show all dishes
  const allCategories = ['Todos', ...categories];
  
  const [activeCategory, setActiveCategory] = useState<string>(
    allCategories.length > 0 ? allCategories[0] : ''
  );

  // Filter dishes by active category (show all if "Todos" is selected)
  const filteredDishes = activeCategory === 'Todos' 
    ? dishes 
    : dishes.filter((dish) => {
        // Make comparison case-insensitive
        return dish.category.toLowerCase() === activeCategory.toLowerCase();
      });

  // For debugging
  console.log('All dishes:', dishes);
  console.log('Active category:', activeCategory);
  console.log('Filtered dishes:', filteredDishes);
  console.log('All categories:', categories);
  console.log('All categories with Todos:', allCategories);
  
  // Count dishes per category for debugging
  const dishesPerCategory: Record<string, number> = {};
  dishes.forEach(dish => {
    const category = dish.category as string;
    if (!dishesPerCategory[category]) {
      dishesPerCategory[category] = 0;
    }
    dishesPerCategory[category]++;
  });
  console.log('Dishes per category:', dishesPerCategory);

  return (
    <div className="mt-8">
      {/* Category tabs */}
      <div className="border-b mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeCategory === category
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
              {activeCategory === category && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <DishGridSkeleton />
          ) : filteredDishes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDishes.map((dish, index) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  restaurantId={restaurantId}
                  onClick={() => onDishClick(dish)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay platos en esta categoría.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
