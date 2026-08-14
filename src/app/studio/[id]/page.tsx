'use client';

import { useState, useEffect, use } from 'react';
import { useStudio } from '@/hooks/useStudio';
import { TopBar } from '@/components/studio/TopBar';
import { SidebarLeft } from '@/components/studio/SidebarLeft';
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
    setNodes,
    setGlobalStyles,
    selectNode,
    setViewportMode,
    setSidebarTab,
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
        margin: '0px 0px 24px 0px',
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

  const handlePreview = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio_preview_nodes', JSON.stringify(nodes));
      localStorage.setItem('studio_preview_global_styles', JSON.stringify(globalStyles));
    }
    window.open(`/studio/${id}/preview`, '_blank');
  };

  return (
    <div className="studio-container">
      {/* Top Bar Navigation */}
      <TopBar
        title={template?.name || 'Studio Builder'}
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
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

        {/* Canvas Stage */}
        <CanvasStage viewportMode={viewportMode}>
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
            />
          ))}
        </CanvasStage>
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
