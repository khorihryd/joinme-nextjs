'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';

interface SvgIcon {
  id: string;
  name: string;
  category: string;
  svgContent: string;
  viewBox?: string;
  strokeWidth?: string;
  tags?: string[];
  createdAt?: string;
}

export function IconLibraryTab() {
  const { showToast } = useToast();
  const [icons, setIcons] = useState<SvgIcon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadName, setUploadName] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Pernikahan');
  const [uploadSvgContent, setUploadSvgContent] = useState<string>('');
  const [uploadTagsText, setUploadTagsText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadIcons();
  }, []);

  const loadIcons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/icons');
      if (res.ok) {
        const data = await res.json();
        setIcons(data);
      }
    } catch (err) {
      showToast('Gagal memuat library ikon SVG', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast('Harap pilih file berformat .svg', 'error');
      return;
    }

    // Set default name from file name
    const defaultName = file.name.replace(/\.svg$/i, '').replace(/[-_]/g, ' ');
    setUploadName(defaultName);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setUploadSvgContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim() || !uploadSvgContent.trim()) {
      showToast('Nama ikon dan konten SVG wajib diisi!', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const tags = uploadTagsText
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch('/api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName.trim(),
          category: uploadCategory,
          svgContent: uploadSvgContent.trim(),
          tags,
        }),
      });

      if (res.ok) {
        const newIcon = await res.json();
        setIcons([newIcon, ...icons]);
        showToast(`Ikon "${uploadName}" berhasil diunggah ke Library!`, 'success');
        setIsUploadModalOpen(false);
        setUploadName('');
        setUploadSvgContent('');
        setUploadTagsText('');
      } else {
        showToast('Gagal menyimpan ikon SVG baru', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan saat mengunggah SVG', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIcon = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ikon "${name}" dari library?`)) return;

    try {
      const res = await fetch(`/api/icons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIcons(icons.filter((item) => item.id !== id));
        showToast(`Ikon "${name}" berhasil dihapus`, 'success');
      }
    } catch (err) {
      showToast('Gagal menghapus ikon', 'error');
    }
  };

  const handleCopySvg = (svgContent: string) => {
    navigator.clipboard.writeText(svgContent);
    showToast('Kode SVG berhasil disalin ke clipboard! 📋', 'success');
  };

  const filteredIcons = useMemo(() => {
    return icons.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [icons, selectedCategory, searchQuery]);

  return (
    <div className="admin-table-container">
      {/* Header Bar */}
      <div className="admin-table-header">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            🎨 Library Ikon SVG Platform
          </h3>
          <p className="panel-desc" style={{ margin: 0 }}>
            Upload dan kelola koleksi ikon SVG kustom untuk digunakan sebagai ikon tombol &amp; dekorasi di Studio Editor.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', cursor: 'pointer' }}
          >
            ✨ Upload File SVG Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔎 Cari ikon SVG... (contoh: lokasi, cincin, kalender, kamera, love)"
          style={{ flex: 1, minWidth: '220px', padding: '0.45rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kategori:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}
          >
            <option value="all">Semua Kategori ({icons.length})</option>
            <option value="Pernikahan">💍 Pernikahan</option>
            <option value="Navigasi & Maps">📍 Navigasi &amp; Maps</option>
            <option value="Sosial Media">💬 Sosial Media</option>
            <option value="Acara & Pesta">🎉 Acara &amp; Pesta</option>
            <option value="Simbol General">✨ Simbol General</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            ⏳ Memuat koleksi library ikon SVG...
          </div>
        ) : filteredIcons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-body)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            🎨 Belum ada ikon SVG yang cocok. Klik tombol <b>Upload File SVG Baru</b> di atas untuk menambahkan ikon baru!
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredIcons.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* SVG Vector Preview Box */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-body, #f8fafc)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary, #e36397)',
                    padding: '8px',
                  }}
                  dangerouslySetInnerHTML={{ __html: item.svgContent }}
                />

                {/* Info Metadata */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h5>
                  <span className="admin-badge badge-info" style={{ fontSize: '0.66rem' }}>
                    {item.category}
                  </span>
                </div>

                {/* SVG Attributes Details */}
                <div style={{ width: '100%', fontSize: '0.68rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-body)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>viewBox: {item.viewBox || '0 0 24 24'}</span>
                  <span>Stroke: {item.strokeWidth || '2'}</span>
                </div>

                {/* Action Control Buttons */}
                <div style={{ display: 'flex', gap: '0.35rem', width: '100%', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopySvg(item.svgContent)}
                    style={{
                      flex: 1,
                      fontSize: '0.72rem',
                      padding: '0.35rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    📋 Copy SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteIcon(item.id, item.name)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ✨ Upload File Ikon SVG Baru
              </h4>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Pilih File SVG (.svg):
                </label>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileChange}
                  style={{ fontSize: '0.8rem', padding: '0.5rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Nama Ikon:
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Contoh: Lokasi Peta Minimalis atau Cincin Kawin"
                  required
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Kategori Ikon:
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}
                >
                  <option value="Pernikahan">💍 Pernikahan</option>
                  <option value="Navigasi & Maps">📍 Navigasi &amp; Maps</option>
                  <option value="Sosial Media">💬 Sosial Media</option>
                  <option value="Acara & Pesta">🎉 Acara &amp; Pesta</option>
                  <option value="Simbol General">✨ Simbol General</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tags / Kata Kunci Pencarian (Pisahkan dengan Koma):
                </label>
                <input
                  type="text"
                  value={uploadTagsText}
                  onChange={(e) => setUploadTagsText(e.target.value)}
                  placeholder="Contoh: location, map, peta, pin"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Vector Preview */}
              {uploadSvgContent && (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Pratinjau Vektor SVG:
                  </label>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '48px', height: '48px', color: 'var(--primary)' }} dangerouslySetInnerHTML={{ __html: uploadSvgContent }} />
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Simpan...' : '💾 Simpan ke Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
