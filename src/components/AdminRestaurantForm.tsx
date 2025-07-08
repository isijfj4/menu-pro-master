'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { Restaurant, RestaurantType, CreateRestaurantData, DishCategory } from '@/lib/types';
import { createRestaurant, updateRestaurant } from '@/lib/db/restaurants';
import toast from 'react-hot-toast';

// Type options for the form
const typeOptions: { value: RestaurantType; label: string }[] = [
  { value: 'pollería', label: 'Pollería' },
  { value: 'café', label: 'Café' },
  { value: 'chifa', label: 'Chifa' },
  { value: 'cevichería', label: 'Cevichería' },
  { value: 'pizzería', label: 'Pizzería' },
  { value: 'otro', label: 'Otro' }
];

const categoryOptions: DishCategory[] = [
  'Entradas',
  'Platos a la carta',
  'Postres',
  'Bebidas',
  'Combos',
  'Especialidades'
];

interface AdminRestaurantFormProps {
  restaurant?: Restaurant;
  onSuccess: () => void;
  onCancel: () => void;
}


export default function AdminRestaurantForm({
  restaurant,
  onSuccess,
  onCancel
}: AdminRestaurantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>(
    restaurant?.categories || []
  );
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | ''>('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateRestaurantData>({
    defaultValues: restaurant || {
      name: '',
      type: 'otro',
      categories: [],
      coverImg: '',
      location: {
        lat: 0,
        lng: 0,
        city: 'Lima'
      },
      rating: 5
    }
  });

  const coverImg = watch('coverImg');

  const handleAddCategory = () => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setCategories([...categories, selectedCategory]);
      setSelectedCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };


  const handleImageUpload = async (file: File): Promise<string> => {
    console.log('🖼️ [RESTAURANT_FORM] Manejando subida de imagen:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString()
    });

    // Always return a temporary URL for preview in the UI
    // The actual upload will happen during form submission
    const tempUrl = URL.createObjectURL(file);
    setValue('coverImg', tempUrl);
    
    console.log('✅ [RESTAURANT_FORM] URL temporal creada:', tempUrl);
    return tempUrl;
  };

  const handleImageRemove = () => {
    setValue('coverImg', '');
  };

  const onSubmit = async (data: CreateRestaurantData) => {
    setIsSubmitting(true);
    data.categories = categories;

    try {
      if (restaurant) {
        await updateRestaurant(restaurant.id!, data);
        toast.success('Restaurante actualizado con éxito');
      } else {
        await createRestaurant(data);
        toast.success('Restaurante creado con éxito');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el restaurante:', error);
      toast.error('Error al guardar el restaurante');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Restaurant name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre del restaurante
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
            placeholder="Nombre del restaurante"
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          {errors.name && (
            <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        {/* Restaurant type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Tipo de restaurante
          </label>
          <select
            id="type"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
            {...register('type', { required: 'El tipo es obligatorio' })}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-destructive text-sm mt-1">{errors.type.message}</p>
          )}
        </div>
        
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Categorías de platos
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map(category => (
              <div 
                key={category}
                className="bg-muted rounded-full px-3 py-1 text-sm flex items-center gap-1"
              >
                <span>{category}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Eliminar categoría ${category}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DishCategory)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2"
            >
              <option value="" disabled>Selecciona una categoría</option>
              {categoryOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-primary text-primary-foreground rounded-lg px-3 py-2"
              aria-label="Añadir categoría"
              disabled={!selectedCategory}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {categories.length === 0 && (
            <p className="text-destructive text-sm mt-1">
              Añade al menos una categoría
            </p>
          )}
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            URL de Google Maps
          </label>
          <input
            id="city"
            type="text"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
            placeholder="https://maps.app.goo.gl/..."
            {...register('location.city', { required: 'La URL de Google Maps es obligatoria' })}
          />
          {errors.location?.city && (
            <p className="text-destructive text-sm mt-1">{errors.location.city.message}</p>
          )}
        </div>
        
        {/* Rating */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-1">
            Calificación (1-5)
          </label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
            {...register('rating', {
              required: 'La calificación es obligatoria',
              min: { value: 1, message: 'La calificación mínima es 1' },
              max: { value: 5, message: 'La calificación máxima es 5' },
              valueAsNumber: true
            })}
          />
          {errors.rating && (
            <p className="text-destructive text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>
        
        {/* Cover image URL */}
        <div>
          <label htmlFor="coverImg" className="block text-sm font-medium mb-1">
            URL de la imagen de portada
          </label>
          <input
            id="coverImg"
            type="text"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
            placeholder="https://ejemplo.com/imagen.jpg"
            {...register('coverImg', { required: 'La URL de la imagen es obligatoria' })}
          />

          {errors.coverImg && (
            <p className="text-destructive text-sm mt-1">{errors.coverImg.message}</p>
          )}
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          disabled={isSubmitting || categories.length === 0}
        >
          {isSubmitting ? 'Guardando...' : restaurant ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
