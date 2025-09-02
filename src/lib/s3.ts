import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION!;

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Explicitly set for eu-north-1
  endpoint: "https://s3.eu-north-1.amazonaws.com",
  forcePathStyle: false,
  useAccelerateEndpoint: false,
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// Folder paths for organization
export const S3_FOLDERS = {
  VIDEOS_RAW: 'videos/raw/',
  VIDEOS_PROCESSED: 'videos/processed/', 
  THUMBNAILS: 'videos/thumbnails/',
  AVATARS: 'avatars/',
  BANNERS: 'banners/'
} as const;