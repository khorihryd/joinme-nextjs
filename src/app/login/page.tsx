'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        showToast('Email atau password salah!', 'error');
      } else {
        showToast('Login berhasil! Mengalihkan...', 'success');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-bg-glow"></div>

      <div className="auth-wrapper">
        {/* Left Side Visual Sidebar */}
        <div className="auth-sidebar">
          <div className="auth-sidebar-glow"></div>
          <div className="auth-sidebar-content">
            <Link href="/" className="logo">
              <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Join<span className="logo-accent">Me</span></span>
            </Link>

            <h2 className="auth-sidebar-title">Buat undangan digital indah dalam hitungan menit.</h2>
            <p className="auth-sidebar-desc">
              Bergabunglah dengan ribuan penyelenggara yang mengelola acara dengan desain interaktif, analitik RSVP otomatis, dan buku tamu digital.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Puluhan templat acara premium</span>
              </div>
              <div className="auth-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Pelacakan & notifikasi RSVP tamu real-time</span>
              </div>
              <div className="auth-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Dinding ucapan live & galeri foto bersama</span>
              </div>
            </div>
          </div>

          <div className="auth-sidebar-footer">
            <p>&copy; 2026 JoinMe. Hak Cipta Dilindungi.</p>
          </div>
        </div>

        {/* Right Side Authentication Form */}
        <div className="auth-form-container">
          <div className="auth-theme-btn">
            <ThemeToggle />
          </div>

          <div className="auth-header">
            <h1 className="auth-title">Selamat Datang Kembali</h1>
            <p className="auth-subtitle">
              Baru di JoinMe? <Link href="/register">Buat akun baru</Link>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Alamat Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Kata Sandi</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Memproses...' : 'Masuk ke Akun Anda ➔'}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'var(--dash-card)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <p style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem' }}>🔑 Kredensial Demo:</p>
            <p style={{ color: 'var(--text-secondary)' }}>User: <code>roni@gmail.com</code> / <code>user123</code></p>
            <p style={{ color: 'var(--text-secondary)' }}>Admin: <code>admin@joinme.id</code> / <code>admin123</code></p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
