'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { normalizeSvgString, isSvgMarkup } from '@/utils/svgNormalizer';

interface SvgIconItem {
  id: string;
  name: string;
  category: string;
  svgContent: string;
  viewBox?: string;
  tags?: string[];
}

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconValue: string) => void;
  currentIcon?: string;
}

const EMOJI_ICONS: { emoji: string; name: string; category: string; keywords: string[] }[] = [
  { emoji: '📸', name: 'Kamera Foto', category: 'Acara', keywords: ['photo', 'camera', 'foto'] },
  { emoji: '🎵', name: 'Not Musik', category: 'Media', keywords: ['music', 'song', 'musik'] },
  { emoji: '💬', name: 'Chat WhatsApp', category: 'Sosial', keywords: ['chat', 'wa', 'whatsapp'] },
  { emoji: '🎥', name: 'Kamera Video', category: 'Media', keywords: ['video', 'youtube', 'film'] },
  { emoji: '✉️', name: 'Surat Undangan', category: 'Pernikahan', keywords: ['envelope', 'mail', 'undangan'] },
  { emoji: '💌', name: 'Surat Hati', category: 'Pernikahan', keywords: ['love', 'letter', 'surat'] },
  { emoji: '📍', name: 'Pin Lokasi', category: 'Navigasi', keywords: ['map', 'location', 'peta'] },
  { emoji: '📅', name: 'Kalender', category: 'Acara', keywords: ['calendar', 'date', 'tanggal'] },
  { emoji: '🔗', name: 'Link Tautan', category: 'Navigasi', keywords: ['url', 'link', 'web'] },
  { emoji: '❤️', name: 'Hati Merah', category: 'Hati', keywords: ['love', 'heart', 'cinta'] },
  { emoji: '💖', name: 'Hati Berkilau', category: 'Hati', keywords: ['love', 'heart', 'sparkle'] },
  { emoji: '💍', name: 'Cincin Kawin', category: 'Pernikahan', keywords: ['ring', 'cincin', 'nikah'] },
  { emoji: '💐', name: 'Buket Bunga', category: 'Pernikahan', keywords: ['flower', 'bunga', 'bouquet'] },
  { emoji: '🌹', name: 'Bunga Mawar', category: 'Pernikahan', keywords: ['rose', 'mawar', 'bunga'] },
  { emoji: '🎉', name: 'Pesta Confetti', category: 'Pesta', keywords: ['party', 'confetti', 'pesta'] },
  { emoji: '✨', name: 'Bintang Sparkle', category: 'Pesta', keywords: ['sparkles', 'magic', 'kilau'] },
  { emoji: '🎁', name: 'Kado Angpao', category: 'Pesta', keywords: ['gift', 'kado', 'hadiah'] },
  { emoji: '🗺️', name: 'Peta Dunia', category: 'Navigasi', keywords: ['map', 'peta', 'location'] },
  { emoji: '🔔', name: 'Lonceng', category: 'Acara', keywords: ['bell', 'lonceng', 'notif'] },
  { emoji: '🚀', name: 'Roket', category: 'Navigasi', keywords: ['rocket', 'roket', 'launch'] },
  { emoji: '🙏', name: 'Tangan Menyembah', category: 'Gestur', keywords: ['pray', 'thanks', 'terimakasih'] },
  { emoji: '🕊️', name: 'Burung Merpati', category: 'Pernikahan', keywords: ['dove', 'merpati', 'damai'] },
  { emoji: '🥂', name: 'Gelas Cheers', category: 'Pesta', keywords: ['cheers', 'drink', 'minum'] },
];

export function IconPickerModal({
  isOpen,
  onClose,
  onSelectIcon,
  currentIcon = '',
}: IconPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'emoji' | 'custom'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [libraryIcons, setLibraryIcons] = useState<SvgIconItem[]>([]);
  const [loadingIcons, setLoadingIcons] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadLibraryIcons();
    }
  }, [isOpen]);

  const loadLibraryIcons = async () => {
    try {
      setLoadingIcons(true);
      const res = await fetch('/api/icons');
      if (res.ok) {
        const data = await res.json();
        setLibraryIcons(data);
      }
    } catch (err) {
      console.error('Failed to load SVG library icons:', err);
    } finally {
      setLoadingIcons(false);
    }
  };

  const filteredLibraryIcons = useMemo(() => {
    if (!searchQuery.trim()) return libraryIcons;
    const q = searchQuery.toLowerCase().trim();
    return libraryIcons.filter(
      (ic) =>
        ic.name.toLowerCase().includes(q) ||
        ic.category.toLowerCase().includes(q) ||
        ic.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [libraryIcons, searchQuery]);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return EMOJI_ICONS;
    const q = searchQuery.toLowerCase().trim();
    return EMOJI_ICONS.filter(
      (em) =>
        em.name.toLowerCase().includes(q) ||
        em.category.toLowerCase().includes(q) ||
        em.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectSvgIcon = (svgContent: string) => {
    const normalized = normalizeSvgString(svgContent);
    onSelectIcon(normalized);
    onClose();
  };

  const handleSelectEmoji = (emoji: string) => {
    onSelectIcon(emoji);
    onClose();
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      alert('Harap pilih file berformat .svg');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const normalized = normalizeSvgString(text);
        setCustomInput(normalized);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCustom = () => {
    if (customInput.trim()) {
      onSelectIcon(customInput.trim());
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
            backgroundColor: 'var(--bg-body, #f8fafc)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              🎨 Library Ikon SVG Platform &amp; Simbol
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Pilih dari koleksi ikon SVG kustom bawaan platform atau masukkan URL/kode SVG kustom.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.2rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Bar & Tab Navigation */}
        <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem', backgroundColor: 'var(--bg-body, #f8fafc)', borderBottom: '1px solid var(--border-color)' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔎 Cari ikon SVG... (contoh: lokasi, cincin, kalender, kamera, love, kado)"
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              outline: 'none',
              backgroundColor: '#ffffff',
              marginBottom: '0.75rem',
            }}
            autoFocus
          />

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '6px 6px 0 0',
                border: '1px solid var(--border-color)',
                borderBottom: activeTab === 'library' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'library' ? '#ffffff' : 'transparent',
                color: activeTab === 'library' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              🎨 Platform SVG Library ({filteredLibraryIcons.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('emoji')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '6px 6px 0 0',
                border: '1px solid var(--border-color)',
                borderBottom: activeTab === 'emoji' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'emoji' ? '#ffffff' : 'transparent',
                color: activeTab === 'emoji' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              😀 Emoji &amp; Simbol ({filteredEmojis.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '6px 6px 0 0',
                border: '1px solid var(--border-color)',
                borderBottom: activeTab === 'custom' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'custom' ? '#ffffff' : 'transparent',
                color: activeTab === 'custom' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              🔗 Custom SVG / URL
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', minHeight: '300px' }}>
          {activeTab === 'library' && (
            <div>
              {loadingIcons ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  ⏳ Memuat koleksi library ikon SVG...
                </div>
              ) : filteredLibraryIcons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Tidak ada ikon SVG yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                    gap: '0.65rem',
                  }}
                >
                  {filteredLibraryIcons.map((ic) => {
                    const isSelected = currentIcon === ic.svgContent;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => handleSelectSvgIcon(ic.svgContent)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.75rem 0.5rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--primary-light, rgba(227, 99, 151, 0.1))' : 'var(--bg-body, #f8fafc)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          className="studio-btn-svg-icon"
                          style={{
                            width: '28px',
                            height: '28px',
                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                            marginBottom: '0.35rem',
                          }}
                          dangerouslySetInnerHTML={{ __html: normalizeSvgString(ic.svgContent) }}
                        />
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                          }}
                        >
                          {ic.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'emoji' && (
            <div>
              {filteredEmojis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Tidak ada Emoji yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                    gap: '0.6rem',
                  }}
                >
                  {filteredEmojis.map((em, idx) => {
                    const isSelected = currentIcon === em.emoji;
                    return (
                      <button
                        key={`${em.emoji}-${idx}`}
                        type="button"
                        onClick={() => handleSelectEmoji(em.emoji)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.65rem 0.4rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--primary-light, rgba(227, 99, 151, 0.1))' : 'var(--bg-body, #f8fafc)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>{em.emoji}</span>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          {em.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem' }}>
              {/* File Upload Box */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-body, #f8fafc)',
                  borderRadius: '12px',
                  border: '1px dashed var(--border-color)',
                }}
              >
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  📂 Upload File SVG dari Komputer:
                </label>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  Pilih file <b>.svg</b> dari komputer/HP Anda. Kode SVG akan dibaca dan disesuaikan ukurannya secara otomatis.
                </p>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleCustomFileUpload}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem',
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Textarea Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    URL Gambar atau Kode Teks SVG:
                  </label>
                  {customInput && (
                    <button
                      type="button"
                      onClick={() => setCustomInput('')}
                      style={{ fontSize: '0.68rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Bersihkan 🗑️
                    </button>
                  )}
                </div>

                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Upload file .svg di atas atau tempel URL (https://...) / Kode SVG (<svg>...</svg>) di sini"
                  style={{
                    width: '100%',
                    minHeight: '110px',
                    padding: '0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Live Vector Preview */}
              {customInput && (
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-body, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Pratinjau Vektor SVG Kustom:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px' }}>
                    {isSvgMarkup(customInput) ? (
                      <div
                        className="studio-btn-svg-icon"
                        style={{ width: '36px', height: '36px', color: 'var(--primary)' }}
                        dangerouslySetInnerHTML={{ __html: normalizeSvgString(customInput) }}
                      />
                    ) : customInput.startsWith('http') || customInput.startsWith('data:') ? (
                      <img src={customInput} alt="preview" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>{customInput}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  disabled={!customInput.trim()}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.5rem 1.35rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: customInput.trim() ? 'pointer' : 'not-allowed',
                    opacity: customInput.trim() ? 1 : 0.6,
                  }}
                >
                  Gunakan Ikon Ini 🚀
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-body, #f8fafc)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Status Ikon:{' '}
            <b style={{ color: 'var(--primary)' }}>
              {currentIcon ? 'Telah Terpilih ✓' : '(Belum ada ikon)'}
            </b>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {currentIcon && (
              <button
                type="button"
                onClick={() => {
                  onSelectIcon('');
                  onClose();
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Hapus Ikon 🗑️
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: '0.75rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
