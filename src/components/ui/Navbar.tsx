'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import { WHATSAPP_CONFIG } from '@/config/whatsapp';
import { Icon } from '@/components/ui/Icon';

export function Navbar() {
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

        <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
          <a href="#templates" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Templat</a>
          <a href="#faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <div className="mobile-only-cta" style={{ marginTop: '0.5rem', display: 'none' }}>
            <a
              href={WHATSAPP_CONFIG.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', display: 'inline-flex', alignItems: 'center' }}
            >
              <Icon name="chat" size={18} />
              <span>Pesan via WhatsApp</span>
            </a>
          </div>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />

          <a
            href={WHATSAPP_CONFIG.getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-nav"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Icon name="chat" size={18} />
            <span>Pesan Sekarang</span>
          </a>

          <button
            className={`mobile-nav-toggle ${mobileMenuOpen ? 'active' : ''}`}
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
