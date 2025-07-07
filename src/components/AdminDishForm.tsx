'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import Image from 'next/image';
import { Dish, DishCategory, CreateDishData } from '@/lib/types';
import { createDish, updateDish } from '@/lib/db/dishes';
import toast from 'react-hot-toast';

// Category options for the form
const categoryOptions: { value: DishCategory; label: string }[] = [
  { value: 'Entradas', label: 'Entradas' },
  { value: 'Platos a la carta', label: 'Platos a la carta' },
  { value: 'Postres', label: 'Postres' },
  { value: 'Bebidas', label: 'Bebidas' },
  { value: 'Combos', label: 'Combos' },
  { value: 'Especialidades', label: 'Especialidades' }
];

interface AdminDishFormProps {
  restaurantId: string;
  dish?: Dish;
  categories?: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminDishForm({
  restaurantId,
  dish,
  categories = [],
  onSuccess,
  onCancel
}: AdminDishFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allergens, setAllergens] = useState<string[]>(
    dish?.allergens || []
  );
  const [newAllergen, setNewAllergen] = useState('');
  const [photos, setPhotos] = useState<string[]>(
    dish?.photos || []
  );

// Only use categories from the restaurant
const allCategoryOptions = categories.map(cat => {
  console.log('Adding category:', cat);
  return { value: cat as DishCategory, label: cat };
});

  console.log('Available categories:', categories);
  console.log('All category options:', allCategoryOptions);

  // Use the first category from the restaurant's categories or empty string if none exist
  const defaultCategory = categories.length > 0 
    ? categories[0] as DishCategory 
    : '' as DishCategory;
  
  console.log('Default category:', defaultCategory);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateDishData>({
    defaultValues: dish ? {
      ...dish,
      price: dish.price / 100, // Convert cents to decimal for the form
    } : {
      name: '',
      category: defaultCategory,
      price: 0,
      description: '',
      photos: [],
      allergens: [],
      isFeatured: false
    }
  });

  useEffect(() => {
    // Register the 'photos' field so react-hook-form is aware of it
    register('photos');
  }, [register]);

  useEffect(() => {
    // Update the form value when the local 'photos' state changes
    setValue('photos', photos);
  }, [photos, setValue]);

  const handleAddAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && photos.length < 5) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemoveImage = (url: string) => {
    setPhotos(photos.filter(p => p !== url));
  };

  const onSubmit = async (data: CreateDishData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Form data before submission:', data);
      
      // Include allergens from state
      data.allergens = allergens;
      
      // Convert price from decimal to cents
      data.price = Math.round(Number(data.price) * 100);
      
      // Ensure category is one of the valid options
      console.log('Selected category:', data.category);
      console.log('Available categories in restaurant:', categories);
      
      const finalData = { ...data, allergens, photos };

      if (dish) {
        await updateDish(restaurantId, dish.id!, finalData);
        toast.success('Plato actualizado con éxito');
      } else {
        await createDish(restaurantId, finalData);
        toast.success('Plato creado con éxito');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving dish:', error);
      toast.error('Error al guardar el plato');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Dish name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nombre del plato
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
              placeholder="Nombre del plato"
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          {/* Dish category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Categoría
            </label>
            <select
              id="category"
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
              {...register('category', { required: 'La categoría es obligatoria' })}
            >
              {allCategoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-destructive text-sm mt-1">{errors.category.message}</p>
            )}
          </div>
          
          {/* Dish price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Precio (PEN)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
              placeholder="0.00"
              {...register('price', { 
                required: 'El precio es obligatorio',
                min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
              })}
            />
            {errors.price && (
              <p className="text-destructive text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
          
          {/* Dish description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
              placeholder="Descripción del plato"
              {...register('description', { required: 'La descripción es obligatoria' })}
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
          
          {/* Featured */}
          <div className="flex items-center">
            <input
              id="isFeatured"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('isFeatured')}
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm">
              Destacar este plato
            </label>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Alérgenos (opcional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allergens.map(allergen => (
                <div 
                  key={allergen}
                  className="bg-muted rounded-full px-3 py-1 text-sm flex items-center gap-1"
                >
                  <span>{allergen}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergen(allergen)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Eliminar alérgeno ${allergen}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2"
                placeholder="Nuevo alérgeno"
                value={newAllergen}
                onChange={e => setNewAllergen(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergen();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAllergen}
                className="bg-primary text-primary-foreground rounded-lg px-3 py-2"
                aria-label="Añadir alérgeno"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Photos */}
          <div>
            <label className="block text-sm font-medium mb-1">
              URLs de las fotos (máximo 5)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2"
                placeholder="https://ejemplo.com/foto.jpg"
                value={newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoto();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="bg-primary text-primary-foreground rounded-lg px-3 py-2"
                aria-label="Añadir foto"
                disabled={photos.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                    <Image
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(photo)}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                      aria-label="Eliminar foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length >= 5 && (
              <p className="text-muted-foreground text-sm mt-1">
                Has alcanzado el límite de 5 fotos.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden submit button for form submission */}
      <button
        type="submit"
        className="hidden"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : dish ? 'Actualizar' : 'Crear'}
      </button>
      
      {/* Hidden input to track photos with react-hook-form */}
      <input type="hidden" {...register('photos')} />
    </form>
  );
}
