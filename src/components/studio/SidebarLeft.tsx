'use client';

import React from 'react';
import { WidgetsPanel } from './WidgetsPanel';
import { NavigatorTree } from './NavigatorTree';
import { InspectorPanel } from './InspectorPanel';
import { StudioNode } from '@/types';

interface SidebarLeftProps {
  sidebarTab: 'widgets' | 'navigator' | 'properties';
  setSidebarTab: (tab: 'widgets' | 'navigator' | 'properties') => void;
  nodes: StudioNode[];
  selectedNodeId: string | null;
  selectedNode: StudioNode | null;
  onSelectNode: (id: string) => void;
  onAddWidget: (type: StudioNode['type']) => void;
  onAddRootContainer: () => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  onUpdateNode: (updatedNode: StudioNode) => void;
  onInsertVariable?: (varTag: string) => void;
}

export function SidebarLeft({
  sidebarTab,
  setSidebarTab,
  nodes,
  selectedNodeId,
  selectedNode,
  onSelectNode,
  onAddWidget,
  onAddRootContainer,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onUpdateNode,
  onInsertVariable,
}: SidebarLeftProps) {
  return (
    <aside className="studio-sidebar-left" style={{ overflowY: 'hidden' }}>
      {/* 3 Sidebar Mode Tabs */}
      <div className="sidebar-modes-tabs" style={{ display: 'flex', borderBottom: 'var(--studio-border)', backgroundColor: 'var(--bg-body)', flexShrink: 0 }}>
        <button
          type="button"
          className={`sidebar-mode-btn ${sidebarTab === 'widgets' ? 'active' : ''}`}
          onClick={() => setSidebarTab('widgets')}
          style={{ flex: 1, padding: '0.75rem 0.25rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', letterSpacing: '0.05em', fontFamily: 'inherit' }}
        >
          🧱 Widgets
        </button>
        <button
          type="button"
          className={`sidebar-mode-btn ${sidebarTab === 'navigator' ? 'active' : ''}`}
          onClick={() => setSidebarTab('navigator')}
          style={{ flex: 1, padding: '0.75rem 0.25rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', letterSpacing: '0.05em', fontFamily: 'inherit' }}
        >
          🌳 Navigator
        </button>
        <button
          type="button"
          className={`sidebar-mode-btn ${sidebarTab === 'properties' ? 'active' : ''}`}
          onClick={() => setSidebarTab('properties')}
          style={{ flex: 1, padding: '0.75rem 0.25rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', letterSpacing: '0.05em', fontFamily: 'inherit' }}
        >
          ⚙️ Properti
        </button>
      </div>

      {/* TAB CONTENT 1: WIDGETS */}
      {sidebarTab === 'widgets' && (
        <WidgetsPanel
          onAddWidget={onAddWidget}
          onAddRootContainer={onAddRootContainer}
          onInsertVariable={onInsertVariable}
        />
      )}

      {/* TAB CONTENT 2: NAVIGATOR */}
      {sidebarTab === 'navigator' && (
        <div id="sidebar-content-navigator" className="sidebar-tab-content" style={{ display: 'block', padding: '1rem 1.25rem', height: 'calc(100% - 38px)', overflowY: 'auto', boxSizing: 'border-box' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '0.75rem' }}>🌳 Navigator Struktur Tree</p>
          <div id="studio-navigator-tree" style={{ backgroundColor: 'var(--bg-body)', borderRadius: '8px', border: 'var(--studio-border)', padding: '0.5rem', minHeight: '250px', overflowY: 'auto' }}>
            <NavigatorTree
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => {
                onSelectNode(id);
              }}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              onMoveNode={onMoveNode}
              onUpdateNode={onUpdateNode}
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PROPERTIES (INSPECTOR) */}
      {sidebarTab === 'properties' && (
        <div id="sidebar-content-properties" className="sidebar-tab-content" style={{ display: 'block', height: 'calc(100% - 38px)', overflowY: 'auto' }}>
          <InspectorPanel
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onInsertVariable={onInsertVariable}
          />
        </div>
      )}
    </aside>
  );
}
