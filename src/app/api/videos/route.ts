import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CreateVideoData, createVideoSchema, GetVideosQuery, getVideosQuerySchema } from '@/types/videos.api.types';

type VideoWhereClause = {
  userId?: string;
  isPublic?: boolean;
};

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

    // Parse and validate request body
    const body = await request.json();
    
    let validatedData: CreateVideoData;
    try {
      validatedData = createVideoSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }, 
          { status: 400 }
        );
      }
      throw error;
    }

    const { 
      videoId, 
      title, 
      description, 
      videoUrl,
    } = validatedData;

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
        title,
        description: description || null,
        videoUrl,
        userId,
        isPublic: true, // Default to public, can be changed later
        // Add fileName and fileSize if your schema supports them
        // fileName,
        // fileSize,
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
    
    // Extract and validate query parameters
    const queryParams = {
      userId: searchParams.get('userId') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      isPublic: searchParams.get('isPublic') || undefined
    };

    let validatedQuery: GetVideosQuery;
    try {
      validatedQuery = getVideosQuerySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Invalid query parameters',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }, 
          { status: 400 }
        );
      }
      throw error;
    }

    const { userId, limit, offset, isPublic } = validatedQuery;

    // Build where clause
    const where: VideoWhereClause = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    } else {
      // Default to public videos only
      where.isPublic = true;
    }

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
      take: limit,
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