import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { fetchRedis } from '@/lib/helpers/fetchRedis';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import { convertPusherKey } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await req.json();
    const { id: denyFriendId } = body;
    await Promise.all([
      fetchRedis('srem', `user:${session.user.id}:incoming_friend_requests`, denyFriendId),
      fetchRedis('srem', `user:${session.user.id}:incoming_friend_requests`, denyFriendId),
      pusherServer.trigger(convertPusherKey(`user:${denyFriendId}:friend_options`), 'denied_friend_request', { ...session.user }),
    ]);

    return new Response('Friend Denied Successful');
  } catch (err) {
    return new Response('Something went wrong while adding friend', { status: 500 });
  }
}
