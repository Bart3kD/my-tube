import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface VideosHeaderProps {
  totalVideos: number;
  onRefresh: () => void;
}

export function VideosHeader({ totalVideos, onRefresh }: VideosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">Videos</h1>
        <p className="text-muted-foreground mt-1">
          {totalVideos > 0 ? `${totalVideos} videos available` : 'Discover amazing content'}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
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
  );
}