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

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Aktif'>('Draft');
  const [showPreview, setShowPreview] = useState(true);
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // Selected Node State for Properties Panel
  const [selectedMiniNodeId, setSelectedMiniNodeId] = useState<string | null>(null);

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
    coverTitle: '',
    coverCoupleName: '',
    cover_photo: '',
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
    studioNodes: null,
    globalStyles: null,
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

  // Dynamic Live Event Data Bindings for Right Side Preview
  const currentSectionOrder: SectionType[] = details.sectionOrder || SECTION_DEFINITIONS.map((s) => s.id);
  const hiddenSectionsMap: Record<string, boolean> = details.hiddenSections || {};

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
    schedules: Array.isArray(details.schedules) ? details.schedules : [],
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

  const schedulesList: any[] = Array.isArray(details.schedules) ? details.schedules : [];

  const handleUpdateSchedule = (index: number, field: string, val: string) => {
    const updated = [...schedulesList];
    updated[index] = { ...updated[index], [field]: val };
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const handleAddSchedule = () => {
    const updated = [
      ...schedulesList,
      {
        title: '',
        date: '',
        time: '',
        place: '',
        address: '',
        mapsUrl: '',
      },
    ];
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const handleRemoveSchedule = (index: number) => {
    const updated = schedulesList.filter((_: any, idx: number) => idx !== index);
    setDetails((prev: any) => ({ ...prev, schedules: updated }));
  };

  const previewNodes = (details.studioNodes && Array.isArray(details.studioNodes) && details.studioNodes.length > 0)
    ? (details.studioNodes as unknown as StudioNode[])
    : (event?.details?.studioNodes && Array.isArray(event.details.studioNodes) && event.details.studioNodes.length > 0)
    ? (event.details.studioNodes as unknown as StudioNode[])
    : (DEFAULT_NODES as unknown as StudioNode[]);

  const previewGlobalStyles = details.globalStyles || event?.details?.globalStyles || {
    bgColor: '#eff2ef',
    fontFamily: 'Playfair Display',
  };

  const sortedPreviewNodes = getOrderedAndFilteredNodes(previewNodes, liveEventDetails);

  // Helper to Find Selected Node in Preview Tree
  const findNodeInTree = (nodes: StudioNode[], targetId: string): StudioNode | null => {
    for (const n of nodes) {
      if (n.id === targetId) return n;
      if (n.children && n.children.length > 0) {
        const found = findNodeInTree(n.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedMiniNodeId ? findNodeInTree(previewNodes, selectedMiniNodeId) : null;

  // Auto Smooth Scroll to Selected Element on Canvas (Studio Stage Behavior)
  useEffect(() => {
    if (!selectedMiniNodeId) return;
    const timer = setTimeout(() => {
      const domEl = document.getElementById(`node-dom-${selectedMiniNodeId}`);
      if (domEl) {
        domEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [selectedMiniNodeId]);

  // Point-and-Click Canvas Selection Handler
  const handleSelectMiniNodeOnCanvas = (nodeId: string, sectionType?: string) => {
    setSelectedMiniNodeId(nodeId);

    // Auto open cover if node is not in cover section
    if (sectionType && sectionType !== 'cover') {
      setIsCoverOpened(true);
    } else if (sectionType === 'cover') {
      setIsCoverOpened(false);
    }
  };

  // Helper to Update Node Properties in Studio Tree
  const updateStudioNodeProp = (nodeId: string, prop: string, val: any, isStyleProp = false) => {
    const currentNodes = [...previewNodes];

    const updateRecursive = (list: StudioNode[]): StudioNode[] => {
      return list.map((n) => {
        if (n.id === nodeId) {
          if (isStyleProp) {
            return { ...n, style: { ...n.style, [prop]: val } };
          }
          return { ...n, [prop]: val };
        }
        if (n.children && n.children.length > 0) {
          return { ...n, children: updateRecursive(n.children) };
        }
        return n;
      });
    };

    const updatedNodes = updateRecursive(currentNodes);

    // Sync image URL changes to details state if bound to fotoPria, fotoWanita, cover_photo, or id matches
    if ((prop === 'content' || prop === 'src') && selectedNode) {
      const binding = selectedNode.binding || '';
      const id = selectedNode.id || '';
      if (binding === 'fotoPria' || id.includes('pria')) {
        setDetails((prev: any) => ({ ...prev, fotoPria: val, studioNodes: updatedNodes }));
        return;
      }
      if (binding === 'fotoWanita' || id.includes('wanita')) {
        setDetails((prev: any) => ({ ...prev, fotoWanita: val, studioNodes: updatedNodes }));
        return;
      }
      if (binding === 'cover_photo' || id.includes('cover')) {
        setDetails((prev: any) => ({ ...prev, cover_photo: val, studioNodes: updatedNodes }));
        return;
      }
    }

    setDetails((prev: any) => ({
      ...prev,
      studioNodes: updatedNodes,
    }));
  };

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

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Memuat Studio Mini Editor...
      </div>
    );
  }

  const isWedding = eventType === 'Pernikahan';
  const displayTitle = isWedding
    ? `Studio Mini Editor: ${details.panggilanPria || details.mempelaiPria || 'Pria'} & ${details.panggilanWanita || details.mempelaiWanita || 'Wanita'}`
    : `Studio Mini Editor: ${eventTitle || 'Acara'}`;

  const userName = session?.user?.name || 'User JoinMe';
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'var(--bg-body)', overflow: 'hidden', color: 'var(--text-primary)' }}>

      {/* LEFT SIDEBAR PANEL (Fixed Width 340px) */}
      <aside
        style={{
          width: '340px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '4px 0 12px rgba(0,0,0,0.03)',
          zIndex: 10,
        }}
      >
        {/* Header Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
              Join<span style={{ color: 'var(--primary)' }}>me</span>
            </span>
          </Link>
        </div>

        {/* Action Button: Kembali ke Portal */}
        <div style={{ padding: '1rem 1.25rem 0.5rem 1.25rem' }}>
          <Link
            href="/dashboard"
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'var(--primary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <span>&larr;</span>
            <span>Kembali ke Portal</span>
          </Link>
        </div>

        {/* Collapsible Button: Informasi Umum */}
        <div style={{ padding: '0.5rem 1.25rem' }}>
          <button
            type="button"
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: isInfoExpanded ? 'var(--primary-light, #fff0f5)' : 'var(--bg-body)',
              color: isInfoExpanded ? 'var(--primary)' : 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span>⚙️ Informasi Umum</span>
            <span>{isInfoExpanded ? '▲' : '▼'}</span>
          </button>

          {/* Expanded Metadata Form */}
          {isInfoExpanded && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Judul Acara</label>
                <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Slug Subdomain</label>
                <input type="text" value={eventSubdomain} onChange={(e) => setEventSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Status Undangan</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <option value="Draft">Draft 📄</option>
                  <option value="Aktif">Aktif 🚀</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  loadActiveTemplates();
                  setIsThemeModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}
              >
                ✨ Ganti Tema Undangan
              </button>
            </div>
          )}
        </div>

        {/* MAIN PANEL: PROPERTIES */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Properties
            </h3>
            {selectedNode && (
              <button
                type="button"
                onClick={() => setSelectedMiniNodeId(null)}
                style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}
              >
                ✕ Batal Pilih
              </button>
            )}
          </div>

          {/* PROPERTIES PANEL CONTENT */}
          {!selectedNode ? (
            /* Default Empty State when No Element Selected */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem', opacity: 0.8 }}>👆</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Pilih Elemen di Canvas
              </h4>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
                Klik salah satu elemen pada canvas pratinjau untuk mulai mengedit teks, variabel, foto, atau warna latar belakangnya.
              </p>
            </div>
          ) : (
            /* Active Node Customized Properties Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Selected Node Header Badge */}
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: 'var(--primary-light, #fff0f5)', border: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {(selectedNode.sectionType === 'event_schedule' || selectedNode.id?.includes('schedule') || selectedNode.id?.includes('event') || (selectedNode as any).isEventFeed)
                    ? '📅 Section Acara & Lokasi'
                    : selectedNode.type === 'container'
                    ? '📦 Container Section'
                    : selectedNode.type === 'image'
                    ? '📸 Gambar Widget'
                    : `✍️ Teks ${selectedNode.type}`}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {selectedNode.label || selectedNode.id}
                </span>
              </div>

              {/* Event Schedule Form (Shown when clicking any element in Event Section) */}
              {(selectedNode.sectionType === 'event_schedule' || selectedNode.id?.includes('schedule') || selectedNode.id?.includes('event') || (selectedNode as any).isEventFeed) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {schedulesList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', backgroundColor: 'var(--bg-body)', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '2rem' }}>📅</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Belum Ada Rangkaian Acara
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Tambahkan rincian acara baru (seperti Akad Nikah, Resepsi, Syukuran) untuk ditampilkan pada undangan.
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSchedule}
                        style={{
                          marginTop: '0.5rem',
                          width: '100%',
                          padding: '0.65rem',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ➕ Tambah Acara Pertama
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Kelola daftar rangkaian acara (Akad Nikah, Resepsi, Syukuran) di bawah ini. Perubahan langsung ter-update di canvas.
                    </div>
                  )}

                  {schedulesList.map((sch: any, idx: number) => (
                    <div key={`sch-form-item-${idx}`} style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Acara #{idx + 1}
                        </span>
                        {schedulesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSchedule(idx)}
                            style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                          >
                            🗑️ Hapus
                          </button>
                        )}
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Acara</label>
                        <input
                          type="text"
                          placeholder="misal: Akad Nikah"
                          value={sch.title || sch.name || ''}
                          onChange={(e) => handleUpdateSchedule(idx, 'title', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Tanggal Acara</label>
                        <input
                          type="text"
                          placeholder="misal: Senin, 21 September 2026"
                          value={sch.date || ''}
                          onChange={(e) => handleUpdateSchedule(idx, 'date', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Waktu / Jam</label>
                        <input
                          type="text"
                          placeholder="misal: 08:00 - 10:00 WIB"
                          value={sch.time || ''}
                          onChange={(e) => handleUpdateSchedule(idx, 'time', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Tempat / Gedung</label>
                        <input
                          type="text"
                          placeholder="misal: Grand Ballroom Hotel Mulia"
                          value={sch.place || sch.location || ''}
                          onChange={(e) => {
                            handleUpdateSchedule(idx, 'place', e.target.value);
                            handleUpdateSchedule(idx, 'location', e.target.value);
                          }}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Alamat Lengkap</label>
                        <textarea
                          rows={2}
                          placeholder="Jl. Asia Afrika No. 8, Senayan..."
                          value={sch.address || ''}
                          onChange={(e) => handleUpdateSchedule(idx, 'address', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>URL Google Maps</label>
                        <input
                          type="text"
                          placeholder="https://maps.google.com/..."
                          value={sch.mapsUrl || sch.mapUrl || ''}
                          onChange={(e) => {
                            handleUpdateSchedule(idx, 'mapsUrl', e.target.value);
                            handleUpdateSchedule(idx, 'mapUrl', e.target.value);
                          }}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      border: '1px dashed var(--primary)',
                      backgroundColor: 'var(--primary-light, #fff0f5)',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                  >
                    ➕ Tambah Rangkaian Acara Baru
                  </button>
                </div>
              ) : (
                <>

              {/* Text / Heading / Button Properties */}
              {['heading', 'text', 'button'].includes(selectedNode.type) && (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Isi Teks Konten
                    </label>
                    {selectedNode.type === 'text' ? (
                      <textarea
                        rows={4}
                        value={selectedNode.content || ''}
                        onChange={(e) => updateStudioNodeProp(selectedNode.id, 'content', e.target.value, false)}
                        style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={selectedNode.content || ''}
                        onChange={(e) => updateStudioNodeProp(selectedNode.id, 'content', e.target.value, false)}
                        style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                      />
                    )}

                    {/* Dynamic Variable Chips */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {['{nama_mempelai}', '{tanggal_acara}', '{lokasi_acara}', '{nama_tamu}'].map((vTag) => (
                        <button
                          key={vTag}
                          type="button"
                          onClick={() => updateStudioNodeProp(selectedNode.id, 'content', (selectedNode.content || '') + ' ' + vTag, false)}
                          style={{ fontSize: '0.68rem', padding: '3px 7px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                        >
                          + {vTag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Style: Color & Font Size & Alignment */}
                  <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Warna Teks</label>
                        <input
                          type="color"
                          value={selectedNode.style?.color || '#1e293b'}
                          onChange={(e) => updateStudioNodeProp(selectedNode.id, 'color', e.target.value, true)}
                          style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', background: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Ukuran Font (px)</label>
                        <input
                          type="number"
                          value={selectedNode.style?.fontSize || 16}
                          onChange={(e) => updateStudioNodeProp(selectedNode.id, 'fontSize', parseInt(e.target.value, 10) || 16, true)}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Alignment Teks</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                        {[
                          { id: 'left', label: '⬅️ Kiri' },
                          { id: 'center', label: '↔️ Tengah' },
                          { id: 'right', label: '➡️ Kanan' },
                        ].map((align) => (
                          <button
                            key={align.id}
                            type="button"
                            onClick={() => updateStudioNodeProp(selectedNode.id, 'textAlign', align.id, true)}
                            style={{
                              padding: '0.4rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: selectedNode.style?.textAlign === align.id ? 'var(--primary)' : 'var(--bg-card)',
                              color: selectedNode.style?.textAlign === align.id ? '#ffffff' : 'var(--text-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            {align.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Image Widget Properties */}
              {selectedNode.type === 'image' && (
                <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      URL Foto / Gambar
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={selectedNode.content || (selectedNode as any).src || ''}
                      onChange={(e) => {
                        updateStudioNodeProp(selectedNode.id, 'content', e.target.value, false);
                        updateStudioNodeProp(selectedNode.id, 'src', e.target.value, false);
                      }}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Binding Variabel Foto Dinamis
                    </label>
                    <select
                      value={selectedNode.binding || ''}
                      onChange={(e) => updateStudioNodeProp(selectedNode.id, 'binding', e.target.value, false)}
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                    >
                      <option value="">(Tanpa Binding - Foto Statis)</option>
                      <option value="fotoPria">🤵 Foto Mempelai Pria (fotoPria)</option>
                      <option value="fotoWanita">👰 Foto Mempelai Wanita (fotoWanita)</option>
                      <option value="cover_photo">💌 Foto Sampul Cover (cover_photo)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Border Radius (px)
                    </label>
                    <input
                      type="number"
                      value={selectedNode.style?.borderRadius || 0}
                      onChange={(e) => updateStudioNodeProp(selectedNode.id, 'borderRadius', parseInt(e.target.value, 10) || 0, true)}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                    />
                  </div>
                </div>
              )}

              {/* Container Properties */}
              {selectedNode.type === 'container' && (
                <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      URL Foto Latar Belakang Container
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={selectedNode.style?.backgroundImage || ''}
                      onChange={(e) => updateStudioNodeProp(selectedNode.id, 'backgroundImage', e.target.value, true)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Warna Latar Belakang Tint (`backgroundColor`)
                    </label>
                    <input
                      type="color"
                      value={selectedNode.style?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateStudioNodeProp(selectedNode.id, 'backgroundColor', e.target.value, true)}
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', background: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Padding (Jarak Dalam)
                    </label>
                    <input
                      type="text"
                      placeholder="24px"
                      value={selectedNode.style?.padding || ''}
                      onChange={(e) => updateStudioNodeProp(selectedNode.id, 'padding', e.target.value, true)}
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
      </aside>

      {/* MAIN VIEWPORT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* TOP HEADER BAR */}
        <header
          style={{
            height: '64px',
            flexShrink: 0,
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Portal Pelanggan &gt; Studio Mini Editor</div>
            <h1 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {displayTitle}
            </h1>
          </div>

          {/* Viewport Mode Switcher Buttons (Desktop, Tablet, Phone) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-body)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'desktop', label: '💻 Desktop' },
              { id: 'tablet', label: '📱 Tablet' },
              { id: 'mobile', label: '📱 Phone' },
            ].map((vp) => (
              <button
                key={vp.id}
                type="button"
                onClick={() => setViewportMode(vp.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: viewportMode === vp.id ? 'var(--primary)' : 'transparent',
                  color: viewportMode === vp.id ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {vp.label}
              </button>
            ))}
          </div>

          {/* Action Buttons: Preview, Cover Toggle & Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsCoverOpened(!isCoverOpened)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '8px', fontWeight: 700, color: 'var(--primary)', borderColor: 'var(--border-color)' }}
            >
              {isCoverOpened ? '🔒 Tutup Cover' : '🔓 Buka Cover'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!eventSubdomain) {
                  showToast('Mohon isi alamat subdomain terlebih dahulu', 'warning');
                  return;
                }
                window.open(`/invite/${eventSubdomain}`, '_blank');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '8px', fontWeight: 700 }}
            >
              Preview
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: '8px', backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 800, color: '#fff' }}
            >
              {saving ? '...' : 'Simpan'}
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* CENTER INTERACTIVE CANVAS VIEWPORT */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundColor: 'var(--bg-body)',
            backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        >
          {showPreview && (() => {
            const canvasWidth = viewportMode === 'mobile' ? '420px' : viewportMode === 'tablet' ? '768px' : '100%';
            const canvasMaxWidth = viewportMode === 'desktop' ? '1100px' : undefined;

            return (
              <div
                style={{
                  width: canvasWidth,
                  maxWidth: canvasMaxWidth,
                  minHeight: '750px',
                  backgroundColor: previewGlobalStyles.bgColor || '#eff2ef',
                  backgroundImage: previewGlobalStyles.backgroundImage ? `url(${previewGlobalStyles.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: viewportMode === 'mobile' ? '24px' : '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  position: 'relative',
                  transition: 'width 0.3s ease',
                  paddingBottom: '3rem',
                }}
              >
                {sortedPreviewNodes.map((node) => (
                  <NodeRenderer
                    key={node.id}
                    node={node}
                    allNodes={sortedPreviewNodes}
                    selectedNodeId={selectedMiniNodeId}
                    onSelectNode={(id) => handleSelectMiniNodeOnCanvas(id)}
                    eventDetails={liveEventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={false}
                    isMiniStudioMode={true}
                    onSelectMiniNode={handleSelectMiniNodeOnCanvas}
                  />
                ))}
              </div>
            );
          })()}
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
