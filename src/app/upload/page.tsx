'use client';

import VideoUpload from '@/components/video-upload';

export default function UploadPage() {
  const handleUploadComplete = (videoUrl: string) => {
    console.log('Upload completed:', videoUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}