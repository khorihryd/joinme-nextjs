'use client';

import React, { useState, useMemo } from 'react';
import { useStudioStore, DEFAULT_GLOBAL_STYLES, DEFAULT_SAMPLE_EVENT_DETAILS, DEFAULT_SAMPLE_GALLERY } from '@/store/studio-store';
import { FontEngineSelect } from './FontEngine';
import { GlobalColorTokens, StudioNode } from '@/types';
import { MediaLibraryModal } from './MediaLibraryModal';
import { LightboxModal } from './LightboxModal';

function TagBadge({ tag, onCopy, isCopied }: { tag: string; onCopy: (tag: string) => void; isCopied: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(tag)}
      title={`Klik untuk menyalin tag ${tag}`}
      style={{
        background: isCopied ? '#ecfdf5' : 'var(--bg-body, #f8fafc)',
        border: `1px solid ${isCopied ? '#10b981' : 'var(--border-color, #e2e8f0)'}`,
        color: isCopied ? '#047857' : 'var(--primary, #db2777)',
        fontSize: '0.64rem',
        fontWeight: 600,
        fontFamily: 'monospace',
        padding: '1px 6px',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        transition: 'all 0.15s ease',
      }}
    >
      <span>{tag}</span>
      <span>{isCopied ? '✓' : '📋'}</span>
    </button>
  );
}

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
  const { globalStyles, updateGlobalStyles, nodes, selectNode, setSidebarTab } = useStudioStore();
  const [activeSection, setActiveSection] = useState<'mempelai' | 'gallery' | 'colors' | 'typography' | 'spacing' | 'themes'>('mempelai');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Gallery state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedPhotoUrl, setCopiedPhotoUrl] = useState<number | null>(null);

  const sampleData: Record<string, any> = {
    ...DEFAULT_SAMPLE_EVENT_DETAILS,
    ...(globalStyles.sampleEventDetails || {}),
  };

  // Memoized gallery list from globalStyles or sampleEventDetails with fallback to DEFAULT_SAMPLE_GALLERY
  const galleryList: string[] = useMemo(() => {
    if (Array.isArray(globalStyles.galleryImages) && globalStyles.galleryImages.length > 0) {
      return globalStyles.galleryImages;
    }
    if (Array.isArray(sampleData.gallery) && sampleData.gallery.length > 0) {
      return sampleData.gallery;
    }
    if (Array.isArray(sampleData.galleryImages) && sampleData.galleryImages.length > 0) {
      return sampleData.galleryImages;
    }
    return DEFAULT_SAMPLE_GALLERY;
  }, [globalStyles.galleryImages, sampleData.gallery, sampleData.galleryImages]);

  // Find canvas image nodes that have showInGallery enabled
  const canvasGalleryNodes = useMemo(() => {
    const found: StudioNode[] = [];
    const traverse = (items: StudioNode[]) => {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (item.type === 'image' && item.showInGallery) {
          found.push(item);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(nodes || []);
    return found;
  }, [nodes]);

  const updateGalleryList = (newList: string[]) => {
    updateGlobalStyles({
      galleryImages: newList,
      sampleEventDetails: {
        ...sampleData,
        gallery: newList,
        galleryImages: newList,
        photos: newList,
      },
    });
  };

  const handleAddPhoto = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const nextList = [...galleryList, trimmed];
    updateGalleryList(nextList);
    setNewPhotoUrl('');
  };

  const handleDeletePhoto = (index: number) => {
    const nextList = galleryList.filter((_, idx) => idx !== index);
    updateGalleryList(nextList);
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryList.length) return;
    const nextList = [...galleryList];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, moved);
    updateGalleryList(nextList);
  };

  const handleResetGallery = () => {
    if (confirm('Kembalikan galeri foto ke contoh prewedding standar?')) {
      updateGalleryList([...DEFAULT_SAMPLE_GALLERY]);
    }
  };

  const handleAddPresetSample = () => {
    const samplePool = [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80',
    ];
    const unused = samplePool.find((p) => !galleryList.includes(p)) || samplePool[Math.floor(Math.random() * samplePool.length)];
    updateGalleryList([...galleryList, unused]);
  };

  const handleCopyPhotoUrl = (url: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedPhotoUrl(idx);
      setTimeout(() => setCopiedPhotoUrl(null), 1500);
    }
  };

  const handleUpdateDetail = (key: string, val: string) => {
    const nextData = {
      ...sampleData,
      [key]: val,
    };
    if (key === 'panggilanPria' || key === 'panggilanWanita') {
      const pria = key === 'panggilanPria' ? val : (sampleData.panggilanPria || '');
      const wanita = key === 'panggilanWanita' ? val : (sampleData.panggilanWanita || '');
      if (pria && wanita) {
        nextData.couple_name = `${pria} & ${wanita}`;
        nextData.nama_mempelai = `${pria} & ${wanita}`;
      }
      if (!sampleData.inisialPria && pria) {
        nextData.inisialPria = pria.trim().charAt(0).toUpperCase();
        nextData.inisial_pria = nextData.inisialPria;
      }
      if (!sampleData.inisialWanita && wanita) {
        nextData.inisialWanita = wanita.trim().charAt(0).toUpperCase();
        nextData.inisial_wanita = nextData.inisialWanita;
      }
      const curIPria = nextData.inisialPria || sampleData.inisialPria || (pria ? pria.trim().charAt(0).toUpperCase() : '');
      const curIWanita = nextData.inisialWanita || sampleData.inisialWanita || (wanita ? wanita.trim().charAt(0).toUpperCase() : '');
      if (curIPria && curIWanita) {
        nextData.inisialPasangan = `${curIPria} & ${curIWanita}`;
        nextData.inisial_pasangan = `${curIPria} & ${curIWanita}`;
        nextData.couple_initials = `${curIPria} & ${curIWanita}`;
      }
    }
    if (key === 'inisialPria') {
      nextData.inisial_pria = val;
      nextData.groom_initial = val;
      const curIWanita = sampleData.inisialWanita || sampleData.inisial_wanita || (sampleData.panggilanWanita ? sampleData.panggilanWanita.trim().charAt(0).toUpperCase() : '');
      if (val && curIWanita) {
        nextData.inisialPasangan = `${val} & ${curIWanita}`;
        nextData.inisial_pasangan = `${val} & ${curIWanita}`;
        nextData.couple_initials = `${val} & ${curIWanita}`;
      }
    }
    if (key === 'inisialWanita') {
      nextData.inisial_wanita = val;
      nextData.bride_initial = val;
      const curIPria = sampleData.inisialPria || sampleData.inisial_pria || (sampleData.panggilanPria ? sampleData.panggilanPria.trim().charAt(0).toUpperCase() : '');
      if (curIPria && val) {
        nextData.inisialPasangan = `${curIPria} & ${val}`;
        nextData.inisial_pasangan = `${curIPria} & ${val}`;
        nextData.couple_initials = `${curIPria} & ${val}`;
      }
    }
    if (key === 'inisialPasangan') {
      nextData.inisial_pasangan = val;
      nextData.couple_initials = val;
    }
    if (key === 'event_date') {
      nextData.tanggal_acara = val;
    }
    if (key === 'event_time') {
      nextData.waktu_acara = val;
    }
    if (key === 'event_location') {
      nextData.lokasi_acara = val;
      nextData.nama_lokasi = val;
    }
    if (key === 'event_address') {
      nextData.alamat_lengkap = val;
    }
    if (key === 'guest_name') {
      nextData.nama_tamu = val;
    }
    if (key === 'mempelaiPria') {
      nextData.groom_name = val;
      nextData.groom_full = val;
    }
    if (key === 'mempelaiWanita') {
      nextData.bride_name = val;
      nextData.bride_full = val;
    }

    updateGlobalStyles({
      sampleEventDetails: nextData,
    });
  };

  const handleResetSampleData = () => {
    if (confirm('Reset seluruh data variabel mempelai & acara ke data contoh standar?')) {
      updateGlobalStyles({
        sampleEventDetails: { ...DEFAULT_SAMPLE_EVENT_DETAILS },
      });
    }
  };

  const handleCopyTag = (tag: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 1800);
    }
  };

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', background: 'var(--bg-body)', padding: '3px', borderRadius: '8px', border: 'var(--studio-border)', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveSection('mempelai')}
          style={{
            padding: '6px 2px',
            fontSize: '0.67rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'mempelai' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'mempelai' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
          title="Data Mempelai & Acara"
        >
          💍 Data
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('gallery')}
          style={{
            padding: '6px 2px',
            fontSize: '0.67rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'gallery' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'gallery' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
          }}
          title="Galeri Foto & Lightbox"
        >
          🖼️ Galeri
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('colors')}
          style={{
            padding: '6px 2px',
            fontSize: '0.67rem',
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
            fontSize: '0.67rem',
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
            fontSize: '0.67rem',
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
            fontSize: '0.67rem',
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

      {/* SECTION 0: DATA MEMPELAI & ACARA */}
      {activeSection === 'mempelai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Info Banner */}
          <div style={{ padding: '0.75rem 0.85rem', background: 'linear-gradient(135deg, rgba(227, 99, 151, 0.08), rgba(139, 94, 60, 0.08))', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                💍 Data Variabel Mempelai &amp; Acara
              </span>
              <button
                type="button"
                onClick={handleResetSampleData}
                style={{
                  fontSize: '0.66rem',
                  padding: '2px 7px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
                title="Kembalikan ke data contoh bawaan"
              >
                🔄 Reset
              </button>
            </div>
            <p style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Ubah data variabel di bawah ini. Teks pada canvas yang menggunakan tag variabel (seperti <code>{'{nama_pria}'}</code> atau <code>{'{tanggal_acara}'}</code>) akan langsung ter-update secara real-time. Klik chip tag untuk menyalin kodenya.
            </p>
          </div>

          {/* Card: Mempelai Pria */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🤵 Mempelai Pria
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Panggilan</label>
                  <TagBadge tag="{nama_pria}" onCopy={handleCopyTag} isCopied={copiedTag === '{nama_pria}'} />
                </div>
                <input
                  type="text"
                  value={sampleData.panggilanPria || ''}
                  onChange={(e) => handleUpdateDetail('panggilanPria', e.target.value)}
                  placeholder="Jonathan"
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Inisial Pria</label>
                  <TagBadge tag="{inisial_pria}" onCopy={handleCopyTag} isCopied={copiedTag === '{inisial_pria}'} />
                </div>
                <input
                  type="text"
                  value={sampleData.inisialPria !== undefined ? sampleData.inisialPria : (sampleData.inisial_pria || '')}
                  onChange={(e) => handleUpdateDetail('inisialPria', e.target.value)}
                  placeholder="J"
                  maxLength={4}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', fontWeight: 800, textAlign: 'center', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Lengkap &amp; Gelar</label>
                <TagBadge tag="{groom_name}" onCopy={handleCopyTag} isCopied={copiedTag === '{groom_name}'} />
              </div>
              <input
                type="text"
                value={sampleData.mempelaiPria || ''}
                onChange={(e) => handleUpdateDetail('mempelaiPria', e.target.value)}
                placeholder="Jonathan Wijaya, S.Kom."
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Orang Tua</label>
                <TagBadge tag="{ortu_pria}" onCopy={handleCopyTag} isCopied={copiedTag === '{ortu_pria}'} />
              </div>
              <input
                type="text"
                value={sampleData.ortuPria || ''}
                onChange={(e) => handleUpdateDetail('ortuPria', e.target.value)}
                placeholder="Putra dari Bp. Hendra &amp; Ibu Maria"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Instagram</label>
                <TagBadge tag="{ig_pria}" onCopy={handleCopyTag} isCopied={copiedTag === '{ig_pria}'} />
              </div>
              <input
                type="text"
                value={sampleData.igPria || ''}
                onChange={(e) => handleUpdateDetail('igPria', e.target.value)}
                placeholder="@jonathanwijaya"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
          </div>

          {/* Card: Mempelai Wanita */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              👰 Mempelai Wanita
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Panggilan</label>
                  <TagBadge tag="{nama_wanita}" onCopy={handleCopyTag} isCopied={copiedTag === '{nama_wanita}'} />
                </div>
                <input
                  type="text"
                  value={sampleData.panggilanWanita || ''}
                  onChange={(e) => handleUpdateDetail('panggilanWanita', e.target.value)}
                  placeholder="Anti"
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Inisial Wanita</label>
                  <TagBadge tag="{inisial_wanita}" onCopy={handleCopyTag} isCopied={copiedTag === '{inisial_wanita}'} />
                </div>
                <input
                  type="text"
                  value={sampleData.inisialWanita !== undefined ? sampleData.inisialWanita : (sampleData.inisial_wanita || '')}
                  onChange={(e) => handleUpdateDetail('inisialWanita', e.target.value)}
                  placeholder="A"
                  maxLength={4}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', fontWeight: 800, textAlign: 'center', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Lengkap &amp; Gelar</label>
                <TagBadge tag="{bride_name}" onCopy={handleCopyTag} isCopied={copiedTag === '{bride_name}'} />
              </div>
              <input
                type="text"
                value={sampleData.mempelaiWanita || ''}
                onChange={(e) => handleUpdateDetail('mempelaiWanita', e.target.value)}
                placeholder="Anti Rahmawati, S.T."
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Orang Tua</label>
                <TagBadge tag="{ortu_wanita}" onCopy={handleCopyTag} isCopied={copiedTag === '{ortu_wanita}'} />
              </div>
              <input
                type="text"
                value={sampleData.ortuWanita || ''}
                onChange={(e) => handleUpdateDetail('ortuWanita', e.target.value)}
                placeholder="Putri dari Bp. Bambang &amp; Ibu Sri"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Instagram</label>
                <TagBadge tag="{ig_wanita}" onCopy={handleCopyTag} isCopied={copiedTag === '{ig_wanita}'} />
              </div>
              <input
                type="text"
                value={sampleData.igWanita || ''}
                onChange={(e) => handleUpdateDetail('igWanita', e.target.value)}
                placeholder="@antirahmawati"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
          </div>

          {/* Card: Nama Pasangan & Judul */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              👩‍❤️‍👨 Nama Pasangan &amp; Sampul
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Pasangan</label>
                  <TagBadge tag="{nama_mempelai}" onCopy={handleCopyTag} isCopied={copiedTag === '{nama_mempelai}'} />
                </div>
                <input
                  type="text"
                  value={sampleData.couple_name || sampleData.nama_mempelai || ''}
                  onChange={(e) => handleUpdateDetail('couple_name', e.target.value)}
                  placeholder="Jonathan &amp; Anti"
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Inisial Pasangan</label>
                  <TagBadge tag="{inisial_pasangan}" onCopy={handleCopyTag} isCopied={copiedTag === '{inisial_pasangan}'} />
                </div>
                <input
                  type="text"
                  value={sampleData.inisialPasangan !== undefined ? sampleData.inisialPasangan : (sampleData.inisial_pasangan || '')}
                  onChange={(e) => handleUpdateDetail('inisialPasangan', e.target.value)}
                  placeholder="J &amp; A"
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', fontWeight: 800, textAlign: 'center', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Judul Sampul / Cover</label>
                <TagBadge tag="{cover_title}" onCopy={handleCopyTag} isCopied={copiedTag === '{cover_title}'} />
              </div>
              <input
                type="text"
                value={sampleData.coverTitle || sampleData.cover_title || ''}
                onChange={(e) => handleUpdateDetail('coverTitle', e.target.value)}
                placeholder="The Wedding of"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
          </div>

          {/* Card: Waktu & Tanggal Acara */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              📅 Waktu &amp; Tanggal Acara
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama / Judul Acara</label>
                <TagBadge tag="{nama_acara}" onCopy={handleCopyTag} isCopied={copiedTag === '{nama_acara}'} />
              </div>
              <input
                type="text"
                value={sampleData.event_title || sampleData.nama_acara || ''}
                onChange={(e) => handleUpdateDetail('event_title', e.target.value)}
                placeholder="Akad Nikah &amp; Resepsi"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Tanggal Acara</label>
                <TagBadge tag="{tanggal_acara}" onCopy={handleCopyTag} isCopied={copiedTag === '{tanggal_acara}'} />
              </div>
              <input
                type="text"
                value={sampleData.event_date || sampleData.tanggal_acara || ''}
                onChange={(e) => handleUpdateDetail('event_date', e.target.value)}
                placeholder="21 September 2026"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Waktu / Jam Acara</label>
                <TagBadge tag="{waktu_acara}" onCopy={handleCopyTag} isCopied={copiedTag === '{waktu_acara}'} />
              </div>
              <input
                type="text"
                value={sampleData.event_time || sampleData.waktu_acara || ''}
                onChange={(e) => handleUpdateDetail('event_time', e.target.value)}
                placeholder="08:00 - 14:00 WIB"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
          </div>

          {/* Card: Lokasi & Alamat Acara */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              📍 Lokasi &amp; Alamat Acara
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Lokasi / Gedung</label>
                <TagBadge tag="{lokasi_acara}" onCopy={handleCopyTag} isCopied={copiedTag === '{lokasi_acara}'} />
              </div>
              <input
                type="text"
                value={sampleData.event_location || sampleData.lokasi_acara || ''}
                onChange={(e) => handleUpdateDetail('event_location', e.target.value)}
                placeholder="Grand Ballroom Hotel Mulia, Jakarta"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Alamat Lengkap</label>
                <TagBadge tag="{alamat_lengkap}" onCopy={handleCopyTag} isCopied={copiedTag === '{alamat_lengkap}'} />
              </div>
              <textarea
                rows={2}
                value={sampleData.event_address || sampleData.alamat_lengkap || ''}
                onChange={(e) => handleUpdateDetail('event_address', e.target.value)}
                placeholder="Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Kota</label>
                <TagBadge tag="{kota_acara}" onCopy={handleCopyTag} isCopied={copiedTag === '{kota_acara}'} />
              </div>
              <input
                type="text"
                value={sampleData.city || sampleData.kota_acara || ''}
                onChange={(e) => handleUpdateDetail('city', e.target.value)}
                placeholder="Jakarta Pusat"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
          </div>

          {/* Card: Tamu Undangan (Contoh Preview) */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              💌 Tamu Undangan (Contoh Preview)
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Nama Tamu Contoh</label>
                <TagBadge tag="{nama_tamu}" onCopy={handleCopyTag} isCopied={copiedTag === '{nama_tamu}'} />
              </div>
              <input
                type="text"
                value={sampleData.guest_name || sampleData.nama_tamu || ''}
                onChange={(e) => handleUpdateDetail('guest_name', e.target.value)}
                placeholder="Budi Santoso &amp; Partner"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.78rem', borderRadius: '7px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 0.5: GALERI FOTO & LIGHTBOX */}
      {activeSection === 'gallery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Info Banner */}
          <div style={{ padding: '0.75rem 0.85rem', background: 'linear-gradient(135deg, rgba(227, 99, 151, 0.08), rgba(139, 94, 60, 0.08))', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                🖼️ Galeri Foto &amp; Lightbox
              </span>
              <button
                type="button"
                onClick={handleResetGallery}
                style={{
                  fontSize: '0.66rem',
                  padding: '2px 7px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
                title="Kembalikan galeri ke contoh foto standar"
              >
                🔄 Reset
              </button>
            </div>
            <p style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Kelola kumpulan foto album pernikahan untuk template ini. Foto di bawah otomatis tampil di <strong>Galeri Grid</strong>, <strong>Slide Gambar (Carousel)</strong>, dan jendela pop-up <strong>Lightbox Layar Penuh</strong> saat foto diklik tamu.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Tag Variabel:</span>
              <TagBadge tag="{gallery}" onCopy={handleCopyTag} isCopied={copiedTag === '{gallery}'} />
              <TagBadge tag="{galleryImages}" onCopy={handleCopyTag} isCopied={copiedTag === '{galleryImages}'} />
            </div>
          </div>

          {/* Card: Tambah Foto & Aksi */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>➕ Tambah Foto Album</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'none' }}>
                {galleryList.length} Foto Aktif
              </span>
            </div>

            {/* Tombol Utama: Upload / Media Library */}
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                transition: 'opacity 0.15s ease',
              }}
            >
              📁 Upload / Buka Media Library
            </button>

            {/* Input URL Manual */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <input
                type="text"
                placeholder="atau tempel direct URL foto..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoto(newPhotoUrl);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.74rem',
                  borderRadius: '7px',
                  border: '1px solid var(--border-color)',
                  background: '#fff',
                }}
              />
              <button
                type="button"
                onClick={() => handleAddPhoto(newPhotoUrl)}
                disabled={!newPhotoUrl.trim()}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderRadius: '7px',
                  backgroundColor: newPhotoUrl.trim() ? 'var(--primary)' : '#e2e8f0',
                  color: newPhotoUrl.trim() ? '#fff' : '#94a3b8',
                  border: 'none',
                  cursor: newPhotoUrl.trim() ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                }}
              >
                + Tambah
              </button>
            </div>

            {/* Preset Button & Test Lightbox Button */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
              <button
                type="button"
                onClick={handleAddPresetSample}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
                title="Tambahkan 1 foto contoh prewedding berkualitas tinggi dari Unsplash"
              >
                <span>✨ + Contoh Foto</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (galleryList.length > 0) setLightboxIndex(0);
                }}
                disabled={galleryList.length === 0}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  background: galleryList.length > 0 ? '#eff6ff' : '#f1f5f9',
                  border: `1px solid ${galleryList.length > 0 ? '#93c5fd' : '#e2e8f0'}`,
                  cursor: galleryList.length > 0 ? 'pointer' : 'not-allowed',
                  color: galleryList.length > 0 ? '#1d4ed8' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
                title="Uji tampilan Lightbox layar penuh dengan foto saat ini"
              >
                <span>🔍 Tes Lightbox</span>
              </button>
            </div>
          </div>

          {/* Card: Daftar Foto Album Grid */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📸 Foto Dalam Galeri ({galleryList.length})</span>
              {galleryList.length > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'none' }}>
                  Klik foto untuk zoom
                </span>
              )}
            </div>

            {galleryList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>🖼️</div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Belum ada foto di galeri
                </div>
                <p style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  Unggah foto atau muat foto contoh bawaan agar galeri dapat tampil di undangan.
                </p>
                <button
                  type="button"
                  onClick={handleResetGallery}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Muat Foto Contoh
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                {galleryList.map((imgUrl, idx) => (
                  <div
                    key={`gal-card-${idx}`}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      background: '#000',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Thumbnail Image */}
                    <div
                      onClick={() => setLightboxIndex(idx)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '85px',
                        cursor: 'pointer',
                        backgroundColor: '#f1f5f9',
                      }}
                      title="Klik untuk membuka Lightbox"
                    >
                      <img
                        src={imgUrl}
                        alt={`Galeri ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      {/* Order badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backdropFilter: 'blur(2px)',
                        }}
                      >
                        #{idx + 1}
                      </span>

                      {/* Zoom Overlay Icon on Hover */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(255,255,255,0.85)',
                          color: '#1e293b',
                          fontSize: '0.65rem',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        🔍
                      </span>
                    </div>

                    {/* Action Control Bar under image */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        backgroundColor: '#fff',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      {/* Reorder Buttons */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, 'up')}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.62rem',
                            borderRadius: '3px',
                            border: '1px solid var(--border-color)',
                            background: idx === 0 ? '#f8fafc' : '#fff',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            color: idx === 0 ? '#cbd5e1' : 'var(--text-main)',
                          }}
                          title="Pindah ke urutan sebelumnya"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          disabled={idx === galleryList.length - 1}
                          onClick={() => handleMovePhoto(idx, 'down')}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.62rem',
                            borderRadius: '3px',
                            border: '1px solid var(--border-color)',
                            background: idx === galleryList.length - 1 ? '#f8fafc' : '#fff',
                            cursor: idx === galleryList.length - 1 ? 'not-allowed' : 'pointer',
                            color: idx === galleryList.length - 1 ? '#cbd5e1' : 'var(--text-main)',
                          }}
                          title="Pindah ke urutan selanjutnya"
                        >
                          ▶
                        </button>
                      </div>

                      {/* Copy & Delete */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyPhotoUrl(imgUrl, idx)}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.62rem',
                            borderRadius: '3px',
                            border: '1px solid var(--border-color)',
                            background: copiedPhotoUrl === idx ? '#ecfdf5' : '#fff',
                            color: copiedPhotoUrl === idx ? '#047857' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                          title="Salin URL gambar"
                        >
                          {copiedPhotoUrl === idx ? '✓' : '📋'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(idx)}
                          style={{
                            padding: '2px 5px',
                            fontSize: '0.62rem',
                            borderRadius: '3px',
                            border: '1px solid #fecaca',
                            background: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                          title="Hapus foto dari galeri"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Widget Canvas Terkait Lightbox */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🧩 Widget Canvas Terkait Lightbox
            </div>
            {canvasGalleryNodes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <p style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Ditemukan <strong>{canvasGalleryNodes.length} elemen Gambar</strong> di kanvas dengan opsi <em>&quot;Tambahkan ke Galeri Lightbox&quot;</em> aktif. Foto-foto ini juga ikut muncul di navigasi Lightbox tamu:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {canvasGalleryNodes.map((cNode) => (
                    <div
                      key={`canvas-gal-${cNode.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        background: 'var(--bg-body)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <img
                          src={cNode.content || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'}
                          alt="Canvas widget"
                          style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {(cNode as any).name || `Gambar (${cNode.id.substring(0, 6)})`}
                          </div>
                          <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>
                            {cNode.sectionType ? `Section: ${cNode.sectionType}` : 'Widget Gambar'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          selectNode(cNode.id);
                          setSidebarTab('properties');
                        }}
                        style={{
                          padding: '2px 7px',
                          fontSize: '0.65rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          background: '#fff',
                          cursor: 'pointer',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                        title="Pilih dan buka pengaturan elemen di tab Properties"
                      >
                        🎯 Pilih
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.65rem', background: 'var(--bg-body)', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                <p style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  💡 <strong>Tips Tambahan:</strong> Kamu juga dapat mencentang opsi <em>&quot;Tambahkan ke Galeri Lightbox&quot;</em> pada widget Gambar mana pun di canvas agar otomatis ikut muncul saat tamu membuka Lightbox popup.
                </p>
              </div>
            )}
          </div>

          {/* Card: Fitur Interaksi Lightbox */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ✨ Fitur Interaksi Lightbox
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              <div style={{ padding: '0.4rem 0.5rem', background: 'var(--bg-body)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                🔍 <strong>Zoom &amp; Pan</strong><br />Bisa di-zoom 1x, 2x, 3x
              </div>
              <div style={{ padding: '0.4rem 0.5rem', background: 'var(--bg-body)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                ↔️ <strong>Navigasi</strong><br />Panah &amp; Keyboard Arrow
              </div>
              <div style={{ padding: '0.4rem 0.5rem', background: 'var(--bg-body)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                📱 <strong>Mobile Gesture</strong><br />Sentuhan &amp; Swipe responsif
              </div>
              <div style={{ padding: '0.4rem 0.5rem', background: 'var(--bg-body)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                📺 <strong>Fullscreen</strong><br />Tampilan penuh tanpa distraksi
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Media Library Modal for Gallery Upload / Selection */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url) => {
          handleAddPhoto(url);
          setIsMediaModalOpen(false);
        }}
        folders={['gallery', 'studio', 'images']}
      />

      {/* Lightbox Modal for Testing and Preview */}
      {lightboxIndex !== null && (
        <LightboxModal
          images={galleryList}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
