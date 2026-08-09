'use client';

import Link from 'next/link';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    type: string;
    subdomain: string;
    views: number;
    status: string;
    date: string | null;
    _count?: { guests: number };
  };
  onDelete: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const isAktif = event.status === 'Aktif';

  return (
    <div className="pricing-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
      <div className="card-inner" style={{ padding: '2rem 1.75rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <span className={`status-badge ${isAktif ? 'yes' : 'no'}`}>
              {event.status}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {event.type}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {event.title}
          </h3>

          <a
            href={`/invite/${event.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem', display: 'block', textDecoration: 'none' }}
          >
            {event.subdomain}.joinme.id ↗
          </a>

          <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-body)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                {event.views.toLocaleString('id-ID')}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Pengunjung
              </span>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)' }}>
                {event._count?.guests || 0}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                RSVP Tamu
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <Link
            href={`/events/${event.id}/edit`}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.75rem', textAlign: 'center' }}
          >
            Edit Konten ✏️
          </Link>
          <Link
            href={`/events/${event.id}/guests`}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
          >
            Tamu 👥
          </Link>
          <Link
            href={`/studio/${event.id}`}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
          >
            Studio 🎨
          </Link>
          <button
            onClick={() => onDelete(event.id)}
            style={{ padding: '0.5rem 0.65rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
            title="Hapus Undangan"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
