import React from 'react';
import { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  return (
    <div className="flex items-start space-x-4 p-4 border-b">
      <Avatar>
        <AvatarImage src={`https://i.pravatar.cc/150?u=${comment.userId}`} />
        <AvatarFallback>{comment.userId.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{comment.userId}</p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {new Date(comment.createdAt.seconds * 1000).toLocaleDateString()}
        </p>
        <p className="mt-2 text-gray-700">{comment.comment}</p>
      </div>
    </div>
  );
};

export default CommentCard;
