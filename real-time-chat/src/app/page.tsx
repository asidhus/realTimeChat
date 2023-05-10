'use client';

import { Container, Heading, Text } from '@chakra-ui/react';
import NavBar from '../components/ui/navbar';

export default function Home() {
  return (
    <>
      <div className="wave" />
      <NavBar session={null} status="unauthenticated" />
      <Container maxW="container.lg" mt={10}>
        <Heading as="h1" size="2xl" mb={5}>
          Welcome to my AmansChat!
        </Heading>
        <Text fontSize="xl">
          AmansChat allows you to chat with users in realtime. This web app was built using
          NextJs(NodeJS, React). I used Chakra UI for easy styling components. We used Next-Auth
          to authorize Google users access via JWTs. Used upstash(Redis) to maintain and persist
          data. To complete the real time functionailty this application utilizes Pusher. Pusher
          maintain bi-directional communication channel between the client and the channel also
          known as web sockets. I hope you enjoy this personal project.
        </Text>
      </Container>
    </>

  );
}
