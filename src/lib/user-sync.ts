import { prisma } from '@/lib/prisma'
import type { User as ClerkUser } from '@clerk/nextjs/server'

export async function syncUserWithDatabase(clerkUser: ClerkUser) {
  const userData = {
    id: clerkUser.id, // Use Clerk's user ID as primary key
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    username: clerkUser.username || clerkUser.id,
    displayName: clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}` 
      : clerkUser.firstName || clerkUser.username || 'Anonymous',
    avatar: clerkUser.imageUrl,
  }

  // Create or update user in your database
  const user = await prisma.user.upsert({
    where: { id: clerkUser.id },
    create: userData,
    update: userData,
  })

  return user
}