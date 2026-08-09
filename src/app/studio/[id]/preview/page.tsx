'use client';

import { use, useState, useEffect } from 'react';
import { NodeRenderer } from '@/components/studio/NodeRenderer';
import { DEFAULT_NODES, GlobalStyles, loadNodeFonts, ensureGoogleFontLoaded } from '@/store/studio-store';
import { StudioNode } from '@/types';

export default function StudioPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [nodes, setNodes] = useState<StudioNode[]>([]);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>({
    bgColor: '#eff2ef',
    padding: '24px',
    margin: '0px',
    fontFamily: 'Playfair Display',
  });
  const [loading, setLoading] = useState(true);
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const eventDetails = {
    mempelaiPria: 'Roni Wijaya, S.Kom.',
    panggilanPria: 'Roni',
    mempelaiWanita: 'Anti Kartika, S.T.',
    panggilanWanita: 'Anti',
    event_date: '21 September 2026',
    event_time: '08:00 - 14:00 WIB',
    event_location: 'Grand Ballroom Hotel Mulia, Jakarta',
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

  // 2. Load Studio Template Nodes & Global Styles
  useEffect(() => {
    async function loadTemplate() {
      try {
        // 1. Try reading live draft nodes & global styles from localStorage
        const savedPreviewNodes = localStorage.getItem('studio_preview_nodes');
        const savedGlobalStyles = localStorage.getItem('studio_preview_global_styles');

        if (savedGlobalStyles) {
          try {
            const parsedGlobal = JSON.parse(savedGlobalStyles);
            setGlobalStyles(parsedGlobal);
            if (parsedGlobal.fontFamily) ensureGoogleFontLoaded(parsedGlobal.fontFamily);
          } catch (e) {
            console.error('Failed to parse global styles:', e);
          }
        }

        if (savedPreviewNodes) {
          const parsed = JSON.parse(savedPreviewNodes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNodes(parsed);
            loadNodeFonts(parsed);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to API endpoint
        const res = await fetch(`/api/studio/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.globalStyles) {
            const gStyles = typeof data.globalStyles === 'string' ? JSON.parse(data.globalStyles) : data.globalStyles;
            setGlobalStyles(gStyles);
            if (gStyles.fontFamily) ensureGoogleFontLoaded(gStyles.fontFamily);
          }

          if (data.nodes) {
            const parsedNodes = typeof data.nodes === 'string' ? JSON.parse(data.nodes) : data.nodes;
            if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
              setNodes(parsedNodes);
              loadNodeFonts(parsedNodes);
              setLoading(false);
              return;
            }
          }
        }

        // 3. Fallback to default prefabs nodes
        const defaultList = DEFAULT_NODES as unknown as StudioNode[];
        setNodes(defaultList);
        loadNodeFonts(defaultList);
      } catch (err) {
        console.error('Failed to load studio preview:', err);
        const defaultList = DEFAULT_NODES as unknown as StudioNode[];
        setNodes(defaultList);
        loadNodeFonts(defaultList);
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [id]);

  const handleOpenCover = () => {
    setIsCoverOpened(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#64748b' }}>
        <p style={{ fontWeight: 600 }}>Memuat Undangan...</p>
      </div>
    );
  }

  const hasMultipleContainers = nodes.length > 1;
  const coverNode = hasMultipleContainers ? nodes[0] : null;
  const bodyNodes = hasMultipleContainers ? nodes.slice(1) : nodes;

  const previewWrapperStyle: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    margin: globalStyles.margin || '0px',
    padding: globalStyles.padding || '0px',
    backgroundColor: globalStyles.bgColor || '#eff2ef',
    backgroundImage: globalStyles.backgroundImage ? `url(${globalStyles.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: globalStyles.fontFamily || 'inherit',
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
