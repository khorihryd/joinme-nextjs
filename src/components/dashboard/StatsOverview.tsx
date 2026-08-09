'use client';

interface StatsOverviewProps {
  totalEvents: number;
  activeEvents: number;
  totalViews: number;
  totalGuests: number;
}

export function StatsOverview({ totalEvents, activeEvents, totalViews, totalGuests }: StatsOverviewProps) {
  return (
    <div className="db-kpi-grid" style={{ marginBottom: '2.5rem' }}>
      <div className="kpi-card accent-purple">
        <span className="stat-label">Total Undangan</span>
        <h2 className="stat-value">{totalEvents}</h2>
        <span className="stat-sub">Semua acara</span>
      </div>

      <div className="kpi-card accent-green">
        <span className="stat-label">Undangan Aktif</span>
        <h2 className="stat-value">{activeEvents}</h2>
        <span className="stat-sub">Dipublikasikan</span>
      </div>

      <div className="kpi-card accent-gold">
        <span className="stat-label">Total Pengunjung</span>
        <h2 className="stat-value">{totalViews}</h2>
        <span className="stat-sub">Tampilan web</span>
      </div>

      <div className="kpi-card accent-purple">
        <span className="stat-label">Tamu RSVP</span>
        <h2 className="stat-value">{totalGuests}</h2>
        <span className="stat-sub">Konfirmasi hadir</span>
      </div>
    </div>
  );
}
