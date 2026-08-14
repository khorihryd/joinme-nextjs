'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTemplateId?: string;
}

export function CreateEventModal({ isOpen, onClose, onSuccess, initialTemplateId }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Pernikahan');
  const [subdomain, setSubdomain] = useState('');
  const [templateId, setTemplateId] = useState<string>(initialTemplateId || '');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    async function loadTemplates() {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTemplates(data);
            if (!templateId && data.length > 0) {
              setTemplateId(data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load active templates in modal:', err);
      }
    }
    loadTemplates();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subdomain) {
      showToast('Judul dan Subdomain wajib diisi!', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, subdomain, templateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Gagal membuat undangan', 'error');
        setLoading(false);
        return;
      }

      showToast('Undangan berhasil dibuat!', 'success');
      onSuccess();
      onClose();
      router.push(`/events/${data.id}/edit`);
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✨ Buat Website Acara
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              Buat Undangan Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Judul Undangan / Acara
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!subdomain) {
                    setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                placeholder="Contoh: Pernikahan Roni & Anti"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Jenis Acara
            </label>
            <div className="input-wrapper">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
              >
                <option value="Pernikahan">💍 Pernikahan</option>
                <option value="Ulang Tahun">🎉 Ulang Tahun</option>
                <option value="Syukuran">🍃 Syukuran & Aqiqah</option>
                <option value="Bisnis">💼 Acara Bisnis & Seminar</option>
              </select>
            </div>
          </div>

          {/* Active Template Selector */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Pilih Desain Template Undangan (Status: Aktif)
            </label>
            <div className="input-wrapper">
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
              >
                {templates.length === 0 ? (
                  <option value="">(Belum ada template aktif - Gunakan default studio)</option>
                ) : (
                  templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      🎨 {tpl.name} ({tpl.category}) [{tpl.tier}]
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Alamat Subdomain (.joinme.id)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', overflow: 'hidden' }}>
              <input
                type="text"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="roni-anti"
                style={{ flex: 1, padding: '0.75rem 1rem', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
              />
              <span style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', borderLeft: '1px solid var(--border-color)' }}>
                .joinme.id
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem' }}
            >
              {loading ? 'Membuat...' : 'Buat Undangan 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
