import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { ThumbnailOption } from '@/types/thumbnail.types';

interface ThumbnailGridProps {
  thumbnails: ThumbnailOption[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onRemoveCustom: () => void;
}

export function ThumbnailGrid({ 
  thumbnails, 
  selectedIndex, 
  onSelect, 
  onRemoveCustom 
}: ThumbnailGridProps) {
  if (thumbnails.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {thumbnails.map((thumb, index) => (
        <div
          key={index}
          onClick={() => onSelect(index)}
          className={`relative cursor-pointer rounded-lg overflow-hidden 
            ${selectedIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'}`}
        >
          <div className="aspect-video bg-gray-100">
            <img src={thumb.url} alt={thumb.label} className="w-full h-full object-cover" />
          </div>
          
          {selectedIndex === index && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
              <Check className="w-3 h-3" />
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {thumb.label}
          </div>
          
          {thumb.isCustom && (
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => { 
                e.stopPropagation(); 
                onRemoveCustom(); 
              }}
              className="absolute top-2 left-2 w-6 h-6"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}