'use client';

import React, { useEffect } from 'react';
import { useStudioStore, getGlobalCssVariables } from '@/store/studio-store';
import { CanvasRuler } from './CanvasRuler';

interface CanvasStageProps {
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  showRulers?: boolean;
  children: React.ReactNode;
}

export function CanvasStage({ viewportMode, showRulers = true, children }: CanvasStageProps) {
  const { globalStyles, selectedNodeId, selectNode, setSidebarTab } = useStudioStore();

  useEffect(() => {
    if (!selectedNodeId || selectedNodeId === 'canvas') return;

    const timer = setTimeout(() => {
      const domEl = document.getElementById(`node-dom-${selectedNodeId}`);
      if (domEl) {
        domEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [selectedNodeId]);

  const handleStageClick = (e: React.MouseEvent) => {
    // If click is directly on stage (not on child node elements)
    const target = e.target as HTMLElement;
    if (target.id === 'studio-canvas-stage' || target.id === 'canvas-viewport-wrapper') {
      selectNode('canvas');
      setSidebarTab('global');
    }
  };

  const isCanvasSelected = selectedNodeId === 'canvas';
  const cssVars = getGlobalCssVariables(globalStyles);

  const stageStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: globalStyles.bgColor || globalStyles.colors?.background || '#eff2ef',
    padding: globalStyles.padding || '24px',
    margin: globalStyles.margin || '0px',
    fontFamily: globalStyles.fontFamily || globalStyles.typography?.fontPrimary || 'Playfair Display',
    backgroundImage: globalStyles.backgroundImage ? `url(${globalStyles.backgroundImage})` : 'none',
    backgroundPosition: globalStyles.backgroundPosition || 'center',
    backgroundSize: globalStyles.backgroundSize || 'cover',
    backgroundRepeat: globalStyles.backgroundRepeat || 'no-repeat',
    outline: isCanvasSelected ? '2px dashed var(--primary)' : 'none',
    outlineOffset: '-2px',
    transition: 'all 0.25s ease',
    minHeight: '100%',
    boxSizing: 'border-box',
    transform: 'translate(0, 0)',
    position: 'relative',
  };

  return (
    <CanvasRuler showRulers={showRulers} viewportMode={viewportMode}>
      <main
        className="studio-stage"
        style={{ flex: 1 }}
        onClick={handleStageClick}
      >
        <div className={`canvas-viewport-wrapper ${viewportMode}`} id="canvas-viewport-wrapper">
          <div
            className="studio-canvas-frame"
            id="studio-canvas-stage"
            style={stageStyle}
          >
            {children}
          </div>
        </div>
      </main>
    </CanvasRuler>
  );
}
