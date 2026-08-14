'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { NodeRenderer } from '@/components/studio/NodeRenderer';
import { DEFAULT_NODES, GlobalStyles, loadNodeFonts, ensureGoogleFontLoaded } from '@/store/studio-store';
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
              if (parsedGlobal.fontFamily) ensureGoogleFontLoaded(parsedGlobal.fontFamily);
            } catch (e) {}
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
        }

        // 2. Fetch specific template / event from API endpoint /api/studio/${id}
        const res = await fetch(`/api/studio/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setTemplateName(data.name);

          const rawGStyles = data.globalStyles || data.details?.globalStyles;
          if (rawGStyles) {
            const parsedG = typeof rawGStyles === 'string' ? JSON.parse(rawGStyles) : rawGStyles;
            setGlobalStyles(parsedG);
            if (parsedG.fontFamily) ensureGoogleFontLoaded(parsedG.fontFamily);
          }

          const rawNodes = data.nodes || data.details?.studioNodes;
          if (rawNodes) {
            const parsedNodes = typeof rawNodes === 'string' ? JSON.parse(rawNodes) : rawNodes;
            if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
              setNodes(parsedNodes);
              loadNodeFonts(parsedNodes);
              setLoading(false);
              return;
            }
          }
        }

        // 3. Fallback check for default preview template IDs
        if (id === 'default' || id === 'tmpl-sage' || id === 'tmpl-neon' || id === 'tmpl-warm' || id === 'tmpl-corp') {
          const defaultList = DEFAULT_NODES as unknown as StudioNode[];
          setNodes(defaultList);
          loadNodeFonts(defaultList);
          setLoading(false);
          return;
        }

        // 4. If template has no nodes in DB & not default ID -> Theme is not ready!
        setNotReady(true);
      } catch (err) {
        console.error('Failed to load studio preview:', err);
        setNotReady(true);
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
        <p style={{ fontWeight: 600 }}>Memuat Pratinjau Undangan...</p>
      </div>
    );
  }

  // Alert State: Theme is Not Ready
  if (notReady) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '20px',
            padding: '36px 28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            border: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '3rem' }}>🎨</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ⚠️ Informasi Pratinjau Desain
          </span>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Tema Belum Siap
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
            Desain template {templateName ? <strong>"{templateName}"</strong> : 'ini'} sedang dalam proses penyusunan oleh desainer kami dan belum memiliki node desain yang aktif.
          </p>
          <Link
            href="/#templates"
            style={{
              marginTop: '10px',
              backgroundColor: '#e36397',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '30px',
              fontWeight: 800,
              fontSize: '0.88rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(227,99,151,0.4)',
            }}
          >
            ← Kembali ke Katalog Template
          </Link>
        </div>
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
