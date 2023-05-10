'use client';

// import { Spinner } from '@chakra-ui/react';
// import { useRouter } from 'next/navigation';

import { redirect } from 'next/navigation';

import { useSession, signOut } from 'next-auth/react';

import useSWR from 'swr';
import DashBoard from '@/components/ui/dashBoard';
import Loading from '../../components/ui/loading';

async function grabInitialFriendRequests(url: string) {
  try {
    const data = await (await fetch(url, { cache: 'no-cache' })).json();
    const friendRequests = data.incomingFriendRequests.map((x: string) => JSON.parse(x));
    const { friendsInfo } = data;
    return {
      friendRequests,
      friendsInfo,
    };
  } catch (err) {
    throw new Error('Problem fetching friend request data');
  }
}

interface FriendData {
  friendRequests: User[];
  friendsInfo: User[];
}
function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login?callbackUrl=/dashboard');
    },
  });
  const { data, isLoading, error } = useSWR<FriendData>('/api/grabInfo/friends', grabInitialFriendRequests);

  if (status === 'loading' || isLoading) {
    return <Loading />;
  }

  if (error) {
    console.log(error);
    signOut({ redirect: false });
  }
  const friendRequests = data?.friendRequests ?? [];
  const friendsInfo = data?.friendsInfo ?? [];
  return (
    <>
      {/* <NavBar session={session} status={status} /> */}
      <DashBoard friendRequests={friendRequests} friendsInfo={friendsInfo} session={session} />
    </>
  );
}

export default Dashboard;
