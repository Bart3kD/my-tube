import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image, Loader2, RefreshCw, Upload, X, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useThumbnailGenerator } from '@/hooks/use-thumbnail-generator';

interface ThumbnailSelectProps {
  videoFile: File | null;
  thumbnail: File | null;
  onThumbnailChange: (file: File | null) => void;
  validationError?: string;
}

interface ThumbnailOption {
  file: File;
  url: string;
  label: string;
  isCustom?: boolean;
}

export function ThumbnailSelect({
  videoFile,
  thumbnail,
  onThumbnailChange,
  validationError
}: ThumbnailSelectProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generateThumbnails } = useThumbnailGenerator();

  // Handle generated thumbnails
  const handleGenerateThumbnails = async () => {
    if (!videoFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const timestamps = ['00:00:01', '00:00:05', '00:00:10', '00:00:15'];
      const generatedFiles = await generateThumbnails(videoFile, timestamps);

      const generatedOptions = generatedFiles.map((file, i) => ({
        file,
        url: URL.createObjectURL(file),
        label: `${[1, 5, 10, 15][i]}s`
      }));

      // Keep custom if already uploaded
      setThumbnails(prev =>
        [
          ...prev.filter(t => t.isCustom), // preserve custom
          ...generatedOptions
        ]
      );

      if (selectedIndex === null && generatedOptions.length > 0) {
        setSelectedIndex(prev => prev ?? 0);
        onThumbnailChange(generatedOptions[0].file);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate thumbnails');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle custom file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    setError(null);

    const customOption: ThumbnailOption = {
      file,
      url: URL.createObjectURL(file),
      label: 'Custom',
      isCustom: true
    };

    setThumbnails(prev => {
      const withoutOldCustom = prev.filter(t => !t.isCustom);
      return [customOption, ...withoutOldCustom];
    });

    setSelectedIndex(0); // custom is first
    onThumbnailChange(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleThumbnailSelect = (index: number) => {
    setSelectedIndex(index);
    onThumbnailChange(thumbnails[index].file);
  };

  const handleRemoveCustom = () => {
    setThumbnails(prev => prev.filter(t => !t.isCustom));
    if (selectedIndex === 0) {
      setSelectedIndex(null);
      onThumbnailChange(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Video Thumbnail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Thumbnail Preview */}
        {selectedIndex !== null && thumbnails[selectedIndex] && (
            <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-500">
                <img
                    src={thumbnails[selectedIndex].url}
                    alt="Selected thumbnail"
                    className="w-full h-full object-cover"
                />
                </div>

                <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Image className="w-4 h-4" />
                    <span>{thumbnails[selectedIndex].file.name}</span>
                    <span>({(thumbnails[selectedIndex].file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    {thumbnails[selectedIndex].isCustom && (
                    <span className="text-green-600">(Custom)</span>
                    )}
                </div>

                {/* Only show remove button for custom */}
                {thumbnails[selectedIndex].isCustom && (
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveCustom}
                    className="text-red-600 hover:text-red-700"
                    >
                    <X className="w-4 h-4" />
                    </Button>
                )}
                </div>
            </div>
        )}

        {/* Thumbnails Grid */}
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {thumbnails.map((thumb, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailSelect(index)}
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
                    onClick={(e) => { e.stopPropagation(); handleRemoveCustom(); }}
                    className="absolute top-2 left-2 w-6 h-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating thumbnails...
          </div>
        )}

        {/* Error */}
        {(error || validationError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateThumbnails}
            disabled={!videoFile || isGenerating}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {thumbnails.length > 0 ? 'Regenerate' : 'Generate'}
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
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
      </CardContent>
    </Card>
  );
}