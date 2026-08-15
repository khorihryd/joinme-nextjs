'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { NodeRenderer, getOrderedAndFilteredNodes } from '@/components/studio/NodeRenderer';
import { DEFAULT_NODES, loadNodeFonts, ensureGoogleFontLoaded } from '@/store/studio-store';
import { StudioNode, SECTION_DEFINITIONS, SectionType } from '@/types';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = resolvedParams?.id;
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('info');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Aktif'>('Draft');
  const [showPreview, setShowPreview] = useState(true);
  const [isCoverOpened, setIsCoverOpened] = useState(false);

  // Theme Switcher State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [activeTemplates, setActiveTemplates] = useState<any[]>([]);
  const [switchingTheme, setSwitchingTheme] = useState(false);

  // General Metadata state
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubdomain, setEventSubdomain] = useState('');
  const [eventType, setEventType] = useState('Pernikahan');

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
    liveStreamUrl: '',
    liveStreamPlatform: 'YouTube Live',
    ticketUrl: '',
    sectionOrder: [
      'cover',
      'hero',
      'opening',
      'bride_groom',
      'event_schedule',
      'live_streaming',
      'love_story',
      'gallery',
      'rsvp',
      'wishes',
      'gift',
      'ig_stories',
      'thank_you',
      'footer',
    ],
    hiddenSections: {},
  });

  // Input States
  const [schedName, setSchedName] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedPlace, setSchedPlace] = useState('');
  const [schedAddress, setSchedAddress] = useState('');

  const [storyYear, setStoryYear] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDesc, setStoryDesc] = useState('');

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
          setEventTitle(data.title || '');
          setEventSubdomain(data.subdomain || '');
          setEventType(data.type || 'Pernikahan');
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

  // Auto-scroll preview canvas to active tab section (Hooks must run unconditionally)
  useEffect(() => {
    if (loading || !showPreview) return;

    if (activeTab === 'cover') {
      setIsCoverOpened(false);
      return;
    }

    if (activeTab !== 'info') {
      setIsCoverOpened(true);

      const pNodes = (event?.details?.studioNodes && Array.isArray(event.details.studioNodes) && event.details.studioNodes.length > 0)
        ? (event.details.studioNodes as unknown as StudioNode[])
        : (DEFAULT_NODES as unknown as StudioNode[]);

      const sorted = getOrderedAndFilteredNodes(pNodes, details);

      const timer = setTimeout(() => {
        const targetNode = sorted.find((n) => n.sectionType === activeTab);
        if (targetNode) {
          const el = document.getElementById(`node-dom-${targetNode.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [activeTab, showPreview, loading, event?.details?.studioNodes, details]);

  const loadActiveTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setActiveTemplates(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          subdomain: eventSubdomain,
          type: eventType,
          status,
          details,
        }),
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

  const handleSwitchTheme = async (templateId: string) => {
    setSwitchingTheme(true);
    try {
      const res = await fetch(`/api/studio/${templateId}`);
      if (res.ok) {
        const templateData = await res.json();
        const updatedDetails = {
          ...details,
          studioNodes: templateData.nodes,
          globalStyles: templateData.globalStyles,
        };
        setDetails(updatedDetails);

        // Auto save to database
        await fetch(`/api/events/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details: updatedDetails }),
        });

        if (templateData.nodes) loadNodeFonts(templateData.nodes);
        if (templateData.globalStyles?.fontFamily) ensureGoogleFontLoaded(templateData.globalStyles.fontFamily);

        showToast(`Tema berhasil diubah ke "${templateData.name}"! 🎨`, 'success');
        setIsThemeModalOpen(false);
      } else {
        showToast('Gagal memuat template terpilih', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan saat mengganti tema', 'error');
    } finally {
      setSwitchingTheme(false);
    }
  };

  // Section Ordering Logic
  const currentSectionOrder: SectionType[] = details.sectionOrder || SECTION_DEFINITIONS.map((s) => s.id);
  const hiddenSectionsMap: Record<string, boolean> = details.hiddenSections || {};

  const moveSectionUp = (secId: SectionType) => {
    if (secId === 'cover' || secId === 'footer') return;
    const idx = currentSectionOrder.indexOf(secId);
    if (idx <= 1) return; // Cannot move above cover (idx 0)

    const newOrder = [...currentSectionOrder];
    const prevSec = newOrder[idx - 1];
    if (prevSec === 'cover') return;

    newOrder[idx - 1] = secId;
    newOrder[idx] = prevSec;

    setDetails({ ...details, sectionOrder: newOrder });
    showToast(`Urutan section dipindahkan ke atas ⬆️`, 'success');
  };

  const moveSectionDown = (secId: SectionType) => {
    if (secId === 'cover' || secId === 'footer') return;
    const idx = currentSectionOrder.indexOf(secId);
    if (idx === -1 || idx >= currentSectionOrder.length - 2) return; // Cannot move below footer

    const newOrder = [...currentSectionOrder];
    const nextSec = newOrder[idx + 1];
    if (nextSec === 'footer') return;

    newOrder[idx + 1] = secId;
    newOrder[idx] = nextSec;

    setDetails({ ...details, sectionOrder: newOrder });
    showToast(`Urutan section dipindahkan ke bawah ⬇️`, 'success');
  };

  const toggleSectionHidden = (secId: SectionType) => {
    if (secId === 'cover' || secId === 'footer') return;
    const isNowHidden = !hiddenSectionsMap[secId];
    setDetails({
      ...details,
      hiddenSections: {
        ...hiddenSectionsMap,
        [secId]: isNowHidden,
      },
    });
    showToast(`Section ${secId} ${isNowHidden ? 'disembunyikan ⚪' : 'diaktifkan 🟢'}`, 'success');
  };

  // Inputs Handlers
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

  const addGalleryPhoto = () => {
    if (!newGalleryUrl) return;
    setDetails((prev: any) => ({
      ...prev,
      gallery: [...(prev.gallery || []), newGalleryUrl],
    }));
    setNewGalleryUrl('');
    showToast('Foto galeri ditambahkan! 🖼️', 'success');
  };

  const removeGalleryPhoto = (index: number) => {
    setDetails((prev: any) => ({
      ...prev,
      gallery: prev.gallery.filter((_: any, i: number) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Memuat editor undangan...
      </div>
    );
  }

  const isWedding = eventType === 'Pernikahan';
  const displayTitle = isWedding
    ? `Edit Undangan: ${details.panggilanPria || 'Pria'} & ${details.panggilanWanita || 'Wanita'}`
    : `Edit Undangan: ${eventTitle || 'Acara'}`;

  const userName = session?.user?.name || 'User JoinMe';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  // Dynamic Live Event Data Bindings for Right Side Preview
  const liveEventDetails = {
    title: eventTitle,
    subdomain: eventSubdomain,
    type: eventType,
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
    organizerName: details.organizerName || 'Keluarga Besar Wijaya',
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
    ticketUrl: details.ticketUrl,
    liveStreamUrl: details.liveStreamUrl,
    coverTitle: details.coverTitle,
    coverCoupleName: details.coverCoupleName,
    cover_photo: details.cover_photo,
    sectionOrder: currentSectionOrder,
    hiddenSections: hiddenSectionsMap,
  };

  const previewNodes = (event?.details?.studioNodes && Array.isArray(event.details.studioNodes) && event.details.studioNodes.length > 0)
    ? (event.details.studioNodes as unknown as StudioNode[])
    : (DEFAULT_NODES as unknown as StudioNode[]);

  const previewGlobalStyles = event?.details?.globalStyles || {
    bgColor: '#eff2ef',
    fontFamily: 'Playfair Display',
  };

  const sortedPreviewNodes = getOrderedAndFilteredNodes(previewNodes, liveEventDetails);

  return (
    <div className="db-container">
      {/* Left Sidebar Menu */}
      <aside className="db-sidebar" style={{ width: '310px' }}>
        <div className="db-sidebar-header">
          <Link href="/" className="logo">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Join<span className="logo-accent">Me</span></span>
          </Link>
        </div>

        <nav className="db-menu" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', paddingRight: '4px' }}>
          <Link href="/dashboard" className="db-menu-item" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Portal</span>
          </Link>

          {/* Tab 0: Informasi Umum / Metadata */}
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`db-menu-item ${activeTab === 'info' ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '10px 12px', borderRadius: '10px', backgroundColor: activeTab === 'info' ? 'var(--primary-light, #fff0f5)' : 'transparent' }}
          >
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>⚙️ 0. Informasi Umum</span>
            <span className="tab-status-icon completed" />
          </button>

          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '1rem 0 0.5rem 0', paddingLeft: '0.5rem', letterSpacing: '0.05em' }}>
            DAFTAR SECTION UNDANGAN ({SECTION_DEFINITIONS.filter((s) => s.id !== 'rsvp' && s.id !== 'wishes' && s.id !== 'footer').length})
          </div>

          {/* Section Tabs with Reorder ⬆️ ⬇️ and Toggle Sakelar ON/OFF */}
          {currentSectionOrder
            .filter((secId) => secId !== 'rsvp' && secId !== 'wishes' && secId !== 'footer')
            .map((secId, secIdx) => {
            const secDef = SECTION_DEFINITIONS.find((s) => s.id === secId) || {
              id: secId,
              label: secId,
              icon: '📄',
              isFixed: false,
            };
            const isHidden = hiddenSectionsMap[secId] === true;
            const isFixed = secDef.isFixed || secId === 'cover' || (secId as string) === 'footer';

            return (
              <div
                key={secId}
                className={`db-menu-item ${activeTab === secId ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '4px',
                  padding: '6px 8px',
                  opacity: isHidden ? 0.5 : 1,
                  borderRadius: '8px',
                  marginBottom: '4px',
                  backgroundColor: activeTab === secId ? 'var(--bg-card)' : 'transparent',
                }}
              >
                {/* Clickable Tab Title */}
                <button
                  type="button"
                  onClick={() => setActiveTab(secId)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    fontWeight: activeTab === secId ? 800 : 600,
                    color: activeTab === secId ? 'var(--primary)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{secDef.icon}</span>
                  <span style={{ textDecoration: isHidden ? 'line-through' : 'none' }}>
                    {secIdx + 1}. {secDef.label}
                  </span>
                </button>

                {/* Controls: Reorder Arrows & Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                  {!isFixed && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveSectionUp(secId)}
                        disabled={secIdx <= 1}
                        style={{ background: 'none', border: 'none', cursor: secIdx <= 1 ? 'default' : 'pointer', fontSize: '0.65rem', opacity: secIdx <= 1 ? 0.2 : 0.8 }}
                        title="Pindahkan ke atas"
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSectionDown(secId)}
                        disabled={secIdx >= currentSectionOrder.length - 2}
                        style={{ background: 'none', border: 'none', cursor: secIdx >= currentSectionOrder.length - 2 ? 'default' : 'pointer', fontSize: '0.65rem', opacity: secIdx >= currentSectionOrder.length - 2 ? 0.2 : 0.8 }}
                        title="Pindahkan ke bawah"
                      >
                        ⬇️
                      </button>
                    </>
                  )}

                  {/* Toggle Switch Button */}
                  <button
                    type="button"
                    onClick={() => toggleSectionHidden(secId)}
                    disabled={isFixed}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: isFixed ? 'default' : 'pointer',
                      fontSize: '0.72rem',
                      opacity: isFixed ? 0.4 : 1,
                    }}
                    title={isFixed ? 'Section Wajib' : isHidden ? 'Aktifkan Section' : 'Sembunyikan Section'}
                  >
                    {isFixed ? '🔒' : isHidden ? '⚪' : '🟢'}
                  </button>
                </div>
              </div>
            );
          })}
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

      {/* Main Content Area */}
      <main className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <div>
            <span className="panel-desc">Portal Pelanggan &gt; Editor Undangan</span>
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
              <span>{showPreview ? '🙈 Sembunyikan Pratinjau' : '👁️ Tampilkan Pratinjau'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.15rem', backgroundColor: '#16a34a', borderColor: '#16a34a', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, gap: '0.5rem', color: 'white' }}
            >
              <span>{saving ? '...' : 'Simpan'}</span>
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Scroll View: Side-by-Side 2 Column Layout */}
        <div className="db-view">
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', width: '100%' }}>
            {/* Left Column: Active Step Form Cards */}
            <div className="db-card-panel" style={{ flex: 1, minWidth: 0, padding: '2.5rem' }}>
              <form onSubmit={handleSave}>

                {/* TAB 0: INFORMASI UMUM & METADATA */}
                {activeTab === 'info' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      ⚙️ Informasi Umum &amp; Metadata Undangan
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Atur judul proyek acara, tautan subdomain, jenis acara, dan ganti desain tema undangan secara fleksibel.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Judul Proyek Undangan / Nama Acara</label>
                        <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Contoh: Pernikahan Roni & Anti" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Alamat Subdomain / Slug (.joinme.id)</label>
                        <input type="text" value={eventSubdomain} onChange={(e) => setEventSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="roni-anti" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Kategori Jenis Acara</label>
                        <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          <option value="Pernikahan">💍 Pernikahan (Wedding)</option>
                          <option value="Ulang Tahun">🎉 Ulang Tahun (Birthday Party)</option>
                          <option value="Syukuran">🍃 Syukuran &amp; Aqiqah</option>
                          <option value="Bisnis">💼 Acara Bisnis &amp; Seminar</option>
                        </select>
                      </div>

                      {/* Theme Switcher Button */}
                      <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>🎨 Tema Undangan Terpasang</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ingin mencoba variasi desain tema lain?</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            loadActiveTemplates();
                            setIsThemeModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ fontWeight: 800, padding: '0.65rem 1.25rem', borderRadius: '20px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                        >
                          ✨ Ganti Tema Undangan
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('cover')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Cover &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 1: COVER */}
                {activeTab === 'cover' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      💌 1. Section Cover (Sampul Undangan)
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Atur judul sampul utama, nama mempelai/pasangan yang tampil pada cover, dan foto latar utama.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Judul Sampul Utama</label>
                        <input type="text" placeholder="WALIMATUL URSY" value={details.coverTitle || ''} onChange={(e) => setDetails({ ...details, coverTitle: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Mempelai / Pasangan pada Cover</label>
                        <input type="text" placeholder="Roni &amp; Anti" value={details.coverCoupleName || ''} onChange={(e) => setDetails({ ...details, coverCoupleName: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🖼️ URL Foto Latar Sampul Utama (cover_photo)</label>
                        <input type="text" placeholder="https://images.unsplash.com/photo-..." value={details.cover_photo || ''} onChange={(e) => setDetails({ ...details, cover_photo: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('info')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('hero')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Hero Banner &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: HERO BANNER */}
                {activeTab === 'hero' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      ✨ 2. Hero Banner Section
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Section judul utama yang tampil di bawah cover setelah undangan dibuka.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teks Hero Title</label>
                        <input type="text" placeholder="The Wedding Of Roni & Anti" value={details.heroTitle || ''} onChange={(e) => setDetails({ ...details, heroTitle: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('cover')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('opening')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Ucapan Pembuka &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: UCAPAN PEMBUKA */}
                {activeTab === 'opening' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      📜 3. Ucapan Pembuka &amp; Mukadimah
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Ayat kitab suci atau kata-kata salam pembuka untuk tamu undangan.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teks Kata Pembuka / Ayat</label>
                        <textarea rows={4} placeholder="Dan di antara tanda-tanda kekuasaan-Nya..." value={details.openingText || ''} onChange={(e) => setDetails({ ...details, openingText: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('hero')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('bride_groom')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Profil Mempelai &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: PROFIL MEMPELAI / PENYELENGGARA */}
                {activeTab === 'bride_groom' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      👩‍❤️‍👨 4. Profil Mempelai / Penyelenggara
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      {isWedding ? 'Data lengkap mempelai pria & wanita beserta nama orang tua & foto.' : 'Data lengkap penyelenggara acara.'}
                    </p>

                    {isWedding ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>🤵 Mempelai Pria</h3>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap &amp; Gelar</label>
                            <input type="text" placeholder="Roni Wijaya, S.Kom." value={details.mempelaiPria || ''} onChange={(e) => setDetails({ ...details, mempelaiPria: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
                            <input type="text" placeholder="Roni" value={details.panggilanPria || ''} onChange={(e) => setDetails({ ...details, panggilanPria: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua</label>
                            <input type="text" placeholder="Putra Bpk. Hendra & Ibu Siska" value={details.ortuPria || ''} onChange={(e) => setDetails({ ...details, ortuPria: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🖼️ URL Foto Pria (fotoPria)</label>
                            <input type="text" placeholder="https://images.unsplash.com/..." value={details.fotoPria || ''} onChange={(e) => setDetails({ ...details, fotoPria: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                        </div>

                        <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>👰 Mempelai Wanita</h3>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Lengkap &amp; Gelar</label>
                            <input type="text" placeholder="Anti Kartika, S.T." value={details.mempelaiWanita || ''} onChange={(e) => setDetails({ ...details, mempelaiWanita: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Panggilan</label>
                            <input type="text" placeholder="Anti" value={details.panggilanWanita || ''} onChange={(e) => setDetails({ ...details, panggilanWanita: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Orang Tua</label>
                            <input type="text" placeholder="Putri Bpk. Gunawan & Ibu Maya" value={details.ortuWanita || ''} onChange={(e) => setDetails({ ...details, ortuWanita: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🖼️ URL Foto Wanita (fotoWanita)</label>
                            <input type="text" placeholder="https://images.unsplash.com/..." value={details.fotoWanita || ''} onChange={(e) => setDetails({ ...details, fotoWanita: e.target.value })} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Penyelenggara Acara</label>
                          <input type="text" placeholder="Denny Sumargo" value={details.organizerName || ''} onChange={(e) => setDetails({ ...details, organizerName: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('opening')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('event_schedule')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Waktu &amp; Tempat &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: WAKTU & TEMPAT */}
                {activeTab === 'event_schedule' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      📅 5. Waktu &amp; Lokasi Acara
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Rincian sesi acara (Akad Nikah, Resepsi, Pesta, Seminar) beserta alamat dan link Google Maps.
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

                    {/* Schedule List */}
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
                      <button type="button" onClick={() => setActiveTab('bride_groom')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('live_streaming')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Live Streaming &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 6: LIVE STREAMING */}
                {activeTab === 'live_streaming' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      🎥 6. Virtual Event &amp; Live Streaming
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Tautan siaran langsung untuk tamu yang menghadiri acara secara virtual.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Platform Live Stream</label>
                        <select value={details.liveStreamPlatform || 'YouTube Live'} onChange={(e) => setDetails({ ...details, liveStreamPlatform: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          <option value="YouTube Live">🎥 YouTube Live</option>
                          <option value="Zoom Meeting">💻 Zoom Meeting</option>
                          <option value="Instagram Live">📸 Instagram Live</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>URL Tautan Live Stream</label>
                        <input type="text" placeholder="https://youtube.com/live/..." value={details.liveStreamUrl || ''} onChange={(e) => setDetails({ ...details, liveStreamUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('event_schedule')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('love_story')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Kisah Cinta &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 7: KISAH CINTA (LOVE STORY) */}
                {activeTab === 'love_story' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      📖 7. Kisah Cinta (Love Story Timeline)
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Bagikan kenangan indah perjalanan dari awal bertemu hingga menuju hari bahagia.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px dashed var(--primary)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>💖 Tambahkan Momen Baru</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <input type="text" placeholder="Tahun (2022)" value={storyYear} onChange={(e) => setStoryYear(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                        <input type="text" placeholder="Judul Momen (Pertama Bertemu)" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                      <textarea placeholder="Ceritakan kisah singkat momen ini..." value={storyDesc} onChange={(e) => setStoryDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '1rem' }} />
                      <button type="button" onClick={addStory} className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        + Tambahkan Momen
                      </button>
                    </div>

                    {details.story?.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('live_streaming')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('gallery')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Galeri &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 8: GALERI FOTO & VIDEO */}
                {activeTab === 'gallery' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      🖼️ 8. Galeri Foto &amp; Musik Latar
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Foto momen kebersamaan dan musik latar pengiring undangan digital.
                    </p>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>URL Musik Latar MP3</label>
                      <input type="text" placeholder="https://example.com/song.mp3" value={details.musicUrl || ''} onChange={(e) => setDetails({ ...details, musicUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px dashed var(--primary)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>🖼️ Tambah URL Foto Galeri Baru</h3>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input type="text" placeholder="https://images.unsplash.com/..." value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                        <button type="button" onClick={addGalleryPhoto} className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          + Tambahkan
                        </button>
                      </div>
                    </div>

                    {details.gallery?.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                        {details.gallery.map((gUrl: string, idx: number) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '90px', border: '1px solid var(--border-color)' }}>
                            <img src={gUrl} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => removeGalleryPhoto(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('love_story')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('gift')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Amplop &amp; Hadiah &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 9: HADIAH / KADO / TIKET */}
                {activeTab === 'gift' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      🎁 9. Amplop Digital, Kado &amp; Link Tiket
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Informasi nomor rekening bank/e-wallet untuk angpao digital, alamat pengiriman kado fisik, atau link tiket seminar.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
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

                    {!isWedding && (
                      <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🎫 Link Pembelian Tiket Acara / Seminar</label>
                          <input type="text" placeholder="https://loket.com/event/..." value={details.ticketUrl || ''} onChange={(e) => setDetails({ ...details, ticketUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('gallery')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('ig_stories')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke IG Stories &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 10: INSTAGRAM STORIES */}
                {activeTab === 'ig_stories' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      📸 10. Instagram Stories Template
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Template gambar vertikal 9:16 untuk memudahkan tamu mengunduh dan membagikan undangan ke Story Instagram.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teks Kampanye Hashtag / Tagline</label>
                        <input type="text" placeholder="#RoniAntiWedding2026" value={details.igHashtag || ''} onChange={(e) => setDetails({ ...details, igHashtag: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('gift')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
                        &larr; Kembali
                      </button>
                      <button type="button" onClick={() => setActiveTab('thank_you')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontWeight: 800 }}>
                        Lanjut ke Ucapan Terimakasih &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 11: UCAPAN TERIMAKASIH */}
                {activeTab === 'thank_you' && (
                  <div className="form-step-panel active">
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      🙏 11. Ucapan Terimakasih (Closing Section)
                    </h2>
                    <p className="panel-desc" style={{ marginBottom: '2rem' }}>
                      Kalimat ungkapan rasa syukur dan terimakasih penutup dari pihak keluarga/penyelenggara.
                    </p>

                    <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', marginBottom: '2rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teks Kalimat Terimakasih</label>
                        <textarea rows={4} placeholder="Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i..." value={details.thankYouText || ''} onChange={(e) => setDetails({ ...details, thankYouText: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setActiveTab('ig_stories')} className="btn btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '30px' }}>
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
              const hasMultipleContainers = sortedPreviewNodes.length > 1;
              const coverNode = hasMultipleContainers && sortedPreviewNodes[0].sectionType === 'cover' ? sortedPreviewNodes[0] : null;
              const bodyNodes = coverNode ? sortedPreviewNodes.slice(1) : sortedPreviewNodes;

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
                      ✨ Pratinjau Live Undangan
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
                          allNodes={sortedPreviewNodes}
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
                          allNodes={sortedPreviewNodes}
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

      {/* Theme Switcher Modal */}
      {isThemeModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsThemeModalOpen(false)} style={{ zIndex: 9999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>🎨 Katalog Desain Tema</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>Pilih Tema Undangan Baru</h3>
              </div>
              <button type="button" onClick={() => setIsThemeModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {switchingTheme ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 700 }}>Mengganti Tema Undangan...</p>
              </div>
            ) : activeTemplates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <p>Belum ada template aktif tambahan di katalog saat ini.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {activeTemplates.map((tpl) => (
                  <div key={tpl.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                    <img src={tpl.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500'} alt={tpl.name} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{tpl.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>{tpl.category} • [{tpl.tier}]</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchTheme(tpl.id)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}
                      >
                        Gunakan Tema Ini 🚀
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
