'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';

interface UsersTableProps {
  users: any[];
  onDelete: (id: string) => void;
  onEdit: (user: any) => void;
  onAddUser: () => void;
}

export function UsersTable({ users, onDelete, onEdit, onAddUser }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="admin-table-container">
      {/* Table Header Controls */}
      <div className="admin-table-header">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Daftar Pengguna SaaS
          </h3>
          <p className="panel-desc" style={{ margin: 0 }}>
            Kelola akun pengguna, lisensi paket berlangganan, dan status akses.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="admin-search-wrapper">
            <input
              type="text"
              placeholder="Cari nama atau email..."
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
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="event-select-input"
            style={{ padding: '0.5rem 2.25rem 0.5rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="all">Semua Paket</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <button
            type="button"
            onClick={onAddUser}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            + Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 700 }}>
              <th style={{ padding: '1rem 1.5rem' }}>Pengguna</th>
              <th style={{ padding: '1rem 1.5rem' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem' }}>Paket</th>
              <th style={{ padding: '1rem 1.5rem' }}>Total Acara</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem' }}>Tgl Bergabung</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada data pengguna ditemukan.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>
                    <span className={`admin-badge ${u.role === 'admin' ? 'badge-purple' : 'badge-info'}`}>
                      {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${u.plan === 'Pro' ? 'badge-purple' : u.plan === 'Enterprise' ? 'badge-warning' : 'badge-info'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{u.eventsCount || u.events?.length || 0} Acara</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${u.status === 'Aktif' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status === 'Aktif' ? '● Aktif' : '● Nonaktif'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {u.joinedDate ? formatDate(u.joinedDate) : 'Sep 2026'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(u)}
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(u.id)}
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
