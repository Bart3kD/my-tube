import z from "zod";

export const createVideoSchema = z.object({
  videoId: z
    .string()
    .min(1, 'Video ID is required')
    .max(50, 'Video ID must be less than 50 characters'),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),

  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .trim()
    .optional()
    .nullable(),

  videoUrl: z
    .url('Invalid video URL')
    .min(1, 'Video URL is required'),

  fileName: z
    .string()
    .max(255, 'File name must be less than 255 characters')
    .optional()
    .nullable(),

  fileSize: z
    .number()
    .positive('File size must be positive')
    .max(1024 * 1024 * 1024, 'File size must be less than 1GB')
    .optional()
    .nullable()
});

export const getVideosQuerySchema = z.object({
  userId: z
    .string()
    .min(1, 'User ID cannot be empty')
    .optional(),

  limit: z.coerce.number()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),

  offset: z
    .coerce.number()
    .min(0, 'Offset must be non-negative')
    .default(0),

  isPublic: z
    .coerce.boolean()
    .default(true)
    .optional()
});

export type CreateVideoData = z.infer<typeof createVideoSchema>;
export type GetVideosQuery = z.infer<typeof getVideosQuerySchema>;