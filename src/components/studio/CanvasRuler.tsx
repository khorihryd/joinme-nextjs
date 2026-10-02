'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface GuideLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number; // in pixels relative to stage content top/left
}

interface CanvasRulerProps {
  showRulers: boolean;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

export function CanvasRuler({ showRulers, viewportMode, children }: CanvasRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageAreaRef = useRef<HTMLDivElement>(null);
  const hHairlineRef = useRef<HTMLDivElement>(null);
  const vHairlineRef = useRef<HTMLDivElement>(null);
  const coordBadgeXRef = useRef<HTMLSpanElement>(null);
  const coordBadgeYRef = useRef<HTMLSpanElement>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [scrollPos, setScrollPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [maxContentSize, setMaxContentSize] = useState<{ width: number; height: number }>({ width: 2400, height: 6000 });
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [draggingGuideId, setDraggingGuideId] = useState<string | null>(null);

  // Load saved guides from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studio_photoshop_guides');
      if (saved) {
        setGuides(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load ruler guides:', e);
    }
  }, []);

  // Save guides to localStorage
  const saveGuides = (newGuides: GuideLine[]) => {
    setGuides(newGuides);
    try {
      localStorage.setItem('studio_photoshop_guides', JSON.stringify(newGuides));
    } catch (e) {
      console.error('Failed to save ruler guides:', e);
    }
  };

  // Track canvas scroll position and content dimensions
  const updateScrollAndDimensions = () => {
    if (stageAreaRef.current) {
      const el = stageAreaRef.current;
      const sLeft = el.scrollLeft;
      const sTop = el.scrollTop;
      setScrollPos((prev) => (prev.left === sLeft && prev.top === sTop ? prev : { left: sLeft, top: sTop }));

      if (hHairlineRef.current) {
        hHairlineRef.current.style.left = `${mousePosRef.current.x - sLeft}px`;
      }
      if (vHairlineRef.current) {
        vHairlineRef.current.style.top = `${mousePosRef.current.y - sTop}px`;
      }

      const computedHeight = Math.max(el.scrollHeight, 6000);
      const computedWidth = Math.max(el.scrollWidth, 2400);
      setMaxContentSize((prev) =>
        prev.width === computedWidth && prev.height === computedHeight ? prev : { width: computedWidth, height: computedHeight }
      );
    }
  };

  useEffect(() => {
    updateScrollAndDimensions();
    const timer = setTimeout(updateScrollAndDimensions, 300);
    window.addEventListener('resize', updateScrollAndDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollAndDimensions);
    };
  }, [viewportMode, showRulers]);

  // Track mouse position relative to canvas content without re-rendering the whole component
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stageAreaRef.current) return;
    const rect = stageAreaRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left + stageAreaRef.current.scrollLeft);
    const y = Math.round(e.clientY - rect.top + stageAreaRef.current.scrollTop);
    mousePosRef.current = { x, y };

    if (hHairlineRef.current) {
      hHairlineRef.current.style.left = `${x - scrollPos.left}px`;
    }
    if (vHairlineRef.current) {
      vHairlineRef.current.style.top = `${y - scrollPos.top}px`;
    }
    if (coordBadgeXRef.current) {
      coordBadgeXRef.current.textContent = `📏 X: ${x}px`;
    }
    if (coordBadgeYRef.current) {
      coordBadgeYRef.current.textContent = `Y: ${y}px`;
    }

    // Handle guide dragging
    if (draggingGuideId) {
      setGuides((prevGuides) => {
        const targetGuide = prevGuides.find((g) => g.id === draggingGuideId);
        if (!targetGuide) return prevGuides;
        const newPos = targetGuide.type === 'horizontal' ? y : x;
        if (targetGuide.position === newPos) return prevGuides;
        return prevGuides.map((g) => (g.id === draggingGuideId ? { ...g, position: newPos } : g));
      });
    }
  };

  // Drag from Top Ruler to create Horizontal Guide
  const handleTopRulerMouseDown = (e: React.MouseEvent) => {
    if (!stageAreaRef.current) return;
    const rect = stageAreaRef.current.getBoundingClientRect();
    const initialY = Math.round(e.clientY - rect.top + stageAreaRef.current.scrollTop);
    const newGuide: GuideLine = {
      id: `guide-h-${Date.now()}`,
      type: 'horizontal',
      position: Math.max(0, initialY),
    };
    saveGuides([...guides, newGuide]);
    setDraggingGuideId(newGuide.id);
  };

  // Drag from Left Ruler to create Vertical Guide
  const handleLeftRulerMouseDown = (e: React.MouseEvent) => {
    if (!stageAreaRef.current) return;
    const rect = stageAreaRef.current.getBoundingClientRect();
    const initialX = Math.round(e.clientX - rect.left + stageAreaRef.current.scrollLeft);
    const newGuide: GuideLine = {
      id: `guide-v-${Date.now()}`,
      type: 'vertical',
      position: Math.max(0, initialX),
    };
    saveGuides([...guides, newGuide]);
    setDraggingGuideId(newGuide.id);
  };

  const handleMouseUp = () => {
    if (draggingGuideId) {
      setDraggingGuideId(null);
      try {
        localStorage.setItem('studio_photoshop_guides', JSON.stringify(guides));
      } catch (e) {
        console.error('Failed to save ruler guides:', e);
      }
    }
  };

  const handleRemoveGuide = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveGuides(guides.filter((g) => g.id !== id));
  };

  const handleClearAllGuides = () => {
    if (guides.length === 0) return;
    if (confirm('Apakah Anda yakin ingin menghapus semua garis bantu (guides)?')) {
      saveGuides([]);
    }
  };

  // Generate ticks up to maxContentSize
  const horizontalTicks = useMemo(() => {
    const ticks = [];
    const maxW = Math.max(maxContentSize.width, 3000);
    for (let i = 0; i <= maxW; i += 10) {
      const isMajor = i % 100 === 0;
      const isMedium = i % 50 === 0;
      ticks.push(
        <div
          key={`h-tick-${i}`}
          style={{
            position: 'absolute',
            left: `${i}px`,
            bottom: 0,
            width: '1px',
            height: isMajor ? '16px' : isMedium ? '10px' : '5px',
            backgroundColor: isMajor ? 'var(--text-primary, #475569)' : 'var(--border-color, #cbd5e1)',
          }}
        >
          {isMajor && (
            <span
              style={{
                position: 'absolute',
                top: '-14px',
                left: '3px',
                fontSize: '0.62rem',
                color: 'var(--text-secondary, #64748b)',
                userSelect: 'none',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {i}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  }, [maxContentSize.width]);

  const verticalTicks = useMemo(() => {
    const ticks = [];
    const maxH = Math.max(maxContentSize.height, 10000);
    for (let i = 0; i <= maxH; i += 10) {
      const isMajor = i % 100 === 0;
      const isMedium = i % 50 === 0;
      ticks.push(
        <div
          key={`v-tick-${i}`}
          style={{
            position: 'absolute',
            top: `${i}px`,
            right: 0,
            height: '1px',
            width: isMajor ? '16px' : isMedium ? '10px' : '5px',
            backgroundColor: isMajor ? 'var(--text-primary, #475569)' : 'var(--border-color, #cbd5e1)',
          }}
        >
          {isMajor && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: '-24px',
                fontSize: '0.6rem',
                color: 'var(--text-secondary, #64748b)',
                userSelect: 'none',
                fontFamily: 'monospace',
                fontWeight: 600,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              {i}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  }, [maxContentSize.height]);

  if (!showRulers) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: draggingGuideId ? 'none' : 'auto',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Bar with Horizontal Ruler */}
      <div
        style={{
          display: 'flex',
          height: '24px',
          backgroundColor: 'var(--bg-body, #f8fafc)',
          borderBottom: '1px solid var(--border-color, #cbd5e1)',
          zIndex: 100,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Top-Left Corner Junction Box (0,0) */}
        <div
          title="Klik untuk menghapus semua garis bantu"
          onClick={handleClearAllGuides}
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'var(--bg-card, #e2e8f0)',
            borderRight: '1px solid var(--border-color, #cbd5e1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: 800,
            color: 'var(--primary, #e36397)',
            cursor: guides.length > 0 ? 'pointer' : 'default',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          px
        </div>

        {/* Horizontal Ruler Track (synced with scrollLeft) */}
        <div
          title="Drag ke bawah untuk membuat Garis Bantu Horizontal baru"
          onMouseDown={handleTopRulerMouseDown}
          style={{
            flex: 1,
            height: '24px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'row-resize',
            backgroundColor: 'var(--bg-body, #f8fafc)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${-scrollPos.left}px`,
              height: '100%',
              width: `${maxContentSize.width}px`,
            }}
          >
            {horizontalTicks}
          </div>

          {/* Mouse Hairline Tracker (Horizontal) */}
          <div
            ref={hHairlineRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: '#06b6d4',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Main Body Area (Left Ruler + Scrollable Stage Area) */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Vertical Ruler Track (synced with scrollTop) */}
        <div
          title="Drag ke kanan untuk membuat Garis Bantu Vertikal baru"
          onMouseDown={handleLeftRulerMouseDown}
          style={{
            width: '24px',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'col-resize',
            backgroundColor: 'var(--bg-body, #f8fafc)',
            borderRight: '1px solid var(--border-color, #cbd5e1)',
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: `${-scrollPos.top}px`,
              width: '100%',
              height: `${maxContentSize.height}px`,
            }}
          >
            {verticalTicks}
          </div>

          {/* Mouse Hairline Tracker (Vertical) */}
          <div
            ref={vHairlineRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: '#06b6d4',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Scrollable Stage Content Wrapper */}
        <div
          ref={stageAreaRef}
          id="studio-canvas-scroll-area"
          className="studio-canvas-scroll-area"
          onScroll={updateScrollAndDimensions}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '1.5rem',
            paddingBottom: '4rem',
          }}
        >
          {/* Photoshop Guide Lines Overlay Layer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${maxContentSize.width}px`,
              height: `${maxContentSize.height}px`,
              pointerEvents: 'none',
              zIndex: 9990,
            }}
          >
            {guides.map((g) => {
              const isHorizontal = g.type === 'horizontal';
              return (
                <div
                  key={g.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingGuideId(g.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: isHorizontal ? `${g.position}px` : 0,
                    left: isHorizontal ? 0 : `${g.position}px`,
                    width: isHorizontal ? '100%' : '2px',
                    height: isHorizontal ? '2px' : '100%',
                    backgroundColor: '#06b6d4',
                    borderTop: isHorizontal ? '1px dashed #0891b2' : 'none',
                    borderLeft: !isHorizontal ? '1px dashed #0891b2' : 'none',
                    pointerEvents: 'auto',
                    cursor: isHorizontal ? 'row-resize' : 'col-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  {/* Guide Tooltip Badge */}
                  <div
                    style={{
                      backgroundColor: '#0891b2',
                      color: '#ffffff',
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      transform: isHorizontal ? 'translate(10px, -50%)' : 'translate(-50%, 10px)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>
                      {isHorizontal ? 'Y:' : 'X:'} {g.position}px
                    </span>
                    <span
                      title="Hapus Garis Bantu Ini"
                      onClick={(e) => handleRemoveGuide(g.id, e)}
                      style={{ cursor: 'pointer', paddingLeft: '4px', borderLeft: '1px solid rgba(255,255,255,0.4)', marginLeft: '2px' }}
                    >
                      ✕
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Cursor Coordinates Badge */}
          <div
            style={{
              position: 'fixed',
              bottom: '16px',
              left: '280px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#38bdf8',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span ref={coordBadgeXRef}>📏 X: 0px</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span ref={coordBadgeYRef}>Y: 0px</span>
            {guides.length > 0 && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                <span style={{ color: '#f43f5e' }}>Guides: {guides.length}</span>
              </>
            )}
          </div>

          {/* Original Canvas Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
