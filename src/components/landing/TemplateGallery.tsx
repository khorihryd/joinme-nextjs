'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WHATSAPP_CONFIG } from '@/config/whatsapp';
import { Icon } from '@/components/ui/Icon';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  status?: string;
  views: number;
  thumbnail: string;
  price?: number;
  originalPrice?: number;
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
          <span className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Icon name="auto_awesome" size={16} fill style={{ color: 'var(--primary)' }} />
            <span>Koleksi Desain</span>
          </span>
          <h2 className="section-title">Template Undangan Premium</h2>
          <p className="section-subtitle">
            Pilih dari koleksi desain eksklusif kami yang dirancang oleh desainer profesional. Hubungi kami via WhatsApp untuk membuat undangan dengan template pilihan Anda.
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
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Icon name="palette" size={44} style={{ color: 'var(--text-muted)' }} />
            </div>
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
              const tierLabel = tpl.tier === 'Free' ? 'Gratis' : tpl.tier === 'Enterprise' ? 'Enterprise' : 'Pro';
              const tierIcon = tpl.tier === 'Enterprise' ? 'workspace_premium' : tpl.tier === 'Pro' ? 'rocket_launch' : 'verified';
              const thumbUrl = tpl.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500';
              const priceText = tpl.price ? `Rp ${tpl.price.toLocaleString('id-ID')}` : 'Gratis';

              return (
                <div key={tpl.id} className="tpl-card">
                  <div className="tpl-card__thumb-wrap">
                    <img className="tpl-card__thumb" src={thumbUrl} alt={tpl.name} loading="lazy" />
                    <span className="tpl-card__cat">{tpl.category || 'Pernikahan'}</span>
                    <span className={`tpl-card__tier tpl-card__tier--${tierClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Icon name={tierIcon} size={13} fill />
                      <span>{tierLabel}</span>
                    </span>
                  </div>
                  <div className="tpl-card__body">
                    <div className="tpl-card__name">{tpl.name}</div>

                    {/* Harga Template & Harga Coret */}
                    <div className="tpl-card__pricing">
                      {(!tpl.price || tpl.price === 0) ? (
                        <span className="tpl-card__price tpl-card__price--free">Gratis</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span className="tpl-card__price">
                            Rp {tpl.price.toLocaleString('id-ID')}
                          </span>
                          {tpl.originalPrice && tpl.originalPrice > tpl.price && (
                            <>
                              <span className="tpl-card__original-price">
                                Rp {tpl.originalPrice.toLocaleString('id-ID')}
                              </span>
                              <span className="tpl-card__discount-tag">
                                -{Math.round(((tpl.originalPrice - tpl.price) / tpl.originalPrice) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="tpl-card__actions">
                      <Link
                        href={`/preview/${encodeURIComponent(tpl.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tpl-card__btn tpl-card__btn--preview"
                      >
                        <Icon name="visibility" size={16} />
                        <span>Preview</span>
                      </Link>
                      <a
                        href={WHATSAPP_CONFIG.getUrl(WHATSAPP_CONFIG.templateMessage(tpl.name, priceText))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tpl-card__btn tpl-card__btn--use"
                      >
                        <Icon name="chat" size={16} />
                        <span>Pesan</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <a
            href={WHATSAPP_CONFIG.getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Icon name="support_agent" size={20} />
            <span>Konsultasi & Pesan Desain Khusus &rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
