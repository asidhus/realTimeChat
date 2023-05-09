import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { fetchRedis } from '../../../../lib/helpers/fetchRedis';

export async function POST(req: Request) {
  try {
    const friend = await req.json();
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

    // all valid, send the message
    const chatId = chatIDArr.join('--');

    const messages = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1);
    return new Response(JSON.stringify(messages));
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Internal Server Error', { status: 500 });
  }
}
