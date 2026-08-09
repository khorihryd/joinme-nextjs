'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password minimal 6 karakter!', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Gagal mendaftar', 'error');
        setLoading(false);
        return;
      }

      showToast('Pendaftaran berhasil! Mengalihkan...', 'success');

      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
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

            <h2 className="auth-sidebar-title">Mulai buat undangan impian Anda hari ini.</h2>
            <p className="auth-sidebar-desc">
              Dapatkan akun gratis dan nikmati kemudahan mengelola undangan pernikahan, ulang tahun, dan acara keluarga Anda.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Gratis Akses Templat Pilihan</span>
              </div>
              <div className="auth-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Konfirmasi RSVP & Ucapan Tamu</span>
              </div>
              <div className="auth-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Link Subdomain Kustom Instan</span>
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
            <h1 className="auth-title">Daftar Akun Baru</h1>
            <p className="auth-subtitle">
              Sudah punya akun? <Link href="/login">Masuk di sini</Link>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Roni Wijaya"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Alamat Email</label>
              <div className="input-wrapper">
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
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Mendaftarkan...' : 'Daftar Akun Gratis ➔'}
            </button>
          </form>

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
