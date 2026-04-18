'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { writeSession, readSession } from '../../lib/session';
import { apiPost } from '../../lib/api';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem('remembered_email');
    if (saved) {
      setForm(current => ({ ...current, email: saved }));
      setRememberEmail(true);
    }
    
    // Check if already logged in
    const session = readSession();
    if (session?.token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateField = (key: 'email' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm(current => ({ ...current, [key]: value }));
    setError('');
    // Clear validation error for this field
    setValidationErrors(current => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiPost<LoginResponse>('/auth/login', form, { includeToken: false });
      const roles = response.user.roles || [];
      const role = roles.includes('superadmin') ? 'system_admin' : roles[0] || 'user';

      writeSession({
        token: response.token,
        user: response.user,
        role,
      });

      // Save email if checkbox is checked
      if (rememberEmail) {
        localStorage.setItem('remembered_email', form.email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      setSuccess('Login successful! Redirecting...');
      
      // Brief delay to show success message
      setTimeout(() => {
        router.replace(role === 'system_admin' ? '/administrator/dashboard' : '/dashboard');
      }, 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMsg);
      setSuccess('');
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Error Alert */}
          {error && (
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--status-danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-danger)',
              fontSize: 12,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--status-success)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-success)',
              fontSize: 12,
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input
              className="input"
              placeholder="you@company.com"
              value={form.email}
              onChange={updateField('email')}
              type="email"
            />
            {validationErrors.email && <p style={{ color: 'var(--status-danger)', fontSize: 11, marginTop: 4 }}>{validationErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={updateField('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.password && <p style={{ color: 'var(--status-danger)', fontSize: 11, marginTop: 4 }}>{validationErrors.password}</p>}
          </div>

          {/* Remember Email Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: 12, cursor: 'pointer' }}>Remember email</label>
          </div>

          {/* Submit Button */}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Sign Up Link */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Create one
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
