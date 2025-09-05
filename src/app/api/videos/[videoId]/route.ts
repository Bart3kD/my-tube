import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await the params since they're now a Promise in Next.js 15+
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Fetch video with user info and comments
    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        isPublic: true // Only allow public videos
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            channelName: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50 // Limit comments for performance
        },
        _count: {
          select: {
            comments: true,
            videoLikes: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.video.update({
      where: { id: videoId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    // Format the response
    const formattedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl, // Now matches your schema
      duration: video.duration,
      views: video.views + 1, // Include the increment we just made
      likes: video.likes,
      createdAt: video.createdAt,
      user: video.user,
      likeCount: video._count.videoLikes
    };

    const formattedComments = video.comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        displayName: comment.user.displayName || comment.user.username || 'Anonymous',
        avatar: comment.user.avatar
      }
    }));

    return NextResponse.json({
      video: formattedVideo,
      comments: formattedComments
    });

  } catch (error) {
    console.error('Failed to fetch video:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Handle video updates (for future use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await the params
    const { videoId } = await params;
    
    // TODO: Add authentication check
    // TODO: Add video ownership check
    // TODO: Implement video updates (title, description, etc.)
    
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

// Optional: Handle video deletion (for future use)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await the params
    const { videoId } = await params;
    
    // TODO: Add authentication check
    // TODO: Add video ownership check
    // TODO: Implement video deletion from both DB and S3
    
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}