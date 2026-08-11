'use client';

import React, { useState } from 'react';
import { StudioNode, DYNAMIC_VARIABLE_CATEGORIES } from '@/types';
import { useStudioStore, findParentNode } from '@/store/studio-store';
import { FontEngineSelect } from './FontEngine';

interface InspectorPanelProps {
  node: StudioNode | null;
  onUpdateNode: (updatedNode: StudioNode) => void;
  onInsertVariable?: (varTag: string) => void;
}

export function InspectorPanel({ node, onUpdateNode }: InspectorPanelProps) {
  const [selectedVarCat, setSelectedVarCat] = useState<string>('all');
  const {
    activeInspectorTab,
    setActiveInspectorTab,
    viewportMode,
    nodes,
    selectedNodeId,
    globalStyles,
    updateGlobalStyles,
  } = useStudioStore();

  const isCanvasSelected = selectedNodeId === 'canvas';
  const deviceIcon = viewportMode === 'desktop' ? '💻' : viewportMode === 'tablet' ? '📟' : '📱';

  // =========================================================================
  // 1. RENDER INSPECTOR FOR CANVAS STAGE (HALAMAN TERLUAR & TEMPLATE GLOBAL)
  // =========================================================================
  if (isCanvasSelected || !node) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Node Header Badge */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            🌐 Canvas Stage (Halaman Terluar)
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: canvas</span>
        </div>

        {/* 3 Inspector Sub-tabs (Layout / Style / Advanced) */}
        <div className="inspector-tabs">
          <button
            type="button"
            className={`inspector-tab-btn ${activeInspectorTab === 'layout' ? 'active' : ''}`}
            onClick={() => setActiveInspectorTab('layout')}
          >
            Layout
          </button>
          <button
            type="button"
            className={`inspector-tab-btn ${activeInspectorTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveInspectorTab('style')}
          >
            Style
          </button>
          <button
            type="button"
            className={`inspector-tab-btn ${activeInspectorTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveInspectorTab('advanced')}
          >
            Advanced
          </button>
        </div>

        {/* Inspector Forms Area */}
        <div className="inspector-tab-content active" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {/* LAYOUT TAB */}
          {activeInspectorTab === 'layout' && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                📐 Dimensi &amp; Spacing Canvas Terluar
              </div>

              {/* Padding Canvas Terluar */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Padding Canvas Terluar (Jarak Dalam Stage)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={globalStyles.padding || ''}
                  onChange={(e) => updateGlobalStyles({ padding: e.target.value })}
                  placeholder="24px"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                  {['0px', '12px', '24px', '40px 24px', '60px 24px'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateGlobalStyles({ padding: preset })}
                      style={{ padding: '2px 6px', fontSize: '0.68rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin Canvas Terluar */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Margin Canvas (Jarak Luar Stage)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={globalStyles.margin || ''}
                  onChange={(e) => updateGlobalStyles({ margin: e.target.value })}
                  placeholder="0px"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                  {['0px', '0px 0px 24px 0px', '20px auto'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateGlobalStyles({ margin: preset })}
                      style={{ padding: '2px 6px', fontSize: '0.68rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewport Width */}
              <div className="form-group">
                <label>Lebar Viewport Desktop Mode</label>
                <input
                  type="text"
                  value={globalStyles.viewportWidthDesktop || '100%'}
                  onChange={(e) => updateGlobalStyles({ viewportWidthDesktop: e.target.value })}
                  placeholder="100% atau 1200px"
                />
              </div>
            </div>
          )}

          {/* STYLE TAB */}
          {activeInspectorTab === 'style' && (
            <div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Warna Latar Belakang Stage (Background Color)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={globalStyles.bgColor && globalStyles.bgColor.startsWith('#') ? globalStyles.bgColor : '#eff2ef'}
                    onChange={(e) => updateGlobalStyles({ bgColor: e.target.value })}
                    style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={globalStyles.bgColor || ''}
                    onChange={(e) => updateGlobalStyles({ bgColor: e.target.value })}
                    placeholder="#eff2ef"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Gambar Latar Canvas (Background Image URL)</label>
                <input
                  type="text"
                  value={globalStyles.backgroundImage || ''}
                  onChange={(e) => updateGlobalStyles({ backgroundImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label>Font Utama Template (Font Family)</label>
                <FontEngineSelect
                  value={globalStyles.fontFamily || 'Playfair Display'}
                  onChange={(font) => updateGlobalStyles({ fontFamily: font })}
                />
              </div>
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeInspectorTab === 'advanced' && (
            <div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: 'var(--studio-border)' }}>
                <label htmlFor="inp-hideScrollbar-canvas" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  🙈 Sembunyikan Scrollbar Canvas
                </label>
                <input
                  type="checkbox"
                  id="inp-hideScrollbar-canvas"
                  checked={globalStyles.hideScrollbar || false}
                  onChange={(e) => updateGlobalStyles({ hideScrollbar: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. RENDER INSPECTOR FOR REGULAR NODES (CONTAINER & WIDGETS)
  // =========================================================================
  const style = node.style || {};
  const isContainer = node.type === 'container';
  const isRootContainer = isContainer && !findParentNode(nodes, node.id);

  const getResponsiveVal = (key: string, defaultVal: any) => {
    let activeKey = key;
    if (viewportMode === 'mobile') {
      activeKey = key + 'Mobile';
    } else if (viewportMode === 'tablet') {
      activeKey = key + 'Tablet';
    }
    if (style[activeKey] !== undefined && style[activeKey] !== '') return style[activeKey];
    if (viewportMode === 'mobile' && style[key + 'Tablet'] !== undefined && style[key + 'Tablet'] !== '') return style[key + 'Tablet'];
    return style[key] !== undefined && style[key] !== '' ? style[key] : defaultVal;
  };

  const updateStyleProp = (key: string, value: any) => {
    let activeKey = key;
    if (viewportMode === 'mobile') {
      activeKey = key + 'Mobile';
    } else if (viewportMode === 'tablet') {
      activeKey = key + 'Tablet';
    }

    onUpdateNode({
      ...node,
      style: {
        ...node.style,
        [activeKey]: value,
      },
    });
  };

  const updateMultipleStyleProps = (propsObj: Record<string, any>) => {
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
      ...node,
      style: {
        ...node.style,
        ...styleUpdates,
      },
    });
  };

  const updateNodeProp = (key: string, value: any) => {
    onUpdateNode({
      ...node,
      [key]: value,
    });
  };

  const insertVarTag = (varTag: string) => {
    const current = node.content || '';
    updateNodeProp('content', current + ' ' + varTag);
  };

  // Multi-Color Gradient Helpers
  const currentGradientColors = Array.isArray(style.gradientColors) && style.gradientColors.length > 0
    ? style.gradientColors
    : [style.gradientColor1 || '#8B5E3C', style.gradientColor2 || '#C9A66B'];

  const updateGradientColorItem = (index: number, newColor: string) => {
    const updated = [...currentGradientColors];
    updated[index] = newColor;
    updateMultipleStyleProps({
      gradientColors: updated,
      gradientColor1: updated[0],
      gradientColor2: updated[1] || updated[0],
    });
  };

  const addGradientColorItem = () => {
    const updated = [...currentGradientColors, 'rgba(255, 255, 255, 0.5)'];
    updateMultipleStyleProps({
      gradientColors: updated,
      gradientColor1: updated[0],
      gradientColor2: updated[1] || updated[0],
    });
  };

  const removeGradientColorItem = (index: number) => {
    if (currentGradientColors.length <= 2) return;
    const updated = currentGradientColors.filter((_, i) => i !== index);
    updateMultipleStyleProps({
      gradientColors: updated,
      gradientColor1: updated[0],
      gradientColor2: updated[1] || updated[0],
    });
  };

  const applyGradientPreset = (colors: string[], dir: string) => {
    updateMultipleStyleProps({
      bgType: 'gradient',
      gradientColors: colors,
      gradientDirection: dir,
      gradientColor1: colors[0],
      gradientColor2: colors[1] || colors[0],
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Node Header Badge & Custom Label Editor */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isContainer ? (isRootContainer ? '📦 Root Container (Seksi Terluar)' : '📦 Inner Container') : `📄 Elemen ${node.type.toUpperCase()}`}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {node.id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, flexShrink: 0 }}>Nama / Label:</label>
          <input
            type="text"
            value={node.label || ''}
            onChange={(e) => updateNodeProp('label', e.target.value)}
            placeholder={node.content ? node.content.substring(0, 18) : node.type === 'container' ? `Container (${node.id})` : node.type}
            style={{ fontSize: '0.72rem', padding: '3px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', background: '#ffffff' }}
          />
        </div>
      </div>

      {/* 3 Inspector Sub-tabs (Layout / Style / Advanced) */}
      <div className="inspector-tabs">
        <button
          type="button"
          className={`inspector-tab-btn ${activeInspectorTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveInspectorTab('layout')}
        >
          Layout
        </button>
        <button
          type="button"
          className={`inspector-tab-btn ${activeInspectorTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveInspectorTab('style')}
        >
          Style
        </button>
        <button
          type="button"
          className={`inspector-tab-btn ${activeInspectorTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveInspectorTab('advanced')}
        >
          Advanced
        </button>
      </div>

      {/* Inspector Forms Area */}
      <div className="inspector-tab-content active" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {/* LAYOUT TAB */}
        {activeInspectorTab === 'layout' && (
          <div>
            {isContainer && (
              <>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Tipe Tampilan (Display Mode)</label>
                  <select
                    value={getResponsiveVal('display', 'flex')}
                    onChange={(e) => updateStyleProp('display', e.target.value)}
                  >
                    <option value="flex">Flexbox Container</option>
                    <option value="grid">Grid Layout</option>
                  </select>
                </div>

                {getResponsiveVal('display', 'flex') === 'grid' ? (
                  <div className="form-group">
                    <label>Jumlah Kolom (Grid Cols)</label>
                    <input
                      type="number"
                      value={Number(getResponsiveVal('gridCols', 2)) || 2}
                      onChange={(e) => updateStyleProp('gridCols', parseInt(e.target.value) || 1)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label style={{ margin: 0 }}>Arah Flex (Direction)</label>
                        <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                      </div>
                      <select
                        value={getResponsiveVal('flexDirection', 'column')}
                        onChange={(e) => updateStyleProp('flexDirection', e.target.value)}
                      >
                        <option value="column">Vertical (Column)</option>
                        <option value="row">Horizontal (Row)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label style={{ margin: 0 }}>Justify Content (Posisi Sejajar Utama)</label>
                        <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                      </div>
                      <select
                        value={getResponsiveVal('justifyContent', 'center')}
                        onChange={(e) => updateStyleProp('justifyContent', e.target.value)}
                      >
                        <option value="flex-start">Awal (flex-start)</option>
                        <option value="center">Tengah (center)</option>
                        <option value="flex-end">Akhir (flex-end)</option>
                        <option value="space-between">Space Between (Sebarkan ke Pinggir)</option>
                        <option value="space-around">Space Around</option>
                        <option value="space-evenly">Space Evenly</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Align Items (Posisi Sejajar Silang)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>
                  <select
                    value={getResponsiveVal('alignItems', 'center')}
                    onChange={(e) => updateStyleProp('alignItems', e.target.value)}
                  >
                    <option value="stretch">Stretch (Penuhi)</option>
                    <option value="flex-start">Awal (flex-start)</option>
                    <option value="center">Tengah (center)</option>
                    <option value="flex-end">Akhir (flex-end)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>Jarak Antar Anak (Gap px)</label>
                  <input
                    type="number"
                    value={getResponsiveVal('gap', 12)}
                    onChange={(e) => updateStyleProp('gap', parseInt(e.target.value) || 0)}
                  />
                </div>
              </>
            )}

            {/* Dimension & Spacing Section */}
            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                📐 Dimensi &amp; Spacing {isContainer ? 'Container' : 'Elemen'}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Lebar (Width)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={getResponsiveVal('width', '')}
                  onChange={(e) => updateStyleProp('width', e.target.value)}
                  placeholder="100% atau 800px"
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Tinggi (Height)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={getResponsiveVal('height', '')}
                  onChange={(e) => updateStyleProp('height', e.target.value)}
                  placeholder="auto atau 100vh"
                />
              </div>

              {/* Padding Control */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Padding (Jarak Dalam)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={getResponsiveVal('padding', '')}
                  onChange={(e) => updateStyleProp('padding', e.target.value)}
                  placeholder="ex: 24px atau 60px 24px"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                  {['0px', '16px', '24px', '40px 20px', '60px 24px'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateStyleProp('padding', preset)}
                      style={{ padding: '2px 6px', fontSize: '0.68rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin Control */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Margin (Jarak Luar)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={getResponsiveVal('margin', '')}
                  onChange={(e) => updateStyleProp('margin', e.target.value)}
                  placeholder="ex: 0px 0px 24px 0px"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                  {['0px', '0px 0px 16px 0px', '0px 0px 24px 0px', '0px 0px 40px 0px', 'auto'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateStyleProp('margin', preset)}
                      style={{ padding: '2px 6px', fontSize: '0.68rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position, Alignment, Visibilitas & Overflow Section */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  📍 Posisi, Visibilitas &amp; Luapan
                </div>

                {/* Text Align Control */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Penyelarasan Teks (Text Align)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>
                  <select
                    value={getResponsiveVal('textAlign', '')}
                    onChange={(e) => updateStyleProp('textAlign', e.target.value)}
                  >
                    <option value="">Default (Inherit)</option>
                    <option value="left">Kiri (Left)</option>
                    <option value="center">Tengah (Center)</option>
                    <option value="right">Kanan (Right)</option>
                    <option value="justify">Rata Kiri Kanan (Justify)</option>
                  </select>
                </div>

                {/* Display / Visibility (Display: None) */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Status Tampilan (Display / Visibility)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>
                  <select
                    value={getResponsiveVal('display', '') === 'none' ? 'none' : 'visible'}
                    onChange={(e) => updateStyleProp('display', e.target.value === 'none' ? 'none' : '')}
                  >
                    <option value="visible">👁️ Tampilkan Elemen</option>
                    <option value="none">🙈 Sembunyikan Elemen (Display: None)</option>
                  </select>
                </div>

                {/* Position Control */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Posisi Elemen (Position)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>
                  <select
                    value={getResponsiveVal('position', 'static')}
                    onChange={(e) => updateStyleProp('position', e.target.value)}
                  >
                    <option value="static">Static (Default)</option>
                    <option value="relative">Relative (Relatif)</option>
                    <option value="absolute">Absolute (Absolut / Melayang)</option>
                    <option value="fixed">Fixed (Tetap Layar)</option>
                    <option value="sticky">Sticky (Menempel)</option>
                  </select>
                </div>

                {/* Conditional Position Offsets (Top, Right, Bottom, Left, Z-Index) */}
                {getResponsiveVal('position', 'static') !== 'static' && (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>
                        🎯 Offset Jarak Melayang (Positif / Negatif)
                      </span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.68rem' }}>Top</label>
                        <input
                          type="text"
                          value={getResponsiveVal('top', '')}
                          onChange={(e) => updateStyleProp('top', e.target.value)}
                          placeholder="ex: -20px atau 10%"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem' }}>Right</label>
                        <input
                          type="text"
                          value={getResponsiveVal('right', '')}
                          onChange={(e) => updateStyleProp('right', e.target.value)}
                          placeholder="ex: -10px atau 20px"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem' }}>Bottom</label>
                        <input
                          type="text"
                          value={getResponsiveVal('bottom', '')}
                          onChange={(e) => updateStyleProp('bottom', e.target.value)}
                          placeholder="ex: -15px atau 0px"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem' }}>Left</label>
                        <input
                          type="text"
                          value={getResponsiveVal('left', '')}
                          onChange={(e) => updateStyleProp('left', e.target.value)}
                          placeholder="ex: -50px atau 5px"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        />
                      </div>
                    </div>

                    {/* Quick Preset Buttons including Negative Values */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Preset Cepat Top (Positif &amp; Negatif):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {['-50px', '-20px', '-10px', '0px', '10px', '20px', '50px'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateStyleProp('top', preset)}
                            style={{ padding: '2px 5px', fontSize: '0.65rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            title={`Set Top ${preset}`}
                          >
                            Top {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ fontSize: '0.68rem' }}>Z-Index (Tingkat Layar)</label>
                      <input
                        type="number"
                        value={getResponsiveVal('zIndex', '')}
                        onChange={(e) => updateStyleProp('zIndex', e.target.value)}
                        placeholder="ex: -1, 1, 10, 999"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Overflow Control */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Luapan Konten (Overflow)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>
                  <select
                    value={getResponsiveVal('overflow', 'visible')}
                    onChange={(e) => updateStyleProp('overflow', e.target.value)}
                  >
                    <option value="visible">Visible (Tampilkan Luapan)</option>
                    <option value="hidden">Hidden (Potong Luapan)</option>
                    <option value="auto">Auto (Scroll Otomatis)</option>
                    <option value="scroll">Scroll (Selalu Scroll)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STYLE TAB */}
        {activeInspectorTab === 'style' && (
          <div>

            {(node.type === 'heading' || node.type === 'button' || node.type === 'text') && (
              <div className="form-group">
                <label>Isi Konten Teks</label>
                {node.type === 'text' ? (
                  <textarea
                    rows={3}
                    value={node.content || ''}
                    onChange={(e) => updateNodeProp('content', e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={node.content || ''}
                    onChange={(e) => updateNodeProp('content', e.target.value)}
                  />
                )}
                {/* Categorized Variable Inserter */}
                <div style={{ marginTop: '0.65rem', padding: '0.65rem', background: 'var(--bg-body)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                    ✨ Sisipkan Variabel Dinamis (Kategori Undangan)
                  </span>

                  {/* Category Dropdown Selector */}
                  <div style={{ marginBottom: '0.6rem' }}>
                    <select
                      value={selectedVarCat}
                      onChange={(e) => setSelectedVarCat(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#ffffff',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="all">🌐 Semua Kategori (Tampilkan Semua)</option>
                      {DYNAMIC_VARIABLE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variable Chips for active category */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {(selectedVarCat === 'all'
                      ? Array.from(new Map(DYNAMIC_VARIABLE_CATEGORIES.flatMap((c) => c.variables).map((v) => [v.tag, v])).values())
                      : DYNAMIC_VARIABLE_CATEGORIES.find((c) => c.id === selectedVarCat)?.variables || []
                    ).map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => insertVarTag(item.tag)}
                        title={`${item.label} - ${item.desc}`}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.tag}</span>
                        <span style={{ fontSize: '0.62rem', color: '#64748b' }}>({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {node.type === 'button' && (
              <>
                <div className="form-group">
                  <label>Aksi Tombol (Button Action)</label>
                  <select
                    value={node.buttonAction || 'none'}
                    onChange={(e) => updateNodeProp('buttonAction', e.target.value)}
                  >
                    <option value="none">Tanpa Aksi (Tombol Biasa)</option>
                    <option value="submit-rsvp">✉️ Kirim Form RSVP &amp; Ucapan</option>
                    <option value="open-cover">💌 Buka Undangan (Sampul)</option>
                    <option value="google-maps">📍 Buka Peta (Google Maps)</option>
                    <option value="save-calendar">📅 Simpan ke Google Calendar (Save the Date)</option>
                    <option value="open-instagram">📸 Buka Instagram ({'{ig_wanita}'}, {'{ig_pria}'}, dll.)</option>
                    <option value="open-tiktok">🎵 Buka TikTok ({'{tiktok_wanita}'}, {'{tiktok_pria}'})</option>
                    <option value="open-facebook">📘 Buka Facebook ({'{fb_wanita}'}, {'{fb_pria}'})</option>
                    <option value="open-whatsapp">💬 Chat WhatsApp ({'{wa_contact}'})</option>
                    <option value="open-youtube">🎥 Buka YouTube ({'{yt_organizer}'})</option>
                    <option value="open-url">🔗 Buka Link URL Kustom</option>
                  </select>
                </div>

                {['open-instagram', 'open-tiktok', 'open-facebook', 'open-whatsapp', 'open-youtube', 'open-url'].includes(node.buttonAction || '') && (
                  <div className="form-group" style={{ marginTop: '0.65rem', padding: '0.65rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Target Username / Link URL (Mendukung Variabel Dinamis)
                    </label>
                    <input
                      type="text"
                      value={node.buttonUrl || ''}
                      onChange={(e) => updateNodeProp('buttonUrl', e.target.value)}
                      placeholder={
                        node.buttonAction === 'open-instagram' ? 'Contoh: {ig_wanita} atau username' :
                        node.buttonAction === 'open-tiktok' ? 'Contoh: {tiktok_wanita} atau username' :
                        node.buttonAction === 'open-whatsapp' ? 'Contoh: {wa_contact} atau 081234567890' :
                        'Contoh: https://... atau {variabel}'
                      }
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                      ℹ️ Di mode pratinjau/undangan akhir, tombol ini akan otomatis disembunyikan jika akun/variabel di atas tidak diisi oleh pengguna.
                    </span>

                    {/* Quick Variable Insert Helper Bar for Social Handles */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {['{ig_wanita}', '{ig_pria}', '{tiktok_wanita}', '{tiktok_pria}', '{fb_wanita}', '{fb_pria}', '{wa_contact}', '{ig_organizer}'].map((varTag) => (
                        <button
                          key={varTag}
                          type="button"
                          onClick={() => updateNodeProp('buttonUrl', varTag)}
                          style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                        >
                          + {varTag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Button Icon & Placement Properties */}
                <div className="form-group" style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>
                    🎨 Ikon Tombol &amp; Posisi Penempatan
                  </label>

                  {/* Icon Input */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Ikon / Emoji Tombol:</label>
                    <input
                      type="text"
                      value={node.icon || ''}
                      onChange={(e) => updateNodeProp('icon', e.target.value)}
                      placeholder="Contoh: 📸, 🎵, 💬, 📍, ✉️"
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>

                  {/* Quick Icon Picker Bar */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Pilih Ikon Cepat:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {['📸', '🎵', '📘', '💬', '🎥', '✉️', '💌', '📍', '📅', '🔗', '❤️', '⭐', '🎉', '✨', '🎁', '🗺️', '🔔', '🚀'].map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => updateNodeProp('icon', ic)}
                          style={{
                            padding: '3px 7px',
                            fontSize: '0.85rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            backgroundColor: node.icon === ic ? 'var(--primary)' : '#ffffff',
                            color: node.icon === ic ? '#ffffff' : 'inherit',
                            cursor: 'pointer',
                          }}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Position & Gap Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Posisi Penempatan:</label>
                      <select
                        value={node.iconPosition || 'left'}
                        onChange={(e) => updateNodeProp('iconPosition', e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}
                      >
                        <option value="left">⬅️ Kiri Teks</option>
                        <option value="right">➡️ Kanan Teks</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Jarak Ikon (px):</label>
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={node.iconGap ?? 6}
                        onChange={(e) => updateNodeProp('iconGap', parseInt(e.target.value, 10) || 0)}
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {node.type === 'image' && (
              <>
                <div className="form-group">
                  <label>URL Gambar (Image Source)</label>
                  <input
                    type="text"
                    value={node.content || ''}
                    onChange={(e) => updateNodeProp('content', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: 'var(--studio-border)', marginBottom: '1rem' }}>
                  <label htmlFor="inp-showInGallery" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    🖼️ Tambahkan ke Galeri Lightbox
                  </label>
                  <input
                    type="checkbox"
                    id="inp-showInGallery"
                    checked={node.showInGallery || false}
                    onChange={(e) => updateNodeProp('showInGallery', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </>
            )}

            {node.type === 'slider' && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  🎠 Pengaturan Slide Gambar (Carousel Auto-Play)
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Interval Rotasi (Detik)</label>
                  <select
                    value={style.sliderInterval || 5}
                    onChange={(e) => updateStyleProp('sliderInterval', parseInt(e.target.value, 10) || 5)}
                  >
                    <option value={3}>3 Detik (Cepat)</option>
                    <option value={4}>4 Detik</option>
                    <option value={5}>5 Detik (Standar)</option>
                    <option value={8}>8 Detik (Lambat)</option>
                    <option value={10}>10 Detik (Sangat Lambat)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Efek Transisi Animasi</label>
                  <select
                    value={style.sliderEffect || 'fade'}
                    onChange={(e) => updateStyleProp('sliderEffect', e.target.value)}
                  >
                    <option value="fade">✨ Soft Crossfade</option>
                    <option value="kenburns">🔍 Ken-Burns (Zoom In)</option>
                    <option value="slide">➡️ Slide Horizontal</option>
                  </select>
                </div>

                <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0 }}>
                  💡 Slide Gambar otomatis memutar seluruh gambar dari widget Gambar yang tercentang <strong style={{ color: 'var(--primary)' }}>"Tambahkan ke Galeri Lightbox"</strong>.
                </p>
              </div>
            )}

            {node.type === 'input' && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  📝 Pengaturan Field Input Form
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Teks Placeholder</label>
                  <input
                    type="text"
                    value={node.placeholder || ''}
                    onChange={(e) => updateNodeProp('placeholder', e.target.value)}
                    placeholder="Masukkan nama lengkap Anda..."
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Nama Variabel Field (Input Name)</label>
                  <input
                    type="text"
                    value={node.inputName || ''}
                    onChange={(e) => updateNodeProp('inputName', e.target.value)}
                    placeholder="guest_name"
                  />
                </div>
              </div>
            )}

            {node.type === 'select' && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  📋 Pengaturan Field Select (Pilihan Dropdown)
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Opsi Pilihan (Dipisah Koma)</label>
                  <input
                    type="text"
                    value={node.selectOptions || ''}
                    onChange={(e) => updateNodeProp('selectOptions', e.target.value)}
                    placeholder="Hadir, Tidak Hadir, Ragu-ragu"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Nama Variabel Field (Input Name)</label>
                  <input
                    type="text"
                    value={node.inputName || ''}
                    onChange={(e) => updateNodeProp('inputName', e.target.value)}
                    placeholder="attendance"
                  />
                </div>
              </div>
            )}

            {node.type === 'textarea' && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ✍️ Pengaturan Field Textarea (Pesan Multi-Line)
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Teks Placeholder</label>
                  <input
                    type="text"
                    value={node.placeholder || ''}
                    onChange={(e) => updateNodeProp('placeholder', e.target.value)}
                    placeholder="Tuliskan ucapan & doa restu..."
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Nama Variabel Field (Input Name)</label>
                  <input
                    type="text"
                    value={node.inputName || ''}
                    onChange={(e) => updateNodeProp('inputName', e.target.value)}
                    placeholder="message"
                  />
                </div>
              </div>
            )}

            {/* Typography */}
            {!isContainer && (
              <>
                <div className="form-group">
                  <label>Font Family</label>
                  <FontEngineSelect
                    value={style.fontFamily || 'Plus Jakarta Sans'}
                    onChange={(font) => updateStyleProp('fontFamily', font)}
                  />
                </div>

                <div className="form-group">
                  <label>Ukuran Font (Font Size px)</label>
                  <input
                    type="number"
                    value={getResponsiveVal('fontSize', '')}
                    onChange={(e) => updateStyleProp('fontSize', parseInt(e.target.value) || '')}
                    placeholder="16"
                  />
                </div>

                <div className="form-group">
                  <label>Ketebalan Font (Font Weight)</label>
                  <select
                    value={getResponsiveVal('fontWeight', '400')}
                    onChange={(e) => updateStyleProp('fontWeight', e.target.value)}
                  >
                    <option value="300">300 (Light)</option>
                    <option value="400">400 (Normal)</option>
                    <option value="600">600 (Semi Bold)</option>
                    <option value="700">700 (Bold)</option>
                    <option value="800">800 (Extra Bold)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Warna Teks (Color)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={style.color && style.color.startsWith('#') ? style.color : '#000000'}
                      onChange={(e) => updateStyleProp('color', e.target.value)}
                      style={{ width: '40px', height: '36px', border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={style.color || ''}
                      onChange={(e) => updateStyleProp('color', e.target.value)}
                      placeholder="#db2777"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Background Color & Image */}
            <div className="form-group">
              <label>Warna Latar (Background Color)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={style.backgroundColor && style.backgroundColor.startsWith('#') ? style.backgroundColor : '#ffffff'}
                  onChange={(e) => updateStyleProp('backgroundColor', e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={style.backgroundColor || ''}
                  onChange={(e) => updateStyleProp('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {isContainer && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Tipe Latar Belakang (Background Mode)</label>
                  <select
                    value={style.bgType || 'normal'}
                    onChange={(e) => updateStyleProp('bgType', e.target.value)}
                  >
                    <option value="normal">🎨 Warna / Gambar Biasa</option>
                    <option value="gradient">🌈 Warna Gradien (Gradient)</option>
                    <option value="gallery-slideshow">🖼️ Slideshow Galeri Lightbox (Auto-Play)</option>
                  </select>
                </div>

                {style.bgType === 'gradient' && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Presets */}
                    <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                        🍧 Preset Gradien Instan:
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                        <button
                          type="button"
                          onClick={() => applyGradientPreset(['rgba(255,241,245,0.85)', 'rgba(253,226,236,0.6)', 'rgba(244,114,182,0.3)'], '135deg')}
                          style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(255,241,245,0.85), rgba(244,114,182,0.3))', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                        >
                          🌸 Soft Rose
                        </button>
                        <button
                          type="button"
                          onClick={() => applyGradientPreset(['#8B5E3C', '#C9A66B', '#E36397'], 'to right')}
                          style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'linear-gradient(to right, #8B5E3C, #E36397)', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                        >
                          ✨ Sunset Lux
                        </button>
                        <button
                          type="button"
                          onClick={() => applyGradientPreset(['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.9)', 'rgba(217,119,6,0.4)'], '135deg')}
                          style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, #0f172a, #d97706)', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                        >
                          🌑 Dark Gold
                        </button>
                        <button
                          type="button"
                          onClick={() => applyGradientPreset(['rgba(236,253,245,0.9)', 'rgba(167,243,208,0.6)', 'rgba(16,185,129,0.3)'], '135deg')}
                          style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, #ecfdf5, #10b981)', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                        >
                          🌿 Emerald Mint
                        </button>
                        <button
                          type="button"
                          onClick={() => applyGradientPreset(['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.2)'], '135deg')}
                          style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.2))', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                        >
                          💎 Glass Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => applyGradientPreset(['#fef3c7', '#fde68a', '#f59e0b'], 'to right')}
                          style={{ padding: '3px 6px', fontSize: '0.68rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'linear-gradient(to right, #fef3c7, #f59e0b)', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                        >
                          🌅 Golden Hour
                        </button>
                      </div>
                    </div>

                    {/* Direction */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Arah Gradien (Direction)</label>
                      <select
                        value={style.gradientDirection || 'to right'}
                        onChange={(e) => updateStyleProp('gradientDirection', e.target.value)}
                      >
                        <option value="to right">➡️ Horizontal (Ke Kanan)</option>
                        <option value="to bottom">⬇️ Vertikal (Ke Bawah)</option>
                        <option value="135deg">↘️ Diagonal Kanan Bawah (135°)</option>
                        <option value="45deg">↗️ Diagonal Kanan Atas (45°)</option>
                        <option value="radial">⭕ Lingkaran Tengah (Radial)</option>
                      </select>
                    </div>

                    {/* Multi-Color List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Daftar Warna Gradien ({currentGradientColors.length} Warna)</label>
                      {currentGradientColors.map((colorItem: string, idx: number) => {
                        const hexVal = colorItem.startsWith('#') ? colorItem : '#e36397';
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', width: '16px' }}>
                              #{idx + 1}
                            </span>
                            <input
                              type="color"
                              value={hexVal.length === 7 ? hexVal : '#e36397'}
                              onChange={(e) => updateGradientColorItem(idx, e.target.value)}
                              style={{ width: '34px', height: '32px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <input
                              type="text"
                              value={colorItem}
                              onChange={(e) => updateGradientColorItem(idx, e.target.value)}
                              placeholder="rgba(255,255,255,0.5) atau #ffffff"
                              style={{ fontSize: '0.75rem', padding: '4px 8px', flex: 1 }}
                            />
                            {currentGradientColors.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeGradientColorItem(idx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '2px' }}
                                title="Hapus Warna Ini"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={addGradientColorItem}
                        style={{
                          marginTop: '0.2rem',
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px dashed var(--primary)',
                          background: 'var(--bg-body)',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                        }}
                      >
                        ➕ Tambah Warna Gradien
                      </button>
                    </div>
                  </div>
                )}

                {style.bgType === 'gallery-slideshow' && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Interval Kecepatan Slideshow (Detik)</label>
                      <select
                        value={style.bgSlideshowInterval || 5}
                        onChange={(e) => updateStyleProp('bgSlideshowInterval', parseInt(e.target.value, 10) || 5)}
                      >
                        <option value={3}>3 Detik (Cepat)</option>
                        <option value={4}>4 Detik</option>
                        <option value={5}>5 Detik (Standar)</option>
                        <option value={8}>8 Detik (Lambat)</option>
                        <option value={10}>10 Detik (Sangat Lambat)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Efek Transisi Animasi</label>
                      <select
                        value={style.bgSlideshowEffect || 'fade'}
                        onChange={(e) => updateStyleProp('bgSlideshowEffect', e.target.value)}
                      >
                        <option value="fade">✨ Soft Crossfade</option>
                        <option value="kenburns">🔍 Ken-Burns (Zoom In)</option>
                        <option value="slide">➡️ Slide Horizontal</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Warna Overlay Transparan Latar (Agar Teks Jelas)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="color"
                          value={style.backgroundOverlayColor && style.backgroundOverlayColor.startsWith('#') ? style.backgroundOverlayColor : '#000000'}
                          onChange={(e) => updateStyleProp('backgroundOverlayColor', e.target.value)}
                          style={{ width: '40px', height: '36px', border: 'none', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={style.backgroundOverlayColor || ''}
                          onChange={(e) => updateStyleProp('backgroundOverlayColor', e.target.value)}
                          placeholder="rgba(0,0,0,0.4)"
                        />
                      </div>
                    </div>

                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0 }}>
                      💡 Container akan otomatis memutar seluruh foto yang tercentang <strong style={{ color: 'var(--primary)' }}>"Tambahkan ke Galeri Lightbox"</strong>.
                    </p>
                  </div>
                )}

                {style.bgType !== 'gradient' && style.bgType !== 'gallery-slideshow' && (
                  <div className="form-group" style={{ margin: 0, marginTop: '0.75rem' }}>
                    <label>Gambar Latar (Background Image URL)</label>
                    <input
                      type="text"
                      value={getResponsiveVal('backgroundImage', '')}
                      onChange={(e) => updateStyleProp('backgroundImage', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Border Radius (px)</label>
              <input
                type="number"
                value={style.borderRadius || ''}
                onChange={(e) => updateStyleProp('borderRadius', parseInt(e.target.value) || '')}
                placeholder="12"
              />
            </div>

            {/* Box Shadow & Glassmorphism Section */}
            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                ✨ Efek Bayangan &amp; Glassmorphism
              </div>

              {/* Quick Glassmorphism Presets */}
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  🍧 Preset Glassmorphism Instan:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      updateMultipleStyleProps({
                        backgroundColor: 'rgba(255, 255, 255, 0.45)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      });
                    }}
                    style={{ padding: '4px 6px', fontSize: '0.68rem', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    ✨ Soft Glass
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateMultipleStyleProps({
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      });
                    }}
                    style={{ padding: '4px 6px', fontSize: '0.68rem', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    🧊 Heavy Blur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateMultipleStyleProps({
                        backgroundColor: 'rgba(18, 18, 18, 0.65)',
                        backdropFilter: 'blur(14px)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        borderColor: 'rgba(255, 255, 255, 0.18)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      });
                    }}
                    style={{ padding: '4px 6px', fontSize: '0.68rem', background: 'rgba(18,18,18,0.85)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    🌑 Dark Glass
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateMultipleStyleProps({
                        backgroundColor: 'rgba(227, 99, 151, 0.2)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px 0 rgba(227, 99, 151, 0.25)',
                        borderColor: 'rgba(255, 255, 255, 0.35)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      });
                    }}
                    style={{ padding: '4px 6px', fontSize: '0.68rem', background: 'rgba(227,99,151,0.25)', border: '1px solid var(--primary)', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    💖 Rose Gold Glass
                  </button>
                </div>
              </div>

              {/* Box Shadow Input */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Bayangan (Box Shadow)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={getResponsiveVal('boxShadow', '')}
                  onChange={(e) => updateStyleProp('boxShadow', e.target.value)}
                  placeholder="ex: 0 8px 32px rgba(0,0,0,0.15)"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                  {['none', '0 4px 6px -1px rgba(0,0,0,0.1)', '0 10px 15px -3px rgba(0,0,0,0.1)', '0 20px 25px -5px rgba(0,0,0,0.1)'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateStyleProp('boxShadow', preset)}
                      style={{ padding: '2px 6px', fontSize: '0.68rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {preset === 'none' ? 'Clear Shadow' : preset.substring(0, 14) + '...'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Backdrop Filter (Glassmorphism Blur) Input */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Filter Buram (Backdrop Filter / Blur)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>
                <input
                  type="text"
                  value={getResponsiveVal('backdropFilter', '')}
                  onChange={(e) => updateStyleProp('backdropFilter', e.target.value)}
                  placeholder="ex: blur(10px) atau blur(16px)"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                  {['none', 'blur(6px)', 'blur(10px)', 'blur(16px)', 'blur(24px)'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateStyleProp('backdropFilter', preset)}
                      style={{ padding: '2px 6px', fontSize: '0.68rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeInspectorTab === 'advanced' && (
          <div>
            <div className="form-group">
              <label>Animasi Muncul (Entrance Animation)</label>
              <select
                value={style.animationType || 'none'}
                onChange={(e) => updateStyleProp('animationType', e.target.value)}
              >
                <option value="none">Tanpa Animasi</option>
                <option value="anim-fade-in">Fade In</option>
                <option value="anim-fade-in-up">Fade In Up</option>
                <option value="anim-fade-in-down">Fade In Down</option>
                <option value="anim-zoom-in">Zoom In</option>
                <option value="anim-bounce-in">Bounce In</option>
                <option value="anim-pulse">Pulse</option>
              </select>
            </div>

            <div className="form-group">
              <label>Shape Divider Bawah (Bottom Divider)</label>
              <select
                value={(style.shapeDividerBottomType as string) || 'none'}
                onChange={(e) => updateStyleProp('shapeDividerBottomType', e.target.value)}
              >
                <option value="none">Tanpa Shape Divider</option>
                <option value="wave">Gelombang (Wave)</option>
                <option value="slant">Miring (Slant)</option>
                <option value="curve">Lengkung (Curve)</option>
              </select>
            </div>

            {/* Toggle Sembunyikan Scrollbar (Hide Scrollbar) */}
            <div className="form-group" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: 'var(--studio-border)' }}>
              <label htmlFor="inp-hideScrollbar-node" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                🙈 Sembunyikan Scrollbar (Hide Scrollbar)
              </label>
              <input
                type="checkbox"
                id="inp-hideScrollbar-node"
                checked={style.hideScrollbar || false}
                onChange={(e) => updateStyleProp('hideScrollbar', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
