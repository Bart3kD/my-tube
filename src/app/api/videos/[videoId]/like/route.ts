// src/app/api/videos/[videoId]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';

const likeSchema = z.object({
  type: z.enum(['LIKE', 'DISLIKE']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { videoId } = params;
    const body = await request.json();
    
    // Validate request body
    const { type } = likeSchema.parse(body);

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user already liked/disliked this video
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingLike) {
      if (existingLike.type === type) {
        // Remove the like/dislike if clicking the same button
        await prisma.like.delete({
          where: { id: existingLike.id },
        });
        
        return NextResponse.json({ 
          action: 'removed', 
          type,
          message: `${type.toLowerCase()} removed` 
        });
      } else {
        // Update the like/dislike type
        await prisma.like.update({
          where: { id: existingLike.id },
          data: { type },
        });
        
        return NextResponse.json({ 
          action: 'updated', 
          type,
          message: `Changed to ${type.toLowerCase()}` 
        });
      }
    } else {
      // Create new like/dislike
      await prisma.like.create({
        data: {
          type,
          userId,
          videoId,
        },
      });
      
      return NextResponse.json({ 
        action: 'created', 
        type,
        message: `${type.toLowerCase()} added` 
      });
    }
  } catch (error) {
    console.error('Error handling like/dislike:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process like/dislike' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isLiked: false, isDisliked: false });
    }

    const { videoId } = params;

    const userLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    return NextResponse.json({
      isLiked: userLike?.type === 'LIKE',
      isDisliked: userLike?.type === 'DISLIKE',
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    );
  }
}