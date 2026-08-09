'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" id="nav-logo">
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 19L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Join<span className="logo-accent">Me</span></span>
        </Link>

        <nav className="nav-menu">
          <a href="#features" className="nav-link">Fitur</a>
          <a href="#templates" className="nav-link">Templat</a>
          <a href="#pricing" className="nav-link">Harga</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                className="btn btn-primary btn-nav"
              >
                Dashboard ({session.user.name.split(' ')[0]})
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="nav-link"
                style={{ fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-link" style={{ marginRight: '0.5rem', fontWeight: 600 }}>
                Masuk
              </Link>
              <Link href="/register" className="btn btn-primary btn-nav">
                Mulai Gratis
              </Link>
            </>
          )}

          <button
            className="mobile-nav-toggle"
            id="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ubah menu navigasi"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
