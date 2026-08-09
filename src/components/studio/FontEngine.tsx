'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface FontItem {
  name: string;
  category: 'script' | 'serif' | 'sans' | 'display';
}

export const GOOGLE_FONTS_CATALOG: FontItem[] = [
  // Script & Wedding
  { name: 'Great Vibes', category: 'script' },
  { name: 'Alex Brush', category: 'script' },
  { name: 'Sacramento', category: 'script' },
  { name: 'Dancing Script', category: 'script' },
  { name: 'Pinyon Script', category: 'script' },
  { name: 'Parisienne', category: 'script' },
  { name: 'Italianno', category: 'script' },
  { name: 'MonteCarlo', category: 'script' },
  { name: 'Ephesis', category: 'script' },
  { name: 'Whisper', category: 'script' },
  { name: 'Allura', category: 'script' },
  { name: 'Satisfy', category: 'script' },
  { name: 'Marck Script', category: 'script' },
  { name: 'Caveat', category: 'script' },
  { name: 'Tangerine', category: 'script' },
  { name: 'Pacifico', category: 'script' },
  // Serif Elegant
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Cormorant Garamond', category: 'serif' },
  { name: 'Cinzel', category: 'serif' },
  { name: 'Prata', category: 'serif' },
  { name: 'Marcellus', category: 'serif' },
  { name: 'Bodoni Moda', category: 'serif' },
  { name: 'EB Garamond', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Baskervville', category: 'serif' },
  { name: 'Cinzel Decorative', category: 'serif' },
  { name: 'Arapey', category: 'serif' },
  { name: 'DM Serif Display', category: 'serif' },
  { name: 'Spectral', category: 'serif' },
  // Sans Modern
  { name: 'Plus Jakarta Sans', category: 'sans' },
  { name: 'Inter', category: 'sans' },
  { name: 'Montserrat', category: 'sans' },
  { name: 'Poppins', category: 'sans' },
  { name: 'Outfit', category: 'sans' },
  { name: 'Roboto', category: 'sans' },
  { name: 'Raleway', category: 'sans' },
  { name: 'Lato', category: 'sans' },
  { name: 'Open Sans', category: 'sans' },
  { name: 'Work Sans', category: 'sans' },
  { name: 'Josefin Sans', category: 'sans' },
  { name: 'Manrope', category: 'sans' },
  { name: 'Urbanist', category: 'sans' },
  { name: 'Tenor Sans', category: 'sans' },
  { name: 'Syne', category: 'sans' },
  // Display & Decorative
  { name: 'Abril Fatface', category: 'display' },
  { name: 'El Messiri', category: 'display' },
  { name: 'Rozha One', category: 'display' },
];

export const GOOGLE_FONTS = GOOGLE_FONTS_CATALOG.map((f) => f.name);

export function ensureGoogleFontLoaded(fontName: string) {
  if (!fontName) return;
  const fontId = `google-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;

  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap`;
    document.head.appendChild(link);
  }
}

interface FontEngineSelectProps {
  value: string;
  onChange: (font: string) => void;
}

export function FontEngineSelect({ value, onChange }: FontEngineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'script' | 'serif' | 'sans' | 'display'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Load current selected font and top preview fonts into head
  useEffect(() => {
    if (value) ensureGoogleFontLoaded(value);
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      // Preload top fonts for preview
      GOOGLE_FONTS.slice(0, 15).forEach((font) => ensureGoogleFontLoaded(font));
    }
  }, [isOpen]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFont = (fontName: string) => {
    ensureGoogleFontLoaded(fontName);
    onChange(fontName);
    setIsOpen(false);
    setSearch('');
  };

  const filteredFonts = GOOGLE_FONTS_CATALOG.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const isExactMatch = GOOGLE_FONTS_CATALOG.some(
    (item) => item.name.toLowerCase() === search.toLowerCase().trim()
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selected Font Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          fontSize: '0.88rem',
          fontWeight: 600,
          fontFamily: `'${value || 'Plus Jakarta Sans'}', sans-serif`,
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-body)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          gap: '0.5rem',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || 'Pilih Font...'}
        </span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            padding: '0.65rem',
            maxHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Cari nama Google Font..."
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-main)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'script', label: '✍️ Script' },
              { id: 'serif', label: '🏛️ Serif' },
              { id: 'sans', label: '🔤 Sans' },
              { id: 'display', label: '🎭 Display' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  padding: '2px 7px',
                  fontSize: '0.65rem',
                  fontWeight: activeCategory === cat.id ? 700 : 400,
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: activeCategory === cat.id ? 'var(--primary)' : 'var(--bg-body)',
                  color: activeCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Font Items Scroll Area */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {/* Custom Font Search Option (if user types a font name not in preset) */}
            {search.trim() !== '' && !isExactMatch && (
              <button
                type="button"
                onClick={() => handleSelectFont(search.trim())}
                style={{
                  padding: '8px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textAlign: 'left',
                  backgroundColor: 'var(--primary-light, rgba(227, 99, 151, 0.15))',
                  color: 'var(--primary)',
                  border: '1px dashed var(--primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                }}
              >
                ➕ Gunakan Google Font: "{search.trim()}"
              </button>
            )}

            {filteredFonts.length === 0 && search.trim() === '' ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                Tidak ada font ditemukan
              </div>
            ) : (
              filteredFonts.map((item) => {
                const isSelected = value === item.name;
                ensureGoogleFontLoaded(item.name);

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectFont(item.name)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.95rem',
                      fontFamily: `'${item.name}', sans-serif`,
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'var(--primary-light, rgba(227, 99, 151, 0.12))' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{item.name}</span>
                    {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
