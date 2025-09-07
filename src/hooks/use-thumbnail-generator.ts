import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export function useThumbnailGenerator() {
  const generateThumbnails = async (
    videoFile: File, 
    timestamps: string[] = ['00:00:01', '00:00:05', '00:00:10', '00:00:15'],
    options: { width?: number; height?: number; quality?: number } = {}
  ): Promise<File[]> => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    
    // Optimized settings for web display and faster upload
    const { width = 854, height = 480, quality = 5 } = options;
    
    // Write video file to ffmpeg filesystem
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
    
    const thumbnailFiles: File[] = [];
    
    // Generate thumbnails at specified timestamps
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const outputFileName = `thumbnail_${i + 1}.jpg`;
      
      try {
        // Extract frame with optimized settings for smaller file size
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-ss', timestamp,
          '-frames:v', '1',
          '-vf', `scale=${width}:${height}`,
          '-q:v', quality.toString(),
          '-f', 'mjpeg', // More efficient JPEG encoding
          outputFileName
        ]);
        
        // Read the generated thumbnail
        const data = await ffmpeg.readFile(outputFileName);
        
        // Handle both Uint8Array and string return types
        let blobData: BlobPart;
        if (typeof data === 'string') {
          blobData = new TextEncoder().encode(data);
        } else {
          const uint8Array = data as Uint8Array;
          blobData = new Uint8Array(uint8Array).buffer;
        }
        
        const thumbnailFile = new File([blobData], `thumbnail_${timestamp.replace(/:/g, '_')}.jpg`, { 
          type: 'image/jpeg' 
        });
        
        thumbnailFiles.push(thumbnailFile);
        
        // Clean up temp file
        try {
          await ffmpeg.deleteFile(outputFileName);
        } catch (cleanupErr) {
          console.warn('Failed to cleanup temp file:', cleanupErr);
        }
      } catch (thumbErr) {
        console.warn(`Failed to generate thumbnail ${i + 1}:`, thumbErr);
      }
    }
    
    // Clean up input file
    try {
      await ffmpeg.deleteFile('input.mp4');
    } catch (cleanupErr) {
      console.warn('Failed to cleanup input file:', cleanupErr);
    }
    
    if (thumbnailFiles.length === 0) {
      throw new Error('Failed to generate any thumbnails');
    }
    
    return thumbnailFiles;
  };

  // Keep the original single thumbnail function for backward compatibility
  const generateThumbnail = async (videoFile: File): Promise<File> => {
    const thumbnails = await generateThumbnails(videoFile, ['00:00:01']);
    return thumbnails[0];
  };

  return {
    generateThumbnail,
    generateThumbnails
  };
}