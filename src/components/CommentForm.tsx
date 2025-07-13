import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

const commentSchema = z.object({
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres.'),
  rating: z.number().min(1).max(5),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  isSubmitting: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const rating = watch('rating');

  const handleRating = (rate: number) => {
    setValue('rating', rate, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tu opinión</label>
        <div className="flex items-center space-x-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-8 w-8 cursor-pointer ${
                i < rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              onClick={() => handleRating(i + 1)}
            />
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Tu comentario
        </label>
        <Textarea
          id="comment"
          {...register('comment')}
          className="mt-1"
          rows={4}
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar comentario'}
      </Button>
    </form>
  );
};

export default CommentForm;
