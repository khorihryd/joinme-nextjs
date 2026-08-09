'use client';

import { formatRupiah, formatNumber } from '@/lib/utils';
import { StatsGrid } from './StatsGrid';

interface OverviewTabProps {
  users: any[];
  events: any[];
  transactions: any[];
}

export function OverviewTab({ users, events, transactions }: OverviewTabProps) {
  const totalUsers = users.length;
  const totalEvents = events.length;
  const activeEventsCount = events.filter((e) => e.status === 'Aktif').length;
  const totalRevenue = transactions
    .filter((t) => t.status === 'Lunas')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalViews = events.reduce((sum, e) => sum + (e.views || 0), 0);

  // Mock activity log items
  const activityLogs = [
    { text: 'User Roni Wijaya menerbitkan undangan "Pernikahan Roni & Anti"', time: '5 menit lalu', type: 'event' },
    { text: 'Transaksi #TX-98421 (Paket Pro) senilai Rp 149.000 LUNAS', time: '25 menit lalu', type: 'tx' },
    { text: 'Pengguna baru Denny Sumargo mendaftar via Google Sign-In', time: '1 jam lalu', type: 'user' },
    { text: 'Template "Sage Green Luxury" telah dilihat lebih dari 3.400 kali', time: '3 jam lalu', type: 'template' },
  ];

  return (
    <div>
      {/* Metric KPI Cards */}
      <StatsGrid
        userCount={totalUsers}
        eventCount={totalEvents}
        activeEventCount={activeEventsCount}
        totalRevenue={totalRevenue}
        totalViews={totalViews}
      />

      {/* Activity Log & Category Breakdown */}
      <div className="pricing-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-table-container" style={{ marginBottom: 0 }}>
          <div className="admin-table-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Aktivitas Platform Terkini</h3>
            <span className="admin-badge badge-info">Real-time Feed</span>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activityLogs.map((log, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: idx < activityLogs.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1rem' }}>
                      {log.type === 'event' ? '💌' : log.type === 'tx' ? '💳' : log.type === 'user' ? '👤' : '🎨'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{log.text}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="admin-table-container" style={{ marginBottom: 0 }}>
          <div className="admin-table-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Kategori Undangan</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  <span>💍 Pernikahan</span>
                  <span>75%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  <span>🎂 Ulang Tahun</span>
                  <span>15%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: 'var(--accent)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  <span>🏡 Syukuran &amp; Lainnya</span>
                  <span>10%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', background: '#9333ea' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
