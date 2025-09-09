// src/schemas/comment.schema.ts
import { z } from 'zod';

export const commentCreateSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .trim(),
  parentId: z.string().optional(), // For replies
});

export const commentUpdateSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .trim(),
});

export const commentQuerySchema = z.object({
  parentId: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type CommentCreate = z.infer<typeof commentCreateSchema>;
export type CommentUpdate = z.infer<typeof commentUpdateSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;