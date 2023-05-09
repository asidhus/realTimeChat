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
    const { Email: friendEmail } = body;

    const friendId = await fetchRedis('get', `user:email:${friendEmail}`);
    // check if friend exsists
    if (!friendId) {
      return new Response(`This user: ${friendEmail} does not exsist`, { status: 400 });
    }

    // check if friend is not current user
    if (friendId === session.user.id) {
      return new Response('You cannot add yourself', { status: 400 });
    }

    // check if friend is already in the friend request
    const checkIfAdded = await fetchRedis('sismember', `user:${friendId}:incoming_friend_requests`, session.user.id);
    if (checkIfAdded) {
      return new Response(`You already have a pending request for: ${friendEmail}`, { status: 400 });
    }

    // check if friend is already a friend
    const checkIfFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, friendId);
    if (checkIfFriends) {
      return new Response(`You are already friends with: ${friendEmail}`, { status: 400 });
    }
    await Promise.all([
      fetchRedis('sadd', `user:${friendId}:incoming_friend_requests`, session.user.id),
      pusherServer.trigger(convertPusherKey(`user:${friendId}:friend_options`), 'incoming_friend_requests', { ...session.user }),
    ]);

    return new Response('Successful Add', { status: 200 });
  } catch (err) {
    return new Response('Something went wrong while adding friend', { status: 500 });
  }
}
