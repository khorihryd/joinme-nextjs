'use client';

import React from 'react';
import { resolveTextVariables } from '@/store/studio-store';

interface ThankYouClosingProps {
  content?: string;
  eventDetails?: any;
  isPreviewMode?: boolean;
}

const DEFAULT_CLOSING_TEXT =
  'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami. Atas kehadiran dan doa restunya, kami ucapkan terima kasih.';

export function ThankYouClosing({ content, eventDetails, isPreviewMode }: ThankYouClosingProps) {
  const rawText = content || DEFAULT_CLOSING_TEXT;
  const resolvedText = resolveTextVariables(rawText, eventDetails);

  const groomName = resolveTextVariables('{nama_pria}', eventDetails) || 'Roni';
  const brideName = resolveTextVariables('{nama_wanita}', eventDetails) || 'Anti';
  const coupleName = resolveTextVariables('{nama_mempelai}', eventDetails) || `${brideName} & ${groomName}`;

  const familyBride = resolveTextVariables('{keluarga_wanita}', eventDetails) || resolveTextVariables('{ortu_wanita}', eventDetails) || 'Keluarga Mempelai Wanita';
  const familyGroom = resolveTextVariables('{keluarga_pria}', eventDetails) || resolveTextVariables('{ortu_pria}', eventDetails) || 'Keluarga Mempelai Pria';

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '16px',
        padding: '28px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top Floral Ornament */}
      <div style={{ color: 'var(--primary, #e36397)', fontSize: '1.2rem', opacity: 0.8, letterSpacing: '4px' }}>
        ❦ ───────── ❦
      </div>

      {/* Headline Title */}
      <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', fontFamily: 'Playfair Display, serif', margin: 0 }}>
        Terima Kasih
      </h3>

      {/* Main Closing Message */}
      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.7', fontFamily: 'Inter, sans-serif', margin: 0, maxWidth: '500px' }}>
        {resolvedText}
      </p>

      {/* Middle Divider */}
      <div style={{ width: '40px', height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

      {/* Happy Couples Citation */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>
          Kami yang berbahagia,
        </span>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary, #e36397)', fontFamily: 'Playfair Display, serif' }}>
          {coupleName}
        </span>
      </div>

      {/* Big Families Representation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px 32px',
          marginTop: '8px',
          paddingTop: '12px',
          borderTop: '1px dashed #cbd5e1',
          width: '100%',
          maxWidth: '460px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 180px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
            Keluarga Mempelai Wanita
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginTop: '2px', textAlign: 'center' }}>
            {familyBride}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 180px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
            Keluarga Mempelai Pria
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginTop: '2px', textAlign: 'center' }}>
            {familyGroom}
          </span>
        </div>
      </div>
    </div>
  );
}
