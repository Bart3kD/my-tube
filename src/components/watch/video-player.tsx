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
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        className="w-full h-full"
        controls
        poster={video.thumbnailUrl || undefined}
        onPlay={onPlay}
        onPause={onPause}
        onVolumeChange={(e) => onVolumeChange?.(
          (e.target as HTMLVideoElement).muted
        )}
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}