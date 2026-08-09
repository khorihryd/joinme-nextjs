'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Hero() {
  const [activeTab, setActiveTab] = useState<'wedding' | 'birthday' | 'business'>('wedding');

  const previews = {
    wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
    business: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-bg-glow"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="trust-badge">
            <span className="badge-icon">🎉</span>
            <span className="badge-text">Dipercaya oleh 50.000+ penyelenggara di seluruh dunia</span>
          </div>

          <h1 className="hero-title">
            Buat Undangan <span className="gradient-text">Digital Keren</span> dalam Hitungan Menit
          </h1>

          <p className="hero-subtitle">
            Rancang undangan web yang indah dan interaktif untuk pernikahan, ulang tahun, dan acara perusahaan. Kelola RSVP, sematkan peta lokasi, kumpulkan doa restu tamu, dan bagikan galeri foto—semuanya dalam satu platform SaaS yang elegan.
          </p>

          <div className="hero-buttons">
            <Link href="/register" className="btn btn-primary">
              Mulai Buat Gratis
            </Link>
            <a href="#templates" className="btn btn-secondary">
              Coba Demo Live
            </a>
          </div>

          <div className="hero-features">
            <div className="hero-feature-item">
              <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Tanpa Perlu Coding</span>
            </div>
            <div className="hero-feature-item">
              <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Pelacakan RSVP Real-time</span>
            </div>
            <div className="hero-feature-item">
              <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Ramah Tampilan Seluler</span>
            </div>
          </div>
        </div>

        {/* Interactive Showcase (Phone Frame + Switcher) */}
        <div className="hero-visual" id="demo">
          <div className="preview-tabs">
            <button
              className={`tab-btn ${activeTab === 'wedding' ? 'active' : ''}`}
              onClick={() => setActiveTab('wedding')}
            >
              Pernikahan
            </button>
            <button
              className={`tab-btn ${activeTab === 'birthday' ? 'active' : ''}`}
              onClick={() => setActiveTab('birthday')}
            >
              Ulang Tahun
            </button>
            <button
              className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              Perusahaan
            </button>
          </div>

          <div className="phone-frame-wrapper">
            <div className="phone-frame">
              <div className="phone-camera"></div>
              <div className="phone-speaker"></div>
              <div className="phone-screen">
                <div className="template-screen active">
                  <img
                    src={previews[activeTab]}
                    alt="Mockup Undangan"
                    className="screenshot-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="phone-home-indicator"></div>
            </div>
            <div className="ambient-glow" id="ambient-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
