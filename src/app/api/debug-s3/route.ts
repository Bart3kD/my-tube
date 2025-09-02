import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    region: process.env.AWS_REGION || 'NOT_SET',
    bucketName: process.env.S3_BUCKET_NAME || 'NOT_SET',
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    expectedEndpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`
  });
}