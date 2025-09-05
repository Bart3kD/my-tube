import { prisma } from './prisma';
import { User } from '@/types/user.types';

export async function findUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      channelName: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function createUser(userData: {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
}) {
  return await prisma.user.upsert({
    where: { id: userData.id },
    create: userData,
    update: {
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName,
      avatar: userData.avatar,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      channelName: true
    }
  });
}

export async function updateUser(userId: string, userData: Partial<User>) {
  return await prisma.user.update({
    where: { id: userId },
    data: userData,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      channelName: true
    }
  });
}

export async function deleteUser(userId: string) {
  return await prisma.user.delete({
    where: { id: userId }
  });
}