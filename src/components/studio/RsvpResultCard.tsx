'use client';

import React from 'react';

interface RsvpResultCardProps {
  data: {
    name: string;
    attendance: string;
    pax?: string;
    message?: string;
  };
  onReset: () => void;
  style?: React.CSSProperties;
}

export function RsvpResultCard({ data, onReset, style }: RsvpResultCardProps) {
  const attendanceLower = data.attendance.toLowerCase();
  const isHadir = attendanceLower.includes('hadir') && !attendanceLower.includes('tidak');
  const isTidakHadir = attendanceLower.includes('tidak');

  const guestName = data.name || 'Tamu Undangan';
  const paxText = data.pax ? `${data.pax} Orang` : '1 Orang';
  const qrCodeData = `JOINME-CHECKIN|${guestName}|${data.attendance}|${Date.now()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}&color=0f172a&bgcolor=ffffff`;

  if (isHadir) {
    return (
      <div
        style={{
          width: '100%',
          padding: '24px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
          ...style,
        }}
      >
        {/* Header Badge */}
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#16a34a',
            backgroundColor: '#dcfce7',
            padding: '4px 14px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          🎫 Digital E-Ticket Check-In
        </span>

        <h3
          style={{
            margin: 0,
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0f172a',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          Selamat Datang, Kak {guestName}!
        </h3>

        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
          Konfirmasi kehadiran Anda (<strong>{paxText}</strong>) telah tersimpan.
        </p>

        {/* QR Code Container */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px dashed #cbd5e1',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code Check-in"
            style={{ width: '160px', height: '160px', borderRadius: '8px' }}
          />
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
            Tunjukkan QR Code ini kepada penerima tamu saat tiba di acara.
          </span>
        </div>

        {/* Message preview */}
        {data.message && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.8rem',
              fontStyle: 'italic',
              color: '#475569',
              backgroundColor: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '10px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            "{data.message}"
          </p>
        )}

        {/* Change Mind / Reset Button */}
        <button
          type="button"
          onClick={onReset}
          style={{
            marginTop: '6px',
            padding: '8px 16px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#e36397',
            backgroundColor: '#fdf2f8',
            border: '1px solid rgba(227, 99, 151, 0.3)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          ✏️ Edit Konfirmasi / Berubah Pikiran?
        </button>
      </div>
    );
  }

  // Case Tidak Hadir or Ragu-ragu
  return (
    <div
      style={{
        width: '100%',
        padding: '28px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        ...style,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: isTidakHadir ? '#fee2e2' : '#fef3c7',
          color: isTidakHadir ? '#dc2626' : '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
        }}
      >
        {isTidakHadir ? '💌' : '🕊️'}
      </div>

      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: isTidakHadir ? '#dc2626' : '#d97706',
          backgroundColor: isTidakHadir ? '#fee2e2' : '#fef3c7',
          padding: '3px 12px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {data.attendance}
      </span>

      <h3
        style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: 800,
          color: '#0f172a',
          fontFamily: 'Playfair Display, serif',
        }}
      >
        Terima Kasih atas Konfirmasi Anda, Kak {guestName} 🙏
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: '0.84rem',
          color: '#475569',
          lineHeight: 1.6,
          backgroundColor: '#f8fafc',
          padding: '12px 14px',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
        }}
      >
        {isTidakHadir
          ? `Meskipun belum dapat hadir secara langsung, ucapan & doa tulus dari Kakak sangat berarti bagi kami. Semoga berkah & kesehatan senantiasa menyertai Kakak. 🌸`
          : `Konfirmasi Kakak telah kami catat dengan baik. Kami sangat berharap Kakak bisa menyempatkan waktu untuk hadir merayakan momen bahagia ini bersama kami! 💖`}
      </p>

      {/* Change Mind Button */}
      <button
        type="button"
        onClick={onReset}
        style={{
          marginTop: '8px',
          padding: '10px 18px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#ffffff',
          backgroundColor: '#e36397',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(227, 99, 151, 0.35)',
        }}
      >
        🔄 Berubah Pikiran? Isi Ulang RSVP
      </button>
    </div>
  );
}
