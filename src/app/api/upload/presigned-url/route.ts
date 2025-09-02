import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, S3_FOLDERS } from '@/lib/s3';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  // console.log('🚀 POST request received at /api/upload/presigned-url');
  // console.log('📋 Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check authentication
    const user = await currentUser();
    // console.log('👤 Current user result:', user ? { id: user.id, email: user.emailAddresses?.[0]?.emailAddress } : 'null');
    
    if (!user || !user.id) {
      // console.log('❌ No user found or no user ID');
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const userId = user.id;
    // console.log('✅ User authenticated:', userId);

    // Parse request body
    const body = await request.json();
    // console.log('📦 Request body:', body);
    
    const { fileName, fileType, fileSize } = body;

    // Validate input
    if (!fileName || !fileType || !fileSize) {
      // console.log('❌ Missing fields:', { fileName, fileType, fileSize });
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, fileSize' }, 
        { status: 400 }
      );
    }

    // console.log('✅ All fields present:', { fileName, fileType, fileSize });

    // Validate file type
    if (!fileType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' }, 
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' }, 
        { status: 400 }
      );
    }

    // Generate unique video ID and file key
    const videoId = generateId();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${videoId}.${fileExtension}`;
    const s3Key = `${S3_FOLDERS.VIDEOS_RAW}${uniqueFileName}`;

    // Create S3 upload command
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        'uploaded-by': userId,
        'original-name': fileName,
        'video-id': videoId
      }
    });

    // Generate presigned URL (expires in 10 minutes)
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 600 // 10 minutes
    });

    // Construct the final video URL (for viewing)
    const videoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      uploadUrl,
      videoUrl,
      videoId,
      s3Key,
      expiresIn: 600
    });

  } catch (error) {
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

// Add GET method for testing
export async function GET() {
  // console.log('🔍 GET request to presigned-url endpoint');
  
  try {
    const user = await currentUser();
    return NextResponse.json({
      message: 'Presigned URL endpoint is working',
      authenticated: !!user,
      userId: user?.id || null
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Presigned URL endpoint error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}