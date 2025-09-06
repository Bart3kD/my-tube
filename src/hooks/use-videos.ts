import { useState, useEffect, useCallback } from 'react';
import { Video, VideosResponse } from '@/types/video.types';

interface UseVideosState {
  videos: Video[];
  loading: boolean;
  error: string;
  pagination: {
    page: number;
    hasMore: boolean;
    total: number;
  };
}

interface UseVideosReturn extends UseVideosState {
  fetchVideos: (reset?: boolean) => Promise<void>;
  loadMore: () => void;
  refresh: () => void;
  updateSearch: (query: string) => void;
}

export function useVideos(limit = 12): UseVideosReturn {
  const [state, setState] = useState<UseVideosState>({
    videos: [],
    loading: true,
    error: '',
    pagination: {
      page: 0,
      hasMore: false,
      total: 0
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  const fetchVideos = useCallback(async (reset = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));

      const offset = reset ? 0 : state.pagination.page * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        isPublic: 'true',
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/videos?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch videos');
      }

      const data: VideosResponse = await response.json();
      
      setState(prev => ({
        ...prev,
        videos: reset ? data.videos : [...prev.videos, ...data.videos],
        loading: false,
        pagination: {
          page: Math.floor(offset / limit),
          hasMore: data.pagination.hasMore,
          total: data.pagination.total
        }
      }));
      
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch videos'
      }));
    }
  }, [limit, searchQuery, state.pagination.page]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.pagination.hasMore) {
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, page: prev.pagination.page + 1 }
      }));
    }
  }, [state.loading, state.pagination.hasMore]);

  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page: 0 }
    }));
    fetchVideos(true);
  }, [fetchVideos]);

  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Initial load
  useEffect(() => {
    fetchVideos(true);
  }, []);

  // Handle pagination changes
  useEffect(() => {
    if (state.pagination.page > 0) {
      fetchVideos(false);
    }
  }, [state.pagination.page, fetchVideos]);

  // Handle search changes (with debouncing handled in component)
  useEffect(() => {
      fetchVideos(true);
  }, [searchQuery, fetchVideos]);

  return {
    ...state,
    fetchVideos,
    loadMore,
    refresh,
    updateSearch
  };
}