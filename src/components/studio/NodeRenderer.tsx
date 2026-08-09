import React, { useState, useEffect } from 'react';
import { StudioNode } from '@/types';
import { resolveTextVariables, useStudioStore } from '@/store/studio-store';
import { LightboxModal } from '@/components/studio/LightboxModal';

export function collectGalleryImageUrls(nodes: StudioNode[]): string[] {
  let list: string[] = [];
  if (!Array.isArray(nodes)) return list;
  nodes.forEach((n) => {
    if (n.type === 'image' && n.showInGallery && n.content) {
      list.push(n.content);
    }
    if (n.children && n.children.length > 0) {
      list = list.concat(collectGalleryImageUrls(n.children));
    }
  });
  return list;
}

const DEFAULT_GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80',
];

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

  const style = node.style || {};
  const isSlideshowBg = node.type === 'container' && style.bgType === 'gallery-slideshow';
  const intervalSec = typeof style.bgSlideshowInterval === 'number' ? style.bgSlideshowInterval : (style.bgSlideshowInterval ? parseInt(String(style.bgSlideshowInterval), 10) : 5);

  useEffect(() => {
    if (!isSlideshowBg) return;
    const storeNodes = useStudioStore.getState().nodes;
    const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
    let gImages = collectGalleryImageUrls(nodesToSearch);

    if (gImages.length === 0) {
      if (style.backgroundImage) {
        gImages = [style.backgroundImage, ...DEFAULT_GALLERY_FALLBACKS];
      } else {
        gImages = DEFAULT_GALLERY_FALLBACKS;
      }
    }

    if (gImages.length <= 1) return;

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % gImages.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isSlideshowBg, allNodes, intervalSec, style.backgroundImage]);

  const isSelected = selectedNodeId === node.id;

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
    opacity: style.opacity ? parseFloat(style.opacity) : undefined,
    boxShadow: getResponsiveStyle(style, 'boxShadow', undefined, viewportMode),
    position: (posVal || undefined) as any,
    top: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'top', undefined, viewportMode) : undefined,
    right: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'right', undefined, viewportMode) : undefined,
    bottom: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'bottom', undefined, viewportMode) : undefined,
    left: posVal && posVal !== 'static' ? getResponsiveStyle(style, 'left', undefined, viewportMode) : undefined,
    zIndex: posVal && posVal !== 'static' && style.zIndex ? (parseInt(style.zIndex, 10) || style.zIndex) : undefined,
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

  const nodeClassName = `canvas-node-item ${isSelected ? 'selected' : ''} ${style.hideScrollbar ? 'no-scrollbar' : ''}`;

  if (style.bgType === 'gradient') {
    const c1 = style.gradientColor1 || '#8B5E3C';
    const c2 = style.gradientColor2 || '#C9A66B';
    const dir = getResponsiveStyle(style, 'gradientDirection', 'to right', viewportMode);
    computedStyle.backgroundImage = dir === 'radial' ? `radial-gradient(circle, ${c1}, ${c2})` : `linear-gradient(${dir}, ${c1}, ${c2})`;
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
    };

    if (isSlideshowBg) {
      const storeNodes = useStudioStore.getState().nodes;
      const nodesToSearch = allNodes && allNodes.length > 0 ? allNodes : (storeNodes && storeNodes.length > 0 ? storeNodes : []);
      let gImages = collectGalleryImageUrls(nodesToSearch);
      if (gImages.length === 0) {
        if (style.backgroundImage) {
          gImages = [style.backgroundImage, ...DEFAULT_GALLERY_FALLBACKS];
        } else {
          gImages = DEFAULT_GALLERY_FALLBACKS;
        }
      }

      if (gImages.length > 0) {
        const currentBgUrl = gImages[slideIndex % gImages.length];
        containerStyle.backgroundImage = `url(${currentBgUrl})`;
        containerStyle.backgroundSize = getResponsiveStyle(style, 'backgroundSize', 'cover', viewportMode);
        containerStyle.backgroundPosition = getResponsiveStyle(style, 'backgroundPosition', 'center', viewportMode);
        containerStyle.backgroundRepeat = 'no-repeat';
        if (typeof style.backgroundAttachment === 'string') containerStyle.backgroundAttachment = style.backgroundAttachment as any;
        containerStyle.transition = 'background-image 0.8s ease-in-out, background-color 0.8s ease-in-out';
      }
    }

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={containerStyle}
        className={nodeClassName}
      >
        {actionOverlay}

        {style.backgroundOverlayColor && (
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

    const handleButtonClick = (e: React.MouseEvent) => {
      if (isCoverButton && onOpenCover) {
        onOpenCover();
        return;
      }
      handleClick(e);
    };

    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleButtonClick}
        style={{ cursor: 'pointer', ...computedStyle }}
        className={`canvas-node-item btn btn-primary ${isSelected ? 'selected' : ''} ${style.hideScrollbar ? 'no-scrollbar' : ''}`}
        role="button"
        tabIndex={0}
      >
        {actionOverlay}
        <span>{contentText}</span>
      </div>
    );
  }

  // Image
  if (node.type === 'image') {
    const isGalleryImage = !!node.showInGallery;
    const imageUrl = node.content || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500';

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

  // Map
  if (node.type === 'map') {
    return (
      <div
        id={`node-dom-${node.id}`}
        onClick={handleClick}
        style={computedStyle}
        className={nodeClassName}
      >
        {actionOverlay}
        <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <span>🗺️ Google Map: {node.content || 'Lokasi Venue'}</span>
        </div>
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
