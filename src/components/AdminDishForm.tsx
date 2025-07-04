'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import Image from 'next/image';
import { Dish, DishCategory, CreateDishData } from '@/lib/types';
import { createDish, updateDish } from '@/lib/db/dishes';
import { uploadDishImage } from '@/lib/storage/uploadImage';
import ImageUploader from './ImageUploader';
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

  // Combine default categories with custom categories from the restaurant
  const allCategoryOptions = [
    ...categoryOptions,
    ...categories
      .filter(cat => !categoryOptions.some(option => option.value === cat))
      .map(cat => ({ value: cat as DishCategory, label: cat }))
  ];

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateDishData>({
    defaultValues: dish || {
      name: '',
      category: categories.length > 0 ? categories[0] as DishCategory : 'Platos a la carta',
      price: 0,
      description: '',
      photos: [],
      allergens: [],
      isFeatured: false
    }
  });

  const handleAddAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Always return a temporary URL for preview in the UI
    // The actual upload will happen during form submission
    const tempUrl = URL.createObjectURL(file);
    setPhotos([...photos, tempUrl]);
    return tempUrl;
  };

  const handleRemoveImage = (url: string) => {
    setPhotos(photos.filter(p => p !== url));
  };

  const onSubmit = async (data: CreateDishData) => {
    try {
      setIsSubmitting(true);
      
      // Include allergens from state
      data.allergens = allergens;
      
      // Convert price from decimal to cents
      data.price = Math.round(Number(data.price) * 100);
      
      // Process photos - separate blob URLs from real URLs
      const blobUrls = photos.filter(url => url.startsWith('blob:'));
      const realUrls = photos.filter(url => !url.startsWith('blob:'));
      
      // Prepare files to upload from blob URLs
      const filesToUpload: File[] = [];
      for (let i = 0; i < blobUrls.length; i++) {
        const blobUrl = blobUrls[i];
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        filesToUpload.push(new File([blob], `photo-${i}.jpg`, { type: 'image/jpeg' }));
      }
      
      // Create a copy of data with only real URLs for photos
      const finalData = { ...data, photos: realUrls };
      
      if (dish) {
        // For existing dish
        let updatedPhotos = [...realUrls];
        
        // Upload any new photos first to get real URLs
        for (let i = 0; i < filesToUpload.length; i++) {
          const imageUrl = await uploadDishImage(restaurantId, dish.id!, filesToUpload[i]);
          updatedPhotos.push(imageUrl);
        }
        
        // Update with all data including real image URLs
        finalData.photos = updatedPhotos;
        await updateDish(restaurantId, dish.id!, finalData);
        toast.success('Plato actualizado con éxito');
      } else {
        // For new dish - first create with real URLs only
        const dishId = await createDish(restaurantId, finalData);
        
        // If we have files to upload, do it now
        if (filesToUpload.length > 0) {
          const newPhotos = [...realUrls];
          
          // Upload each file and collect real URLs
          for (let i = 0; i < filesToUpload.length; i++) {
            const imageUrl = await uploadDishImage(restaurantId, dishId, filesToUpload[i]);
            newPhotos.push(imageUrl);
          }
          
          // Update the dish with all real image URLs
          await updateDish(restaurantId, dishId, { photos: newPhotos });
        }
        
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
            Fotos (máximo 5)
          </label>
          {photos.length < 5 && (
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageRemove={() => {}}
              aspectRatio="square"
            />
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : dish ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
