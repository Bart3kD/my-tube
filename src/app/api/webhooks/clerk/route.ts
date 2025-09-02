import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Skip Clerk authentication for webhooks
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error - missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  // console.log('Webhook received:', evt.type)

  try {
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data

      await prisma.user.upsert({
        where: { id },
        create: {
          id,
          email: email_addresses[0]?.email_address || '',
          username: username || id,
          displayName: first_name && last_name ? `${first_name} ${last_name}` : first_name || username || 'Anonymous',
          avatar: image_url,
        },
        update: {
          email: email_addresses[0]?.email_address || '',
          username: username || id,
          displayName: first_name && last_name ? `${first_name} ${last_name}` : first_name || username || 'Anonymous',
          avatar: image_url,
        },
      })
      
      // console.log(`User ${evt.type}: ${id}`)
    }

    if (evt.type === 'user.deleted') {
      await prisma.user.delete({
        where: { id: evt.data.id },
      })
      // console.log(`User deleted: ${evt.data.id}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return new Response('Database error', { status: 500 })
  }
}

// Add GET method for testing
export async function GET() {
  return new Response('Webhook endpoint is working!', { status: 200 })
}