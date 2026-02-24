let isRedirecting = false;

/**
 * Wraps the global fetch to intercept 401 responses.
 * When detected (and the user has an active session), calls onUnauthorized.
 * Returns a cleanup function that restores the original fetch.
 */
export function setupFetchInterceptor(onUnauthorized: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const originalFetch = window.fetch;

  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const response = await originalFetch(...args);

    if (response.status === 401 && !isRedirecting) {
      // Only auto-logout if there's an active session (not on login page itself)
      const hasToken = !!localStorage.getItem('accessToken');
      if (hasToken) {
        isRedirecting = true;
        onUnauthorized();
      }
    }

    return response;
  };

  return () => {
    window.fetch = originalFetch;
    isRedirecting = false;
  };
}
