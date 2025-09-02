import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/s3';

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    });
    
    const response = await s3Client.send(command);
    
    return NextResponse.json({ 
      success: true, 
      message: 'S3 connection successful!',
      bucketName: BUCKET_NAME,
      objectCount: response.KeyCount || 0
    });
  } catch (error) {
    console.error('S3 connection failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'S3 connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}