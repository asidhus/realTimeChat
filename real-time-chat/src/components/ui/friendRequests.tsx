import { dismissRequest, acceptRequest } from '@/lib/helpers/acceptDismissFriendRequest';
import { CloseIcon, CheckIcon } from '@chakra-ui/icons';
import {
  ListItem, Flex, Avatar, Button,
} from '@chakra-ui/react';
import { useState } from 'react';

function FriendRequests(
  {
    user,
    setFriendRequests,
    setFriends,
  }: {
    user:User;
    setFriendRequests: React.Dispatch<React.SetStateAction<User[]>>;
    setFriends: React.Dispatch<React.SetStateAction<User[]>>;
  },
) {
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  return (
    <ListItem key={user.email} border="3px solid black" borderRadius="md" bg="gray.100">
      <Flex align="center">
        <Avatar
          size="md"
          src={`${user.image}`}
          mr="2"
          ml="2"
          mt="1"
          mb="1"
        />
        {user.email}
        <Flex ml="auto" align="center">
          <Button
            aria-label="Dismiss Friend Request"
            size="sm"
            ml="2"
            mt="1"
            mb="1"
            isLoading={isLoadingButton}
            onClick={async () => {
              await dismissRequest(user, setFriendRequests, setIsLoadingButton);
            }}
          >
            <CloseIcon />
          </Button>
          <Button
            aria-label="Accept Friend Request"
            size="sm"
            ml="2"
            mr="2"
            mt="1"
            mb="1"
            isLoading={isLoadingButton}
            onClick={async () => {
              await acceptRequest(user, setFriendRequests, setIsLoadingButton, setFriends);
            }}
          >
            <CheckIcon />
          </Button>
        </Flex>
      </Flex>
    </ListItem>
  );
}

export default FriendRequests;
