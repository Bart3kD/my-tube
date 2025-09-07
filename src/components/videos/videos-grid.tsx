'use client';

import { Video } from '@/types/video.types';
import { VideoCard } from './video-card';
import { Play } from 'lucide-react';

interface VideosGridProps {
  videos: Video[];
  loading?: boolean;
}

export function VideosGrid({ videos, loading = false }: VideosGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No videos found</h3>
        <p className="text-muted-foreground">
          Be the first to upload a video to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}