'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_NODES } from '@/store/studio-store';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pernikahan');
  const [tier, setTier] = useState('Free');
  const [status, setStatus] = useState('Aktif');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1519741497674-611481863552?w=500');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama template tidak boleh kosong');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          tier,
          status,
          thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
          nodes: DEFAULT_NODES,
          globalStyles: {
            bgColor: '#eff2ef',
            padding: '24px',
            margin: '0px',
            fontFamily: 'Playfair Display',
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal membuat template baru');
      }

      const createdTemplate = await res.json();
      if (onSuccess) onSuccess();
      onClose();
      router.push(`/studio/${createdTemplate.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat membuat template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>✨</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Buat Template Undangan Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Nama Template */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Nama Template <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Elegant Sage Floral Wedding"
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Kategori & Tier (2 Columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Kategori Event
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Pernikahan">Pernikahan</option>
                <option value="Khitanan">Khitanan</option>
                <option value="Ulang Tahun">Ulang Tahun</option>
                <option value="Formal / Business">Formal / Business</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Lisensi Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Free">Free</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>

          {/* Status & Thumbnail URL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Status Ketersediaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif / Draft</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Thumbnail Preview URL
              </label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#e36397',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(227, 99, 151, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {submitting ? 'Menyimpan...' : '🚀 Buat & Buka Studio Builder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
