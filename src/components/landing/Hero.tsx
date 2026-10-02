'use client';

import { useState } from 'react';
import { WHATSAPP_CONFIG } from '@/config/whatsapp';
import { Icon } from '@/components/ui/Icon';

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
            <span className="badge-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Icon name="auto_awesome" size={16} fill style={{ color: 'var(--primary, #e11d48)' }} />
            </span>
            <span className="badge-text">Undangan Digital Eksklusif & Bebas Repot</span>
          </div>

          <h1 className="hero-title">
            Undangan Digital <span className="gradient-text">Eksklusif & Indah</span> Siap Pakai
          </h1>

          <p className="hero-subtitle">
            Pilih template favorit Anda, kirimkan detail acara via WhatsApp, dan tim kami yang akan merancang serta menerbitkan undangan digital profesional untuk hari spesial Anda.
          </p>

          <div className="hero-buttons">
            <a
              href={WHATSAPP_CONFIG.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Icon name="chat" size={18} />
              <span>Pesan via WhatsApp</span>
            </a>
            <a href="#templates" className="btn btn-secondary">
              Lihat Pilihan Template
            </a>
          </div>

          <div className="hero-features">
            <div className="hero-feature-item">
              <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Dikerjakan oleh Tim Ahli</span>
            </div>
            <div className="hero-feature-item">
              <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Musik & Galeri Foto</span>
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
