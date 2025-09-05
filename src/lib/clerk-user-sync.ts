import { prisma } from '@/lib/database/prisma'
import type { User as ClerkUser } from '@clerk/nextjs/server'

export async function syncUserWithDatabase(clerkUser: ClerkUser) {
  const userData = {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    username: clerkUser.username || clerkUser.id,
    displayName: clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}` 
      : clerkUser.firstName || clerkUser.username || 'Anonymous',
    avatar: clerkUser.imageUrl,
  }

  // create or update
  const user = await prisma.user.upsert({
    where: { id: clerkUser.id },
    create: userData,
    update: userData,
  })

  return user
}