import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Stack,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  List,
  ListItem,
} from '@chakra-ui/react';

import { Session } from 'next-auth';

import {
  AddIcon, EmailIcon,
} from '@chakra-ui/icons';
import { toast } from 'react-hot-toast';
import SmallCard from './ui/smallCard';

import FriendRequestsComponent from './ui/friendRequests';
import { pusherCient } from '../lib/pusherClient';
import { convertPusherKey } from '../lib/utils';

type SidebarProps = {
  friendReqs: User[];
  friendsInfo: User[] | undefined;
  setAddPage: () => void;
  session: Session | null;
  changeToChat: (friend: User) => void;
  setFriends: React.Dispatch<React.SetStateAction<User[]>>;
};

function Sidebar({
  friendsInfo = [], friendReqs, setAddPage, changeToChat, setFriends, session,
}: SidebarProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [friendRequests, setFriendRequests] = useState<User[]>(friendReqs);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const incomingFriendRequestHandler = (data: User) => {
      console.log('Pusher called for new friend req');
      setFriendRequests((prev: User[]) => [data, ...prev]);
      toast.success(`Friend Request From: ${data.name}`);
    };

    const handleNewFriend = (data: User) => {
      console.log('Pusher called for accept');
      // remove from friendreq list if exsists
      setFriendRequests((prev: User[]) => prev.filter((f) => f.id !== data.id));
      // add to friends if id does not exsist
      setFriends((prev: User[]) => {
        if (!prev.some((f: User) => f.id === data.id)) {
          data.timestamp = Date.now();
          data.text = 'Start a conversation...';
          return [data, ...prev];
        }
        return prev;
      });
    };

    const handleFriendDecline = (data: User) => {
      // remove from friendreq list if exsists
      console.log('Pusher called for deny');
      setFriendRequests((prev: User[]) => prev.filter((f) => f.id !== data.id));
    };

    const handleNewMessage = (data: User) => {
      setFriends((prev: User[]) => {
        const index = prev.findIndex((x) => x.id === data.id);
        if (index !== -1) {
          prev.splice(index, 1);
          const temp = [data, ...prev];
          return temp;
        }
        return prev;
      });
    };

    pusherCient.subscribe(convertPusherKey(`user:${session?.user.id}:friend_options`));
    pusherCient.bind('incoming_friend_requests', incomingFriendRequestHandler);
    pusherCient.bind('friend_added', handleNewFriend);
    pusherCient.bind('denied_friend_request', handleFriendDecline);
    pusherCient.bind('new_message_friend', handleNewMessage);

    return () => {
      pusherCient.unsubscribe(convertPusherKey(`user:${session?.user.id}:friend_options`));
      pusherCient.unbind('incoming_friend_requests', incomingFriendRequestHandler);
      pusherCient.unbind('friend_added', handleNewFriend);
      pusherCient.unbind('denied_friend_request', handleFriendDecline);
      pusherCient.unbind('new_message_friend', handleNewMessage);
    };
  }, []);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFriendsInfo = friendsInfo.slice(indexOfFirstItem, indexOfLastItem);

  const renderPageNumbers = () => {
    const numPages = Math.ceil(friendsInfo.length / itemsPerPage);
    const pages = [];
    for (let i = 1; i <= numPages; i += 1) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={i === currentPage ? 'solid' : 'outline'}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>,
      );
    }
    return pages;
  };

  return (
    <Flex height="100vh" width="100%">
      <Box
        paddingTop="8"
        paddingBottom="8"
      >
        <Stack spacing="3">
          <Text fontWeight="bold">Messages</Text>
          <List spacing="1">
            {currentFriendsInfo.map((friendInfo) => (
              <ListItem
                key={friendInfo.id}
                py={2}
                onClick={() => {
                  changeToChat(friendInfo);
                }}
              >
                <SmallCard
                  friendInfo={friendInfo}
                />
              </ListItem>
            ))}
          </List>
          {friendsInfo.length > itemsPerPage && (
            <Stack direction="row" spacing="2">
              {renderPageNumbers()}
            </Stack>
          )}
          <Button
            leftIcon={<AddIcon />}
            size="sm"
            variant="outline"
            onClick={() => setAddPage()}
          >
            Add Friend
          </Button>
          <Button
            leftIcon={<EmailIcon />}
            size="sm"
            onClick={onOpen}
            variant="outline"
          >
            {`${friendRequests.length || ''} Friend Requests`}
          </Button>
        </Stack>
      </Box>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <Text fontWeight="bold" mb="4">
                {`Friend Requests: ${friendRequests.length}`}
              </Text>
              <List spacing="1">
                {friendRequests.map((user) => (
                  <FriendRequestsComponent
                    key={user.email}
                    user={user}
                    setFriendRequests={setFriendRequests}
                    setFriends={setFriends}
                  />
                ))}
              </List>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </Flex>
  );
}

export default Sidebar;
