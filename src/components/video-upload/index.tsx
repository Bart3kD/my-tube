'use client';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FileDropZone } from './file-drop-zone';
import { VideoDetailsForm } from './video-details-form';
import { useVideoUpload } from '@/hooks/use-video-upload';

interface VideoUploadProps {
  onUploadComplete?: (videoUrl: string) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const {
    selectedFile,
    videoDetails,
    validationErrors,
    isUploading,
    uploadProgress,
    isFormValid,
    isAuthenticated,
    setSelectedFile,
    updateVideoDetails,
    validateFile,
    validateThumbnail,
    uploadVideo,
    clearErrors
  } = useVideoUpload();

  const handleFileSelect = (file: File) => {
    clearErrors();
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleThumbnailChange = (file: File | null) => {
    if (file) {
      if (validateThumbnail(file)) {
        updateVideoDetails({ thumbnail: file });
      }
    } else {
      updateVideoDetails({ thumbnail: null });
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to upload videos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Upload Video</CardTitle>
      </CardHeader>

      {validationErrors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationErrors.general}</AlertDescription>
        </Alert>
      )}

      <FileDropZone
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        validationError={validationErrors.file}
      />

      {selectedFile && (
        <VideoDetailsForm
        videoFile={selectedFile}
          videoDetails={videoDetails}
          validationErrors={validationErrors}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          isFormValid={isFormValid}
          onDetailsChange={updateVideoDetails}
          onThumbnailChange={handleThumbnailChange}
          onUpload={() => uploadVideo(onUploadComplete)}
        />
      )}
    </div>
  );
}