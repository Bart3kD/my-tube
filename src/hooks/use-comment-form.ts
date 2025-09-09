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