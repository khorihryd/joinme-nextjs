'use client';

interface StoryCardProps {
  story: {
    year: string;
    title: string;
    desc: string;
  };
  onRemove: () => void;
}

export function StoryCard({ story, onRemove }: StoryCardProps) {
  return (
    <div style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>[{story.year}] {story.title}</span>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>{story.desc}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
      >
        Hapus
      </button>
    </div>
  );
}
