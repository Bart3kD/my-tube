import { useState, useEffect, useCallback } from 'react';
import { Video } from '@/types/video.types';

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

interface VideoWatchState {
  video: Video | null;
  comments: Comment[];
  loading: boolean;
  error: string;
  isLiked: boolean;
  isDisliked: boolean;
}

export function useVideoWatch(videoId: string) {
  const [state, setState] = useState<VideoWatchState>({
    video: null,
    comments: [],
    loading: true,
    error: '',
    isLiked: false,
    isDisliked: false
  });

  const fetchVideo = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      
      const response = await fetch(`/api/videos/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Video not found');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        video: data.video,
        comments: data.comments || [],
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load video',
        loading: false
      }));
    }
  }, [videoId]);

  const handleLike = useCallback(async () => {
    // TODO: Implement API call
    setState(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      isDisliked: prev.isLiked ? prev.isDisliked : false
    }));
  }, []);

  const handleDislike = useCallback(async () => {
    // TODO: Implement API call
    setState(prev => ({
      ...prev,
      isDisliked: !prev.isDisliked,
      isLiked: prev.isDisliked ? prev.isLiked : false
    }));
  }, []);

  const addComment = useCallback(async (content: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      
      if (response.ok) {
        await fetchVideo(); // Refresh comments
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to submit comment:', err);
      return false;
    }
  }, [videoId, fetchVideo]);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId, fetchVideo]);

  return {
    ...state,
    handleLike,
    handleDislike,
    addComment,
    refreshVideo: fetchVideo
  };
}