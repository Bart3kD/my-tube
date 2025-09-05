// api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database/prisma';

async function verifyWebhook(req: Request): Promise<WebhookEvent> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Webhook secret not configured');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Missing svix headers');
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  return wh.verify(body, {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  }) as WebhookEvent;
}

function formatDisplayName(first_name: string | null, last_name: string | null, username: string | null, id: string) {
  if (first_name && last_name) {
    return `${first_name} ${last_name}`;
  }
  return first_name || username || 'Anonymous';
}

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

      const userData = {
        id,
        email: email_addresses[0]?.email_address || '',
        username: username || id,
        displayName: formatDisplayName(first_name, last_name, username, id),
        avatar: image_url,
      };

      await prisma.user.upsert({
        where: { id },
        create: userData,
        update: userData,
      });
    }

    if (evt.type === 'user.deleted') {
      await prisma.user.delete({
        where: { id: evt.data.id },
      });
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('secret') || error.message.includes('headers')) {
        return new Response(error.message, { status: 400 });
      }
    }

    return new Response('Database error', { status: 500 });
  }
}

export async function GET() {
  return new Response('Webhook endpoint is working!', { status: 200 });
}