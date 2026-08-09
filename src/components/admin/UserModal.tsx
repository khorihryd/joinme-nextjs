'use client';

import { useState, useEffect } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  user?: any;
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Free');
  const [status, setStatus] = useState('Aktif');
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPlan(user.plan || 'Free');
      setStatus(user.status || 'Aktif');
      setRole(user.role || 'user');
    } else {
      setName('');
      setEmail('');
      setPlan('Free');
      setStatus('Aktif');
      setRole('user');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: user?.id,
      name,
      email,
      plan,
      status,
      role,
    });
  };

  return (
    <div className="admin-modal-overlay active" style={{ zIndex: 9999 }}>
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {user ? 'Edit Pengguna SaaS' : 'Tambah Pengguna Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sarah Jenkins"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                required
              />
            </div>

            <div className="pricing-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Paket Berlangganan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="event-select-input"
                  style={{ width: '100%' }}
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="event-select-input"
                  style={{ width: '100%' }}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="form-group">
                <label>Role Hak Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="event-select-input"
                  style={{ width: '100%' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
