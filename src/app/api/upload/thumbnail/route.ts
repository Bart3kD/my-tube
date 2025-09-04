import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, S3_FOLDERS } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId, fileName, fileType, fileSize } = await request.json();

    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Thumbnail must be less than 5MB' }, { status: 400 });
    }

    const fileExtension = fileName.split('.').pop();
    const thumbnailFileName = `${videoId}.${fileExtension}`;
    const s3Key = `${S3_FOLDERS.THUMBNAILS}${thumbnailFileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        'uploaded-by': user.id,
        'video-id': videoId,
        'original-name': fileName
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 600
    });

    const thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({ uploadUrl, thumbnailUrl, s3Key });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate thumbnail upload URL' }, { status: 500 });
  }
}