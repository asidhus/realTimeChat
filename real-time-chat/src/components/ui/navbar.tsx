'use client';

import { ReactNode } from 'react';
import { signOut } from 'next-auth/react';
import { MdMessage } from 'react-icons/md';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { Link } from '@chakra-ui/next-js';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Session } from 'next-auth';

const Links = [{ key: 'Dashboard', link: '/dashboard' }];

function NavLink({ children, link, loggedIn }
: { children: ReactNode, link: string, loggedIn: boolean }) {
  return (
    <Link
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      href={loggedIn ? link : '/login'}
    >
      {children}
    </Link>
  );
}

function signInorSignOut(loggedIn: boolean, session: Session | null) {
  if (loggedIn) {
    return (
      <>
        <Button
          as="a"
          onClick={() => {
            signOut({ redirect: false });
          }}
          display={{ base: 'none', md: 'inline-flex' }}
          fontSize="sm"
          fontWeight={600}
          color="white"
          bg="red.500"
          _hover={{
            bg: 'blue.500',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </Button>
        <Avatar
          size="sm"
          src={`${session?.user.image}`}
        />
      </>

    );
  }

  return (
    <Button
      as="a"
      display={{ base: 'none', md: 'inline-flex' }}
      fontSize="sm"
      fontWeight={600}
      color="white"
      bg="blue.500"
      _hover={{
        bg: 'red.500',
        cursor: 'pointer',
      }}
      href="/login"
    >
      Sign In
    </Button>
  );
}

export default function NavBar({ session, status }:{ session: Session | null, status: 'authenticated' | 'loading' | 'unauthenticated' }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  let loggedIn = false;
  if (status === 'authenticated') {
    loggedIn = true;
  }
  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Icon size="lg" as={MdMessage} />
          <HStack
            as="nav"
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {Links.map((link) => (
              <NavLink key={link.key} link={link.link} loggedIn={loggedIn}>{link.key}</NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Stack
            flex={{ base: 1, md: 0 }}
            justify="flex-end"
            direction="row"
            spacing={6}
          >
            {
                signInorSignOut(loggedIn, session)
            }
          </Stack>

        </Flex>

      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.key} link={link.link} loggedIn={loggedIn}>{link.key}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
