'use client';

import React from 'react';

interface WidgetsRuntimeProps {
  widgetType?: string;
  onAction?: (actionName: string) => void;
}

export function WidgetsRuntime({ widgetType, onAction }: WidgetsRuntimeProps) {
  if (widgetType === 'rsvp-form') {
    return (
      <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#fdf2f8', border: '1px solid rgba(219, 39, 119, 0.2)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#db2777', fontSize: '1rem', fontWeight: 800 }}>Form RSVP Tamu</h4>
        <input type="text" placeholder="Nama Anda" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.85rem' }} readOnly />
        <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          <option>Hadir</option>
          <option>Tidak Hadir</option>
        </select>
        <button
          onClick={() => onAction && onAction('submit-rsvp')}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#db2777', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Kirim RSVP
        </button>
      </div>
    );
  }

  return null;
}
