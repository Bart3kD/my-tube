import { useRef, useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, CheckCircle } from 'lucide-react';

interface FileDropZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  validationError?: string;
}

export function FileDropZone({ selectedFile, onFileSelect, validationError }: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      onFileSelect(videoFile);
    }
  }, [onFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
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
                : validationError
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
              <Upload className={`w-12 h-12 mx-auto ${validationError ? 'text-red-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-lg font-medium">
                  Drop your video here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports MP4, MOV, AVI (max 500MB)
                </p>
                {validationError && (
                  <p className="text-sm text-red-500 mt-2">{validationError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}