'use client';

import { useState, useEffect } from 'react';

interface SaveAsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; category: string; tier: string; status: string; thumbnail: string }) => void;
  initialName?: string;
  initialCategory?: string;
  initialThumbnail?: string;
}

export function SaveAsNewModal({
  isOpen,
  onClose,
  onSave,
  initialName = 'Custom Elementor Template',
  initialCategory = 'Pernikahan',
  initialThumbnail = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
}: SaveAsNewModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pernikahan');
  const [tier, setTier] = useState('Pro');
  const [status, setStatus] = useState('Aktif');
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialName ? `${initialName} - Salinan` : 'Template Baru - Salinan');
      setCategory(initialCategory || 'Pernikahan');
      setTier('Pro');
      setStatus('Aktif');
      setThumbnail(initialThumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80');
    }
  }, [isOpen, initialName, initialCategory, initialThumbnail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      tier,
      status,
      thumbnail,
    });
  };

  return (
    <div className="admin-modal-overlay active" style={{ zIndex: 999999 }}>
      <div className="admin-modal-card" style={{ maxWidth: '480px' }}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', background: 'rgba(227, 99, 151, 0.12)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              💾
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Simpan sebagai Template Baru
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Definisikan metadata untuk katalog template SaaS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Nama Template
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elegant Gold Wedding"
                required
              />
            </div>

            <div className="pricing-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="event-select-input"
                  style={{ width: '100%' }}
                >
                  <option value="Pernikahan">Pernikahan</option>
                  <option value="Ulang Tahun">Ulang Tahun</option>
                  <option value="Syukuran">Syukuran</option>
                  <option value="Bisnis">Bisnis</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Tier Paket
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="event-select-input"
                  style={{ width: '100%' }}
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro Tier</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="pricing-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="event-select-input"
                  style={{ width: '100%' }}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
              💾 Buat Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
