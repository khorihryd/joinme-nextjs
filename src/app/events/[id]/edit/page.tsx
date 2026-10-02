'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = resolvedParams?.id;
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/studio/${id}`);
    }
  }, [id, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff2ef' }}>
      <div style={{ textAlign: 'center', color: '#666', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎨</div>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main, #333)' }}>Membuka Studio Editor...</p>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Mengalihkan ke studio desain...</p>
      </div>
    </div>
  );
}
