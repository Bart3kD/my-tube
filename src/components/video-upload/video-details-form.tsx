import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video, Image, CheckCircle, Upload } from 'lucide-react';
import { ValidationErrors } from '@/types/video.types';

interface VideoDetails {
  title: string;
  description: string;
  thumbnail: File | null;
}

interface VideoDetailsFormProps {
  videoDetails: VideoDetails;
  validationErrors: ValidationErrors;
  isUploading: boolean;
  uploadProgress: number;
  isFormValid: boolean;
  onDetailsChange: (updates: Partial<VideoDetails>) => void;
  onThumbnailChange: (file: File | null) => void;
  onUpload: () => void;
}

export function VideoDetailsForm({
  videoDetails,
  validationErrors,
  isUploading,
  uploadProgress,
  isFormValid,
  onDetailsChange,
  onThumbnailChange,
  onUpload
}: VideoDetailsFormProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onThumbnailChange(file);
    if (!file && thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title *
          </label>
          <Input
            id="title"
            value={videoDetails.title}
            onChange={(e) => onDetailsChange({ title: e.target.value })}
            placeholder="Enter video title"
            className={validationErrors.title ? 'border-red-500' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-500">{validationErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={videoDetails.description}
            onChange={(e) => onDetailsChange({ description: e.target.value })}
            placeholder="Describe your video (optional)"
            rows={4}
            className={validationErrors.description ? 'border-red-500' : ''}
          />
          {validationErrors.description && (
            <p className="text-sm text-red-500">{validationErrors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="thumbnail" className="text-sm font-medium">
            Thumbnail (optional)
          </label>
          <Input
            ref={thumbnailInputRef}
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className={validationErrors.thumbnail ? 'border-red-500' : ''}
          />
          {videoDetails.thumbnail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="w-4 h-4"/>
              <CheckCircle className="w-4 h-4 text-green-600" />
              {videoDetails.thumbnail.name} ({(videoDetails.thumbnail.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
          {validationErrors.thumbnail && (
            <p className="text-sm text-red-500">{validationErrors.thumbnail}</p>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete!'}
            </p>
          </div>
        )}

        <Button
          onClick={onUpload}
          disabled={isUploading || !isFormValid}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </>
          )}
        </Button>

        {!isFormValid && (
          <p className="text-sm text-muted-foreground text-center">
            Please fix validation errors before uploading
          </p>
        )}
      </CardContent>
    </Card>
  );
}