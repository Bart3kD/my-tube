import { z } from 'zod';

const maxFileSize = 100 * 1024 * 1024;

export const uploadRequestSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'Title must be less than 255 characters'),

  fileType: z
    .string()
    .min(1, 'File type is required')
    .startsWith('video/', 'File must be a video'), 

  fileSize: z
    .number()
    .min(1, 'File size is required')
    .lte(maxFileSize, 'File size must be less than 100MB')
});