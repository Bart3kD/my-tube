import { useState, useCallback } from 'react';

export function useCommentForm(onSubmit: (content: string) => Promise<boolean>) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(comment);
    
    if (success) {
      setComment('');
    }
    setIsSubmitting(false);
  }, [comment, onSubmit]);

  const handleCancel = useCallback(() => {
    setComment('');
  }, []);

  return {
    comment,
    setComment,
    isSubmitting,
    handleSubmit,
    handleCancel,
    canSubmit: comment.trim().length > 0 && !isSubmitting
  };
}

// utils/format.ts
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}