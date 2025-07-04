'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Restaurant, RestaurantType } from '@/lib/types';
import { cn } from '@/lib/utils';

// Map of restaurant types to their Spanish translations
const restaurantTypeLabels: Record<RestaurantType, string> = {
  'pollería': 'Pollería',
  'café': 'Café',
  'chifa': 'Chifa',
  'cevichería': 'Cevichería',
  'pizzería': 'Pizzería',
  'otro': 'Otro'
};

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export default function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  const { id, name, type, rating, coverImg } = restaurant;

  // Generate stars based on rating
  const numericRating = typeof rating === 'number' ? rating : 0;
  const stars = Array(5).fill(0).map((_, i) => (
    <Star
      key={i}
      className={cn(
        "h-4 w-4",
        i < Math.floor(numericRating) 
          ? "text-yellow-500 fill-yellow-500" 
          : i < numericRating 
            ? "text-yellow-500 fill-yellow-500/50" 
            : "text-muted-foreground"
      )}
    />
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/restaurant/${id}`}>
        <div className="rounded-2xl overflow-hidden border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
          <div className="relative h-48 w-full">
            {coverImg ? (
              <Image
                src={coverImg}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full">
              {restaurantTypeLabels[type] || type}
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-1 line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 mt-auto">
              {stars}
              <span className="text-sm text-muted-foreground ml-1">
                ({typeof rating === 'number' ? rating.toFixed(1) : '0.0'})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
