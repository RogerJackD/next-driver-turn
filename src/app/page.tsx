'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Si está autenticado, ir al menú; si no, al login
    if (authUtils.isAuthenticated()) {
      router.push('/menu');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-600 to-blue-800">
      <div className="text-white text-center">
        <h1 className="text-3xl font-bold mb-2">Next Driver Turn</h1>
        <p className="text-blue-100">Redirigiendo...</p>
      </div>
    </div>
  );
}