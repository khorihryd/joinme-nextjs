'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export function SettingsTab() {
  const { showToast } = useToast();
  const [siteName, setSiteName] = useState('JoinMe - Digital Invitation SaaS Platform');
  const [bannerText, setBannerText] = useState('🎉 Diskon 30% Paket Pro Pernikahan bulan ini! Gunakan kode: PRO2026');
  const [supportEmail, setSupportEmail] = useState('support@joinme.id');
  const [maintenance, setMaintenance] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Pengaturan sistem berhasil disimpan! ⚙️', 'success');
  };

  return (
    <div className="db-card-panel" style={{ padding: '2rem', maxWidth: '720px', marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
        Pengaturan Global Platform JoinMe
      </h3>

      <form onSubmit={handleSubmit} className="sim-form">
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label>Nama Platform SaaS</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label>Pengumuman Banner System (Top Announcement)</label>
          <input
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label>Email Customer Support</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>

        <div className="switch-toggle-container" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
              Mode Pemeliharaan (Maintenance Mode)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Jika diaktifkan, portal pengguna akan menampilkan pesan pemeliharaan sistem.
            </p>
          </div>
          <label className="switch-toggle" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                backgroundColor: maintenance ? '#16a34a' : '#ccc',
                transition: '.3s',
                borderRadius: '24px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: maintenance ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '.3s',
                  borderRadius: '50%',
                }}
              />
            </span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontWeight: 700 }}>
          Simpan Pengaturan Sistem
        </button>
      </form>
    </div>
  );
}
