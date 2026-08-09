'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSession, signOut } from 'next-auth/react';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Aktif'>('Draft');
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);

  // Form details state
  const [details, setDetails] = useState<any>({
    mempelaiPria: '',
    panggilanPria: '',
    ortuPria: '',
    igPria: '',
    fotoPria: '',
    mempelaiWanita: '',
    panggilanWanita: '',
    ortuWanita: '',
    igWanita: '',
    fotoWanita: '',
    organizerName: '',
    organizerNickname: '',
    organizerParents: '',
    schedules: [],
    story: [],
    gallery: [],
    bank1Nama: '',
    bank1Rek: '',
    bank1An: '',
    bank2Nama: '',
    bank2Rek: '',
    bank2An: '',
    showStory: true,
    showGallery: true,
    showDresscode: false,
    dresscodeStyle: 'Earth Tone & Modern Traditional Attire',
    dresscodeColors: ['#78350f', '#d97706', '#fef3c7', '#ffffff'],
    dresscodeNotes: '',
    musicUrl: '',
  });

  // Schedule input state
  const [schedName, setSchedName] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedPlace, setSchedPlace] = useState('');
  const [schedAddress, setSchedAddress] = useState('');

  // Story input state
  const [storyYear, setStoryYear] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDesc, setStoryDesc] = useState('');

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
          setStatus(data.status || 'Draft');
          if (data.details) {
            setDetails((prev: any) => ({ ...prev, ...data.details }));
          }
        } else {
          showToast('Undangan tidak ditemukan', 'error');
        }
      } catch (err) {
        showToast('Gagal memuat data acara', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id, showToast]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, details }),
      });

      if (res.ok) {
        showToast('Perubahan berhasil disimpan! ✨', 'success');
      } else {
        showToast('Gagal menyimpan perubahan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSchedule = () => {
    if (!schedName || !schedDate) {
      showToast('Nama sesi dan tanggal wajib diisi!', 'warning');
      return;
    }
    const newSched = {
      name: schedName,
      date: schedDate,
      time: schedTime,
      place: schedPlace,
      address: schedAddress,
    };
    setDetails((prev: any) => ({
      ...prev,
      schedules: [...(prev.schedules || []), newSched],
    }));
    setSchedName('');
    setSchedDate('');
    setSchedTime('');
    setSchedPlace('');
    setSchedAddress('');
  };

  const removeSchedule = (index: number) => {
    setDetails((prev: any) => ({
      ...prev,
      schedules: prev.schedules.filter((_: any, i: number) => i !== index),
    }));
  };

  const addStory = () => {
    if (!storyTitle || !storyYear) {
      showToast('Tahun dan judul cerita wajib diisi!', 'warning');
      return;
    }
    const newStory = { year: storyYear, title: storyTitle, desc: storyDesc };
    setDetails((prev: any) => ({
      ...prev,
      story: [...(prev.story || []), newStory],
    }));
    setStoryYear('');
    setStoryTitle('');
    setStoryDesc('');
  };

  const removeStory = (index: number) => {
    setDetails((prev: any) => ({
      ...prev,
      story: prev.story.filter((_: any, i: number) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Memuat editor undangan...
      </div>
    );
  }

  const isWedding = event?.type === 'Pernikahan';
  const displayTitle = isWedding
    ? `Edit Konten: ${details.panggilanPria || 'Pria'} & ${details.panggilanWanita || 'Wanita'}`
    : `Edit Konten: ${event?.title || 'Acara'}`;

  const userName = session?.user?.name || 'Roni Wijaya';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="db-container">
      {/* Left Sidebar */}
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
          <Link href="/dashboard" className="db-menu-item" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Portal</span>
          </Link>

          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.5rem', letterSpacing: '0.05em' }}>
            MENU EDITOR
          </div>

          {[
            { id: 1, label: isWedding ? '1. Profil Pengantin' : '1. Profil Penyelenggara', hasCheck: !!details.mempelaiPria || !!details.organizerName },
            { id: 2, label: '2. Waktu & Tempat', hasCheck: details.schedules?.length > 0 },
            { id: 3, label: '3. Cerita Cinta', hasCheck: details.story?.length > 0 },
            { id: 4, label: '4. Dress Code', hasCheck: details.showDresscode },
            { id: 5, label: '5. Galeri Foto', hasCheck: !!details.musicUrl },
            { id: 6, label: '6. Rekening Kado', hasCheck: !!details.bank1Nama },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStep(tab.id)}
              className={`db-menu-item ${activeStep === tab.id ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>{tab.label}</span>
              <span className={`tab-status-icon ${tab.hasCheck ? 'completed' : 'incomplete'}`} />
            </button>
          ))}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <div>
            <span className="panel-desc">Portal Pelanggan SaaS &gt; Editor Undangan</span>
            <h1 className="panel-title" style={{ fontSize: '1.1rem', marginTop: '-2px' }}>
              {displayTitle}
            </h1>
          </div>

          <div className="db-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Draft' | 'Aktif')}
              style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.45rem 0.75rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', height: '38px' }}
            >
              <option value="Draft">Draft 📄</option>
              <option value="Aktif">Aktif 🚀</option>
            </select>

            <button
              type="button"
              onClick={() => setShowPreviewDrawer(!showPreviewDrawer)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, gap: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'transparent' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Pratinjau</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.15rem', backgroundColor: '#16a34a', borderColor: '#16a34a', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, gap: '0.5rem', color: 'white' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{saving ? '...' : 'Simpan'}</span>
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Scroll View */}
        <div className="db-view">
          <div className="db-card-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSave}>
              {/* STEP 1: PROFIL PENGANTIN */}
              {activeStep === 1 && (
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

                        {/* Photo Box */}
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', marginBottom: '1.25rem' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Belum ada foto</span>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tautan Foto Mempelai Pria (URL)</label>
                          <input
                            type="text"
                            value={details.fotoPria || ''}
                            onChange={(e) => setDetails({ ...details, fotoPria: e.target.value })}
                            placeholder="Contoh: https://images.unsplash.com/photo-..."
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap Mempelai Pria</label>
                          <input
                            type="text"
                            value={details.mempelaiPria || ''}
                            onChange={(e) => setDetails({ ...details, mempelaiPria: e.target.value })}
                            placeholder="Rian"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
                          <input
                            type="text"
                            value={details.panggilanPria || ''}
                            onChange={(e) => setDetails({ ...details, panggilanPria: e.target.value })}
                            placeholder="Contoh: Roni"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua (Pria)</label>
                          <input
                            type="text"
                            value={details.ortuPria || ''}
                            onChange={(e) => setDetails({ ...details, ortuPria: e.target.value })}
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

                        {/* Photo Box */}
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', marginBottom: '1.25rem' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Belum ada foto</span>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tautan Foto Mempelai Wanita (URL)</label>
                          <input
                            type="text"
                            value={details.fotoWanita || ''}
                            onChange={(e) => setDetails({ ...details, fotoWanita: e.target.value })}
                            placeholder="Contoh: https://images.unsplash.com/photo-..."
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap Mempelai Wanita</label>
                          <input
                            type="text"
                            value={details.mempelaiWanita || ''}
                            onChange={(e) => setDetails({ ...details, mempelaiWanita: e.target.value })}
                            placeholder="Dea"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
                          <input
                            type="text"
                            value={details.panggilanWanita || ''}
                            onChange={(e) => setDetails({ ...details, panggilanWanita: e.target.value })}
                            placeholder="Contoh: Anti"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua (Wanita)</label>
                          <input
                            type="text"
                            value={details.ortuWanita || ''}
                            onChange={(e) => setDetails({ ...details, ortuWanita: e.target.value })}
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
                        onChange={(e) => setDetails({ ...details, organizerName: e.target.value })}
                        placeholder="Denny Sumargo"
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="btn btn-primary"
                      style={{ padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: 800 }}
                    >
                      Lanjut ke Waktu &amp; Tempat &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: WAKTU & TEMPAT */}
              {activeStep === 2 && (
                <div className="form-step-panel active">
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Detail Waktu &amp; Tempat Pelaksanaan
                  </h2>
                  <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                    Tentukan kapan dan di mana acara dilangsungkan.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    {details.schedules?.map((sched: any, i: number) => (
                      <div key={i} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{sched.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>📅 {sched.date} — {sched.time}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>📍 {sched.place}, {sched.address}</p>
                        </div>
                        <button type="button" onClick={() => removeSchedule(i)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '1.5rem', borderRadius: '16px', border: '2px dashed var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>+ Tambahkan Sesi Acara Baru</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <input type="text" placeholder="Nama Sesi (Akad / Resepsi)" value={schedName} onChange={(e) => setSchedName(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      <input type="text" placeholder="Tanggal (21 Sept 2026)" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      <input type="text" placeholder="Waktu (08.00 - 10.00 WIB)" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      <input type="text" placeholder="Nama Tempat (Grand Ballroom)" value={schedPlace} onChange={(e) => setSchedPlace(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                    </div>
                    <input type="text" placeholder="Alamat Lengkap Venue" value={schedAddress} onChange={(e) => setSchedAddress(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '1rem' }} />
                    <button type="button" onClick={addSchedule} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}>
                      Tambah Sesi Acara
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setActiveStep(1)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                      &larr; Kembali
                    </button>
                    <button type="button" onClick={() => setActiveStep(3)} className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: 800 }}>
                      Lanjut ke Cerita Cinta &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CERITA CINTA */}
              {activeStep === 3 && (
                <div className="form-step-panel active">
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Cerita Cinta Kami (Timeline)
                  </h2>
                  <p className="panel-desc" style={{ marginBottom: '1.5rem' }}>
                    Ceritakan momen penting perjalanan cinta Anda dari pertemuan pertama hingga hari pernikahan.
                  </p>

                  <div className="switch-toggle-container">
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Tampilkan Sesi Cerita Cinta</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Sembunyikan atau tampilkan linimasa perjalanan cinta Anda di website undangan.</p>
                    </div>
                    <label className="switch-toggle">
                      <input type="checkbox" checked={details.showStory ?? true} onChange={(e) => setDetails({ ...details, showStory: e.target.checked })} />
                      <span className="slider-round"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {details.story?.map((st: any, i: number) => (
                      <div key={i} style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>[{st.year}] {st.title}</span>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>{st.desc}</p>
                        </div>
                        <button type="button" onClick={() => removeStory(i)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>Hapus</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '1.5rem', borderRadius: '16px', border: '2px dashed var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.85rem' }}>+ Tambahkan Momen Cerita Baru</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <input type="text" placeholder="Tahun" value={storyYear} onChange={(e) => setStoryYear(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      <input type="text" placeholder="Judul Momen" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                    </div>
                    <textarea placeholder="Deskripsi cerita..." value={storyDesc} onChange={(e) => setStoryDesc(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', height: '80px', marginBottom: '1rem' }} />
                    <button type="button" onClick={addStory} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}>
                      Tambah Momen
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setActiveStep(2)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                      &larr; Kembali
                    </button>
                    <button type="button" onClick={() => setActiveStep(4)} className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: 800 }}>
                      Lanjut ke Dress Code &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DRESS CODE */}
              {activeStep === 4 && (
                <div className="form-step-panel active">
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Panduan Pakaian &amp; Dress Code
                  </h2>
                  <p className="panel-desc" style={{ marginBottom: '1.5rem' }}>
                    Atur petunjuk gaya busana dan rekomendasi palet warna pakaian untuk para tamu undangan Anda.
                  </p>

                  <div className="switch-toggle-container">
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Tampilkan Sesi Dress Code</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Sembunyikan atau tampilkan panduan dress code pakaian tamu di website undangan.</p>
                    </div>
                    <label className="switch-toggle">
                      <input type="checkbox" checked={details.showDresscode ?? false} onChange={(e) => setDetails({ ...details, showDresscode: e.target.checked })} />
                      <span className="slider-round"></span>
                    </label>
                  </div>

                  <div style={{ maxWidth: '600px' }}>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Gaya Pakaian (Preset Style)</label>
                      <input type="text" value={details.dresscodeStyle || ''} onChange={(e) => setDetails({ ...details, dresscodeStyle: e.target.value })} placeholder="Earth Tone & Modern Traditional Attire" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Catatan Tambahan</label>
                      <textarea value={details.dresscodeNotes || ''} onChange={(e) => setDetails({ ...details, dresscodeNotes: e.target.value })} placeholder="Tamu diharapkan mengenakan pakaian bernuansa pastel..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem', height: '100px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setActiveStep(3)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                      &larr; Kembali
                    </button>
                    <button type="button" onClick={() => setActiveStep(5)} className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: 800 }}>
                      Lanjut ke Galeri Foto &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: GALERI FOTO & MUSIK */}
              {activeStep === 5 && (
                <div className="form-step-panel active">
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Musik &amp; Galeri Foto
                  </h2>
                  <p className="panel-desc" style={{ marginBottom: '1.5rem' }}>
                    Atur URL musik latar belakang dan galeri foto momen berharga Anda.
                  </p>

                  <div style={{ maxWidth: '600px' }}>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>URL Musik Latar (MP3 Direct Link)</label>
                      <input type="text" value={details.musicUrl || ''} onChange={(e) => setDetails({ ...details, musicUrl: e.target.value })} placeholder="https://...music.mp3" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setActiveStep(4)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                      &larr; Kembali
                    </button>
                    <button type="button" onClick={() => setActiveStep(6)} className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: 800 }}>
                      Lanjut ke Rekening Kado &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: REKENING KADO */}
              {activeStep === 6 && (
                <div className="form-step-panel active">
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    Rekening Kado &amp; Amplop Digital
                  </h2>
                  <p className="panel-desc" style={{ marginBottom: '1.5rem' }}>
                    Sediakan opsi kado digital via transfer bank untuk kemudahan tamu undangan.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>💳 Rekening 1</h4>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Bank</label>
                        <input type="text" placeholder="BCA" value={details.bank1Nama || ''} onChange={(e) => setDetails({ ...details, bank1Nama: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nomor Rekening</label>
                        <input type="text" placeholder="1234567890" value={details.bank1Rek || ''} onChange={(e) => setDetails({ ...details, bank1Rek: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Atas Nama</label>
                        <input type="text" placeholder="Roni Wijaya" value={details.bank1An || ''} onChange={(e) => setDetails({ ...details, bank1An: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>💳 Rekening 2</h4>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Bank</label>
                        <input type="text" placeholder="Mandiri" value={details.bank2Nama || ''} onChange={(e) => setDetails({ ...details, bank2Nama: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nomor Rekening</label>
                        <input type="text" placeholder="0987654321" value={details.bank2Rek || ''} onChange={(e) => setDetails({ ...details, bank2Rek: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Atas Nama</label>
                        <input type="text" placeholder="Anti Kartika" value={details.bank2An || ''} onChange={(e) => setDetails({ ...details, bank2An: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setActiveStep(5)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                      &larr; Kembali
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800, backgroundColor: '#16a34a', borderColor: '#16a34a' }}>
                      Simpan Seluruh Data 💾
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Floating iPhone Live Preview Side Drawer */}
      {showPreviewDrawer && (
        <div className="preview-sidebar visible" style={{ zIndex: 1000 }}>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>📱 Pratinjau Langsung</span>
            <button
              onClick={() => setShowPreviewDrawer(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
          <iframe
            src={`/invite/${event?.subdomain}`}
            className="preview-iframe-el"
            title="Live Mobile Preview"
          />
        </div>
      )}
    </div>
  );
}
