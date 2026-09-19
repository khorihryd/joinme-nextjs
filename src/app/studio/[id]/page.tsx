'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useStudio } from '@/hooks/useStudio';
import { TopBar } from '@/components/studio/TopBar';
import { SidebarLeft } from '@/components/studio/SidebarLeft';
import { StudioToolbar } from '@/components/studio/StudioToolbar';
import { CanvasStage } from '@/components/studio/CanvasStage';
import { NodeRenderer } from '@/components/studio/NodeRenderer';
import { SaveAsNewModal } from '@/components/studio/SaveAsNewModal';
import { useToast } from '@/components/ui/Toast';
import { createDefaultWidget } from '@/store/studio-store';
import { StudioNode } from '@/types';

export default function StudioPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = resolvedParams?.id;
  const { showToast } = useToast();
  const {
    nodes,
    globalStyles,
    selectedNodeId,
    selectedNode,
    viewportMode,
    sidebarTab,
    showSidebar,
    setNodes,
    setGlobalStyles,
    updateGlobalStyles,
    selectNode,
    setViewportMode,
    setSidebarTab,
    setShowSidebar,
    toggleSidebar,
    updateNode,
    deleteNode,
    duplicateNode,
    moveNode,
    resetNodes,
    findParentNode,
  } = useStudio();

  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [isSaveAsNewOpen, setIsSaveAsNewOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);

  useEffect(() => {
    async function loadStudio() {
      try {
        const res = await fetch(`/api/studio/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTemplate(data);
          if (data.nodes) setNodes(Array.isArray(data.nodes) ? data.nodes : JSON.parse(data.nodes));

          const gStyles = data.globalStyles || data.details?.globalStyles;
          if (gStyles) {
            const parsed = typeof gStyles === 'string' ? JSON.parse(gStyles) : gStyles;
            setGlobalStyles(parsed);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStudio();
  }, [id, setNodes, setGlobalStyles]);

  // Keyboard shortcut Ctrl+\ / Cmd+\ / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '\\' || e.key === 'b' || e.key === 'B')) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, globalStyles }),
      });

      if (res.ok) {
        showToast('Template Studio berhasil disimpan! 💾', 'success');
      } else {
        showToast('Gagal menyimpan template', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteSaveAsNew = async (data: { name: string; category: string; tier: string; status: string; thumbnail: string }) => {
    setSaving(true);
    setIsSaveAsNewOpen(false);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          tier: data.tier,
          status: data.status,
          thumbnail: data.thumbnail,
          nodes,
        }),
      });

      if (res.ok) {
        showToast(`Template "${data.name}" berhasil dibuat! 🎉`, 'success');
      } else {
        showToast('Gagal menyimpan sebagai template baru', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRootContainer = () => {
    const newId = `container-${Date.now()}`;
    const newContainer: StudioNode = {
      id: newId,
      type: 'container',
      style: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: '16px',
        padding: '24px',
        backgroundColor: '#ffffff',
        width: '100%',
        margin: '0px',
      },
      children: [],
    };
    setNodes([...nodes, newContainer]);
    selectNode(newId);
    setSidebarTab('properties');
    showToast('Flex Container ditambahkan', 'success');
  };

  const handleAddWidget = (type: StudioNode['type']) => {
    if (!selectedNodeId || selectedNodeId === 'canvas') {
      if (type === 'container') {
        handleAddRootContainer();
        return;
      }
      showToast('Pilih Container di canvas/navigator terlebih dahulu!', 'warning');
      return;
    }

    const currentSelected = selectedNode;
    if (!currentSelected) {
      if (type === 'container') {
        handleAddRootContainer();
        return;
      }
      showToast('Pilih Container di canvas/navigator terlebih dahulu!', 'warning');
      return;
    }

    const targetContainer = currentSelected.type === 'container' ? currentSelected : findParentNode(selectedNodeId);
    if (!targetContainer) {
      if (type === 'container') {
        handleAddRootContainer();
        return;
      }
      showToast('Elemen harus berada di dalam container!', 'warning');
      return;
    }

    const newWidget = createDefaultWidget(type) as unknown as StudioNode;
    const updatedChildren = [...(targetContainer.children || []), newWidget];
    const updatedContainer = { ...targetContainer, children: updatedChildren };
    updateNode(updatedContainer);
    selectNode(newWidget.id);
    setSidebarTab('properties');
    showToast(type === 'container' ? 'Inner Container ditambahkan' : `Widget ${type} ditambahkan`, 'success');
  };

  const canvasEventDetails = useMemo(() => {
    const sample = globalStyles?.sampleEventDetails || {};
    const activeGal = (Array.isArray(globalStyles?.galleryImages) && globalStyles.galleryImages.length > 0)
      ? globalStyles.galleryImages
      : (Array.isArray(sample.galleryImages) && sample.galleryImages.length > 0)
      ? sample.galleryImages
      : (Array.isArray(sample.gallery) && sample.gallery.length > 0)
      ? sample.gallery
      : undefined;

    return {
      ...sample,
      ...(activeGal ? { gallery: activeGal, galleryImages: activeGal, photos: activeGal, images: activeGal } : {}),
    };
  }, [globalStyles]);

  const handlePreview = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`studio_preview_nodes_${id}`, JSON.stringify(nodes));
      localStorage.setItem(`studio_preview_global_styles_${id}`, JSON.stringify(globalStyles));
      localStorage.setItem('studio_preview_nodes', JSON.stringify(nodes));
      localStorage.setItem('studio_preview_global_styles', JSON.stringify(globalStyles));
    }
    window.open(`/studio/${id}/preview?fromEditor=true`, '_blank');
  };

  return (
    <div className="studio-container">
      {/* Top Bar Navigation */}
      <TopBar
        title={template?.name || 'Studio Builder'}
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
        showRulers={showRulers}
        setShowRulers={setShowRulers}
        showSidebar={showSidebar}
        onToggleSidebar={toggleSidebar}
        onSave={handleSave}
        onSaveAsNew={() => setIsSaveAsNewOpen(true)}
        onReset={() => {
          if (confirm('Apakah Anda yakin ingin mereset layout canvas ke tampilan default awal?')) {
            resetNodes();
            showToast('Layout canvas direset ke awal 🔄', 'info');
          }
        }}
        onPreview={handlePreview}
        saving={saving}
      />

      {/* Main Workspace */}
      <div className="studio-workspace">
        {/* Left Sidebar */}
        <SidebarLeft
          sidebarTab={sidebarTab}
          setSidebarTab={setSidebarTab}
          showSidebar={showSidebar}
          onToggleSidebar={toggleSidebar}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          selectedNode={selectedNode}
          onSelectNode={selectNode}
          onAddWidget={handleAddWidget}
          onAddRootContainer={handleAddRootContainer}
          onDeleteNode={deleteNode}
          onDuplicateNode={duplicateNode}
          onMoveNode={moveNode}
          onUpdateNode={updateNode}
        />

        {/* Central Workspace: Toolbar + Canvas Stage */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Quick Properties Studio Toolbar */}
          <StudioToolbar
            selectedNode={selectedNode}
            selectedNodeId={selectedNodeId}
            onUpdateNode={updateNode}
            onDeleteNode={deleteNode}
            onDuplicateNode={duplicateNode}
            onSelectNode={(id) => {
              selectNode(id);
            }}
            globalStyles={globalStyles}
            onUpdateGlobalStyles={updateGlobalStyles}
            onOpenProperties={() => {
              setSidebarTab('properties');
              setShowSidebar(true);
            }}
            onOpenGlobal={() => {
              setSidebarTab('global');
              setShowSidebar(true);
            }}
            viewportMode={viewportMode}
            nodes={nodes}
          />

          {/* Canvas Stage */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: 'calc(100% - 46px)', zIndex: 1 }}>
            {/* Floating Expand Sidebar Button when collapsed */}
            {!showSidebar && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="btn-floating-show-sidebar"
                title="Tampilkan Sidebar (Ctrl+\\)"
                aria-label="Tampilkan Sidebar"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.75rem',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-primary, #1e293b)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <polyline points="5 10 7 12 5 14" />
                </svg>
                <span>Buka Sidebar</span>
              </button>
            )}

            <CanvasStage viewportMode={viewportMode} showRulers={showRulers}>
              {nodes.map((node) => (
                <NodeRenderer
                  key={node.id}
                  node={node}
                  allNodes={nodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(nodeId) => {
                    selectNode(nodeId);
                    setSidebarTab('properties');
                  }}
                  onDeleteNode={deleteNode}
                  onDuplicateNode={duplicateNode}
                  viewportMode={viewportMode}
                  eventDetails={canvasEventDetails}
                />
              ))}
            </CanvasStage>
          </div>
        </div>
      </div>

      {/* Save As New Template Modal */}
      <SaveAsNewModal
        isOpen={isSaveAsNewOpen}
        onClose={() => setIsSaveAsNewOpen(false)}
        onSave={handleExecuteSaveAsNew}
        initialName={template?.name}
        initialCategory={template?.category}
        initialThumbnail={template?.thumbnail}
      />
    </div>
  );
}
