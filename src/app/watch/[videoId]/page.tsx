'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ThumbsUp, 
  ThumbsDown, 
  Share, 
  Download,
  MoreHorizontal,
  Send,
  AlertCircle,
  Loader2,
  User
} from 'lucide-react';
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

export default function WatchPage() {
  const params = useParams();
  const videoId = params?.videoId as string;

  // State management
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  
  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch video data
  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Video not found');
      }
      
      const data = await response.json();
      setVideo(data.video);
      setComments(data.comments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  // Handle video interactions
  const handleLike = async () => {
    // TODO: Implement like functionality
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = async () => {
    // TODO: Implement dislike functionality  
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleShare = async () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      await navigator.share({
        title: video?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      // TODO: Implement comment submission
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      
      if (response.ok) {
        setNewComment('');
        fetchVideo(); // Refresh comments
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
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

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="aspect-video w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                className="w-full h-full"
                controls
                poster={video.thumbnailUrl || undefined}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Title */}
            <h1 className="text-xl font-bold leading-tight">{video.title}</h1>

            {/* Video Stats & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center space-x-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{video.likeCount + (isLiked ? 1 : 0)}</span>
                </Button>

                <Button
                  variant={isDisliked ? "default" : "outline"}
                  size="sm"
                  onClick={handleDislike}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Channel Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={video.user.avatar || undefined} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {video.user.channelName || video.user.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {/* TODO: Add subscriber count */}
                    Subscriber count
                  </p>
                </div>
              </div>
              <Button>Subscribe</Button>
            </div>

            {/* Description */}
            {video.description && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                    </div>
                    <div className={`text-sm ${!showDescription ? 'line-clamp-3' : ''}`}>
                      {video.description}
                    </div>
                    {video.description.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        {showDescription ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                {comments.length} Comments
              </h3>

              {/* Add Comment */}
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewComment('')}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={!newComment.trim() || submittingComment}
                    >
                      {submittingComment ? (
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
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Related Videos</h3>
            {/* TODO: Fetch and display related videos */}
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex space-x-3">
                      <div className="aspect-video w-40 bg-gray-200 dark:bg-gray-800 rounded flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          Sample Related Video Title
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          Channel Name
                        </p>
                        <p className="text-xs text-muted-foreground">
                          10K views • 2 days ago
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}