'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al login automáticamente
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800">
      <div className="text-white text-center">
        <h1 className="text-3xl font-bold mb-2">Next Driver Turn</h1>
        <p className="text-blue-100">Redirigiendo...</p>
      </div>
    </div>
  );
}