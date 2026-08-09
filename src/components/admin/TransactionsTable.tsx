'use client';

import { useState } from 'react';
import { formatRupiah, formatDate } from '@/lib/utils';

interface TransactionsTableProps {
  transactions: any[];
  onDelete: (id: string) => void;
}

export function TransactionsTable({ transactions, onDelete }: TransactionsTableProps) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    return statusFilter === 'all' || tx.status === statusFilter;
  });

  return (
    <div className="admin-table-container">
      {/* Table Header Controls */}
      <div className="admin-table-header">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Riwayat Transaksi &amp; Pembayaran
          </h3>
          <p className="panel-desc" style={{ margin: 0 }}>
            Verifikasi konfirmasi pembayaran dan riwayat invoice berlangganan paket.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="event-select-input"
            style={{ padding: '0.5rem 2.25rem 0.5rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="all">Semua Pembayaran</option>
            <option value="Lunas">Lunas ✅</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi ⏳</option>
            <option value="Gagal">Gagal ❌</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 700 }}>
              <th style={{ padding: '1rem 1.5rem' }}>No. Invoice</th>
              <th style={{ padding: '1rem 1.5rem' }}>Pengguna</th>
              <th style={{ padding: '1rem 1.5rem' }}>Paket Dipesan</th>
              <th style={{ padding: '1rem 1.5rem' }}>Nominal</th>
              <th style={{ padding: '1rem 1.5rem' }}>Metode Bayar</th>
              <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada data transaksi ditemukan.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {tx.id}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tx.user?.name || tx.user || 'User SaaS'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${tx.plan === 'Pro' ? 'badge-purple' : 'badge-gold'}`}>
                      {tx.plan}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatRupiah(tx.amount || 0)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {tx.method || 'QRIS Instant'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`admin-badge ${tx.status === 'Lunas' ? 'badge-success' : tx.status === 'Menunggu Verifikasi' ? 'badge-warning' : 'badge-danger'}`}>
                      {tx.status === 'Lunas' ? '✅ Lunas' : tx.status === 'Menunggu Verifikasi' ? '⏳ Menunggu' : '❌ Gagal'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => onDelete(tx.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      Hapus
                    </button>
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
