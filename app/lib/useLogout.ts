import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, readSession } from './session';
import { apiPost, APIError } from './api';

export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = readSession();
      if (!session?.token) {
        // No session, just clear and redirect
        clearSession();
        router.push('/login');
        return;
      }

      // Call logout endpoint to invalidate token
      try {
        await apiPost('/auth/logout', {});
      } catch (err) {
        // Even if logout fails, clear local session
        // Only log errors that aren't 401 (unauthorized)
        if (!(err instanceof APIError && err.status === 401)) {
          console.error('Logout API error:', err);
          // Still continue with local cleanup
        }
      }

      clearSession();
      
      // Small delay to ensure session is cleared before redirect
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } catch (err) {
      console.error('Logout error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      // Still attempt to clear local session and redirect
      clearSession();
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { logout, isLoading, error };
}
