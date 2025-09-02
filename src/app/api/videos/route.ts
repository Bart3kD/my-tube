import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authUser = await currentUser();
    if (!authUser || !authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const userId = authUser.id;

    // Parse request body
    const { 
      videoId, 
      title, 
      description, 
      videoUrl, 
      fileName, 
      fileSize 
    } = await request.json();

    // Validate required fields
    if (!videoId || !title || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: videoId, title, videoUrl' }, 
        { status: 400 }
      );
    }

    // Validate title length
    if (title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' }, 
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be less than 200 characters' }, 
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (description && description.length > 5000) {
      return NextResponse.json(
        { error: 'Description must be less than 5000 characters' }, 
        { status: 400 }
      );
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Check if video with this ID already exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (existingVideo) {
      return NextResponse.json(
        { error: 'Video with this ID already exists' }, 
        { status: 409 }
      );
    }

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        id: videoId,
        title: title.trim(),
        description: description?.trim() || null,
        videoUrl,
        userId,
        isPublic: true, // Default to public, can be changed later
        // Additional metadata we can store
        ...(fileName && { 
          // You could add a fileName field to your schema if needed
        }),
        ...(fileSize && {
          // You could add a fileSize field to your schema if needed
        })
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
        }
      }
    });

    // Return success response with video data
    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        views: video.views,
        likes: video.likes,
        createdAt: video.createdAt,
        user: video.user
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Video creation failed:', error);
    
    // Handle Prisma errors
    if (error instanceof Error) {
      // Unique constraint violation
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Video with this ID already exists' }, 
          { status: 409 }
        );
      }
      
      // Foreign key constraint violation
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid user reference' }, 
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to save video',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where = userId ? { userId, isPublic: true } : { isPublic: true };

    // Fetch videos with user information
    const videos = await prisma.video.findMany({
      where,
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
        _count: {
          select: {
            comments: true,
            videoLikes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.min(limit, 50), // Max 50 videos per request
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.video.count({ where });

    return NextResponse.json({
      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        videoUrl: video.videoUrl,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        createdAt: video.createdAt,
        user: video.user,
        commentCount: video._count.comments,
        likeCount: video._count.videoLikes
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + videos.length < totalCount
      }
    });

  } catch (error) {
    console.error('Videos fetch failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}