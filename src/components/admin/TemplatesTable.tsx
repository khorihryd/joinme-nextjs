import React, { useState } from 'react';
import Link from 'next/link';
import { CreateTemplateModal } from '@/components/admin/CreateTemplateModal';

interface TemplatesTableProps {
  templates: any[];
  onDelete: (id: string) => void;
  onUpdate?: (updatedTemplate: any) => void;
}

export function TemplatesTable({ templates, onDelete, onUpdate }: TemplatesTableProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleOpenJsonEditor = (t: any) => {
    const editableData = {
      name: t.name,
      category: t.category,
      tier: t.tier,
      status: t.status,
      thumbnail: t.thumbnail,
      globalStyles: t.globalStyles,
      nodes: t.nodes,
    };
    setEditingTemplate(t);
    setJsonText(JSON.stringify(editableData, null, 2));
    setJsonError(null);
  };

  const handleSaveJson = async () => {
    if (!editingTemplate) return;
    try {
      // Validate JSON
      const parsedData = JSON.parse(jsonText);

      // Save via PUT API
      const res = await fetch(`/api/templates?id=${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal memperbarui template');
      }

      const updatedTemplate = await res.json();
      if (onUpdate) {
        onUpdate(updatedTemplate);
      }
      setEditingTemplate(null);
    } catch (err: any) {
      setJsonError(err.message || 'JSON format tidak valid');
    }
  };

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
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', cursor: 'pointer' }}
          >
            ✨ Buat Template Undangan Baru
          </button>
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
                        onClick={() => handleOpenJsonEditor(t)}
                        style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        Edit JSON
                      </button>
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

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* JSON Editor Modal */}
      {editingTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🛠️ Edit Raw JSON Template: {editingTemplate.name}
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Sesuaikan meta, variabel global, dan array tree nodes di bawah ini secara langsung.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {jsonError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  ⚠️ Error Parsing JSON: {jsonError}
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '350px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.75rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body, #f8fafc)',
                  color: 'var(--text-main)',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-body)'
            }}>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="btn"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveJson}
                className="btn btn-primary"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                💾 Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
