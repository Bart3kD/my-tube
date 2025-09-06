'use client';

import { useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, Video, AlertCircle, Image } from 'lucide-react';
import { z } from 'zod';
import { ValidationErrors } from '@/types/video.types';
import { thumbnailFileSchema, videoUploadRequestSchema, videoDetailsSchema, videoFileSchema } from '@/schemas';

interface VideoUploadProps {
  onUploadComplete?: (videoUrl: string) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const { user } = useUser();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: '',
    thumbnail: null as File | null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const clearErrors = () => {
    setValidationErrors({});
  };

  const validateFile = (file: File): boolean => {
    try {
      videoFileSchema.parse({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      setValidationErrors(prev => ({
        ...prev,
        file: undefined,
        general: undefined
      }));
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fileError = error.issues[0]?.message || 'Invalid file';
        setValidationErrors(prev => ({
          ...prev,
          file: fileError
        }));
      }
      return false;
    }
  };

  const validateThumbnail = (file: File): boolean => {
    try {
      thumbnailFileSchema.parse({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      setValidationErrors(prev => ({
        ...prev,
        thumbnail: undefined
      }));
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const thumbnailError = error.issues[0]?.message || 'Invalid thumbnail';
        setValidationErrors(prev => ({
          ...prev,
          thumbnail: thumbnailError
        }));
      }
      return false;
    }
  };

  const validateVideoDetails = (): boolean => {
    try {
      videoDetailsSchema.parse({
        title: videoDetails.title,
        description: videoDetails.description
      });
      
      setValidationErrors(prev => ({
        ...prev,
        title: undefined,
        description: undefined
      }));
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        
        error.issues.forEach(err => {
          const field = err.path[0] as keyof ValidationErrors;
          if (field === 'title' || field === 'description') {
            newErrors[field] = err.message;
          }
        });
        
        setValidationErrors(prev => ({
          ...prev,
          ...newErrors
        }));
      }
      return false;
    }
  };

  // Drag and drop handlers
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    clearErrors();
    
    if (validateFile(file)) {
      setSelectedFile(file);
      // Auto-generate title from filename if title is empty
      if (!videoDetails.title.trim()) {
        setVideoDetails(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  }, [videoDetails.title]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleFileSelect(videoFile);
    } else if (files.length > 0) {
      setValidationErrors({
        file: 'Please select a video file'
      });
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle title change with validation
  const handleTitleChange = (value: string) => {
    setVideoDetails(prev => ({ ...prev, title: value }));
    
    // Clear title error when user starts typing
    if (validationErrors.title) {
      setValidationErrors(prev => ({
        ...prev,
        title: undefined
      }));
    }
  };

  // Handle description change with validation
  const handleDescriptionChange = (value: string) => {
    setVideoDetails(prev => ({ ...prev, description: value }));
    
    // Clear description error when user starts typing
    if (validationErrors.description) {
      setValidationErrors(prev => ({
        ...prev,
        description: undefined
      }));
    }
  };

  // Handle thumbnail change with validation
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setVideoDetails(prev => ({ ...prev, thumbnail: null }));
      setValidationErrors(prev => ({
        ...prev,
        thumbnail: undefined
      }));
      return;
    }

    if (validateThumbnail(file)) {
      setVideoDetails(prev => ({ ...prev, thumbnail: file }));
    } else {
      // Clear the input if validation fails
      e.target.value = '';
      setVideoDetails(prev => ({ ...prev, thumbnail: null }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    // Validate everything before upload
    const isFileValid = validateFile(selectedFile);
    const areDetailsValid = validateVideoDetails();
    let isThumbnailValid = true;
    
    if (videoDetails.thumbnail) {
      isThumbnailValid = validateThumbnail(videoDetails.thumbnail);
    }
    
    if (!isFileValid || !areDetailsValid || !isThumbnailValid) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      // Validate upload request data
      const uploadData = {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size
      };

      // Validate request data with Zod
      const validatedUploadData = videoUploadRequestSchema.parse(uploadData);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 85));
      }, 300);

      // Step 1: Get presigned URL for video
      const videoResponse = await fetch('/api/aws-upload/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(validatedUploadData)
      });

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new Error(errorData.error || 'Failed to get video upload URL');
      }

      const { uploadUrl, videoUrl, videoId } = await videoResponse.json();

      // Step 2: Upload video to S3
      const videoUploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      if (!videoUploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      setUploadProgress(90);

      // Step 3: Upload thumbnail if exists
      let thumbnailUrl = null;
      if (videoDetails.thumbnail) {
        const thumbnailResponse = await fetch('/api/aws-upload/thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            fileName: videoDetails.thumbnail.name,
            fileType: videoDetails.thumbnail.type,
            fileSize: videoDetails.thumbnail.size
          })
        });

        if (thumbnailResponse.ok) {
          const { uploadUrl: thumbUploadUrl, thumbnailUrl: thumbUrl } = await thumbnailResponse.json();
          
          const thumbUpload = await fetch(thumbUploadUrl, {
            method: 'PUT',
            body: videoDetails.thumbnail,
            headers: { 'Content-Type': videoDetails.thumbnail.type }
          });

          if (thumbUpload.ok) {
            thumbnailUrl = thumbUrl;
          }
        }
      }

      setUploadProgress(95);

      // Step 4: Save video metadata to database
      const metadataResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          title: videoDetails.title.trim(),
          description: videoDetails.description?.trim() || '',
          videoUrl,
          thumbnailUrl,
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        })
      });
      
      if (!metadataResponse.ok) {
        const dbError = await metadataResponse.json();
        console.error('Database save failed:', dbError);
        throw new Error('Failed to save video metadata');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadComplete?.(videoUrl);

      // Reset form after success
      setTimeout(() => {
        setSelectedFile(null);
        setVideoDetails({ title: '', description: '', thumbnail: null });
        setUploadProgress(0);
        clearErrors();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      
      if (error instanceof z.ZodError) {
        setValidationErrors({
          general: 'Invalid upload data: ' + error.issues[0]?.message
        });
      } else {
        setValidationErrors({
          general: error instanceof Error ? error.message : 'Upload failed. Please try again.'
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Check if form is valid for upload
  const isFormValid = selectedFile && 
    videoDetails.title.trim() && 
    !validationErrors.file && 
    !validationErrors.title && 
    !validationErrors.description &&
    !validationErrors.thumbnail;

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to upload videos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Upload Video</CardTitle>
      </CardHeader>

      {/* General Error Alert */}
      {validationErrors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationErrors.general}</AlertDescription>
        </Alert>
      )}

      {/* File Drop Zone */}
      <Card>
        <CardContent className="p-0">
          <div
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 m-6
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : selectedFile 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : validationErrors.file
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-3">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <p className="text-lg font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className={`w-12 h-12 mx-auto ${validationErrors.file ? 'text-red-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-lg font-medium">
                    Drop your video here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports MP4, MOV, AVI (max 100MB)
                  </p>
                  {validationErrors.file && (
                    <p className="text-sm text-red-500 mt-2">{validationErrors.file}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Details Form */}
      {selectedFile && (
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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter video title"
                required
                className={validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}
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
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Describe your video (optional)"
                rows={4}
                className={validationErrors.description ? 'border-red-500 focus:border-red-500' : ''}
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
                className={validationErrors.thumbnail ? 'border-red-500 focus:border-red-500' : ''}
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
              <p className="text-xs text-muted-foreground">
                Upload a custom thumbnail image (JPG, PNG, max 5MB)
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete!'}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
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

            {/* Form validation status */}
            {!isFormValid && selectedFile && (
              <p className="text-sm text-muted-foreground text-center">
                Please fix validation errors before uploading
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}