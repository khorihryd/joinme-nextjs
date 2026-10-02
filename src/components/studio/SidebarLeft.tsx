'use client';

import React from 'react';
import { WidgetsPanel } from './WidgetsPanel';
import { NavigatorTree } from './NavigatorTree';
import { InspectorPanel } from './InspectorPanel';
import { GlobalPropertiesPanel } from './GlobalPropertiesPanel';
import { DataPropertiesPanel } from './DataPropertiesPanel';
import { StudioNode } from '@/types';

interface SidebarLeftProps {
  sidebarTab: 'data' | 'widgets' | 'navigator' | 'global' | 'properties';
  setSidebarTab: (tab: 'data' | 'widgets' | 'navigator' | 'global' | 'properties') => void;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
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
  eventDetails?: any;
  setEventDetails?: React.Dispatch<React.SetStateAction<any>>;
  eventTitle?: string;
  setEventTitle?: (title: string) => void;
  eventSubdomain?: string;
  setEventSubdomain?: (subdomain: string) => void;
  eventStatus?: 'Draft' | 'Aktif';
  setEventStatus?: (status: 'Draft' | 'Aktif') => void;
  isEvent?: boolean;
}

export function SidebarLeft({
  sidebarTab,
  setSidebarTab,
  showSidebar = true,
  onToggleSidebar,
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
  eventDetails,
  setEventDetails,
  eventTitle,
  setEventTitle,
  eventSubdomain,
  setEventSubdomain,
  eventStatus,
  setEventStatus,
  isEvent = false,
}: SidebarLeftProps) {
  const tabs: {
    id: 'data' | 'widgets' | 'navigator' | 'global' | 'properties';
    icon: string;
    label: string;
    tooltip: string;
  }[] = [
    { id: 'data', icon: '📋', label: 'Data', tooltip: 'Data Undangan & Konten' },
    { id: 'widgets', icon: '🧱', label: 'Widget', tooltip: 'Tambah Komponen / Widget' },
    { id: 'navigator', icon: '🌳', label: 'Lapisan', tooltip: 'Navigator Struktur Lapisan Elemen' },
    { id: 'global', icon: '🎨', label: 'Tema', tooltip: 'Gaya Global & Palet Warna' },
    { id: 'properties', icon: '⚙️', label: 'Properti', tooltip: 'Pengaturan & Gaya Elemen Terpilih' },
  ];

  return (
    <aside
      className={`studio-sidebar-left ${showSidebar === false ? 'collapsed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 1. Vertical Activity Bar (Tab Strip) */}
      <div
        className="sidebar-vertical-rail"
        style={{
          width: '62px',
          height: '100%',
          backgroundColor: 'var(--bg-body, #f8fafc)',
          borderRight: 'var(--studio-border, 1px solid #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.65rem 0',
          gap: '0.35rem',
          flexShrink: 0,
          boxSizing: 'border-box',
          userSelect: 'none',
          zIndex: 2,
        }}
      >
        {/* Navigation Tabs */}
        {tabs.map((tab) => {
          const isActive = sidebarTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`sidebar-vertical-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarTab(tab.id)}
              title={tab.tooltip}
              aria-label={tab.tooltip}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                width: '52px',
                height: '52px',
                padding: '5px 2px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'rgba(227, 99, 151, 0.12)' : 'transparent',
                color: isActive ? 'var(--primary, #db2777)' : 'var(--text-secondary, #64748b)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.color = 'var(--text-main, #1e293b)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary, #64748b)';
                }
              }}
            >
              {/* Active Indicator Bar on the left */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '8px',
                    bottom: '8px',
                    width: '3.5px',
                    borderTopRightRadius: '3px',
                    borderBottomRightRadius: '3px',
                    backgroundColor: 'var(--primary, #db2777)',
                  }}
                />
              )}
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{tab.icon}</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom Action: Toggle/Collapse Sidebar */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Sembunyikan Panel (Ctrl+\\)"
            aria-label="Sembunyikan Panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              width: '48px',
              height: '46px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #64748b)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary, #db2777)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary, #64748b)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Tutup</span>
          </button>
        )}
      </div>

      {/* 2. Main Content Drawer */}
      <div
        className="studio-sidebar-content"
        style={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #ffffff)',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* TAB CONTENT 0: DATA UNDANGAN */}
        {sidebarTab === 'data' && (
          <div id="sidebar-content-data" className="sidebar-tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <DataPropertiesPanel
              details={eventDetails || {}}
              setDetails={setEventDetails || (() => {})}
              eventTitle={eventTitle}
              setEventTitle={setEventTitle}
              eventSubdomain={eventSubdomain}
              setEventSubdomain={setEventSubdomain}
              eventStatus={eventStatus}
              setEventStatus={setEventStatus}
              isEvent={isEvent}
            />
          </div>
        )}

        {/* TAB CONTENT 1: WIDGETS */}
        {sidebarTab === 'widgets' && (
          <div id="sidebar-content-widgets" className="sidebar-tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <WidgetsPanel
              onAddWidget={onAddWidget}
              onAddRootContainer={onAddRootContainer}
              onInsertVariable={onInsertVariable}
            />
          </div>
        )}

        {/* TAB CONTENT 2: NAVIGATOR */}
        {sidebarTab === 'navigator' && (
          <div id="sidebar-content-navigator" className="sidebar-tab-content" style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.25rem', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)' }}>🌳 Navigator Lapisan Tree</span>
            </div>
            <div id="studio-navigator-tree" style={{ backgroundColor: 'var(--bg-body)', borderRadius: '8px', border: 'var(--studio-border)', padding: '0.5rem', flex: 1, minHeight: '250px', overflowY: 'auto' }}>
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

        {/* TAB CONTENT 3: GLOBAL PROPERTIES (DESIGN TOKENS) */}
        {sidebarTab === 'global' && (
          <div id="sidebar-content-global" className="sidebar-tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <GlobalPropertiesPanel />
          </div>
        )}

        {/* TAB CONTENT 4: PROPERTIES (INSPECTOR) */}
        {sidebarTab === 'properties' && (
          <div id="sidebar-content-properties" className="sidebar-tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <InspectorPanel
              node={selectedNode}
              onUpdateNode={onUpdateNode}
              onInsertVariable={onInsertVariable}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
