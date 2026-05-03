'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          <svg viewBox="0 0 90 20" fill="none" className={styles.logoSvg} aria-label="VideoHub">
            <rect x="0" y="2" width="28" height="16" rx="4" fill="#FF0000"/>
            <polygon points="11,6 11,14 20,10" fill="white"/>
            <text x="32" y="15" fontFamily="Roboto,sans-serif" fontWeight="700" fontSize="14" fill="#f1f1f1">VideoHub</text>
          </svg>
        </Link>
      </div>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          id="search-input"
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="Search videos"
        />
        <button type="submit" className={styles.searchBtn} aria-label="Submit search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      <div className={styles.right}>
        {isAuthenticated ? (
          <>
            <Link href="/upload" className={`btn btn-ghost ${styles.uploadBtn}`} id="upload-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span className={styles.uploadLabel}>Create</span>
            </Link>
            <div className={styles.avatarWrapper}>
              <button
                id="user-menu-btn"
                className={styles.avatarBtn}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="User menu"
              >
                <div className={styles.avatar}>
                  {user?.username?.[0]?.toUpperCase() ?? 'U'}
                </div>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownUser}>
                    <div className={styles.avatarLg}>{user?.username?.[0]?.toUpperCase() ?? 'U'}</div>
                    <div>
                      <p className={styles.dropdownName}>{user?.username}</p>
                      <p className={styles.dropdownEmail}>{user?.email}</p>
                    </div>
                  </div>
                  <hr className={styles.divider}/>
                  <Link
                    href={`/user/${user?.id}`}
                    className={styles.dropdownItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Channel
                  </Link>
                  <button
                    id="logout-btn"
                    className={styles.dropdownItem}
                    onClick={() => { logout(); setMenuOpen(false); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login" className={`btn ${styles.signInBtn}`} id="signin-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
