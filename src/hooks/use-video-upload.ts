import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { videoFileSchema, thumbnailFileSchema, videoDetailsSchema, videoUploadRequestSchema } from '@/schemas';
import { ValidationErrors } from '@/types/video.types';
import { z } from 'zod';

interface VideoUploadState {
  selectedFile: File | null;
  videoDetails: {
    title: string;
    description: string;
    thumbnail: File | null;
  };
  isUploading: boolean;
  uploadProgress: number;
  validationErrors: ValidationErrors;
}

export function useVideoUpload() {
  const { user } = useUser();
  const [state, setState] = useState<VideoUploadState>({
    selectedFile: null,
    videoDetails: { title: '', description: '', thumbnail: null },
    isUploading: false,
    uploadProgress: 0,
    validationErrors: {}
  });

  const setError = useCallback((field: keyof ValidationErrors, message?: string) => {
    setState(prev => ({
      ...prev,
      validationErrors: { ...prev.validationErrors, [field]: message }
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, validationErrors: {} }));
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    try {
      videoFileSchema.parse({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      setError('file', undefined);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError('file', error.issues[0]?.message);
      }
      return false;
    }
  }, [setError]);

  const validateThumbnail = useCallback((file: File): boolean => {
    try {
      thumbnailFileSchema.parse({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      setError('thumbnail', undefined);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError('thumbnail', error.issues[0]?.message);
      }
      return false;
    }
  }, [setError]);

  const validateDetails = useCallback((): boolean => {
    try {
      videoDetailsSchema.parse({
        title: state.videoDetails.title,
        description: state.videoDetails.description
      });
      setError('title', undefined);
      setError('description', undefined);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach(err => {
          const field = err.path[0] as keyof ValidationErrors;
          if (field === 'title' || field === 'description') {
            setError(field, err.message);
          }
        });
      }
      return false;
    }
  }, [state.videoDetails, setError]);

  const setSelectedFile = useCallback((file: File | null) => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
      videoDetails: {
        ...prev.videoDetails,
        title: file && !prev.videoDetails.title.trim() 
          ? file.name.replace(/\.[^/.]+$/, "") 
          : prev.videoDetails.title
      }
    }));
  }, []);

  const updateVideoDetails = useCallback((updates: Partial<typeof state.videoDetails>) => {
    setState(prev => ({
      ...prev,
      videoDetails: { ...prev.videoDetails, ...updates }
    }));
  }, []);

  const setUploadProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, uploadProgress: progress }));
  }, []);

  const setUploading = useCallback((uploading: boolean) => {
    setState(prev => ({ ...prev, isUploading: uploading }));
  }, []);

  const uploadVideo = useCallback(async (onComplete?: (videoUrl: string) => void) => {
    if (!state.selectedFile || !user) return;

    const isFileValid = validateFile(state.selectedFile);
    const areDetailsValid = validateDetails();
    let isThumbnailValid = true;

    if (state.videoDetails.thumbnail) {
      isThumbnailValid = validateThumbnail(state.videoDetails.thumbnail);
    }

    if (!isFileValid || !areDetailsValid || !isThumbnailValid) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    let progressInterval: ReturnType<typeof setInterval> | undefined = undefined;

    try {
      const uploadData = videoUploadRequestSchema.parse({
        fileName: state.selectedFile.name,
        fileType: state.selectedFile.type,
        fileSize: state.selectedFile.size
      });

      // Simulate progress
      progressInterval = setInterval(() => {
        setState(prev => ({ 
            ...prev, 
            uploadProgress: Math.min(prev.uploadProgress + 5, 85) 
        }));
      }, 300);

      // Step 1: Get presigned URL for video
      const videoResponse = await fetch('/api/aws-upload/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(uploadData)
      });

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new Error(errorData.error || 'Failed to get video upload URL');
      }

      const { uploadUrl, videoUrl, videoId } = await videoResponse.json();

      // Step 2: Upload video to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: state.selectedFile,
        headers: { 'Content-Type': state.selectedFile.type }
      });

      clearInterval(progressInterval);
      setUploadProgress(90);

      // Step 3: Upload thumbnail if exists
      let thumbnailUrl = null;
      if (state.videoDetails.thumbnail) {
        const thumbnailResponse = await fetch('/api/aws-upload/thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            fileName: state.videoDetails.thumbnail.name,
            fileType: state.videoDetails.thumbnail.type,
            fileSize: state.videoDetails.thumbnail.size
          })
        });

        if (thumbnailResponse.ok) {
          const { uploadUrl: thumbUploadUrl, thumbnailUrl: thumbUrl } = await thumbnailResponse.json();
          await fetch(thumbUploadUrl, {
            method: 'PUT',
            body: state.videoDetails.thumbnail,
            headers: { 'Content-Type': state.videoDetails.thumbnail.type }
          });
          thumbnailUrl = thumbUrl;
        }
      }

      setUploadProgress(95);

      // Step 4: Save to database
      const metadataResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          title: state.videoDetails.title.trim(),
          description: state.videoDetails.description?.trim() || '',
          videoUrl,
          thumbnailUrl,
          fileName: state.selectedFile.name,
          fileSize: state.selectedFile.size
        })
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to save video metadata');
      }

      setUploadProgress(100);
      onComplete?.(videoUrl);

      // Reset form
      setTimeout(() => {
        setState({
          selectedFile: null,
          videoDetails: { title: '', description: '', thumbnail: null },
          isUploading: false,
          uploadProgress: 0,
          validationErrors: {}
        });
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      clearInterval(progressInterval);
      setError('general', error instanceof Error ? error.message : 'Upload failed');
      setUploading(false);
    }
  }, [state, user, validateFile, validateDetails, validateThumbnail, setUploading, setUploadProgress, clearErrors, setError]);

const isFormValid = !!(
  state.selectedFile && 
  state.videoDetails.title.trim() && 
  !state.validationErrors.file && 
  !state.validationErrors.title && 
  !state.validationErrors.description &&
  !state.validationErrors.thumbnail
);

  return {
    ...state,
    validateFile,
    validateThumbnail,
    setSelectedFile,
    updateVideoDetails,
    uploadVideo,
    clearErrors,
    isFormValid,
    isAuthenticated: !!user
  };
}