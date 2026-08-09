'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EventsTableProps {
  events: any[];
  onDelete: (id: string) => void;
}

export function EventsTable({ events, onDelete }: EventsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-table-container">
      {/* Table Header Controls */}
      <div className="admin-table-header">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Manajemen &amp; Moderasi Undangan
          </h3>
          <p className="panel-desc" style={{ margin: 0 }}>
            Pantau dan moderasi seluruh publikasi website undangan di platform JoinMe.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="admin-search-wrapper">
            <input
              type="text"
              placeholder="Cari judul / subdomain..."
              className="admin-search-input"
              style={{ width: '220px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="event-select-input"
            style={{ padding: '0.5rem 2.25rem 0.5rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif 🚀</option>
            <option value="Draft">Draft 📄</option>
            <option value="Diblokir">Diblokir 🚫</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 700 }}>
              <th style={{ padding: '1rem 1.5rem' }}>Judul Undangan</th>
              <th style={{ padding: '1rem 1.5rem' }}>Subdomain</th>
              <th style={{ padding: '1rem 1.5rem' }}>Kategori</th>
              <th style={{ padding: '1rem 1.5rem' }}>Total Views</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem' }}>Tanggal Acara</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Aksi Moderasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada data undangan ditemukan.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ev.title}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <Link
                      href={`/invite/${ev.subdomain}`}
                      target="_blank"
                      style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {ev.subdomain}.joinme.id ↗
                    </Link>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="admin-badge badge-info">{ev.type}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{ev.views || 0} views</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${ev.status === 'Aktif' ? 'badge-success' : ev.status === 'Draft' ? 'badge-warning' : 'badge-danger'}`}>
                      {ev.status === 'Aktif' ? '🚀 Aktif' : ev.status === 'Draft' ? '📄 Draft' : '🚫 Diblokir'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {ev.date || '21 Sept 2026'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <Link
                        href={`/events/${ev.id}/edit`}
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: 'none' }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(ev.id)}
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
