import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useThumbnailGenerator } from '@/hooks/use-thumbnail-generator';
import { useThumbnailState } from '@/hooks/use-thumbnail-state';
import { ThumbnailPreview } from './thumbnail-preview';
import { ThumbnailGrid } from './thumbnail-grid';
import { ThumbnailActions } from './thumbnail-actions';
import { ThumbnailOption } from '@/types/thumbnail.types';

interface ThumbnailSelectProps {
  videoFile: File | null;
  thumbnail: File | null;
  onThumbnailChange: (file: File | null) => void;
  validationError?: string;
}

export function ThumbnailSelect({
  videoFile,
  thumbnail,
  onThumbnailChange,
  validationError
}: ThumbnailSelectProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { generateThumbnails } = useThumbnailGenerator();
  const {
    thumbnails,
    selectedIndex,
    selectedThumbnail,
    addGeneratedThumbnails,
    addCustomThumbnail,
    removeCustomThumbnail,
    selectThumbnail
  } = useThumbnailState();

  const handleGenerateThumbnails = async () => {
    if (!videoFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const timestamps = ['00:00:01', '00:00:05', '00:00:10', '00:00:15'];
      const generatedFiles = await generateThumbnails(videoFile, timestamps);

      const generatedOptions: ThumbnailOption[] = generatedFiles.map((file, i) => ({
        file,
        url: URL.createObjectURL(file),
        label: `${[1, 5, 10, 15][i]}s`
      }));

      addGeneratedThumbnails(generatedOptions);

      if (generatedOptions.length > 0 && !selectedThumbnail) {
        onThumbnailChange(generatedOptions[0].file);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate thumbnails');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomFileSelect = (file: File) => {
    setError(null);

    const customOption: ThumbnailOption = {
      file,
      url: URL.createObjectURL(file),
      label: 'Custom',
      isCustom: true
    };

    addCustomThumbnail(customOption);
    onThumbnailChange(file);
  };

  const handleThumbnailSelect = (index: number) => {
    selectThumbnail(index);
    onThumbnailChange(thumbnails[index].file);
  };

  const handleRemoveCustom = () => {
    removeCustomThumbnail();
    if (selectedIndex === 0) {
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
        {selectedThumbnail && (
          <ThumbnailPreview
            thumbnail={selectedThumbnail}
            onRemove={selectedThumbnail.isCustom ? handleRemoveCustom : undefined}
          />
        )}

        <ThumbnailGrid
          thumbnails={thumbnails}
          selectedIndex={selectedIndex}
          onSelect={handleThumbnailSelect}
          onRemoveCustom={handleRemoveCustom}
        />

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating thumbnails...
          </div>
        )}

        {(error || validationError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || validationError}</AlertDescription>
          </Alert>
        )}

        <ThumbnailActions
          videoFile={videoFile}
          isGenerating={isGenerating}
          hasExistingThumbnails={thumbnails.length > 0}
          onGenerate={handleGenerateThumbnails}
          onFileSelect={handleCustomFileSelect}
          onError={setError}
        />
      </CardContent>
    </Card>
  );
}