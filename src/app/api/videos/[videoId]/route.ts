// src/app/api/videos/[videoId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true,
            channelName: true,
            subscribersCount: true,
          },
        },
        _count: {
          select: {
            videoLikes: {
              where: { type: 'LIKE' }
            }
          }
        }
      },
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
      data: { views: { increment: 1 } },
    });

    // Transform the data to match expected structure
    const videoResponse = {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      views: video.views + 1, // Include the incremented view
      likeCount: video._count.videoLikes,
      createdAt: video.createdAt.toISOString(),
      user: {
        id: video.user.id,
        displayName: video.user.displayName || video.user.username,
        avatar: video.user.avatar,
        username: video.user.username,
        channelName: video.user.channelName || video.user.displayName || video.user.username,
        subscribersCount: video.user.subscribersCount || 0,
      },
    };

    return NextResponse.json(videoResponse);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    const body = await request.json();

    const video = await prisma.video.update({
      where: { id: videoId },
      data: body,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true,
            channelName: true,
            subscribersCount: true,
          },
        },
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}