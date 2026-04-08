'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readSession } from './lib/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = readSession();
    if (!session) {
      router.replace('/auth/login');
      return;
    }

    if (session.role === 'system_admin') {
      router.replace('/administrator/dashboard');
      return;
    }

    router.replace('/dashboard');
  }, [router]);

  return <main className="centered">loading the Nafasi</main>;
}
