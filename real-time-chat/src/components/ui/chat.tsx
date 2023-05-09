import {
  useState, useEffect, useRef,
} from 'react';
import {
  Flex, Box, Text, Avatar,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import useSWR from 'swr';
import { Session } from 'next-auth';
import { pusherCient } from '@/lib/pusherClient';
import { convertPusherKey } from '@/lib/utils';
import Loading from './loading';
import addMessage from './addMessage';

type Message = {
  id: number;
  text: string;
  senderId: string;
  timestamp: number;
  first? : boolean
};

async function grabMessages([url, friend]: [string, User]) {
  try {
    const data = await fetch(url, {
      body: JSON.stringify(friend),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const messagesString = await data.json();
    const messages = messagesString.map((x: string) => JSON.parse(x));
    return messages;
  } catch (err) {
    throw new Error('ERROR WHILE GRABBING MESSAGES');
  }
}

function MessageBubble({
  text, sender, timestamp, isSelf, avatar,
}: {
  text: string;
  sender: string;
  timestamp: string;
  isSelf: boolean,
  avatar: string | null | undefined }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={isSelf ? 'flex-end' : 'flex-start'}
      textAlign={isSelf ? 'right' : 'left'}
      mt={2}
    >
      <Flex alignItems="center">
        {!isSelf && <Avatar size="sm" mr={2} src={`${avatar}`} />}
        <Text fontWeight="bold" fontSize="xs">
          {isSelf ? 'You' : sender}
        </Text>
        {isSelf && <Avatar size="sm" ml={2} src={`${avatar}`} />}
      </Flex>
      <Box
        minW="calc(40vh)"
        maxW="calc(40vh)"
        bg={isSelf ? 'blue.500' : 'gray.500'}
        p={2}
        borderRadius={15}
        mt={2}
      >
        <Text fontSize="lg" fontWeight="500" color="white" textAlign="left">
          {text}
        </Text>
        <Text fontSize="xs" color="black">
          {timestamp}
        </Text>
      </Box>
    </Box>
  );
}

function MessageList({ messages, session, friend }:
{ messages: Message[]; session: Session; friend: User | null; }) {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollDownRef.current?.scrollIntoView({ behavior: 'smooth' }); // scroll to the bottom of the message list when new messages are added
  }, [messages]);

  return (
    <Box
      overflowY="scroll"
      maxHeight="calc(100vh - 25vh)"
      scrollBehavior="smooth"
      minHeight="calc(100vh - 25vh)"
      flexDirection="column-reverse"
    >
      {messages.length === 0 ? (
        <Text textAlign="center" color="gray.500" py={4}>
          No messages yet.
        </Text>
      ) : (
        messages.map((message, index) => (
          <div key={message.id} ref={index === (messages.length - 1) ? scrollDownRef : null}>
            <MessageBubble
              key={message.id}
              text={message.text}
              sender="Them"
              timestamp={format(message.timestamp, 'HH:mm')}
              isSelf={message.senderId === session.user.id}
              avatar={message.senderId === session.user.id ? session.user.image : friend?.image}
            />
          </div>
        ))
      )}
    </Box>
  );
}

function Chat({ friend, session, setFriends }:{
  friend: User | null;
  session: Session;
  setFriends: React.Dispatch<React.SetStateAction<User[]>>; }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { data, isLoading, error } = useSWR(['/api/messages/grabMessages', friend], grabMessages);
  useEffect(() => {
    if (!isLoading && data) {
      const temp = data.filter((message: Message) => message.first !== true);
      setMessages(temp);
    }
  }, [isLoading, data]);

  useEffect(() => {
    const incomingMessageHandler = (message: Message) => {
      if (session.user.id !== message.senderId && message.senderId === friend?.id) {
        setMessages((prev: Message[]) => [...prev, message]);
      }
    };
    const chatIDArr = [session.user.id, friend?.id].sort();
    const chatId = chatIDArr.join('--');
    pusherCient.subscribe(convertPusherKey(`user:${chatId}:messages`));
    pusherCient.bind('incoming_message', incomingMessageHandler);
    return () => {
      pusherCient.unsubscribe(convertPusherKey(`user:${chatId}:messages`));
      pusherCient.unbind('incoming_message', incomingMessageHandler);
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  } if (error) {
    return <div>There Was An Error</div>;
  }
  return (
    <Box border="1px solid gray" borderRadius={8} p={4}>
      <MessageList messages={messages} session={session} friend={friend} />
      {addMessage(friend, setMessages, setFriends)}
    </Box>
  );
}

export default Chat;
