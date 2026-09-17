'use client';

import React, { useState } from 'react';
import { useStudioStore, DEFAULT_GLOBAL_STYLES } from '@/store/studio-store';
import { FontEngineSelect } from './FontEngine';
import { GlobalColorTokens } from '@/types';

export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  colors: GlobalColorTokens;
  fontPrimary: string;
  fontSecondary: string;
  previewBg: string;
  previewPrimary: string;
  previewAccent: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'luxury-gold',
    name: '✨ Royal Luxury Gold',
    category: 'Mewah & Klasik',
    colors: {
      primary: '#8B5E3C',
      secondary: '#C9A66B',
      background: '#FDFBF7',
      surface: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      accentLuxury: '#D4AF37',
      border: '#E2E8F0',
    },
    fontPrimary: 'Playfair Display',
    fontSecondary: 'Plus Jakarta Sans',
    previewBg: '#FDFBF7',
    previewPrimary: '#8B5E3C',
    previewAccent: '#D4AF37',
  },
  {
    id: 'sage-botanical',
    name: '🌿 Sage Botanical',
    category: 'Natural & Rustic',
    colors: {
      primary: '#4F6D5B',
      secondary: '#8EA89D',
      background: '#F4F6F4',
      surface: '#FFFFFF',
      textPrimary: '#24332C',
      textSecondary: '#5C7166',
      accentLuxury: '#C38D9E',
      border: '#D8E2DC',
    },
    fontPrimary: 'Cormorant Garamond',
    fontSecondary: 'Lora',
    previewBg: '#F4F6F4',
    previewPrimary: '#4F6D5B',
    previewAccent: '#C38D9E',
  },
  {
    id: 'romantic-blush',
    name: '🌸 Romantic Blush',
    category: 'Feminim & Anggun',
    colors: {
      primary: '#9C4153',
      secondary: '#C27387',
      background: '#FFF8F9',
      surface: '#FFFFFF',
      textPrimary: '#3B1E24',
      textSecondary: '#754A53',
      accentLuxury: '#E5A9B4',
      border: '#FCDDEC',
    },
    fontPrimary: 'Great Vibes',
    fontSecondary: 'Plus Jakarta Sans',
    previewBg: '#FFF8F9',
    previewPrimary: '#9C4153',
    previewAccent: '#E5A9B4',
  },
  {
    id: 'terracotta-earthy',
    name: '🏺 Terracotta Warm',
    category: 'Earthy & Warm',
    colors: {
      primary: '#A75D43',
      secondary: '#C88A75',
      background: '#FAF5F0',
      surface: '#FFFFFF',
      textPrimary: '#2E1E1A',
      textSecondary: '#6B534C',
      accentLuxury: '#D9A74A',
      border: '#EADBD3',
    },
    fontPrimary: 'Prata',
    fontSecondary: 'Inter',
    previewBg: '#FAF5F0',
    previewPrimary: '#A75D43',
    previewAccent: '#D9A74A',
  },
  {
    id: 'midnight-sapphire',
    name: '🌌 Midnight Sapphire',
    category: 'Gothic & Elegant',
    colors: {
      primary: '#2563EB',
      secondary: '#60A5FA',
      background: '#0B1120',
      surface: '#1E293B',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      accentLuxury: '#F59E0B',
      border: '#334155',
    },
    fontPrimary: 'Cinzel',
    fontSecondary: 'Montserrat',
    previewBg: '#0B1120',
    previewPrimary: '#2563EB',
    previewAccent: '#F59E0B',
  },
  {
    id: 'monochrome-modern',
    name: '🖤 Minimalist Modern',
    category: 'Clean & Simpel',
    colors: {
      primary: '#18181B',
      secondary: '#52525B',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      textPrimary: '#09090B',
      textSecondary: '#71717A',
      accentLuxury: '#A1A1AA',
      border: '#E4E4E7',
    },
    fontPrimary: 'Marcellus',
    fontSecondary: 'Plus Jakarta Sans',
    previewBg: '#FAFAFA',
    previewPrimary: '#18181B',
    previewAccent: '#A1A1AA',
  },
];

export function GlobalPropertiesPanel() {
  const { globalStyles, updateGlobalStyles } = useStudioStore();
  const [activeSection, setActiveSection] = useState<'themes' | 'colors' | 'typography' | 'spacing'>('colors');

  const colors = globalStyles.colors || DEFAULT_GLOBAL_STYLES.colors!;
  const typography = globalStyles.typography || DEFAULT_GLOBAL_STYLES.typography!;
  const spacing = globalStyles.spacing || DEFAULT_GLOBAL_STYLES.spacing!;

  const handleUpdateColor = (key: keyof GlobalColorTokens, val: string) => {
    updateGlobalStyles({
      colors: {
        ...colors,
        [key]: val,
      },
    });
  };

  const handleUpdateTypography = (key: string, val: any) => {
    updateGlobalStyles({
      typography: {
        ...typography,
        [key]: val,
      },
    });
  };

  const handleUpdateSpacing = (key: string, val: string) => {
    updateGlobalStyles({
      spacing: {
        ...spacing,
        [key]: val,
      },
    });
  };

  const handleApplyPreset = (preset: ThemePreset) => {
    updateGlobalStyles({
      colors: preset.colors,
      typography: {
        ...typography,
        fontPrimary: preset.fontPrimary,
        fontSecondary: preset.fontSecondary,
      },
      fontFamily: preset.fontPrimary,
      bgColor: preset.colors.background,
    });
  };

  const handleResetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh Global Properties & Design Tokens ke pengaturan default?')) {
      updateGlobalStyles({ ...DEFAULT_GLOBAL_STYLES });
    }
  };

  const colorFields: { key: keyof GlobalColorTokens; label: string; desc: string; icon: string }[] = [
    { key: 'primary', label: 'Primary Color', desc: 'Warna utama tombol, ornamen utama, highlight', icon: '💎' },
    { key: 'secondary', label: 'Secondary Color', desc: 'Warna sekunder, sub-heading, icon badge', icon: '🎨' },
    { key: 'background', label: 'Background Color', desc: 'Warna latar utama canvas / halaman terluar', icon: '🖼️' },
    { key: 'surface', label: 'Surface / Card', desc: 'Background kartu, container, modal & box', icon: '📦' },
    { key: 'textPrimary', label: 'Text Primary', desc: 'Warna teks judul & teks utama pengantin', icon: '📝' },
    { key: 'textSecondary', label: 'Text Secondary', desc: 'Warna teks paragraf, deskripsi, tanggal', icon: '📄' },
    { key: 'accentLuxury', label: 'Accent Luxury', desc: 'Aksen kemewahan emas, badge VIP, bintang', icon: '✨' },
    { key: 'border', label: 'Border Color', desc: 'Garis pembatas kartu, separator & frame', icon: '🔲' },
  ];

  const fontSizeFields = [
    { key: 'sizeH1', label: 'H1 (Judul Utama / Hero)', defaultVal: 36, preview: 'H1' },
    { key: 'sizeH2', label: 'H2 (Judul Section)', defaultVal: 28, preview: 'H2' },
    { key: 'sizeH3', label: 'H3 (Subjudul Section)', defaultVal: 22, preview: 'H3' },
    { key: 'sizeH4', label: 'H4 (Judul Card / Item)', defaultVal: 18, preview: 'H4' },
    { key: 'sizeBodyLarge', label: 'Body Large (Pengantar / Quote)', defaultVal: 16, preview: 'Body-L' },
    { key: 'sizeBody', label: 'Body (Teks Standar)', defaultVal: 14, preview: 'Body' },
    { key: 'sizeBodySmall', label: 'Body Small (Keterangan)', defaultVal: 12, preview: 'Body-S' },
    { key: 'sizeCaption', label: 'Caption (Label / Footnote)', defaultVal: 10, preview: 'Cap' },
  ];

  const marginFields = [
    { key: 'marginNone', label: 'None (0px)', defaultVal: '0px' },
    { key: 'marginXS', label: 'XS (Extra Small)', defaultVal: '4px' },
    { key: 'marginSM', label: 'SM (Small)', defaultVal: '8px' },
    { key: 'marginMD', label: 'MD (Medium / Normal)', defaultVal: '16px' },
    { key: 'marginLG', label: 'LG (Large / Section)', defaultVal: '24px' },
    { key: 'marginXL', label: 'XL (Extra Large)', defaultVal: '40px' },
    { key: 'margin2XL', label: '2XL (Huge Spacing)', defaultVal: '60px' },
  ];

  const paddingFields = [
    { key: 'paddingNone', label: 'None (0px)', defaultVal: '0px' },
    { key: 'paddingXS', label: 'XS (Extra Small)', defaultVal: '8px' },
    { key: 'paddingSM', label: 'SM (Small)', defaultVal: '12px' },
    { key: 'paddingMD', label: 'MD (Medium / Normal)', defaultVal: '16px' },
    { key: 'paddingLG', label: 'LG (Large / Section)', defaultVal: '24px' },
    { key: 'paddingXL', label: 'XL (Extra Large)', defaultVal: '40px' },
    { key: 'padding2XL', label: '2XL (Huge Spacing)', defaultVal: '60px' },
  ];

  return (
    <div className="global-properties-panel" style={{ padding: '1rem', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🎨 Global Properties (Design Tokens)
          </span>
          <button
            type="button"
            onClick={handleResetToDefault}
            title="Reset ke Default"
            style={{ fontSize: '0.68rem', padding: '3px 7px', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            🔄 Reset
          </button>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
          Preset global untuk warna, font, hierarki ukuran, dan spacing. Elemen yang terikat ke token akan otomatis update secara real-time.
        </p>
      </div>

      {/* Sub-tabs Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'var(--bg-body)', padding: '3px', borderRadius: '8px', border: 'var(--studio-border)', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveSection('colors')}
          style={{
            padding: '6px 2px',
            fontSize: '0.68rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'colors' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'colors' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          🎨 Warna
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('typography')}
          style={{
            padding: '6px 2px',
            fontSize: '0.68rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'typography' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'typography' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          🔤 Font
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('spacing')}
          style={{
            padding: '6px 2px',
            fontSize: '0.68rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'spacing' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'spacing' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          ↔️ Spasi
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('themes')}
          style={{
            padding: '6px 2px',
            fontSize: '0.68rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'themes' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'themes' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          ✨ Preset
        </button>
      </div>

      {/* SECTION 1: THEME PRESETS */}
      {activeSection === 'themes' && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            ✨ Palet Tema Siap Pakai (1-Click Switcher)
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '0.85rem' }}>
            Pilih tema harmonis di bawah untuk mengganti seluruh warna global dan tipografi dalam 1-klik:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {THEME_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {preset.fontPrimary} + {preset.fontSecondary}
                  </div>
                </div>

                {/* Color Swatch Dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.colors.primary, border: '1px solid rgba(0,0,0,0.1)' }} title="Primary" />
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.colors.secondary, border: '1px solid rgba(0,0,0,0.1)' }} title="Secondary" />
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.colors.accentLuxury, border: '1px solid rgba(0,0,0,0.1)' }} title="Accent" />
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.colors.background, border: '1px solid rgba(0,0,0,0.1)' }} title="Background" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: GLOBAL COLORS */}
      {activeSection === 'colors' && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            🎨 8 Palet Warna Global (Design Tokens)
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>
            Warna di bawah ini otomatis menjadi referensi token di Inspector setiap elemen:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {colorFields.map((field) => {
              const currentVal = colors[field.key] || '#000000';
              return (
                <div
                  key={field.key}
                  style={{
                    padding: '0.65rem 0.75rem',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>{field.icon}</span> {field.label}
                    </label>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      --global-{field.key.replace(/([A-Z])/g, '-$1').toLowerCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentVal.startsWith('#') ? currentVal : '#8B5E3C'}
                      onChange={(e) => handleUpdateColor(field.key, e.target.value)}
                      style={{ width: '36px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleUpdateColor(field.key, e.target.value)}
                      placeholder="#8B5E3C"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <p style={{ fontSize: '0.63rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                    {field.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: TYPOGRAPHY & FONT HIERARCHY */}
      {activeSection === 'typography' && (
        <div>
          {/* Global Fonts */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              🔤 Font Utama &amp; Sekunder
            </div>

            {/* Font Primary */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                👑 Font Primary (Judul / Headline / Display)
              </label>
              <FontEngineSelect
                value={typography.fontPrimary || 'Playfair Display'}
                onChange={(font) => handleUpdateTypography('fontPrimary', font)}
              />
              <div
                style={{
                  marginTop: '0.35rem',
                  padding: '0.5rem',
                  background: 'var(--bg-body)',
                  borderRadius: '6px',
                  fontFamily: typography.fontPrimary || 'Playfair Display',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: colors.primary || '#8B5E3C',
                  textAlign: 'center',
                }}
              >
                The Wedding of Roni &amp; Anti
              </div>
            </div>

            {/* Font Secondary */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                📖 Font Secondary (Teks Bacaan / Body / Deskripsi)
              </label>
              <FontEngineSelect
                value={typography.fontSecondary || 'Plus Jakarta Sans'}
                onChange={(font) => handleUpdateTypography('fontSecondary', font)}
              />
              <div
                style={{
                  marginTop: '0.35rem',
                  padding: '0.5rem',
                  background: 'var(--bg-body)',
                  borderRadius: '6px',
                  fontFamily: typography.fontSecondary || 'Plus Jakarta Sans',
                  fontSize: '0.78rem',
                  color: colors.textSecondary || '#64748B',
                  textAlign: 'center',
                }}
              >
                Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
              </div>
            </div>
          </div>

          {/* Font Size Hierarchy Scale */}
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              📏 Hierarki Ukuran Font (8 Tingkat Skala)
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '0.85rem' }}>
              Tentukan ukuran baku per tingkatan teks (px):
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {fontSizeFields.map((field) => {
                const currentSize = (typography as any)[field.key] !== undefined ? (typography as any)[field.key] : field.defaultVal;
                return (
                  <div
                    key={field.key}
                    style={{
                      padding: '0.5rem',
                      background: 'var(--bg-card)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {field.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <input
                        type="number"
                        min="8"
                        max="120"
                        value={currentSize}
                        onChange={(e) => handleUpdateTypography(field.key, parseInt(e.target.value, 10) || field.defaultVal)}
                        style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>px</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SPACING HIERARCHY (MARGIN & PADDING) */}
      {activeSection === 'spacing' && (
        <div>
          {/* Margin Hierarchy */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              ↔️ Hierarki Margin (Jarak Luar Elemen)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {marginFields.map((field) => {
                const currentVal = (spacing as any)[field.key] || field.defaultVal;
                return (
                  <div
                    key={field.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      background: 'var(--bg-card)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {field.label}
                    </span>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleUpdateSpacing(field.key, e.target.value)}
                      placeholder={field.defaultVal}
                      style={{ width: '90px', fontSize: '0.72rem', padding: '0.2rem 0.4rem', textAlign: 'right' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Padding Hierarchy */}
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              ↕️ Hierarki Padding (Jarak Dalam Elemen)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {paddingFields.map((field) => {
                const currentVal = (spacing as any)[field.key] || field.defaultVal;
                return (
                  <div
                    key={field.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      background: 'var(--bg-card)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {field.label}
                    </span>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleUpdateSpacing(field.key, e.target.value)}
                      placeholder={field.defaultVal}
                      style={{ width: '90px', fontSize: '0.72rem', padding: '0.2rem 0.4rem', textAlign: 'right' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
