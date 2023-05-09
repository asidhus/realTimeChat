'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

export default function Providers({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <CacheProvider>
      <ChakraProvider>
        <SessionProvider>
          <Toaster position="bottom-center" reverseOrder={false} />
          {children}
        </SessionProvider>
      </ChakraProvider>
    </CacheProvider>

  );
}
