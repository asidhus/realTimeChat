import { authOptions } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { pusherServer } from '@/lib/pusher';
import { convertPusherKey } from '@/lib/utils';
import { fetchRedis } from '../../../../lib/helpers/fetchRedis';
import db from '../../../../lib/db';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export async function POST(req: Request) {
  try {
    const { friend, text }: { friend:User, text:string } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session) return new Response('Unauthorized', { status: 401 });
    const chatIDArr = [session.user.id, friend.id].sort();

    const friendList = (await fetchRedis(
      'smembers',
      `user:${session.user.id}:friends`,
    )) as string[];
    const isFriend = friendList.includes(friend.id);

    if (!isFriend) {
      return new Response('Unauthorized', { status: 401 });
    }

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };
    const message = JSON.stringify(messageData);
    // all valid, send the message
    const chatId = chatIDArr.join('--');
    await Promise.all([
      db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: message,
      }),
      pusherServer.trigger(convertPusherKey(`user:${chatId}:messages`), 'incoming_message', { ...messageData }),
      pusherServer.trigger(convertPusherKey(`user:${friend.id}:friend_options`), 'new_message_friend', { ...session.user, text, timestamp }),
    ]);

    return new Response(message);
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
