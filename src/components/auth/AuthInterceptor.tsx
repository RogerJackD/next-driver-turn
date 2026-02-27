'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { setupFetchInterceptor } from '@/utils/authInterceptor';

/**
 * Componente invisible que intercepta globalmente los errores 401.
 * Cuando el token JWT expira, cierra sesión automáticamente y redirige al login.
 * Debe incluirse en el layout raíz.
 */
export function AuthInterceptor() {
  const router = useRouter();

  useEffect(() => {
    const cleanup = setupFetchInterceptor(() => {
      authUtils.clearAuth();
      router.push('/login');
    });

    return cleanup;
  }, [router]);

  return null;
}
