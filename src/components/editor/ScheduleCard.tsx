'use client';

interface ScheduleCardProps {
  schedule: {
    name: string;
    date: string;
    time: string;
    place: string;
    address: string;
  };
  onRemove: () => void;
}

export function ScheduleCard({ schedule, onRemove }: ScheduleCardProps) {
  return (
    <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{schedule.name}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>📅 {schedule.date} — {schedule.time}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>📍 {schedule.place}, {schedule.address}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
      >
        Hapus
      </button>
    </div>
  );
}
