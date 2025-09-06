import { z } from 'zod';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

export const videoFileSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters')
    .regex(/^[^<>:"/\\|?*]+$/, 'File name contains invalid characters'),

  fileType: z
    .string()
    .min(1, 'File type is required')
    .refine((type) => 
      ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'].includes(type),
      'Unsupported video format'
    ),

  fileSize: z
    .number()
    .min(1, 'File size is required')
    .max(MAX_VIDEO_SIZE, 'Video must be less than 500MB'),
});

export const thumbnailFileSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters'),

  fileType: z
    .string()
    .min(1, 'File type is required')
    .refine((type) => 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type),
      'Unsupported image format'
    ),

  fileSize: z
    .number()
    .min(1, 'File size is required')
    .max(MAX_THUMBNAIL_SIZE, 'Thumbnail must be less than 5MB'),
});

export const videoUploadRequestSchema = z.object({
  ...videoFileSchema.shape,
  checksum: z.string().optional(),
});

export const thumbnailUploadRequestSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  ...thumbnailFileSchema.shape,
});