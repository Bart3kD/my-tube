// src/lib/database/comment-operations.ts
import { prisma } from '@/lib/database/prisma';
import type { CommentCreate } from '@/schemas/comment.schema';

export async function getVideoComments(videoId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        videoId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatar: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 3, // Only show first 3 replies, with "show more" option
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  } catch (error) {
    console.error('Error fetching video comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

export async function createComment(
  data: CommentCreate & { userId: string; videoId: string }
) {
  try {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        userId: data.userId,
        videoId: data.videoId,
        parentId: data.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    return comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }
}

export async function updateComment(
  commentId: string,
  content: string,
  userId: string
) {
  try {
    // First check if the comment belongs to the user
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });

    if (!existingComment) {
      throw new Error('Comment not found or unauthorized');
    }

    const comment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    return comment;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('Failed to update comment');
  }
}

export async function deleteComment(commentId: string, userId: string) {
  try {
    // First check if the comment belongs to the user
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });

    if (!existingComment) {
      throw new Error('Comment not found or unauthorized');
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
}

export async function getCommentReplies(parentId: string) {
  try {
    const replies = await prisma.comment.findMany({
      where: {
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return replies;
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    throw new Error('Failed to fetch replies');
  }
}