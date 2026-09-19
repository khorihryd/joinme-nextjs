'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { NodeRenderer } from '@/components/studio/NodeRenderer';
import { useStudioStore, DEFAULT_NODES, GlobalStyles, loadNodeFonts, ensureGoogleFontLoaded, getGlobalCssVariables, DEFAULT_SAMPLE_STORIES, DEFAULT_SAMPLE_SCHEDULES, DEFAULT_SAMPLE_BANKS, DEFAULT_SAMPLE_GALLERY } from '@/store/studio-store';
import { StudioNode } from '@/types';

export default function StudioPreviewPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = resolvedParams?.id;
  const [nodes, setNodes] = useState<StudioNode[]>([]);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>({
    bgColor: '#eff2ef',
    padding: '24px',
    margin: '0px',
    fontFamily: 'Playfair Display',
  });
  const [loading, setLoading] = useState(true);
  const [notReady, setNotReady] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const sampleData = globalStyles?.sampleEventDetails || {};
  const activeGallery =
    (Array.isArray(globalStyles?.galleryImages) && globalStyles.galleryImages.length > 0)
      ? globalStyles.galleryImages
      : (Array.isArray(sampleData?.gallery) && sampleData.gallery.length > 0)
      ? sampleData.gallery
      : (Array.isArray(sampleData?.galleryImages) && sampleData.galleryImages.length > 0)
      ? sampleData.galleryImages
      : (Array.isArray(sampleData?.photos) && sampleData.photos.length > 0)
      ? sampleData.photos
      : DEFAULT_SAMPLE_GALLERY;

  const pPria = sampleData.panggilanPria || 'Jonathan';
  const pWanita = sampleData.panggilanWanita || 'Anti';
  const iPria = sampleData.inisialPria || sampleData.inisial_pria || sampleData.groom_initial || (pPria ? pPria.trim().charAt(0).toUpperCase() : 'J');
  const iWanita = sampleData.inisialWanita || sampleData.inisial_wanita || sampleData.bride_initial || (pWanita ? pWanita.trim().charAt(0).toUpperCase() : 'A');
  const iPasangan = sampleData.inisialPasangan || sampleData.inisial_pasangan || sampleData.couple_initials || `${iPria} & ${iWanita}`;

  const eventDetails = {
    mempelaiPria: sampleData.mempelaiPria || 'Jonathan Wijaya, S.Kom.',
    panggilanPria: pPria,
    inisialPria: iPria,
    inisial_pria: iPria,
    groom_initial: iPria,
    ortuPria: sampleData.ortuPria || 'Putra dari Bp. Hendra & Ibu Maria',
    mempelaiWanita: sampleData.mempelaiWanita || 'Anti Rahmawati, S.T.',
    panggilanWanita: pWanita,
    inisialWanita: iWanita,
    inisial_wanita: iWanita,
    bride_initial: iWanita,
    inisialPasangan: iPasangan,
    inisial_pasangan: iPasangan,
    couple_initials: iPasangan,
    ortuWanita: sampleData.ortuWanita || 'Putri dari Bp. Bambang & Ibu Sri',
    event_date: sampleData.event_date || sampleData.tanggal_acara || '21 September 2026',
    event_time: sampleData.event_time || sampleData.waktu_acara || '08:00 - 14:00 WIB',
    event_location: sampleData.event_location || sampleData.lokasi_acara || 'Grand Ballroom Hotel Mulia, Jakarta',
    story: DEFAULT_SAMPLE_STORIES,
    schedules: DEFAULT_SAMPLE_SCHEDULES,
    bankAccounts: DEFAULT_SAMPLE_BANKS,
    showStory: true,
    showGallery: true,
    isCatalogPreview: true,
    isCoverOpened: isCoverOpened,
    ...sampleData,
    gallery: activeGallery,
    galleryImages: activeGallery,
    photos: activeGallery,
    images: activeGallery,
  };

  // 1. Reactive Window Resize Listener for Responsive Viewport Mode
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 640) {
        setViewportMode('mobile');
      } else if (w <= 1024) {
        setViewportMode('tablet');
      } else {
        setViewportMode('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Load Studio Template Nodes & Global Styles (Per-ID Isolated)
  useEffect(() => {
    async function loadTemplate() {
      if (!id) return;
      setLoading(true);
      setNotReady(false);

      try {
        // 1. Check if opened directly from Studio Editor (query param ?fromEditor=true)
        const isFromEditor = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fromEditor') === 'true';

        if (isFromEditor) {
          const savedPreviewNodes = localStorage.getItem(`studio_preview_nodes_${id}`) || localStorage.getItem('studio_preview_nodes');
          const savedGlobalStyles = localStorage.getItem(`studio_preview_global_styles_${id}`) || localStorage.getItem('studio_preview_global_styles');

          if (savedGlobalStyles) {
            try {
              const parsedGlobal = JSON.parse(savedGlobalStyles);
              setGlobalStyles(parsedGlobal);
              useStudioStore.setState({ globalStyles: parsedGlobal });
              if (parsedGlobal.fontFamily) ensureGoogleFontLoaded(parsedGlobal.fontFamily);
              if (parsedGlobal.typography?.fontPrimary) ensureGoogleFontLoaded(parsedGlobal.typography.fontPrimary);
              if (parsedGlobal.typography?.fontSecondary) ensureGoogleFontLoaded(parsedGlobal.typography.fontSecondary);
            } catch (e) {}
          }

          if (savedPreviewNodes) {
            const parsed = JSON.parse(savedPreviewNodes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setNodes(parsed);
              useStudioStore.setState({ nodes: parsed });
              loadNodeFonts(parsed);
              setLoading(false);
              return;
            }
          }
        }

        // 2. Fetch specific template / event from API endpoint /api/studio/${id}
        const res = await fetch(`/api/studio/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setTemplateName(data.name);

          const gStyles = data.globalStyles || data.details?.globalStyles;
          if (gStyles) {
            const parsedGlobal = typeof gStyles === 'string' ? JSON.parse(gStyles) : gStyles;
            setGlobalStyles(parsedGlobal);
            useStudioStore.setState({ globalStyles: parsedGlobal });
            if (parsedGlobal.fontFamily) ensureGoogleFontLoaded(parsedGlobal.fontFamily);
            if (parsedGlobal.typography?.fontPrimary) ensureGoogleFontLoaded(parsedGlobal.typography.fontPrimary);
            if (parsedGlobal.typography?.fontSecondary) ensureGoogleFontLoaded(parsedGlobal.typography.fontSecondary);
          }

          const rawNodes = data.nodes || data.details?.studioNodes;
          if (rawNodes) {
            const parsedNodes = Array.isArray(rawNodes) ? rawNodes : JSON.parse(rawNodes);
            if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
              setNodes(parsedNodes);
              useStudioStore.setState({ nodes: parsedNodes });
              loadNodeFonts(parsedNodes);
              setLoading(false);
              return;
            }
          }
        }

        // 3. Fallback default
        setNodes(DEFAULT_NODES as unknown as StudioNode[]);
      } catch (err) {
        console.error('Error loading template preview:', err);
        setNotReady(true);
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff2ef' }}>
        <div style={{ textAlign: 'center', color: '#666', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Memuat Pratinjau Undangan...</p>
        </div>
      </div>
    );
  }

  if (notReady || nodes.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff2ef', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎨</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#111' }}>Belum Ada Pratinjau</h3>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Template ini belum memiliki node desain canvas atau belum disimpan.
          </p>
          <Link
            href={`/studio/${id}`}
            style={{ display: 'inline-block', backgroundColor: 'var(--primary, #db2777)', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Buka Studio Editor 🛠️
          </Link>
        </div>
      </div>
    );
  }

  const handleOpenCover = () => {
    setIsCoverOpened(true);
  };

  const hasMultipleContainers = nodes.length > 1;
  const isFirstNodeCover = hasMultipleContainers && (nodes[0].sectionType === 'cover' || nodes[0].id?.toLowerCase().includes('cover'));
  const coverNode = isFirstNodeCover ? nodes[0] : null;
  const bodyNodes = hasMultipleContainers ? nodes.slice(1) : nodes;

  const cssVars = getGlobalCssVariables(globalStyles);

  const previewWrapperStyle: React.CSSProperties = {
    ...cssVars,
    minHeight: '100vh',
    width: '100%',
    margin: globalStyles.margin || '0px',
    padding: globalStyles.padding || '0px',
    backgroundColor: globalStyles.bgColor || globalStyles.colors?.background || '#eff2ef',
    backgroundImage: globalStyles.backgroundImage ? `url(${globalStyles.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: globalStyles.fontFamily || globalStyles.typography?.fontPrimary || 'inherit',
    position: 'relative',
    overflowX: 'hidden',
  };

  return (
    <div style={previewWrapperStyle}>
      {/* Cover Overlay Section */}
      {coverNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: globalStyles.bgColor || '#ffffff',
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
            node={coverNode}
            allNodes={nodes}
            selectedNodeId={null}
            onSelectNode={() => {}}
            eventDetails={eventDetails}
            viewportMode={viewportMode}
            isPreviewMode={true}
            onOpenCover={handleOpenCover}
          />
        </div>
      )}

      {/* Main Invitation Content Body */}
      <main
        style={{
          width: '100%',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          opacity: isCoverOpened || !coverNode ? 1 : 0.2,
          transition: 'opacity 0.85s ease',
        }}
      >
        {bodyNodes.map((node) => (
          <NodeRenderer
            key={node.id}
            node={node}
            allNodes={nodes}
            selectedNodeId={null}
            onSelectNode={() => {}}
            eventDetails={eventDetails}
            viewportMode={viewportMode}
            isPreviewMode={true}
            onOpenCover={handleOpenCover}
          />
        ))}
      </main>
    </div>
  );
}
