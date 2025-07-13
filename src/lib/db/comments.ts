import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment } from '@/lib/types';

const COMMENTS_COLLECTION = 'comments';

/**
 * Obtiene los comentarios de un restaurante específico
 * @param restaurantId - El ID del restaurante
 * @returns Una promesa que se resuelve con un array de comentarios
 */
export const getComments = async (restaurantId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        userId: data.userId,
        comment: data.comment,
        rating: data.rating,
        createdAt: data.createdAt,
      } as Comment);
    });
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new Error('Unable to fetch comments.');
  }
};

/**
 * Agrega un nuevo comentario a un restaurante
 * @param restaurantId - El ID del restaurante
 * @param commentData - Los datos del comentario
 * @returns Una promesa que se resuelve con el comentario agregado
 */
export const addComment = async (
  restaurantId: string,
  commentData: Omit<Comment, 'id' | 'createdAt'>
): Promise<Comment> => {
  try {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      restaurantId,
      createdAt: Timestamp.now(),
    });
    return {
      id: docRef.id,
      ...commentData,
      createdAt: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Unable to add comment.');
  }
};
