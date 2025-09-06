import { z } from 'zod';
import { idSchema, paginationSchema } from './common.schema';

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
  videoId: idSchema,
  parentId: idSchema.optional(), // For replies
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
});

export const commentsQuerySchema = z.object({
  ...paginationSchema.shape,
  videoId: idSchema,
  parentId: idSchema.optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular']).default('newest'),
});