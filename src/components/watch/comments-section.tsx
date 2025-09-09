// src/components/watch/comments-section.tsx
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, User, Send, Loader2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTimeAgo } from '@/utils/format';
import { useCommentForm } from '@/hooks/use-comment-form';

interface CommentUser {
  id: string;
  displayName: string;
  avatar: string | null;
  username: string;
}

interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: CommentUser;
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<boolean>;
  onAddReply?: (parentId: string, content: string) => Promise<boolean>;
}

interface CommentItemProps {
  comment: Comment;
  onAddReply?: (parentId: string, content: string) => Promise<boolean>;
}

function CommentItem({ comment, onAddReply }: CommentItemProps) {
  const { isSignedIn } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  
  const {
    comment: replyContent,
    setComment: setReplyContent,
    isSubmitting: isSubmittingReply,
    handleSubmit: handleReplySubmit,
    handleCancel: handleReplyCancel,
    canSubmit: canSubmitReply
  } = useCommentForm(async (content: string) => {
    if (onAddReply) {
      const success = await onAddReply(comment.id, content);
      if (success) {
        setShowReplyForm(false);
      }
      return success;
    }
    return false;
  });

  const handleReplyClick = () => {
    if (!isSignedIn) {
      // You might want to show a sign-in modal here
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const displayedReplies = showAllReplies 
    ? comment.replies || []
    : (comment.replies || []).slice(0, 3);

  const hasMoreReplies = (comment._count?.replies || 0) > 3;

  return (
    <div className="flex space-x-3">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar || undefined} />
        <AvatarFallback>
          <User className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-sm truncate">
            {comment.user.displayName || comment.user.username}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        
        <p className="text-sm mb-2 break-words">{comment.content}</p>
        
        <div className="flex items-center space-x-4 mb-3">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ThumbsUp className="w-3 h-3 mr-1" />
            <span className="text-xs">{comment.likes || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ThumbsDown className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleReplyClick}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mb-4">
            <div className="flex space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback>
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      handleReplyCancel();
                      setShowReplyForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleReplySubmit} 
                    disabled={!canSubmitReply}
                  >
                    {isSubmittingReply ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {displayedReplies.length > 0 && (
          <div className="space-y-3 mt-3 border-l-2 border-border pl-4">
            {displayedReplies.map((reply) => (
              <div key={reply.id} className="flex space-x-3">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={reply.user.avatar || undefined} />
                  <AvatarFallback>
                    <User className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-xs truncate">
                      {reply.user.displayName || reply.user.username}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs mb-1 break-words">{reply.content}</p>
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <ThumbsUp className="w-2.5 h-2.5 mr-0.5" />
                      <span className="text-xs">{reply.likes || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <ThumbsDown className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show More/Less Replies Button */}
        {hasMoreReplies && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllReplies(!showAllReplies)}
            className="mt-2 text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
          >
            {showAllReplies ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show fewer replies
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {(comment._count?.replies || 0) - 3} more replies
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({ comments, onAddComment, onAddReply }: CommentsSectionProps) {
  const { isSignedIn } = useAuth();
  const { 
    comment, 
    setComment, 
    isSubmitting, 
    handleSubmit, 
    handleCancel, 
    canSubmit 
  } = useCommentForm(onAddComment);

  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {comments.length} Comments
        </h3>
        
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
          <Button>Sign In</Button>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      </div>
    );
  }

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
          <CommentItem 
            key={comment.id} 
            comment={comment}
            onAddReply={onAddReply}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}