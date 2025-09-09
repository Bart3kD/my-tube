// src/types/comment.types.ts
export interface CommentUser {
  id: string;
  displayName: string;
  avatar: string | null;
  username: string;
}

export interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  user: CommentUser;
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}

export interface CommentApiResponse {
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
}