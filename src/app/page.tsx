'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { VideosGrid } from '@/components/videos/videos-grid';
import { VideosHeader } from '@/components/videos/videos-header';
import { VideosSearch } from '@/components/videos/videos-search';
import { useVideos } from '@/hooks/use-videos';
import { useDebounce } from '@/hooks/use-debounce';

export default function VideosPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  
  const {
    videos,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    updateSearch
  } = useVideos();

  // Update search when debounced value changes
  React.useEffect(() => {
    updateSearch(debouncedSearch);
  }, [debouncedSearch, updateSearch]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 w-full max-w-none flex flex-col items-center">
        {/* <VideosHeader 
          totalVideos={pagination.total} 
          onRefresh={refresh}
        /> */}

        <VideosSearch 
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <VideosGrid videos={videos} loading={loading && videos.length === 0} />

        {pagination.hasMore && !loading && (
          <div className="text-center mt-8">
            <Button onClick={loadMore} variant="outline" size="lg">
              Load More Videos
            </Button>
          </div>
        )}

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