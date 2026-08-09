'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TopBarProps {
  title?: string;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onSaveAsNew?: () => void;
  onReset: () => void;
  onPreview: () => void;
  saving: boolean;
}

export function TopBar({
  viewportMode,
  setViewportMode,
  onSave,
  onSaveAsNew,
  onReset,
  onPreview,
  saving,
}: TopBarProps) {
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

  return (
    <header className="studio-topbar">
      {/* Brand & Badge */}
      <div className="studio-brand">
        <Link href="/dashboard" className="logo" style={{ margin: 0, fontSize: '1.1rem' }}>
          <svg className="logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Join<span className="logo-accent">Me</span> Studio</span>
        </Link>
        <span className="studio-badge">⚡ Flexbox Canvas</span>
      </div>

      {/* Viewport Device Mode Switcher */}
      <div className="viewport-switcher">
        <button
          type="button"
          className={`viewport-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
          onClick={() => setViewportMode('desktop')}
          title="Preview Desktop Mode"
        >
          💻 <span>Desktop</span>
        </button>
        <button
          type="button"
          className={`viewport-btn ${viewportMode === 'tablet' ? 'active' : ''}`}
          onClick={() => setViewportMode('tablet')}
          title="Preview Tablet Mode"
        >
          📱 <span>Tablet</span>
        </button>
        <button
          type="button"
          className={`viewport-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
          onClick={() => setViewportMode('mobile')}
          title="Preview Mobile Mode"
        >
          📱 <span>Mobile</span>
        </button>
      </div>

      {/* Theme & Save Actions */}
      <div className="studio-actions">
        <ThemeToggle />

        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
        >
          🔄 Reset
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
        >
          👁️ Pratinjau
        </button>

        <Link
          href="/dashboard"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', textDecoration: 'none' }}
        >
          Batal
        </Link>

        {/* Split Save Button with Dropdown */}
        <div className="split-btn-container" style={{ position: 'relative', display: 'inline-flex', alignItems: 'stretch', borderRadius: '8px', overflow: 'visible', zIndex: 100000, boxShadow: '0 4px 12px rgba(139, 94, 60, 0.15)' }}>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem', fontWeight: 800, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {saving ? 'Menyimpan...' : 'Simpan Template'}
          </button>
          <button
            type="button"
            onClick={() => setShowSaveDropdown(!showSaveDropdown)}
            className="btn btn-primary"
            style={{ fontSize: '0.65rem', padding: '0.55rem 0.75rem', fontWeight: 800, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div className={`save-dropdown-menu ${showSaveDropdown ? 'show' : ''}`} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg-surface)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)', minWidth: '260px', padding: '0.5rem', transformOrigin: 'top right' }}>
            <button
              type="button"
              onClick={() => { setShowSaveDropdown(false); onSave(); }}
              className="dropdown-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', width: '100%', textAlign: 'left', padding: '0.65rem 0.85rem', background: 'none', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Simpan &amp; Perbarui
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 400, paddingLeft: '1.35rem' }}>Menimpa data template yang sedang aktif.</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowSaveDropdown(false); onSaveAsNew && onSaveAsNew(); }}
              className="dropdown-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', width: '100%', textAlign: 'left', padding: '0.65rem 0.85rem', background: 'none', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '0.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Simpan sebagai Baru
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 400, paddingLeft: '1.35rem' }}>Membuat duplikat template baru secara terpisah.</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
