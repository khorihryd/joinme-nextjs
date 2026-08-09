'use client';

import { formatRupiah, formatNumber } from '@/lib/utils';

interface StatsGridProps {
  userCount: number;
  eventCount: number;
  activeEventCount?: number;
  totalRevenue?: number;
  totalViews?: number;
}

export function StatsGrid({
  userCount,
  eventCount,
  activeEventCount = 0,
  totalRevenue = 0,
  totalViews = 0,
}: StatsGridProps) {
  return (
    <div className="admin-stat-grid">
      <div className="admin-stat-card">
        <div className="admin-stat-title">Total Pengguna SaaS</div>
        <div className="admin-stat-value">{userCount}</div>
        <div className="admin-stat-sub">
          <span style={{ color: '#16a34a', fontWeight: 700 }}>+24%</span> bulan ini
        </div>
      </div>

      <div className="admin-stat-card accent-green">
        <div className="admin-stat-title">Total Undangan Terbit</div>
        <div className="admin-stat-value">{eventCount}</div>
        <div className="admin-stat-sub">{activeEventCount} Undangan Aktif</div>
      </div>

      <div className="admin-stat-card accent-gold">
        <div className="admin-stat-title">Total Pendapatan (Revenue)</div>
        <div className="admin-stat-value">{formatRupiah(totalRevenue)}</div>
        <div className="admin-stat-sub">
          <span style={{ color: '#16a34a', fontWeight: 700 }}>Lunas &amp; Terverifikasi</span>
        </div>
      </div>

      <div className="admin-stat-card accent-purple">
        <div className="admin-stat-title">Total Kunjungan (Views)</div>
        <div className="admin-stat-value">{formatNumber(totalViews)}</div>
        <div className="admin-stat-sub">Akumulasi Seluruh Undangan</div>
      </div>
    </div>
  );
}
