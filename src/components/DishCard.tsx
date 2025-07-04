'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Dish } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DishCardProps {
  dish: Dish;
  restaurantId: string;
  onClick: () => void;
  index?: number;
}

export default function DishCard({ dish, restaurantId, onClick, index = 0 }: DishCardProps) {
  const { name, price, photos, isFeatured } = dish;
  
  // Format price from cents to PEN
  const formattedPrice = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(price / 100);

  // Get the first photo or use a placeholder
  const photoUrl = photos && photos.length > 0 ? photos[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="rounded-xl overflow-hidden border bg-card text-card-foreground shadow hover:shadow-md transition-all duration-200">
        <div className="relative h-32 w-full">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Sin imagen</span>
            </div>
          )}
          
          {isFeatured && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              Destacado
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h4 className="font-medium line-clamp-1">{name}</h4>
          <p className="text-sm font-semibold text-primary mt-1">
            {formattedPrice}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
