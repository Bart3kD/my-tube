import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, S3_FOLDERS } from '@/lib/s3';

import { uploadThumbnailRequestSchema } from '@/types/upload/thumbnail.types';

import { handleError as baseHandleError } from '@/lib/utils';


const VALIDATION_ERROR = 'Thumbnail validation failed';
const SERVER_ERROR = 'Failed to generate upload URL for thumbnail';

const handleError = (error: unknown) => 
  baseHandleError(error, VALIDATION_ERROR, SERVER_ERROR);


export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { videoId, fileName, fileType, fileSize } = body;

    const validatedData = uploadThumbnailRequestSchema.parse({ fileName, fileType, fileSize });

    const fileExtension = validatedData.fileName.split('.').pop();
    const thumbnailFileName = `${videoId}.${fileExtension}`;
    const s3Key = `${S3_FOLDERS.THUMBNAILS}${thumbnailFileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: validatedData.fileType,
      ContentLength: validatedData.fileSize,
      Metadata: {
        'uploaded-by': user.id,
        'video-id': videoId,
        'original-name': validatedData.fileName
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 600
    });

    const thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
       uploadUrl,
       thumbnailUrl,
       s3Key ,
       expiresIn: 600
    });

  } catch (error) {
      handleError(error)
    }
  }