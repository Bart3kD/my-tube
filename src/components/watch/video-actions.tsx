import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal } from 'lucide-react';

interface VideoActionsProps {
  likeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
}

export function VideoActions({ 
  likeCount, 
  isLiked, 
  isDisliked, 
  onLike, 
  onDislike, 
  onShare 
}: VideoActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        onClick={onLike}
        className="flex items-center space-x-2"
      >
        <ThumbsUp className="w-4 h-4" />
        <span>{likeCount + (isLiked ? 1 : 0)}</span>
      </Button>

      <Button
        variant={isDisliked ? "default" : "outline"}
        size="sm"
        onClick={onDislike}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={onShare}>
        <Share className="w-4 h-4 mr-2" />
        Share
      </Button>

      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>

      <Button variant="outline" size="sm">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
}