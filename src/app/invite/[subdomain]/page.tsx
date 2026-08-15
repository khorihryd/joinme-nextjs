'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { NodeRenderer, getOrderedAndFilteredNodes } from '@/components/studio/NodeRenderer';
import { DEFAULT_NODES, loadNodeFonts, ensureGoogleFontLoaded } from '@/store/studio-store';
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

  useEffect(() => {
    async function loadEvent() {
      if (!subdomain) return;
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const events = await res.json();
          const found = events.find((e: any) => e.subdomain === subdomain);
          if (found) {
            setEvent(found);
            if (found.details?.globalStyles?.fontFamily) {
              ensureGoogleFontLoaded(found.details.globalStyles.fontFamily);
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

  const details = event.details || {};
  const currentSectionOrder: SectionType[] = details.sectionOrder || SECTION_DEFINITIONS.map((s) => s.id);
  const hiddenSectionsMap: Record<string, boolean> = details.hiddenSections || {};

  const liveEventDetails = {
    title: event.title,
    subdomain: event.subdomain,
    type: event.type,
    guestName: guestName,
    guest_name: guestName,
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

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: previewGlobalStyles.bgColor || '#eff2ef', overflowX: 'hidden' }}>
      {/* Background Music Controller */}
      {isCoverOpened && details.musicUrl && (
        <MusicPlayer
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
          musicUrl={details.musicUrl}
        />
      )}

      {/* Main Responsive Canvas Container */}
      <div style={{ maxWidth: '440px', margin: '0 auto', minHeight: '100vh', position: 'relative', boxShadow: '0 0 40px rgba(0,0,0,0.1)', backgroundColor: previewGlobalStyles.bgColor || '#ffffff' }}>
        {/* Interactive Cover Node Overlay (Slide Up Animation) */}
        {coverNode && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              maxWidth: '440px',
              margin: '0 auto',
              width: '100%',
              height: '100vh',
              zIndex: 9999,
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
              allNodes={sortedNodes}
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
              viewportMode="mobile"
              isPreviewMode={true}
              onOpenCover={handleOpenCover}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
