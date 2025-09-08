import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatViews, formatTimeAgo } from '@/utils/format';

interface VideoDescriptionProps {
  description: string;
  views: number;
  createdAt: string;
}

export function VideoDescription({ description, views, createdAt }: VideoDescriptionProps) {
  const [showFull, setShowFull] = useState(false);
  const shouldTruncate = description.length > 200;

  return (
    <Card className='py-2 shadow-none'>
      <CardContent className='px-2'>
        <div className="space-y-2">
          <div className={`text-sm ${!showFull && shouldTruncate ? 'line-clamp-3' : ''}`}>
            {description}
          </div>
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFull(!showFull)}
            >
              {showFull ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}