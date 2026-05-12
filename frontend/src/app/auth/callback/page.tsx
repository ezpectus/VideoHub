'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

function apiRoot() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token || cancelled) {
        router.replace('/login?error=google_failed');
        return;
      }

      localStorage.setItem('vh_token', token);

      let userRaw = params.get('user');
      let user: unknown;

      if (userRaw) {
        try {
          user = JSON.parse(decodeURIComponent(userRaw));
        } catch {
          userRaw = null;
        }
      }

      const looksValid =
        user &&
        typeof user === 'object' &&
        'id' in user &&
        'username' in user &&
        typeof (user as { id: unknown }).id === 'string' &&
        typeof (user as { username: unknown }).username === 'string';

      if (!looksValid && !cancelled) {
        try {
          const { data } = await axios.get(`${apiRoot()}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          user = data;
        } catch {
          router.replace('/login?error=google_failed');
          return;
        }
      }

      if (cancelled) return;

      localStorage.setItem('vh_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth_changed'));
      router.replace('/');
    }

    void finish();

    return () => {
      cancelled = true;
    };
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
