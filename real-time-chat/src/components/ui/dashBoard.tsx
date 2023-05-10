import { Flex, Box } from '@chakra-ui/react';
import { useState } from 'react';
import { Session } from 'next-auth';
import Sidebar from '../sidebar';
import AddFriend from './addFriend';
import Chat from './chat';

export default function Dashboard({ friendRequests = [], friendsInfo, session }:
{
  friendRequests: User[] | undefined;
  friendsInfo: User[] | undefined;
  session: Session;
}) {
  const [addPage, setAddPage] = useState(true);
  const [currentUser, setCurrentFriend] = useState<User | null>(friendRequests[0] || null);
  const [friends, setFriends] = useState(friendsInfo!);
  const changeToChat = (friend: User) => {
    const check = friends?.find((f) => f.id === friend.id);
    const check2 = currentUser?.id !== friend.id;
    if (check && (check2 || addPage)) {
      setCurrentFriend(friend);
      setAddPage(false);
    }
  };
  const changeToAdd = () => {
    setCurrentFriend(null);
    setAddPage(true);
  };

  return (
    <Flex>
      <Box flex={1} borderRadius="5px" p={4} border="1px solid gray">
        <Sidebar
          friendsInfo={friends}
          session={session}
          friendReqs={friendRequests}
          setAddPage={changeToAdd}
          changeToChat={changeToChat}
          setFriends={setFriends}
          currentFriend={currentUser}
        />
      </Box>
      <Box flex={4} border="1px solid gray" p={4} borderRadius="5px">
        {addPage
          ? <AddFriend />
          : <Chat friend={currentUser} session={session} setFriends={setFriends} />}
      </Box>
    </Flex>
  );
}
