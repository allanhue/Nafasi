'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { writeSession } from '../../lib/session';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles?: string[];
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8080';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key: 'email' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(current => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Login failed');
      }

      const payload = (await response.json()) as LoginResponse;
      const roles = payload.user.roles || [];
      const role = roles.includes('superadmin') ? 'system_admin' : roles[0] || 'user';

      writeSession({
        token: payload.token,
        user: payload.user,
        role,
      });

      router.replace(role === 'system_admin' ? '/administrator/dashboard' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your workspace.</p>
      </div>

      <form className="card" style={{ maxWidth: 420 }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input
              className="input"
              placeholder="you@company.com"
              value={form.email}
              onChange={updateField('email')}
              type="email"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={updateField('password')}
              required
            />
          </div>
          {error ? <p style={{ color: 'var(--status-danger)', fontSize: 12 }}>{error}</p> : null}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
