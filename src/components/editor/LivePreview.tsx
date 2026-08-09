'use client';

interface LivePreviewProps {
  subdomain?: string;
  onClose: () => void;
}

export function LivePreview({ subdomain, onClose }: LivePreviewProps) {
  return (
    <div className="preview-sidebar visible" style={{ zIndex: 1000 }}>
      <div style={{ padding: '1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>📱 Pratinjau Langsung</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>
      <iframe
        src={`/invite/${subdomain}`}
        className="preview-iframe-el"
        title="Live Mobile Preview"
      />
    </div>
  );
}
