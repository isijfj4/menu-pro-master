import React, { useState, useEffect } from 'react';
import { Comment } from '@/lib/types';
import { getComments, addComment } from '@/lib/db/comments';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';

interface CommentsListProps {
  restaurantId: string;
}

const CommentsList: React.FC<CommentsListProps> = ({ restaurantId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      const fetchedComments = await getComments(restaurantId);
      setComments(fetchedComments);
    };
    fetchComments();
  }, [restaurantId]);

  const handleCommentSubmit = async (data: { comment: string; rating: number }) => {
    if (!user) {
      alert('Debes iniciar sesión para comentar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment = await addComment(restaurantId, {
        ...data,
        userId: user.uid,
      });
      setComments([newComment, ...comments]);
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Hubo un error al enviar tu comentario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
      {user && <CommentForm onSubmit={handleCommentSubmit} isSubmitting={isSubmitting} />}
      <div className="mt-6">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentsList;
