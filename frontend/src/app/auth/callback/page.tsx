'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem('vh_token', token);
        localStorage.setItem('vh_user', JSON.stringify(user));
      } catch {
        console.error('Failed to parse user from OAuth callback');
      }
      router.replace('/');
    } else {
      // Something went wrong — send back to login with error flag
      router.replace('/login?error=google_failed');
    }
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: 'var(--text-muted, #aaa)',
        fontSize: '1rem',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        style={{ animation: 'spin 0.9s linear infinite' }}
      >
        <circle cx="20" cy="20" r="16" stroke="#333" strokeWidth="4" />
        <path
          d="M20 4 A16 16 0 0 1 36 20"
          stroke="#ff0000"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
      Signing you in…
    </div>
  );
}
