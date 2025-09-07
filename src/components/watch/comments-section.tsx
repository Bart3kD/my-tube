import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, User, Send, Loader2 } from 'lucide-react';
import { formatTimeAgo } from '@/utils/format';
import { useCommentForm } from '@/hooks/use-comment-form';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatar: string | null;
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<boolean>;
}

export function CommentsSection({ comments, onAddComment }: CommentsSectionProps) {
  const { comment, setComment, isSubmitting, handleSubmit, handleCancel, canSubmit } = 
    useCommentForm(onAddComment);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {comments.length} Comments
      </h3>

      {/* Add Comment Form */}
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user.avatar || undefined} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm">
                  {comment.user.displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="w-3 h-3 mr-1" />
                </Button>
                <Button variant="ghost" size="sm">
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}