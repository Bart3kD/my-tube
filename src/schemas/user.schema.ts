import { z } from 'zod';

export const createUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  displayName: z.string().max(50, 'Display name too long').optional(),
  avatar: z.url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  displayName: z.string().max(50, 'Display name too long').optional(),
  avatar: z.url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  channelName: z.string().max(50, 'Channel name too long').optional(),
  channelDescription: z.string().max(1000, 'Channel description too long').optional(),
});