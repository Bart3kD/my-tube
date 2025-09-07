import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload } from 'lucide-react';

interface ThumbnailActionsProps {
  videoFile: File | null;
  isGenerating: boolean;
  hasExistingThumbnails: boolean;
  onGenerate: () => void;
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
}

export function ThumbnailActions({
  videoFile,
  isGenerating,
  hasExistingThumbnails,
  onGenerate,
  onFileSelect,
  onError
}: ThumbnailActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError('Thumbnail must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    onFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onGenerate}
          disabled={!videoFile || isGenerating}
          className="flex-1"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {hasExistingThumbnails ? 'Regenerate' : 'Generate'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()} 
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Custom
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        One custom and four generated thumbnails are available. Click to select one (max 5MB for custom).
      </p>
    </div>
  );
}