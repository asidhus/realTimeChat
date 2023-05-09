import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { fetchRedis } from '@/lib/helpers/fetchRedis';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import { convertPusherKey } from '@/lib/utils';
import { nanoid } from 'nanoid';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await req.json();
    const { id: acceptFriendId } = body;

    // verify both users are not already friends
    const checkIfFriends = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      acceptFriendId,
    );

    if (checkIfFriends) {
      return new Response('Already friends', { status: 400 });
    }

    const checkFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      acceptFriendId,
    );

    if (!checkFriendRequest) {
      return new Response('No friend request', { status: 400 });
    }

    const [userStringObj, friendStringObj] = (await Promise.all([
      fetchRedis('get', `user:${session.user.id}`),
      fetchRedis('get', `user:${acceptFriendId}`),
    ])) as [string, string];

    const user = JSON.parse(userStringObj) as User;
    const friend = JSON.parse(friendStringObj) as User;

    if (!user || !friend) {
      return new Response('Friend or User does not exsist', { status: 400 });
    }
    const chatId = [session.user.id, acceptFriendId].sort().join('--');
    const timestamp = Date.now();
    const messageData = {
      id: nanoid(),
      senderId: session.user.id,
      text: 'Start a conversation...',
      timestamp,
      first: true,
    };
    const message = JSON.stringify(messageData);
    await Promise.all([
      fetchRedis('sadd', `user:${session.user.id}:friends`, acceptFriendId),
      fetchRedis('sadd', `user:${acceptFriendId}:friends`, session.user.id),
      fetchRedis('srem', `user:${session.user.id}:incoming_friend_requests`, acceptFriendId),
      fetchRedis('srem', `user:${acceptFriendId}:incoming_friend_requests`, session.user.id),
      pusherServer.trigger(convertPusherKey(`user:${acceptFriendId}:friend_options`), 'friend_added', { ...session.user }),
      db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: message,
      }),
    ]);

    return new Response('Successful Accept');
  } catch (err) {
    return new Response('Something went wrong while adding friend', { status: 500 });
  }
}
