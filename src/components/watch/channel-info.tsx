import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ChannelInfoProps {
  user: {
    displayName: string;
    channelName: string | null;
    avatar: string | null;
  };
  onSubscribe?: () => void;
}

export function ChannelInfo({ user, onSubscribe }: ChannelInfoProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {user.channelName || user.displayName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {/* TODO: Add subscriber count */}
            Subscriber count
          </p>
        </div>
      </div>
      <Button onClick={onSubscribe}>Subscribe</Button>
    </div>
  );
}