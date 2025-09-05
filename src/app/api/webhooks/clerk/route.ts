import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUser, deleteUser } from '@/lib/database/user-operations';

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

function formatUserData(userData: any) {
  const { id, email_addresses, username, first_name, last_name, image_url } = userData;
  
  return {
    id,
    email: email_addresses[0]?.email_address || '',
    username: username || id,
    displayName: first_name && last_name 
      ? `${first_name} ${last_name}` 
      : first_name || username || 'Anonymous',
    avatar: image_url,
  };
}

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req);

    switch (evt.type) {
      case 'user.created':
        const newUserData = formatUserData(evt.data);
        await createUser(newUserData);
        break;

      case 'user.updated':
        const updatedUserData = formatUserData(evt.data);
        await updateUser(evt.data.id, updatedUserData);
        break;

      case 'user.deleted':
        if (evt.data.id) {
          await deleteUser(evt.data.id);
        }
        break;

      default:
        console.log(`Unhandled webhook type: ${evt.type}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('secret') || error.message.includes('headers')) {
        return new Response(error.message, { status: 400 });
      }
    }

    return new Response('Webhook processing failed', { status: 500 });
  }
}

export async function GET() {
  return new Response('Webhook endpoint is working!', { status: 200 });
}