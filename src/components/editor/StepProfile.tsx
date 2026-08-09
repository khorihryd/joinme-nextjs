'use client';

interface StepProfileProps {
  isWedding: boolean;
  details: any;
  setDetails: (fn: (prev: any) => any) => void;
  onNext: () => void;
}

export function StepProfile({ isWedding, details, setDetails, onNext }: StepProfileProps) {
  return (
    <div className="form-step-panel active">
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
        {isWedding ? 'Profil Mempelai Pengantin' : 'Profil Penyelenggara Acara'}
      </h2>
      <p className="panel-desc" style={{ marginBottom: '2rem' }}>
        {isWedding ? 'Lengkapi informasi data nama lengkap mempelai pria dan wanita beserta orang tua.' : 'Isi rincian lengkap penyelenggara acara.'}
      </p>

      {isWedding ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '2rem' }}>
          {/* Mempelai Pria */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Mempelai Pria</h3>
            </div>

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Belum ada foto</span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tautan Foto Mempelai Pria (URL)</label>
              <input
                type="text"
                value={details.fotoPria || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoPria: e.target.value }))}
                placeholder="Contoh: https://images.unsplash.com/photo-..."
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap Mempelai Pria</label>
              <input
                type="text"
                value={details.mempelaiPria || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, mempelaiPria: e.target.value }))}
                placeholder="Rian"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
              <input
                type="text"
                value={details.panggilanPria || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, panggilanPria: e.target.value }))}
                placeholder="Contoh: Roni"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua (Pria)</label>
              <input
                type="text"
                value={details.ortuPria || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, ortuPria: e.target.value }))}
                placeholder="Contoh: Bapak Ir. Wawan Setiawan & Ibu Asih Ratnasari"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Mempelai Wanita */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Mempelai Wanita</h3>
            </div>

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Belum ada foto</span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tautan Foto Mempelai Wanita (URL)</label>
              <input
                type="text"
                value={details.fotoWanita || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoWanita: e.target.value }))}
                placeholder="Contoh: https://images.unsplash.com/photo-..."
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap Mempelai Wanita</label>
              <input
                type="text"
                value={details.mempelaiWanita || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, mempelaiWanita: e.target.value }))}
                placeholder="Dea"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
              <input
                type="text"
                value={details.panggilanWanita || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, panggilanWanita: e.target.value }))}
                placeholder="Contoh: Anti"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua (Wanita)</label>
              <input
                type="text"
                value={details.ortuWanita || ''}
                onChange={(e) => setDetails((prev: any) => ({ ...prev, ortuWanita: e.target.value }))}
                placeholder="Contoh: Bapak H. Ahmad Solihin & Ibu Hj. Siti Aminah"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="form-group" style={{ marginBottom: '2rem', maxWidth: '480px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Penyelenggara / Tuan Rumah</label>
          <input
            type="text"
            value={details.organizerName || ''}
            onChange={(e) => setDetails((prev: any) => ({ ...prev, organizerName: e.target.value }))}
            placeholder="Denny Sumargo"
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
          style={{ padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: 800 }}
        >
          Lanjut ke Waktu &amp; Tempat &rarr;
        </button>
      </div>
    </div>
  );
}
