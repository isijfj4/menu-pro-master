'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Restaurant, RestaurantType } from '@/lib/types';

// Map of restaurant types to their Spanish translations
const restaurantTypeLabels: Record<RestaurantType, string> = {
  'pollería': 'Pollería',
  'café': 'Café',
  'chifa': 'Chifa',
  'cevichería': 'Cevichería',
  'pizzería': 'Pizzería',
  'otro': 'Otro',
  'Nikkei': 'Nikkei',
  'Criollo': 'Criollo'
};

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export default function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  const { id, name, type, rating, coverImg, description } = restaurant;

  console.log('🏪 [RESTAURANT_CARD] Renderizando tarjeta de restaurante:', {
    restaurantId: id,
    restaurantName: name,
    hasCoverImg: !!coverImg,
    coverImgUrl: coverImg,
    coverImgLength: coverImg?.length,
    isValidUrl: coverImg ? (coverImg.startsWith('http') || coverImg.startsWith('blob:')) : false,
    timestamp: new Date().toISOString()
  });

  // Generate stars based on rating including partial values
  const numericRating = typeof rating === 'number' ? rating : 0;
  const stars = Array(5).fill(0).map((_, i) => {
    const fillPercent = Math.max(Math.min(numericRating - i, 1), 0) * 100;
    return (
      <span key={i} className="relative inline-block">
        <Star className="h-4 w-4 text-muted-foreground" />
        {fillPercent > 0 && (
          <Star
            className="h-4 w-4 text-yellow-500 fill-yellow-500 absolute left-0 top-0"
            style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
          />
        )}
      </span>
    );
  });

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
                unoptimized
                onLoad={() => {
                  console.log('✅ [RESTAURANT_CARD] Imagen cargada exitosamente:', {
                    restaurantId: id,
                    restaurantName: name,
                    imageUrl: coverImg,
                    timestamp: new Date().toISOString()
                  });
                }}
                onError={(error) => {
                  console.error('❌ [RESTAURANT_CARD] Error al cargar imagen:', {
                    restaurantId: id,
                    restaurantName: name,
                    imageUrl: coverImg,
                    error: error,
                    timestamp: new Date().toISOString()
                  });
                }}
                onLoadStart={() => {
                  console.log('🔄 [RESTAURANT_CARD] Iniciando carga de imagen:', {
                    restaurantId: id,
                    imageUrl: coverImg
                  });
                }}
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
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>
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
