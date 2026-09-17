'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StudioNode, GlobalStyles, GlobalColorTokens } from '@/types';
import { findParentNode, DEFAULT_GLOBAL_STYLES } from '@/store/studio-store';

interface StudioToolbarProps {
  selectedNode: StudioNode | null;
  selectedNodeId: string | null;
  onUpdateNode: (updatedNode: StudioNode) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onSelectNode: (id: string) => void;
  globalStyles: GlobalStyles;
  onUpdateGlobalStyles: (styles: Partial<GlobalStyles>) => void;
  onOpenProperties: () => void;
  onOpenGlobal: () => void;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  nodes: StudioNode[];
}

export function StudioToolbar({
  selectedNode,
  selectedNodeId,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onSelectNode,
  globalStyles,
  onUpdateGlobalStyles,
  onOpenProperties,
  onOpenGlobal,
  viewportMode,
  nodes,
}: StudioToolbarProps) {
  const [openPopover, setOpenPopover] = useState<
    'textColor' | 'bgColor' | 'radius' | 'align' | 'padding' | 'border' | 'canvasBg' | null
  >(null);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (popoverKey: 'textColor' | 'bgColor' | 'radius' | 'align' | 'padding' | 'border' | 'canvasBg') => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenPopover(popoverKey);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenPopover(null);
    }, 180);
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isCanvasSelected = selectedNodeId === 'canvas' || !selectedNode;
  const style = selectedNode?.style || {};

  // Responsive style helper
  const getResponsiveVal = (key: string, defaultVal: any) => {
    let activeKey = key;
    if (viewportMode === 'mobile') {
      activeKey = key + 'Mobile';
    } else if (viewportMode === 'tablet') {
      activeKey = key + 'Tablet';
    }
    if (style[activeKey] !== undefined && style[activeKey] !== '') return style[activeKey];
    if (viewportMode === 'mobile' && style[key + 'Tablet'] !== undefined && style[key + 'Tablet'] !== '') {
      return style[key + 'Tablet'];
    }
    return style[key] !== undefined && style[key] !== '' ? style[key] : defaultVal;
  };

  const updateStyleProp = (key: string, value: any) => {
    if (!selectedNode) return;
    let activeKey = key;
    if (viewportMode === 'mobile') {
      activeKey = key + 'Mobile';
    } else if (viewportMode === 'tablet') {
      activeKey = key + 'Tablet';
    }

    onUpdateNode({
      ...selectedNode,
      style: {
        ...selectedNode.style,
        [activeKey]: value,
      },
    });
  };

  const updateMultipleStyleProps = (propsObj: Record<string, any>) => {
    if (!selectedNode) return;
    let styleUpdates: Record<string, any> = {};
    Object.entries(propsObj).forEach(([key, value]) => {
      let activeKey = key;
      if (viewportMode === 'mobile') {
        activeKey = key + 'Mobile';
      } else if (viewportMode === 'tablet') {
        activeKey = key + 'Tablet';
      }
      styleUpdates[activeKey] = value;
    });

    onUpdateNode({
      ...selectedNode,
      style: {
        ...selectedNode.style,
        ...styleUpdates,
      },
    });
  };

  // Find parent container if node is inside one
  const parentContainer = selectedNodeId && selectedNodeId !== 'canvas'
    ? findParentNode(nodes, selectedNodeId)
    : null;

  // Active theme color tokens
  const themeColors = globalStyles.colors || DEFAULT_GLOBAL_STYLES.colors!;
  const tokenSwatches: { key: keyof GlobalColorTokens; name: string; varName: string }[] = [
    { key: 'primary', name: 'Primary', varName: 'var(--global-primary)' },
    { key: 'secondary', name: 'Secondary', varName: 'var(--global-secondary)' },
    { key: 'textPrimary', name: 'Text Dark', varName: 'var(--global-text-primary)' },
    { key: 'textSecondary', name: 'Text Muted', varName: 'var(--global-text-secondary)' },
    { key: 'background', name: 'BG Light', varName: 'var(--global-background)' },
    { key: 'surface', name: 'Surface', varName: 'var(--global-surface)' },
    { key: 'accentLuxury', name: 'Gold/Accent', varName: 'var(--global-accent-luxury)' },
    { key: 'border', name: 'Border', varName: 'var(--global-border)' },
  ];

  const popularPalette = [
    '#0f172a', // Slate 900
    '#334155', // Slate 700
    '#64748b', // Slate 500
    '#ffffff', // White
    '#e11d48', // Rose 600
    '#db2777', // Pink 600
    '#d97706', // Amber 600
    '#059669', // Emerald 600
    '#2563eb', // Blue 600
    '#7c3aed', // Violet 600
    '#fdf6ed', // Warm Cream
    '#f8fafc', // Soft Gray
  ];

  // Node type labels & icons
  const getNodeLabel = (node: StudioNode) => {
    if (node.sectionType) return `Section ${node.sectionType}`;
    switch (node.type) {
      case 'container': return 'Flex Container';
      case 'heading': return `Judul (${(node as any).headingLevel || 'Heading'})`;
      case 'text': return 'Teks Paragraf';
      case 'image': return 'Gambar';
      case 'button': return 'Tombol';
      case 'countdown': return 'Countdown';
      case 'divider': return 'Garis Pemisah';
      case 'spacer': return 'Spacer';
      case 'gift-widget': return 'Amplop Digital';
      case 'lovestory': return 'Kisah Cinta';
      case 'gallery': return 'Galeri Foto';
      case 'rsvp': return 'Form RSVP';
      case 'wishes': return 'Ucapan Tamu';
      default: return String(node.type).toUpperCase();
    }
  };

  const getNodeIcon = (node: StudioNode) => {
    switch (node.type) {
      case 'container': return '📦';
      case 'heading': return '🔤';
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'button': return '🔘';
      case 'countdown': return '⏳';
      case 'divider': return '➖';
      case 'spacer': return '↕️';
      case 'gift-widget': return '💳';
      case 'lovestory': return '📖';
      case 'gallery': return '🖼️';
      case 'rsvp': return '💌';
      case 'wishes': return '💬';
      default: return '🧩';
    }
  };

  // Resolve color value to HEX for color input
  const resolveColorToHex = (colorVal: string | undefined, defaultHex = '#000000'): string => {
    if (!colorVal) return defaultHex;
    if (colorVal.startsWith('#')) return colorVal;
    if (colorVal === 'transparent') return '#ffffff';
    for (const sw of tokenSwatches) {
      if (colorVal === sw.varName || colorVal === `global:${sw.key}` || colorVal === sw.key) {
        return themeColors[sw.key] || defaultHex;
      }
    }
    return defaultHex;
  };

  // Current values
  const currentTextColor = getResponsiveVal('color', '#1e293b');
  const currentBgColor = getResponsiveVal('backgroundColor', 'transparent');
  const currentRadius = parseInt(String(getResponsiveVal('borderRadius', 0)), 10) || 0;
  const currentTextAlign = getResponsiveVal('textAlign', 'center');
  const currentFontSize = parseInt(String(getResponsiveVal('fontSize', 16)), 10) || 16;
  const currentFontWeight = String(getResponsiveVal('fontWeight', 'normal'));
  const isBold = currentFontWeight.toLowerCase() === 'bold' || Number(currentFontWeight) >= 700;
  const currentFontStyle = String(getResponsiveVal('fontStyle', 'normal'));
  const isItalic = currentFontStyle === 'italic';
  const currentPadding = getResponsiveVal('padding', '0px');
  const currentBorderWidth = parseInt(String(getResponsiveVal('borderWidth', 0)), 10) || 0;
  const currentBorderColor = getResponsiveVal('borderColor', '#cbd5e1');

  const isTextType = selectedNode && ['heading', 'text', 'button', 'countdown', 'divider'].includes(selectedNode.type);
  const isContainer = selectedNode?.type === 'container';

  // Popover base style
  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    zIndex: 99999,
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    boxShadow: '0 14px 34px -8px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
    padding: '0.75rem',
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  };

  return (
    <div
      ref={toolbarRef}
      className="studio-quick-toolbar"
      role="toolbar"
      aria-label="Studio Quick Properties Toolbar"
      style={{
        height: '46px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.85rem',
        gap: '0.5rem',
        overflow: 'visible',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        zIndex: 1050,
        position: 'relative',
        fontSize: '0.78rem',
      }}
    >
      {/* ===================================================================== */}
      {/* A. CANVAS / GLOBAL QUICK CONTROLS (WHEN NO NODE IS SELECTED)          */}
      {/* ===================================================================== */}
      {isCanvasSelected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
          {/* Canvas Indicator Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '3px 9px',
              borderRadius: '6px',
              backgroundColor: 'rgba(227, 99, 151, 0.1)',
              color: 'var(--primary, #e36397)',
              fontWeight: 800,
              fontSize: '0.75rem',
              border: '1px solid rgba(227, 99, 151, 0.25)',
            }}
          >
            <span>🌐</span>
            <span>Canvas Stage (Global)</span>
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 2px' }} />

          {/* Canvas Background Color */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('canvasBg')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === 'canvasBg' ? null : 'canvasBg')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 8px',
                borderRadius: '6px',
                border: openPopover === 'canvasBg' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                cursor: 'pointer',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
              title="Ubah Warna Latar Belakang Canvas (Arahkan kursor untuk membuka)"
            >
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: globalStyles.bgColor || '#eff2ef',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span>Latar Belakang Canvas</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▼</span>
            </button>

            {openPopover === 'canvasBg' && (
              <div
                style={popoverStyle}
                onMouseEnter={() => handleMouseEnter('canvasBg')}
                onMouseLeave={handleMouseLeave}
              >
                {/* Mouse hover bridge */}
                <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px', backgroundColor: 'transparent' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  🎨 Warna Background Canvas
                </div>
                {/* Tokens */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {popularPalette.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        onUpdateGlobalStyles({ bgColor: hex });
                        setOpenPopover(null);
                      }}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        backgroundColor: hex,
                        border: globalStyles.bgColor === hex ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={hex}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={resolveColorToHex(globalStyles.bgColor, '#eff2ef')}
                    onChange={(e) => onUpdateGlobalStyles({ bgColor: e.target.value })}
                    style={{ width: '32px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    value={globalStyles.bgColor || ''}
                    onChange={(e) => onUpdateGlobalStyles({ bgColor: e.target.value })}
                    placeholder="#eff2ef"
                    style={{ flex: 1, padding: '3px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Canvas Spacing / Padding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Padding:</span>
            {['12px', '24px', '36px'].map((pad) => (
              <button
                key={pad}
                type="button"
                onClick={() => onUpdateGlobalStyles({ padding: pad })}
                style={{
                  padding: '3px 7px',
                  borderRadius: '5px',
                  border: globalStyles.padding === pad ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: globalStyles.padding === pad ? 'var(--primary)' : 'var(--bg-body)',
                  color: globalStyles.padding === pad ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {pad}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Shortcut to full Global Styles in sidebar */}
          <button
            type="button"
            onClick={onOpenGlobal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '4px 9px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-body)',
              color: 'var(--primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>🎨 Buka Pengaturan Global</span>
          </button>
        </div>
      ) : (
        /* ===================================================================== */
        /* B. NODE-SPECIFIC QUICK PROPERTIES TOOLBAR                            */
        /* ===================================================================== */
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', width: '100%' }}>
          {/* 1. Element Type Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-body)',
              border: '1px solid var(--border-color)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--primary)',
            }}
            title={`ID: ${selectedNode.id}`}
          >
            <span>{getNodeIcon(selectedNode)}</span>
            <span>{getNodeLabel(selectedNode)}</span>
          </div>

          {/* 1.1 Parent Container Selector (If Inside a Container) */}
          {parentContainer && (
            <button
              type="button"
              onClick={() => onSelectNode(parentContainer.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '3px 7px',
                borderRadius: '5px',
                border: '1px dashed var(--border-color)',
                backgroundColor: 'transparent',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title={`Pilih Container Induk (${parentContainer.id})`}
            >
              <span>⬆</span>
              <span>Parent</span>
            </button>
          )}

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 2px' }} />

          {/* 2. WARNA TEKS (TEXT COLOR) */}
          {isTextType && (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('textColor')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenPopover(openPopover === 'textColor' ? null : 'textColor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: openPopover === 'textColor' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
                title="Ubah Warna Teks (Arahkan kursor untuk membuka)"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>A</span>
                  <span
                    style={{
                      width: '13px',
                      height: '3px',
                      borderRadius: '1px',
                      backgroundColor: resolveColorToHex(currentTextColor, '#1e293b'),
                      marginTop: '1px',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>▼</span>
              </button>

              {openPopover === 'textColor' && (
                <div
                  style={popoverStyle}
                  onMouseEnter={() => handleMouseEnter('textColor')}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Mouse hover bridge */}
                  <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px', backgroundColor: 'transparent' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    🔤 Warna Teks
                  </div>

                  {/* Theme Tokens */}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Token Warna Tema:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {tokenSwatches.map((sw) => {
                      const hex = themeColors[sw.key] || '#000';
                      const isSelected = currentTextColor === sw.varName;
                      return (
                        <button
                          key={sw.key}
                          type="button"
                          onClick={() => {
                            updateStyleProp('color', sw.varName);
                            setOpenPopover(null);
                          }}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: hex,
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title={`${sw.name} (${hex})`}
                        />
                      );
                    })}
                  </div>

                  {/* Standard Swatches */}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Palet Populer:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {popularPalette.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => {
                          updateStyleProp('color', hex);
                          setOpenPopover(null);
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          backgroundColor: hex,
                          border: currentTextColor === hex ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title={hex}
                      />
                    ))}
                  </div>

                  {/* Custom Picker */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '3px' }}>
                    <input
                      type="color"
                      value={resolveColorToHex(currentTextColor, '#1e293b')}
                      onChange={(e) => updateStyleProp('color', e.target.value)}
                      style={{ width: '32px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={currentTextColor || ''}
                      onChange={(e) => updateStyleProp('color', e.target.value)}
                      placeholder="#1e293b"
                      style={{ flex: 1, padding: '3px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. LATAR BELAKANG (BACKGROUND COLOR) */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('bgColor')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === 'bgColor' ? null : 'bgColor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 7px',
                borderRadius: '6px',
                border: openPopover === 'bgColor' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
              title="Ubah Warna Latar Belakang (Arahkan kursor untuk membuka)"
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: currentBgColor === 'transparent' ? 'transparent' : resolveColorToHex(currentBgColor, '#ffffff'),
                  border: '1px solid var(--border-color)',
                  backgroundImage: currentBgColor === 'transparent'
                    ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                    : 'none',
                  backgroundSize: '6px 6px',
                  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                }}
              />
              <span>BG</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>▼</span>
            </button>

            {openPopover === 'bgColor' && (
              <div
                style={popoverStyle}
                onMouseEnter={() => handleMouseEnter('bgColor')}
                onMouseLeave={handleMouseLeave}
              >
                {/* Mouse hover bridge */}
                <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px', backgroundColor: 'transparent' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    🎨 Warna Background
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateStyleProp('backgroundColor', 'transparent');
                      setOpenPopover(null);
                    }}
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: currentBgColor === 'transparent' ? 'var(--primary)' : 'var(--bg-body)',
                      color: currentBgColor === 'transparent' ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    🚫 Transparan
                  </button>
                </div>

                {/* Theme Tokens */}
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Token Tema:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {tokenSwatches.map((sw) => {
                    const hex = themeColors[sw.key] || '#000';
                    const isSelected = currentBgColor === sw.varName;
                    return (
                      <button
                        key={sw.key}
                        type="button"
                        onClick={() => {
                          updateStyleProp('backgroundColor', sw.varName);
                          setOpenPopover(null);
                        }}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          backgroundColor: hex,
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title={`${sw.name} (${hex})`}
                      />
                    );
                  })}
                </div>

                {/* Standard Swatches */}
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Palet Populer:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {popularPalette.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        updateStyleProp('backgroundColor', hex);
                        setOpenPopover(null);
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: hex,
                        border: currentBgColor === hex ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={hex}
                    />
                  ))}
                </div>

                {/* Custom Picker */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={resolveColorToHex(currentBgColor, '#ffffff')}
                    onChange={(e) => updateStyleProp('backgroundColor', e.target.value)}
                    style={{ width: '32px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    value={currentBgColor || ''}
                    onChange={(e) => updateStyleProp('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    style={{ flex: 1, padding: '3px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. SUDUT / BORDER RADIUS */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('radius')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === 'radius' ? null : 'radius')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 7px',
                borderRadius: '6px',
                border: openPopover === 'radius' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
              title="Ubah Sudut / Kelengkungan (Arahkan kursor untuk membuka)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 15V9a5 5 0 0 1 5-5h6" />
                <rect x="3" y="3" width="18" height="18" rx="4" opacity="0.15" stroke="none" fill="currentColor" />
              </svg>
              <span>{currentRadius > 900 ? 'Pill' : `${currentRadius}px`}</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>▼</span>
            </button>

            {openPopover === 'radius' && (
              <div
                style={{ ...popoverStyle, minWidth: '240px' }}
                onMouseEnter={() => handleMouseEnter('radius')}
                onMouseLeave={handleMouseLeave}
              >
                {/* Mouse hover bridge */}
                <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px', backgroundColor: 'transparent' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  ▢ Sudut / Kelengkungan Border Radius
                </div>

                {/* Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {[
                    { label: '0px', val: 0, desc: 'Tajam' },
                    { label: '4px', val: 4, desc: 'XS' },
                    { label: '8px', val: 8, desc: 'SM' },
                    { label: '12px', val: 12, desc: 'MD' },
                    { label: '16px', val: 16, desc: 'LG' },
                    { label: '24px', val: 24, desc: 'XL' },
                    { label: '32px', val: 32, desc: '2XL' },
                    { label: 'Pill', val: 9999, desc: 'Bulat' },
                  ].map((p) => {
                    const isSelected = currentRadius === p.val;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          updateStyleProp('borderRadius', p.val);
                          setOpenPopover(null);
                        }}
                        style={{
                          padding: '4px 2px',
                          borderRadius: '5px',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Slider and direct input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={currentRadius > 60 ? 60 : currentRadius}
                    onChange={(e) => updateStyleProp('borderRadius', Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={currentRadius}
                      onChange={(e) => updateStyleProp('borderRadius', Number(e.target.value))}
                      style={{ width: '50px', padding: '3px 4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>px</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. ALIGNMENT CONTROLS */}
          {/* 5A. Text Alignment for Text Nodes */}
          {isTextType && (
            <div
              style={{
                display: 'inline-flex',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                overflow: 'hidden',
              }}
            >
              {[
                { id: 'left', label: '⬅', title: 'Rata Kiri (Left)' },
                { id: 'center', label: '↔', title: 'Rata Tengah (Center)' },
                { id: 'right', label: '➡', title: 'Rata Kanan (Right)' },
                { id: 'justify', label: '🟰', title: 'Rata Kanan-Kiri (Justify)' },
              ].map((al) => {
                const isActive = currentTextAlign === al.id;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => updateStyleProp('textAlign', al.id)}
                    style={{
                      padding: '3px 7px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      transition: 'background 0.15s ease',
                    }}
                    title={al.title}
                  >
                    {al.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 5B. Flex Alignment for Container Nodes */}
          {isContainer && (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('align')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenPopover(openPopover === 'align' ? null : 'align')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: openPopover === 'align' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
                title="Atur Alignment & Arah Tata Letak Flexbox (Arahkan kursor untuk membuka)"
              >
                <span>📐 Alignment</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>▼</span>
              </button>

              {openPopover === 'align' && (
                <div
                  style={{ ...popoverStyle, minWidth: '250px' }}
                  onMouseEnter={() => handleMouseEnter('align')}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Mouse hover bridge */}
                  <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px', backgroundColor: 'transparent' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    📐 Arah & Alignment Flexbox
                  </div>

                  {/* Direction */}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Arah Elemen:</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: 'column', label: '⬇️ Kolom (Vertikal)' },
                      { id: 'row', label: '➡️ Baris (Horizontal)' },
                    ].map((dir) => {
                      const isActive = getResponsiveVal('flexDirection', 'column') === dir.id;
                      return (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => updateStyleProp('flexDirection', dir.id)}
                          style={{
                            flex: 1,
                            padding: '4px 6px',
                            borderRadius: '5px',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-body)',
                            color: isActive ? '#fff' : 'var(--text-primary)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {dir.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Justify Content */}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Penyelarasan Sumbu Utama (Justify):</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
                    {[
                      { id: 'flex-start', label: 'Awal' },
                      { id: 'center', label: 'Tengah' },
                      { id: 'flex-end', label: 'Akhir' },
                      { id: 'space-between', label: 'Rata' },
                    ].map((j) => {
                      const isActive = getResponsiveVal('justifyContent', 'center') === j.id;
                      return (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => updateStyleProp('justifyContent', j.id)}
                          style={{
                            padding: '3px 2px',
                            borderRadius: '4px',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-body)',
                            color: isActive ? '#fff' : 'var(--text-primary)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {j.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Align Items */}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Penyelarasan Silang (Align Items):</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
                    {[
                      { id: 'flex-start', label: 'Kiri/Atas' },
                      { id: 'center', label: 'Tengah' },
                      { id: 'flex-end', label: 'Kanan/Bwh' },
                      { id: 'stretch', label: 'Penuh' },
                    ].map((ai) => {
                      const isActive = getResponsiveVal('alignItems', 'center') === ai.id;
                      return (
                        <button
                          key={ai.id}
                          type="button"
                          onClick={() => updateStyleProp('alignItems', ai.id)}
                          style={{
                            padding: '3px 2px',
                            borderRadius: '4px',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-body)',
                            color: isActive ? '#fff' : 'var(--text-primary)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {ai.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. FONT SIZE & STYLES (FOR TEXT NODES) */}
          {isTextType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {/* Font Size Step Controls */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => updateStyleProp('fontSize', `${Math.max(8, currentFontSize - 2)}px`)}
                  style={{
                    padding: '3px 6px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                  }}
                  title="Kecilkan Font (-2px)"
                >
                  -
                </button>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0 4px', minWidth: '32px', textAlign: 'center' }}>
                  {currentFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => updateStyleProp('fontSize', `${Math.min(96, currentFontSize + 2)}px`)}
                  style={{
                    padding: '3px 6px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                  }}
                  title="Besarkan Font (+2px)"
                >
                  +
                </button>
              </div>

              {/* Bold Toggle */}
              <button
                type="button"
                onClick={() => updateStyleProp('fontWeight', isBold ? 'normal' : 'bold')}
                style={{
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: isBold ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isBold ? 'var(--primary)' : 'var(--bg-body)',
                  color: isBold ? '#fff' : 'var(--text-primary)',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                }}
                title={isBold ? 'Nonaktifkan Tebal' : 'Tebalkan Teks (Bold)'}
              >
                B
              </button>

              {/* Italic Toggle */}
              <button
                type="button"
                onClick={() => updateStyleProp('fontStyle', isItalic ? 'normal' : 'italic')}
                style={{
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: isItalic ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isItalic ? 'var(--primary)' : 'var(--bg-body)',
                  color: isItalic ? '#fff' : 'var(--text-primary)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                }}
                title={isItalic ? 'Nonaktifkan Miring' : 'Miringkan Teks (Italic)'}
              >
                I
              </button>
            </div>
          )}

          {/* 7. PADDING QUICK SELECTOR */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('padding')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === 'padding' ? null : 'padding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 7px',
                borderRadius: '6px',
                border: openPopover === 'padding' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
              title="Ubah Jarak Dalam (Padding) (Arahkan kursor untuk membuka)"
            >
              <span>⬚ Pad: {currentPadding}</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>▼</span>
            </button>

            {openPopover === 'padding' && (
              <div
                style={{ ...popoverStyle, minWidth: '220px', right: 0, left: 'auto' }}
                onMouseEnter={() => handleMouseEnter('padding')}
                onMouseLeave={handleMouseLeave}
              >
                {/* Mouse hover bridge */}
                <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px', backgroundColor: 'transparent' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  ⬚ Jarak Dalam (Padding)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {[
                    { label: '0px', val: '0px' },
                    { label: '8px', val: '8px' },
                    { label: '12px', val: '12px' },
                    { label: '16px', val: '16px' },
                    { label: '24px', val: '24px' },
                    { label: '32px', val: '32px' },
                    { label: '12px 24px', val: '12px 24px' },
                    { label: '16px 32px', val: '16px 32px' },
                    { label: '24px 40px', val: '24px 40px' },
                  ].map((pad) => {
                    const isSelected = currentPadding === pad.val;
                    return (
                      <button
                        key={pad.label}
                        type="button"
                        onClick={() => {
                          updateStyleProp('padding', pad.val);
                          setOpenPopover(null);
                        }}
                        style={{
                          padding: '4px 2px',
                          borderRadius: '5px',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {pad.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* 8. QUICK ACTIONS (DUPLICATE, DELETE, DETAIL) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => onDuplicateNode(selectedNode.id)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Duplikat Elemen"
            >
              <span>📋</span>
              <span>Duplikat</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteNode(selectedNode.id)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Hapus Elemen"
            >
              <span>🗑️</span>
              <span>Hapus</span>
            </button>

            <button
              type="button"
              onClick={onOpenProperties}
              style={{
                padding: '3px 9px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Buka Tab Properti Lengkap di Sidebar Kiri"
            >
              <span>⚙️</span>
              <span>Properti</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
