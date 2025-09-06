export interface ValidationErrors {
  file?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  general?: string;
}

export interface VideoUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  channelName: string | null;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  likes: number;
  createdAt: string;
  user: VideoUser;
  commentCount: number;
  likeCount: number;
}

export interface VideosResponse {
  videos: Video[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateVideoData {
  videoId: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
}

export interface GetVideosQuery {
  userId?: string;
  limit: number;
  offset: number;
  isPublic?: boolean;
  search?: string;
}

export interface VideoWhereClause {
  userId?: string;
  isPublic?: boolean;
  title?: {
    contains: string;
    mode: 'insensitive';
  };
};
