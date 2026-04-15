'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { writeSession } from '../../lib/session';
import { apiPost } from '../../lib/api';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles?: string[];
  };
};

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
      const response = await apiPost<LoginResponse>('/auth/login', form, { includeToken: false });
      const roles = response.user.roles || [];
      const role = roles.includes('superadmin') ? 'system_admin' : roles[0] || 'user';

      writeSession({
        token: response.token,
        user: response.user,
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
