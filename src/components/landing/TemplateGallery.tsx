'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  status?: string;
  views: number;
  thumbnail: string;
}

export function TemplateGallery() {
  const [filter, setFilter] = useState<string>('Semua');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadActiveTemplates() {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTemplates(data);
          }
        }
      } catch (err) {
        console.error('Failed to load active templates for gallery:', err);
      } finally {
        setLoading(false);
      }
    }

    loadActiveTemplates();
  }, []);

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
            Pilih dari koleksi desain eksklusif kami yang dirancang oleh desainer profesional. Setiap template dapat dikustomisasi sepenuhnya sesuai selera Anda.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="preview-tabs" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
          {['Semua', 'Pernikahan', 'Ulang Tahun', 'Syukuran', 'Bisnis'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`tab-btn ${filter === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Display or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600 }}>Memuat katalog template aktif...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px dashed var(--border-color)',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎨</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Belum Ada Template Aktif
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Saat ini belum ada template dengan status aktif untuk kategori <strong>{filter}</strong>. Silakan periksa kembali nanti atau hubungi administrator.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((tpl) => {
              const tierClass = tpl.tier === 'Free' ? 'free' : tpl.tier === 'Enterprise' ? 'enterprise' : 'pro';
              const tierLabel = tpl.tier === 'Free' ? 'Gratis' : tpl.tier === 'Enterprise' ? 'Enterprise 👑' : 'Pro 🚀';
              const thumbUrl = tpl.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500';

              return (
                <div key={tpl.id} className="tpl-card">
                  <div className="tpl-card__thumb-wrap">
                    <img className="tpl-card__thumb" src={thumbUrl} alt={tpl.name} loading="lazy" />
                    <span className="tpl-card__cat">{tpl.category || 'Pernikahan'}</span>
                    <span className={`tpl-card__tier tpl-card__tier--${tierClass}`}>{tierLabel}</span>
                  </div>
                  <div className="tpl-card__body">
                    <div className="tpl-card__name">{tpl.name}</div>
                    <div className="tpl-card__actions">
                      <a
                        href={`/studio/${tpl.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tpl-card__btn tpl-card__btn--preview"
                      >
                        👁️ Preview
                      </a>
                      <Link href={`/register?templateId=${tpl.id}`} className="tpl-card__btn tpl-card__btn--use">
                        🚀 Gunakan
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 800 }}>
            Mulai Gratis Sekarang &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
