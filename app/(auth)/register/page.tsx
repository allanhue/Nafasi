'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { writeSession } from '../../lib/session';
import { apiPost, apiGet } from '../../lib/api';

type Plan = {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_period: string;
};

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles?: string[];
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', plan_id: 1 });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState('');

  // Load available plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await apiGet<Plan[]>('/auth/plans', { includeToken: false });
        setPlans(data);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, []);

  const updateField =
    (key: 'name' | 'email' | 'password' | 'plan_id') => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = key === 'plan_id' ? parseInt(event.target.value, 10) : event.target.value;
      setForm(current => ({ ...current, [key]: value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = apiPost<RegisterResponse>('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        plan_id: form.plan_id,
      });
      
      const response = await payload;
      const roles = response.user.roles || [];
      const role = roles.includes('superadmin') ? 'system_admin' : roles[0] || 'user';

      writeSession({
        token: response.token,
        user: response.user,
        role,
      });

      router.replace(role === 'system_admin' ? '/administrator/dashboard' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Create your account</h1>
        <p>Start managing your business with Nafasi.</p>
      </div>

      <form className="card" style={{ maxWidth: 420 }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Full name</label>
            <input
              className="input"
              placeholder="James Mwangi"
              value={form.name}
              onChange={updateField('name')}
              required
            />
          </div>
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
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Select Plan</label>
            <select
              className="input"
              value={form.plan_id}
              onChange={updateField('plan_id')}
              disabled={plansLoading}
            >
              {plansLoading ? (
                <option>Loading plans...</option>
              ) : (
                plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}/month
                  </option>
                ))
              )}
            </select>
          </div>
          {error ? <p style={{ color: 'var(--status-danger)', fontSize: 12 }}>{error}</p> : null}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading || plansLoading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
