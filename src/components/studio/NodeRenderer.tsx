import React, { useState, useEffect } from 'react';
import { StudioNode, SectionType } from '@/types';
import { resolveTextVariables, useStudioStore, WishItem, SAMPLE_VARIABLES } from '@/store/studio-store';
import { LightboxModal } from '@/components/studio/LightboxModal';
import { RsvpResultCard } from '@/components/studio/RsvpResultCard';
import { GiftRegistryCards } from '@/components/studio/GiftRegistryCards';
import { LoveStoryTimeline } from '@/components/studio/LoveStoryTimeline';
import { PhotoGalleryGrid } from '@/components/studio/PhotoGalleryGrid';
import { ThankYouClosing } from '@/components/studio/ThankYouClosing';

export function getOrderedAndFilteredNodes(
  nodes: StudioNode[],
  eventDetails?: any
): StudioNode[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];

  const sectionOrder: SectionType[] = eventDetails?.sectionOrder || [
    'cover',
    'hero',
    'opening',
    'bride_groom',
    'event_schedule',
    'live_streaming',
    'love_story',
    'gallery',
    'rsvp',
    'wishes',
    'gift',
    'ig_stories',
    'thank_you',
    'footer',
  ];

  const hiddenSections: Record<string, boolean> = eventDetails?.hiddenSections || {};

  // 1. Filter out hidden containers (cover & footer can never be hidden)
  const visibleNodes = nodes.filter((n) => {
    if (n.type === 'container' && n.sectionType) {
      if (n.sectionType === 'cover' || n.sectionType === 'footer') return true;
      if (hiddenSections[n.sectionType] === true) return false;
    }
    return true;
  });

  // 2. Sort containers according to sectionOrder
  const sortedNodes = [...visibleNodes].sort((a, b) => {
    const secA = a.sectionType;
    const secB = b.sectionType;

    if (secA === 'cover') return -1;
    if (secB === 'cover') return 1;
    if (secA === 'footer') return 1;
    if (secB === 'footer') return -1;

    const idxA = secA ? sectionOrder.indexOf(secA) : 999;
    const idxB = secB ? sectionOrder.indexOf(secB) : 999;

    return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
  });

  return sortedNodes;
}

export function collectGalleryImageUrls(nodes: StudioNode[], eventDetails?: any): string[] {
  let list: string[] = [];
  if (Array.isArray(nodes)) {
    nodes.forEach((n) => {
      if (n.type === 'image' && n.showInGallery) {
        let imgUrl = n.content;
        if (n.isDynamic && n.binding && eventDetails) {
          const bound = (eventDetails as any)[n.binding];
          if (bound) imgUrl = bound;
        }
        if (imgUrl && !list.includes(imgUrl)) {
          list.push(imgUrl);
        }
      }
      if (n.children && n.children.length > 0) {
        const sub = collectGalleryImageUrls(n.children, eventDetails);
        sub.forEach((url) => {
          if (url && !list.includes(url)) list.push(url);
        });
      }
    });
  }

  if (eventDetails && Array.isArray(eventDetails.gallery) && eventDetails.gallery.length > 0) {
    eventDetails.gallery.forEach((url: string) => {
      if (url && typeof url === 'string' && !list.includes(url)) {
        list.push(url);
      }
    });
  }

  return list;
}

export function isGallerySectionNode(node: StudioNode): boolean {
  if (!node) return false;

  const wType = String(node.widgetType || '').toLowerCase();
  const nType = String(node.type || '').toLowerCase();
  const nLabel = String(node.label || '').toLowerCase();
  const nId = String(node.id || '').toLowerCase();

  if (wType === 'gallery' || wType === 'gallery-feed') return true;
  if (nType === 'gallery' || nType === 'gallery-feed') return true;
  if (nLabel.includes('gallery') || nLabel.includes('galeri')) return true;
  if (nId.includes('gallery') || nId.includes('galeri')) return true;

  if (Array.isArray(node.children) && node.children.some((c) => c.showInGallery || String(c.widgetType).includes('gallery') || String(c.type).includes('gallery'))) {
    return true;
  }

  return false;
}

export function resolveSocialButtonUrl(action: string, rawUrlOrTag: string, eventDetails?: any): string | null {
  if (!rawUrlOrTag && !action) return null;

  let resolvedVal = rawUrlOrTag || '';
  if (resolvedVal.includes('{') && resolvedVal.includes('}')) {
    resolvedVal = resolveTextVariables(resolvedVal, eventDetails);
  }

  resolvedVal = resolvedVal.trim();
  if (!resolvedVal || resolvedVal.startsWith('{')) return null;

  const cleanHandle = resolvedVal.replace(/^@/, '');

  switch (action) {
    case 'open-instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'open-tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'open-facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'open-whatsapp': {
      const cleanPhone = resolvedVal.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
      return `https://wa.me/${formattedPhone}`;
    }
    case 'open-youtube':
      return `https://youtube.com/${cleanHandle}`;
    case 'open-url':
      return resolvedVal.startsWith('http://') || resolvedVal.startsWith('https://') ? resolvedVal : `https://${resolvedVal}`;
    default:
      return resolvedVal;
  }
}

export function cloneAndBindEventData(templateNode: StudioNode, evtData: any, idx: number): StudioNode {
  const cloned: StudioNode = JSON.parse(JSON.stringify(templateNode));
  cloned.id = `${cloned.id}-evt-${idx}`;

  const replaceEvtText = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/Akad Nikah/gi, evtData.title || 'Akad Nikah')
      .replace(/\{\{event_title\}\}/gi, evtData.title || 'Acara')
      .replace(/\{\{nama_acara\}\}/gi, evtData.title || 'Acara')
      .replace(/\{\{event_date\}\}/gi, evtData.date || '')
      .replace(/\{\{event_time\}\}/gi, evtData.time || '')
      .replace(/\{\{event_location\}\}/gi, evtData.location || '')
      .replace(/Jl\. Asia Afrika No\. 8, Bandung/gi, evtData.address || 'Jl. Asia Afrika No. 8, Bandung')
      .replace(/\{\{event_address\}\}/gi, evtData.address || '');
  };

  if (cloned.content) {
    cloned.content = replaceEvtText(cloned.content);
  }

  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map((child) => cloneAndBindEventData(child, evtData, idx));
  }

  return cloned;
}

export function generateGoogleCalendarUrl(eventDetails: any): string {
  const title = eventDetails?.title || eventDetails?.couple_name || 'Acara Pernikahan';
  const location = [eventDetails?.location, eventDetails?.address].filter(Boolean).join(', ') || 'Lokasi Acara';
  const details = `Undangan Pernikahan ${title}. Diharapkan hadir memberikan doa restu.`;

  let startDateStr = '20260921T080000Z';
  let endDateStr = '20260921T110000Z';

  if (eventDetails?.date) {
    const rawDate = String(eventDetails.date);
    const match = rawDate.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (match) {
      const yyyy = match[1];
      const mm = match[2];
      const dd = match[3];
      startDateStr = `${yyyy}${mm}${dd}T080000Z`;
      endDateStr = `${yyyy}${mm}${dd}T110000Z`;
    }
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

export function cloneAndBindWishData(templateNode: StudioNode, wishItem: WishItem, idx: number): StudioNode {
  const cloned: StudioNode = JSON.parse(JSON.stringify(templateNode));
  cloned.id = `${cloned.id}-wish-${idx}`;

  const replaceWishText = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/Budi & Partner/gi, wishItem.name)
      .replace(/\{\{wish_name\}\}/gi, wishItem.name)
      .replace(/\{\{nama_tamu\}\}/gi, wishItem.name)
      .replace(/✅ Hadir/gi, wishItem.attendance)
      .replace(/\{\{wish_attendance\}\}/gi, wishItem.attendance)
      .replace(/\{\{status_kehadiran\}\}/gi, wishItem.attendance)
      .replace(/Selamat ya Roni & Anti! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin./gi, wishItem.message)
      .replace(/\{\{wish_message\}\}/gi, wishItem.message)
      .replace(/\{\{pesan_ucapan\}\}/gi, wishItem.message);
  };

  if (cloned.content) {
    cloned.content = replaceWishText(cloned.content);
  }

  if (cloned.children && cloned.children.length > 0) {
    cloned.children = cloned.children.map((child) => cloneAndBindWishData(child, wishItem, idx));
  }

  return cloned;
}

const DEFAULT_GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80',
];

function ContainerSlideshowBackground({ style, allNodes, slideIndex }: { style: any; allNodes?: StudioNode[]; slideIndex: number }) {
  const storeNodes = useStudioStore.getState().nodes;
  const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
  let galleryImages = collectGalleryImageUrls(nodesToSearch);

  if (galleryImages.length === 0) {
    if (style.backgroundImage) {
      galleryImages = [style.backgroundImage, ...DEFAULT_GALLERY_FALLBACKS];
    } else {
      galleryImages = DEFAULT_GALLERY_FALLBACKS;
    }
  }

  const effect = style.bgSlideshowEffect || 'fade';
  const overlayColor = style.backgroundOverlayColor || 'rgba(0, 0, 0, 0.4)';
  const activeIdx = galleryImages.length > 0 ? slideIndex % galleryImages.length : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
      }}
    >
      {galleryImages.map((imgUrl, idx) => {
        const isActive = idx === activeIdx;

        let transformStyle = 'scale(1)';
        let transitionStyle = 'opacity 1.2s ease-in-out';

        if (effect === 'kenburns') {
          transformStyle = isActive ? 'scale(1.15)' : 'scale(1)';
          transitionStyle = 'opacity 1.2s ease-in-out, transform 8s ease-in-out';
        } else if (effect === 'slide') {
          transformStyle = isActive ? 'translateX(0)' : idx < activeIdx ? 'translateX(-100%)' : 'translateX(100%)';
          transitionStyle = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
        }

        return (
          <div
            key={imgUrl + idx}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${imgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isActive ? 1 : 0,
              transform: transformStyle,
              transition: transitionStyle,
            }}
          />
        );
      })}

      {/* Overlay for legibility */}
      {overlayColor && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

interface NodeRendererProps {
  node: StudioNode;
  allNodes?: StudioNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  eventDetails?: any;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  isPreviewMode?: boolean;
  onOpenCover?: () => void;
}

export function getResponsiveStyle(style: any, key: string, defaultValue: any, viewportMode: string = 'desktop') {
  if (!style) return defaultValue;

  let activeMode = viewportMode;
  if ((!activeMode || activeMode === 'auto') && typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width <= 640) activeMode = 'mobile';
    else if (width <= 1024) activeMode = 'tablet';
    else activeMode = 'desktop';
  }

  if (activeMode === 'mobile') {
    const mobKey = key + 'Mobile';
    if (style[mobKey] !== undefined && style[mobKey] !== '') return style[mobKey];

    const tabKey = key + 'Tablet';
    if (style[tabKey] !== undefined && style[tabKey] !== '') return style[tabKey];

    if (style[key] !== undefined && style[key] !== '') return style[key];
  } else if (activeMode === 'tablet') {
    const tabKey = key + 'Tablet';
    if (style[tabKey] !== undefined && style[tabKey] !== '') return style[tabKey];

    if (style[key] !== undefined && style[key] !== '') return style[key];
  } else {
    if (style[key] !== undefined && style[key] !== '') return style[key];
  }
  return defaultValue;
}

export function NodeRenderer({
  node,
  allNodes,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  eventDetails,
  viewportMode = 'desktop',
  isPreviewMode = false,
  onOpenCover,
}: NodeRendererProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const submittedRsvp = useStudioStore((s) => s.submittedRsvp);

  const style = node.style || {};
  const isSlideshowBg = node.type === 'container' && style.bgType === 'gallery-slideshow';
  const isSliderWidget = node.type === 'slider';

  const rawInterval = isSliderWidget
    ? style.sliderInterval
    : style.bgSlideshowInterval;

  const intervalSec = typeof rawInterval === 'number'
    ? rawInterval
    : (rawInterval ? parseInt(String(rawInterval), 10) : 5);

  useEffect(() => {
    if (!isSlideshowBg && !isSliderWidget) return;
    const storeNodes = useStudioStore.getState().nodes;
    const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
    let gImages = collectGalleryImageUrls(nodesToSearch);

    if (gImages.length === 0) {
      if (style.backgroundImage || node.content) {
        gImages = [style.backgroundImage || node.content || '', ...DEFAULT_GALLERY_FALLBACKS].filter(Boolean);
      } else {
        gImages = DEFAULT_GALLERY_FALLBACKS;
      }
    }

    if (gImages.length <= 1) return;

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % gImages.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isSlideshowBg, isSliderWidget, allNodes, intervalSec, style.backgroundImage, node.content]);

  const isSelected = !isPreviewMode && selectedNodeId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    onSelectNode(node.id);
  };

  const contentText = resolveTextVariables(node.content || '', eventDetails);

  // Compute CSS Style object for the node container wrapper
  const posVal = getResponsiveStyle(style, 'position', undefined, viewportMode);
  const displayVal = getResponsiveStyle(style, 'display', undefined, viewportMode);
  const isHiddenDisplay = displayVal === 'none' || style.display === 'none';

  const computedStyle: React.CSSProperties = {
    display: isHiddenDisplay ? 'none' : undefined,
    width: getResponsiveStyle(style, 'width', '100%', viewportMode),
    height: getResponsiveStyle(style, 'height', 'auto', viewportMode),
    minHeight: getResponsiveStyle(style, 'minHeight', undefined, viewportMode),
    padding: getResponsiveStyle(style, 'padding', '0px', viewportMode),
    margin: getResponsiveStyle(style, 'margin', '0px', viewportMode),
    color: style.color || undefined,
    backgroundColor: style.backgroundColor || undefined,
    borderWidth: style.borderWidth ? (typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : style.borderWidth) : undefined,
    borderStyle: style.borderStyle || undefined,
    borderColor: style.borderColor || undefined,
    fontSize: style.fontSize ? `${getResponsiveStyle(style, 'fontSize', style.fontSize, viewportMode)}px` : undefined,
    fontFamily: style.fontFamily || undefined,
    fontWeight: getResponsiveStyle(style, 'fontWeight', style.fontWeight || undefined, viewportMode),
    textAlign: getResponsiveStyle(style, 'textAlign', undefined, viewportMode) as any,
    letterSpacing: style.letterSpacing || undefined,
    textTransform: style.textTransform as any || undefined,
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
    opacity: style.opacity ? parseFloat(String(style.opacity)) : undefined,
    boxShadow: getResponsiveStyle(style, 'boxShadow', undefined, viewportMode),
    position: (posVal || undefined) as any,
    top: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'top', undefined, viewportMode) : undefined,
    right: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'right', undefined, viewportMode) : undefined,
    bottom: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'bottom', undefined, viewportMode) : undefined,
    left: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'left', undefined, viewportMode) : undefined,
    zIndex: posVal && posVal !== 'static' && style.zIndex ? (parseInt(String(style.zIndex), 10) || style.zIndex) : undefined,
    scrollbarWidth: style.hideScrollbar ? 'none' : undefined,
    msOverflowStyle: style.hideScrollbar ? 'none' : undefined,
  };

  const backdropFilterVal = getResponsiveStyle(style, 'backdropFilter', undefined, viewportMode);
  if (backdropFilterVal) {
    computedStyle.backdropFilter = backdropFilterVal;
    computedStyle.WebkitBackdropFilter = backdropFilterVal;
  }

  const overflowVal = getResponsiveStyle(style, 'overflow', undefined, viewportMode);
  const overflowXVal = getResponsiveStyle(style, 'overflowX', undefined, viewportMode);
  const overflowYVal = getResponsiveStyle(style, 'overflowY', undefined, viewportMode);

  if (overflowVal) {
    computedStyle.overflow = overflowVal as any;
  } else {
    if (overflowXVal) computedStyle.overflowX = overflowXVal as any;
    if (overflowYVal) computedStyle.overflowY = overflowYVal as any;
  }

  const flexShrinkVal = getResponsiveStyle(style, 'flexShrink', style.flexShrink !== undefined ? style.flexShrink : 0, viewportMode);
  if (flexShrinkVal !== undefined) {
    computedStyle.flexShrink = Number(flexShrinkVal);
  }

  const flexGrowVal = getResponsiveStyle(style, 'flexGrow', style.flexGrow !== undefined ? style.flexGrow : undefined, viewportMode);
  if (flexGrowVal !== undefined) {
    computedStyle.flexGrow = Number(flexGrowVal);
  }

  const nodeClassName = `canvas-node-item ${isSelected ? 'selected' : ''} ${isPreviewMode ? 'is-preview-mode preview-mode' : ''} ${style.hideScrollbar ? 'no-scrollbar' : ''}`;

  if (style.bgType === 'gradient') {
    const dir = getResponsiveStyle(style, 'gradientDirection', 'to right', viewportMode);
    let colorStops: string[] = [];

    if (Array.isArray(style.gradientColors) && style.gradientColors.length > 0) {
      colorStops = style.gradientColors;
    } else {
      const c1 = style.gradientColor1 || '#8B5E3C';
      const c2 = style.gradientColor2 || '#C9A66B';
      colorStops = [c1, c2];
    }

    const stopsStr = colorStops.join(', ');
    computedStyle.backgroundImage = dir === 'radial' || dir === 'circle' ? `radial-gradient(circle, ${stopsStr})` : `linear-gradient(${dir}, ${stopsStr})`;
  } else if (style.bgType !== 'gallery-slideshow') {
    if (style.backgroundColor) computedStyle.backgroundColor = style.backgroundColor;
    const bgImg = getResponsiveStyle(style, 'backgroundImage', '', viewportMode);
    if (bgImg) {
      computedStyle.backgroundImage = `url(${bgImg})`;
      computedStyle.backgroundSize = getResponsiveStyle(style, 'backgroundSize', 'cover', viewportMode);
      computedStyle.backgroundPosition = getResponsiveStyle(style, 'backgroundPosition', 'center', viewportMode);
      computedStyle.backgroundRepeat = getResponsiveStyle(style, 'backgroundRepeat', 'no-repeat', viewportMode);
    }
  }

  // Action Overlay Handles
  const actionOverlay = !isPreviewMode && isSelected && (
    <div className="node-action-overlay">
      <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 800, paddingRight: '4px' }}>
        {node.type}
      </span>
      {onDuplicateNode && (
        <button
          type="button"
          className="btn-node-action"
          title="Duplikat Elemen"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicateNode(node.id);
          }}
        >
          📋
        </button>
      )}
      {onDeleteNode && (
        <button
          type="button"
          className="btn-node-action"
          title="Hapus Elemen"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(node.id);
          }}
        >
          🗑️
        </button>
      )}
    </div>
  );

  // Container Rendering
  if (node.type === 'container') {
    const displayMode = getResponsiveStyle(style, 'display', 'flex', viewportMode);
    const containerInnerStyle: React.CSSProperties = {
      display: displayMode as any,
      width: '100%',
      height: '100%',
      minHeight: 'inherit',
      position: 'relative',
      zIndex: 1,
    };

    if (displayMode === 'grid') {
      const cols = getResponsiveStyle(style, 'gridCols', 2, viewportMode);
      containerInnerStyle.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      containerInnerStyle.alignItems = getResponsiveStyle(style, 'alignItems', 'stretch', viewportMode);
      containerInnerStyle.justifyContent = getResponsiveStyle(style, 'justifyContent', 'stretch', viewportMode);
      containerInnerStyle.gap = style.gap !== undefined ? `${getResponsiveStyle(style, 'gap', style.gap, viewportMode)}px` : '12px';
    } else {
      containerInnerStyle.flexDirection = getResponsiveStyle(style, 'flexDirection', 'column', viewportMode);
      containerInnerStyle.justifyContent = getResponsiveStyle(style, 'justifyContent', 'center', viewportMode);
      containerInnerStyle.alignItems = getResponsiveStyle(style, 'alignItems', 'center', viewportMode);
      containerInnerStyle.flexWrap = getResponsiveStyle(style, 'flexWrap', undefined, viewportMode) as any;
      containerInnerStyle.gap = style.gap !== undefined ? `${getResponsiveStyle(style, 'gap', style.gap, viewportMode)}px` : '12px';
    }

    const containerStyle: React.CSSProperties = {
      ...computedStyle,
      position: computedStyle.position || 'relative',
      overflow: computedStyle.overflow || 'hidden',
    };

    // Dynamic Photo Gallery Feed Container Rendering & Auto-Hiding
    const isGalleryContainer = isGallerySectionNode(node);

    if (isGalleryContainer) {
      const userPhotos =
        eventDetails?.galleryImages ||
        eventDetails?.gallery ||
        eventDetails?.photos ||
        eventDetails?.images ||
        undefined;

      const hasUserPhotos = Array.isArray(userPhotos) && userPhotos.length > 0;
      const isExplicitlyDisabled =
        eventDetails?.enableGallery === false ||
        eventDetails?.enable_gallery === false ||
        eventDetails?.hasGallery === false;

      // In Preview Mode, if user uploaded NO photos or explicitly disabled gallery, AUTOMATICALLY HIDE ENTIRE CONTAINER (Return Null)
      if (isPreviewMode && (!hasUserPhotos || isExplicitlyDisabled)) {
        return null;
      }

      // Check if children array already contains heading & text nodes for section title
      const hasHeadingChild = Array.isArray(node.children) && node.children.some((c) => c.type === 'heading');

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          {/* Section Outer Column Wrapper (Guarantees Headline & Subtitle placed at TOP) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Section Headline Title & Subtitle Text */}
            {!hasHeadingChild && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '16px', width: '100%' }}>
                <h3 style={{ fontSize: '1.38rem', color: '#1e293b', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', margin: '0 0 6px 0' }}>
                  Galeri Foto Bahagia
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: '1.5', maxWidth: '480px' }}>
                  Momen-momen indah kebersamaan kami yang terekam dalam kenangan abadi.
                </p>
              </div>
            )}

            <div style={containerInnerStyle} className="container-inner-wrapper">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <NodeRenderer
                    key={child.id}
                    node={child}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                  />
                ))
              ) : (
                <PhotoGalleryGrid
                  images={userPhotos}
                  isPreviewMode={isPreviewMode}
                  showHeadline={false}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    // Dynamic Love Story Widget Container Rendering & Auto-Hiding
    if (node.widgetType === 'lovestory') {
      const isExplicitlyDisabled =
        eventDetails?.enableLoveStory === false ||
        eventDetails?.enable_love_story === false ||
        eventDetails?.hasLoveStory === false ||
        eventDetails?.isLoveStoryEnabled === false;

      // In Preview Mode, if explicitly disabled by user in wizard, automatically hide section
      if (isPreviewMode && isExplicitlyDisabled) {
        return null;
      }

      const activeStories = eventDetails?.loveStories || eventDetails?.stories || undefined;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {node.children?.map((child) => (
              <NodeRenderer
                key={child.id}
                node={child}
                allNodes={allNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onDuplicateNode={onDuplicateNode}
                eventDetails={eventDetails}
                viewportMode={viewportMode}
                isPreviewMode={isPreviewMode}
                onOpenCover={onOpenCover}
              />
            ))}

            <LoveStoryTimeline
              stories={activeStories}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>
      );
    }

    // Dynamic Gift Registry Widget Container Rendering
    if (node.widgetType === 'gift-widget') {
      const activeBanks = eventDetails?.bankAccounts || eventDetails?.rekening || undefined;
      const activeGiftAddr = eventDetails?.giftAddress || eventDetails?.gift_address || eventDetails?.alamat_kado || undefined;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {node.children?.map((child) => (
              <NodeRenderer
                key={child.id}
                node={child}
                allNodes={allNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onDuplicateNode={onDuplicateNode}
                eventDetails={eventDetails}
                viewportMode={viewportMode}
                isPreviewMode={isPreviewMode}
                onOpenCover={onOpenCover}
              />
            ))}

            <GiftRegistryCards
              bankAccounts={activeBanks}
              giftAddress={activeGiftAddr}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>
      );
    }

    // Dynamic RSVP Form Container Transformation to QR Code E-Ticket / Decision Card
    if (node.widgetType === 'rsvp-form' && isPreviewMode && submittedRsvp) {
      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}
          <RsvpResultCard
            data={submittedRsvp}
            onReset={() => useStudioStore.getState().setSubmittedRsvp(null)}
          />
        </div>
      );
    }

    // Dynamic Event Feed Container (isEventFeed) Rendering in Preview Mode
    if (node.isEventFeed && isPreviewMode) {
      const rawEvents = Array.isArray(eventDetails?.events) && eventDetails.events.length > 0
        ? eventDetails.events
        : [
            {
              title: 'Akad Nikah',
              date: eventDetails?.event_date || '21 September 2026',
              time: eventDetails?.event_time || '08:00 WIB',
              location: eventDetails?.event_location || 'Grand Ballroom Hotel Mulia, Jakarta',
              address: 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
              mapUrl: eventDetails?.mapUrl || 'https://maps.google.com/?q=Grand+Ballroom+Hotel+Mulia+Jakarta',
            },
            {
              title: 'Resepsi Pernikahan',
              date: eventDetails?.event_date || '21 September 2026',
              time: '11:00 WIB - Selesai',
              location: eventDetails?.event_location || 'Grand Ballroom Hotel Mulia, Jakarta',
              address: 'Jl. Asia Afrika No. 8, Gelora, Senayan, Jakarta Pusat',
              mapUrl: eventDetails?.mapUrl || 'https://maps.google.com/?q=Grand+Ballroom+Hotel+Mulia+Jakarta',
            },
          ];

      const sampleCardTemplate = node.children && node.children.length > 0 ? node.children[0] : null;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {rawEvents.map((evt: any, evtIdx: number) => {
              if (sampleCardTemplate) {
                const boundCard = cloneAndBindEventData(sampleCardTemplate, evt, evtIdx);
                return (
                  <NodeRenderer
                    key={`evt-card-${evtIdx}-${boundCard.id}`}
                    node={boundCard}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={{ ...eventDetails, ...evt, mapUrl: evt.mapUrl || eventDetails?.mapUrl }}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    // Dynamic Wishes Feed Container (isWishesFeed) Rendering in Preview Mode
    if (node.isWishesFeed && isPreviewMode) {
      const activeWishes = useStudioStore.getState().wishes;
      const sampleCardTemplate = node.children && node.children.length > 0 ? node.children[0] : null;

      return (
        <div
          id={`node-dom-${node.id}`}
          onClick={handleClick}
          style={containerStyle}
          className={nodeClassName}
        >
          {actionOverlay}

          <div style={containerInnerStyle} className="container-inner-wrapper">
            {activeWishes.map((wish: WishItem, wishIdx: number) => {
              if (sampleCardTemplate) {
                const boundCard = cloneAndBindWishData(sampleCardTemplate, wish, wishIdx);
                return (
                  <NodeRenderer
                    key={`wish-card-${wishIdx}-${boundCard.id}`}
                    node={boundCard}
                    allNodes={allNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                    eventDetails={eventDetails}
                    viewportMode={viewportMode}
                    isPreviewMode={isPreviewMode}
                    onOpenCover={onOpenCover}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={containerStyle}
        className={nodeClassName}
      >
        {actionOverlay}

        {isSlideshowBg ? (
          <ContainerSlideshowBackground style={style} allNodes={allNodes} slideIndex={slideIndex} />
        ) : (
          style.backgroundOverlayColor && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: style.backgroundOverlayColor,
                opacity: style.backgroundOverlayOpacity || 0.5,
                pointerEvents: 'none',
                borderRadius: 'inherit',
                zIndex: 0,
              }}
            />
          )
        )}

        <div style={containerInnerStyle} className="container-inner-wrapper">
          {node.children?.map((child) => (
            <NodeRenderer
              key={child.id}
              node={child}
              allNodes={allNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              eventDetails={eventDetails}
              viewportMode={viewportMode}
              isPreviewMode={isPreviewMode}
              onOpenCover={onOpenCover}
            />
          ))}
        </div>
      </div>
    );
  }

  // Heading
  if (node.type === 'heading') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        <span>{contentText}</span>
      </div>
    );
  }

  // Text Block
  if (node.type === 'text') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        <p style={{ margin: 0 }}>{contentText}</p>
      </div>
    );
  }

  // Button
  if (node.type === 'button') {
    const isCoverButton = node.buttonAction === 'open-cover' || contentText.toLowerCase().includes('buka undangan');
    const isMapsButton = node.buttonAction === 'google-maps' || contentText.toLowerCase().includes('google maps');
    const isCalendarButton = node.buttonAction === 'save-calendar' || contentText.toLowerCase().includes('simpan kalender') || contentText.toLowerCase().includes('save the date');
    const isRsvpButton = node.buttonAction === 'submit-rsvp' || contentText.toLowerCase().includes('kirim rsvp') || contentText.toLowerCase().includes('kirim konfirmasi');

    const isSocialAction = ['open-instagram', 'open-tiktok', 'open-facebook', 'open-whatsapp', 'open-youtube', 'open-url'].includes(node.buttonAction || '');
    const resolvedSocialUrl = isSocialAction ? resolveSocialButtonUrl(node.buttonAction || '', node.buttonUrl || '', eventDetails) : null;

    // In Preview Mode, automatically hide the button if the social account handle is empty!
    if (isPreviewMode && isSocialAction && !resolvedSocialUrl) {
      return null;
    }

    const handleButtonClick = (e: React.MouseEvent) => {
      if (isPreviewMode) {
        if (isSocialAction) {
          e.stopPropagation();
          if (resolvedSocialUrl) {
            window.open(resolvedSocialUrl, '_blank');
          }
          return;
        }
        if (isCoverButton && onOpenCover) {
          onOpenCover();
          return;
        }
        if (isMapsButton) {
          const mapUrl = eventDetails?.mapUrl || `https://maps.google.com/?q=${encodeURIComponent((eventDetails?.location || eventDetails?.event_location || '') + ' ' + (eventDetails?.address || eventDetails?.event_address || ''))}`;
          window.open(mapUrl, '_blank');
          return;
        }
        if (isCalendarButton) {
          const calUrl = generateGoogleCalendarUrl(eventDetails);
          window.open(calUrl, '_blank');
          return;
        }
        if (isRsvpButton) {
          e.stopPropagation();
          const btnEl = document.getElementById(`node-dom-${node.id}`);
          const formWrapper = btnEl?.closest('.container-inner-wrapper') || btnEl?.parentElement;

          const nameInp = (formWrapper?.querySelector('input[name="guest_name"], input[placeholder*="nama" i], input[type="text"]') || document.querySelector('input[name="guest_name"], input[placeholder*="nama" i]')) as HTMLInputElement;
          const selectInp = (formWrapper?.querySelector('select[name="attendance"], select') || document.querySelector('select[name="attendance"], select')) as HTMLSelectElement;
          const msgInp = (formWrapper?.querySelector('textarea[name="message"], textarea[placeholder*="ucapan" i], textarea') || document.querySelector('textarea[name="message"], textarea')) as HTMLTextAreaElement;

          const nameVal = nameInp?.value?.trim() || 'Tamu Undangan';
          const attendanceVal = selectInp?.value || '✅ Hadir';
          const msgVal = msgInp?.value?.trim();

          if (msgVal) {
            useStudioStore.getState().addWish({
              name: nameVal,
              attendance: attendanceVal.startsWith('✅') || attendanceVal.startsWith('🙏') || attendanceVal.startsWith('🕊️') ? attendanceVal : `✅ ${attendanceVal}`,
              message: msgVal,
            });
          }

          if (nameInp) nameInp.value = '';
          if (msgInp) msgInp.value = '';

          useStudioStore.getState().setSubmittedRsvp({
            name: nameVal,
            attendance: attendanceVal,
            message: msgVal,
          });
          return;
        }
      }
      handleClick(e);
    };

    const buttonIcon = node.icon?.trim();
    const iconPos = node.iconPosition || 'left';
    const gapPx = node.iconGap ?? 6;

    const buttonFlexStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: computedStyle.justifyContent || 'center',
      cursor: 'pointer',
      ...computedStyle,
    };

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleButtonClick}
        style={buttonFlexStyle}
        className={`btn btn-primary ${nodeClassName}`}
        role="button"
        tabIndex={0}
      >
        {actionOverlay}
        {buttonIcon && iconPos === 'left' && (
          <span style={{ marginRight: `${gapPx}px`, display: 'inline-flex', alignItems: 'center' }}>
            {buttonIcon}
          </span>
        )}
        <span>{contentText}</span>
        {buttonIcon && iconPos === 'right' && (
          <span style={{ marginLeft: `${gapPx}px`, display: 'inline-flex', alignItems: 'center' }}>
            {buttonIcon}
          </span>
        )}
      </div>
    );
  }

  // Image
  if (node.type === 'image') {
    const isGalleryImage = !!node.showInGallery;
    let imageUrl = node.content || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500';

    if (node.isDynamic && node.binding && eventDetails) {
      const boundVal = (eventDetails as any)[node.binding] || (SAMPLE_VARIABLES as any)[node.binding];
      if (boundVal) {
        imageUrl = boundVal;
      }
    }

    const handleImageClick = (e: React.MouseEvent) => {
      if (isPreviewMode && isGalleryImage) {
        e.stopPropagation();
        const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : useStudioStore.getState().nodes;
        const allGallery = collectGalleryImageUrls(nodesToSearch.length > 0 ? nodesToSearch : [node]);
        if (allGallery.length > 0) {
          const idx = allGallery.indexOf(imageUrl);
          setGalleryImages(allGallery);
          setLightboxIndex(idx >= 0 ? idx : 0);
          return;
        }
      }
      handleClick(e);
    };

    return (
      <>
        <div
          id={`node-dom-${node.id}`}
          onClick={handleImageClick}
          style={{
            ...computedStyle,
            cursor: isPreviewMode && isGalleryImage ? 'pointer' : computedStyle.cursor,
            position: computedStyle.position || 'relative',
          }}
          className={nodeClassName}
        >
          {actionOverlay}
          <img
            src={imageUrl}
            alt="Node Image"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
          />

          {/* Badge Icon on Canvas (Editor Mode only) when showInGallery is enabled */}
          {!isPreviewMode && isGalleryImage && (
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                backgroundColor: 'var(--primary, #e36397)',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              🖼️ Lightbox
            </span>
          )}
        </div>

        {lightboxIndex !== null && (
          <LightboxModal
            images={galleryImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(idx) => setLightboxIndex(idx)}
          />
        )}
      </>
    );
  }

  // Standalone Gallery Widget (node.type === 'gallery')
  if (node.type === 'gallery') {
    const userPhotos =
      eventDetails?.galleryImages ||
      eventDetails?.gallery ||
      eventDetails?.photos ||
      eventDetails?.images ||
      undefined;

    const hasUserPhotos = Array.isArray(userPhotos) && userPhotos.length > 0;

    if (isPreviewMode && !hasUserPhotos) {
      return null;
    }

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          width: '100%',
          position: computedStyle.position || 'relative',
        }}
        className={nodeClassName}
      >
        {actionOverlay}
        <PhotoGalleryGrid
          images={userPhotos}
          isPreviewMode={isPreviewMode}
          title={node.content || undefined}
        />
      </div>
    );
  }

  // Closing Thank You Widget (node.type === 'thank-you' || node.widgetType === 'thank-you')
  if (node.type === 'thank-you' || node.widgetType === 'thank-you') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          width: '100%',
          position: computedStyle.position || 'relative',
        }}
        className={nodeClassName}
      >
        {actionOverlay}
        <ThankYouClosing
          content={contentText}
          eventDetails={eventDetails}
          isPreviewMode={isPreviewMode}
        />
      </div>
    );
  }

  // Slider Widget (Slide Gambar - Auto Rotating Gallery Images)
  if (node.type === 'slider') {
    const storeNodes = useStudioStore.getState().nodes;
    const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
    let gImages = collectGalleryImageUrls(nodesToSearch);

    if (gImages.length === 0) {
      if (node.content) {
        gImages = [node.content, ...DEFAULT_GALLERY_FALLBACKS];
      } else {
        gImages = DEFAULT_GALLERY_FALLBACKS;
      }
    }

    const sliderEffect = style.sliderEffect || 'fade';
    const activeIdx = gImages.length > 0 ? slideIndex % gImages.length : 0;

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          position: computedStyle.position || 'relative',
          overflow: 'hidden',
          minHeight: computedStyle.height && computedStyle.height !== 'auto' ? computedStyle.height : '240px',
        }}
        className={nodeClassName}
      >
        {actionOverlay}

        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
          {gImages.map((imgUrl, idx) => {
            const isActive = idx === activeIdx;

            let transformStyle = 'scale(1)';
            let transitionStyle = 'opacity 1.2s ease-in-out';

            if (sliderEffect === 'kenburns') {
              transformStyle = isActive ? 'scale(1.15)' : 'scale(1)';
              transitionStyle = 'opacity 1.2s ease-in-out, transform 8s ease-in-out';
            } else if (sliderEffect === 'slide') {
              transformStyle = isActive ? 'translateX(0)' : idx < activeIdx ? 'translateX(-100%)' : 'translateX(100%)';
              transitionStyle = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
            }

            return (
              <div
                key={imgUrl + idx}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${imgUrl})`,
                  backgroundSize: style.objectFit === 'contain' ? 'contain' : 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: isActive ? 1 : 0,
                  transform: transformStyle,
                  transition: transitionStyle,
                }}
              />
            );
          })}
        </div>

        {/* Small badge in editor indicating slider */}
        {!isPreviewMode && (
          <span
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 3,
              backdropFilter: 'blur(4px)',
            }}
          >
            🎠 Slide Gambar ({gImages.length} Foto Galeri)
          </span>
        )}
      </div>
    );
  }

  // Countdown
  if (node.type === 'countdown') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', display: 'block' }}>12</span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Hari</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', display: 'block' }}>08</span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Jam</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', display: 'block' }}>45</span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Menit</span>
          </div>
        </div>
      </div>
    );
  }

  // Map Widget (Interactive Google Map Embed + Direct Navigation Button)
  if (node.type === 'map') {
    let rawUrl = (
      eventDetails?.maps_url ||
      eventDetails?.location_maps_url ||
      eventDetails?.map_url ||
      eventDetails?.link_maps ||
      node.buttonUrl ||
      node.content ||
      ''
    ).trim();

    if (rawUrl.startsWith('{') && rawUrl.endsWith('}')) {
      const tagName = rawUrl.slice(1, -1);
      rawUrl = (eventDetails?.[tagName] || eventDetails?.maps_url || eventDetails?.location_maps_url || '').trim();
    }

    const defaultSampleEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2736423974415!2d106.8016462749903!3d-6.227608293760431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f14d34b3f885%3A0xb35a0f2b2319208a!2sGelora%20Bung%20Karno%20Main%20Stadium!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid';

    let embedUrl = defaultSampleEmbed;
    let directUrl = 'https://maps.google.com/?q=Gelora+Bung+Karno+Main+Stadium+Jakarta';

    if (rawUrl) {
      if (rawUrl.includes('google.com/maps/embed')) {
        embedUrl = rawUrl;
        directUrl = rawUrl;
      } else {
        const query = encodeURIComponent(eventDetails?.nama_lokasi || eventDetails?.alamat_lengkap || rawUrl);
        embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        directUrl = rawUrl.startsWith('http') ? rawUrl : `https://maps.google.com/?q=${query}`;
      }
    } else if (eventDetails?.nama_lokasi || eventDetails?.alamat_lengkap) {
      const query = encodeURIComponent(`${eventDetails?.nama_lokasi || ''} ${eventDetails?.alamat_lengkap || ''}`.trim());
      embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      directUrl = `https://maps.google.com/?q=${query}`;
    }

    const mapHeight = typeof style.height === 'number' ? `${style.height}px` : (style.height || '260px');

    const handleOpenDirectMap = (e: React.MouseEvent) => {
      if (isPreviewMode) {
        e.stopPropagation();
        window.open(directUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{
          ...computedStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '8px',
          overflow: 'hidden',
          width: '100%',
        }}
        className={nodeClassName}
      >
        {actionOverlay}

        {/* Interactive Google Map Iframe Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight,
            borderRadius: computedStyle.borderRadius || '14px',
            overflow: 'hidden',
            boxShadow: computedStyle.boxShadow || '0 4px 14px rgba(0,0,0,0.06)',
            border: computedStyle.border || '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <iframe
            title="Google Map Location"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, width: '100%', height: '100%' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Pointer blocker overlay in Studio Edit mode so desainer can drag/select the widget easily */}
          {!isPreviewMode && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                cursor: 'pointer',
                backgroundColor: 'rgba(0,0,0,0.01)',
              }}
            />
          )}
        </div>

        {/* Action Button: Buka di Google Maps */}
        <button
          type="button"
          onClick={handleOpenDirectMap}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 3px 10px rgba(2,132,199,0.25)',
          }}
        >
          🗺️ Buka di Google Maps
        </button>
      </div>
    );
  }

  // Input Field
  if (node.type === 'input') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
        className={nodeClassName}
      >
        {actionOverlay}
        <input
          type="text"
          placeholder={node.placeholder || 'Ketik nama Anda...'}
          name={node.inputName || 'custom_input'}
          style={{
            ...computedStyle,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          readOnly={!isPreviewMode}
        />
      </div>
    );
  }

  // Select Field
  if (node.type === 'select') {
    const rawOptions = node.selectOptions || 'Hadir, Tidak Hadir, Ragu-ragu';
    const optionsList = rawOptions.split(',').map((opt) => opt.trim()).filter(Boolean);

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
        className={nodeClassName}
      >
        {actionOverlay}
        <select
          name={node.inputName || 'custom_select'}
          style={{
            ...computedStyle,
            outline: 'none',
            boxSizing: 'border-box',
            cursor: 'pointer',
          }}
          disabled={!isPreviewMode}
        >
          {optionsList.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Textarea Field
  if (node.type === 'textarea') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ width: computedStyle.width || '100%', position: computedStyle.position || 'relative' }}
        className={nodeClassName}
      >
        {actionOverlay}
        <textarea
          placeholder={node.placeholder || 'Tuliskan ucapan & doa restu...'}
          name={node.inputName || 'custom_textarea'}
          style={{
            ...computedStyle,
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
          readOnly={!isPreviewMode}
        />
      </div>
    );
  }

  // Divider
  if (node.type === 'divider') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />
      </div>
    );
  }

  // Spacer
  if (node.type === 'spacer') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={{ height: style.height ? `${style.height}px` : '30px', ...computedStyle }}
        className={nodeClassName}
      >
        {actionOverlay}
      </div>
    );
  }

  return (
    <div
      id={`node-dom-${node.id}`}
      onClick={handleClick}
      style={computedStyle}
      className={nodeClassName}
    >
      {actionOverlay}
      <span>[{node.type}] {contentText}</span>
    </div>
  );
}
