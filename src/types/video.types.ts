import { z } from 'zod';

const maxFileSize = 100 * 1024 * 1024;


export const videoFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number()
    .min(1, 'File size is required')
    .max(maxFileSize, 'Video must be less than 100MB'),
  type: z.string().refine(
    (type) => type.startsWith('video/'),
    'File must be a video'
  )
});

export const thumbnailFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number()
    .min(1, 'File size is required')
    .max(5 * 1024 * 1024, 'Thumbnail must be less than 5MB'),
  type: z.string().refine(
    (type) => type.startsWith('image/'),
    'Thumbnail must be an image file'
  )
});

export const videoDetailsSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
});

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().refine(
    (type) => type.startsWith('video/'),
    'File must be a video'
  ),
  fileSize: z.number()
    .min(1, 'File size is required')
    .max(maxFileSize, 'File must be less than 100MB')
});

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
}

export interface VideoWhereClause {
  userId?: string;
  isPublic?: boolean;
};
