'use client';

import { useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { VideoPlayer } from '@/components/watch/video-player';
import { VideoActions } from '@/components/watch/video-actions';
import { ChannelInfo } from '@/components/watch/channel-info';
import { VideoDescription } from '@/components/watch/video-description';
import { CommentsSection } from '@/components/watch/comments-section';
import { WatchPageSkeleton } from '@/components/watch/loading-skeleton';
import { useVideoWatch } from '@/hooks/use-video-watch';
import { formatViews, formatTimeAgo } from '@/utils/format';

export default function WatchPage() {
  const params = useParams();
  const videoId = params?.videoId as string;

  const {
    video,
    comments,
    loading,
    error,
    isLiked,
    isDisliked,
    handleLike,
    handleDislike,
    addComment
  } = useVideoWatch(videoId);

  const handleShare = async () => {
    if (navigator.share && video) {
      await navigator.share({
        title: video.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Video not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer video={video} />

            <h1 className="text-xl font-bold leading-tight">{video.title}</h1>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>

              <VideoActions
                likeCount={video.likeCount}
                isLiked={isLiked}
                isDisliked={isDisliked}
                onLike={handleLike}
                onDislike={handleDislike}
                onShare={handleShare}
              />
            </div>

            <Separator />

            <ChannelInfo user={video.user} />

            {video.description && (
              <VideoDescription
                description={video.description}
                views={video.views}
                createdAt={video.createdAt}
              />
            )}

            <CommentsSection comments={comments} onAddComment={addComment} />
          </div>

          {/* Sidebar - TODO: Related Videos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Related Videos</h3>
            <div className="text-sm text-muted-foreground">
              Related videos coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}