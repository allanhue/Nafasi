import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, readSession } from './session';
import { apiPost, APIError } from './api';

export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      const session = readSession();
      if (!session?.token) {
        // No session, just clear and redirect
        clearSession();
        router.push('/auth/login');
        return;
      }

      // Call logout endpoint to invalidate token
      try {
        await apiPost('/auth/logout', {});
      } catch (err) {
        // Even if logout fails, clear local session
        if (!(err instanceof APIError && err.status === 401)) {
          console.error('Logout API error:', err);
        }
      }

      clearSession();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
      clearSession();
      router.push('/auth/login');
    }
  }, [router]);

  return logout;
}
