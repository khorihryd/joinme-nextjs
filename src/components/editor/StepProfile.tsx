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

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', marginBottom: '1.25rem', overflow: 'hidden' }}>
              {details.fotoPria ? (
                <div style={{ position: 'relative' }}>
                  <img src={details.fotoPria} alt="Mempelai Pria" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setDetails((prev: any) => ({ ...prev, fotoPria: '' }))}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1rem 0' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>👨‍💼</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Belum ada foto mempelai pria</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Foto Mempelai Pria</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <label
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📁 Upload Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const res = evt.target?.result as string;
                          if (res) setDetails((prev: any) => ({ ...prev, fotoPria: res }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                <input
                  type="text"
                  value={details.fotoPria || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoPria: e.target.value }))}
                  placeholder="atau tempel URL foto..."
                  style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>
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

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', marginBottom: '1.25rem', overflow: 'hidden' }}>
              {details.fotoWanita ? (
                <div style={{ position: 'relative' }}>
                  <img src={details.fotoWanita} alt="Mempelai Wanita" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setDetails((prev: any) => ({ ...prev, fotoWanita: '' }))}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1rem 0' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>👩‍💼</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Belum ada foto mempelai wanita</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Foto Mempelai Wanita</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <label
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📁 Upload Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const res = evt.target?.result as string;
                          if (res) setDetails((prev: any) => ({ ...prev, fotoWanita: res }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                <input
                  type="text"
                  value={details.fotoWanita || ''}
                  onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoWanita: e.target.value }))}
                  placeholder="atau tempel URL foto..."
                  style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>
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
