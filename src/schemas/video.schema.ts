import { z } from 'zod';
import { idSchema, paginationSchema } from './common.schema';

export const videoDetailsSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .nullable(),
  
  tags: z
    .array(z.string().max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
});

export const createVideoSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional().nullable(),
  videoUrl: z.url('Invalid video URL'),
  thumbnailUrl: z.url('Invalid thumbnail URL').optional().nullable(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const videoQuerySchema = z.object({
  ...paginationSchema.shape,
  search: z.string().optional(),
  userId: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'views']).default('newest'),
});