// src/components/watch/video-actions.tsx
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share, CheckCircle } from 'lucide-react';
import { formatLikes } from '@/utils/format';
import { cn } from '@/lib/utils';

interface VideoActionsProps {
  likeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
  isLoading?: boolean;
}

export function VideoActions({
  likeCount,
  isLiked,
  isDisliked,
  onLike,
  onDislike,
  onShare,
  isLoading = false
}: VideoActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center bg-secondary rounded-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={isLoading}
          className={cn(
            "rounded-l-full rounded-r-none px-4 py-2 h-9",
            isLiked && "bg-blue-100 text-blue-600 hover:bg-blue-200"
          )}
        >
          <ThumbsUp 
            className={cn(
              "w-4 h-4 mr-2", 
              isLiked && "fill-current"
            )} 
          />
          {formatLikes(likeCount)}
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDislike}
          disabled={isLoading}
          className={cn(
            "rounded-r-full rounded-l-none px-4 py-2 h-9",
            isDisliked && "bg-red-100 text-red-600 hover:bg-red-200"
          )}
        >
          <ThumbsDown 
            className={cn(
              "w-4 h-4", 
              isDisliked && "fill-current"
            )} 
          />
        </Button>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onShare}
        className="rounded-full px-4 py-2 h-9"
      >
        <Share className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
}