import { getServerSession } from 'next-auth';
import { fetchRedis } from '@/lib/helpers/fetchRedis';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    const incomingFriendIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[];
    const friends = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[];

    const friendsInfo = await Promise.all(
      friends.map(async (friend) => {
        const friendInfo = await fetchRedis('get', `user:${friend}`) as string;
        const chatId = [session.user.id, friend].sort().join('--');
        let temp = await fetchRedis('zrange', `chat:${chatId}:messages`, -1, -1);
        temp = JSON.parse(temp[0]);
        const temp2 = JSON.parse(friendInfo);
        return { ...temp2, timestamp: temp.timestamp, text: temp.text };
      }),

    );

    const incomingFriendRequests = await Promise.all(
      incomingFriendIds.map(async (incomingFriendId) => {
        const sender = await fetchRedis('get', `user:${incomingFriendId}`) as User;
        return sender;
      }),
    ) as User[];

    friendsInfo.sort((a, b) => b.timestamp - a.timestamp);
    return new Response(JSON.stringify({ incomingFriendRequests, friendsInfo }));
  } catch (err) {
    return new Response('Something went wrong while adding friend', { status: 500 });
  }
}
