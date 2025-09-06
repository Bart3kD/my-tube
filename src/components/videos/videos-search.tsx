import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface VideosSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function VideosSearch({ searchQuery, onSearchChange }: VideosSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" className="sm:w-auto">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </div>
  );
}