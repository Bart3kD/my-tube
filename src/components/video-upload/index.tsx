'use client';

import { useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, Video, AlertCircle } from 'lucide-react';

interface VideoUploadProps {
  onUploadComplete?: (videoUrl: string) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const { user } = useUser();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setError('');
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Validate file size (100MB limit for now)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    // Auto-generate title from filename
    if (!videoDetails.title) {
      setVideoDetails(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "")
      }));
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
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Get presigned URL
      const response = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Presigned URL error:', errorData);
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, videoUrl, videoId } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload file');

      // Save video metadata to database
      const metadataResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          title: videoDetails.title,
          description: videoDetails.description,
          videoUrl,
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        })
      });

      console.log('📨 Database save response status:', metadataResponse.status);
      
      if (!metadataResponse.ok) {
        const dbError = await metadataResponse.json();
        console.error('❌ Database save failed:', dbError);
        throw new Error('Failed to save video metadata');
      }

      console.log('✅ Video metadata saved successfully!');

      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadComplete?.(videoUrl);

      console.log('🎉 Upload completed successfully!');
      setTimeout(() => {
        setSelectedFile(null);
        setVideoDetails({ title: '', description: '' });
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    Drop your video here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports MP4, MOV, AVI (max 100MB)
                  </p>
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
                onChange={(e) => setVideoDetails(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={videoDetails.description}
                onChange={(e) => setVideoDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your video (optional)"
                rows={4}
              />
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
              disabled={isUploading || !videoDetails.title.trim()}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}