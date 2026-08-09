'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { EventCard } from '@/components/dashboard/EventCard';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { CreateEventModal } from '@/components/dashboard/CreateEventModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Undangan berhasil dihapus', 'success');
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        showToast('Gagal menghapus undangan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
    }
  };

  const totalViews = events.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalRSVP = events.reduce((acc, curr) => acc + (curr._count?.guests || 0), 0);
  const userName = session?.user?.name || 'Roni Wijaya';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="db-container">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-header">
          <Link href="/" className="logo">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Join<span className="logo-accent">Me</span></span>
          </Link>
        </div>

        <nav className="db-menu">
          <Link href="/dashboard" className="db-menu-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Ikhtisar</span>
          </Link>
          <a href="#my-invitations" className="db-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <span>Undangan Saya</span>
          </a>
          {session?.user?.role === 'admin' && (
            <Link href="/admin" className="db-menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              <span>Superadmin Panel</span>
            </Link>
          )}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-info">
            <div className="db-avatar">{initials}</div>
            <div>
              <h4 className="db-username">{userName}</h4>
              <p className="db-userplan">Paket {session?.user?.plan || 'Pro'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="db-logout-btn"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <div>
            <span className="panel-desc">Portal Pelanggan SaaS</span>
            <h1 className="panel-title" style={{ fontSize: '1.1rem', marginTop: '-2px' }}>Pusat Kontrol Akun</h1>
          </div>

          <div className="db-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
            >
              + Buat Undangan
            </button>
          </div>
        </header>

        {/* Dashboard Core View */}
        <div className="db-view">
          {/* Welcome Banner */}
          <div className="db-welcome">
            <div className="db-welcome-text">
              <h2>Selamat Datang Kembali, {userName.split(' ')[0]}! 👋</h2>
              <p>Kelola semua situs web undangan aktif Anda, pantau lalu lintas pengunjung global, dan perbarui langganan Anda.</p>
            </div>
            <div className="trust-badge" style={{ marginBottom: 0 }}>
              <span className="badge-icon">💎</span>
              <span className="badge-text">Paket Akun: {session?.user?.plan || 'Pro'} Active</span>
            </div>
          </div>

          {/* KPI Stats Cards */}
          <StatsOverview
            totalEvents={events.length}
            activeEvents={events.filter((e) => e.status === 'Aktif').length}
            totalViews={totalViews}
            totalGuests={totalRSVP}
          />

          {/* My Invitations Grid Section */}
          <section id="my-invitations" className="db-card-panel" style={{ background: 'none', border: 'none', boxShadow: 'none', display: 'block' }}>
            <div className="panel-header-row" style={{ padding: '0 0 1.5rem 0', background: 'none', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="panel-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Undangan Saya</h2>
                <p className="panel-desc">Kelola tata letak, sub-domain, dan RSVP tamu di setiap kartu acara</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                + Buat Undangan Baru
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Memuat data undangan...
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', borderRadius: '24px', background: 'var(--bg-card)', border: '2px dashed var(--border-color)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💌</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Belum Ada Undangan</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Anda belum membuat website undangan digital. Klik tombol di bawah untuk memulai!
                </p>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  Buat Undangan Sekarang 🚀
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {events.map((event) => (
                  <EventCard key={event.id} event={event} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
