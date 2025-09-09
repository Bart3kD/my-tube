// src/hooks/use-video-watch.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatar: string | null;
    username: string;
  };
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

interface VideoDetails {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatar: string | null;
    username: string;
    channelName: string | null;
    subscribersCount: number;
  };
}

export function useVideoWatch(videoId: string) {
  const { userId, isSignedIn } = useAuth();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Fetch video details
  useEffect(() => {
    async function fetchVideo() {
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        
        const videoData = await response.json();
        setVideo(videoData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId, fetchComments]);

  const handleLike = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'LIKE' }),
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        if (isDisliked) setIsDisliked(false);
        
        // Update video like count optimistically
        setVideo(prev => prev ? {
          ...prev,
          likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        } : null);
      }
    } catch (err) {
      console.error('Error liking video:', err);
    }
  }, [videoId, isLiked, isDisliked, isSignedIn, userId]);

  const handleDislike = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'DISLIKE' }),
      });

      if (response.ok) {
        setIsDisliked(!isDisliked);
        if (isLiked) {
          setIsLiked(false);
          // Decrease like count if was previously liked
          setVideo(prev => prev ? {
            ...prev,
            likeCount: prev.likeCount - 1
          } : null);
        }
      }
    } catch (err) {
      console.error('Error disliking video:', err);
    }
  }, [videoId, isLiked, isDisliked, isSignedIn, userId]);

  const addComment = useCallback(async (content: string): Promise<boolean> => {
    if (!isSignedIn || !userId) {
      // You might want to show a sign-in prompt here
      return false;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [newComment, ...prev]);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error adding comment:', errorData.error);
        return false;
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  }, [videoId, isSignedIn, userId]);

  const addReply = useCallback(async (parentId: string, content: string): Promise<boolean> => {
    if (!isSignedIn || !userId) return false;

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, parentId }),
      });

      if (response.ok) {
        const newReply = await response.json();
        
        // Add reply to the appropriate comment
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
                _count: comment._count ? {
                  ...comment._count,
                  replies: comment._count.replies + 1
                } : { replies: 1 }
              }
            : comment
        ));
        return true;
      } else {
        console.error('Error adding reply');
        return false;
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      return false;
    }
  }, [videoId, isSignedIn, userId]);

  return {
    video,
    comments,
    loading,
    error,
    isLiked,
    isDisliked,
    handleLike,
    handleDislike,
    addComment,
    addReply,
    refreshComments: fetchComments,
  };
}