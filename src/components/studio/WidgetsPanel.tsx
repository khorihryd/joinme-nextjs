'use client';

import { StudioNode } from '@/types';

interface WidgetsPanelProps {
  onAddWidget: (type: StudioNode['type']) => void;
  onAddRootContainer?: () => void;
  onInsertVariable?: (varTag: string) => void;
}

export function WidgetsPanel({ onAddWidget, onAddRootContainer, onInsertVariable }: WidgetsPanelProps) {
  const widgetItems = [
    { type: 'heading' as const, label: 'Heading', icon: '📛' },
    { type: 'text' as const, label: 'Text Block', icon: '📝' },
    { type: 'image' as const, label: 'Gambar', icon: '🖼️' },
    { type: 'button' as const, label: 'Tombol', icon: '🔘' },
    { type: 'countdown' as const, label: 'Countdown', icon: '⏳' },
    { type: 'map' as const, label: 'Google Map', icon: '🗺️' },
    { type: 'divider' as const, label: 'Divider', icon: '➖' },
    { type: 'spacer' as const, label: 'Spacer', icon: '↕️' },
    { type: 'event' as const, label: 'Event', icon: '📅' },
    { type: 'lovestory' as const, label: 'Love Story', icon: '💖' },
    { type: 'gallery' as const, label: 'Galeri Foto', icon: '📸' },
    { type: 'slider' as const, label: 'Slide Gambar', icon: '🎠' },
    { type: 'rsvp' as const, label: 'Form RSVP', icon: '💌' },
    { type: 'wishes' as const, label: 'Dinding Ucapan', icon: '💬' },
    { type: 'social-media' as const, label: 'Medsos & Contact', icon: '📱' },
    { type: 'container' as const, label: 'Inner Container', icon: '📦' },
  ];

  const variableChips = [
    { tag: '{{groom_name}}', label: '+ groom_name' },
    { tag: '{{bride_name}}', label: '+ bride_name' },
    { tag: '{{event_date}}', label: '+ event_date' },
  ];

  return (
    <div id="sidebar-content-widgets" className="sidebar-tab-content" style={{ display: 'block', height: 'calc(100% - 38px)', overflowY: 'auto' }}>
      {/* Containers */}
      <div className="widget-category-title">Tata Letak (Containers)</div>
      <div className="widget-grid">
        <button
          type="button"
          className="widget-item-btn"
          id="btn-add-root-container"
          onClick={() => onAddRootContainer ? onAddRootContainer() : onAddWidget('container')}
        >
          <span>📦</span>
          <div>Flex Container</div>
        </button>
      </div>

      {/* Core Element Widgets */}
      <div className="widget-category-title">Elemen (Widgets)</div>
      <div className="widget-grid">
        {widgetItems.map((item) => (
          <button
            key={item.type}
            type="button"
            className="widget-item-btn"
            onClick={() => onAddWidget(item.type)}
          >
            <span>{item.icon}</span>
            <div>{item.label}</div>
          </button>
        ))}
      </div>

      {/* Dynamic Variables */}
      <div className="widget-category-title" style={{ borderTop: 'var(--studio-border)', paddingTop: '1rem' }}>
        Variabel Dinamis {"{{...}}"}
      </div>
      <div style={{ padding: '0 1.25rem 1.5rem 1.25rem' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Klik chip untuk menyisipkan variabel ke kolom input aktif:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {variableChips.map((chip) => (
            <button
              key={chip.tag}
              type="button"
              className="var-chip"
              onClick={() => onInsertVariable && onInsertVariable(chip.tag)}
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-body)',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
