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

  const storyList: any[] = Array.isArray(details.story) ? details.story : [];

  const handleUpdateStory = (index: number, field: string, val: string) => {
    const updated = [...storyList];
    updated[index] = { ...updated[index], [field]: val };
    setDetails((prev: any) => ({ ...prev, story: updated }));
  };

  const handleAddStory = () => {
    const updated = [
      ...storyList,
      {
        year: '',
        title: '',
        description: '',
        image: '',
      },
    ];
    setDetails((prev: any) => ({ ...prev, story: updated }));
  };

  const handleRemoveStory = (index: number) => {
    const updated = storyList.filter((_: any, idx: number) => idx !== index);
    setDetails((prev: any) => ({ ...prev, story: updated }));
  };

  const [primaryTab, setPrimaryTab] = useState<'data' | 'media' | 'visual'>('data');
  const [dataSectionTab, setDataSectionTab] = useState<'cover' | 'bride_groom' | 'event_schedule' | 'love_story' | 'gift' | 'general'>('bride_groom');
  const [selectedVisualSection, setSelectedVisualSection] = useState<string>('cover');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (urls: string[]) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const currentGallery = Array.isArray(details.gallery) ? [...details.gallery] : [];
    const newUrls: string[] = [];
    let count = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newUrls.push(event.target.result as string);
        }
        count++;
        if (count === files.length) {
          callback([...currentGallery, ...newUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
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

    const sType = (sectionType || '').toLowerCase();
    const nid = (nodeId || '').toLowerCase();

    if (sType === 'cover' || nid.includes('cover')) {
      setPrimaryTab('data');
      setDataSectionTab('cover');
    } else if (sType === 'bride_groom' || nid.includes('pria') || nid.includes('wanita') || nid.includes('mempelai')) {
      setPrimaryTab('data');
      setDataSectionTab('bride_groom');
    } else if (sType === 'event_schedule' || nid.includes('schedule') || nid.includes('event')) {
      setPrimaryTab('data');
      setDataSectionTab('event_schedule');
    } else if (sType === 'love_story' || nid.includes('story')) {
      setPrimaryTab('data');
      setDataSectionTab('love_story');
    } else if (sType === 'gallery' || nid.includes('gallery') || nid.includes('galeri')) {
      setPrimaryTab('media');
    } else if (sType === 'gift' || nid.includes('gift') || nid.includes('bank') || nid.includes('rekening')) {
      setPrimaryTab('data');
      setDataSectionTab('gift');
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

        {/* PRIMARY SIDEBAR TABS HEADER (3 TABS: DATA, MEDIA, VISUAL) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}>
          <button
            type="button"
            onClick={() => setPrimaryTab('data')}
            style={{
              flex: 1,
              padding: '0.75rem 0.2rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: 'none',
              borderBottom: primaryTab === 'data' ? '3px solid var(--primary)' : '3px solid transparent',
              backgroundColor: primaryTab === 'data' ? 'var(--bg-card)' : 'transparent',
              color: primaryTab === 'data' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            📝 Data
          </button>
          <button
            type="button"
            onClick={() => setPrimaryTab('media')}
            style={{
              flex: 1,
              padding: '0.75rem 0.2rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: 'none',
              borderBottom: primaryTab === 'media' ? '3px solid var(--primary)' : '3px solid transparent',
              backgroundColor: primaryTab === 'media' ? 'var(--bg-card)' : 'transparent',
              color: primaryTab === 'media' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            📁 Media
          </button>
          <button
            type="button"
            onClick={() => setPrimaryTab('visual')}
            style={{
              flex: 1,
              padding: '0.75rem 0.2rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: 'none',
              borderBottom: primaryTab === 'visual' ? '3px solid var(--primary)' : '3px solid transparent',
              backgroundColor: primaryTab === 'visual' ? 'var(--bg-card)' : 'transparent',
              color: primaryTab === 'visual' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            🎨 Visual
          </button>
        </div>

        {/* SIDEBAR TAB CONTENTS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1rem 1.25rem' }}>

          {/* TAB 1: DATA UNDANGAN */}
          {primaryTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Data Section Selector Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem' }} className="no-scrollbar">
                {[
                  { id: 'bride_groom', label: '👩‍❤️‍👨 Mempelai' },
                  { id: 'event_schedule', label: '📅 Acara' },
                  { id: 'love_story', label: '📖 Kisah Cinta' },
                  { id: 'cover', label: '💌 Cover' },
                  { id: 'gift', label: '💳 Hadiah' },
                  { id: 'general', label: '⚙️ Pengaturan' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setDataSectionTab(sec.id as any)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: dataSectionTab === sec.id ? 'var(--primary)' : 'var(--bg-body)',
                      color: dataSectionTab === sec.id ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Data Form: Data Mempelai */}
              {dataSectionTab === 'bride_groom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    👩‍❤️‍👨 Data Mempelai Pria & Wanita
                  </div>

                  {/* Mempelai Pria */}
                  <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      🤵 Mempelai Pria
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Lengkap & Gelar</label>
                      <input type="text" placeholder="misal: Roni Wijaya, S.Kom." value={details.mempelaiPria || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, mempelaiPria: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Panggilan</label>
                      <input type="text" placeholder="misal: Roni" value={details.panggilanPria || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, panggilanPria: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Orang Tua & Putra Ke-</label>
                      <input type="text" placeholder="Putra pertama dari Bapak..." value={details.ortuPria || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, ortuPria: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Username Instagram</label>
                      <input type="text" placeholder="@roni_wijaya" value={details.igPria || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, igPria: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                  </div>

                  {/* Mempelai Wanita */}
                  <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      👰 Mempelai Wanita
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Lengkap & Gelar</label>
                      <input type="text" placeholder="misal: Anti Kartika, S.T." value={details.mempelaiWanita || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, mempelaiWanita: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Panggilan</label>
                      <input type="text" placeholder="misal: Anti" value={details.panggilanWanita || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, panggilanWanita: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Orang Tua & Putri Ke-</label>
                      <input type="text" placeholder="Putri kedua dari Bapak..." value={details.ortuWanita || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, ortuWanita: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Username Instagram</label>
                      <input type="text" placeholder="@anti_kartika" value={details.igWanita || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, igWanita: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Data Form: Rangkaian Acara */}
              {dataSectionTab === 'event_schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📅 Rangkaian Acara & Lokasi
                  </div>

                  {schedulesList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', backgroundColor: 'var(--bg-body)', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '2rem' }}>📅</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Belum Ada Acara</div>
                      <button type="button" onClick={handleAddSchedule} style={{ padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 800, borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                        ➕ Tambah Acara Pertama
                      </button>
                    </div>
                  ) : (
                    schedulesList.map((sch: any, idx: number) => (
                      <div key={`sch-item-${idx}`} style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>Acara #{idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveSchedule(idx)} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 700 }}>🗑️ Hapus</button>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Acara</label>
                          <input type="text" placeholder="misal: Akad Nikah" value={sch.title || sch.name || ''} onChange={(e) => handleUpdateSchedule(idx, 'title', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Tanggal Acara</label>
                          <input type="text" placeholder="misal: Senin, 21 September 2026" value={sch.date || ''} onChange={(e) => handleUpdateSchedule(idx, 'date', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Waktu / Jam</label>
                          <input type="text" placeholder="misal: 08:00 - 10:00 WIB" value={sch.time || ''} onChange={(e) => handleUpdateSchedule(idx, 'time', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Nama Tempat / Gedung</label>
                          <input type="text" placeholder="misal: Grand Ballroom Hotel Mulia" value={sch.place || sch.location || ''} onChange={(e) => handleUpdateSchedule(idx, 'place', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Alamat Lengkap</label>
                          <textarea rows={2} placeholder="Jl. Asia Afrika No. 8, Senayan..." value={sch.address || ''} onChange={(e) => handleUpdateSchedule(idx, 'address', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>URL Google Maps</label>
                          <input type="text" placeholder="https://maps.google.com/..." value={sch.mapsUrl || sch.mapUrl || ''} onChange={(e) => handleUpdateSchedule(idx, 'mapsUrl', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                      </div>
                    ))
                  )}

                  {schedulesList.length > 0 && (
                    <button type="button" onClick={handleAddSchedule} style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', border: '1px dashed var(--primary)', backgroundColor: 'var(--primary-light, #fff0f5)', color: 'var(--primary)', cursor: 'pointer' }}>
                      ➕ Tambah Rangkaian Acara Baru
                    </button>
                  )}
                </div>
              )}

              {/* Data Form: Kisah Cinta */}
              {dataSectionTab === 'love_story' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📖 Section Kisah Cinta (Love Story)
                  </div>

                  {storyList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', backgroundColor: 'var(--bg-body)', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '2rem' }}>📖</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Belum Ada Kisah Cinta</div>
                      <button type="button" onClick={handleAddStory} style={{ padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 800, borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                        ➕ Tambah Kisah Cinta Pertama
                      </button>
                    </div>
                  ) : (
                    storyList.map((st: any, idx: number) => (
                      <div key={`story-item-${idx}`} style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>Momen #{idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveStory(idx)} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 700 }}>🗑️ Hapus</button>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Tahun / Tanggal Momen</label>
                          <input type="text" placeholder="misal: 2021" value={st.year || st.date || ''} onChange={(e) => handleUpdateStory(idx, 'year', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Judul Momen</label>
                          <input type="text" placeholder="misal: Pertama Pertemuan" value={st.title || ''} onChange={(e) => handleUpdateStory(idx, 'title', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Cerita Momen</label>
                          <textarea rows={3} placeholder="Tuliskan cerita..." value={st.description || st.story || ''} onChange={(e) => handleUpdateStory(idx, 'description', e.target.value)} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                        </div>
                      </div>
                    ))
                  )}

                  {storyList.length > 0 && (
                    <button type="button" onClick={handleAddStory} style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', border: '1px dashed var(--primary)', backgroundColor: 'var(--primary-light, #fff0f5)', color: 'var(--primary)', cursor: 'pointer' }}>
                      ➕ Tambah Momen Baru
                    </button>
                  )}
                </div>
              )}

              {/* Data Form: Cover */}
              {dataSectionTab === 'cover' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    💌 Sampul & Cover Undangan
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Judul Teks Cover</label>
                    <input type="text" placeholder="The Wedding Of" value={details.coverTitle || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, coverTitle: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Nama Pasangan di Cover</label>
                    <input type="text" placeholder="Roni & Anti" value={details.coverCoupleName || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, coverCoupleName: e.target.value }))} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                  </div>
                </div>
              )}

              {/* Data Form: Hadiah & Rekening */}
              {dataSectionTab === 'gift' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    💳 Hadiah & Amplop Digital
                  </div>
                  <div style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>Bank / E-Wallet #1</div>
                    <input type="text" placeholder="Nama Bank (misal: BCA)" value={details.bank1Nama || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, bank1Nama: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    <input type="text" placeholder="Nomor Rekening" value={details.bank1Rek || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, bank1Rek: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    <input type="text" placeholder="Atas Nama" value={details.bank1An || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, bank1An: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                  </div>

                  <div style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>Bank / E-Wallet #2</div>
                    <input type="text" placeholder="Nama Bank (misal: Mandiri / GoPay)" value={details.bank2Nama || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, bank2Nama: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    <input type="text" placeholder="Nomor Rekening" value={details.bank2Rek || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, bank2Rek: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                    <input type="text" placeholder="Atas Nama" value={details.bank2An || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, bank2An: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} />
                  </div>
                </div>
              )}

              {/* Data Form: Pengaturan */}
              {dataSectionTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚙️ Pengaturan Undangan
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Judul Undangan</label>
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
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEDIA & FOTO */}
          {primaryTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📁 Media & Pustaka Foto
              </div>

              {/* Foto Mempelai Pria */}
              <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🤵 Foto Mempelai Pria
                </div>
                {details.fotoPria && (
                  <img src={details.fotoPria} alt="Foto Pria" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <label style={{ display: 'inline-block', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', textAlign: 'center', cursor: 'pointer' }}>
                  📤 Unggah Foto Pria
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, (url) => setDetails((prev: any) => ({ ...prev, fotoPria: url })))} />
                </label>
                <input type="text" placeholder="atau tempel URL foto..." value={details.fotoPria || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoPria: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff' }} />
              </div>

              {/* Foto Mempelai Wanita */}
              <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  👰 Foto Mempelai Wanita
                </div>
                {details.fotoWanita && (
                  <img src={details.fotoWanita} alt="Foto Wanita" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <label style={{ display: 'inline-block', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', textAlign: 'center', cursor: 'pointer' }}>
                  📤 Unggah Foto Wanita
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, (url) => setDetails((prev: any) => ({ ...prev, fotoWanita: url })))} />
                </label>
                <input type="text" placeholder="atau tempel URL foto..." value={details.fotoWanita || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, fotoWanita: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff' }} />
              </div>

              {/* Foto Cover Utama */}
              <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  💌 Foto Cover Utama
                </div>
                {details.cover_photo && (
                  <img src={details.cover_photo} alt="Foto Cover" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <label style={{ display: 'inline-block', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', textAlign: 'center', cursor: 'pointer' }}>
                  📤 Unggah Foto Cover
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, (url) => setDetails((prev: any) => ({ ...prev, cover_photo: url })))} />
                </label>
                <input type="text" placeholder="atau tempel URL foto..." value={details.cover_photo || ''} onChange={(e) => setDetails((prev: any) => ({ ...prev, cover_photo: e.target.value }))} style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff' }} />
              </div>

              {/* Album Galeri Foto */}
              <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🖼️ Album Galeri Foto Undangan
                </div>

                <label style={{ display: 'inline-block', padding: '0.6rem 0.85rem', fontSize: '0.78rem', fontWeight: 800, borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', textAlign: 'center', cursor: 'pointer' }}>
                  📤 Unggah Foto Galeri (Bisa Pilih Banyak Foto)
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleMultiFileUpload(e, (urls) => setDetails((prev: any) => ({ ...prev, gallery: urls })))} />
                </label>

                {Array.isArray(details.gallery) && details.gallery.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {details.gallery.map((imgUrl: string, gIdx: number) => (
                      <div key={`gal-item-${gIdx}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '90px' }}>
                        <img src={imgUrl} alt={`Galeri ${gIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedGal = details.gallery.filter((_: any, idx: number) => idx !== gIdx);
                            setDetails((prev: any) => ({ ...prev, gallery: updatedGal }));
                          }}
                          style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAMPILAN VISUAL */}
          {primaryTab === 'visual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎨 Pengaturan Visual Section
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Pilih Section yang Diatur</label>
                <select
                  value={selectedVisualSection}
                  onChange={(e) => setSelectedVisualSection(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                >
                  <option value="cover">💌 Section Cover</option>
                  <option value="hero">👑 Section Hero</option>
                  <option value="opening">✨ Section Opening</option>
                  <option value="bride_groom">👩‍❤️‍👨 Section Mempelai</option>
                  <option value="event_schedule">📅 Section Rangkaian Acara</option>
                  <option value="love_story">📖 Section Kisah Cinta</option>
                  <option value="gallery">🖼️ Section Galeri</option>
                  <option value="rsvp">💌 Section RSVP</option>
                  <option value="footer">🌸 Section Closing & Footer</option>
                </select>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⚙️ Style Background: Section {selectedVisualSection}
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Foto Latar Belakang Container</label>
                  <label style={{ display: 'block', padding: '0.45rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', textAlign: 'center', cursor: 'pointer', marginBottom: '0.35rem' }}>
                    📤 Unggah Foto Latar
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, (url) => {
                      setDetails((prev: any) => ({
                        ...prev,
                        sectionVisuals: {
                          ...(prev.sectionVisuals || {}),
                          [selectedVisualSection]: {
                            ...(prev.sectionVisuals?.[selectedVisualSection] || {}),
                            backgroundImage: url,
                          },
                        },
                      }));
                    })} />
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={details.sectionVisuals?.[selectedVisualSection]?.backgroundImage || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDetails((prev: any) => ({
                        ...prev,
                        sectionVisuals: {
                          ...(prev.sectionVisuals || {}),
                          [selectedVisualSection]: {
                            ...(prev.sectionVisuals?.[selectedVisualSection] || {}),
                            backgroundImage: val,
                          },
                        },
                      }));
                    }}
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Warna Latar Belakang Tint</label>
                  <input
                    type="color"
                    value={details.sectionVisuals?.[selectedVisualSection]?.backgroundColor || '#ffffff'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDetails((prev: any) => ({
                        ...prev,
                        sectionVisuals: {
                          ...(prev.sectionVisuals || {}),
                          [selectedVisualSection]: {
                            ...(prev.sectionVisuals?.[selectedVisualSection] || {}),
                            backgroundColor: val,
                          },
                        },
                      }));
                    }}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Visibilitas Section ini</label>
                  <button
                    type="button"
                    onClick={() => {
                      const isHidden = details.hiddenSections?.[selectedVisualSection];
                      setDetails((prev: any) => ({
                        ...prev,
                        hiddenSections: {
                          ...(prev.hiddenSections || {}),
                          [selectedVisualSection]: !isHidden,
                        },
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: details.hiddenSections?.[selectedVisualSection] ? '#fee2e2' : '#dcfce7',
                      color: details.hiddenSections?.[selectedVisualSection] ? '#dc2626' : '#16a34a',
                      cursor: 'pointer',
                    }}
                  >
                    {details.hiddenSections?.[selectedVisualSection] ? '🙈 Sembunyikan Section Ini' : '👁️ Tampilkan Section Ini'}
                  </button>
                </div>
              </div>
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
