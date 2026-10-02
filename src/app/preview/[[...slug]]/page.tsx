'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NodeRenderer } from '@/components/studio/NodeRenderer';
import {
  DEFAULT_NODES,
  GlobalStyles,
  loadNodeFonts,
  ensureGoogleFontLoaded,
  getGlobalCssVariables,
  DEFAULT_SAMPLE_EVENT_DETAILS,
  DEFAULT_SAMPLE_GALLERY,
  DEFAULT_SAMPLE_STORIES,
  DEFAULT_SAMPLE_SCHEDULES,
  DEFAULT_SAMPLE_BANKS,
} from '@/store/studio-store';
import { StudioNode } from '@/types';
import { MusicPlayer } from '@/components/invitation/MusicPlayer';

export default function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug?: string[] }> | { slug?: string[] };
}) {
  const resolvedParams =
    typeof (params as any)?.then === 'function'
      ? use(params as Promise<{ slug?: string[] }>)
      : (params as { slug?: string[] });

  const router = useRouter();

  const [template, setTemplate] = useState<any>(null);
  const [nodes, setNodes] = useState<StudioNode[]>([]);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>({
    bgColor: '#eff2ef',
    fontFamily: 'Playfair Display',
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

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

  // 2. Fetch template by slug / name
  useEffect(() => {
    async function loadTemplate() {
      const slugArr = resolvedParams?.slug;
      let rawSlug = Array.isArray(slugArr) ? slugArr.join('/') : (slugArr || '');

      if (!rawSlug || rawSlug.trim() === '') {
        router.replace('/#templates');
        return;
      }

      if (typeof window !== 'undefined' && window.location.hash && !rawSlug.includes('#')) {
        rawSlug = rawSlug + window.location.hash;
      }

      setLoading(true);
      setNotFound(false);

      try {
        const res = await fetch(`/api/templates?slug=${encodeURIComponent(rawSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setTemplate(data);

            const gStyles = data.globalStyles || {};
            const parsedGlobal = typeof gStyles === 'string' ? JSON.parse(gStyles) : gStyles;
            setGlobalStyles(parsedGlobal);

            if (parsedGlobal.fontFamily) ensureGoogleFontLoaded(parsedGlobal.fontFamily);
            if (parsedGlobal.typography?.fontPrimary) ensureGoogleFontLoaded(parsedGlobal.typography.fontPrimary);
            if (parsedGlobal.typography?.fontSecondary) ensureGoogleFontLoaded(parsedGlobal.typography.fontSecondary);

            const rawNodes = data.nodes;
            const parsedNodes = rawNodes
              ? Array.isArray(rawNodes)
                ? rawNodes
                : JSON.parse(rawNodes)
              : DEFAULT_NODES;

            if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
              setNodes(parsedNodes);
              loadNodeFonts(parsedNodes);
            } else {
              setNodes(DEFAULT_NODES as unknown as StudioNode[]);
            }

            setLoading(false);
            return;
          }
        }

        setNotFound(true);
      } catch (err) {
        console.error('Error fetching template for preview:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [resolvedParams, router]);

  const sampleData = globalStyles?.sampleEventDetails || DEFAULT_SAMPLE_EVENT_DETAILS;

  const activeGallery =
    Array.isArray(sampleData?.gallery) && sampleData.gallery.length > 0
      ? sampleData.gallery
      : Array.isArray(globalStyles?.galleryImages) && globalStyles.galleryImages.length > 0
      ? globalStyles.galleryImages
      : Array.isArray(sampleData?.galleryImages) && sampleData.galleryImages.length > 0
      ? sampleData.galleryImages
      : Array.isArray(sampleData?.photos) && sampleData.photos.length > 0
      ? sampleData.photos
      : DEFAULT_SAMPLE_GALLERY;

  const pPria = sampleData.panggilanPria || 'Jonathan';
  const pWanita = sampleData.panggilanWanita || 'Anti';
  const iPria = sampleData.inisialPria || sampleData.inisial_pria || sampleData.groom_initial || (pPria ? pPria.trim().charAt(0).toUpperCase() : 'J');
  const iWanita = sampleData.inisialWanita || sampleData.inisial_wanita || sampleData.bride_initial || (pWanita ? pWanita.trim().charAt(0).toUpperCase() : 'A');
  const iPasangan = sampleData.inisialPasangan || sampleData.inisial_pasangan || sampleData.couple_initials || `${iPria} & ${iWanita}`;

  const eventDetails: Record<string, any> = {
    ...sampleData,
    mempelaiPria: sampleData.mempelaiPria || 'Jonathan Wijaya, S.Kom.',
    panggilanPria: pPria,
    inisialPria: iPria,
    inisial_pria: iPria,
    groom_initial: iPria,
    ortuPria: sampleData.ortuPria || 'Putra tercinta dari Bp. Hendra & Ibu Maria',
    mempelaiWanita: sampleData.mempelaiWanita || 'Anti Rahmawati, S.T.',
    panggilanWanita: pWanita,
    inisialWanita: iWanita,
    inisial_wanita: iWanita,
    bride_initial: iWanita,
    inisialPasangan: iPasangan,
    inisial_pasangan: iPasangan,
    couple_initials: iPasangan,
    ortuWanita: sampleData.ortuWanita || 'Putri tercinta dari Bp. Bambang & Ibu Sri',
    event_date: sampleData.event_date || sampleData.tanggal_acara || '21 September 2026',
    event_time: sampleData.event_time || sampleData.waktu_acara || '08:00 - 14:00 WIB',
    event_location: sampleData.event_location || sampleData.lokasi_acara || 'Grand Ballroom Hotel Mulia, Jakarta',
    story: Array.isArray(sampleData.story) && sampleData.story.length > 0 ? sampleData.story : DEFAULT_SAMPLE_STORIES,
    schedules: Array.isArray(sampleData.schedules) && sampleData.schedules.length > 0 ? sampleData.schedules : DEFAULT_SAMPLE_SCHEDULES,
    bankAccounts: Array.isArray(sampleData.bankAccounts) && sampleData.bankAccounts.length > 0 ? sampleData.bankAccounts : DEFAULT_SAMPLE_BANKS,
    showStory: sampleData.showStory !== false,
    showGallery: sampleData.showGallery !== false,
    isCatalogPreview: true,
    isCoverOpened: isCoverOpened,
    gallery: activeGallery,
    galleryImages: activeGallery,
    photos: activeGallery,
    images: activeGallery,
    musicUrl: (sampleData as any)?.musicUrl || (globalStyles as any)?.musicUrl || '',
  };

  const hasMusicNode = useMemo(() => {
    const checkNodes = (list: StudioNode[]): boolean => {
      for (const n of list) {
        if (n.type === 'music') return true;
        if (n.children && checkNodes(n.children)) return true;
      }
      return false;
    };
    return checkNodes(nodes);
  }, [nodes]);

  const hasMultipleContainers = nodes.length > 1;
  const isFirstNodeCover = hasMultipleContainers && (nodes[0].sectionType === 'cover' || nodes[0].id?.toLowerCase().includes('cover'));
  const coverNode = isFirstNodeCover ? nodes[0] : null;
  const bodyNodes = hasMultipleContainers ? nodes.slice(1) : nodes;

  // Lock body scroll while cover is closed
  useEffect(() => {
    if (!coverNode || isCoverOpened) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [coverNode, isCoverOpened]);

  const handleOpenCover = () => {
    setIsCoverOpened(true);
    setIsPlayingMusic(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as any });
      const scrollEls = document.querySelectorAll<HTMLElement>('[style*="overflow"], [class*="overflow"]');
      scrollEls.forEach((el) => {
        if (el.scrollHeight > el.clientHeight + 20) {
          el.scrollTo({ top: 0, behavior: 'instant' as any });
          el.dispatchEvent(new Event('scroll'));
        }
      });
      window.dispatchEvent(new Event('scroll'));
    }, 50);
  };

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

  if (notFound || !template) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff2ef', padding: '1.5rem', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎨</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#111' }}>Template Tidak Ditemukan</h3>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Template dengan nama tersebut tidak ditemukan atau belum aktif.
          </p>
          <button
            type="button"
            onClick={() => router.push('/#templates')}
            style={{ display: 'inline-block', backgroundColor: 'var(--primary, #db2777)', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            ← Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

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

      {/* Floating Background Music Player */}
      {eventDetails.musicUrl && !hasMusicNode && (
        <MusicPlayer
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
          musicUrl={eventDetails.musicUrl}
        />
      )}
    </div>
  );
}
