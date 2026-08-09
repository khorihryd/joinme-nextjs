'use client';

import React, { useState } from 'react';
import { StudioNode } from '@/types';

interface NavigatorTreeProps {
  nodes: StudioNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  onUpdateNode?: (updatedNode: StudioNode) => void;
}

export function NavigatorTree({
  nodes,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onUpdateNode,
}: NavigatorTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
      default:
        return '📄';
    }
  };

  const renderNode = (node: StudioNode, index: number = 0, parentList: StudioNode[] = nodes, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id;
    const isHovered = hoveredNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsed[node.id];

    const isFirst = index === 0;
    const isLast = index === parentList.length - 1;

    return (
      <div key={node.id} className="nav-tree-node" style={{ marginBottom: '2px' }}>
        {/* Node Item Row */}
        <div
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
            cursor: 'pointer',
            background: isSelected
              ? 'var(--primary-light, rgba(227, 99, 151, 0.15))'
              : isHovered
              ? 'var(--bg-card, rgba(0,0,0,0.03))'
              : 'transparent',
            border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
            transition: 'background 0.15s ease, border-color 0.15s ease',
            whiteSpace: 'nowrap',
            minWidth: '220px',
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
                title="Double click untuk ubah nama elemen"
              >
                {node.label || (node.content ? node.content.substring(0, 22) : node.type === 'container' ? `Container (${node.id})` : node.type)}
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
    <div className="nav-tree-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
        style={{
          fontWeight: 700,
          border: isCanvasSelected ? '1px solid var(--primary)' : '1px dashed var(--border-color)',
          background: isCanvasSelected ? 'var(--primary-light, rgba(227, 99, 151, 0.15))' : 'var(--bg-card)',
          borderRadius: '6px',
          padding: '0.45rem 0.65rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
    </div>
  );
}
