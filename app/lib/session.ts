export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
};

export type Session = {
  token: string;
  user: SessionUser;
  role: string;
};

const STORAGE_KEY = 'nafasi_session';

export function writeSession(session: Session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
