import { prisma } from './prisma';
import { CreateVideoData, GetVideosQuery, VideoWhereClause } from '@/types/video.types';

export async function createVideo(userId: string, videoData: CreateVideoData) {
  return await prisma.video.create({
    data: {
      id: videoData.videoId,
      title: videoData.title,
      description: videoData.description || null,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl || null,
      userId,
      isPublic: true,
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
}

export async function findVideoById(videoId: string, includePrivate = false) {
  return await prisma.video.findUnique({
    where: { 
      id: videoId,
      ...(includePrivate ? {} : { isPublic: true })
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
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      _count: {
        select: {
          comments: true,
          videoLikes: true
        }
      }
    }
  });
}

export async function checkVideoExists(videoId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true }
  });
  return !!video;
}

export async function getVideos(query: GetVideosQuery) {
  const { userId, limit, offset, isPublic } = query;

  const where: VideoWhereClause = {};
  
  if (userId) {
    where.userId = userId;
  }
  
  if (isPublic !== undefined) {
    where.isPublic = isPublic;
  } else {
    where.isPublic = true;
  }

  // Fetch videos and total count in parallel
  const [videos, totalCount] = await Promise.all([
    prisma.video.findMany({
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
    }),
    prisma.video.count({ where })
  ]);

  return {
    videos: videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
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
  };
}

export async function updateVideo(videoId: string, userId: string, updates: {
  title?: string;
  description?: string;
  isPublic?: boolean;
}) {
  return await prisma.video.update({
    where: { 
      id: videoId,
      userId // Ensure user owns the video
    },
    data: updates,
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
}

export async function deleteVideo(videoId: string, userId: string) {
  return await prisma.video.delete({
    where: { 
      id: videoId,
      userId // Ensure user owns the video
    }
  });
}

export async function incrementViews(videoId: string) {
  return await prisma.video.update({
    where: { id: videoId },
    data: {
      views: {
        increment: 1
      }
    }
  });
}

