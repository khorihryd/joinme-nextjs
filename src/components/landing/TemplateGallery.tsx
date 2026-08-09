'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  views: number;
  thumbnail: string;
}

const templates: TemplateItem[] = [
  {
    id: 'tmpl-sage',
    name: 'Sage Green Luxury',
    category: 'Pernikahan',
    tier: 'Pro',
    views: 3420,
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tmpl-neon',
    name: 'Neon Party Night',
    category: 'Ulang Tahun',
    tier: 'Free',
    views: 1890,
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tmpl-warm',
    name: 'Warm Botanical Syukuran',
    category: 'Syukuran',
    tier: 'Free',
    views: 1240,
    thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'tmpl-corp',
    name: 'Corporate Business Gala',
    category: 'Bisnis',
    tier: 'Enterprise',
    views: 950,
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=80',
  },
];

export function TemplateGallery() {
  const [filter, setFilter] = useState<string>('Semua');

  const filtered = filter === 'Semua'
    ? templates
    : templates.filter((t) => t.category === filter);

  return (
    <section className="template-carousel-section" id="templates">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">✨ Koleksi Desain</span>
          <h2 className="section-title">Template Undangan Premium</h2>
          <p className="section-subtitle">
            Pilih dari koleksi desain eksklusif kami yang dirancang oleh desainer profesional. Setiap template bisa dikustomisasi sepenuhnya sesuai selera Anda.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="preview-tabs" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
          {['Semua', 'Pernikahan', 'Ulang Tahun', 'Syukuran', 'Bisnis'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`tab-btn ${filter === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((tpl) => {
            const tierClass = tpl.tier === 'Free' ? 'free' : tpl.tier === 'Enterprise' ? 'enterprise' : 'pro';
            const tierLabel = tpl.tier === 'Free' ? 'Gratis' : tpl.tier === 'Enterprise' ? 'Enterprise 👑' : 'Pro 🚀';

            return (
              <div key={tpl.id} className="tpl-card">
                <div className="tpl-card__thumb-wrap">
                  <img className="tpl-card__thumb" src={tpl.thumbnail} alt={tpl.name} loading="lazy" />
                  <span className="tpl-card__cat">{tpl.category}</span>
                  <span className={`tpl-card__tier tpl-card__tier--${tierClass}`}>{tierLabel}</span>
                </div>
                <div className="tpl-card__body">
                  <div className="tpl-card__name">{tpl.name}</div>
                  <div className="tpl-card__actions">
                    <Link href="/register" className="tpl-card__btn tpl-card__btn--preview">
                      👁️ Preview
                    </Link>
                    <Link href="/register" className="tpl-card__btn tpl-card__btn--use">
                      🚀 Gunakan
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 800 }}>
            Mulai Gratis Sekarang &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
