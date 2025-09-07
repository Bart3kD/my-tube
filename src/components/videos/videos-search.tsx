import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface VideosSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function VideosSearch({ searchQuery, onSearchChange }: VideosSearchProps) {
  return (
    <div className="absolute top-4 flex flex-col justify-center sm:flex-row gap-4 mb-8 z-50 container">
      <div className="w-4/5 flex justify-center items-center relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pt-0.5"
        />
      </div>
      <Button variant="outline" className="sm:w-auto">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </div>
  );
}