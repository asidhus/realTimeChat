'use client';

/* eslint-disable react/jsx-props-no-spreading */
import {
  Flex,
  Box,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { SVGProps, useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const UseColorModeValue = useColorModeValue;

// interface LoginProps {

// }

// export function checkEnvVariables(...args: string[]): true | Error {
//   for (let arg of args) {
//     if (!process.env[arg]) {
//       throw new Error(`missing env variable: ${arg}`);
//     }
//   }
//   return true;
// }

function GoogleIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" {...props}>
      <path
        d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
        fill="#4285f4"
      />
      <path
        d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
        fill="#34a853"
      />
      <path
        d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
        fill="#fbbc04"
      />
      <path
        d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
        fill="#ea4335"
      />
    </svg>
  );
}

function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signIn('google', { redirect: false });
    } catch (err) {
      toast.error('Error while logging in');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={UseColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl" textAlign="center">
            Sign in to your account
            using Google
          </Heading>
        </Stack>
        <Box
          rounded="lg"
          bg={UseColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
        >
          <Stack spacing={4}>
            <Stack spacing={10}>
              <Button
                onClick={loginWithGoogle}
                isLoading={isLoading}
                bg="blue.400"
                color="white"
                _hover={{
                  bg: 'red.500',
                }}
              >
                <Icon as={GoogleIcon} w={6} h={6} mr={2} />
                Sign in with Google
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
export default Login;
