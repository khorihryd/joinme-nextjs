'use client';

import React, { useState } from 'react';
import { StudioNode } from '@/types';
import { useStudioStore } from '@/store/studio-store';

interface NavigatorTreeProps {
  nodes: StudioNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  onUpdateNode?: (updatedNode: StudioNode) => void;
  onNestNode?: (nodeId: string, targetContainerId: string | null) => void;
}

// Helper: Check if targetId is node itself or one of node's descendants (Prevent Circular Nesting)
function isDescendantOrSelf(node: StudioNode, targetId: string): boolean {
  if (node.id === targetId) return true;
  if (Array.isArray(node.children)) {
    return node.children.some((child) => isDescendantOrSelf(child, targetId));
  }
  return false;
}

// Helper: Collect all valid target containers across the tree
function collectValidTargetContainers(
  allNodes: StudioNode[],
  sourceNode: StudioNode,
  depth: number = 0
): { id: string; label: string }[] {
  let list: { id: string; label: string }[] = [];

  allNodes.forEach((item) => {
    // Only allow containers or widget sections that are NOT sourceNode or its descendants
    if (!isDescendantOrSelf(sourceNode, item.id)) {
      if (item.type === 'container' || item.widgetType) {
        const indent = '— '.repeat(depth);
        const name = item.label || item.content?.substring(0, 18) || `Container (${item.id})`;
        list.push({ id: item.id, label: `${indent}📦 ${name}` });
      }
      if (Array.isArray(item.children)) {
        list = list.concat(collectValidTargetContainers(item.children, sourceNode, depth + 1));
      }
    }
  });

  return list;
}

export function NavigatorTree({
  nodes,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onUpdateNode,
  onNestNode,
}: NavigatorTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Drag & Drop State
  const [draggedNode, setDraggedNode] = useState<StudioNode | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Quick Nest Modal Target Node
  const [nestingSourceNode, setNestingSourceNode] = useState<StudioNode | null>(null);

  // Toast Notification Message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const collectAllContainerIds = (items: StudioNode[]): string[] => {
    let ids: string[] = [];
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        ids.push(item.id);
        ids = ids.concat(collectAllContainerIds(item.children));
      }
    });
    return ids;
  };

  const handleExpandAll = () => {
    setCollapsed({});
  };

  const handleCollapseAll = () => {
    const allIds = collectAllContainerIds(nodes);
    const newCollapsed: Record<string, boolean> = {};
    allIds.forEach((id) => {
      newCollapsed[id] = true;
    });
    setCollapsed(newCollapsed);
  };

  const startEditing = (node: StudioNode) => {
    const currentName =
      node.label ||
      (node.content ? node.content.substring(0, 18) : node.type === 'container' ? `Container (${node.id})` : node.type);
    setEditingNodeId(node.id);
    setEditingLabel(currentName);
  };

  const handleSaveRename = (node: StudioNode) => {
    if (editingNodeId !== node.id) return;
    if (onUpdateNode) {
      const trimmed = editingLabel.trim();
      onUpdateNode({
        ...node,
        label: trimmed !== '' ? trimmed : undefined,
      });
    }
    setEditingNodeId(null);
  };

  const handleExecuteNest = (sourceId: string, targetContainerId: string | null) => {
    if (onNestNode) {
      onNestNode(sourceId, targetContainerId);
    } else {
      useStudioStore.getState().nestNodeIntoContainer(sourceId, targetContainerId);
    }

    if (targetContainerId === null) {
      showToast('📤 Elemen berhasil dipindahkan ke Root Canvas (Halaman Terluar)!');
    } else {
      showToast('📥 Elemen berhasil dimasukkan ke dalam container!');
    }
    setNestingSourceNode(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, node: StudioNode) => {
    e.stopPropagation();
    setDraggedNode(node);
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleDragOver = (e: React.DragEvent, targetNode: StudioNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedNode) return;

    // Validate container target & circular nesting prevention
    const isTargetContainer = targetNode.type === 'container' || !!targetNode.widgetType;
    if (!isTargetContainer) return;

    if (isDescendantOrSelf(draggedNode, targetNode.id)) return;

    setDragOverId(targetNode.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: StudioNode) => {
    e.preventDefault();
    e.stopPropagation();

    setDragOverId(null);

    if (!draggedNode) return;

    const isTargetContainer = targetNode.type === 'container' || !!targetNode.widgetType;
    if (!isTargetContainer) return;

    if (isDescendantOrSelf(draggedNode, targetNode.id)) {
      showToast('⚠️ Kontainer tidak dapat dimasukkan ke dalam dirinya sendiri!');
      setDraggedNode(null);
      return;
    }

    handleExecuteNest(draggedNode.id, targetNode.id);
    setDraggedNode(null);
  };

  const isCanvasSelected = selectedNodeId === 'canvas';

  const getNodeIcon = (node: StudioNode) => {
    switch (node.type) {
      case 'container':
        return '📦';
      case 'heading':
        return '📛';
      case 'text':
        return '📝';
      case 'button':
        return '🔘';
      case 'image':
        return '🖼️';
      case 'countdown':
        return '⏳';
      case 'map':
        return '🗺️';
      case 'divider':
        return '➖';
      case 'spacer':
        return '↕️';
      case 'lovestory':
        return '💖';
      case 'gallery':
        return '📸';
      case 'rsvp':
        return '💌';
      case 'wishes':
        return '💬';
      case 'groom-bride':
        return '💍';
      case 'gift-widget':
        return '🎁';
      case 'opening-prayer':
        return '📜';
      case 'thank-you':
        return '🙏';
      default:
        return '📄';
    }
  };

  const renderNode = (node: StudioNode, index: number = 0, parentList: StudioNode[] = nodes, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id;
    const isHovered = hoveredNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsed[node.id];
    const isDragOver = dragOverId === node.id;

    const isFirst = index === 0;
    const isLast = index === parentList.length - 1;
    const isContainer = node.type === 'container' || !!node.widgetType;

    return (
      <div key={node.id} className="nav-tree-node" style={{ marginBottom: '2px' }}>
        {/* Node Item Row */}
        <div
          draggable={true}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => isContainer && handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => isContainer && handleDrop(e, node)}
          className={`nav-tree-label ${isSelected ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectNode(node.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing(node);
          }}
          onMouseEnter={() => setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.5rem',
            borderRadius: '6px',
            cursor: 'grab',
            background: isDragOver
              ? '#e0f2fe'
              : isSelected
              ? 'var(--primary-light, rgba(227, 99, 151, 0.15))'
              : isHovered
              ? 'var(--bg-card, rgba(0,0,0,0.03))'
              : 'transparent',
            border: isDragOver
              ? '2px dashed #0284c7'
              : isSelected
              ? '1px solid var(--primary)'
              : '1px solid transparent',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            minWidth: '240px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
            {/* Expand / Collapse Chevron */}
            {hasChildren ? (
              <span
                onClick={(e) => toggleCollapse(e, node.id)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.62rem',
                  userSelect: 'none',
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px',
                  background: 'var(--bg-body)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {isCollapsed ? '▶' : '▼'}
              </span>
            ) : (
              <span style={{ width: '14px' }} />
            )}

            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{getNodeIcon(node)}</span>

            {/* Label or Inline Edit Input */}
            {editingNodeId === node.id ? (
              <input
                type="text"
                autoFocus
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onBlur={() => handleSaveRename(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(node);
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid var(--primary)',
                  outline: 'none',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  width: '100%',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: node.type === 'container' ? 700 : 400,
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title="Double click untuk ubah nama elemen | Drag untuk memindahkan ke container lain"
              >
                {node.label || (node.content ? node.content.substring(0, 22) : node.type === 'container' ? `Container (${node.id})` : node.type)}
              </span>
            )}

            {isDragOver && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}
              >
                📥 Lepas di Sini
              </span>
            )}
          </div>

          {/* Action Controls (Visible on Hover or Selected) */}
          <div
            className="nav-tree-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.15rem',
              flexShrink: 0,
              opacity: isHovered || isSelected ? 1 : 0.2,
              transition: 'opacity 0.15s ease',
              marginLeft: '0.4rem',
            }}
          >
            {/* Quick Move/Nest Button */}
            <button
              type="button"
              className="btn-nav-nest"
              title="Masukkan / Pindahkan Ke Container Lain..."
              onClick={(e) => {
                e.stopPropagation();
                setNestingSourceNode(node);
              }}
              style={{
                background: '#fff0f5',
                border: '1px solid #fbcfe8',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                padding: '1px 4px',
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              📥
            </button>

            {onMoveNode && !isFirst && (
              <button
                type="button"
                className="btn-nav-move-up"
                title="Pindahkan Ke Atas"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveNode(node.id, 'up');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.68rem', padding: '1px 3px' }}
              >
                ▲
              </button>
            )}

            {onMoveNode && !isLast && (
              <button
                type="button"
                className="btn-nav-move-down"
                title="Pindahkan Ke Bawah"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveNode(node.id, 'down');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.68rem', padding: '1px 3px' }}
              >
                ▼
              </button>
            )}

            <button
              type="button"
              className="btn-nav-duplicate"
              title="Duplikat"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateNode(node.id);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: '1px 3px' }}
            >
              📑
            </button>
            <button
              type="button"
              className="btn-nav-delete"
              title="Hapus"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: '1px 3px' }}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Children Nested Group with Hierarchy Line */}
        {hasChildren && !isCollapsed && (
          <div
            style={{
              paddingLeft: '0.85rem',
              marginLeft: '0.55rem',
              borderLeft: '1px dashed var(--border-color, #cbd5e1)',
              marginTop: '2px',
            }}
          >
            {node.children!.map((child, idx) => renderNode(child, idx, node.children!, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="nav-tree-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      {/* Floating Toast Alert Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            marginBottom: '4px',
            textAlign: 'center',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header Toolbar: Expand / Collapse All */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Struktur Hirarki Node</span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={handleExpandAll}
            style={{
              padding: '2px 6px',
              fontSize: '0.65rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
            title="Buka Semua Container"
          >
            📂 Buka Semua
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            style={{
              padding: '2px 6px',
              fontSize: '0.65rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
            title="Tutup Semua Container"
          >
            📁 Tutup Semua
          </button>
        </div>
      </div>

      {/* Root Canvas Stage Row */}
      <div
        className={`nav-tree-label ${isCanvasSelected ? 'selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode('canvas');
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverId('canvas');
        }}
        onDragLeave={() => setDragOverId(null)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverId(null);
          if (draggedNode) {
            handleExecuteNest(draggedNode.id, null);
            setDraggedNode(null);
          }
        }}
        style={{
          fontWeight: 700,
          border: dragOverId === 'canvas' ? '2px dashed #0284c7' : isCanvasSelected ? '1px solid var(--primary)' : '1px dashed var(--border-color)',
          background: dragOverId === 'canvas' ? '#e0f2fe' : isCanvasSelected ? 'var(--primary-light, rgba(227, 99, 151, 0.15))' : 'var(--bg-card)',
          borderRadius: '6px',
          padding: '0.45rem 0.65rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem' }}>🌐</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Canvas Stage (Halaman Terluar)</span>
        </div>
        <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
          Root
        </span>
      </div>

      {/* Scrollable Tree Area with Horizontal & Vertical Scroll */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', paddingBottom: '0.5rem' }}>
        {nodes.map((node, idx) => renderNode(node, idx, nodes, 0))}
      </div>

      {/* Quick Move / Nest Target Selector Modal */}
      {nestingSourceNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setNestingSourceNode(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                📥 Pindahkan ke Dalam Container
              </h4>
              <button
                type="button"
                onClick={() => setNestingSourceNode(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Pilih kontainer tujuan untuk memasukkan elemen <strong>{nestingSourceNode.label || nestingSourceNode.type}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {/* Option 1: Root Canvas */}
              <button
                type="button"
                onClick={() => handleExecuteNest(nestingSourceNode.id, null)}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#0284c7',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                📤 Root Canvas Stage (Tingkat Paling Luar)
              </button>

              {/* Option 2: Available Target Containers */}
              {collectValidTargetContainers(nodes, nestingSourceNode).map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => handleExecuteNest(nestingSourceNode.id, target.id)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {target.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
