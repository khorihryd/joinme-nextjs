'use client';

import React, { useState } from 'react';
import { StudioNode, DYNAMIC_VARIABLE_CATEGORIES, SECTION_DEFINITIONS, SectionType, GlobalStyles, GlobalColorTokens } from '@/types';
import { useStudioStore, findParentNode, DEFAULT_GLOBAL_STYLES } from '@/store/studio-store';
import { FontEngineSelect } from './FontEngine';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/image-compression';
import { MediaLibraryModal } from './MediaLibraryModal';
import { getRegisteredFunctionsList, FUNCTION_REGISTRY } from '@/utils/customFunctions';
import { IconPickerModal } from './IconPickerModal';
import { ImageCropModal } from './ImageCropModal';
import { ImageBgRemovalModal } from './ImageBgRemovalModal';
import { normalizeSvgString, isSvgMarkup } from '@/utils/svgNormalizer';

interface TokenColorPickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  globalStyles: GlobalStyles;
}

export function TokenColorPicker({ label, value, onChange, globalStyles }: TokenColorPickerProps) {
  const colors = globalStyles.colors || DEFAULT_GLOBAL_STYLES.colors!;

  const tokenSwatches: { key: keyof GlobalColorTokens; name: string; varName: string }[] = [
    { key: 'primary', name: 'Primary', varName: 'var(--global-primary)' },
    { key: 'secondary', name: 'Secondary', varName: 'var(--global-secondary)' },
    { key: 'background', name: 'Background', varName: 'var(--global-background)' },
    { key: 'surface', name: 'Surface', varName: 'var(--global-surface)' },
    { key: 'textPrimary', name: 'Text Primary', varName: 'var(--global-text-primary)' },
    { key: 'textSecondary', name: 'Text Secondary', varName: 'var(--global-text-secondary)' },
    { key: 'accentLuxury', name: 'Accent', varName: 'var(--global-accent-luxury)' },
    { key: 'border', name: 'Border', varName: 'var(--global-border)' },
  ];

  let resolvedHex = value || '#000000';
  let activeTokenName = '';

  for (const sw of tokenSwatches) {
    if (value === sw.varName || value === `global:${sw.key}` || value === sw.key) {
      resolvedHex = colors[sw.key] || '#000000';
      activeTokenName = sw.name;
      break;
    }
  }

  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <label style={{ margin: 0 }}>{label}</label>
        {activeTokenName ? (
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            🔗 Token: {activeTokenName}
          </span>
        ) : (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Custom</span>
        )}
      </div>

      {/* 8 Color Swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '0.45rem' }}>
        {tokenSwatches.map((sw) => {
          const isSelected = value === sw.varName || value === `global:${sw.key}` || value === sw.key;
          const hex = colors[sw.key] || '#cccccc';
          return (
            <button
              key={sw.key}
              type="button"
              onClick={() => onChange(sw.varName)}
              title={`${sw.name} (${hex})`}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: hex,
                border: isSelected ? '2.5px solid var(--primary, #e36397)' : '1.5px solid var(--border-color)',
                outline: isSelected ? '2px solid rgba(227,99,151,0.4)' : 'none',
                outlineOffset: '1px',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                transition: 'transform 0.15s ease',
              }}
            />
          );
        })}
      </div>

      {/* Hex Picker & Custom Input */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="color"
          value={resolvedHex && resolvedHex.startsWith('#') ? resolvedHex : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '38px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex: var(--global-primary) atau #db2777"
          style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
}

interface InspectorPanelProps {
  node: StudioNode | null;
  onUpdateNode: (updatedNode: StudioNode) => void;
  onInsertVariable?: (varTag: string) => void;
}

export const VERSE_PRESETS = [
  {
    id: 'rum-21',
    label: '🌙 QS. Ar-Rum: 21 (Pernikahan Islami)',
    bismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translation: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang.',
    surah: 'QS. Ar-Rum: 21',
  },
  {
    id: 'nisa-1',
    label: '🌙 QS. An-Nisa: 1 (Ketakwaan & Pasangan)',
    bismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    arabic: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا',
    translation: 'Wahai manusia! Bertakwalah kepada Tuhanmu yang telah menciptakan kamu dari diri yang satu, dan daripadanya Allah menciptakan pasangannya.',
    surah: 'QS. An-Nisa: 1',
  },
  {
    id: 'zariyat-49',
    label: '🌙 QS. Az-Zariyat: 49 (Penciptaan Berpasangan)',
    bismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    arabic: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ',
    translation: 'Dan segala sesuatu Kami ciptakan berpasang-pasangan supaya kamu mengingat kebesaran Allah.',
    surah: 'QS. Az-Zariyat: 49',
  },
  {
    id: 'korintus-13',
    label: '✝️ 1 Korintus 13: 4-7 (Kasih Kristiani)',
    bismillah: '✝️ Ayat Suci Alkitab',
    arabic: 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.',
    translation: 'Ia tidak melakukan yang tidak sopan dan tidak mencari keuntungan diri sendiri. Ia tidak pemarah dan tidak menyimpan kesalahan orang lain.',
    surah: '1 Korintus 13: 4-7',
  },
  {
    id: 'matius-19',
    label: '✝️ Matius 19: 6 (Penyatuan Allah)',
    bismillah: '✝️ Demikianlah Mereka Bukan Lagi Dua, Melainkan Satu',
    arabic: 'Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.',
    translation: 'Kiranya Tuhan memberkati dan melindungi pernikahan suci ini dalam kasih-Nya yang abadi.',
    surah: 'Matius 19: 6',
  },
  {
    id: 'doa-umum',
    label: '🕊️ Doa Restu & Harapan Umum',
    bismillah: '✨ Doa Restu & Harapan Kebahagiaan',
    arabic: 'Semoga Keberkahan & Kedamaian Senantiasa Menyertai Langkah Kita',
    translation: 'Tanpa mengurangi rasa hormat, kami memohon doa restu Bapak/Ibu/Saudara/i sekalian demi kelancaran dan keberkahan acara pernikahan ini.',
    surah: 'Doa Restu Keluarga',
  },
];

export const THANK_YOU_PRESETS = [
  {
    id: 'islamic-1',
    label: '🌙 Islami (Kehormatan, Kehadiran & Doa Restu)',
    text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai. Wassalamu’alaikum Warahmatullahi Wabarakatuh.',
  },
  {
    id: 'general-1',
    label: '✨ Umum / Nasional (Rasa Terima Kasih Kebersamaan)',
    text: 'Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i sekalian, kami mengucapkan terima kasih yang sebesar-besarnya. Semoga kebaikan dan kebahagiaan senantiasa menyertai kita semua.',
  },
  {
    id: 'christian-1',
    label: '✝️ Kristiani (Kasih & Karunia Tuhan)',
    text: 'Kiranya Kasih dan Karunia Tuhan Kita Yesus Kristus senantiasa menyertai kita sekalian. Terima kasih atas kehadiran, kasih, dan doa restu Bapak/Ibu/Saudara/i.',
  },
  {
    id: 'english-1',
    label: '🌐 English (Warm Closing Message)',
    text: 'Your presence and prayers at our wedding will bring us immense joy. Thank you for being a part of our special journey.',
  },
];

export function InspectorPanel({ node, onUpdateNode }: InspectorPanelProps) {
  const [selectedVarCat, setSelectedVarCat] = useState<string>('all');
  const [copySourceId, setCopySourceId] = useState<string>('');
  const [copyType, setCopyType] = useState<'all' | 'bg' | 'border' | 'spacing'>('all');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [mediaModalFolders, setMediaModalFolders] = useState<string[]>(['studio']);
  const [onMediaSelectCallback, setOnMediaSelectCallback] = useState<((url: string) => void) | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState<boolean>(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  const [cropModalTitle, setCropModalTitle] = useState<string>('Crop & Sesuaikan Gambar');
  const [onCropCallback, setOnCropCallback] = useState<((url: string) => void) | null>(null);

  const openMediaLibrary = (foldersList: string[], callback: (url: string) => void) => {
    setMediaModalFolders(foldersList);
    setOnMediaSelectCallback(() => callback);
    setIsMediaModalOpen(true);
  };

  const openCropModal = (url: string, callback: (newUrl: string) => void, title?: string) => {
    if (!url) return;
    setCropImageUrl(url);
    setOnCropCallback(() => callback);
    if (title) setCropModalTitle(title);
    setIsCropModalOpen(true);
  };

  // Background Removal Modal State
  const [isBgRemovalModalOpen, setIsBgRemovalModalOpen] = useState<boolean>(false);
  const [bgRemovalImageUrl, setBgRemovalImageUrl] = useState<string>('');
  const [bgRemovalModalTitle, setBgRemovalModalTitle] = useState<string>('Hapus Background Gambar');
  const [onBgRemovalCallback, setOnBgRemovalCallback] = useState<((url: string) => void) | null>(null);

  const openBgRemovalModal = (url: string, callback: (newUrl: string) => void, title?: string) => {
    if (!url) return;
    setBgRemovalImageUrl(url);
    setOnBgRemovalCallback(() => callback);
    if (title) setBgRemovalModalTitle(title);
    setIsBgRemovalModalOpen(true);
  };

  const getAllContainers = (nodeList: StudioNode[]): StudioNode[] => {
    let result: StudioNode[] = [];
    for (const n of nodeList) {
      if (n.type === 'container') {
        result.push(n);
      }
      if (n.children && n.children.length > 0) {
        result = [...result, ...getAllContainers(n.children)];
      }
    }
    return result;
  };

  const {
    activeInspectorTab,
    setActiveInspectorTab,
    viewportMode,
    nodes,
    selectedNodeId,
    globalStyles,
    updateGlobalStyles,
    setSidebarTab,
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

        {/* Global Design Tokens Quick Banner */}
        <div style={{ margin: '0.75rem 1rem 0 1rem', padding: '0.65rem 0.75rem', background: 'linear-gradient(135deg, rgba(227, 99, 151, 0.1), rgba(139, 94, 60, 0.1))', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)' }}>🎨 Global Design Tokens</div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>8 Palet Warna, Font &amp; Hierarki Spasi</div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarTab('global')}
            style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Buka Menu 🎨
          </button>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.45rem' }}>
                  {[
                    { label: '0', val: '0px' },
                    { label: 'XS', val: globalStyles.spacing?.paddingXS || '8px' },
                    { label: 'SM', val: globalStyles.spacing?.paddingSM || '12px' },
                    { label: 'MD', val: globalStyles.spacing?.paddingMD || '16px' },
                    { label: 'LG', val: globalStyles.spacing?.paddingLG || '24px' },
                    { label: 'XL', val: globalStyles.spacing?.paddingXL || '40px' },
                    { label: '2XL', val: globalStyles.spacing?.padding2XL || '60px' },
                    { label: '40px 24px', val: '40px 24px' },
                    { label: '60px 24px', val: '60px 24px' },
                  ].map((p) => {
                    const isSelected = globalStyles.padding === p.val;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateGlobalStyles({ padding: p.val })}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.45rem' }}>
                  {[
                    { label: '0', val: '0px' },
                    { label: 'XS', val: globalStyles.spacing?.marginXS || '4px' },
                    { label: 'SM', val: globalStyles.spacing?.marginSM || '8px' },
                    { label: 'MD', val: globalStyles.spacing?.marginMD || '16px' },
                    { label: 'LG', val: globalStyles.spacing?.marginLG || '24px' },
                    { label: 'XL', val: globalStyles.spacing?.marginXL || '40px' },
                    { label: '2XL', val: globalStyles.spacing?.margin2XL || '60px' },
                    { label: '0 0 24px 0', val: '0px 0px 24px 0px' },
                    { label: '20px auto', val: '20px auto' },
                  ].map((p) => {
                    const isSelected = globalStyles.margin === p.val;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateGlobalStyles({ margin: p.val })}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
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
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    type="text"
                    value={globalStyles.backgroundImage || ''}
                    onChange={(e) => updateGlobalStyles({ backgroundImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    style={{ flex: 1 }}
                  />
                  {globalStyles.backgroundImage && (
                    <button
                      type="button"
                      onClick={() =>
                        openCropModal(
                          globalStyles.backgroundImage || '',
                          (url) => updateGlobalStyles({ backgroundImage: url }),
                          'Crop Background Canvas'
                        )
                      }
                      style={{
                        padding: '6px 10px',
                        background: 'var(--bg-card)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap',
                        margin: 0,
                      }}
                      title="Crop background canvas ini"
                    >
                      ✂️ Crop
                    </button>
                  )}
                  {globalStyles.backgroundImage && (
                    <button
                      type="button"
                      onClick={() =>
                        openBgRemovalModal(
                          globalStyles.backgroundImage || '',
                          (url) => updateGlobalStyles({ backgroundImage: url }),
                          'Hapus Background Canvas'
                        )
                      }
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(227, 99, 151, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(227, 99, 151, 0.4)',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap',
                        margin: 0,
                      }}
                      title="Hapus background gambar canvas menjadi transparan (AI / Chroma)"
                    >
                      🪄 Hapus BG
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openMediaLibrary(['studio'], (url) => updateGlobalStyles({ backgroundImage: url }))}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      margin: 0,
                      border: 'none',
                    }}
                  >
                    📁 Upload
                  </button>
                </div>
                {/* Dynamic Global Background Image Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.55rem', marginBottom: '0.45rem' }}>
                  <label style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    ✨ Latar Belakang Canvas Dinamis
                  </label>
                  <input
                    type="checkbox"
                    checked={globalStyles.isBgDynamic || false}
                    onChange={(e) => {
                      updateGlobalStyles({ isBgDynamic: e.target.checked });
                      if (e.target.checked && !globalStyles.backgroundImageBinding) {
                        updateGlobalStyles({ backgroundImageBinding: 'cover_photo' });
                      }
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {globalStyles.isBgDynamic && (
                  <div style={{ marginTop: '0.4rem', marginBottom: '0.45rem' }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                      Pilih/Ketik Variabel Latar Belakang Canvas:
                    </label>
                    {(() => {
                      const isPreset = ['fotoPria', 'fotoWanita', 'cover_photo'].includes(globalStyles.backgroundImageBinding || '');
                      const selectVal = isPreset ? (globalStyles.backgroundImageBinding || 'cover_photo') : 'custom';
                      return (
                        <>
                          <select
                            value={selectVal}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                updateGlobalStyles({ backgroundImageBinding: 'custom_variabel' });
                              } else {
                                updateGlobalStyles({ backgroundImageBinding: val });
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.4rem 0.5rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: '#fff',
                            }}
                          >
                            <option value="cover_photo">🖼️ cover_photo (Foto Sampul Utama / Couple)</option>
                            <option value="fotoPria">🤵 fotoPria (Foto Mempelai Pria)</option>
                            <option value="fotoWanita">👰 fotoWanita (Foto Mempelai Wanita)</option>
                            <option value="custom">✍️ Kustom / Nama Variabel Lain...</option>
                          </select>

                          {selectVal === 'custom' && (
                            <input
                              type="text"
                              placeholder="misal: foto_background_kustom"
                              value={globalStyles.backgroundImageBinding || ''}
                              onChange={(e) => updateGlobalStyles({ backgroundImageBinding: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                              style={{
                                width: '100%',
                                padding: '0.4rem 0.5rem',
                                fontSize: '0.78rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                marginTop: '0.35rem',
                                background: '#fff',
                                color: '#000',
                              }}
                            />
                          )}
                        </>
                      );
                    })()}
                    <span style={{ fontSize: '0.64rem', color: '#64748b', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                      💡 URL di atas hanya digunakan sebagai fallback/pratinjau studio. Latar belakang canvas akan otomatis digantikan oleh berkas yang diunggah pengguna untuk variabel ini.
                    </span>
                  </div>
                )}
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
                {/* Section Mapping Property */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-body)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    🏷️ Tipe Section Undangan (Section Mapping)
                  </label>
                  <select
                    value={node.sectionType || ''}
                    onChange={(e) => {
                      const newSecType = e.target.value as SectionType | '';
                      if (newSecType) {
                        const existingNodeWithSec = nodes.find((n) => n.id !== node.id && n.sectionType === newSecType);
                        if (existingNodeWithSec) {
                          alert(`Perhatian: Section "${newSecType}" sudah digunakan pada container "${existingNodeWithSec.label || existingNodeWithSec.id}". 1 tipe section hanya dapat dipetakan ke 1 container.`);
                          return;
                        }
                      }
                      updateNodeProp('sectionType', newSecType || undefined);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">-- Bukan Root Section (Container Biasa) --</option>
                    {SECTION_DEFINITIONS.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.icon} {sec.label} ({sec.id})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    💡 Menentukan section apa yang diwakili container ini pada tab Editor Undangan pengguna.
                  </span>
                </div>

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

                {/* 1-Click Layout & Text Alignment Presets */}
                <div style={{ marginBottom: '1rem', padding: '0.65rem', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.45rem' }}>
                    🎯 Penyelarasan Instan (Layout &amp; Teks)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {[
                      { label: '👈 Kiri', align: 'flex-start', txtAlign: 'left' },
                      { label: '🎯 Tengah', align: 'center', txtAlign: 'center' },
                      { label: '👉 Kanan', align: 'flex-end', txtAlign: 'right' },
                      { label: '↔️ Stretch', align: 'stretch', txtAlign: undefined },
                    ].map((btn) => {
                      const currentAlign = getResponsiveVal('alignItems', 'center');
                      const currentTxtAlign = getResponsiveVal('textAlign', '');
                      const isActive = currentAlign === btn.align && (btn.txtAlign === undefined || currentTxtAlign === btn.txtAlign);

                      return (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => {
                            const updates: Record<string, any> = { alignItems: btn.align };
                            if (btn.txtAlign !== undefined) {
                              updates.textAlign = btn.txtAlign;
                            }
                            updateMultipleStyleProps(updates);
                          }}
                          style={{
                            padding: '5px 4px',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                            backgroundColor: isActive ? 'var(--primary-light, #fff0f5)' : 'var(--bg-card)',
                            color: isActive ? 'var(--primary)' : 'var(--text-main)',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                    💡 Tips: Gunakan tombol <strong>Penyelarasan Instan</strong> di atas untuk sekaligus menggeser kontainer dan teks ke Kiri / Tengah / Kanan.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ margin: 0 }}>Jarak Antar Anak (Gap px)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>
                        {deviceIcon} {viewportMode.toUpperCase()}
                      </span>
                      {viewportMode !== 'desktop' && (style[viewportMode === 'mobile' ? 'gapMobile' : 'gapTablet'] !== undefined) && (
                        <button
                          type="button"
                          onClick={() => updateStyleProp('gap', undefined)}
                          title="Reset ke nilai bawaan Desktop"
                          style={{
                            fontSize: '0.64rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: '#ffffff',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                        >
                          Auto (Inherit)
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={getResponsiveVal('gap', 12)}
                    onChange={(e) => updateStyleProp('gap', parseInt(e.target.value, 10) || 0)}
                  />
                  {viewportMode !== 'desktop' && (style[viewportMode === 'mobile' ? 'gapMobile' : 'gapTablet'] === undefined) && (
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                      *(Mewarisi nilai {style.gapTablet !== undefined && viewportMode === 'mobile' ? 'Tablet' : 'Desktop'}: {getResponsiveVal('gap', 12)}px)
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Flex Shrink & Flex Grow Controls (All Nodes) */}
            <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                🗜️ Perilaku Fleksibel (Flex Shrink / Grow)
              </div>

              {/* Quick Toggle Button for flexShrink */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Penyusutan Fleksibel (Flex Shrink)</label>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => updateStyleProp('flexShrink', 0)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: Number(getResponsiveVal('flexShrink', 0)) === 0 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: Number(getResponsiveVal('flexShrink', 0)) === 0 ? 'var(--primary-light, #fff0f5)' : 'var(--bg-card)',
                      color: Number(getResponsiveVal('flexShrink', 0)) === 0 ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    🔒 Cegah Menyusut (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStyleProp('flexShrink', 1)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: Number(getResponsiveVal('flexShrink', 0)) === 1 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: Number(getResponsiveVal('flexShrink', 0)) === 1 ? 'var(--primary-light, #fff0f5)' : 'var(--bg-card)',
                      color: Number(getResponsiveVal('flexShrink', 0)) === 1 ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    ↕️ Izinkan Menyusut (1)
                  </button>
                </div>

                <select
                  value={Number(getResponsiveVal('flexShrink', 0))}
                  onChange={(e) => updateStyleProp('flexShrink', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}
                >
                  <option value={0}>0 — Cegah Menyusut (Tinggi/Lebar Alami Utuh &amp; Stabil)</option>
                  <option value={1}>1 — Izinkan Menyusut (Default Flex Behavior)</option>
                </select>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  💡 Pilih <strong>0 (Cegah Menyusut)</strong> agar kontainer/elemen anak tidak pernah gepeng saat tinggi kontainer induknya sempit.
                </span>
              </div>

              {/* Flex Order Control */}
              <div className="form-group" style={{ marginTop: '1rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Urutan Visual (Flex Order)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {deviceIcon} {viewportMode.toUpperCase()}
                    </span>
                    {viewportMode !== 'desktop' && (style[viewportMode === 'mobile' ? 'orderMobile' : 'orderTablet'] !== undefined) && (
                      <button
                        type="button"
                        onClick={() => updateStyleProp('order', undefined)}
                        title="Reset ke nilai bawaan Desktop"
                        style={{
                          fontSize: '0.64rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#ffffff',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        Auto (Inherit)
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="0 (Default)"
                  value={getResponsiveVal('order', '')}
                  onChange={(e) => updateStyleProp('order', e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}
                />
                <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.35rem' }}>
                  *(Nilai kecil tampil lebih awal, contoh: <strong>-1</strong> tampil paling atas/kiri, <strong>1</strong> tampil di bawah/kanan)
                  {viewportMode !== 'desktop' && (style[viewportMode === 'mobile' ? 'orderMobile' : 'orderTablet'] === undefined) && (
                    <> • Mewarisi {style.orderTablet !== undefined && viewportMode === 'mobile' ? 'Tablet' : 'Desktop'}: {getResponsiveVal('order', 0)}</>
                  )}
                </span>
              </div>
            </div>

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
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.45rem' }}>
                  {[
                    { label: '0', val: '0px' },
                    { label: 'XS', val: globalStyles.spacing?.paddingXS || '8px' },
                    { label: 'SM', val: globalStyles.spacing?.paddingSM || '12px' },
                    { label: 'MD', val: globalStyles.spacing?.paddingMD || '16px' },
                    { label: 'LG', val: globalStyles.spacing?.paddingLG || '24px' },
                    { label: 'XL', val: globalStyles.spacing?.paddingXL || '40px' },
                    { label: '2XL', val: globalStyles.spacing?.padding2XL || '60px' },
                    { label: '40px 20px', val: '40px 20px' },
                    { label: '60px 24px', val: '60px 24px' },
                  ].map((p) => {
                    const currentPadding = getResponsiveVal('padding', '');
                    const isSelected = currentPadding === p.val;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateStyleProp('padding', p.val)}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Margin Control */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.45rem' }}>
                  {[
                    { label: '0', val: '0px' },
                    { label: 'XS', val: globalStyles.spacing?.marginXS || '4px' },
                    { label: 'SM', val: globalStyles.spacing?.marginSM || '8px' },
                    { label: 'MD', val: globalStyles.spacing?.marginMD || '16px' },
                    { label: 'LG', val: globalStyles.spacing?.marginLG || '24px' },
                    { label: 'XL', val: globalStyles.spacing?.marginXL || '40px' },
                    { label: '2XL', val: globalStyles.spacing?.margin2XL || '60px' },
                    { label: '0 0 16px 0', val: '0px 0px 16px 0px' },
                    { label: '0 0 24px 0', val: '0px 0px 24px 0px' },
                    { label: '0 0 40px 0', val: '0px 0px 40px 0px' },
                    { label: 'auto', val: 'auto' },
                  ].map((p) => {
                    const currentMargin = getResponsiveVal('margin', '');
                    const isSelected = currentMargin === p.val;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateStyleProp('margin', p.val)}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
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
                  {['fixed', 'sticky'].includes(getResponsiveVal('position', 'static')) && (
                    <span style={{ fontSize: '0.66rem', color: '#0284c7', display: 'block', marginTop: '0.35rem', lineHeight: '1.4' }}>
                      ℹ️ Posisi <b>{getResponsiveVal('position', 'static')}</b> terkunci di dalam bingkai Workplace Canvas Studio agar tidak menutupi UI menu Admin.
                    </span>
                  )}
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
            {node.type === 'container' && (() => {
              const otherContainers = getAllContainers(nodes)
                .filter((c) => c.id !== node.id)
                .filter((value, index, self) => self.findIndex((t) => t.id === value.id) === index);
              if (otherContainers.length === 0) return null;

              return (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(139, 94, 60, 0.05), rgba(227, 99, 151, 0.05))',
                  borderRadius: '10px',
                  border: '1px dashed var(--primary)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    📋 Salin Desain dari Kontainer Lain
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pilih Kontainer Sumber:</label>
                    <select
                      value={copySourceId}
                      onChange={(e) => setCopySourceId(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', backgroundColor: '#fff', border: '1px solid var(--border-color)' }}
                    >
                      <option value="">-- Pilih Kontainer --</option>
                      {otherContainers.map((c) => {
                        const name = c.label || c.content?.substring(0, 15) || `Container (${c.id})`;
                        return <option key={c.id} value={c.id}>{name}</option>;
                      })}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Kategori Gaya yang Disalin:</label>
                    <select
                      value={copyType}
                      onChange={(e) => setCopyType(e.target.value as any)}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', backgroundColor: '#fff', border: '1px solid var(--border-color)' }}
                    >
                      <option value="all">⭐ Semua Gaya (Latar Belakang, Spasi, Border)</option>
                      <option value="bg">🎨 Hanya Latar Belakang (Warna, Gambar, Gradien)</option>
                      <option value="spacing">📐 Hanya Padding &amp; Margin (Spasi)</option>
                      <option value="border">🔲 Hanya Border &amp; Corner Radius (Sudut)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!copySourceId}
                    onClick={() => {
                      const srcNode = otherContainers.find(c => c.id === copySourceId);
                      if (!srcNode || !srcNode.style) return;
                      const currentStyle = { ...node.style };
                      const srcStyle = srcNode.style;
                      let updatedStyle = { ...currentStyle };

                      if (copyType === 'all') {
                        updatedStyle = { ...currentStyle, ...srcStyle };
                      } else if (copyType === 'bg') {
                        updatedStyle = {
                          ...currentStyle,
                          bgType: srcStyle.bgType,
                          backgroundColor: srcStyle.backgroundColor,
                          backgroundImage: srcStyle.backgroundImage,
                          isBgDynamic: srcStyle.isBgDynamic,
                          backgroundImageBinding: srcStyle.backgroundImageBinding,
                          gradientColor1: srcStyle.gradientColor1,
                          gradientColor2: srcStyle.gradientColor2,
                          gradientDirection: srcStyle.gradientDirection,
                          gradientColors: srcStyle.gradientColors,
                          bgSlideshowInterval: srcStyle.bgSlideshowInterval,
                          bgSlideshowEffect: srcStyle.bgSlideshowEffect,
                          backgroundOverlayColor: srcStyle.backgroundOverlayColor,
                        };
                      } else if (copyType === 'spacing') {
                        updatedStyle = {
                          ...currentStyle,
                          padding: srcStyle.padding,
                          margin: srcStyle.margin,
                          paddingDesktop: srcStyle.paddingDesktop,
                          paddingTablet: srcStyle.paddingTablet,
                          paddingMobile: srcStyle.paddingMobile,
                          marginDesktop: srcStyle.marginDesktop,
                          marginTablet: srcStyle.marginTablet,
                          marginMobile: srcStyle.marginMobile,
                        };
                      } else if (copyType === 'border') {
                        updatedStyle = {
                          ...currentStyle,
                          borderWidth: srcStyle.borderWidth,
                          borderColor: srcStyle.borderColor,
                          borderStyle: srcStyle.borderStyle,
                          borderRadius: srcStyle.borderRadius,
                          useIndividualRadius: srcStyle.useIndividualRadius,
                          borderTopLeftRadius: srcStyle.borderTopLeftRadius,
                          borderTopRightRadius: srcStyle.borderTopRightRadius,
                          borderBottomRightRadius: srcStyle.borderBottomRightRadius,
                          borderBottomLeftRadius: srcStyle.borderBottomLeftRadius,
                          boxShadow: srcStyle.boxShadow,
                        };
                      }

                      onUpdateNode({ ...node, style: updatedStyle });
                      alert('Gaya kontainer berhasil disalin! 📋✨');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.45rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: copySourceId ? 'pointer' : 'not-allowed',
                      opacity: copySourceId ? 1 : 0.6
                    }}
                  >
                    🤝 Salin &amp; Terapkan Gaya
                  </button>
                </div>
              );
            })()}

            {node.type === 'container' && node.widgetType === 'opening-prayer' && (
              <div className="form-group" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                  📜 Preset Ayat &amp; Doa Pembuka 1-Klik
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const preset = VERSE_PRESETS.find((p) => p.id === e.target.value);
                    if (preset && node.children && node.children.length >= 4) {
                      const updatedChildren = [...node.children];
                      updatedChildren[0] = { ...updatedChildren[0], content: preset.bismillah };
                      updatedChildren[1] = { ...updatedChildren[1], content: preset.arabic };
                      updatedChildren[2] = { ...updatedChildren[2], content: `"${preset.translation}"` };
                      updatedChildren[3] = { ...updatedChildren[3], content: preset.surah };
                      onUpdateNode({ ...node, children: updatedChildren });
                    }
                  }}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px' }}
                >
                  <option value="" disabled>-- Pilih Preset Ayat / Doa Restu --</option>
                  {VERSE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  💡 Memilih preset akan otomatis mengisi Teks Bismillah, Teks Ayat, Terjemahan, dan Badge Surat.
                </span>
              </div>
            )}

            {(node.type === 'thank-you' || node.widgetType === 'thank-you') && (
              <div className="form-group" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem', display: 'block' }}>
                  📜 Preset Kalimat Ucapan Terima Kasih
                </label>
                <select
                  style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff' }}
                  onChange={(e) => {
                    const found = THANK_YOU_PRESETS.find((p) => p.id === e.target.value);
                    if (found) {
                      updateNodeProp('content', found.text);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih Preset Ucapan Penutup --</option>
                  {THANK_YOU_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  💡 Memilih preset akan otomatis mengganti teks ucapan penutup pada widget ini.
                </span>
              </div>
            )}

            {(node.type === 'heading' || node.type === 'button' || node.type === 'text' || node.type === 'thank-you') && (
              <div className="form-group">
                <label>Isi Konten Teks Penutup</label>
                {node.type === 'text' || node.type === 'thank-you' ? (
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

            {node.type === 'map' && (
              <div className="form-group" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                  🗺️ Pengaturan URL Google Maps
                </label>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    URL / Link Google Maps:
                  </label>
                  <input
                    type="text"
                    value={node.buttonUrl || node.content || ''}
                    onChange={(e) => {
                      updateNodeProp('buttonUrl', e.target.value);
                      updateNodeProp('content', e.target.value);
                    }}
                    placeholder="Contoh: {link_maps} atau https://maps.google.com/..."
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {['{link_maps}', '{nama_lokasi}', '{alamat_lengkap}'].map((vTag) => (
                    <button
                      key={vTag}
                      type="button"
                      onClick={() => {
                        updateNodeProp('buttonUrl', vTag);
                        updateNodeProp('content', vTag);
                      }}
                      style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                    >
                      + {vTag}
                    </button>
                  ))}
                </div>
                 <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginTop: '0.4rem', lineHeight: '1.4' }}>
                   💡 Gunakan <b>{'{link_maps}'}</b> agar otomatis mengambil URL Google Map yang diinput oleh user saat membuat undangan di wizard. Di Studio ini akan menampilkan peta contoh.
                 </span>

                 <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                 <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                   ⚙️ Visibilitas Elemen
                 </label>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <label style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🗺️ Tampilkan Iframe Peta</label>
                     <input
                       type="checkbox"
                       checked={getResponsiveVal('mapShowIframe', true) !== false}
                       onChange={(e) => updateStyleProp('mapShowIframe', e.target.checked)}
                       style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                     />
                   </div>

                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <label style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🔘 Tampilkan Tombol Navigasi</label>
                     <input
                       type="checkbox"
                       checked={getResponsiveVal('mapShowButton', true) !== false}
                       onChange={(e) => updateStyleProp('mapShowButton', e.target.checked)}
                       style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                     />
                   </div>
                 </div>

                 {getResponsiveVal('mapShowIframe', true) !== false && (
                   <>
                     <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
                     <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                       🖼️ Gaya Box Peta (Iframe)
                     </label>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Tinggi Peta</label>
                         <input
                           type="text"
                           value={String(getResponsiveVal('mapIframeHeight', '260px'))}
                           onChange={(e) => updateStyleProp('mapIframeHeight', e.target.value)}
                           placeholder="260px"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Sudut Box (px)</label>
                         <input
                           type="number"
                           value={Number(getResponsiveVal('mapIframeBorderRadius', 14))}
                           onChange={(e) => updateStyleProp('mapIframeBorderRadius', parseInt(e.target.value) || 0)}
                           placeholder="14"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                     </div>
                   </>
                 )}

                 {getResponsiveVal('mapShowButton', true) !== false && (
                   <>
                     <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
                     <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                       🔘 Gaya Tombol Navigasi
                     </label>
                     <div className="form-group" style={{ margin: '0 0 0.5rem 0' }}>
                       <label style={{ fontSize: '0.65rem' }}>Teks Tombol</label>
                       <input
                         type="text"
                         value={String(getResponsiveVal('mapButtonText', '🗺️ Buka di Google Maps'))}
                         onChange={(e) => updateStyleProp('mapButtonText', e.target.value)}
                         placeholder="🗺️ Buka di Google Maps"
                         style={{ padding: '0.35rem' }}
                       />
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Latar Tombol</label>
                         <input
                           type="text"
                           value={String(getResponsiveVal('mapButtonBgColor', '#0284c7'))}
                           onChange={(e) => updateStyleProp('mapButtonBgColor', e.target.value)}
                           placeholder="#0284c7"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Warna Teks</label>
                         <input
                           type="text"
                           value={String(getResponsiveVal('mapButtonTextColor', '#ffffff'))}
                           onChange={(e) => updateStyleProp('mapButtonTextColor', e.target.value)}
                           placeholder="#ffffff"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Padding Tombol</label>
                         <input
                           type="text"
                           value={String(getResponsiveVal('mapButtonPadding', '10px 16px'))}
                           onChange={(e) => updateStyleProp('mapButtonPadding', e.target.value)}
                           placeholder="10px 16px"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Sudut Tombol (px)</label>
                         <input
                           type="number"
                           value={Number(getResponsiveVal('mapButtonBorderRadius', 12))}
                           onChange={(e) => updateStyleProp('mapButtonBorderRadius', parseInt(e.target.value) || 0)}
                           placeholder="12"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label style={{ fontSize: '0.65rem' }}>Ukuran Font</label>
                         <input
                           type="text"
                           value={String(getResponsiveVal('mapButtonFontSize', '0.8rem'))}
                           onChange={(e) => updateStyleProp('mapButtonFontSize', e.target.value)}
                           placeholder="0.8rem"
                           style={{ padding: '0.35rem' }}
                         />
                       </div>
                     </div>
                   </>
                 )}

                 {getResponsiveVal('mapShowIframe', true) !== false && getResponsiveVal('mapShowButton', true) !== false && (
                   <div className="form-group" style={{ margin: 0 }}>
                     <label style={{ fontSize: '0.65rem' }}>Jarak Antara (Gap - px)</label>
                     <input
                       type="number"
                       value={Number(getResponsiveVal('mapGap', 8))}
                       onChange={(e) => updateStyleProp('mapGap', parseInt(e.target.value) || 0)}
                       placeholder="8"
                       style={{ padding: '0.35rem' }}
                     />
                   </div>
                 )}
               </div>
            )}

            {node.type === 'countdown' && (
              <div className="form-group" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>
                  ⏳ Pengaturan Countdown Timer
                </label>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tanggal Target (Custom / Dynamic):</label>
                  <input
                    type="text"
                    value={node.countdownTargetDate || '{event_date}'}
                    onChange={(e) => updateNodeProp('countdownTargetDate', e.target.value)}
                    placeholder="{event_date} atau YYYY-MM-DD"
                  />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Gunakan <code>{'{event_date}'}</code> untuk mengambil tanggal dari database secara dinamis.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <label style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    ⏱️ Tampilkan Detik
                  </label>
                  <input
                    type="checkbox"
                    checked={style.countdownShowSeconds !== false}
                    onChange={(e) => updateStyleProp('countdownShowSeconds', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />

                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)' }}>🎨 Gaya Elemen Pembentuk</span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Latar Box</label>
                    <input
                      type="text"
                      value={String(getResponsiveVal('countdownBgColor', 'rgba(0,0,0,0.05)'))}
                      onChange={(e) => updateStyleProp('countdownBgColor', e.target.value)}
                      placeholder="rgba(0,0,0,0.05)"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Warna Angka</label>
                    <input
                      type="text"
                      value={String(getResponsiveVal('countdownTextColor', ''))}
                      onChange={(e) => updateStyleProp('countdownTextColor', e.target.value)}
                      placeholder="inherit / #000"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Warna Label</label>
                    <input
                      type="text"
                      value={String(getResponsiveVal('countdownLabelColor', ''))}
                      onChange={(e) => updateStyleProp('countdownLabelColor', e.target.value)}
                      placeholder="inherit / #666"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Jarak Box (px)</label>
                    <input
                      type="number"
                      value={Number(getResponsiveVal('countdownGap', 8))}
                      onChange={(e) => updateStyleProp('countdownGap', parseInt(e.target.value) || 0)}
                      placeholder="8"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Padding Box</label>
                    <input
                      type="text"
                      value={String(getResponsiveVal('countdownPadding', '8px 12px'))}
                      onChange={(e) => updateStyleProp('countdownPadding', e.target.value)}
                      placeholder="8px 12px"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Sudut Box (px)</label>
                    <input
                      type="number"
                      value={Number(getResponsiveVal('countdownBorderRadius', 8))}
                      onChange={(e) => updateStyleProp('countdownBorderRadius', parseInt(e.target.value) || 0)}
                      placeholder="8"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Ukuran Angka</label>
                    <input
                      type="text"
                      value={String(getResponsiveVal('countdownFontSize', '1.2rem'))}
                      onChange={(e) => updateStyleProp('countdownFontSize', e.target.value)}
                      placeholder="1.2rem"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Ukuran Label</label>
                    <input
                      type="text"
                      value={String(getResponsiveVal('countdownLabelSize', '0.65rem'))}
                      onChange={(e) => updateStyleProp('countdownLabelSize', e.target.value)}
                      placeholder="0.65rem"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {node.type === 'divider' && (
              <div className="form-group" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>
                  ➖ Pengaturan Divider / Garis Pemisah
                </label>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tipe Divider:</label>
                  <select
                    value={style.dividerType !== undefined && style.dividerType !== true ? String(style.dividerType) : 'solid'}
                    onChange={(e) => updateStyleProp('dividerType', e.target.value)}
                  >
                    <option value="solid">➖ Garis Lurus (Solid)</option>
                    <option value="dashed">--- Garis Putus-putus (Dashed)</option>
                    <option value="dotted">... Garis Titik-titik (Dotted)</option>
                    <option value="double">== Garis Ganda (Double)</option>
                    <option value="icon">✨ Dengan Simbol/Karakter di Tengah</option>
                  </select>
                </div>

                {style.dividerType === 'icon' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Karakter/Simbol Tengah:</label>
                    <input
                      type="text"
                      value={style.dividerIconSymbol !== undefined && style.dividerIconSymbol !== true ? String(style.dividerIconSymbol) : '✨'}
                      onChange={(e) => updateStyleProp('dividerIconSymbol', e.target.value)}
                      placeholder="✨, 🌸, ⚜️, ♥, ❦"
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Warna Garis</label>
                    <input
                      type="text"
                      value={style.dividerColor !== undefined && style.dividerColor !== true ? String(style.dividerColor) : '#cbd5e1'}
                      onChange={(e) => updateStyleProp('dividerColor', e.target.value)}
                      placeholder="#cbd5e1"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Ketebalan (px)</label>
                    <input
                      type="number"
                      value={style.dividerHeight !== undefined && typeof style.dividerHeight === 'number' ? style.dividerHeight : 1}
                      onChange={(e) => updateStyleProp('dividerHeight', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Lebar (%)</label>
                    <input
                      type="number"
                      value={style.dividerWidth !== undefined && typeof style.dividerWidth === 'number' ? style.dividerWidth : 100}
                      onChange={(e) => updateStyleProp('dividerWidth', parseInt(e.target.value) || 100)}
                      placeholder="100"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  {style.dividerType === 'icon' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.65rem' }}>Ukuran Simbol</label>
                      <input
                        type="text"
                        value={style.dividerIconSize !== undefined && style.dividerIconSize !== true ? String(style.dividerIconSize) : '1rem'}
                        onChange={(e) => updateStyleProp('dividerIconSize', e.target.value)}
                        placeholder="1rem"
                        style={{ padding: '0.35rem' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Function Registry Selection Panel (Available for all element types) */}
            <div className="form-group" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                ⚡ Function Registry (Aksi Klik Element)
              </label>
              <p style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                Pilih fungsi helper terdaftar di sistem yang akan dijalankan saat elemen ini di-klik pengunjung.
              </p>

              <select
                value={node.customAction || node.buttonAction || 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  updateNodeProp('customAction', val);
                  if (node.type === 'button') {
                    updateNodeProp('buttonAction', val);
                  }
                }}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              >
                <option value="none">-- Tanpa Aksi Klik --</option>
                {getRegisteredFunctionsList().map((fn) => (
                  <option key={fn.id} value={fn.id}>
                    {fn.name}
                  </option>
                ))}
                <option value="submit-rsvp">✉️ Kirim Form RSVP &amp; Ucapan</option>
                <option value="open-instagram">📸 Buka Instagram ({'{ig_wanita}'}, {'{ig_pria}'}, dll.)</option>
                <option value="open-tiktok">🎵 Buka TikTok ({'{tiktok_wanita}'}, {'{tiktok_pria}'})</option>
                <option value="open-facebook">📘 Buka Facebook ({'{fb_wanita}'}, {'{fb_pria}'})</option>
                <option value="open-whatsapp">💬 Chat WhatsApp ({'{wa_contact}'})</option>
                <option value="open-youtube">🎥 Buka YouTube ({'{yt_organizer}'})</option>
              </select>

              {(() => {
                const currentActionId = node.customAction || node.buttonAction || '';
                const registeredFn = FUNCTION_REGISTRY[currentActionId];
                const needsParam = registeredFn?.requiresParam || ['open-instagram', 'open-tiktok', 'open-facebook', 'open-whatsapp', 'open-youtube', 'open-url'].includes(currentActionId);

                if (!needsParam) return null;

                return (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>
                      {registeredFn?.paramLabel || 'Target / Parameter (URL / Username / Text)'}:
                    </label>
                    <input
                      type="text"
                      value={node.customActionParam || node.buttonUrl || ''}
                      onChange={(e) => {
                        updateNodeProp('customActionParam', e.target.value);
                        if (node.type === 'button') {
                          updateNodeProp('buttonUrl', e.target.value);
                        }
                      }}
                      placeholder={registeredFn?.paramPlaceholder || 'Masukkan parameter...'}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Mendukung penulisan variabel dinamis seperti <code>{'{ig_wanita}'}</code> atau <code>{'{rekening_pria}'}</code>.
                    </span>
                  </div>
                );
              })()}
            </div>

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

                  {/* Icon Input & SVG Library Finder Trigger */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Ikon / SVG Tombol:</label>
                      <button
                        type="button"
                        onClick={() => setIsIconPickerOpen(true)}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'var(--primary-light, rgba(227, 99, 151, 0.15))',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        🎨 Pilih dari Library Ikon (SVG)
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          flexShrink: 0,
                          color: 'var(--primary)',
                          padding: '4px',
                        }}
                      >
                        {isSvgMarkup(node.icon) ? (
                          <div className="studio-btn-svg-icon" style={{ width: '22px', height: '22px' }} dangerouslySetInnerHTML={{ __html: normalizeSvgString(node.icon) }} />
                        ) : node.icon?.startsWith('http') || node.icon?.startsWith('data:') ? (
                          <img src={node.icon} alt="icon" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        ) : (
                          node.icon || '—'
                        )}
                      </div>

                      <input
                        type="text"
                        value={node.icon || ''}
                        onChange={(e) => updateNodeProp('icon', e.target.value)}
                        placeholder="Kode <svg>, 📸, atau URL..."
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Quick Icon Picker Bar */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Pilih Emoji Cepat:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {['📸', '🎵', '💬', '📍', '📅', '🔗', '❤️', '🎉', '✨', '🎁', '🔔', '💍', '💐', '✉️', '🚀'].map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => updateNodeProp('icon', ic)}
                          style={{
                            padding: '3px 7px',
                            fontSize: '0.82rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            backgroundColor: node.icon === ic ? 'var(--primary)' : '#ffffff',
                            color: node.icon === ic ? '#ffffff' : 'inherit',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Position, Gap, Size, & Color Controls */}
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Ukuran Ikon (px):</label>
                      <input
                        type="number"
                        min={8}
                        max={100}
                        value={node.iconSize ?? 20}
                        onChange={(e) => updateNodeProp('iconSize', parseInt(e.target.value, 10) || 20)}
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Warna / Fill Ikon:</label>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={node.iconColor || '#e36397'}
                          onChange={(e) => updateNodeProp('iconColor', e.target.value)}
                          style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <button
                          type="button"
                          onClick={() => updateNodeProp('iconColor', '')}
                          style={{
                            fontSize: '0.66rem',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: !node.iconColor ? 'var(--primary)' : '#ffffff',
                            color: !node.iconColor ? '#ffffff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            flex: 1,
                            textAlign: 'center',
                          }}
                        >
                          Auto (Teks)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {node.type === 'image' && (
              <>
                {/* Dynamic Image Variable Switch & Binding */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-body)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: node.isDynamic ? '0.6rem' : 0,
                    }}
                  >
                    <label
                      htmlFor="inp-img-isDynamic"
                      style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      ✨ Gunakan Foto Dinamis User
                    </label>
                    <input
                      type="checkbox"
                      id="inp-img-isDynamic"
                      checked={node.isDynamic || false}
                      onChange={(e) => {
                        updateNodeProp('isDynamic', e.target.checked);
                        if (e.target.checked && !node.binding) {
                          updateNodeProp('binding', 'fotoPria');
                        }
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  {node.isDynamic ? (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                        Pilih Variabel Foto Pengguna:
                      </label>
                      {(() => {
                        const isPresetBinding = ['fotoPria', 'fotoWanita', 'cover_photo'].includes(node.binding || '');
                        const selectValue = isPresetBinding ? (node.binding || 'fotoPria') : 'custom';

                        return (
                          <>
                            <select
                              value={selectValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                  updateNodeProp('binding', 'custom_variabel');
                                } else {
                                  updateNodeProp('binding', val);
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: '#ffffff',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <option value="fotoPria">🤵 fotoPria (Foto Mempelai Pria)</option>
                              <option value="fotoWanita">👰 fotoWanita (Foto Mempelai Wanita)</option>
                              <option value="cover_photo">🖼️ cover_photo (Foto Sampul Utama / Couple)</option>
                              <option value="custom">✍️ Kustom / Nama Variabel Lain...</option>
                            </select>

                            {selectValue === 'custom' && (
                              <div style={{ marginTop: '0.45rem' }}>
                                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                                  Nama Variabel Kustom:
                                </label>
                                <input
                                  type="text"
                                  placeholder="misal: foto_detail_1"
                                  value={node.binding || ''}
                                  onChange={(e) => updateNodeProp('binding', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem 0.6rem',
                                    fontSize: '0.8rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: '#fff',
                                    color: '#000',
                                  }}
                                />
                              </div>
                            )}
                          </>
                        );
                      })()}
                      <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem', lineHeight: '1.4' }}>
                        💡 Foto ini akan terisi otomatis dari foto yang diunggah pengguna di Editor Undangan. Gambar sampel di bawah digunakan sebagai fallback studio.
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>
                      Pilih centang di atas jika ingin foto ini diisi oleh user (cth: foto pengantin pria/wanita). Jika tidak, gunakan URL statis untuk dekorasi tetap.
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>{node.isDynamic ? 'URL Gambar Sampel / Fallback Studio' : 'URL Gambar Statis'}</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <input
                      type="text"
                      value={node.content || ''}
                      onChange={(e) => updateNodeProp('content', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      style={{ flex: 1 }}
                    />
                    {node.content && (
                      <button
                        type="button"
                        onClick={() =>
                          openCropModal(
                            node.content || '',
                            (url) => updateNodeProp('content', url),
                            'Crop Gambar Elemen'
                          )
                        }
                        style={{
                          padding: '6px 10px',
                          background: 'var(--bg-card)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}
                        title="Crop gambar elemen ini"
                      >
                        ✂️ Crop
                      </button>
                    )}
                    {node.content && (
                      <button
                        type="button"
                        onClick={() =>
                          openBgRemovalModal(
                            node.content || '',
                            (url) => updateNodeProp('content', url),
                            'Hapus Background Gambar Elemen'
                          )
                        }
                        style={{
                          padding: '6px 10px',
                          background: 'rgba(227, 99, 151, 0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(227, 99, 151, 0.4)',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}
                        title="Hapus background gambar elemen ini menjadi transparan (AI / Chroma)"
                      >
                        🪄 Hapus BG
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openMediaLibrary(['studio'], (url) => updateNodeProp('content', url))}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        margin: 0,
                        border: 'none',
                      }}
                    >
                      📁 Upload
                    </button>
                  </div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <label htmlFor="inp-lock-guestname" style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                    🔒 Kunci Nama (Isi Otomatis dari Link Tamu)
                  </label>
                  <input
                    type="checkbox"
                    id="inp-lock-guestname"
                    checked={node.isGuestNameInput ?? (node.inputName === 'guest_name')}
                    onChange={(e) => updateNodeProp('isGuestNameInput', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}

            {node.type === 'select' && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  📋 Pengaturan Field Select / Pilihan RSVP
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Tipe Tampilan Form</label>
                  <select
                    value={node.renderAsButtons !== false ? 'buttons' : 'dropdown'}
                    onChange={(e) => updateNodeProp('renderAsButtons', e.target.value === 'buttons')}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="buttons">🔘 Tombol Pilihan Interaktif (Segmented Choice Buttons)</option>
                    <option value="dropdown">🔽 Dropdown Menu (&lt;select&gt;)</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Opsi Pilihan (Dipisah Koma)</label>
                  <input
                    type="text"
                    value={node.selectOptions || ''}
                    onChange={(e) => updateNodeProp('selectOptions', e.target.value)}
                    placeholder="✅ Hadir, ❌ Tidak Hadir"
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
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ margin: 0 }}>Font Family</label>
                    {style.fontFamily?.includes('font-primary') ? (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px' }}>
                        👑 Font Primary
                      </span>
                    ) : style.fontFamily?.includes('font-secondary') ? (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px' }}>
                        📖 Font Secondary
                      </span>
                    ) : null}
                  </div>

                  {/* Fast Preset Buttons for Primary & Secondary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => updateStyleProp('fontFamily', 'var(--global-font-primary)')}
                      style={{
                        padding: '4px 6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: style.fontFamily === 'var(--global-font-primary)' || style.fontFamily === 'font-primary' ? 'var(--primary)' : 'var(--bg-body)',
                        color: style.fontFamily === 'var(--global-font-primary)' || style.fontFamily === 'font-primary' ? '#fff' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      👑 Font Primary
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStyleProp('fontFamily', 'var(--global-font-secondary)')}
                      style={{
                        padding: '4px 6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: style.fontFamily === 'var(--global-font-secondary)' || style.fontFamily === 'font-secondary' ? 'var(--primary)' : 'var(--bg-body)',
                        color: style.fontFamily === 'var(--global-font-secondary)' || style.fontFamily === 'font-secondary' ? '#fff' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      📖 Font Secondary
                    </button>
                  </div>

                  <FontEngineSelect
                    value={style.fontFamily || 'Plus Jakarta Sans'}
                    onChange={(font) => updateStyleProp('fontFamily', font)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ margin: 0 }}>Ukuran Font (Font Size)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>

                  {/* 8 Scale Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '0.45rem' }}>
                    {[
                      { label: 'H1', token: 'var(--global-size-h1)' },
                      { label: 'H2', token: 'var(--global-size-h2)' },
                      { label: 'H3', token: 'var(--global-size-h3)' },
                      { label: 'H4', token: 'var(--global-size-h4)' },
                      { label: 'Body-L', token: 'var(--global-size-body-large)' },
                      { label: 'Body', token: 'var(--global-size-body)' },
                      { label: 'Body-S', token: 'var(--global-size-body-small)' },
                      { label: 'Caption', token: 'var(--global-size-caption)' },
                    ].map((pill) => {
                      const isPillSelected = style.fontSize === pill.token || style.fontSize === pill.label || style.fontSize === pill.label.toLowerCase();
                      return (
                        <button
                          key={pill.label}
                          type="button"
                          onClick={() => updateStyleProp('fontSize', pill.token)}
                          style={{
                            padding: '3px 2px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: isPillSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isPillSelected ? 'var(--primary)' : 'var(--bg-body)',
                            color: isPillSelected ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={getResponsiveVal('fontSize', '')}
                    onChange={(e) => updateStyleProp('fontSize', e.target.value)}
                    placeholder="ex: var(--global-size-h1) atau 24"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
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

                {/* Gaya Huruf (Font Style / Italic) */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ margin: 0 }}>Gaya Huruf / Italic (Font Style)</label>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{deviceIcon}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[
                      { val: 'normal', label: 'Normal (Tegak)', icon: 'Aa', isItalic: false },
                      { val: 'italic', label: 'Italic (Miring)', icon: 'I', isItalic: true },
                    ].map((fs) => {
                      const currentVal = getResponsiveVal('fontStyle', 'normal');
                      const isSelected = currentVal === fs.val || (!currentVal && fs.val === 'normal');
                      return (
                        <button
                          key={fs.val}
                          type="button"
                          onClick={() => updateStyleProp('fontStyle', fs.val)}
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontStyle: fs.isItalic ? 'italic' : 'normal',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontWeight: 900 }}>{fs.icon}</span>
                          <span>{fs.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <TokenColorPicker
                  label="Warna Teks (Text Color)"
                  value={style.color || ''}
                  onChange={(val) => updateStyleProp('color', val)}
                  globalStyles={globalStyles}
                />

                {/* Jarak Antar Huruf (Letter Spacing) */}
                <div className="form-group" style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ margin: 0 }}>🔤 Jarak Antar Huruf (Letter Spacing)</label>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.45rem' }}>
                    {['0px', '1px', '2px', '4px', '6px', '8px', '12px'].map((ls) => (
                      <button
                        key={ls}
                        type="button"
                        onClick={() => updateStyleProp('letterSpacing', ls)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: style.letterSpacing === ls ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: style.letterSpacing === ls ? 'var(--primary)' : 'var(--bg-body)',
                          color: style.letterSpacing === ls ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {ls}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={style.letterSpacing || ''}
                    onChange={(e) => updateStyleProp('letterSpacing', e.target.value)}
                    placeholder="contoh: 2px atau 0.1em"
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* Kelengkungan Teks (Curved Text) */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor={`inp-curved-${node.id}`} style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}>
                      🌙 Efek Teks Melengkung (Curved Text)
                    </label>
                    <input
                      type="checkbox"
                      id={`inp-curved-${node.id}`}
                      checked={!!style.isCurvedText}
                      onChange={(e) => updateStyleProp('isCurvedText', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </div>
                  {style.isCurvedText && (
                    <div style={{ marginTop: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        <span>Radius Kelengkungan:</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{style.textCurveRadius !== undefined ? style.textCurveRadius : 120}</span>
                      </div>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        step="10"
                        value={style.textCurveRadius !== undefined ? style.textCurveRadius : 120}
                        onChange={(e) => updateStyleProp('textCurveRadius', parseInt(e.target.value, 10))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>-300 (Cembung Bawah)</span>
                        <span>0 (Datar)</span>
                        <span>+300 (Cembung Atas)</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Rotasi Elemen / Teks (Rotation Angle) */}
            <div className="form-group" style={{ marginBottom: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: '0.78rem' }}>
                  🔄 Rotasi Elemen / Teks (Rotation Angle)
                </label>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {style.transformRotate !== undefined ? style.transformRotate : (style.rotate || 0)}°
                </span>
              </div>

              {/* Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.45rem' }}>
                {[
                  { label: '0°', val: 0 },
                  { label: '15°', val: 15 },
                  { label: '45°', val: 45 },
                  { label: '90°', val: 90 },
                  { label: '-15°', val: -15 },
                  { label: '-45°', val: -45 },
                  { label: '-90°', val: -90 },
                ].map((preset) => {
                  const currentRot = Number(style.transformRotate !== undefined ? style.transformRotate : (style.rotate || 0));
                  const isSelected = currentRot === preset.val;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        updateStyleProp('transformRotate', preset.val);
                        updateStyleProp('rotate', preset.val);
                      }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Angle Slider */}
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={Number(style.transformRotate !== undefined ? style.transformRotate : (style.rotate || 0))}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateStyleProp('transformRotate', val);
                  updateStyleProp('rotate', val);
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Background Color & Image */}
            <TokenColorPicker
              label="Warna Latar (Background Color)"
              value={style.backgroundColor || ''}
              onChange={(val) => updateStyleProp('backgroundColor', val)}
              globalStyles={globalStyles}
            />

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



                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0 }}>
                      💡 Container akan otomatis memutar seluruh foto yang tercentang <strong style={{ color: 'var(--primary)' }}>"Tambahkan ke Galeri Lightbox"</strong>.
                    </p>
                  </div>
                )}

                {style.bgType !== 'gradient' && style.bgType !== 'gallery-slideshow' && (
                  <div className="form-group" style={{ margin: 0, marginTop: '0.75rem' }}>
                    <label>Gambar Latar (Background Image URL)</label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input
                        type="text"
                        value={getResponsiveVal('backgroundImage', '')}
                        onChange={(e) => updateStyleProp('backgroundImage', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        style={{ flex: 1 }}
                      />
                      {getResponsiveVal('backgroundImage', '') && (
                        <button
                          type="button"
                          onClick={() =>
                            openCropModal(
                              getResponsiveVal('backgroundImage', ''),
                              (url) => updateStyleProp('backgroundImage', url),
                              'Crop Background Container'
                            )
                          }
                          style={{
                            padding: '6px 10px',
                            background: 'var(--bg-card)',
                            color: 'var(--primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            whiteSpace: 'nowrap',
                            margin: 0,
                          }}
                          title="Crop background container ini"
                        >
                          ✂️ Crop
                        </button>
                      )}
                      {getResponsiveVal('backgroundImage', '') && (
                        <button
                          type="button"
                          onClick={() =>
                            openBgRemovalModal(
                              getResponsiveVal('backgroundImage', ''),
                              (url) => updateStyleProp('backgroundImage', url),
                              'Hapus Background Container'
                            )
                          }
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(227, 99, 151, 0.1)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(227, 99, 151, 0.4)',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            whiteSpace: 'nowrap',
                            margin: 0,
                          }}
                          title="Hapus background gambar container ini menjadi transparan (AI / Chroma)"
                        >
                          🪄 Hapus BG
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openMediaLibrary(['studio'], (url) => updateStyleProp('backgroundImage', url))}
                        style={{
                          padding: '6px 10px',
                          background: 'var(--primary)',
                          color: '#fff',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          whiteSpace: 'nowrap',
                          margin: 0,
                          border: 'none',
                        }}
                      >
                        📁 Upload
                      </button>
                    </div>
                    {/* Dynamic Background Image Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.55rem', marginBottom: '0.45rem' }}>
                      <label style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        ✨ Latar Belakang Dinamis
                      </label>
                      <input
                        type="checkbox"
                        checked={style.isBgDynamic === true}
                        onChange={(e) => {
                          updateStyleProp('isBgDynamic', e.target.checked);
                          if (e.target.checked && !style.backgroundImageBinding) {
                            updateStyleProp('backgroundImageBinding', 'cover_photo');
                          }
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>

                    {style.isBgDynamic && (
                      <div style={{ marginTop: '0.4rem', marginBottom: '0.45rem' }}>
                        <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                          Pilih/Ketik Variabel Latar Belakang:
                        </label>
                        {(() => {
                          const isPreset = ['fotoPria', 'fotoWanita', 'cover_photo'].includes(String(style.backgroundImageBinding || ''));
                          const selectVal = isPreset ? String(style.backgroundImageBinding || 'cover_photo') : 'custom';
                          return (
                            <>
                              <select
                                value={selectVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'custom') {
                                    updateStyleProp('backgroundImageBinding', 'custom_variabel');
                                  } else {
                                    updateStyleProp('backgroundImageBinding', val);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.4rem 0.5rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: '#fff',
                                }}
                              >
                                <option value="cover_photo">🖼️ cover_photo (Foto Sampul Utama / Couple)</option>
                                <option value="fotoPria">🤵 fotoPria (Foto Mempelai Pria)</option>
                                <option value="fotoWanita">👰 fotoWanita (Foto Mempelai Wanita)</option>
                                <option value="custom">✍️ Kustom / Nama Variabel Lain...</option>
                              </select>

                              {selectVal === 'custom' && (
                                <input
                                  type="text"
                                  placeholder="misal: foto_background_kustom"
                                  value={String(style.backgroundImageBinding || '')}
                                  onChange={(e) => updateStyleProp('backgroundImageBinding', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem 0.5rem',
                                    fontSize: '0.78rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    marginTop: '0.35rem',
                                    background: '#fff',
                                    color: '#000',
                                  }}
                                />
                              )}
                            </>
                          );
                        })()}
                        <span style={{ fontSize: '0.64rem', color: '#64748b', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                          💡 URL di atas hanya digunakan sebagai fallback/pratinjau studio. Latar belakang akan otomatis digantikan oleh berkas yang diunggah pengguna untuk variabel ini.
                        </span>
                      </div>
                    )}
                  </div>
                )}
                    {/* Background Overlay settings for all containers */}
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.45rem' }}>
                        🖤 Overlay Latar Belakang (Gelap/Terang)
                      </span>
                      
                      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700 }}>Warna Overlay</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="color"
                            value={style.backgroundOverlayColor && style.backgroundOverlayColor.startsWith('#') ? style.backgroundOverlayColor : '#000000'}
                            onChange={(e) => updateStyleProp('backgroundOverlayColor', e.target.value)}
                            style={{ width: '36px', height: '30px', border: 'none', cursor: 'pointer', padding: 0 }}
                          />
                          <input
                            type="text"
                            value={style.backgroundOverlayColor || ''}
                            onChange={(e) => updateStyleProp('backgroundOverlayColor', e.target.value)}
                            placeholder="rgba(0,0,0,0.4) atau #000000"
                            style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Kekuatan Overlay (Opacity)</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round((parseFloat(String(style.backgroundOverlayOpacity ?? 0.5)) || 0) * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={style.backgroundOverlayOpacity ?? 0.5}
                          onChange={(e) => updateStyleProp('backgroundOverlayOpacity', parseFloat(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
              </div>
            )}

            {/* Border & Corner Radius Controls */}
            <div style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.65rem' }}>
                🔲 Pengaturan Border &amp; Sudut
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <label style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  📐 Atur Radius Per Sudut
                </label>
                <input
                  type="checkbox"
                  checked={style.useIndividualRadius === true}
                  onChange={(e) => updateStyleProp('useIndividualRadius', e.target.checked)}
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
              </div>

              {style.useIndividualRadius === true ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>↖️ Kiri Atas (px)</label>
                    <input
                      type="number"
                      value={style.borderTopLeftRadius ?? ''}
                      onChange={(e) => updateStyleProp('borderTopLeftRadius', e.target.value !== '' ? parseInt(e.target.value) : '')}
                      placeholder="0"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>↗️ Kanan Atas (px)</label>
                    <input
                      type="number"
                      value={style.borderTopRightRadius ?? ''}
                      onChange={(e) => updateStyleProp('borderTopRightRadius', e.target.value !== '' ? parseInt(e.target.value) : '')}
                      placeholder="0"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>↙️ Kiri Bawah (px)</label>
                    <input
                      type="number"
                      value={style.borderBottomLeftRadius ?? ''}
                      onChange={(e) => updateStyleProp('borderBottomLeftRadius', e.target.value !== '' ? parseInt(e.target.value) : '')}
                      placeholder="0"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>↘️ Kanan Bawah (px)</label>
                    <input
                      type="number"
                      value={style.borderBottomRightRadius ?? ''}
                      onChange={(e) => updateStyleProp('borderBottomRightRadius', e.target.value !== '' ? parseInt(e.target.value) : '')}
                      placeholder="0"
                      style={{ padding: '0.35rem' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Border Radius / Sudut Membulat (px)</label>
                  <input
                    type="number"
                    value={style.borderRadius || ''}
                    onChange={(e) => updateStyleProp('borderRadius', parseInt(e.target.value) || '')}
                    placeholder="12"
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Ketebalan Border (px)</label>
                  <input
                    type="number"
                    value={style.borderWidth || ''}
                    onChange={(e) => updateStyleProp('borderWidth', parseInt(e.target.value) || '')}
                    placeholder="1"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Tipe Garis</label>
                  <select
                    value={style.borderStyle || 'none'}
                    onChange={(e) => updateStyleProp('borderStyle', e.target.value)}
                  >
                    <option value="none">None (Tanpa Garis)</option>
                    <option value="solid">Solid (Garis Lurus)</option>
                    <option value="dashed">Dashed (Putus-putus)</option>
                    <option value="dotted">Dotted (Titik-titik)</option>
                    <option value="double">Double (Ganda)</option>
                  </select>
                </div>
              </div>

              <TokenColorPicker
                label="Warna Garis Border"
                value={style.borderColor || ''}
                onChange={(c) => updateStyleProp('borderColor', c)}
                globalStyles={globalStyles}
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

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url) => {
          if (onMediaSelectCallback) onMediaSelectCallback(url);
        }}
        folders={mediaModalFolders}
      />

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={(iconValue) => {
          updateNodeProp('icon', iconValue);
        }}
        currentIcon={node.icon}
      />

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageUrl={cropImageUrl}
        targetTitle={cropModalTitle}
        onCropComplete={(croppedUrl) => {
          if (onCropCallback) onCropCallback(croppedUrl);
          setIsCropModalOpen(false);
        }}
      />

      <ImageBgRemovalModal
        isOpen={isBgRemovalModalOpen}
        onClose={() => setIsBgRemovalModalOpen(false)}
        imageUrl={bgRemovalImageUrl}
        targetTitle={bgRemovalModalTitle}
        onComplete={(transparentUrl) => {
          if (onBgRemovalCallback) onBgRemovalCallback(transparentUrl);
          setIsBgRemovalModalOpen(false);
        }}
      />
    </div>
  );
}
