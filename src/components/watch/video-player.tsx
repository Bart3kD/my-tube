import { useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  video: {
    videoUrl: string;
    thumbnailUrl: string | null;
    title: string;
  };
  onPlay?: () => void;
  onPause?: () => void;
  onVolumeChange?: (muted: boolean) => void;
}

export function VideoPlayer({ video, onPlay, onPause, onVolumeChange }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCustomPoster, setShowCustomPoster] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    setShowCustomPoster(false);
    onPlay?.();
  };

  const handleCustomPlay = () => {
    videoRef.current?.play();
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className={`w-full h-full transition-opacity duration-200 ${
          showCustomPoster ? 'opacity-0' : 'opacity-100'
        }`}
        controls={!showCustomPoster} // Only show controls when playing
        onPlay={handlePlay}
        onPause={() => {
          setIsPlaying(false);
          onPause?.();
        }}
        onVolumeChange={(e) => onVolumeChange?.(
          (e.target as HTMLVideoElement).muted
        )}
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom high-quality poster overlay */}
      {showCustomPoster && video.thumbnailUrl && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handleCustomPlay}
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all shadow-lg">
              <Play className="w-8 h-8 text-black ml-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}