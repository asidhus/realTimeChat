'use client';

import { useSession } from 'next-auth/react';
import NavBar from '../components/ui/navbar';

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <>
      <NavBar session={session} status={status} />
      <div>HOME</div>
    </>

  );
}
