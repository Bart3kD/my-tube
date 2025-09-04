'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { VideosGrid } from '@/components/videos/videos-grid';
import { Video, VideosResponse } from '@/types/video.types';
import Link from 'next/link';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);

  const limit = 12;

  const fetchVideos = async (offset = 0, reset = false) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        isPublic: 'true'
      });

      const response = await fetch(`/api/videos?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data: VideosResponse = await response.json();
      
      if (reset) {
        setVideos(data.videos);
      } else {
        setVideos(prev => [...prev, ...data.videos]);
      }
      
      setHasMore(data.pagination.hasMore);
      setTotalVideos(data.pagination.total);
      setCurrentPage(Math.floor(offset / limit));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextOffset = (currentPage + 1) * limit;
    fetchVideos(nextOffset, false);
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    fetchVideos(0, true);
  };

  useEffect(() => {
    fetchVideos(0, true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Videos</h1>
            <p className="text-muted-foreground mt-1">
              {totalVideos > 0 ? `${totalVideos} videos available` : 'Discover amazing content'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/upload">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Videos Grid */}
        <VideosGrid videos={videos} loading={loading && videos.length === 0} />

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore} variant="outline" size="lg">
              Load More Videos
            </Button>
          </div>
        )}

        {/* Loading More */}
        {loading && videos.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading more videos...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}