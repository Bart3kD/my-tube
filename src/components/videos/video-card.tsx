'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Eye, ThumbsUp, Clock, User } from 'lucide-react';
import { Video } from '@/types/video.types';
import Image from 'next/image';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatTimeAgo = (dateString: string) => {
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
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          {video.thumbnailUrl && !imageError ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              <Play className="w-16 h-16 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          
          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Play overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-white/90 text-black hover:bg-white rounded-full p-4"
              >
                <Play className="w-6 h-6" fill="currentColor" />
              </Button>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          {/* User Avatar & Title */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {video.user.avatar ? (
                <Image
                  src={video.user.avatar}
                  alt={video.user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary">
                {video.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-1">
                {video.user.channelName || video.user.displayName}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViews(video.views)} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(video.createdAt)}
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3 h-3" />
                  {video.likeCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  {video.commentCount} comments
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}