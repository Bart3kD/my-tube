import { z } from 'zod';

export const idSchema = z.string().cuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  offset: z.coerce.number().min(0).default(0),
});

export const timestampSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});