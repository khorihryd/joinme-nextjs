'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsTable } from '@/components/admin/EventsTable';
import { TemplatesTable } from '@/components/admin/TemplatesTable';
import { TransactionsTable } from '@/components/admin/TransactionsTable';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { UserModal } from '@/components/admin/UserModal';

const TAB_TITLES: Record<string, string> = {
  overview: 'Dashboard Overview & Statistik',
  users: 'Manajemen Pengguna SaaS',
  events: 'Manajemen & Moderasi Undangan',
  transactions: 'Riwayat Transaksi & Pembayaran',
  templates: 'Katalog Template & Tema Undangan',
  settings: 'Pengaturan Global Platform JoinMe',
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'transactions' | 'templates' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [uRes, eRes, tRes, txRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/events'),
          fetch('/api/templates?all=true'),
          fetch('/api/transactions'),
        ]);

        if (uRes.ok) setUsers(await uRes.json());
        if (eRes.ok) setEvents(await eRes.json());
        if (tRes.ok) setTemplates(await tRes.json());
        if (txRes.ok) setTransactions(await txRes.json());
      } catch (err) {
        showToast('Gagal memuat data admin panel', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [showToast]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        showToast('User berhasil dihapus', 'success');
      }
    } catch (err) {
      showToast('Gagal menghapus user', 'error');
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (userData.id) {
        // Edit existing user
        const res = await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        if (res.ok) {
          const updated = await res.json();
          setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
          showToast('Data user berhasil diperbarui', 'success');
        }
      } else {
        // Add new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        if (res.ok) {
          const newUser = await res.json();
          setUsers([...users, newUser]);
          showToast('User baru berhasil ditambahkan', 'success');
        }
      }
      setIsUserModalOpen(false);
    } catch (err) {
      showToast('Gagal menyimpan data user', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id));
        showToast('Undangan berhasil dihapus', 'success');
      }
    } catch (err) {
      showToast('Gagal menghapus undangan', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) return;
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
        showToast('Template berhasil dihapus', 'success');
      }
    } catch (err) {
      showToast('Gagal menghapus template', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(transactions.filter((tx) => tx.id !== id));
        showToast('Transaksi berhasil dihapus', 'success');
      }
    } catch (err) {
      showToast('Gagal menghapus transaksi', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Memuat data Admin Panel...
      </div>
    );
  }

  const userName = session?.user?.name || 'Super Admin';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="db-container">
      {/* Admin Sidebar Navigation */}
      <aside className={`db-sidebar ${mobileSidebarOpen ? 'active' : ''}`}>
        <div className="db-sidebar-header">
          <Link href="/admin" className="logo">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Join<span className="logo-accent">Me</span> Admin</span>
          </Link>
        </div>

        <nav className="db-menu">
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.5rem', letterSpacing: '0.05em' }}>
            Pusat Kontrol SaaS
          </div>

          <button
            type="button"
            onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
            className={`db-menu-item admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Overview &amp; Stat</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('users'); setMobileSidebarOpen(false); }}
            className={`db-menu-item admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Kelola Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('events'); setMobileSidebarOpen(false); }}
            className={`db-menu-item admin-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Seluruh Undangan</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('transactions'); setMobileSidebarOpen(false); }}
            className={`db-menu-item admin-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Transaksi &amp; Billing</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('templates'); setMobileSidebarOpen(false); }}
            className={`db-menu-item admin-nav-btn ${activeTab === 'templates' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Katalog Template</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
            className={`db-menu-item admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Pengaturan Sistem</span>
          </button>
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-info">
            <div className="db-avatar" style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }}>
              {initials}
            </div>
            <div>
              <h4 className="db-username">{userName}</h4>
              <p className="db-userplan" style={{ color: 'var(--accent)' }}>System Owner</p>
            </div>
          </div>
          <Link href="/dashboard" className="db-logout-btn" title="Ke Portal Pelanggan" style={{ textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Portal User</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <div className="desktop-header-brand">
            <span className="panel-desc">Portal Superadmin SaaS &gt; Central Control</span>
            <h1 className="panel-title" style={{ fontSize: '1.1rem', marginTop: '-2px' }}>
              {TAB_TITLES[activeTab]}
            </h1>
          </div>

          <div className="db-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="admin-badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              <span>🛡️ System Superadmin Active</span>
            </div>

            <ThemeToggle />

            <button
              className="mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Buka menu samping"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Views */}
        <div className="db-view">
          {activeTab === 'overview' && (
            <OverviewTab
              users={users}
              events={events}
              transactions={transactions}
            />
          )}

          {activeTab === 'users' && (
            <UsersTable
              users={users}
              onDelete={handleDeleteUser}
              onEdit={(user) => {
                setEditingUser(user);
                setIsUserModalOpen(true);
              }}
              onAddUser={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
            />
          )}

          {activeTab === 'events' && (
            <EventsTable
              events={events}
              onDelete={handleDeleteEvent}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTable
              transactions={transactions}
              onDelete={handleDeleteTransaction}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTable
              templates={templates}
              onDelete={handleDeleteTemplate}
            />
          )}

          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {/* User Modal for Add / Edit */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  );
}
