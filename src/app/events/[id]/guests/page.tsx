'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';

export default function EventGuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [event, setEvent] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('Semua');
  const [filterGroup, setFilterGroup] = useState('Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'group'>('newest');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // New guest modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Keluarga');
  const [customGroup, setCustomGroup] = useState('');
  const [newCategory, setNewCategory] = useState('Umum');
  const [newPhone, setNewPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [eRes, gRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch(`/api/guests?eventId=${id}`),
      ]);

      if (eRes.ok) setEvent(await eRes.json());
      if (gRes.ok) setGuests(await gRes.json());
    } catch (err) {
      console.error('Error loading guest data:', err);
      showToast('Gagal memuat data tamu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);

    const finalGroup = newGroup === 'Lainnya' ? (customGroup.trim() || 'Umum') : newGroup;

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          name: newName.trim(),
          group: finalGroup,
          category: newCategory,
          phone: newPhone.trim(),
          attendance: 'Belum Konfirmasi',
          pax: 1,
        }),
      });

      if (res.ok) {
        showToast(`Tamu "${newName.trim()}" berhasil ditambahkan! 🎉`, 'success');
        setNewName('');
        setNewPhone('');
        setCustomGroup('');
        setNewGroup('Keluarga');
        setNewCategory('Umum');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast('Gagal menambahkan tamu', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data tamu "${guestName}"?`)) return;

    setDeletingId(guestId);
    try {
      const res = await fetch(`/api/guests?id=${guestId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Data tamu "${guestName}" telah dihapus`, 'info');
        loadData();
      } else {
        showToast('Gagal menghapus data tamu', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const copyGuestLink = (guestName: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/v/${event?.subdomain || 'demo'}?to=${encodeURIComponent(guestName)}`;
    navigator.clipboard.writeText(url);
    showToast(`Link khusus untuk "${guestName}" berhasil disalin! 📋`, 'success');
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  const shareViaWhatsApp = (guestName: string, phoneStr?: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/v/${event?.subdomain || 'demo'}?to=${encodeURIComponent(guestName)}`;
    const text = `Kepada Yth. *${guestName}*,\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara *${event?.title || 'Undangan Digital'}*.\n\nBerikut link undangan khusus Anda:\n${url}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih.`;
    
    let targetUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (phoneStr && phoneStr.trim() !== '') {
      const formattedPhone = formatPhoneNumber(phoneStr.trim());
      targetUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    }
    
    window.open(targetUrl, '_blank');
  };

  const exportToCSV = () => {
    if (guests.length === 0) {
      showToast('Tidak ada data tamu untuk di-export', 'warning');
      return;
    }

    const headers = ['Nama Tamu', 'Kategori', 'Grup / Kelompok', 'No. WhatsApp', 'Status Kehadiran', 'Jumlah Pax', 'Ucapan & Pesan', 'Tanggal Respon', 'Link Undangan'];
    const rows = guests.map((g) => {
      const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/v/${event?.subdomain || 'demo'}?to=${encodeURIComponent(g.name)}`;
      const dateStr = g.createdAt ? new Date(g.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
      return [
        `"${(g.name || '').replace(/"/g, '""')}"`,
        `"${g.category || 'Umum'}"`,
        `"${g.group || 'Umum'}"`,
        `"${g.phone || '-'}"`,
        `"${g.attendance || 'Belum Konfirmasi'}"`,
        `"${g.pax || 1}"`,
        `"${(g.wishes || '-').replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        `"${link}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `daftar_tamu_${event?.subdomain || 'undangan'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data tamu berhasil di-export ke CSV! 📥', 'success');
  };

  // Filter & Sort Logic
  const filteredGuests = guests
    .filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || 
        (g.wishes || '').toLowerCase().includes(search.toLowerCase()) ||
        (g.group || '').toLowerCase().includes(search.toLowerCase()) ||
        (g.phone || '').includes(search);

      const matchesAttendance = filterAttendance === 'Semua' || g.attendance === filterAttendance;
      const matchesGroup = filterGroup === 'Semua' || g.group === filterGroup;

      return matchesSearch && matchesAttendance && matchesGroup;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'group') return (a.group || '').localeCompare(b.group || '');
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const totalPendingGuests = guests.filter((g) => !g.attendance || g.attendance === 'Belum Konfirmasi');
  const totalAttendingGuests = guests.filter((g) => g.attendance === 'Hadir');
  const totalPaxAttending = totalAttendingGuests.reduce((acc, curr) => acc + (curr.pax || 1), 0);
  const totalDeclined = guests.filter((g) => g.attendance === 'Tidak Hadir').length;
  const attendanceRate = guests.length > 0 ? Math.round((totalAttendingGuests.length / guests.length) * 100) : 0;

  // Extract list of unique groups for filtering
  const uniqueGroups = Array.from(new Set(guests.map((g) => g.group).filter(Boolean)));

  const userName = session?.user?.name || 'Roni Wijaya';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={`db-container ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      {/* JoinMe SaaS Left Sidebar Navigation */}
      <aside className="db-sidebar">
        <div className="db-sidebar-header">
          <Link href="/dashboard" className="logo">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Join<span className="logo-accent">Me</span></span>
          </Link>
        </div>

        <nav className="db-menu">
          <Link href="/dashboard" className="db-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Portal Ikhtisar</span>
          </Link>
          <Link href={`/events/${id}/edit`} className="db-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span>Studio Editor</span>
          </Link>
          <Link href={`/events/${id}/guests`} className="db-menu-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Kelola Tamu & RSVP</span>
          </Link>
          {event?.subdomain && (
            <a
              href={`/v/${event.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="db-menu-item"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>Preview Undangan 🚀</span>
            </a>
          )}
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

      {/* Main Panel Content Area */}
      <main className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
            <div>
              <span className="panel-desc">Portal Pelanggan SaaS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-2px' }}>
                <h1 className="panel-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                  Kelola Tamu & Buku Tamu RSVP
                </h1>
                {event?.subdomain && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
                    @{event.subdomain}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="db-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />

            <button
              type="button"
              onClick={exportToCSV}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Export data ke CSV Excel"
            >
              📥 Export CSV
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              ➕ Tambah Tamu
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard View Area */}
        <div className="db-view">
          {/* Welcome / Header Banner Card */}
          <div className="db-welcome">
            <div className="db-welcome-text">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
                {event?.title || 'Memuat Data Acara...'} 💌
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Daftarkan nama tamu, kelompok & status VIP, bagikan link undangan khusus via WhatsApp, dan pantau konfirmasi kehadiran RSVP secara otomatis.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href={`/events/${id}/edit`} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}>
                ✏️ Edit Acara
              </Link>
              {event?.subdomain && (
                <a href={`/v/${event.subdomain}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}>
                  🌐 Buka Undangan
                </a>
              )}
            </div>
          </div>

          {/* KPI Stats Overview Grid */}
          <div className="stats-overview" style={{ margin: 0 }}>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Total Tamu Terdaftar</span>
                  <span className="stat-icon">👥</span>
                </div>
                <div className="stat-value">{guests.length}</div>
                <div className="stat-footer">
                  <span className="stat-change text-accent">Daftar Tamu Undangan</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Belum Konfirmasi</span>
                  <span className="stat-icon">⏳</span>
                </div>
                <div className="stat-value" style={{ color: '#ca8a04' }}>{totalPendingGuests.length}</div>
                <div className="stat-footer">
                  <span className="stat-change">Menunggu tamu membuka link</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Konfirmasi Hadir</span>
                  <span className="stat-icon">✅</span>
                </div>
                <div className="stat-value" style={{ color: '#16a34a' }}>{totalAttendingGuests.length}</div>
                <div className="stat-footer">
                  <span className="stat-change text-accent">Total Rombongan: {totalPaxAttending} Pax</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Tidak Hadir</span>
                  <span className="stat-icon">❌</span>
                </div>
                <div className="stat-value" style={{ color: '#dc2626' }}>{totalDeclined}</div>
                <div className="stat-footer">
                  <span className="stat-change">Tamu berhalangan</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Tingkat Kehadiran</span>
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>{attendanceRate}%</div>
                <div style={{ marginTop: '0.5rem', width: '100%', backgroundColor: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${attendanceRate}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            {/* Toolbar: Search, Filter, Sort */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="🔍 Cari nama, grup, no. WA..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-body)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Attendance & Group Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                {/* Attendance Status Filter Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-body)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  {[
                    { id: 'Semua', label: `Semua (${guests.length})` },
                    { id: 'Belum Konfirmasi', label: `⏳ Pending (${totalPendingGuests.length})` },
                    { id: 'Hadir', label: `✅ Hadir (${totalAttendingGuests.length})` },
                    { id: 'Tidak Hadir', label: `❌ Absen (${totalDeclined})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterAttendance(tab.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: filterAttendance === tab.id ? 'var(--primary)' : 'transparent',
                        color: filterAttendance === tab.id ? '#ffffff' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Group Filter Dropdown */}
                {uniqueGroups.length > 0 && (
                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    <option value="Semua">📁 Semua Grup</option>
                    {uniqueGroups.map((grp) => (
                      <option key={grp} value={grp}>{grp}</option>
                    ))}
                  </select>
                )}

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="newest">🕒 Terbaru</option>
                  <option value="name">🔤 Nama (A-Z)</option>
                  <option value="group">📁 Kelompok / Grup</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Nama Tamu</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Grup / Kategori</th>
                    <th style={{ padding: '0.85rem 1rem' }}>No. WhatsApp</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status Kehadiran</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Pax / Ucapan</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi Undangan</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Memuat data tamu... ⏳
                      </td>
                    </tr>
                  ) : filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '2rem' }}>💌</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Belum ada data tamu ditemukan</span>
                          <span style={{ fontSize: '0.75rem' }}>Gunakan tombol "+ Tambah Tamu" untuk mendaftarkan nama tamu baru.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      const isVIP = g.category === 'VIP';
                      const attendanceStatus = g.attendance || 'Belum Konfirmasi';

                      return (
                        <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' }}>
                          {/* Nama Tamu */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isVIP ? 'rgba(202, 138, 4, 0.15)' : 'var(--primary-glow)', color: isVIP ? '#ca8a04' : 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase' }}>
                                {g.name.charAt(0)}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span>{g.name}</span>
                                  {isVIP && (
                                    <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(202, 138, 4, 0.15)', color: '#ca8a04', border: '1px solid rgba(202, 138, 4, 0.3)' }}>
                                      ⭐ VIP
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Grup / Kelompok */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              📁 {g.group || 'Umum'}
                            </span>
                          </td>

                          {/* No. WhatsApp */}
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                            {g.phone ? (
                              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>📱 {g.phone}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>-</span>
                            )}
                          </td>

                          {/* Status Kehadiran */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {attendanceStatus === 'Hadir' ? (
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', border: '1px solid rgba(22, 163, 74, 0.25)' }}>
                                ✅ Hadir
                              </span>
                            ) : attendanceStatus === 'Tidak Hadir' ? (
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(220, 38, 38, 0.12)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                                ❌ Tidak Hadir
                              </span>
                            ) : (
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(202, 138, 4, 0.12)', color: '#ca8a04', border: '1px solid rgba(202, 138, 4, 0.25)' }}>
                                ⏳ Belum Konfirmasi
                              </span>
                            )}
                          </td>

                          {/* Pax / Ucapan */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{g.pax || 1} Pax</span>
                              {g.wishes ? (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.wishes}>
                                  "{g.wishes}"
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Belum mengisi ucapan</span>
                              )}
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => shareViaWhatsApp(g.name, g.phone)}
                                style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', border: 'none', cursor: 'pointer' }}
                                title={g.phone ? `Kirim WA langsung ke ${g.phone}` : 'Kirim ucapan & link khusus via WhatsApp'}
                              >
                                💬 {g.phone ? 'Kirim WA' : 'Share WA'}
                              </button>

                              <button
                                type="button"
                                onClick={() => copyGuestLink(g.name)}
                                style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}
                                title="Salin link undangan khusus"
                              >
                                📋 Salin Link
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === g.id}
                                onClick={() => handleDeleteGuest(g.id, g.name)}
                                style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                                title="Hapus data tamu"
                              >
                                {deletingId === g.id ? '...' : '🗑️'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Guest Modal */}
      {isModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>✉️ Tambah Tamu Undangan</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', fontWeight: 800 }}>Daftarkan Tamu Baru</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Nama Tamu */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                  Nama Lengkap / Rombongan Tamu <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="misal: Budi Santoso & Partner"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Grup / Kelompok */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                  Grup / Kelompok Tamu
                </label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="Keluarga">👨‍👩‍👧‍👦 Keluarga</option>
                  <option value="Teman Kerja">💼 Teman Kerja / Kantor</option>
                  <option value="Teman Kuliah">🎓 Teman Sekolah / Kuliah</option>
                  <option value="Tetangga">🏡 Tetangga / Komplek</option>
                  <option value="Sahabat">🤝 Sahabat Dekat</option>
                  <option value="Lainnya">✏️ Lainnya (Ketik Custom)</option>
                </select>
                {newGroup === 'Lainnya' && (
                  <input
                    type="text"
                    required
                    value={customGroup}
                    onChange={(e) => setCustomGroup(e.target.value)}
                    placeholder="Nama kelompok baru..."
                    style={{ width: '100%', marginTop: '0.4rem', padding: '0.45rem', fontSize: '0.78rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>

              {/* Kategori (VIP vs Umum) */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Kategori Prioritas
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setNewCategory('Umum')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: newCategory === 'Umum' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: newCategory === 'Umum' ? 'var(--primary-glow)' : 'var(--bg-body)',
                      color: newCategory === 'Umum' ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    Tamu Umum
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('VIP')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: newCategory === 'VIP' ? '1px solid #ca8a04' : '1px solid var(--border-color)',
                      backgroundColor: newCategory === 'VIP' ? 'rgba(202, 138, 4, 0.15)' : 'var(--bg-body)',
                      color: newCategory === 'VIP' ? '#ca8a04' : 'var(--text-secondary)',
                    }}
                  >
                    ⭐ Tamu VIP
                  </button>
                </div>
              </div>

              {/* Nomor WhatsApp / HP */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                  Nomor WhatsApp / HP (Opsional)
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="misal: 081234567890"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Digunakan untuk membuka percakapan WA langsung dengan 1 klik.
                </span>
              </div>

              {/* Notice */}
              <div style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', backgroundColor: 'var(--primary-glow)', fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>
                ℹ️ Status kehadiran awal diset ke <strong>⏳ Belum Konfirmasi</strong>. Tamu akan mengisi konfirmasi & ucapan saat membuka link undangan.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800 }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Tamu 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
