'use client';

import React from 'react';

interface RsvpSuccessModalProps {
  data: {
    name: string;
    attendance: string;
    message: string;
  } | null;
  onClose: () => void;
  onScrollToWishes?: () => void;
}

export function RsvpSuccessModal({ data, onClose, onScrollToWishes }: RsvpSuccessModalProps) {
  if (!data) return null;

  const isHadir = data.attendance.toLowerCase().includes('hadir') && !data.attendance.toLowerCase().includes('tidak');
  const isTidakHadir = data.attendance.toLowerCase().includes('tidak hadir');

  let iconHeader = '🎉';
  let badgeColor = '#16a34a';
  let badgeBg = '#dcfce7';
  let title = 'Hadir & Siap Merayakan! ✨';
  let personalDesc = `Kehadiran dan doa restu Anda adalah kebahagiaan terbesar bagi kedua mempelai. Sampai jumpa di hari bahagia kami! 🥂✨`;

  if (isTidakHadir) {
    iconHeader = '💌';
    badgeColor = '#dc2626';
    badgeBg = '#fee2e2';
    title = 'Doa Restu Anda Sangat Berarti 🙏';
    personalDesc = `Meskipun belum dapat hadir secara langsung, doa tulus dan ucapan hangat dari Kakak sangat bermakna bagi kami. Saling mendoakan yang terbaik! 🌸`;
  } else if (!isHadir) {
    iconHeader = '🕊️';
    badgeColor = '#d97706';
    badgeBg = '#fef3c7';
    title = 'Konfirmasi Diterima ✨';
    personalDesc = `Konfirmasi Kakak telah kami catat dengan baik. Kami sangat berharap Kakak bisa menyempatkan waktu untuk hadir merayakan momen bahagia ini! 💖`;
  }

  const handleGoToWishes = () => {
    onClose();
    if (onScrollToWishes) {
      onScrollToWishes();
    } else {
      const wishesEl = document.querySelector('[data-widget="wishes-feed"], .is-wishes-feed');
      if (wishesEl) {
        wishesEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInModal 0.3s ease-out forwards',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUpModal {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2rem 1.5rem 1.75rem 1.5rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          textAlign: 'center',
          position: 'relative',
          animation: 'scaleUpModal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Icon Badge */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: badgeBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            margin: '-52px auto 1rem auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            border: '4px solid #ffffff',
          }}
        >
          {iconHeader}
        </div>

        {/* Greeting & Name */}
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: badgeColor,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backgroundColor: badgeBg,
            padding: '4px 12px',
            borderRadius: '20px',
            marginBottom: '0.5rem',
          }}
        >
          {data.attendance}
        </span>

        <h3
          style={{
            margin: '0.2rem 0 0.5rem 0',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#0f172a',
            fontFamily: 'Playfair Display, serif',
            lineHeight: 1.25,
          }}
        >
          Terima Kasih, Kak {data.name}!
        </h3>

        <h5
          style={{
            margin: '0 0 1rem 0',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#e36397',
          }}
        >
          {title}
        </h5>

        {/* Personal Message Paragraph */}
        <p
          style={{
            fontSize: '0.85rem',
            color: '#475569',
            lineHeight: 1.6,
            margin: '0 0 1.5rem 0',
            padding: '0.75rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
          }}
        >
          "{personalDesc}"
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={handleGoToWishes}
            style={{
              width: '100%',
              padding: '0.85rem 1.2rem',
              backgroundColor: '#e36397',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(227, 99, 151, 0.35)',
              transition: 'transform 0.15s ease, boxShadow 0.15s ease',
            }}
          >
            💬 Lihat Dinding Ucapan
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: '14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tutup 💖
          </button>
        </div>
      </div>
    </div>
  );
}
