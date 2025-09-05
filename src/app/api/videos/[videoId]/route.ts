import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { findVideoById, incrementViews, deleteVideo } from '@/lib/database/video-operations';
import { handleError as baseHandleError } from '@/lib/utils';

const VALIDATION_ERROR = 'Invalid video request';
const SERVER_ERROR = 'Failed to process video';

const handleError = (error: unknown) => 
  baseHandleError(error, VALIDATION_ERROR, SERVER_ERROR);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const video = await findVideoById(videoId);
    
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    await incrementViews(videoId);

    const response = {
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views + 1,
        likes: video.likes,
        createdAt: video.createdAt,
        user: video.user,
        likeCount: video._count.videoLikes
      },
      comments: video.comments?.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          displayName: comment.user.displayName || comment.user.username || 'Anonymous',
          avatar: comment.user.avatar
        }
      })) || []
    };

    return NextResponse.json(response);

  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await params;
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    await deleteVideo(videoId, user.id);
    
    return NextResponse.json({ success: true, message: 'Video deleted successfully' });

  } catch (error) {
    return handleError(error);
  }
}