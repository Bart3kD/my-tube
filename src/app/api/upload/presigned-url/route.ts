import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, S3_FOLDERS } from '@/lib/s3';
import { generateId } from '@/lib/utils';
import { uploadRequestSchema } from '@/types/upload.types';
import z from 'zod';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    const validatedData = uploadRequestSchema.parse({ fileName, fileType, fileSize });

    const videoId = generateId();
    const fileExtension = validatedData.fileName.split('.').pop();
    const uniqueFileName = `${videoId}.${fileExtension}`;
    const s3Key = `${S3_FOLDERS.VIDEOS_RAW}${uniqueFileName}`;
    
    // Create S3 upload command
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: validatedData.fileType,
      ContentLength: validatedData.fileSize,
      Metadata: {
        'uploaded-by': userId,
        'original-name': validatedData.fileName,
        'video-id': videoId
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 600
    });

    const videoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      uploadUrl,
      videoUrl,
      videoId,
      s3Key,
      expiresIn: 600
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Presigned URL generation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}