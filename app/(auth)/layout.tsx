import type { ReactNode } from 'react';
import '../globals.css';

export const metadata = {
  title: 'Nafasi - Authentication',
  description: 'Sign in or create your account',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="auth-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--background)',
        }}>
          <div style={{ width: '100%', maxWidth: 500 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
