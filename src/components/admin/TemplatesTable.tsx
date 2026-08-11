'use client';

import Link from 'next/link';

interface TemplatesTableProps {
  templates: any[];
  onDelete: (id: string) => void;
}

export function TemplatesTable({ templates, onDelete }: TemplatesTableProps) {
  return (
    <div className="admin-table-container">
      {/* Table Header Controls */}
      <div className="admin-table-header">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Katalog Template &amp; Tema Undangan
          </h3>
          <p className="panel-desc" style={{ margin: 0 }}>
            Atur ketersediaan desain template dan lisensi tier berlangganan.
          </p>
        </div>

        <div>
          <Link
            href="/studio/new"
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            ✨ Buat Template Undangan Baru
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 700 }}>
              <th style={{ padding: '1rem 1.5rem' }}>Template</th>
              <th style={{ padding: '1rem 1.5rem' }}>Kategori</th>
              <th style={{ padding: '1rem 1.5rem' }}>Lisensi Tier</th>
              <th style={{ padding: '1rem 1.5rem' }}>Pengguna (Views)</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Aksi Kontrol</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Belum ada data template.
                </td>
              </tr>
            ) : (
              templates.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {t.thumbnail && (
                        <img
                          src={t.thumbnail}
                          alt={t.name}
                          style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      )}
                      <span>{t.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="admin-badge badge-info">{t.category}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${t.tier === 'Pro' ? 'badge-purple' : t.tier === 'Enterprise' ? 'badge-warning' : 'badge-success'}`}>
                      {t.tier}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{t.views || 0}x dipakai</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${t.status === 'Aktif' ? 'badge-success' : 'badge-danger'}`}>
                      {t.status === 'Aktif' ? '● Aktif' : '● Nonaktif'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <Link
                        href={`/studio/${t.id}`}
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: 'none' }}
                      >
                        Edit di Studio
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(t.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
