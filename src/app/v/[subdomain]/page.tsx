'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { NodeRenderer, getOrderedAndFilteredNodes } from '@/components/studio/NodeRenderer';
import { DEFAULT_NODES, loadNodeFonts, ensureGoogleFontLoaded, getGlobalCssVariables } from '@/store/studio-store';
import { StudioNode, SECTION_DEFINITIONS, SectionType } from '@/types';
import { MusicPlayer } from '@/components/invitation/MusicPlayer';

export default function PublicInvitationPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ subdomain: string }>) : (params as unknown as { subdomain: string });
  const subdomain = resolvedParams?.subdomain;
  const searchParams = useSearchParams();
  const guestName = searchParams.get('to') || searchParams.get('guest') || searchParams.get('nama') || '';

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);

  const loadWishes = async (eventId: string) => {
    try {
      const res = await fetch(`/api/guests?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
    }
  };

  useEffect(() => {
    if (event?.id) {
      (window as any).refreshWishes = () => loadWishes(event.id);
      loadWishes(event.id);
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refreshWishes;
      }
    };
  }, [event?.id]);

  useEffect(() => {
    async function loadEvent() {
      if (!subdomain) return;
      try {
        const res = await fetch(`/api/events?subdomain=${subdomain}`);
        if (res.ok) {
          const found = await res.json();
          if (found) {
            setEvent(found);
            const g = found.details?.globalStyles;
            if (g?.fontFamily) {
              ensureGoogleFontLoaded(g.fontFamily);
            }
            if (g?.typography?.fontPrimary) {
              ensureGoogleFontLoaded(g.typography.fontPrimary);
            }
            if (g?.typography?.fontSecondary) {
              ensureGoogleFontLoaded(g.typography.fontSecondary);
            }
            if (Array.isArray(found.details?.studioNodes) && found.details.studioNodes.length > 0) {
              loadNodeFonts(found.details.studioNodes);
            }

            // Increment view count asynchronously
            fetch(`/api/events/${found.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ views: (found.views || 0) + 1 }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [subdomain]);

  const handleOpenCover = () => {
    setIsCoverOpened(true);
    setIsPlayingMusic(true);
  };

  const details = event?.details || {};
  const currentSectionOrder: SectionType[] = details.sectionOrder || SECTION_DEFINITIONS.map((s) => s.id);
  const hiddenSectionsMap: Record<string, boolean> = details.hiddenSections || {};

  const livePria = details.panggilanPria || 'Roni';
  const liveWanita = details.panggilanWanita || 'Anti';
  const liveIPria = details.inisialPria || details.inisial_pria || (livePria ? livePria.trim().charAt(0).toUpperCase() : 'R');
  const liveIWanita = details.inisialWanita || details.inisial_wanita || (liveWanita ? liveWanita.trim().charAt(0).toUpperCase() : 'A');
  const liveIPasangan = details.inisialPasangan || details.inisial_pasangan || `${liveIPria} & ${liveIWanita}`;

  const liveEventDetails = {
    eventId: event?.id,
    title: event?.title,
    subdomain: event?.subdomain,
    type: event?.type,
    guestName: guestName,
    guest_name: guestName,
    mempelaiPria: details.mempelaiPria || 'Roni Wijaya, S.Kom.',
    panggilanPria: livePria,
    inisialPria: liveIPria,
    inisial_pria: liveIPria,
    groom_initial: liveIPria,
    ortuPria: details.ortuPria,
    igPria: details.igPria,
    fotoPria: details.fotoPria,
    mempelaiWanita: details.mempelaiWanita || 'Anti Kartika, S.T.',
    panggilanWanita: liveWanita,
    inisialWanita: liveIWanita,
    inisial_wanita: liveIWanita,
    bride_initial: liveIWanita,
    inisialPasangan: liveIPasangan,
    inisial_pasangan: liveIPasangan,
    couple_initials: liveIPasangan,
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
    galleryImages: details.gallery || [],
    photos: details.gallery || [],
    images: details.gallery || [],
    bankAccounts: [
      details.bank1Nama && { bankName: details.bank1Nama, accountNumber: details.bank1Rek, accountHolder: details.bank1An },
      details.bank2Nama && { bankName: details.bank2Nama, accountNumber: details.bank2Rek, accountHolder: details.bank2An },
    ].filter(Boolean),
    ticketUrl: details.ticketUrl,
    liveStreamUrl: details.liveStreamUrl,
    coverTitle: details.coverTitle,
    coverCoupleName: details.coverCoupleName,
    cover_photo: details.cover_photo,
    showStory: details.showStory !== false,
    showGallery: details.showGallery !== false,
    showDresscode: details.showDresscode === true,
    isPublicInvitation: true,
    sectionOrder: currentSectionOrder,
    hiddenSections: hiddenSectionsMap,
    wishesList: wishes,
    isCoverOpened: isCoverOpened,
  };

  const previewNodes = (details.studioNodes && Array.isArray(details.studioNodes) && details.studioNodes.length > 0)
    ? (details.studioNodes as unknown as StudioNode[])
    : (DEFAULT_NODES as unknown as StudioNode[]);

  const previewGlobalStyles = details.globalStyles || {
    bgColor: '#eff2ef',
    fontFamily: 'Playfair Display',
  };

  const sortedNodes = getOrderedAndFilteredNodes(previewNodes, liveEventDetails);
  const hasMultipleContainers = sortedNodes.length > 1;
  const coverNode = hasMultipleContainers && sortedNodes[0].sectionType === 'cover' ? sortedNodes[0] : null;
  const bodyNodes = coverNode ? sortedNodes.slice(1) : sortedNodes;

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

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', color: '#f8fafc', fontFamily: 'serif' }}>
        Memuat Undangan Digital...
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', color: '#94a3b8' }}>
        Undangan tidak ditemukan.
      </div>
    );
  }

  const cssVars = getGlobalCssVariables(previewGlobalStyles);

  const globalBgUrl = (() => {
    let bgUrl = previewGlobalStyles.backgroundImage || '';
    if (previewGlobalStyles.isBgDynamic && previewGlobalStyles.backgroundImageBinding) {
      const boundVal = (liveEventDetails as any)[previewGlobalStyles.backgroundImageBinding];
      if (boundVal && boundVal.trim() !== '') {
        bgUrl = boundVal;
      }
    }
    return bgUrl;
  })();

  return (
    <div
      style={{
        ...cssVars,
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: previewGlobalStyles.bgColor || previewGlobalStyles.colors?.background || '#eff2ef',
        backgroundImage: globalBgUrl ? `url(${globalBgUrl})` : undefined,
        backgroundSize: previewGlobalStyles.backgroundSize || 'cover',
        backgroundPosition: previewGlobalStyles.backgroundPosition || 'center',
        backgroundRepeat: previewGlobalStyles.backgroundRepeat || 'no-repeat',
        fontFamily: previewGlobalStyles.fontFamily || previewGlobalStyles.typography?.fontPrimary || 'inherit',
        overflowX: 'hidden',
      }}
    >
      {/* Background Music Controller */}
      {isCoverOpened && details.musicUrl && (
        <MusicPlayer
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
          musicUrl={details.musicUrl}
        />
      )}

      {/* Interactive Full-Screen Cover Overlay (Slide Up Animation) */}
      {coverNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
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
                minHeight: '100vh',
                height: '100vh',
                width: '100%',
              },
            }}
            allNodes={sortedNodes}
            selectedNodeId={null}
            onSelectNode={() => {}}
            eventDetails={liveEventDetails}
            viewportMode="auto"
            isPreviewMode={true}
            onOpenCover={handleOpenCover}
          />
        </div>
      )}

      {/* Fluid Responsive Main Invitation Body (Fluid Full Width on Mobile, Tablet, & Desktop) */}
      <main
        style={{
          width: '100%',
          minHeight: '100vh',
          opacity: isCoverOpened || !coverNode ? 1 : 0.2,
          transition: 'opacity 0.85s ease',
        }}
      >
        {bodyNodes.map((node) => (
          <NodeRenderer
            key={node.id}
            node={node}
            allNodes={sortedNodes}
            selectedNodeId={null}
            onSelectNode={() => {}}
            eventDetails={liveEventDetails}
            viewportMode="auto"
            isPreviewMode={true}
            onOpenCover={handleOpenCover}
          />
        ))}
      </main>
    </div>
  );
}
