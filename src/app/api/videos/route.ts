import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

import { createVideo, getVideos, checkVideoExists } from '@/lib/database/video-operations';
import { findUserById } from '@/lib/database/user-operations';
import { handleError as baseHandleError } from '@/lib/utils';

import { createVideoSchema, videoQuerySchema } from '@/schemas';


const VALIDATION_ERROR = 'Video validation failed';
const SERVER_ERROR = 'Failed to process video request';

const handleError = (error: unknown) => 
  baseHandleError(error, VALIDATION_ERROR, SERVER_ERROR);


export async function POST(request: NextRequest) {
  try {
    const authUser = await currentUser();

    if (!authUser || !authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createVideoSchema.parse(body);

    // Check if user exists and video doesn't already exist
    const [dbUser, videoExists] = await Promise.all([
      findUserById(authUser.id),
      checkVideoExists(validatedData.videoId)
    ]);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (videoExists) {
      return NextResponse.json({ error: 'Video already exists' }, { status: 409 });
    }

    const video = await createVideo(authUser.id, validatedData);

    return NextResponse.json({ success: true, video }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      userId: searchParams.get('userId') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      isPublic: searchParams.get('isPublic') || undefined
    };

    const validatedQuery = videoQuerySchema.parse(queryParams);

    const result = await getVideos(validatedQuery);
    return NextResponse.json(result);

  } catch (error) {
    return handleError(error);
  }
}