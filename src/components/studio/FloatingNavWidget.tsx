'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StudioNode, NavItem } from '@/types';
import { isSvgMarkup, normalizeSvgString } from '@/utils/svgNormalizer';

interface FloatingNavWidgetProps {
  node: StudioNode;
  isPreviewMode?: boolean;
  onSelectNode?: (id: string) => void;
  selectedNodeId?: string | null;
  onOpenCover?: () => void;
}

// Built-in high quality SVG icons matching the screenshot
export const NAV_BUILTIN_ICONS: Record<string, { label: string; svg: string; keywords: string[] }> = {
  home: {
    label: 'Home / Beranda',
    keywords: ['home', 'beranda', 'sampul', 'cover', 'rumah'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z"/></svg>`,
  },
  rings: {
    label: 'Cincin Kawin / Mempelai',
    keywords: ['rings', 'cincin', 'couple', 'mempelai', 'pengantin', 'bride', 'groom'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="14" r="4.5"/><circle cx="15.5" cy="14" r="4.5"/><path d="M8.5 7l1.5-2.5 1.5 2.5-1.5 1.5z"/><path d="M7 4.5h3"/></svg>`,
  },
  calendar: {
    label: 'Kalender / Acara',
    keywords: ['calendar', 'acara', 'event', 'jadwal', 'resepsi', 'akad'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 10h18"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>`,
  },
  gallery: {
    label: 'Galeri / Foto',
    keywords: ['gallery', 'galeri', 'photo', 'foto', 'album'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 7.5c-.8 0-1.5.7-1.5 1.5 0 1.2 1.5 2.2 1.5 2.2s1.5-1 1.5-2.2c0-.8-.7-1.5-1.5-1.5z" fill="currentColor"/><circle cx="7" cy="16" r="0.8" fill="currentColor"/><circle cx="9.5" cy="16" r="0.8" fill="currentColor"/><circle cx="12" cy="16" r="0.8" fill="currentColor"/></svg>`,
  },
  heart: {
    label: 'Hati / Kisah Cinta',
    keywords: ['heart', 'love', 'cinta', 'cerita', 'story'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  },
  gift: {
    label: 'Kado / Hadiah',
    keywords: ['gift', 'hadiah', 'angpau', 'amplop', 'rekening'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`,
  },
  message: {
    label: 'Pesan / Ucapan & Doa',
    keywords: ['message', 'chat', 'ucapan', 'doa', 'wishes', 'rsvp', 'bukutamu'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>`,
  },
  music: {
    label: 'Musik / Audio',
    keywords: ['music', 'lagu', 'audio', 'sound'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  },
  map: {
    label: 'Peta / Lokasi',
    keywords: ['map', 'location', 'lokasi', 'peta', 'pin'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  },
  camera: {
    label: 'Kamera / Live',
    keywords: ['camera', 'kamera', 'foto', 'live'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  },
  star: {
    label: 'Bintang / Favorit',
    keywords: ['star', 'bintang', 'favorite'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  user: {
    label: 'Pengguna / Tamu',
    keywords: ['user', 'tamu', 'guest', 'profil'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
};

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'nav-home', label: 'Home', targetSection: 'cover', iconType: 'home', enabled: true },
  { id: 'nav-couple', label: 'Mempelai', targetSection: 'bride_groom', iconType: 'rings', enabled: true },
  { id: 'nav-event', label: 'Acara', targetSection: 'event_schedule', iconType: 'calendar', enabled: true },
  { id: 'nav-gallery', label: 'Galeri', targetSection: 'gallery', iconType: 'gallery', enabled: true },
  { id: 'nav-story', label: 'Cerita', targetSection: 'love_story', iconType: 'heart', enabled: true },
  { id: 'nav-gift', label: 'Hadiah', targetSection: 'gift', iconType: 'gift', enabled: true },
  { id: 'nav-wishes', label: 'Ucapan', targetSection: 'wishes', iconType: 'message', enabled: true },
];

export function renderNavIcon(iconType?: string, customSvg?: string, size: number = 18, color: string = 'currentColor') {
  if (customSvg && isSvgMarkup(customSvg)) {
    return (
      <span
        style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color }}
        dangerouslySetInnerHTML={{ __html: normalizeSvgString(customSvg) }}
      />
    );
  }

  const iconKey = (iconType || 'home').toLowerCase();
  const matched = NAV_BUILTIN_ICONS[iconKey];

  if (matched) {
    return (
      <span
        style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color }}
        dangerouslySetInnerHTML={{ __html: matched.svg }}
      />
    );
  }

  // Fallback: If it's an emoji or plain string
  if (iconType && iconType.length <= 4) {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{iconType}</span>;
  }

  // Default home fallback
  return (
    <span
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color }}
      dangerouslySetInnerHTML={{ __html: NAV_BUILTIN_ICONS.home.svg }}
    />
  );
}

export function parseColorToRgb(colorStr?: string): { r: number; g: number; b: number } | null {
  if (!colorStr) return null;
  const s = colorStr.trim();
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length >= 6) {
      const num = parseInt(hex.slice(0, 6), 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
  }
  const match = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return null;
}

export function detectElementBackgroundColor(el: HTMLElement | null): { bg: string; isDark: boolean; rgb: [number, number, number] } | null {
  if (!el || typeof window === 'undefined') return null;

  let cur: HTMLElement | null = el;
  let foundColor: string | null = null;

  while (cur && cur !== document.documentElement) {
    const computed = window.getComputedStyle(cur);
    const bg = computed.backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      foundColor = bg;
      break;
    }
    cur = cur.parentElement;
  }

  if (!foundColor) {
    const stage = document.getElementById('studio-canvas-stage');
    if (stage) {
      const stageBg = window.getComputedStyle(stage).backgroundColor;
      if (stageBg && stageBg !== 'transparent' && stageBg !== 'rgba(0, 0, 0, 0)') {
        foundColor = stageBg;
      }
    }
  }

  if (!foundColor) return null;

  const rgb = parseColorToRgb(foundColor);
  if (!rgb) return null;

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return {
    bg: foundColor,
    isDark: luminance < 0.52,
    rgb: [rgb.r, rgb.g, rgb.b],
  };
}

export function resolveScrollContainer(hintEl?: HTMLElement | null): HTMLElement | null {
  if (typeof document === 'undefined') return null;

  // 1. Studio editor specific canvas scroll area
  const studioScrollArea = (document.getElementById('studio-canvas-scroll-area') ||
    document.querySelector('.studio-canvas-scroll-area') ||
    document.querySelector('.studio-stage')?.parentElement) as HTMLElement | null;

  if (studioScrollArea && studioScrollArea.scrollHeight > studioScrollArea.clientHeight + 10) {
    return studioScrollArea;
  }

  // 2. Ascend from hintEl (the navigation widget DOM node)
  if (hintEl) {
    let cur: HTMLElement | null = hintEl.parentElement;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      const style = window.getComputedStyle(cur);
      const overflowY = style.overflowY || style.overflow;
      if ((overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight + 20) {
        return cur;
      }
      cur = cur.parentElement;
    }
  }

  // 3. Ascend from any rendered section element in the document
  const sampleSection = document.querySelector('[data-section-type], [id^="node-dom-container-"]') as HTMLElement | null;
  if (sampleSection) {
    let cur: HTMLElement | null = sampleSection.parentElement;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      const style = window.getComputedStyle(cur);
      const overflowY = style.overflowY || style.overflow;
      if ((overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight + 20) {
        return cur;
      }
      cur = cur.parentElement;
    }
  }

  // 4. Any scrollable container with overflow: scroll / auto that actually has overflowing content
  const candidates = document.querySelectorAll<HTMLElement>('[style*="overflow"], [class*="overflow"]');
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    if (el.scrollHeight > el.clientHeight + 40) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY || style.overflow;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return el;
      }
    }
  }

  // 5. Fallback: window / document scroll
  return null;
}

export function findTargetSectionElement(item: NavItem, scrollContainer?: HTMLElement | null): HTMLElement | null {
  if (!item || typeof document === 'undefined') return null;

  const scope = scrollContainer || document;

  // 1. Direct node targetId if specified
  if (item.targetId) {
    const el = (scope.querySelector(`#node-dom-${item.targetId}`) ||
      document.getElementById(`node-dom-${item.targetId}`) ||
      scope.querySelector(`#${item.targetId}`) ||
      document.getElementById(item.targetId)) as HTMLElement | null;
    if (el && !el.closest('.joinme-floating-nav-wrapper')) return el;
  }

  const sec = (item.targetSection || '').toLowerCase().trim();
  if (!sec) return null;

  // Special handling for cover/home when cover overlay is opened/hidden
  if (sec === 'cover' || sec === 'home') {
    if (scrollContainer) {
      const firstChild = (scrollContainer.querySelector('[id^="node-dom-container-"]') || scrollContainer.firstElementChild) as HTMLElement | null;
      if (firstChild) return firstChild;
      return scrollContainer;
    }

    const coverEl = document.querySelector('[data-section-type="cover"]') as HTMLElement | null;
    if (coverEl) {
      const rect = coverEl.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top < -100) {
        const mainEl = document.querySelector('main');
        if (mainEl && mainEl.firstElementChild) {
          return mainEl.firstElementChild as HTMLElement;
        }
        return mainEl;
      }
      return coverEl;
    }
    const mainEl = document.querySelector('main');
    if (mainEl && mainEl.firstElementChild) {
      return mainEl.firstElementChild as HTMLElement;
    }
  }

  // 2. Exact match on data-section-type within scope
  let el = (scope.querySelector(`[data-section-type="${sec}"]`) ||
    document.querySelector(`[data-section-type="${sec}"]`)) as HTMLElement | null;
  if (el && !el.closest('.joinme-floating-nav-wrapper')) return el;

  // 3. Aliases mapping to cover variations in section naming
  const aliases: Record<string, string[]> = {
    cover: ['cover', 'sampul', 'hero', 'banner'],
    bride_groom: ['bride_groom', 'mempelai', 'couple', 'pengantin', 'bride', 'groom'],
    event_schedule: ['event_schedule', 'acara', 'event', 'jadwal', 'resepsi', 'akad'],
    gallery: ['gallery', 'galeri', 'photo', 'foto', 'album'],
    love_story: ['love_story', 'story', 'cerita', 'kisah', 'love'],
    gift: ['gift', 'hadiah', 'amplop', 'kado', 'rekening', 'angpao'],
    wishes: ['wishes', 'ucapan', 'doa', 'pesan', 'rsvp', 'bukutamu'],
    opening: ['opening', 'pembuka', 'ayat', 'salam'],
    live_streaming: ['live_streaming', 'streaming', 'live'],
  };

  const list = aliases[sec] || [sec];
  for (const alias of list) {
    el = (scope.querySelector(`[data-section-type="${alias}"]`) ||
      document.querySelector(`[data-section-type="${alias}"]`)) as HTMLElement | null;
    if (el && !el.closest('.joinme-floating-nav-wrapper')) return el;
  }

  for (const alias of list) {
    const matches = scope.querySelectorAll(`[id*="${alias}"]`);
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i] as HTMLElement;
      if (!match.closest('.joinme-floating-nav-wrapper')) {
        return match;
      }
    }
  }

  // 4. Fallback search inside containers
  const allContainers = scope.querySelectorAll('[data-section-type]');
  for (let i = 0; i < allContainers.length; i++) {
    const c = allContainers[i] as HTMLElement;
    const type = (c.getAttribute('data-section-type') || '').toLowerCase();
    if (list.includes(type) && !c.closest('.joinme-floating-nav-wrapper')) return c;
  }

  // 5. Deep search by widgets inside containers
  for (const alias of list) {
    const childWidget = scope.querySelector(`[id*="${alias}"]`);
    if (childWidget && !childWidget.closest('.joinme-floating-nav-wrapper')) {
      const parentContainer = childWidget.closest('[id^="node-dom-container"]') || childWidget.closest('section') || childWidget.parentElement;
      if (parentContainer && !parentContainer.closest('.joinme-floating-nav-wrapper')) return parentContainer as HTMLElement;
    }
  }

  return null;
}

export function FloatingNavWidget({
  node,
  isPreviewMode = false,
  onSelectNode,
  selectedNodeId,
  onOpenCover,
}: FloatingNavWidgetProps) {
  const isSelected = selectedNodeId === node.id;
  const items: NavItem[] = useMemo(() => {
    return Array.isArray(node.navItems) && node.navItems.length > 0 ? node.navItems : DEFAULT_NAV_ITEMS;
  }, [node.navItems]);

  const activeItems = useMemo(() => {
    return items.filter((it) => it.enabled !== false);
  }, [items]);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [detectedBgInfo, setDetectedBgInfo] = useState<{ bg: string; isDark: boolean; rgb: [number, number, number] } | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  const isUserClickingRef = useRef<boolean>(false);

  const updateDetectedBg = (info: { bg: string; isDark: boolean; rgb: [number, number, number] } | null) => {
    if (!info) return;
    setDetectedBgInfo((prev) => {
      if (prev && prev.bg === info.bg && prev.isDark === info.isDark) {
        return prev;
      }
      return info;
    });
  };

  // Appearance settings
  const position = node.navPosition || 'fixed-bottom';
  const alignment = node.navAlignment || 'center';
  const dockShape = node.navDockShape || 'pill';
  const itemShape = node.navItemShape || 'circle';
  const size = node.navSize || 'md';
  const labelMode = node.navLabelMode || 'tooltip';
  const showTooltip = node.navShowTooltip !== false;

  // Adaptive background resolution
  const currentActiveItem = activeItems[activeIdx] || activeItems[0];
  const adaptiveBgMode = node.navAdaptiveBgMode || 'auto-section';
  const adaptiveStyle = node.navAdaptiveStyle || 'frosted-tint';

  // Effective colors
  const resolvedColors = useMemo(() => {
    // 1. Highest priority: Per-item custom styling if set on active item
    if (currentActiveItem?.dockBg) {
      return {
        dockBg: currentActiveItem.dockBg,
        dockBorderColor: currentActiveItem.dockBorderColor || node.navDockBorderColor || 'rgba(255,255,255,0.12)',
        activeBg: currentActiveItem.activeBg || node.navActiveBg || '#3a3f44',
        activeIconColor: currentActiveItem.activeIconColor || node.navActiveIconColor || '#ffffff',
        inactiveBg: currentActiveItem.inactiveBg || node.navInactiveBg || '#ffffff',
        inactiveIconColor: currentActiveItem.inactiveIconColor || node.navInactiveIconColor || '#262a2d',
        tooltipBg: currentActiveItem.tooltipBg || node.navTooltipBg || '#ffffff',
        tooltipTextColor: currentActiveItem.tooltipTextColor || node.navTooltipTextColor || '#1e293b',
      };
    }

    const defaultDockBg = node.navDockBg || '#ffffff';
    const defaultBorder = node.navDockBorderColor || 'rgba(0,0,0,0.08)';
    const defaultActiveBg = node.navActiveBg || '#3a3f44';
    const defaultActiveIcon = node.navActiveIconColor || '#ffffff';
    const defaultInactiveBg = node.navInactiveBg || '#ffffff';
    const defaultInactiveIcon = node.navInactiveIconColor || '#262a2d';
    const defaultTooltipBg = node.navTooltipBg || '#ffffff';
    const defaultTooltipText = node.navTooltipTextColor || '#1e293b';

    // 2. Adaptive Background: Auto-Section or Frosted Tint based on viewport section
    if (adaptiveBgMode === 'auto-section' && detectedBgInfo) {
      const isDark = detectedBgInfo.isDark;
      const [r, g, b] = detectedBgInfo.rgb;

      if (adaptiveStyle === 'frosted-tint') {
        const bgAlpha = isDark ? 0.88 : 0.92;
        const dockBg = `rgba(${r}, ${g}, ${b}, ${bgAlpha})`;
        const dockBorderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
        const activeBg = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(38,42,45,0.95)';
        const activeIconColor = isDark ? '#1a1d1f' : '#ffffff';
        const inactiveBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)';
        const inactiveIconColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.75)';

        return {
          dockBg,
          dockBorderColor,
          activeBg,
          activeIconColor,
          inactiveBg,
          inactiveIconColor,
          tooltipBg: defaultTooltipBg,
          tooltipTextColor: defaultTooltipText,
        };
      }

      if (adaptiveStyle === 'smart-contrast') {
        const dockBg = isDark ? 'rgba(28,32,36,0.92)' : 'rgba(255,255,255,0.92)';
        const dockBorderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
        const activeBg = isDark ? '#ffffff' : '#262a2d';
        const activeIconColor = isDark ? '#181b1d' : '#ffffff';
        const inactiveBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
        const inactiveIconColor = isDark ? '#d1d5db' : '#4b5563';

        return {
          dockBg,
          dockBorderColor,
          activeBg,
          activeIconColor,
          inactiveBg,
          inactiveIconColor,
          tooltipBg: defaultTooltipBg,
          tooltipTextColor: defaultTooltipText,
        };
      }
    }

    // 3. Fallback to manual widget node settings
    return {
      dockBg: defaultDockBg,
      dockBorderColor: defaultBorder,
      activeBg: defaultActiveBg,
      activeIconColor: defaultActiveIcon,
      inactiveBg: defaultInactiveBg,
      inactiveIconColor: defaultInactiveIcon,
      tooltipBg: defaultTooltipBg,
      tooltipTextColor: defaultTooltipText,
    };
  }, [currentActiveItem, adaptiveBgMode, adaptiveStyle, detectedBgInfo, node]);

  // Sizing & Spacing
  const buttonDimensions = useMemo(() => {
    switch (size) {
      case 'sm':
        return { btnSize: 32, iconSize: 14, dockPadding: '5px 8px', gap: 6 };
      case 'lg':
        return { btnSize: 44, iconSize: 21, dockPadding: '8px 14px', gap: 10 };
      case 'md':
      default:
        return { btnSize: 38, iconSize: 17, dockPadding: '6px 10px', gap: 8 };
    }
  }, [size]);

  const btnSize = buttonDimensions.btnSize;
  const iconSize = node.navIconSize ? Number(node.navIconSize) : buttonDimensions.iconSize;
  const gap = node.navGap !== undefined ? Number(node.navGap) : buttonDimensions.gap;
  const dockPadding = node.navPadding || buttonDimensions.dockPadding;

  // Dock Border Radius
  const dockRadius = useMemo(() => {
    switch (dockShape) {
      case 'rounded':
        return '16px';
      case 'square':
        return '4px';
      case 'none':
        return '0px';
      case 'pill':
      default:
        return '9999px';
    }
  }, [dockShape]);

  // Button Border Radius
  const itemRadius = useMemo(() => {
    switch (itemShape) {
      case 'squircle':
        return '10px';
      case 'square':
        return '4px';
      case 'ghost':
        return '50%';
      case 'circle':
      default:
        return '50%';
    }
  }, [itemShape]);

  // Custom typography
  const fontSize = node.navFontSize !== undefined ? Number(node.navFontSize) : 12;
  const fontFamily = node.navFontFamily || 'inherit';
  const fontWeight = node.navFontWeight || '600';
  const dockBorderWidth = typeof node.navDockBorderWidth === 'number' ? node.navDockBorderWidth : 0;
  const dockShadow = node.navDockShadow || '0 8px 30px rgba(0,0,0,0.18)';

  // Listen for manual section test event from InspectorPanel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleTestNav = (e: any) => {
      if (e.detail && typeof e.detail.index === 'number') {
        const targetIdx = Math.max(0, Math.min(e.detail.index, activeItems.length - 1));
        setActiveIdx(targetIdx);
        const item = activeItems[targetIdx];
        if (item) {
          const scrollContainer = resolveScrollContainer(widgetRef.current);
          const targetEl = findTargetSectionElement(item, scrollContainer);
          if (targetEl) {
            const bgInfo = detectElementBackgroundColor(targetEl);
            if (bgInfo) updateDetectedBg(bgInfo);
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };
    window.addEventListener('studio:test-nav-section', handleTestNav);
    return () => window.removeEventListener('studio:test-nav-section', handleTestNav);
  }, [activeItems]);

  // Initial detection for current active item
  const currentTargetSec = currentActiveItem?.targetSection;
  const currentTargetId = currentActiveItem?.targetId;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrollContainer = resolveScrollContainer(widgetRef.current);
    const curItem = activeItems[activeIdx];
    const targetEl = curItem
      ? findTargetSectionElement(curItem, scrollContainer)
      : (document.querySelector('[data-section-type="cover"]') || document.getElementById('studio-canvas-stage'));
    if (targetEl) {
      const info = detectElementBackgroundColor(targetEl as HTMLElement);
      if (info) updateDetectedBg(info);
    }
  }, [activeIdx, currentTargetSec, currentTargetId]);

  // Robust Scroll Spy in Preview / Live Mode and Studio Canvas Stage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;

    const handleScroll = (event?: Event) => {
      // Avoid changing active item while user is smoothly scrolling to a clicked nav item
      if (isUserClickingRef.current) return;

      // 1. Determine active scroll container
      let scrollContainer: HTMLElement | null = null;

      if (event?.target && event.target !== window && event.target !== document) {
        const t = event.target as HTMLElement;
        if (t && t.scrollHeight > t.clientHeight + 10) {
          scrollContainer = t;
        }
      }

      if (!scrollContainer) {
        scrollContainer = resolveScrollContainer(widgetRef.current);
      }

      const scrollTop = scrollContainer
        ? scrollContainer.scrollTop
        : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);

      const clientHeight = scrollContainer
        ? scrollContainer.clientHeight
        : (window.innerHeight || document.documentElement.clientHeight);

      const scrollHeight = scrollContainer
        ? scrollContainer.scrollHeight
        : (document.documentElement.scrollHeight || document.body.scrollHeight);

      const containerRect = scrollContainer
        ? scrollContainer.getBoundingClientRect()
        : { top: 0, bottom: clientHeight, left: 0, right: window.innerWidth };

      // 2. Viewport probe line at 35% from the top of the viewing area
      const probeY = clientHeight * 0.35;

      let bestIdx = 0; // Default to first item (Home / Cover)
      let bestEl: HTMLElement | null = null;

      // RULE 1: If user is near top of scrollable area, ALWAYS activate Home / Cover (index 0)
      if (scrollTop < 80) {
        bestIdx = 0;
        bestEl = findTargetSectionElement(activeItems[0], scrollContainer);
      }
      // RULE 2: If user has scrolled near bottom of page (must have actually scrolled down > 120px)
      else if (scrollTop > 120 && scrollHeight > clientHeight + 100 && (scrollTop + clientHeight >= scrollHeight - 40)) {
        bestIdx = activeItems.length - 1;
        bestEl = findTargetSectionElement(activeItems[bestIdx], scrollContainer);
      }
      // RULE 3: Viewport probe line detection
      else {
        let found = false;

        // Pass 1: Strict probe line containment: top <= probeY and bottom > probeY
        for (let idx = 0; idx < activeItems.length; idx++) {
          const item = activeItems[idx];
          const el = findTargetSectionElement(item, scrollContainer);
          if (!el) continue;

          const rect = el.getBoundingClientRect();
          const top = rect.top - containerRect.top;
          const bottom = rect.bottom - containerRect.top;

          if (top <= probeY && bottom > probeY) {
            bestIdx = idx;
            bestEl = el;
            found = true;
            break;
          }
        }

        // Pass 2: If probe line is in between sections, choose section with largest visible area in viewport
        if (!found) {
          let maxVisible = -1;
          for (let idx = 0; idx < activeItems.length; idx++) {
            const item = activeItems[idx];
            const el = findTargetSectionElement(item, scrollContainer);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const top = rect.top - containerRect.top;
            const bottom = rect.bottom - containerRect.top;

            const visibleHeight = Math.max(0, Math.min(bottom, clientHeight) - Math.max(top, 0));
            if (visibleHeight > maxVisible && visibleHeight > 20) {
              maxVisible = visibleHeight;
              bestIdx = idx;
              bestEl = el;
              found = true;
            }
          }
        }

        // Pass 3: Fallback to last section whose top <= probeY and bottom > 0
        if (!found) {
          for (let idx = 0; idx < activeItems.length; idx++) {
            const item = activeItems[idx];
            const el = findTargetSectionElement(item, scrollContainer);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const top = rect.top - containerRect.top;
            const bottom = rect.bottom - containerRect.top;

            if (top <= probeY && bottom > 0) {
              bestIdx = idx;
              bestEl = el;
            }
          }
        }
      }

      if (bestIdx >= 0) {
        setActiveIdx((prev) => (prev === bestIdx ? prev : bestIdx));
        if (bestEl) {
          const bgInfo = detectElementBackgroundColor(bestEl);
          if (bgInfo) updateDetectedBg(bgInfo);
        }
      }
    };

    const throttledScroll = (e?: Event) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        handleScroll(e);
      });
    };

    // Attach listeners across all possible scroll targets (window, document, capture & non-capture)
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('scroll', throttledScroll, { capture: true, passive: true });
    document.addEventListener('scroll', throttledScroll, { passive: true });
    document.addEventListener('scroll', throttledScroll, { capture: true, passive: true });
    window.addEventListener('resize', throttledScroll, { passive: true });

    const scrollContainer = resolveScrollContainer(widgetRef.current);
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', throttledScroll, { passive: true });
    }

    // Initial detection on load and short delays to allow images and layout to settle
    const timer1 = setTimeout(() => handleScroll(), 100);
    const timer2 = setTimeout(() => handleScroll(), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('scroll', throttledScroll, { capture: true });
      document.removeEventListener('scroll', throttledScroll);
      document.removeEventListener('scroll', throttledScroll, { capture: true });
      window.removeEventListener('resize', throttledScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', throttledScroll);
      }
    };
  }, [activeItems]);

  // Handle smooth scroll to section
  const handleItemClick = (e: React.MouseEvent, item: NavItem, idx: number) => {
    e.stopPropagation();
    setActiveIdx(idx);

    // Suppress scroll-spy race while smooth scroll transition is in progress
    isUserClickingRef.current = true;
    setTimeout(() => {
      isUserClickingRef.current = false;
    }, 850);

    const scrollContainer = resolveScrollContainer(widgetRef.current);
    const targetEl = findTargetSectionElement(item, scrollContainer);
    if (targetEl) {
      const bgInfo = detectElementBackgroundColor(targetEl);
      if (bgInfo) updateDetectedBg(bgInfo);
    }

    if (!isPreviewMode) {
      if (onSelectNode) onSelectNode(node.id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const sec = (item.targetSection || '').toLowerCase().trim();
    if (sec === 'cover' || sec === 'home') {
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetEl) {
      if (scrollContainer) {
        const cRect = scrollContainer.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();
        const delta = tRect.top - cRect.top;
        scrollContainer.scrollBy({ top: delta, behavior: 'smooth' });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Outer container positioning styles
  const isFixed = position === 'fixed-bottom' || position === 'fixed-top';

  const positionStyles: React.CSSProperties = useMemo(() => {
    if (!isFixed) {
      return {
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        padding: '12px 0',
      };
    }

    // In Studio canvas mode, position sticky/relative or fixed to preview container
    if (!isPreviewMode) {
      return {
        position: 'sticky',
        bottom: '16px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        zIndex: 50,
        padding: '8px 12px',
        overflow: 'visible',
      };
    }

    // Fixed in preview / live mode
    return {
      position: 'fixed',
      ...(position === 'fixed-top' ? { top: '20px' } : { bottom: '20px' }),
      left: alignment === 'left' ? '20px' : alignment === 'right' ? 'auto' : '50%',
      right: alignment === 'right' ? '20px' : 'auto',
      transform: alignment === 'center' ? 'translateX(-50%)' : 'none',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'auto',
      maxWidth: 'calc(100vw - 24px)',
      overflow: 'visible',
    };
  }, [isFixed, position, alignment, isPreviewMode]);

  const isFixedTop = position === 'fixed-top';

  return (
    <div
      ref={widgetRef}
      id={`node-dom-${node.id}`}
      style={positionStyles}
      className={`joinme-floating-nav-wrapper ${isSelected ? 'studio-node-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectNode) onSelectNode(node.id);
      }}
    >
      {/* Navigation Dock Pill */}
      <nav
        role="navigation"
        aria-label="Navigasi Undangan"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${gap}px`,
          backgroundColor: dockShape === 'none' ? 'transparent' : resolvedColors.dockBg,
          padding: dockPadding,
          borderRadius: dockRadius,
          border: dockBorderWidth > 0 ? `${dockBorderWidth}px solid ${resolvedColors.dockBorderColor}` : (resolvedColors.dockBorderColor ? `1px solid ${resolvedColors.dockBorderColor}` : 'none'),
          boxShadow: dockShape === 'none' ? 'none' : dockShadow,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease',
          userSelect: 'none',
          maxWidth: '100%',
          overflow: 'visible',
          fontFamily,
          position: 'relative',
        }}
      >
        {activeItems.map((item, idx) => {
          const isActive = idx === activeIdx;
          const isHovered = idx === hoveredIdx;
          const showItemTooltip = showTooltip && labelMode === 'tooltip' && isHovered;

          const currentBg = isActive
            ? resolvedColors.activeBg
            : itemShape === 'ghost'
            ? 'transparent'
            : resolvedColors.inactiveBg;

          const currentColor = isActive ? resolvedColors.activeIconColor : resolvedColors.inactiveIconColor;

          return (
            <div
              key={item.id || `nav-btn-${idx}`}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isHovered ? 50 : (isActive ? 10 : 1),
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip speech bubble above or below button */}
              {showItemTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    ...(isFixedTop ? { top: 'calc(100% + 9px)' } : { bottom: 'calc(100% + 9px)' }),
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: resolvedColors.tooltipBg,
                    color: resolvedColors.tooltipTextColor,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    fontFamily,
                    padding: '5px 11px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    pointerEvents: 'none',
                    zIndex: 100,
                    lineHeight: '1.3',
                    opacity: 1,
                    animation: isFixedTop
                      ? 'joinmeNavTooltipPopTop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                      : 'joinmeNavTooltipPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                  }}
                >
                  {item.label}
                  {/* Little directional arrow pointer */}
                  <div
                    style={isFixedTop ? {
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderBottom: `6px solid ${resolvedColors.tooltipBg}`,
                      transition: 'border-bottom-color 0.3s ease',
                    } : {
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: `6px solid ${resolvedColors.tooltipBg}`,
                      transition: 'border-top-color 0.3s ease',
                    }}
                  />
                </div>
              )}

              {/* Icon Button */}
              <button
                type="button"
                onClick={(e) => handleItemClick(e, item, idx)}
                title={item.label}
                aria-label={item.label}
                style={{
                  width: `${btnSize}px`,
                  height: `${btnSize}px`,
                  borderRadius: itemRadius,
                  backgroundColor: currentBg,
                  color: currentColor,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive
                    ? '0 2px 8px rgba(0,0,0,0.2)'
                    : itemShape !== 'ghost'
                    ? '0 2px 6px rgba(0,0,0,0.06)'
                    : 'none',
                  transform: isActive ? 'scale(1.05)' : isHovered ? 'scale(1.03)' : 'scale(1)',
                  outline: 'none',
                }}
              >
                {renderNavIcon(item.iconType, item.customIconSvg, iconSize, currentColor)}
              </button>

              {/* Bottom text label if mode is text or bottom */}
              {(labelMode === 'text' || labelMode === 'bottom') && (
                <span
                  style={{
                    fontSize: `${Math.max(9, fontSize - 2)}px`,
                    fontWeight: isActive ? '700' : '500',
                    color: currentColor,
                    marginTop: '3px',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Embedded CSS keyframe for smooth tooltip animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes joinmeNavTooltipPop {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(4px) scale(0.92);
            }
            100% {
              opacity: 1;
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
          @keyframes joinmeNavTooltipPopTop {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(-4px) scale(0.92);
            }
            100% {
              opacity: 1;
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
        `
      }} />
    </div>
  );
}
