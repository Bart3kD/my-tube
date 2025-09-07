import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';
import { ThumbnailOption } from '@/types/thumbnail.types';

interface ThumbnailPreviewProps {
  thumbnail: ThumbnailOption;
  onRemove?: () => void;
}

export function ThumbnailPreview({ thumbnail, onRemove }: ThumbnailPreviewProps) {
  return (
    <div className="relative">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-500">
        <img
          src={thumbnail.url}
          alt="Selected thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image className="w-4 h-4" />
          <span>{thumbnail.file.name}</span>
          <span>({(thumbnail.file.size / (1024 * 1024)).toFixed(2)} MB)</span>
          {thumbnail.isCustom && (
            <span className="text-green-600">(Custom)</span>
          )}
        </div>

        {thumbnail.isCustom && onRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}