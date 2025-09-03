import { z } from 'zod';

const maxFileSize = 100 * 1024 * 1024;

export const videoFileSchema = z.object({
  name: z
    .string()
    .min(1, 'File name is required'),

  size: z
    .number()
    .min(1, 'File cannot be empty')
    .max(maxFileSize, 'File size must be less than 100MB'),

  type: z
    .string()
    .min(1, 'File type is required')
    .startsWith('video/', 'Please select a video file')
});

export const videoDetailsSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
});

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive()
});

export interface ValidationErrors {
  file?: string;
  title?: string;
  description?: string;
  general?: string;
}