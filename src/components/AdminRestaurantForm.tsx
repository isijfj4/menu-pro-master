'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { Restaurant, RestaurantType, CreateRestaurantData, DishCategory } from '@/lib/types';
import { createRestaurant, updateRestaurant } from '@/lib/db/restaurants';
import toast from 'react-hot-toast';
import Image from 'next/image';

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

interface RestaurantFormData extends Omit<CreateRestaurantData, 'images'> {
  images: { value: string }[];
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

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<RestaurantFormData>({
    defaultValues: {
      name: restaurant?.name || '',
      type: restaurant?.type || 'otro',
      categories: restaurant?.categories || [],
      coverImg: restaurant?.coverImg || '',
      images: restaurant?.images ? restaurant.images.map(url => ({ value: url })) : [],
      location: restaurant?.location || { lat: 0, lng: 0, city: 'Lima' },
      rating: restaurant?.rating || 5,
    }
  });

  const { fields: images, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const watchedImages = watch('images');

  useEffect(() => {
    if (restaurant) {
      setCategories(restaurant.categories);
    }
  }, [restaurant]);

  const handleAddCategory = () => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      const newCategories = [...categories, selectedCategory];
      setCategories(newCategories);
      setValue('categories', newCategories);
      setSelectedCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    const newCategories = categories.filter(c => c !== category);
    setCategories(newCategories);
    setValue('categories', newCategories);
  };

  const handleAddImage = () => {
    if (watchedImages.length < 15) {
      appendImage({ value: '' });
    } else {
      toast.error('Puedes añadir un máximo de 15 imágenes.');
    }
  };

  const handleImageRemove = (index: number) => {
    removeImage(index);
  };

  const onSubmit = async (data: RestaurantFormData) => {
    setIsSubmitting(true);
    
    const formattedData: CreateRestaurantData = {
      ...data,
      images: data.images.map((img) => img.value),
    };

    try {
      if (restaurant) {
        await updateRestaurant(restaurant.id!, formattedData);
        toast.success('Restaurante actualizado con éxito');
      } else {
        await createRestaurant(formattedData);
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

        {/* Cover Image URL */}
        <div>
          <label htmlFor="coverImg" className="block text-sm font-medium mb-1">
            URL de la imagen de portada (para la tarjeta)
          </label>
          <input
            id="coverImg"
            type="text"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
            placeholder="https://ejemplo.com/portada.jpg"
            {...register('coverImg', { required: 'La URL de portada es obligatoria' })}
          />
          {errors.coverImg && (
            <p className="text-destructive text-sm mt-1">{errors.coverImg.message}</p>
          )}
        </div>
        
        {/* Image URLs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              URLs de las imágenes (máx. 15)
            </label>
            <button
              type="button"
              onClick={handleAddImage}
              className="bg-primary text-primary-foreground rounded-lg px-3 py-1 text-sm"
              aria-label="Añadir URL de imagen"
              disabled={watchedImages && watchedImages.length >= 15}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {images.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  placeholder={`https://ejemplo.com/imagen${index + 1}.jpg`}
                  {...register(`images.${index}.value`, { required: 'La URL no puede estar vacía' })}
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Eliminar URL ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {errors.images && (
            <p className="text-destructive text-sm mt-1">
              Asegúrate de que todas las URLs sean válidas.
            </p>
          )}
          {watchedImages && watchedImages.length === 0 && (
            <p className="text-destructive text-sm mt-1">
              Debes añadir al menos una imagen.
            </p>
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
          disabled={isSubmitting || categories.length === 0 || !watchedImages || watchedImages.length === 0}
        >
          {isSubmitting ? 'Guardando...' : restaurant ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
