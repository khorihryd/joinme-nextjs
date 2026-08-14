'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { NodeRenderer } from '@/components/studio/NodeRenderer';
import { DEFAULT_NODES, loadNodeFonts, ensureGoogleFontLoaded } from '@/store/studio-store';
import { StudioNode } from '@/types';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = resolvedParams?.id;
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Aktif'>('Draft');
  const [showPreview, setShowPreview] = useState(true);
  const [isCoverOpened, setIsCoverOpened] = useState(false);

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
      if (!id) return;
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
          setStatus(data.status || 'Draft');
          if (data.details) {
            setDetails((prev: any) => ({ ...prev, ...data.details }));
            if (data.details.globalStyles?.fontFamily) {
              ensureGoogleFontLoaded(data.details.globalStyles.fontFamily);
            }
            if (Array.isArray(data.details.studioNodes) && data.details.studioNodes.length > 0) {
              loadNodeFonts(data.details.studioNodes);
            }
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

  // Dynamic Live Event Data Bindings for Right Side Preview
  const liveEventDetails = {
    mempelaiPria: details.mempelaiPria || 'Roni Wijaya, S.Kom.',
    panggilanPria: details.panggilanPria || 'Roni',
    ortuPria: details.ortuPria,
    igPria: details.igPria,
    fotoPria: details.fotoPria,
    mempelaiWanita: details.mempelaiWanita || 'Anti Kartika, S.T.',
    panggilanWanita: details.panggilanWanita || 'Anti',
    ortuWanita: details.ortuWanita,
    igWanita: details.igWanita,
    fotoWanita: details.fotoWanita,
    organizerName: details.organizerName,
    organizerNickname: details.organizerNickname,
    organizerParents: details.organizerParents,
    event_date: details.schedules?.[0]?.date || '21 September 2026',
    event_time: details.schedules?.[0]?.time || '08:00 - 14:00 WIB',
    event_location: details.schedules?.[0]?.place || 'Grand Ballroom Hotel Mulia, Jakarta',
    event_address: details.schedules?.[0]?.address || 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
    schedules: details.schedules || [],
    story: details.story || [],
    gallery: details.gallery || [],
    bankAccounts: [
      details.bank1Nama && { bankName: details.bank1Nama, accountNumber: details.bank1Rek, accountHolder: details.bank1An },
      details.bank2Nama && { bankName: details.bank2Nama, accountNumber: details.bank2Rek, accountHolder: details.bank2An },
    ].filter(Boolean),
    giftAddress: details.giftAddress,
    showStory: details.showStory !== false,
    showGallery: details.showGallery !== false,
  };

  const previewNodes = (event?.details?.studioNodes && Array.isArray(event.details.studioNodes) && event.details.studioNodes.length > 0)
    ? (event.details.studioNodes as unknown as StudioNode[])
    : (DEFAULT_NODES as unknown as StudioNode[]);

  const previewGlobalStyles = event?.details?.globalStyles || {
    bgColor: '#eff2ef',
    fontFamily: 'Playfair Display',
  };

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
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                gap: '0.5rem',
                borderColor: showPreview ? 'var(--primary)' : 'var(--border-color)',
                color: showPreview ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: showPreview ? 'var(--primary-light, #fff0f5)' : 'transparent',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>{showPreview ? '🙈 Sembunyikan Pratinjau' : '👁️ Tampilkan Pratinjau'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
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

        {/* Scroll View: Side-by-Side 2 Column Layout */}
        <div className="db-view">
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', width: '100%' }}>
            {/* Left Column: Editor Step Form Cards */}
            <div className="db-card-panel" style={{ flex: 1, minWidth: 0, padding: '2.5rem' }}>
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
                        {/* Pria */}
                        <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>🤵 Mempelai Pria</h3>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap &amp; Gelar</label>
                            <input type="text" placeholder="Roni Wijaya, S.Kom." value={details.mempelaiPria || ''} onChange={(e) => setDetails({ ...details, mempelaiPria: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
                            <input type="text" placeholder="Roni" value={details.panggilanPria || ''} onChange={(e) => setDetails({ ...details, panggilanPria: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua</label>
                            <input type="text" placeholder="Putra dari Bpk. Hendra & Ibu Siska" value={details.ortuPria || ''} onChange={(e) => setDetails({ ...details, ortuPria: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                          </div>
                        </div>

                        {/* Wanita */}
                        <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>👰 Mempelai Wanita</h3>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap &amp; Gelar</label>
                            <input type="text" placeholder="Anti Kartika, S.T." value={details.mempelaiWanita || ''} onChange={(e) => setDetails({ ...details, mempelaiWanita: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
                            <input type="text" placeholder="Anti" value={details.panggilanWanita || ''} onChange={(e) => setDetails({ ...details, panggilanWanita: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua</label>
                            <input type="text" placeholder="Putri dari Bpk. Gunawan & Ibu Maya" value={details.ortuWanita || ''} onChange={(e) => setDetails({ ...details, ortuWanita: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Penyelenggara / Hajat</label>
                          <input type="text" placeholder="Denny Sumargo" value={details.organizerName || ''} onChange={(e) => setDetails({ ...details, organizerName: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveStep(2)} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Waktu &amp; Tempat &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: WAKTU & TEMPAT */}
                {activeStep === 2 && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Waktu &amp; Lokasi Acara
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Tambahkan sesi acara seperti Akad Nikah, Resepsi, atau Pesta Ulang Tahun.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px dashed var(--primary)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>➕ Tambah Sesi Acara Baru</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <input type="text" placeholder="Nama Sesi (cth: Akad Nikah)" value={schedName} onChange={(e) => setSchedName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                        <input type="text" placeholder="Tanggal (cth: 21 Sep 2026)" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                        <input type="text" placeholder="Waktu (cth: 08:00 - 10:00 WIB)" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <input type="text" placeholder="Gedung / Tempat (cth: Hotel Mulia)" value={schedPlace} onChange={(e) => setSchedPlace(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                        <input type="text" placeholder="Alamat Lengkap" value={schedAddress} onChange={(e) => setSchedAddress(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <button type="button" onClick={addSchedule} className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        + Tambahkan Sesi Ke Daftar
                      </button>
                    </div>

                    {/* Schedule Table */}
                    {details.schedules?.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem' }}>📋 Daftar Sesi Tersimpan:</h4>
                        {details.schedules.map((s: any, idx: number) => (
                          <div key={idx} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{s.name}</strong> — {s.date} ({s.time})
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>📍 {s.place} ({s.address})</div>
                            </div>
                            <button type="button" onClick={() => removeSchedule(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveStep(1)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveStep(3)} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Cerita Cinta &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CERITA CINTA */}
                {activeStep === 3 && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Kisah Cinta &amp; Timeline (Love Story)
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Bagikan kenangan indah perjalanan cinta Anda dari awal bertemu hingga menuju pelaminan.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <input type="checkbox" id="chkStory" checked={details.showStory !== false} onChange={(e) => setDetails({ ...details, showStory: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                      <label htmlFor="chkStory" style={{ fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Tampilkan Section Cerita Cinta di Undangan</label>
                    </div>

                    {details.showStory !== false && (
                      <>
                        <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px dashed var(--primary)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>💖 Tambahkan Momen Baru</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input type="text" placeholder="Tahun (2022)" value={storyYear} onChange={(e) => setStoryYear(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                            <input type="text" placeholder="Judul Momen (Pertama Pertemuan)" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <textarea placeholder="Ceritakan kisah singkat momen bahagia ini..." value={storyDesc} onChange={(e) => setStoryDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '1rem' }} />
                          <button type="button" onClick={addStory} className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            + Tambahkan Ke Timeline
                          </button>
                        </div>

                        {details.story?.length > 0 && (
                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem' }}>📖 Timeline Momen:</h4>
                            {details.story.map((st: any, idx: number) => (
                              <div key={idx} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <span style={{ backgroundColor: 'var(--primary-light, #fff0f5)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{st.year}</span>
                                  <h4 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '0.95rem' }}>{st.title}</h4>
                                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{st.desc}</p>
                                </div>
                                <button type="button" onClick={() => removeStory(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                                  Hapus
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveStep(2)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveStep(4)} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Dress Code &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: DRESS CODE */}
                {activeStep === 4 && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Ketentuan Pakaian (Dress Code)
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Berikan panduan tema busana dan kode warna bagi para tamu undangan.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <input type="checkbox" id="chkDress" checked={details.showDresscode} onChange={(e) => setDetails({ ...details, showDresscode: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                      <label htmlFor="chkDress" style={{ fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Tampilkan Panduan Dresscode</label>
                    </div>

                    {details.showDresscode && (
                      <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tema Pakaian</label>
                          <input type="text" placeholder="Earth Tone &amp; Modern Traditional" value={details.dresscodeStyle || ''} onChange={(e) => setDetails({ ...details, dresscodeStyle: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Catatan Khusus Bagi Tamu</label>
                          <textarea placeholder="Mohon menghindari pakaian berwarna putih polos..." value={details.dresscodeNotes || ''} onChange={(e) => setDetails({ ...details, dresscodeNotes: e.target.value })} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveStep(3)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveStep(5)} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Galeri Foto &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: GALERI FOTO */}
                {activeStep === 5 && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Galeri Foto &amp; Musik Latar
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Tautan lagu latar belakang dan kumpulan foto momen indah kebersamaan.
                    </p>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>URL Musik Latar (MP3 / Soundcloud)</label>
                      <input type="text" placeholder="https://example.com/romantic-song.mp3" value={details.musicUrl || ''} onChange={(e) => setDetails({ ...details, musicUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveStep(4)} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveStep(6)} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Rekening Kado &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: REKENING KADO */}
                {activeStep === 6 && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Amplop Digital &amp; Hadiah (Gift Registry)
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Informasi nomor rekening bank atau e-wallet untuk memberikan kado &amp; angpao digital.
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

            {/* Right Column: Flat Clean Canvas Preview with Interactive Cover Overlay */}
            {showPreview && (() => {
              const hasMultipleContainers = previewNodes.length > 1;
              const coverNode = hasMultipleContainers ? previewNodes[0] : null;
              const bodyNodes = hasMultipleContainers ? previewNodes.slice(1) : previewNodes;

              const handleOpenCover = () => {
                setIsCoverOpened(true);
              };

              return (
                <div
                  className="live-preview-right-col"
                  style={{
                    width: '440px',
                    flexShrink: 0,
                    position: 'sticky',
                    top: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Header Bar */}
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✨ Pratinjau Tampilan Undangan
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {coverNode && (
                        <button
                          type="button"
                          onClick={() => setIsCoverOpened(!isCoverOpened)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={isCoverOpened ? 'Kunci & Tutup Ulang Cover' : 'Buka Cover Undangan'}
                        >
                          {isCoverOpened ? '🔒 Tutup Cover' : '🔓 Buka Cover'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowPreview(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                        }}
                        title="Sembunyikan Pratinjau"
                      >
                        🙈 Sembunyikan
                      </button>
                    </div>
                  </div>

                  {/* Pure Flat Preview Canvas Container */}
                  <div
                    style={{
                      width: '100%',
                      height: '720px',
                      backgroundColor: previewGlobalStyles.bgColor || '#eff2ef',
                      backgroundImage: previewGlobalStyles.backgroundImage ? `url(${previewGlobalStyles.backgroundImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '0px',
                      border: 'none',
                      boxShadow: 'none',
                      overflowY: (!isCoverOpened && coverNode) ? 'hidden' : 'auto',
                      overflowX: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* Interactive Cover Node Overlay (Slide Up Animation) */}
                    {coverNode && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          minHeight: '100%',
                          zIndex: 99,
                          backgroundColor: coverNode.style?.backgroundColor || previewGlobalStyles.bgColor || '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          transition: 'transform 0.85s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.85s ease',
                          transform: isCoverOpened ? 'translateY(-100%)' : 'translateY(0)',
                          opacity: isCoverOpened ? 0 : 1,
                          pointerEvents: isCoverOpened ? 'none' : 'auto',
                          overflowY: 'auto',
                        }}
                      >
                        <NodeRenderer
                          node={{
                            ...coverNode,
                            style: {
                              ...coverNode.style,
                              minHeight: '100%',
                              height: '100%',
                            },
                          }}
                          allNodes={previewNodes}
                          selectedNodeId={null}
                          onSelectNode={() => {}}
                          eventDetails={liveEventDetails}
                          viewportMode="mobile"
                          isPreviewMode={true}
                          onOpenCover={handleOpenCover}
                        />
                      </div>
                    )}

                    {/* Main Content Body Nodes */}
                    <div
                      style={{
                        width: '100%',
                        minHeight: '100%',
                        opacity: isCoverOpened || !coverNode ? 1 : 0.2,
                        transition: 'opacity 0.85s ease',
                      }}
                    >
                      {bodyNodes.map((node) => (
                        <NodeRenderer
                          key={node.id}
                          node={node}
                          allNodes={previewNodes}
                          selectedNodeId={null}
                          onSelectNode={() => {}}
                          eventDetails={liveEventDetails}
                          viewportMode="mobile"
                          isPreviewMode={true}
                          onOpenCover={handleOpenCover}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
